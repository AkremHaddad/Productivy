import express from "express";
import { getDailySummary, getWeeklySummary } from "../controllers/chartsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/daily", protect, getDailySummary);
router.get("/weekly", protect, getWeeklySummary);

export default router;
