import express from "express";
import {
  setCurrentActivity,
  getCurrentActivity,
  addActivityMinute,
  setOffline,
  setOnline
} from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Set current activity (UI)
router.post("/set", protect, setCurrentActivity);
router.post("/set-offline", protect, setOffline);
router.post("/set-online", protect, setOnline);

// Get current activity
router.get("/current", protect, getCurrentActivity);

// Add +1 minute (cron tick)
router.post("/tick", protect, addActivityMinute);

export default router;
