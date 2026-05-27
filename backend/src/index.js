const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const sequelize = require("./config/database");
const globalError = require("./api/v1/middlewares/errormiddleware");
const corsOptions = require("./config/corsOptions");
const { port, nodeEnv } = require("./config");
const configurePassport = require("./config/passports");
const requestTimer = require("./api/v1/middlewares/requestTimer");
const csrfOrigin = require("./api/v1/middlewares/csrfOrigin");
const apiRouter = require("./api");

const app = express();

// Trust the first hop so express-rate-limit's req.ip works behind a reverse
// proxy (nginx, Cloudflare). Safe in dev; tighten if you add multiple hops.
app.set("trust proxy", 1);

app.use(
  helmet({
    // CSP off by default — the frontend serves itself; helmet's strict CSP
    // breaks Next.js dev tooling. Re-enable with a project-specific policy
    // when we're closer to production.
    contentSecurityPolicy: false,
    // Allow images served by us to be embedded by the frontend on a different origin
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors(corsOptions));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(nodeEnv === "production" ? "combined" : "dev"));
app.use(requestTimer);
app.use(csrfOrigin);

configurePassport(passport);
app.use(passport.initialize());

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/api", apiRouter);

if (nodeEnv === "production") {
  const frontendDistPath =
    process.env.FRONTEND_DIST_PATH ||
    path.join(__dirname, "..", "frontend", "dist");
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/public/")) {
        return next();
      }
      res.sendFile(path.join(frontendDistPath, "index.html"));
    });
  }
} else {
  app.get("/", (req, res) => res.json({ message: "API running" }));
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(globalError);

//  Better Startup Pattern
// Neon autosuspends compute after inactivity. The first authenticate() after a
// cold start can drop with "Connection terminated unexpectedly" before the DB
// is ready. Retry a few times with backoff before giving up.
async function startServer() {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await sequelize.authenticate();
      console.log("Database connected");
      app.listen(port, () => {
        console.log(`Server running on port ${port} [${nodeEnv}]`);
      });
      return;
    } catch (err) {
      const last = attempt === MAX_ATTEMPTS;
      console.error(`DB connection attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err.message}`);
      if (last) {
        console.error("Startup error: gave up after", MAX_ATTEMPTS, "attempts.");
        process.exit(1);
      }
      // Linear backoff: 1.5s, 3s, 4.5s, 6s — gives Neon time to wake.
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
}

startServer();

process.on("SIGINT", async () => {
  console.log("Closing database connection...");
  await sequelize.close();
  process.exit(0);
});
