import express from "express";
import {
  registerUser,
  loginUser,
  verifyAccountOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendAccountOtp,
  resendResetOtp,
  refreshAccessToken,
  logout,
} from "../controllers/authController.js";
import {
  registerValidation,
  loginValidation,
} from "../middleware/authValidator.js";
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

// ----------------- PUBLIC ROUTES -----------------
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.post("/verify-account", verifyAccountOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/resend-account-otp", resendAccountOtp);
router.post("/resend-reset-otp", resendResetOtp);

// ----------------- AUTHENTICATED ROUTES -----------------
router.post("/refresh", refreshAccessToken);
router.post("/logout", userAuth, logout);

export default router;
