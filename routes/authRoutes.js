import express from "express";
import passport from "passport";

const router = express.Router();
const FRONTEND = "https://www.kumarkdsacourse.in";

/* =====================================================
   STEP 1: Start Google Login
===================================================== */
router.get(
  "/google",
  (req, res, next) => {
    const { month } = req.query;

    if (!month) {
      return res.redirect(`${FRONTEND}/?error=select_month`);
    }

    req.session.authMonth = month;
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/* =====================================================
   STEP 2: Google Callback
===================================================== */
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user) => {
    req.session.authMonth = null;

    if (err || !user) {
      return res.redirect(`${FRONTEND}/?error=unauthorized`);
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.redirect(`${FRONTEND}/?error=server_error`);
      }

      return res.redirect(`${FRONTEND}/dashboard`);
    });
  })(req, res, next);
});

/* =====================================================
   STEP 3: Auth Check (🔥 FIXED – NO CACHE)
===================================================== */
router.get("/check", (req, res) => {
  // 🚫 Disable caching completely (VERY IMPORTANT)
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  if (req.isAuthenticated()) {
    return res.status(200).json({
      ok: true,
      user: req.user,
    });
  }

  return res.status(401).json({
    ok: false,
    message: "Not logged in",
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
