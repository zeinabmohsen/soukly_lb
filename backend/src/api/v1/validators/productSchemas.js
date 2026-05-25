const { z } = require("zod");

const imageSchema = z.object({
  url: z.string().url("image url must be a valid URL"),
  alt: z.string().max(200).optional(),
});

const featureSchema = z.object({
  label: z.string().max(120),
  value: z.string().max(200).optional(),
})

const colorSchema = z.object({
  name: z.string().trim().min(1).max(60),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "hex must be #rrggbb"),
  image_url: z.string().url("image_url must be a valid URL").optional(),
})

// Customizations the buyer fills in at checkout. Two flavours:
//   text   — free-form (engraving, monogram)
//   select — one option from a finite list
const customizationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    label: z.string().trim().min(1).max(80),
    help: z.string().max(200).optional(),
    required: z.boolean().optional().default(false),
    max_length: z.number().int().positive().max(500).optional(),
    placeholder: z.string().max(120).optional(),
  }),
  z.object({
    type: z.literal("select"),
    label: z.string().trim().min(1).max(80),
    help: z.string().max(200).optional(),
    required: z.boolean().optional().default(false),
    options: z.array(z.string().trim().min(1).max(120)).min(1).max(30),
  }),
])

// Money fields can come from forms as strings ("45.00") — coerce + validate.
const money = z.coerce.number().nonnegative("must be ≥ 0").max(1_000_000, "value out of range");
const stock = z.coerce.number().int("must be an integer").nonnegative("must be ≥ 0").max(1_000_000);

const createProductSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
  description: z.string().max(5000).nullable().optional(),
  price: money,
  compare_at_price: money.nullable().optional(),
  stock: stock.optional().default(0),
  sku: z.string().trim().max(120).nullable().optional(),
  store_category_id: z.string().uuid().nullable().optional(),
  images: z.array(imageSchema).max(20).optional().default([]),
  features: z.array(featureSchema).max(50).optional().default([]),
  colors: z.array(colorSchema).max(20).optional().default([]),
  customizations: z.array(customizationSchema).max(20).optional().default([]),
  status: z.enum(["active", "draft", "out_of_stock"]).optional().default("active"),
  is_featured: z.boolean().optional(),
})

module.exports = { createProductSchema };
