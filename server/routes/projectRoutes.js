import express from "express";
import {
  getProjects,
  getProject,
  addProject,
  addSprint,
  addTask,
  toggleTask,
  getSprintTasks
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProjects);
router.get("/:id", protect, getProject);
router.post("/", protect, addProject);
router.post("/:projectId/sprints", protect, addSprint);

// Tasks routes
router.get("/:projectId/sprints/:sprintId/tasks", protect, getSprintTasks);
router.post("/:projectId/sprints/:sprintId/tasks", protect, addTask);
router.patch("/:projectId/sprints/:sprintId/tasks/:taskId/toggle", protect, toggleTask);

export default router;
