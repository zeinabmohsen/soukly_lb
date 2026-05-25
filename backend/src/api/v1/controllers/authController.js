const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Op } = require("sequelize");
const asyncHandler = require("../../../utils/asyncHandler");
const { User, Session, PasswordReset } = require("../models");
const { createUser: createUserService } = require("../services/userService");
const { jwtSecret } = require("../../../config");
const { sendEmail } = require("../../../utils/email");

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_DAYS = 365;
const REFRESH_COOKIE_NAME = "soukly_refresh_token";
const PASSWORD_RESET_TTL_MIN = 60;

function isSecureRequest(req) {
  if (req.secure) return true;
  const proto = req.headers["x-forwarded-proto"];
  if (typeof proto === "string" && proto.split(",")[0].trim() === "https") return true;
  return false;
}

function setRefreshCookie(req, res, refreshToken, expiresAt) {
  const crossSite = isSecureRequest(req);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
    expires: expiresAt,
    path: "/api/v1/auth",
  });
}

function clearRefreshCookie(req, res) {
  const crossSite = isSecureRequest(req);
  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: "/api/v1/auth",
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
  });
}

function signAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      is_seller: user.is_seller,
      seller_status: user.seller_status,
      is_admin: user.is_admin,
    },
    jwtSecret,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function buildRefreshTokenString(sessionId, rawToken) {
  return `${sessionId}:${rawToken}`;
}

async function createSession(userId) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const refreshTokenHash = await bcrypt.hash(rawToken, 10);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  const session = await Session.create({
    user_id: userId,
    refresh_token_hash: refreshTokenHash,
    expires_at: expiresAt,
  });

  return {
    sessionId: session.id,
    refreshToken: buildRefreshTokenString(session.id, rawToken),
    expiresAt,
  };
}

async function rotateSession(session, rawToken) {
  const refreshTokenHash = await bcrypt.hash(rawToken, 10);
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  await session.update({ refresh_token_hash: refreshTokenHash, expires_at: expiresAt });
  return { refreshToken: buildRefreshTokenString(session.id, rawToken), expiresAt };
}

function parseRefreshToken(refreshToken) {
  if (!refreshToken || typeof refreshToken !== "string" || !refreshToken.includes(":")) {
    return null;
  }
  const colonIndex = refreshToken.indexOf(":");
  const sessionId = refreshToken.slice(0, colonIndex);
  const rawToken = refreshToken.slice(colonIndex + 1);
  if (!sessionId || !rawToken) return null;
  return { sessionId, rawToken };
}

function getRefreshTokenFromRequest(req) {
  return req.body?.refresh_token || req.cookies?.[REFRESH_COOKIE_NAME] || null;
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar_url: user.avatar_url,
    is_seller: user.is_seller,
    seller_status: user.seller_status,
    is_admin: user.is_admin,
    is_verified: user.is_verified,
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password are required" });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const user = await createUserService({ name, email, password, phone });
  const accessToken = signAccessToken(user);
  const session = await createSession(user.id);
  setRefreshCookie(req, res, session.refreshToken, session.expiresAt);

  res.status(201).json({
    user: formatUser(user),
    access_token: accessToken,
    access_expires_in: ACCESS_EXPIRES_IN,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.validatePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = signAccessToken(user);
  const session = await createSession(user.id);
  setRefreshCookie(req, res, session.refreshToken, session.expiresAt);

  res.status(200).json({
    user: formatUser(user),
    access_token: accessToken,
    access_expires_in: ACCESS_EXPIRES_IN,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const parsed = parseRefreshToken(getRefreshTokenFromRequest(req));
  if (!parsed) {
    return res.status(400).json({ message: "Invalid refresh token" });
  }

  const session = await Session.findByPk(parsed.sessionId);
  if (!session) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  if (new Date(session.expires_at) < new Date()) {
    await session.destroy();
    return res.status(401).json({ message: "Refresh token expired" });
  }

  const matches = await bcrypt.compare(parsed.rawToken, session.refresh_token_hash);
  if (!matches) {
    await Session.destroy({ where: { user_id: session.user_id } });
    clearRefreshCookie(req, res);
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await User.findByPk(session.user_id);
  if (!user) {
    await session.destroy();
    return res.status(401).json({ message: "User not found" });
  }

  const accessToken = signAccessToken(user);
  const rawRotated = crypto.randomBytes(32).toString("hex");
  const rotated = await rotateSession(session, rawRotated);
  setRefreshCookie(res, rotated.refreshToken, rotated.expiresAt);

  res.status(200).json({
    user: formatUser(user),
    access_token: accessToken,
    access_expires_in: ACCESS_EXPIRES_IN,
  });
});

const logout = asyncHandler(async (req, res) => {
  const parsed = parseRefreshToken(getRefreshTokenFromRequest(req));
  if (parsed) {
    const session = await Session.findByPk(parsed.sessionId);
    if (session) await session.destroy();
  }
  clearRefreshCookie(req, res);
  res.status(200).json({ message: "Logged out" });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ user: formatUser(user) });
});

// ── Password reset ───────────────────────────────────────────────────────────
//
// Two-step flow: POST /auth/forgot-password creates a single-use token, hashes
// it in the DB, and emails the bearer the reset URL. POST /auth/reset-password
// consumes that token, rotates the password, and destroys all sessions so any
// device that knew the old credentials is forced to re-auth.
//
// Security notes:
//   - We always return 200 from /forgot-password regardless of whether the
//     email matched a user, to avoid leaking account existence (enumeration).
//   - The token sent to the user is `<row_id>:<rawToken>` — we never store the
//     raw token, only its bcrypt hash, so a DB leak can't be replayed.
//   - On successful reset, ALL of the user's sessions are destroyed (Session
//     rows deleted). This logs them out everywhere — intended behaviour after
//     a credential rotation.

function buildResetUrl(req, token) {
  const base = process.env.CLIENT_URL || "http://localhost:3000";
  const url = new URL("/reset-password", base);
  url.searchParams.set("token", token);
  return url.toString();
}

const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  // Always respond 200 — never reveal whether the email exists.
  const respond = () => res.status(200).json({
    message: "If an account exists for that email, a reset link has been sent.",
  });

  const user = await User.findOne({ where: { email } });
  if (!user) return respond();

  // Invalidate any previously issued (still-unused, still-valid) reset rows
  // for this user. Stops a forgotten old link from being reused after the
  // owner requests a fresh one.
  await PasswordReset.destroy({
    where: { user_id: user.id, used_at: null, expires_at: { [Op.gt]: new Date() } },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const token_hash = await bcrypt.hash(rawToken, 10);
  const expires_at = new Date(Date.now() + PASSWORD_RESET_TTL_MIN * 60 * 1000);
  const row = await PasswordReset.create({ user_id: user.id, token_hash, expires_at });

  const compositeToken = `${row.id}:${rawToken}`;
  const resetUrl = buildResetUrl(req, compositeToken);

  await sendEmail({
    to: user.email,
    subject: "Reset your Soukly password",
    text:
      `Hi ${user.name || "there"},\n\n` +
      `You (or someone) asked to reset the password for your Soukly account.\n` +
      `Open the link below within the next ${PASSWORD_RESET_TTL_MIN} minutes:\n\n` +
      `${resetUrl}\n\n` +
      `If you didn't request this, you can safely ignore this email.\n\n` +
      `— Soukly`,
    html:
      `<p>Hi ${user.name || "there"},</p>` +
      `<p>You (or someone) asked to reset the password for your Soukly account.</p>` +
      `<p><a href="${resetUrl}">Click here to choose a new password</a> (link expires in ${PASSWORD_RESET_TTL_MIN} minutes).</p>` +
      `<p>If you didn't request this, you can safely ignore this email.</p>` +
      `<p>— Soukly</p>`,
  });

  return respond();
});

function parseResetToken(input) {
  if (typeof input !== "string" || !input.includes(":")) return null;
  const colon = input.indexOf(":");
  const id = input.slice(0, colon);
  const rawToken = input.slice(colon + 1);
  if (!id || !rawToken) return null;
  return { id, rawToken };
}

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body || {};
  const parsed = parseResetToken(token);
  if (!parsed) {
    return res.status(400).json({ message: "Invalid or malformed reset token" });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const row = await PasswordReset.findByPk(parsed.id);
  // Same generic error for any failure so attackers can't probe which step failed
  const reject = () => res.status(400).json({ message: "This reset link is invalid or has expired" });
  if (!row || row.used_at || new Date(row.expires_at) < new Date()) return reject();

  const matches = await bcrypt.compare(parsed.rawToken, row.token_hash);
  if (!matches) return reject();

  const user = await User.findByPk(row.user_id);
  if (!user) return reject();

  user.password = password; // beforeUpdate hook re-hashes
  await user.save();

  await row.update({ used_at: new Date() });

  // Force logout everywhere — every existing session is now stale credentials.
  await Session.destroy({ where: { user_id: user.id } });

  res.status(200).json({ message: "Password updated. Please sign in with your new password." });
});

module.exports = { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword };
