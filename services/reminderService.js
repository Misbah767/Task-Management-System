import Task from "../models/taskModel.js";
import { sendEmail } from "../config/nodemailer.js";

export const sendTaskReminders = async () => {
  const now = new Date();
  const upcoming = new Date(now.getTime() + 60 * 60 * 1000);

  const tasks = await Task.find({
    dueDate: { $gte: now, $lte: upcoming },
    status: { $ne: "Completed" },
    remindersSent: { $ne: true },
  }).populate("assignedTo", "email name");

  const sentEmails = [];

  for (const task of tasks) {
    const assignees = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : [task.assignedTo];

    for (const assignee of assignees) {
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

      sentEmails.push({ taskId: task._id, email: assignee.email });
      console.log(
        `📩 Reminder sent for task "${task.title}" to ${assignee.email}`
      );
    }

    task.remindersSent = true;
    await task.save();
  }

  return sentEmails;
};
