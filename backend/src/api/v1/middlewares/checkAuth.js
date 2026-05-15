const passport = require("passport");
const { promisify } = require("util");
const APIError = require("../../../utils/ApiError");

const LOGGED_USER = "_loggedUser"; // any authenticated user (own resource check)
const ADMIN = "admin";             // is_admin: true
const USER = "user";               // any authenticated user
const SELLER = "seller";           // is_seller: true AND seller_status: 'approved'

const handleJWT =
  (req, res, next, roles) =>
  async (error, user, info) => {
    const logIn = promisify(req.logIn);

    let apiError;

    if (
      (error && error.name === "TokenExpiredError") ||
      (info && info.name === "TokenExpiredError")
    ) {
      apiError = new APIError({ message: "Token expired", status: 401, isPublic: true });
    } else {
      apiError = new APIError({
        message: error ? error.message : info ? info.message : "Unauthorized",
        status: 401,
        stack: error ? error.stack : info ? info.stack : undefined,
        isPublic: true,
      });
    }

    try {
      if (error || !user) throw error || new Error("No user");
      await logIn(user, { session: false });
    } catch (e) {
      return next(apiError);
    }

    if (roles === LOGGED_USER) {
      // Authenticated user accessing their own resource
      if (!user.is_admin && req.params.userId && req.params.userId !== user.id) {
        return next(new APIError({ message: "Forbidden", status: 403 }));
      }
    } else if (roles === ADMIN) {
      if (!user.is_admin) {
        return next(new APIError({ message: "Forbidden", status: 403 }));
      }
    } else if (roles === SELLER) {
      // Must be an approved seller (admin can always bypass)
      if (!user.is_admin && (!user.is_seller || user.seller_status !== "approved")) {
        return next(new APIError({ message: "Forbidden: approved seller account required", status: 403 }));
      }
    }
    // USER: any authenticated user — no extra check needed

    req.user = user;
    return next();
  };

exports.LOGGED_USER = LOGGED_USER;
exports.ADMIN = ADMIN;
exports.USER = USER;
exports.SELLER = SELLER;

exports.authorize = (roles) => (req, res, next) =>
  passport.authenticate("jwt", { session: false }, handleJWT(req, res, next, roles))(
    req,
    res,
    next
  );
