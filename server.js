// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import "./auth.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import { ensureAuth } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();

/* ==============================
   TRUST PROXY (MUST BE FIRST)
================================ */
app.set("trust proxy", 1); // REQUIRED on Render

/* ==============================
   CORS
================================ */
app.use(
  cors({
    origin: ["https://www.kumarkdsacourse.in", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

/* ==============================
   SESSION STORE (CRITICAL FIX)
================================ */
// ⚠️ DO NOT USE MEMORY STORE IN PROD
// Render restarts = session lost
import MongoStore from "connect-mongo";

app.use(
  session({
    name: "sessionId",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true, // 🔥 IMPORTANT
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: true, // HTTPS only
      sameSite: "none", // cross-domain
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
   DB CONNECT
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
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
