// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import "./auth.js"; // passport config
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import { ensureAuth } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

// Middleware
app.use(
  cors({
    origin: ["https://www.kumarkdsacourse.in", "http://localhost:3000"],
    credentials: true, // 🔥 REQUIRED
  })
);

app.use(express.json());

// Session middleware (BEFORE passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // false for local dev (true in production with HTTPS)
      httpOnly: true,
      sameSite: "lax", // 'lax' usually works for OAuth redirect flows on localhost
      // maxAge: 1000 * 60 * 60 * 24, // optional: 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/course", ensureAuth, courseRoutes);

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Default route
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
