import express from "express";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
} from "../controllers/taskController.js";
import { userAuth, authorizeRoles } from "../middleware/userAuth.js";
import {
  taskCreateValidation,
  taskUpdateValidation,
  idParam,
} from "../middleware/taskValidator.js";

const router = express.Router();

// All task routes require authentication
router.use(userAuth);

// ----------------- TASK ENDPOINTS -----------------
router.get("/", listTasks); // List all tasks (based on role)
router.get("/:id", idParam, getTaskById); // Get single task

// Create task (Admin/Manager only)
router.post(
  "/",
  authorizeRoles("Admin", "Manager"),
  taskCreateValidation,
  createTask
);

// Update task (Users can update their task status)
router.put("/:id", idParam, taskUpdateValidation, updateTask);

// Delete task (Admin only)
router.delete("/:id", idParam, authorizeRoles("Admin"), deleteTask);

export default router;
