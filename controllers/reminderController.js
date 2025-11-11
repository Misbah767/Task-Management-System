import { sendTaskReminders } from "../services/reminderService.js";

export const triggerReminders = async (req, res) => {
  try {
    const sent = await sendTaskReminders();

    if (!sent.length) {
      return res.status(200).json({
        message: " No upcoming tasks found within 1 hour ",
      });
    }

    res.status(200).json({
      message: ` ${sent.length} reminder(s) sent successfully.`,
      reminders: sent,
    });
  } catch (error) {
    console.error("❌ Reminder trigger failed:", error);
    res.status(500).json({
      message: "Failed to send reminders",
      error: error.message,
    });
  }
};
