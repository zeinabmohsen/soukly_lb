// Origin-based CSRF defence.
//
// Why: CORS only stops the browser from *reading* a cross-origin response — it
// doesn't stop the cross-origin POST from hitting the server, and the side
// effects (e.g. setting a refresh cookie, mutating data) still happen. To
// actually block CSRF we have to reject the request itself.
//
// How: on every state-changing method (POST/PUT/PATCH/DELETE), if the request
// carries an Origin header (i.e. a browser made it), require that origin to
// be in the same allowlist CORS uses. Requests with no Origin (curl, server-
// to-server, mobile apps) are passed through — CSRF is a browser-only attack
// and they're not exploitable.
//
// This adds zero token machinery, no client changes, and no UX cost.

const STATIC_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://soukly-lb.vercel.app",
]);

const ENV_ORIGINS = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = new Set([...STATIC_ORIGINS, ...ENV_ORIGINS]);

const VERCEL_PREVIEW = /^https:\/\/soukly-lb(-[a-z0-9-]+)*\.vercel\.app$/i;

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (VERCEL_PREVIEW.test(origin)) return true;
  return false;
}

function csrfOrigin(req, res, next) {
  if (!UNSAFE_METHODS.has(req.method)) return next();

  // Use Origin first (always set on cross-origin browser requests, and on
  // same-origin POSTs). Fall back to Referer for older browsers / edge cases.
  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);

  // No origin header → not a browser → CSRF doesn't apply → allow.
  if (!origin) return next();

  if (isAllowedOrigin(origin)) return next();

  return res.status(403).json({
    message: "Origin not allowed",
    code: "ORIGIN_REJECTED",
  });
}

module.exports = csrfOrigin;
