// Allowed origins for browser fetches. Set CORS_ORIGINS in env (comma-separated)
// to add custom domains in prod without code changes.
const staticOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://soukly-lb.vercel.app",
];

const envOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [...staticOrigins, ...envOrigins];

// Vercel assigns preview URLs like soukly-lb-git-<branch>-<team>.vercel.app and
// soukly-lb-<hash>-<team>.vercel.app — allow any subdomain of vercel.app for
// this project so preview deploys work without an env-var edit per branch.
const vercelPreviewPattern = /^https:\/\/soukly-lb(-[a-z0-9-]+)*\.vercel\.app$/i;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(
      new Error("CORS policy does not allow access from this origin."),
      false
    );
  },
  credentials: true,
};

module.exports = corsOptions;
