import express from "express";
import {
  registerUser,
  loginUser,
  verifyAccountOtp,
  resendAccountOtp,
  forgotPassword,
  resendResetOtp,
  verifyResetOtp,
  resetPassword,
  refreshAccessToken,
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-account-otp", verifyAccountOtp);
router.post("/resend-account-otp", resendAccountOtp);
router.post("/forgot-password", forgotPassword);
router.post("/resend-reset-otp", resendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// Token refresh
router.post("/refresh-token", refreshAccessToken);

export default router;
