// cron/reminderJob.js
import cron from "node-cron";
import { sendTaskReminders } from "../services/reminderService.js";

// every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("⏰ Running task reminder check...");
  try {
    const result = await sendTaskReminders();
    console.log(`✅ Reminder job done. ${result.length} reminders sent.`);
  } catch (err) {
    console.error("❌ Reminder job failed:", err.message);
  }
});
