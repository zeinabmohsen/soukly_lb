const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      return callback(
        new Error("CORS policy does not allow access from this origin."),
        false
      );
    }
    return callback(null, true);
  },
  credentials: true,
};

module.exports = corsOptions;
