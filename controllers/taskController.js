import {
  createTaskService,
  updateTaskService,
  deleteTaskService,
  getTasksByUserService,
  getTaskByIdService,
} from "../services/taskService.js";
import { sendSuccess, sendError } from "../utils/response.js";

// ----------------- LIST TASKS -----------------
export const listTasks = async (req, res) => {
  try {
    const tasks = await getTasksByUserService(req.user);
    return sendSuccess(res, 200, "Tasks fetched", tasks);
  } catch (err) {
    return sendError(res, 400, "Failed fetching tasks", err.message);
  }
};

// ----------------- GET TASK BY ID -----------------
export const getTaskById = async (req, res) => {
  try {
    const task = await getTaskByIdService(req.user, req.params.id);
    return sendSuccess(res, 200, "Task fetched", task);
  } catch (err) {
    return sendError(res, 400, "Failed fetching task", err.message);
  }
};

// ----------------- CREATE TASK -----------------
export const createTask = async (req, res) => {
  try {
    const task = await createTaskService(req.body, req.user);
    return sendSuccess(res, 201, "Task created", task);
  } catch (err) {
    return sendError(res, 400, "Failed creating task", err.message);
  }
};

// ----------------- UPDATE TASK -----------------
export const updateTask = async (req, res) => {
  try {
    const task = await updateTaskService(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, "Task updated", task);
  } catch (err) {
    return sendError(res, 400, "Failed updating task", err.message);
  }
};

// ----------------- DELETE TASK -----------------
export const deleteTask = async (req, res) => {
  try {
    const result = await deleteTaskService(req.params.id, req.user);
    return sendSuccess(res, 200, "Task deleted", result);
  } catch (err) {
    return sendError(res, 400, "Failed deleting task", err.message);
  }
};
