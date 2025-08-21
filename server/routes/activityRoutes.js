import express from "express";
import { addActivity, getCurrentActivity} from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addActivity);
router.get("/current", protect, getCurrentActivity);


export default router;
