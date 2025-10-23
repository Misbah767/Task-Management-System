import Todo from "../models/todoModel.js";
import User from "../models/userModel.js";
import { sendSuccess, sendError } from "../utils/response.js";

// GET TODOS
export const getTodos = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = req.query;
    const todos = await Todo.findByUser(userId, filters).populate(
      "assignedTo",
      "name email"
    );
    sendSuccess(res, 200, "Todos fetched successfully", todos);
  } catch (err) {
    sendError(res, 500, "Failed to fetch todos", err.message);
  }
};

// CREATE TODO
export const createTodo = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = req.body;
    const highest = await Todo.findOne({ userId }).sort({ order: -1 });
    const nextOrder = highest ? highest.order + 1 : 0;

    const todo = await Todo.create({ ...data, userId, order: nextOrder });
    await User.findByIdAndUpdate(userId, { $push: { todos: todo._id } });

    sendSuccess(res, 201, "Todo created successfully", todo);
  } catch (err) {
    sendError(res, 400, "Failed to create todo", err.message);
  }
};

// UPDATE TODO
export const updateTodo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updates = req.body;

    const todo = await Todo.findOneAndUpdate({ _id: id, userId }, updates, {
      new: true,
      runValidators: true,
    });
    if (!todo) return sendError(res, 404, "Todo not found or unauthorized");

    sendSuccess(res, 200, "Todo updated successfully", todo);
  } catch (err) {
    sendError(res, 400, "Failed to update todo", err.message);
  }
};

// DELETE TODO
export const deleteTodo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({ _id: id, userId });
    if (!todo) return sendError(res, 404, "Todo not found or unauthorized");

    await User.findByIdAndUpdate(userId, { $pull: { todos: id } });
    sendSuccess(res, 200, "Todo deleted successfully");
  } catch (err) {
    sendError(res, 400, "Failed to delete todo", err.message);
  }
};

// REORDER TODOS
export const reorderTodos = async (req, res) => {
  try {
    const userId = req.user._id;
    const todoOrders = req.body.todos;
    if (!Array.isArray(todoOrders))
      return sendError(res, 400, "Invalid todo order format");

    const updatePromises = todoOrders.map(({ id, order }) =>
      Todo.findOneAndUpdate({ _id: id, userId }, { order }, { new: true })
    );
    await Promise.all(updatePromises);
    sendSuccess(res, 200, "Todos reordered successfully");
  } catch (err) {
    sendError(res, 400, "Failed to reorder todos", err.message);
  }
};
