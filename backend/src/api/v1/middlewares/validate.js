// Body validation via Zod. Wrap a route's handler to enforce the schema:
//   router.post("/login", validate(loginSchema), login)
// On failure: 400 with `{ message, errors: [{ path, message }] }`.

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
  // Replace body with parsed (and now type-coerced) version so controllers see clean data
  req.body = result.data;
  next();
};

module.exports = validate;
