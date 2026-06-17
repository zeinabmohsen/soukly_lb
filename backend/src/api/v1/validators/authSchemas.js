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

// Login by email OR phone (beachbeds-style). Either identifier is accepted; the
// controller looks the account up by whichever one was supplied.
const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("invalid email").optional(),
    phone: z.string().trim().min(6, "phone is too short").max(30, "phone is too long").optional(),
    password: z.string({ required_error: "password is required" }).min(1, "password is required"),
  })
  .refine((d) => Boolean(d.email) || Boolean(d.phone), {
    message: "email or phone is required",
    path: ["email"],
  });

const forgotPasswordSchema = z.object({
  email: z.string({ required_error: "email is required" }).trim().toLowerCase().email("invalid email"),
});

const resetPasswordSchema = z.object({
  token: z.string({ required_error: "token is required" }).min(10, "invalid token"),
  password: passwordSchema,
});

const verifyEmailSchema = z.object({
  token: z.string({ required_error: "token is required" }).min(10, "invalid token"),
});

const resendVerificationSchema = z.object({
  email: z.string({ required_error: "email is required" }).trim().toLowerCase().email("invalid email"),
});

module.exports = {
  registerSchema, loginSchema,
  forgotPasswordSchema, resetPasswordSchema,
  verifyEmailSchema, resendVerificationSchema,
};
