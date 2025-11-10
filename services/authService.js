import User from "../models/userModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/nodemailer.js";
import { validatePassword } from "../utils/passwordValidator.js";
import { auditLogger } from "../utils/auditLogger.js";
import { generateTokens } from "../utils/generateToken.js";

const OTP_EXPIRY = 10 * 60 * 1000; // 10 min
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ----------------- Helper: Persist Refresh Token -----------------
const persistRefreshToken = async ({
  token,
  userId,
  ip = "N/A",
  userAgent = "N/A",
}) => {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);
  return await RefreshToken.create({
    token,
    user: userId,
    createdByIp: ip,
    userAgent,
    expiresAt,
  });
};

// ----------------- REGISTER -----------------
export const registerService = async (
  { name, email, password, role = "User" },
  creator = null
) => {
  const lowerEmail = email.toLowerCase();
  if (await User.findOne({ email: lowerEmail }))
    throw new Error("User already exists");

  const allowedRoles = ["Admin", "Manager", "User"];
  if (!allowedRoles.includes(role)) throw new Error("Invalid role");

  // Role assignment rules
  if (role !== "User") {
    if (!creator || creator.role !== "Admin")
      throw new Error("Only Admin can assign Admin/Manager roles");
  }
  if (creator && creator.role === "Manager" && role !== "User")
    throw new Error("Manager can only create User accounts");

  if (!validatePassword(password))
    throw new Error("Password does not meet complexity requirements");

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY);

  const user = await User.create({
    name,
    email: lowerEmail,
    password: hashedPassword,
    role,
    isAccountVerified: false,
    verifyOtp: otp,
    verifyOtpExpiredAt: otpExpiry,
    createdBy: creator ? creator._id : null,
  });

  await sendEmail(
    lowerEmail,
    "Verify Email - Task Management",
    "otp",
    { name, otp },
    true
  );
  auditLogger(user._id, `Registered by ${creator ? creator.role : "self"}`);

  return {
    message: `User registered as ${role}. OTP sent to email.`,
    expiresAt: otpExpiry.getTime(),
  };
};

// ----------------- VERIFY ACCOUNT OTP -----------------
export const verifyAccountOtpService = async (
  { email, otp },
  ip = null,
  userAgent = null
) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const now = new Date();
  if (
    !user.verifyOtp ||
    !user.verifyOtpExpiredAt ||
    user.verifyOtpExpiredAt < now
  )
    throw new Error("OTP expired");
  if (user.verifyOtp !== otp) throw new Error("Invalid OTP");

  user.isAccountVerified = true;
  user.verifyOtp = null;
  user.verifyOtpExpiredAt = null;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  await persistRefreshToken({
    token: refreshToken,
    userId: user._id,
    ip,
    userAgent,
  });

  await sendEmail(
    user.email,
    "Account Verified",
    "verified",
    { name: user.name },
    true
  );
  auditLogger(user._id, "Account verified via OTP");

  return { user, accessToken, refreshToken };
};

// ----------------- LOGIN -----------------
export const loginService = async (
  { email, password },
  ip = null,
  userAgent = null
) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("Invalid credentials");

  if (!(await bcrypt.compare(password, user.password)))
    throw new Error("Invalid credentials");
  if (!user.isAccountVerified) throw new Error("Account not verified");

  const { accessToken, refreshToken } = generateTokens(user._id);
  await persistRefreshToken({
    token: refreshToken,
    userId: user._id,
    ip,
    userAgent,
  });
  auditLogger(user._id, "User logged in");

  return { user, accessToken, refreshToken };
};

// ----------------- LOGOUT -----------------
export const logoutService = async (refreshToken) => {
  if (!refreshToken) throw new Error("Refresh token missing");
  const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
  if (tokenDoc) {
    tokenDoc.revoked = true;
    tokenDoc.revokedAt = new Date();
    await tokenDoc.save();
  }
  return { success: true };
};

// ----------------- REFRESH TOKEN -----------------
export const refreshAccessTokenService = async (
  oldRefreshToken,
  ip = null,
  userAgent = null
) => {
  if (!oldRefreshToken) throw new Error("No refresh token provided");

  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const userId = decoded.id;
  const { accessToken, refreshToken } = generateTokens(userId);

  await RefreshToken.findOneAndUpdate(
    { token: oldRefreshToken },
    { revoked: true, revokedAt: new Date(), replacedByToken: refreshToken }
  );
  await persistRefreshToken({ token: refreshToken, userId, ip, userAgent });
  auditLogger(userId, "Refresh token rotated");

  return { accessToken, refreshToken };
};

// ----------------- PASSWORD RESET -----------------
export const forgotPasswordService = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY);
  user.resetOtp = otp;
  user.resetOtpExpiredAt = otpExpiry;
  await user.save();

  await sendEmail(
    user.email,
    "Reset Password OTP",
    "reset",
    { name: user.name, otp },
    true
  );
  auditLogger(user._id, "Reset password requested");

  return { message: "Reset OTP sent to email", expiresAt: otpExpiry.getTime() };
};

export const verifyResetOtpService = async ({ email, otp }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const now = new Date();
  if (!user.resetOtp || !user.resetOtpExpiredAt || user.resetOtpExpiredAt < now)
    throw new Error("OTP expired");
  if (user.resetOtp !== otp) throw new Error("Invalid OTP");

  auditLogger(user._id, "Reset OTP verified");
  return { message: "Reset OTP verified", user };
};

export const resetPasswordService = async ({ email, otp, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const now = new Date();
  if (!user.resetOtp || !user.resetOtpExpiredAt || user.resetOtpExpiredAt < now)
    throw new Error("OTP expired");
  if (user.resetOtp !== otp) throw new Error("Invalid OTP");

  if (!validatePassword(password))
    throw new Error("Password must meet complexity requirements");

  user.password = await bcrypt.hash(password, 10);
  user.resetOtp = null;
  user.resetOtpExpiredAt = null;
  await user.save();

  await sendEmail(
    user.email,
    "Password Changed",
    "passwordChanged",
    { name: user.name },
    true
  );
  auditLogger(user._id, "Password reset successfully");

  return { message: "Password reset successfully" };
};

// ----------------- RESEND OTPS -----------------
export const resendAccountOtpService = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");
  if (user.isAccountVerified) throw new Error("Account already verified");

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY);
  user.verifyOtp = otp;
  user.verifyOtpExpiredAt = otpExpiry;
  await user.save();

  await sendEmail(
    user.email,
    "Resend Account OTP",
    "otp",
    { name: user.name, otp },
    true
  );
  auditLogger(user._id, "Account OTP resent");

  return { message: "Account OTP resent", expiresAt: otpExpiry.getTime() };
};

export const resendResetOtpService = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY);
  user.resetOtp = otp;
  user.resetOtpExpiredAt = otpExpiry;
  await user.save();

  await sendEmail(
    user.email,
    "Resend Reset OTP",
    "reset",
    { name: user.name, otp },
    true
  );
  auditLogger(user._id, "Reset OTP resent");

  return { message: "Reset OTP resent", expiresAt: otpExpiry.getTime() };
};
