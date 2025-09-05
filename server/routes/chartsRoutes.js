import express from "express";
import { getDailySummary } from "../controllers/chartsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/daily", protect, getDailySummary);

export default router;
