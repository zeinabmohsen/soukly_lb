const { Sequelize } = require("sequelize");
const {
  neonDatabaseUrl,
  databaseUrl,
  postgresUrl,
  dbLogging,
} = require("./index");

let connectionString = neonDatabaseUrl;

if (!connectionString) {
  throw new Error(
    "Missing Neon connection string. Set NEON_DATABASE_URL (preferred), DATABASE_URL, or POSTGRES_URL."
  );
}

// pg ≥ 8.16 deprecates the implicit SSL default. Future versions will switch
// to verify-full and refuse Neon's self-signed chain. Pin to libpq-compatible
// `require` mode so the driver keeps encrypting without validating the CA —
// matches our `rejectUnauthorized: false` below. Skip if seller already set
// sslmode in the URL.
if (!/[?&]sslmode=/.test(connectionString)) {
  const sep = connectionString.includes("?") ? "&" : "?";
  connectionString += `${sep}uselibpqcompat=true&sslmode=require`;
}

const logging = dbLogging
  ? (sql, timing) => {
      if (typeof timing === "number") {
        console.log(`[db] ${timing}ms ${sql}`);
      } else {
        console.log(`[db] ${sql}`);
      }
    }
  : false;

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging,
  benchmark: dbLogging,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 5000,
    evict: 5000,
  },

  // Neon's serverless compute autosuspends on inactivity. The first connection
  // after a cold start can drop with "Connection terminated unexpectedly" while
  // the compute is still spinning up. Retry transient connection errors so a
  // sleeping DB doesn't crash the whole process.
  retry: {
    match: [
      /ConnectionError/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /Connection terminated unexpectedly/,
      /ECONNRESET/,
      /ETIMEDOUT/,
    ],
    max: 5,
    backoffBase: 1000,
    backoffExponent: 1.5,
  },
});

module.exports = sequelize;