import express from "express";
import { triggerReminders } from "../controllers/reminderController.js";
import { userAuth } from "../middleware/userAuth.js";
import { authorizeRoles } from "../middleware/userAuth.js";

const router = express.Router();

// 🔒 Only Admin can trigger manually (for testing)
router.post("/trigger", userAuth, authorizeRoles("Admin"), triggerReminders);

export default router;
