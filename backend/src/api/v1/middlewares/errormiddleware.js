const { nodeEnv } = require("../../../config");

const isProd = nodeEnv === "production";

const globalError = (err, req, res, next) => {
  if (err?.name === "SequelizeUniqueConstraintError") {
    err.statusCode = 409;
    err.status = "fail";
    err.message = err.message || "Resource already exists";
  }

  const statusCode =
    err.statusCode ||
    (typeof err.status === "number" ? err.status : undefined) ||
    500;
  err.statusCode = statusCode;
  err.status = err.status || (statusCode >= 500 ? "error" : "fail");

  if (res.headersSent) {
    return next(err);
  }

  // Log server errors so ops can investigate, but don't ship internals to clients in prod
  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  }

  const body = {
    status: err.status,
    message: err.message || "Internal Server Error",
  };

  // Forward structured error fields so the client can act on them (e.g. show
  // per-item stock conflicts, re-display validation errors). Only fields we
  // explicitly attach in services — never the raw err object in production.
  if (err.code) body.code = err.code;
  if (Array.isArray(err.items)) body.items = err.items;
  if (Array.isArray(err.errors)) body.errors = err.errors;

  if (!isProd) {
    body.err = err;
    body.stack = err.stack;
  }

  res.status(err.statusCode).json(body);
};

module.exports = globalError;
