// Idempotent raw-SQL migrations. We can't rely on Sequelize's `sync({ alter: true })`
// for ENUM types or new columns — it sometimes throws "type already exists" or
// fails to add the column entirely. These statements use the standard
// PostgreSQL "IF NOT EXISTS" guards so they're safe to run on any state of the DB.

async function applySubscriptionColumns(sequelize) {
  const { QueryTypes } = require("sequelize");

  // 1. Create the ENUM type if missing
  await sequelize.query(
    `DO $$
     BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_stores_subscription_status') THEN
         CREATE TYPE "enum_stores_subscription_status" AS ENUM (
           'inactive', 'trialing', 'active', 'lapsed', 'cancelled'
         );
       END IF;
     END
     $$;`,
    { type: QueryTypes.RAW },
  );

  // 2. Add columns if missing (one statement each so a single failure doesn't block the rest)
  const columns = [
    `ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "subscription_status" "enum_stores_subscription_status" NOT NULL DEFAULT 'inactive'`,
    `ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "plan_id" VARCHAR(255) DEFAULT 'starter'`,
    `ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "trial_ends_at" TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "next_billing_at" TIMESTAMP WITH TIME ZONE`,
    `ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "is_founding_seller" BOOLEAN NOT NULL DEFAULT false`,
  ];

  for (const stmt of columns) {
    await sequelize.query(stmt, { type: QueryTypes.RAW });
  }

  console.log("[migrate] subscription columns ensured");
}

async function applySellerDraftColumn(sequelize) {
  const { QueryTypes } = require("sequelize");

  await sequelize.query(
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "seller_draft" JSONB DEFAULT NULL`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] users.seller_draft ensured");
}

async function applyAddressesTable(sequelize) {
  const { QueryTypes } = require("sequelize");

  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS "addresses" (
       "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
       "label" VARCHAR(255),
       "recipient_name" VARCHAR(255) NOT NULL,
       "phone" VARCHAR(255) NOT NULL,
       "address_line" VARCHAR(255) NOT NULL,
       "city" VARCHAR(255),
       "country" VARCHAR(255) DEFAULT 'Lebanon',
       "is_default" BOOLEAN NOT NULL DEFAULT false,
       "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
     )`,
    { type: QueryTypes.RAW },
  );

  await sequelize.query(
    `CREATE INDEX IF NOT EXISTS "addresses_user_id_idx" ON "addresses"("user_id")`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] addresses table ensured");
}

module.exports = { applySubscriptionColumns, applySellerDraftColumn, applyAddressesTable };
