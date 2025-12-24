// routes/authRoutes.js
import express from "express";
import passport from "passport";

const router = express.Router();
const FRONTEND = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

// Start Google login: save month in session then kick off oauth
router.get("/google", (req, res, next) => {
  const { month } = req.query;
  if (!month) {
    return res.redirect(`${FRONTEND}/login?error=select_month`);
  }
  // Save selected month in session so strategy can read it on callback
  req.session.authMonth = month;
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

// Google callback using custom callback so we can control redirects and clear session
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    // clear stored month to avoid stale data
    if (req.session) req.session.authMonth = null;

    if (err) {
      console.error("Google auth error:", err);
      return res.redirect(`${FRONTEND}/login?error=server_error`);
    }

    if (!user) {
      // No user found matching email+month
      return res.redirect(`${FRONTEND}/login?error=fake_user`);
    }

    // Log the user in (establish session)
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Login error:", loginErr);
        return res.redirect(`${FRONTEND}/login?error=server_error`);
      }
      // Success -> dashboard
      return res.redirect(`${FRONTEND}/dashboard`);
    });
  })(req, res, next);
});

// Check login status
router.get("/check", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    if (req.session) req.session.authMonth = null;
    res.json({ message: "Logged out" });
  });
});

export default router;
