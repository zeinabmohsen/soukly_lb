const { z } = require("zod");

const passwordSchema = z
  .string({ required_error: "password is required" })
  .min(6, "password must be at least 6 characters")
  .max(200, "password is too long");

const phoneSchema = z
  .string()
  .trim()
  .min(6, "phone is too short")
  .max(30, "phone is too long")
  .optional()
  .or(z.literal("").transform(() => undefined));

const registerSchema = z.object({
  name: z.string({ required_error: "name is required" }).trim().min(2, "name is too short").max(120),
  email: z.string({ required_error: "email is required" }).trim().toLowerCase().email("invalid email"),
  password: passwordSchema,
  phone: phoneSchema,
});

const loginSchema = z.object({
  email: z.string({ required_error: "email is required" }).trim().toLowerCase().email("invalid email"),
  password: z.string({ required_error: "password is required" }).min(1, "password is required"),
});

module.exports = { registerSchema, loginSchema };
