// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import MongoStore from "connect-mongo";

import "./auth.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import { ensureAuth } from "./middleware/authMiddleware.js";
import { startCronJobs } from "./cron/index.js";

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === "production";

/* ==============================
   TRUST PROXY (MUST BE FIRST)
================================ */
app.set("trust proxy", 1);

/* ==============================
   CORS
================================ */
app.use(
  cors({
    origin: ["https://www.kumarkdsacourse.in"],
    credentials: true,
  })
);

app.use(express.json());
app.set("trust proxy", 1);
/* ==============================
   SESSION (PRODUCTION SAFE)
================================ */
app.use(
  session({
    name: "connect.sid", // ✅ recommended
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    proxy: true,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),

    cookie: {
      httpOnly: true,
      secure: isProd, // true on Render
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

/* ==============================
   PASSPORT
================================ */
app.use(passport.initialize());
app.use(passport.session());

/* ==============================
   ROUTES
================================ */
app.use("/auth", authRoutes);
app.use("/course", ensureAuth, courseRoutes);

app.disable("etag");

/* ==============================
   DB CONNECT + START CRON
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // 🔥 START GOOGLE SHEET → DB AUTO SYNC
    startCronJobs();

    console.log("🔄 Google Sheet sync cron started");
  })
  .catch((err) => console.error("❌ DB Connection Error:", err));

/* ==============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

/* ==============================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
