import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const month = req.session.authMonth;

        if (!email || !month) {
          return done(null, false);
        }

        const user = await User.findOne({ email, month });

        if (!user) {
          return done(null, false);
        }

        if (!user.googleId) user.googleId = profile.id;
        if (!user.name) user.name = profile.displayName;

        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
