// auth.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:5000/auth/google/callback";

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
      callbackURL: CALLBACK_URL,
      passReqToCallback: true, // so we can read req.session.authMonth
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const month = req.session?.authMonth;

        if (!email) {
          return done(null, false, { message: "No email from Google" });
        }

        if (!month) {
          return done(null, false, { message: "No month provided" });
        }

        // find a user with matching email and month
        const user = await User.findOne({ email, month });

        if (!user) {
          // no matching user — reject authentication
          return done(null, false, {
            message: "Unauthorized. No matching user.",
          });
        }

        // Update googleId/name if missing (optional)
        let changed = false;
        if (!user.googleId) {
          user.googleId = profile.id;
          changed = true;
        }
        if (!user.name && profile.displayName) {
          user.name = profile.displayName;
          changed = true;
        }
        if (changed) await user.save();

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
