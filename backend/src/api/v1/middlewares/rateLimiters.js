const rateLimit = require("express-rate-limit");

// Tight limit for credential endpoints — protects against brute force and
// credential stuffing. Counts both successful and failed requests; we err on
// the strict side because legitimate users only hit these a handful of times.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

// Looser limit for refresh — clients may legitimately retry around access
// token expiry, especially across multiple tabs. Still bounded to deter abuse.
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many refresh attempts." },
});

module.exports = { authLimiter, refreshLimiter };
