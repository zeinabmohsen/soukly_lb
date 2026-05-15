const { z } = require("zod");

const checkoutItemSchema = z.object({
  product_id: z.string().uuid("product_id must be a UUID"),
  quantity: z.coerce.number().int().min(1).max(1000),
});

const shippingAddressSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
  phone: z.string().trim().min(6, "phone is too short").max(30),
  email: z.string().email().or(z.literal("")).optional(),
  address: z.string().trim().min(1, "address is required").max(300),
  city: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "items must contain at least one product").max(100),
  shipping_address: shippingAddressSchema,
  payment_method: z.enum(["cash_on_delivery", "card"]).default("cash_on_delivery"),
  notes: z.string().trim().max(1000).optional(),
});

module.exports = { checkoutSchema };
