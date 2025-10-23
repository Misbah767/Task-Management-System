import express from "express";
import { userAuth } from "../middleware/userAuth.js";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  reorderTodos,
} from "../controllers/todoController.js";

const router = express.Router();

router.use(userAuth);

router.get("/", getTodos);
router.post("/", createTodo);
router.put("/reorder", reorderTodos);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
