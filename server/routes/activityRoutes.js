import express from "express";
import {
  setCurrentActivity,
  getCurrentActivity,
  // addActivityMinute,
  setOffline,
  setOnline,
  getTodayProductiveTime,
  getStreak,
  getHeatmap,
  getGoal,
  setGoal,
  getTotalFocusMinutes
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
// router.post("/tick", protect, addActivityMinute);

router.get("/today", protect, getTodayProductiveTime);
router.get("/streak", protect, getStreak);
router.get("/heatmap", protect, getHeatmap);
router.get("/total", protect, getTotalFocusMinutes);
router.get("/goal", protect, getGoal);
router.patch("/goal", protect, setGoal);

export default router;



