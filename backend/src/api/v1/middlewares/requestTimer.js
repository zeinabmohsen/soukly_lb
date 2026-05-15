const { performance } = require("perf_hooks");

// Logs per-request duration and status for quick latency profiling.
const requestTimer = (req, res, next) => {
  const start = performance.now();

  res.on("finish", () => {
    const durationMs = performance.now() - start;
    const status = res.statusCode;
    const route = req.originalUrl;
    const method = req.method;

    console.log(
      `[req] ${method} ${route} ${status} ${durationMs.toFixed(1)}ms`
    );
  });

  next();
};

module.exports = requestTimer;
