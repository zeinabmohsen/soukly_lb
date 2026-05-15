require("dotenv").config();
const sequelize = require("../config/database");
const { GlobalCategory, User, Store, StoreCategory, Product } = require("../api/v1/models");
const { seedGlobalCategories } = require("./globalCategories");
const { seedSampleData } = require("./sampleData");
const { applySubscriptionColumns, applySellerDraftColumn, applyAddressesTable } = require("./migrations");

async function runSeeds() {
  await sequelize.authenticate();
  console.log("[seed] DB connected");

  // Schema is managed by the running app — only ensure global_categories exists
  await GlobalCategory.sync({ alter: true });

  // Add subscription columns + ENUM via raw SQL (idempotent). Sequelize's
  // sync({alter:true}) is unreliable for ENUM types — it can throw or skip the add.
  await applySubscriptionColumns(sequelize);
  await applySellerDraftColumn(sequelize);
  await applyAddressesTable(sequelize);

  await seedGlobalCategories(GlobalCategory);
  await seedSampleData({ User, Store, StoreCategory, Product, GlobalCategory });

  console.log("[seed] done");
  await sequelize.close();
}

runSeeds().catch((err) => {
  console.error("[seed] failed:", err.message);
  process.exit(1);
});
