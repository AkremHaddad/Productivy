// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

import rateLimiter from "./middleware/rateLimiter.js";
import connectDB from "./config/db.js";

import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import chartsRoutes from "./routes/chartsRoutes.js";
import "./cron/activityCron.js"; // just importing starts the cron job


import passport from "./config/passport.js"; // your Google strategy + serialize/deserialize

dotenv.config({ debug: false, quiet: true });

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const MONGO_URI = process.env.DBlink;

// Express app
const app = express();

// Trust proxy when deployed behind a proxy (e.g., Render/Heroku/Nginx)
if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// CORS (allow your React app)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// Rate limiting (keep it above routes)
app.use(rateLimiter);

// Sessions (required for Passport OAuth)
app.use(
  session({
    name: "sid", // cookie name
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 24 * 7, // 7 days
    }),
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === "production", // important
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Passport (Google OAuth)
app.use(passport.initialize());
app.use(passport.session());

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: NODE_ENV });
});

// Routes
app.use("/api/projects", projectRoutes); // GET/POST at /api/projects
app.use("/api/auth", authRoutes);        // /login, /register, /google, /me, /logout
app.use("/api/activity", activityRoutes);
app.use("/api/charts", chartsRoutes);

// Start DB + server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server started on PORT ${PORT} (${NODE_ENV})`);
      console.log(`✅ CORS allowed: ${FRONTEND_URL}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });
