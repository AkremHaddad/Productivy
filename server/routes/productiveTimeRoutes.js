import express from "express";
import { getTodayProductiveTime, addMinute } from "../controllers/productiveTimeController.js";
import { protect } from "../middleware/authMiddleware.js"; // your auth middleware

const router = express.Router();

// GET today's productive time
router.get("/today", protect, getTodayProductiveTime);

// POST add a minute
router.post("/add", protect, addMinute);

export default router;
