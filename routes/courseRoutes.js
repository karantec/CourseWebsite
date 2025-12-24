// routes/courseRoutes.js
import express from "express";

const router = express.Router();

// Example protected endpoint: returns user-specific courses
router.get("/", (req, res) => {
  // req.user is available thanks to passport
  const user = req.user;
  // example response — replace with real DB lookup
  res.json({
    message: "Protected courses for user",
    user: {
      name: user.name,
      email: user.email,
      month: user.month,
      role: user.role,
    },
    courses: [
      { id: 1, title: "React Basics", availableForMonth: user.month },
      { id: 2, title: "Advanced Node", availableForMonth: user.month },
    ],
  });
});

export default router;
