import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

// ----------------- GET TASKS BY USER -----------------
export const getTasksByUserService = async (user) => {
  if (user.role === "Admin") {
    return Task.find().populate("assignedTo createdBy", "name email role");
  }
  if (user.role === "Manager") {
    return Task.find({
      $or: [{ createdBy: user._id }, { assignedTo: user._id }],
    }).populate("assignedTo createdBy", "name email role");
  }
  // User
  return Task.find({ assignedTo: user._id }).populate(
    "assignedTo createdBy",
    "name email role"
  );
};

// ----------------- GET TASK BY ID -----------------
export const getTaskByIdService = async (user, taskId) => {
  const task = await Task.findById(taskId).populate(
    "assignedTo createdBy",
    "name email role"
  );
  if (!task) throw new Error("Task not found");

  if (user.role === "Admin") return task;

  if (user.role === "Manager") {
    if (
      task.createdBy._id.toString() !== user._id.toString() &&
      task.assignedTo._id.toString() !== user._id.toString()
    )
      throw new Error("Access denied");
    return task;
  }

  if (user.role === "User") {
    if (task.assignedTo._id.toString() !== user._id.toString())
      throw new Error("Access denied");
    return task;
  }
};

// ----------------- CREATE TASK -----------------
export const createTaskService = async (data, creator) => {
  if (!["Admin", "Manager"].includes(creator.role))
    throw new Error("Access denied");

  if (!data.assignedTo) throw new Error("assignedTo is required");

  const assignedUser = await User.findById(data.assignedTo);
  if (!assignedUser) throw new Error("Assigned user not found");

  // Only Admin can assign to any role
  // Manager can assign only to Users
  if (creator.role === "Manager" && assignedUser.role !== "User")
    throw new Error("Manager can assign tasks only to Users");

  const task = await Task.create({
    title: data.title,
    description: data.description,
    assignedTo: assignedUser._id,
    dueDate: data.dueDate,
    priority: data.priority || "Medium",
    status: "Pending",
    createdBy: creator._id,
  });

  return task.populate("assignedTo createdBy", "name email role");
};

// ----------------- UPDATE TASK -----------------
export const updateTaskService = async (taskId, updates, actor) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  if (actor.role === "User") {
    if (task.assignedTo.toString() !== actor._id.toString())
      throw new Error("Access denied");
    // Users can only update status
    task.status = updates.status || task.status;
  } else if (actor.role === "Manager") {
    if (task.createdBy.toString() !== actor._id.toString())
      throw new Error("Managers can only update tasks they created");
    // Manager can update task fully if they created it
    Object.assign(task, updates);
  } else if (actor.role === "Admin") {
    // Admin can update anything
    Object.assign(task, updates);
  }

  await task.save();
  return task.populate("assignedTo createdBy", "name email role");
};

// ----------------- DELETE TASK -----------------
export const deleteTaskService = async (taskId, actor) => {
  if (actor.role !== "Admin") throw new Error("Only Admin can delete tasks");

  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  // Use deleteOne on document
  await Task.deleteOne({ _id: taskId });
  return { id: taskId, deleted: true };
};
