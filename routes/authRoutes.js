import express from "express";
import passport from "passport";

const router = express.Router();
const FRONTEND_URL = "https://www.kumarkdsacourse.in";
/* =====================================================
   STEP 1: Start Google Login
===================================================== */
router.get("/google", (req, res, next) => {
  const { month } = req.query;

  if (!month) {
    return res.redirect(`${FRONTEND_URL}/?error=select_month`);
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: JSON.stringify({ month }), // 🔥 FIX
  })(req, res, next);
});

/* ============================
   GOOGLE CALLBACK
============================ */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://www.kumarkdsacourse.in/?error=unauthorized",
  }),
  (req, res) => {
    // 🚫 DO NOT redirect by month
    // ✅ ALWAYS redirect to dashboard
    res.redirect("https://www.kumarkdsacourse.in/dashboard");
  }
);
/* =====================================================
   STEP 3: Auth Check (🔥 FIXED – NO CACHE)
===================================================== */
router.get("/check", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ ok: false });
  }

  return res.json({
    ok: true,
    user: {
      email: req.user.email,
      month: req.user.month, // 🔥 THIS IS KEY
      role: req.user.role,
    },
  });
});
/* =====================================================
   DEBUG ROUTE (TEMP)
===================================================== */
router.get("/debug/session", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user,
    session: req.session,
  });
});

/* =====================================================
   LOGOUT
===================================================== */
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
});

export default router;
