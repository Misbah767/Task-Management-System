import express from "express";
import { sendTaskReminders } from "../services/reminderService.js";
import { userAuth, authorizeRoles } from "../middleware/userAuth.js";

const router = express.Router();

// Admin can manually trigger reminders
router.post("/trigger", userAuth, authorizeRoles("Admin"), async (req, res) => {
  try {
    const sent = await sendTaskReminders();
    res.status(200).json({ success: true, sent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
