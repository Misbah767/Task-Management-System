import Todo from "../models/todoModel.js";

export const getTodos = async (userId, filters) => {
  const query = { userId };

  if (filters.category && filters.category !== "All")
    query.category = filters.category;
  if (filters.priority && filters.priority !== "All")
    query.priority = filters.priority;
  if (filters.completed && filters.completed !== "All")
    query.completed = filters.completed === "true";

  return await Todo.find(query).sort({ order: 1, createdAt: -1 });
};

export const createTodo = async (userId, data) => {
  const highest = await Todo.findOne({ userId }).sort({ order: -1 });
  const nextOrder = highest ? highest.order + 1 : 0;

  const todo = new Todo({
    ...data,
    userId,
    order: nextOrder,
  });

  return await todo.save();
};

export const updateTodo = async (userId, id, updates) => {
  return await Todo.findOneAndUpdate({ _id: id, userId }, updates, {
    new: true,
    runValidators: true,
  });
};

export const deleteTodo = async (userId, id) => {
  return await Todo.findOneAndDelete({ _id: id, userId });
};

export const reorderTodos = async (userId, todoOrders) => {
  const updatePromises = todoOrders.map(({ id, order }) =>
    Todo.findOneAndUpdate({ _id: id, userId }, { order }, { new: true })
  );
  return Promise.all(updatePromises);
};
