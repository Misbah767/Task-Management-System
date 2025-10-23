import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Todo text is required"],
      trim: true,
      maxlength: [500, "Todo text cannot exceed 500 characters"],
    },
    completed: { type: Boolean, default: false },

    // Flexible category
    category: {
      type: String,
      trim: true,
      default: "Personal",
      maxlength: [50, "Category name too long"],
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },

    tags: [{ type: String, trim: true, maxlength: [50, "Tag too long"] }],

    dueDate: { type: Date, default: null },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.dueDate) ret.dueDate = ret.dueDate.toISOString();
        return ret;
      },
    },
  }
);

// Indexes
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, category: 1 });
todoSchema.index({ userId: 1, priority: 1 });
todoSchema.index({ userId: 1, completed: 1 });

// Virtuals
todoSchema.virtual("isOverdue").get(function () {
  return this.dueDate && !this.completed && new Date() > this.dueDate;
});

// Instance method
todoSchema.methods.toggleComplete = function () {
  this.completed = !this.completed;
  return this.save();
};

// Static method
todoSchema.statics.findByUser = function (userId, filters = {}) {
  const query = { userId };
  if (filters.category) query.category = filters.category;
  if (filters.priority) query.priority = filters.priority;
  if (typeof filters.completed === "boolean")
    query.completed = filters.completed;
  if (filters.tags?.length) query.tags = { $in: filters.tags };
  return this.find(query).sort({ order: 1, createdAt: -1 });
};

const Todo = mongoose.model("Todo", todoSchema);
export default Todo;
