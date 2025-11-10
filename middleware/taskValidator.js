import { body, param } from "express-validator";

export const taskCreateValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 }),
  body("description").optional().isLength({ max: 1000 }),
  body("priority").optional().isIn(["High", "Medium", "Low"]),
  body("status").optional().isIn(["Pending", "In Progress", "Completed"]),
  body("assignedTo").optional().isArray(),
  body("assignedTo.*")
    .optional()
    .isMongoId()
    .withMessage("assignedTo must be valid user IDs"),
  body("dueDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("dueDate must be a valid date"),
];

export const taskUpdateValidation = [
  body("title").optional().isLength({ max: 200 }),
  body("description").optional().isLength({ max: 1000 }),
  body("priority").optional().isIn(["High", "Medium", "Low"]),
  body("status").optional().isIn(["Pending", "In Progress", "Completed"]),
  body("assignedTo").optional().isArray(),
  body("assignedTo.*").optional().isMongoId(),
  body("dueDate").optional().isISO8601().toDate(),
];

export const idParam = [param("id").isMongoId().withMessage("Invalid task ID")];
