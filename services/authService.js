// services/authServices.js
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/generateToken.js";
import { sendEmail } from "../config/nodemailer.js";
import { validatePassword } from "../utils/passwordValidator.js";
import { auditLogger } from "../utils/auditLogger.js";
import jwt from "jsonwebtoken";

// OTP expiry time (10 minutes)
const OTP_EXPIRY = 10 * 60 * 1000;
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ======================================================
   REGISTER SERVICE
====================================================== */
export const registerService = async ({ name, email, password }) => {
  const lowerEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: lowerEmail });
  if (existingUser) throw new Error("User already exists");

  if (!validatePassword(password)) {
    throw new Error("Password must be 8+ chars with uppercase, lowercase, number, and special character");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY);

  const user = await User.create({
    name,
    email: lowerEmail,
    password: hashedPassword,
    isAccountVerified: false,
    verifyOtp: otp,
    verifyOtpExpiredAt: otpExpiry,
  });

  console.log("📩 [REGISTER] Generated Account OTP:", otp);

  await sendEmail(
    lowerEmail,
    "📩 Verify your email - Misbah App",
    "otp",
    { name, otp },
    true
  );

  auditLogger(user._id, "User registered");
  return { 
    message: "User registered! OTP sent to email.", 
    expiresAt: otpExpiry.getTime()  //  timestamp in ms
  };
};

/* ======================================================
   RESEND ACCOUNT OTP SERVICE
====================================================== */
export const resendAccountOtpService = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  if (user.isAccountVerified) throw new Error("Account already verified");

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY);

  user.verifyOtp = otp;
  user.verifyOtpExpiredAt = otpExpiry;
  await user.save();

  console.log("📩 [RESEND ACCOUNT OTP]:", otp);

  await sendEmail(
    user.email,
    "📩 Resend OTP - Misbah App",
    "otp",
    { name: user.name, otp },
    true
  );

  auditLogger(user._id, "Resent account OTP");
  return { message: "New OTP sent to email", expiresAt: otpExpiry.getTime() };
};

/* ======================================================
   VERIFY ACCOUNT OTP SERVICE
====================================================== */
export const verifyAccountOtpService = async ({ email, otp }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const now = new Date();
  if (!user.verifyOtp || !user.verifyOtpExpiredAt || user.verifyOtpExpiredAt.getTime() < now.getTime()) {
    throw new Error("OTP expired");
  }
  if (user.verifyOtp !== otp) throw new Error("Invalid OTP");

  user.isAccountVerified = true;
  user.verifyOtp = null;
  user.verifyOtpExpiredAt = null;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);

  await sendEmail(
    user.email,
    " Account Verified - Misbah App",
    "verified",
    { name: user.name },
    true
  );

  auditLogger(user._id, "Account OTP verified");
  return { user, accessToken, refreshToken };
};

/* ======================================================
   LOGIN SERVICE
====================================================== */
export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  if (!user.isAccountVerified) throw new Error("Account not verified. Verify OTP first.");

  const { accessToken, refreshToken } = generateTokens(user._id);

  auditLogger(user._id, "User logged in");
  return { user, accessToken, refreshToken };
};

/* ======================================================
   FORGOT PASSWORD SERVICE
====================================================== */
export const forgotPasswordService = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY);

  user.resetOtp = otp;
  user.resetOtpExpiredAt = otpExpiry;
  await user.save();

  console.log("📩 [FORGOT] Generated Reset OTP:", otp);

  await sendEmail(
    user.email,
    "🔑 Reset Password - Misbah App",
    "reset",
    { name: user.name, otp },
    true
  );

  auditLogger(user._id, "Reset password requested");
  return { message: "Reset OTP sent to email", expiresAt: otpExpiry.getTime() };
};

/* ======================================================
   RESEND RESET OTP SERVICE
====================================================== */
export const resendResetOtpService = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY);

  user.resetOtp = otp;
  user.resetOtpExpiredAt = otpExpiry;
  await user.save();

  console.log("📩 [RESEND RESET OTP]:", otp);

  await sendEmail(
    user.email,
    "🔑 Resend Reset OTP - Misbah App",
    "reset",
    { name: user.name, otp },
    true
  );

  auditLogger(user._id, "Resent reset OTP");
  return { message: "New reset OTP sent to email", expiresAt: otpExpiry.getTime() };
};

/* ======================================================
   VERIFY RESET OTP SERVICE
====================================================== */
export const verifyResetOtpService = async ({ email, otp }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const now = new Date();
  if (!user.resetOtp || !user.resetOtpExpiredAt || user.resetOtpExpiredAt.getTime() < now.getTime()) {
    throw new Error("OTP expired");
  }
  if (user.resetOtp !== otp) throw new Error("Invalid OTP");

  auditLogger(user._id, "Reset OTP verified");
  return { message: "Reset OTP verified successfully", user };
};

/* ======================================================
   RESET PASSWORD SERVICE
====================================================== */
export const resetPasswordService = async ({ email, otp, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const now = new Date();
  if (!user.resetOtp || !user.resetOtpExpiredAt || user.resetOtpExpiredAt.getTime() < now.getTime()) {
    throw new Error("OTP expired");
  }
  if (user.resetOtp !== otp) throw new Error("Invalid OTP");

  if (!validatePassword(password)) {
    throw new Error("Password must be 8+ chars with uppercase, lowercase, number, and special character");
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetOtp = null;
  user.resetOtpExpiredAt = null;
  await user.save();

  await sendEmail(
    user.email,
    "🔒 Password Changed Successfully - Misbah App",
    "passwordChanged",
    { name: user.name },
    true
  );

  auditLogger(user._id, "Password reset successfully");
  return { message: "Password reset successfully" };
};

/* ======================================================
   REFRESH ACCESS TOKEN SERVICE
====================================================== */
export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) throw new Error("No refresh token provided");

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { accessToken } = generateTokens(decoded.id);
    return { accessToken };
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
};
