import bcrypt from "bcryptjs";
import { sendSuccess, sendError } from "../utils/response.js";
import { validatePassword } from "../utils/passwordValidator.js";
import { auditLogger } from "../utils/auditLogger.js";

// ----------------- GET USER PROFILE -----------------
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user; // middleware se attach hua user

    sendSuccess(res, 200, "User profile fetched successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
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

    let updatedFields = {};

    // Update name
    if (name && name !== user.name) {
      user.name = name;
      updatedFields.name = name;
    }

    // Update password
    if (password) {
      if (!validatePassword(password)) {
        return sendError(res, 400, "Password does not meet complexity requirements", {
          rules: "Minimum 8 chars, uppercase, lowercase, number, special char",
        });
      }
      user.password = await bcrypt.hash(password, 10);
      updatedFields.password = "updated";
    }

    if (Object.keys(updatedFields).length === 0) {
      return sendError(res, 400, "No changes provided to update profile");
    }

    await user.save();

    // Audit logging
    auditLogger(user._id, "User updated profile", req.ip, req.headers["user-agent"]);

    sendSuccess(res, 200, "Profile updated successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      updatedFields,
    });
  } catch (err) {
    sendError(res, 500, "Failed to update profile", err.message);
  }
};