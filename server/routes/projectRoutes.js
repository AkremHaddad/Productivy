// ==================== ROUTES (projectRoutes.js) ====================
import express from "express";
import {
  getProjects,
  getProject,
  addProject,
  addSprint,
  updateSprint,
  deleteSprint,
  addTask,
  updateTask,
  toggleTask,
  getSprintTasks,
  deleteTask,
  addBoard,
  updateBoard,
  deleteBoard,
  addColumn,
  updateColumn,
  deleteColumn,
  addCard,
  updateCard,
  deleteCard,
  deleteProject
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Projects
router.get("/", protect, getProjects);
router.get("/:id", protect, getProject);
router.post("/", protect, addProject);
router.delete("/:id", protect, deleteProject);

// Sprints
router.post("/:projectId/sprints", protect, addSprint);
router.patch("/:projectId/sprints/:sprintId", protect, updateSprint);
router.delete("/:projectId/sprints/:sprintId", protect, deleteSprint);

// Tasks
router.get("/:projectId/sprints/:sprintId/tasks", protect, getSprintTasks);
router.post("/:projectId/sprints/:sprintId/tasks", protect, addTask);
router.patch("/:projectId/sprints/:sprintId/tasks/:taskId", protect, updateTask);
router.patch("/:projectId/sprints/:sprintId/tasks/:taskId/toggle", protect, toggleTask);
router.delete("/:projectId/sprints/:sprintId/tasks/:taskId", protect, deleteTask);

// Boards
router.post("/:projectId/boards", protect, addBoard);
router.patch("/:projectId/boards/:boardId", protect, updateBoard);
router.delete("/:projectId/boards/:boardId", protect, deleteBoard);

// Columns
router.post("/:projectId/boards/:boardId/columns", protect, addColumn);
router.patch("/:projectId/boards/:boardId/columns/:columnId", protect, updateColumn);
router.delete("/:projectId/boards/:boardId/columns/:columnId", protect, deleteColumn);

// Cards
router.post("/:projectId/boards/:boardId/columns/:columnId/cards", protect, addCard);
router.patch("/:projectId/boards/:boardId/columns/:columnId/cards/:cardId", protect, updateCard);
router.delete("/:projectId/boards/:boardId/columns/:columnId/cards/:cardId", protect, deleteCard);

export default router;