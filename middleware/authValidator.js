import { body } from "express-validator";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isString().withMessage("Password is required"),
  body("role").optional().isIn(["Admin", "Manager", "User"]).withMessage("Invalid role"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];
