// READ-ONLY: list a store (by name fragment) and its products with key fields.
// Usage: node scripts/list-store-products.js "wardati"
require("dotenv").config();
const { Op } = require("sequelize");
const sequelize = require("../src/config/database");
const { Store, Product, User } = require("../src/api/v1/models");

(async () => {
  const term = process.argv[2] || "wardati";
  const stores = await Store.findAll({
    where: { name: { [Op.iLike]: `%${term}%` } },
  });
  if (!stores.length) { console.log(`No store matching "${term}".`); await sequelize.close(); return; }

  for (const s of stores) {
    const owner = await User.findByPk(s.owner_id);
    console.log("==================================================");
    console.log("store id:   ", s.id);
    console.log("name:       ", s.name);
    console.log("slug:       ", s.slug);
    console.log("owner:      ", owner ? `${owner.name} <${owner.email}>` : s.owner_id);
    console.log("location:   ", s.location);
    const products = await Product.findAll({ where: { store_id: s.id }, order: [["created_at", "ASC"]] });
    console.log(`products:    ${products.length}`);
    for (const p of products) {
      console.log("  ----------------------------------------------");
      console.log("  id:        ", p.id);
      console.log("  name:      ", p.name);
      console.log("  price:     ", p.price, p.compare_at_price ? `(was ${p.compare_at_price})` : "");
      console.log("  stock:     ", p.stock, "| status:", p.status, "| featured:", p.is_featured);
      console.log("  desc:      ", p.description ? p.description.slice(0, 80) : "(none)");
      console.log("  images:    ", Array.isArray(p.images) ? p.images.length : 0,
        Array.isArray(p.images) && p.images[0] ? `first=${(p.images[0].url || "").slice(0, 60)}` : "");
      console.log("  features:  ", JSON.stringify(p.features));
      console.log("  colors:    ", JSON.stringify(p.colors));
    }
  }
  console.log("==================================================");
  console.log("Read-only. Nothing changed.");
  await sequelize.close();
})().catch(async (e) => {
  console.error("ERROR:", e.message);
  try { await sequelize.close(); } catch {}
  process.exit(1);
});
