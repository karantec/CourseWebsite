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
      callbackURL: "https://coursewebsite-1.onrender.com/auth/google/callback",
      passReqToCallback: true, // 🔥 REQUIRED
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false);

        // 🔥 month comes from OAuth state
        const state = JSON.parse(req.query.state || "{}");
        const selectedMonth = state.month;

        if (!selectedMonth) return done(null, false);

        // 🔥 CRITICAL FIX
        const user = await User.findOne({
          email,
          month: selectedMonth,
        });

        if (!user) {
          // ❌ illegal login (wrong month)
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
