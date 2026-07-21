import express from "express";
import { getEvents, getTodayEventCounts } from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getEvents);
router.get("/today-counts", protect, getTodayEventCounts);

export default router;
