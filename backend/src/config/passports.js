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
        if (user) return done(null, user);
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
