import express from "express";
import passport from "passport";
import User from "../models/User.js";
import { getMe, logoutUser, updateActivity, getStatus } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js"; // session/auth check

const router = express.Router();

// -------------------- AUTH ROUTES -------------------- //

// Login
router.post("/login", async (req, res) => {
  try {
    if (!User) {
      return res.status(500).json({ message: "Server configuration error - User model not loaded" });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isValidPassword = await user.matchPassword(password);
    if (!isValidPassword) return res.status(401).json({ message: "Invalid email or password" });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      res.json({ user: { id: user._id, username: user.username, email: user.email } });
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    if (!User) {
      return res.status(500).json({ message: "Server configuration error - User model not loaded" });
    }

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(409).json({ message: `${field} already exists` });
    }

    const newUser = new User({ username, email, password });
    const savedUser = await newUser.save();

    req.login(savedUser, (err) => {
      if (err) return res.status(500).json({ message: "Registration successful but login failed" });
      res.status(201).json({ 
        user: { id: savedUser._id, username: savedUser.username, email: savedUser.email } 
      });
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working!", timestamp: new Date().toISOString() });
});

// Check session
router.get("/me", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });
});

// -------------------- GOOGLE OAUTH -------------------- //
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    res.redirect("http://localhost:5173/projects");
  }
);

// -------------------- ACTIVITY & STATUS -------------------- //

// Update activity (protected)
router.post("/activity", protect, updateActivity);

// Get online/offline status (protected)
router.get("/status/:userId", protect, getStatus);

export default router;
