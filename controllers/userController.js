import bcrypt from "bcryptjs";
import { sendSuccess, sendError } from "../utils/response.js";
import { validatePassword } from "../utils/passwordValidator.js";
import { auditLogger } from "../utils/auditLogger.js";
import User from "../models/userModel.js";

// ----------------- GET USER PROFILE -----------------
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    sendSuccess(res, 200, "User profile fetched successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAccountVerified: user.isAccountVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    sendError(res, 500, "Failed to fetch user profile", err.message);
  }
};

// ----------------- UPDATE USER PROFILE -----------------
export const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, password } = req.body;

    if (!name && !password)
      return sendError(res, 400, "No changes provided to update profile");

    if (name) user.name = name;
    if (password) {
      if (!validatePassword(password))
        return sendError(
          res,
          400,
          "Password does not meet complexity requirements"
        );
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    auditLogger(user._id, "Updated profile", req.ip, req.headers["user-agent"]);

    sendSuccess(res, 200, "Profile updated successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    sendError(res, 500, "Failed to update profile", err.message);
  }
};
