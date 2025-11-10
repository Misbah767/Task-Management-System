import {
  registerService,
  loginService,
  verifyAccountOtpService,
  forgotPasswordService,
  verifyResetOtpService,
  resetPasswordService,
  refreshAccessTokenService,
  resendAccountOtpService,
  resendResetOtpService,
  logoutService,
} from "../services/authService.js";
import { validationResult } from "express-validator";

// ----------------- REGISTER -----------------
export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const result = await registerService(
      req.body,
      req.user || null,
      req.ip,
      req.get("User-Agent")
    );

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------- LOGIN -----------------
export const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { user, accessToken, refreshToken } = await loginService(
      req.body,
      req.ip,
      req.get("User-Agent")
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", user, accessToken });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------- VERIFY ACCOUNT OTP -----------------
export const verifyAccountOtp = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await verifyAccountOtpService(
      req.body,
      req.ip,
      req.get("User-Agent")
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Account verified successfully",
      user,
      accessToken,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------- FORGOT PASSWORD -----------------
export const forgotPassword = async (req, res) => {
  try {
    const result = await forgotPasswordService(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------- VERIFY RESET OTP -----------------
export const verifyResetOtp = async (req, res) => {
  try {
    const result = await verifyResetOtpService(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------- RESET PASSWORD -----------------
export const resetPassword = async (req, res) => {
  try {
    const result = await resetPasswordService(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------- RESEND ACCOUNT OTP -----------------
export const resendAccountOtp = async (req, res) => {
  try {
    const result = await resendAccountOtpService(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------- RESEND RESET OTP -----------------
export const resendResetOtp = async (req, res) => {
  try {
    const result = await resendResetOtpService(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------- REFRESH ACCESS TOKEN -----------------
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const result = await refreshAccessTokenService(
      refreshToken,
      req.ip,
      req.get("User-Agent")
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

// ----------------- LOGOUT -----------------
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    await logoutService(refreshToken);
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
