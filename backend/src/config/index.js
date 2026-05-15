require("dotenv").config();


const {
  PORT = 5000,
  CLIENT_URL = "http://localhost:3000",
  NEON_DATABASE_URL,
  DATABASE_URL,
  POSTGRES_URL,
  DB_LOGGING = "false",
  JWT_SECRET,
  NODE_ENV,
  USER_PAGE_LIMIT = "25",
  USER_PAGE_MAX_LIMIT = "100",
} = process.env;

module.exports = {
  port: Number(PORT),
  clientUrl: CLIENT_URL,
  neonDatabaseUrl: NEON_DATABASE_URL,
  databaseUrl: DATABASE_URL,
  postgresUrl: POSTGRES_URL,
  dbLogging: DB_LOGGING === "true",
  jwtSecret: JWT_SECRET,
  nodeEnv: NODE_ENV,
  paginationLimit: Number(USER_PAGE_LIMIT),
  paginationMaxLimit: Number(USER_PAGE_MAX_LIMIT),
};
