import express from "express";
import { addActivity, getCurrentActivity } from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js"; // middleware to check JWT/session

const router = express.Router();

// Add or update activity
router.post("/", protect, addActivity);

// Get current/latest activity
router.get("/current", protect, getCurrentActivity);

export default router;
