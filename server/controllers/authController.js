import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // 1 week
  });
};

// @desc Register new user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({ username, email, password });

    // 🔥 Mark user online immediately
    user.isOnline = true;
    await user.save();

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // 🔥 Update activity + mark online
    user.lastActivity = new Date();
    user.isOnline = true;
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Google OAuth (placeholder for now)
export const googleAuth = (req, res) => {
  res.send("Google OAuth not implemented yet");
};

// @desc Update activity (ping from frontend every ~30s)
export const updateActivity = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not logged in" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.lastActivity = new Date();
    user.isOnline = true;
    await user.save();

    res.json({ success: true, lastActivity: user.lastActivity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get online/offline status of a user
export const getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    const lastActive = new Date(user.lastActivity || 0);

    const diff = (now - lastActive) / 1000; // seconds
    const isOnline = diff < 60; // online if active in last 60s

    res.json({
      userId: user._id,
      status: isOnline ? "online" : "offline",
      lastActivity: user.lastActivity,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Logout user (mark offline)
export const logoutUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not logged in" });

    const user = await User.findById(req.user._id);
    if (user) {
      user.isOnline = false;
      await user.save();
    }

    req.logout?.(); // if using passport
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current logged-in user
export const getMe = (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
};

