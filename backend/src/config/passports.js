const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { jwtSecret } = require("./index");
const { User } = require("../api/v1/models");

module.exports = (passport) => {
  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET for passport JWT strategy");
  }

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
  };

  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const user = await User.findByPk(jwtPayload.id);
        if (!user) return done(null, false);

        // Reject access tokens that were issued against an older password.
        // Bumped in User.beforeUpdate when password changes. Tokens missing
        // the claim entirely are treated as version 1 (back-compat with any
        // tokens issued before this check shipped).
        const tokenVersion = jwtPayload.pwd_v ?? 1;
        if (tokenVersion !== user.password_version) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
