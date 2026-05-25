const { Router } = require("express");
const {
  register, login, refreshToken, logout, getMe,
  forgotPassword, resetPassword,
} = require("../controllers/authController");
const { authorize, USER } = require("../middlewares/checkAuth");
const { authLimiter, refreshLimiter, passwordResetLimiter } = require("../middlewares/rateLimiters");
const validate = require("../middlewares/validate");
const {
  registerSchema, loginSchema,
  forgotPasswordSchema, resetPasswordSchema,
} = require("../validators/authSchemas");

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login",    authLimiter, validate(loginSchema),    login);
router.post("/refresh",  refreshLimiter, refreshToken);
router.post("/logout",   logout);
router.post("/forgot-password", passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password",  passwordResetLimiter, validate(resetPasswordSchema),  resetPassword);
router.get("/me", authorize(USER), getMe);

module.exports = router;
