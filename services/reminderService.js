import Task from "../models/taskModel.js";
import { sendEmail } from "../config/nodemailer.js";

/**
 * Sends reminder emails for tasks due within next hour
 * Automatically marks remindersSent = true to prevent duplicates
 */
export const sendTaskReminders = async () => {
  const now = new Date();
  const upcoming = new Date(now.getTime() + 1 * 60 * 60 * 1000); // next 1 hour

  // Find tasks due in the next hour, not completed, not already reminded
  const tasks = await Task.find({
    dueDate: { $gte: now, $lte: upcoming },
    status: { $ne: "Completed" },
    remindersSent: { $ne: true },
  })
    .populate("assignedTo", "email name") // populate assigned users
    .populate("createdBy", "name email role"); // optional: creator info

  const results = [];

  for (const task of tasks) {
    const assignees = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : [task.assignedTo];

    for (const assignee of assignees) {
      if (!assignee?.email) continue;

      // Send email reminder
      await sendEmail(
        assignee.email,
        `⏰ Task Reminder - ${task.title}`,
        "reminder",
        {
          name: assignee.name,
          taskTitle: task.title,
          dueDate: task.dueDate.toLocaleString(),
          role: assignee.role || "",
        },
        true
      );

      console.log(
        `📩 Reminder sent for task "${task.title}" to ${assignee.email}`
      );

      // Collect results for logging or API response
      results.push({
        taskId: task._id,
        taskTitle: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedTo: {
          name: assignee.name,
          email: assignee.email,
        },
        createdBy: task.createdBy?.name,
      });
    }

    // Mark task as reminded
    task.remindersSent = true;
    await task.save();
  }

  return results;
};
