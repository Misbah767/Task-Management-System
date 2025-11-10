import cron from "node-cron";
import Todo from "../models/taskModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "./nodemailer.js";

// Run every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  try {
    const now = new Date();
    const upcoming = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead

    // find tasks due in the next hour and not completed
    const tasks = await Todo.find({
      dueDate: { $gte: now, $lte: upcoming },
      status: { $ne: "Completed" },
    }).populate("assignedTo", "name email");

    for (const task of tasks) {
      if (!task.assignedTo || task.assignedTo.length === 0) continue;

      for (const assignee of task.assignedTo) {
        // If assignee missing email, skip
        if (!assignee?.email) continue;
        await sendEmail(
          assignee.email,
          `⏰ Task Reminder - ${task.title}`,
          "reminder",
          {
            name: assignee.name,
            taskTitle: task.title,
            dueDate: task.dueDate.toLocaleString(),
          },
          true
        );

        console.log(
          `📩 Reminder sent for task "${task.title}" to ${assignee.email}`
        );
      }
    }
  } catch (err) {
    console.error("❌ Error in cron job:", err.message);
  }
});
