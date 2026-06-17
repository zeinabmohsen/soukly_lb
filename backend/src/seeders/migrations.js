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

async function applyProductColorsColumn(sequelize) {
  const { QueryTypes } = require("sequelize");

  await sequelize.query(
    `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "colors" JSONB NOT NULL DEFAULT '[]'::jsonb`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] products.colors ensured");
}

async function applyProductCustomizationsColumn(sequelize) {
  const { QueryTypes } = require("sequelize");

  await sequelize.query(
    `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "customizations" JSONB NOT NULL DEFAULT '[]'::jsonb`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] products.customizations ensured");
}

async function applyUserPasswordVersionColumn(sequelize) {
  const { QueryTypes } = require("sequelize");

  await sequelize.query(
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_version" INTEGER NOT NULL DEFAULT 1`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] users.password_version ensured");
}

async function applyStoreSocialColumns(sequelize) {
  const { QueryTypes } = require("sequelize");

  await sequelize.query(
    `ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "youtube" VARCHAR(255)`,
    { type: QueryTypes.RAW },
  );
  await sequelize.query(
    `ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "twitter" VARCHAR(255)`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] stores.youtube + stores.twitter ensured");
}

async function applyPasswordResetsTable(sequelize) {
  const { QueryTypes } = require("sequelize");

  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS "password_resets" (
       "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
       "token_hash" VARCHAR(255) NOT NULL,
       "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
       "used_at" TIMESTAMP WITH TIME ZONE,
       "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
     )`,
    { type: QueryTypes.RAW },
  );

  await sequelize.query(
    `CREATE INDEX IF NOT EXISTS "password_resets_user_id_idx" ON "password_resets"("user_id")`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] password_resets table ensured");
}

async function applyEmailVerificationsTable(sequelize) {
  const { QueryTypes } = require("sequelize");

  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS "email_verifications" (
       "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
       "token_hash" VARCHAR(255) NOT NULL,
       "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
       "used_at" TIMESTAMP WITH TIME ZONE,
       "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
     )`,
    { type: QueryTypes.RAW },
  );

  await sequelize.query(
    `CREATE INDEX IF NOT EXISTS "email_verifications_user_id_idx" ON "email_verifications"("user_id")`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] email_verifications table ensured");
}

async function applySubscriptionPaymentsTable(sequelize) {
  const { QueryTypes } = require("sequelize");

  // 1. Status ENUM
  await sequelize.query(
    `DO $$
     BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_subscription_payments_status') THEN
         CREATE TYPE "enum_subscription_payments_status" AS ENUM (
           'paid', 'pending', 'failed', 'refunded'
         );
       END IF;
     END
     $$;`,
    { type: QueryTypes.RAW },
  );

  // 2. Table
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS "subscription_payments" (
       "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       "store_id" UUID NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
       "invoice_number" VARCHAR(255) NOT NULL,
       "plan_id" VARCHAR(255) NOT NULL,
       "amount" DECIMAL(10,2) NOT NULL,
       "currency" VARCHAR(255) NOT NULL DEFAULT 'USD',
       "status" "enum_subscription_payments_status" NOT NULL DEFAULT 'paid',
       "period_start" TIMESTAMP WITH TIME ZONE NOT NULL,
       "period_end" TIMESTAMP WITH TIME ZONE NOT NULL,
       "payment_method" VARCHAR(255) NOT NULL DEFAULT 'whish',
       "paid_at" TIMESTAMP WITH TIME ZONE,
       "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
     )`,
    { type: QueryTypes.RAW },
  );

  // 3. Indexes
  await sequelize.query(
    `CREATE INDEX IF NOT EXISTS "subscription_payments_store_id_idx" ON "subscription_payments"("store_id")`,
    { type: QueryTypes.RAW },
  );
  await sequelize.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS "subscription_payments_store_invoice_unique" ON "subscription_payments"("store_id", "invoice_number")`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] subscription_payments table ensured");
}

async function applySessionRotationGraceColumns(sequelize) {
  const { QueryTypes } = require("sequelize");

  await sequelize.query(
    `ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "prev_refresh_token_hash" VARCHAR(255)`,
    { type: QueryTypes.RAW },
  );
  await sequelize.query(
    `ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "prev_rotated_at" TIMESTAMP WITH TIME ZONE`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] sessions rotation-grace columns ensured");
}

async function applyPromotionsTable(sequelize) {
  const { QueryTypes } = require("sequelize");

  // 1. discount_type ENUM
  await sequelize.query(
    `DO $$
     BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_promotions_discount_type') THEN
         CREATE TYPE "enum_promotions_discount_type" AS ENUM ('percentage', 'fixed');
       END IF;
     END
     $$;`,
    { type: QueryTypes.RAW },
  );

  // 2. Table
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS "promotions" (
       "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       "store_id" UUID NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
       "code" VARCHAR(255) NOT NULL,
       "description" VARCHAR(255),
       "discount_type" "enum_promotions_discount_type" NOT NULL DEFAULT 'percentage',
       "discount_value" DECIMAL(10,2) NOT NULL,
       "min_order_amount" DECIMAL(10,2),
       "max_discount" DECIMAL(10,2),
       "usage_limit" INTEGER,
       "used_count" INTEGER NOT NULL DEFAULT 0,
       "starts_at" TIMESTAMP WITH TIME ZONE,
       "ends_at" TIMESTAMP WITH TIME ZONE,
       "is_active" BOOLEAN NOT NULL DEFAULT true,
       "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
       "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
     )`,
    { type: QueryTypes.RAW },
  );

  // 3. Indexes
  await sequelize.query(
    `CREATE INDEX IF NOT EXISTS "promotions_store_id_idx" ON "promotions"("store_id")`,
    { type: QueryTypes.RAW },
  );
  await sequelize.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS "promotions_store_id_code_unique" ON "promotions"("store_id", "code")`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] promotions table ensured");
}

async function applyOrderDiscountColumns(sequelize) {
  const { QueryTypes } = require("sequelize");

  await sequelize.query(
    `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0`,
    { type: QueryTypes.RAW },
  );
  await sequelize.query(
    `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_code" VARCHAR(255)`,
    { type: QueryTypes.RAW },
  );

  console.log("[migrate] orders discount columns ensured");
}

module.exports = {
  applyPromotionsTable,
  applyOrderDiscountColumns,
  applySubscriptionColumns,
  applySellerDraftColumn,
  applyAddressesTable,
  applyProductColorsColumn,
  applyProductCustomizationsColumn,
  applyPasswordResetsTable,
  applyEmailVerificationsTable,
  applyStoreSocialColumns,
  applyUserPasswordVersionColumn,
  applySubscriptionPaymentsTable,
  applySessionRotationGraceColumns,
};
