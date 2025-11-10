import express from "express";
import { userAuth, authorizeRoles } from "../middleware/userAuth.js";
import { registerService } from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import User from "../models/userModel.js"; // <-- FIX: import User model

const router = express.Router();

// ----------------- MIDDLEWARE -----------------
// All user routes require authentication
router.use(userAuth);

// ----------------- ADMIN: LIST USERS -----------------
router.get("/", authorizeRoles("Admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    sendSuccess(res, 200, "Users fetched", users);
  } catch (err) {
    sendError(res, 500, "Failed to fetch users", err.message);
  }
});

// ----------------- ADMIN: CREATE USER -----------------
router.post("/", authorizeRoles("Admin"), async (req, res) => {
  try {
    const creator = req.user; // Logged-in Admin
    const result = await registerService(req.body, creator); // Proper auth & OTP flow
    sendSuccess(res, 201, result.message, result);
  } catch (err) {
    sendError(res, 400, "Failed to create user", err.message);
  }
});

// ----------------- ADMIN: GET SINGLE USER (Optional) -----------------
router.get("/:id", authorizeRoles("Admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return sendError(res, 404, "User not found");
    sendSuccess(res, 200, "User fetched", user);
  } catch (err) {
    sendError(res, 500, "Failed to fetch user", err.message);
  }
});

// ----------------- ADMIN: DELETE USER (Optional) -----------------
router.delete("/:id", authorizeRoles("Admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found");

    await user.remove();
    sendSuccess(res, 200, "User deleted successfully", { id: req.params.id });
  } catch (err) {
    sendError(res, 500, "Failed to delete user", err.message);
  }
});

export default router;
