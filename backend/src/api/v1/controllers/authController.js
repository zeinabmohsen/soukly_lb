const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("../../../utils/asyncHandler");
const { User, Session } = require("../models");
const { createUser: createUserService } = require("../services/userService");
const { jwtSecret } = require("../../../config");

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_DAYS = 365;
const REFRESH_COOKIE_NAME = "soukly_refresh_token";

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

module.exports = { register, login, refreshToken, logout, getMe };
