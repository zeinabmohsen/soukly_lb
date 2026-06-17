const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Op } = require("sequelize");
const asyncHandler = require("../../../utils/asyncHandler");
const { User, Session, PasswordReset } = require("../models");
const { createUser: createUserService } = require("../services/userService");
const { jwtSecret } = require("../../../config");
const { sendEmail } = require("../../../utils/email");

// Long-lived access token, beachbeds-style: the user stays logged in for a long
// stretch without needing a silent refresh on every visit. The rotating refresh
// cookie (below) is kept as a safety net to renew/rotate the session. Shorten
// this back to "15m" if you ever want to return to short-lived access tokens.
const ACCESS_EXPIRES_IN = "30d";
const REFRESH_DAYS = 365;
// How long the just-rotated-away refresh token stays acceptable. Covers the
// brief window where a second browser tab (or a retried request) fires a
// refresh with the token that another concurrent refresh already rotated. Long
// enough to absorb a slow round-trip, short enough that a genuinely stolen old
// token is still rejected as reuse.
const REFRESH_GRACE_MS = 60 * 1000;
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
      // Bumps whenever the user changes their password — middleware rejects
      // any token whose pwd_v doesn't match the user's current value.
      pwd_v: user.password_version ?? 1,
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
  await session.update({
    // Remember the hash we're rotating away from so a concurrent refresh that
    // still carries it (another tab) is honoured for REFRESH_GRACE_MS rather
    // than tripping reuse-detection.
    prev_refresh_token_hash: session.refresh_token_hash,
    prev_rotated_at: new Date(),
    refresh_token_hash: refreshTokenHash,
    expires_at: expiresAt,
  });
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
  // Cookie-only — the refresh token is httpOnly for a reason. Accepting it
  // from the body would defeat that protection (any XSS could read & re-use
  // it). Browsers send the cookie automatically on /auth/refresh + /auth/logout
  // because both are same-origin and live under the cookie's path scope.
  return req.cookies?.[REFRESH_COOKIE_NAME] || null;
}

// Collapse the boolean flags into a single role string, mirroring beachbeds'
// `user.role` surface (where roles were user / beach / beach_officer / admin).
// Soukly's equivalents: admin > approved seller > plain user.
function deriveRole(user) {
  if (user.is_admin) return "admin";
  if (user.is_seller && user.seller_status === "approved") return "seller";
  return "user";
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar_url: user.avatar_url,
    role: deriveRole(user),
    is_seller: user.is_seller,
    seller_status: user.seller_status,
    is_admin: user.is_admin,
    is_verified: user.is_verified,
  };
}

// beachbeds-style response envelope: every payload is wrapped as
// { success, data, message } so the client always reads result.data.
function sendResponse(res, data, message = "", code = 200) {
  return res.status(code).json({ success: true, data, message });
}

function sendError(res, message, code = 400) {
  return res.status(code).json({ success: false, message });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return sendError(res, "name, email, and password are required", 400);
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return sendError(res, "Email already in use", 409);
  }

  const user = await createUserService({ name, email, password, phone });
  const accessToken = signAccessToken(user);
  const session = await createSession(user.id);
  setRefreshCookie(req, res, session.refreshToken, session.expiresAt);

  return sendResponse(res, { token: accessToken, user: formatUser(user) }, "Account created", 201);
});

const login = asyncHandler(async (req, res) => {
  // Login by email OR phone, mirroring beachbeds' logIn(): whichever identifier
  // the client supplies is used to look the account up.
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return sendError(res, "email or phone, and password are required", 400);
  }

  const user = await User.findOne({ where: email ? { email } : { phone } });
  if (!user) {
    return sendError(res, "Invalid credentials", 401);
  }

  const isMatch = await user.validatePassword(password);
  if (!isMatch) {
    return sendError(res, "Invalid credentials", 401);
  }

  const accessToken = signAccessToken(user);
  const session = await createSession(user.id);
  setRefreshCookie(req, res, session.refreshToken, session.expiresAt);

  return sendResponse(res, { token: accessToken, user: formatUser(user) }, "Logged in");
});

const refreshToken = asyncHandler(async (req, res) => {
  const parsed = parseRefreshToken(getRefreshTokenFromRequest(req));
  if (!parsed) {
    return sendError(res, "Invalid refresh token", 400);
  }

  const session = await Session.findByPk(parsed.sessionId);
  if (!session) {
    return sendError(res, "Invalid refresh token", 401);
  }

  if (new Date(session.expires_at) < new Date()) {
    await session.destroy();
    return sendError(res, "Refresh token expired", 401);
  }

  const matches = await bcrypt.compare(parsed.rawToken, session.refresh_token_hash);
  if (!matches) {
    // Concurrency tolerance: if this is the token we *just* rotated away from
    // and we're still inside the grace window, it's almost certainly a second
    // tab refreshing in parallel — not an attacker replaying a stolen token.
    // Accept it and rotate again. Outside the window (or a different token),
    // treat it as reuse and nuke every session for the user.
    const withinGrace =
      session.prev_refresh_token_hash &&
      session.prev_rotated_at &&
      Date.now() - new Date(session.prev_rotated_at).getTime() < REFRESH_GRACE_MS;
    const prevMatches = withinGrace
      ? await bcrypt.compare(parsed.rawToken, session.prev_refresh_token_hash)
      : false;
    if (!prevMatches) {
      await Session.destroy({ where: { user_id: session.user_id } });
      clearRefreshCookie(req, res);
      return sendError(res, "Invalid refresh token", 401);
    }
  }

  const user = await User.findByPk(session.user_id);
  if (!user) {
    await session.destroy();
    return sendError(res, "User not found", 401);
  }

  const accessToken = signAccessToken(user);
  const rawRotated = crypto.randomBytes(32).toString("hex");
  const rotated = await rotateSession(session, rawRotated);
  setRefreshCookie(req, res, rotated.refreshToken, rotated.expiresAt);

  return sendResponse(res, { token: accessToken, user: formatUser(user) }, "Token refreshed");
});

const logout = asyncHandler(async (req, res) => {
  const parsed = parseRefreshToken(getRefreshTokenFromRequest(req));
  if (parsed) {
    const session = await Session.findByPk(parsed.sessionId);
    if (session) await session.destroy();
  }
  clearRefreshCookie(req, res);
  return sendResponse(res, null, "Logged out");
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return sendError(res, "User not found", 404);
  }
  return sendResponse(res, { user: formatUser(user) }, "OK");
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
    return sendError(res, "email is required", 400);
  }

  // Always respond 200 — never reveal whether the email exists.
  const respond = () =>
    sendResponse(res, null, "If an account exists for that email, a reset link has been sent.");

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
    return sendError(res, "Invalid or malformed reset token", 400);
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return sendError(res, "Password must be at least 6 characters", 400);
  }

  const row = await PasswordReset.findByPk(parsed.id);
  // Same generic error for any failure so attackers can't probe which step failed
  const reject = () => sendError(res, "This reset link is invalid or has expired", 400);
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

  return sendResponse(res, null, "Password updated. Please sign in with your new password.");
});

module.exports = { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword };
