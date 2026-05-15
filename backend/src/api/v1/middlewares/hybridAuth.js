const jwt = require("jsonwebtoken");
const { User } = require("../models");
const APIError = require("../utils/apiError");
const { jwtSecret } = require("../../config");

// Attempt JWT verification and user lookup
async function tryJwt(token) {
  if (!jwtSecret) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.id);
    return user || null;
  } catch {
    return null;
  }
}

// Attempt API key lookup
async function tryApiKey(apiKey) {
  const user = await User.findOne({ where: { api_key: apiKey } });
  return user || null;
}

// Ensure user has a permitted role if provided
function hasRequiredRole(user, allowedRoles) {
  const role = user.role || user.role_name || user.role_id || user.roleId;
  return allowedRoles.length === 0 || allowedRoles.includes(role);
}

function hybridAuth(allowedRoles = []) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new APIError({
          message: "Missing Authorization header",
          status: "fail",
          statusCode: 401,
        })
      );
    }

    const token = authHeader.split(" ")[1];
    let user = await tryJwt(token);

    if (!user) {
      user = await tryApiKey(token);
    }

    if (!user) {
      return next(
        new APIError({
          message: "Unauthorized: Invalid token or API key",
          status: "fail",
          statusCode: 403,
        })
      );
    }

    if (!hasRequiredRole(user, allowedRoles)) {
      return next(
        new APIError({
          message: "Forbidden: Insufficient role",
          status: "fail",
          statusCode: 403,
        })
      );
    }

    req.user = user;
    return next();
  };
}

module.exports = hybridAuth;
