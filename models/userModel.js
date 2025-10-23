// models/userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    isAccountVerified: { type: Boolean, default: false },

    // OTP fields
    verifyOtp: { type: String },
    verifyOtpExpiredAt: { type: Date },
    resetOtp: { type: String },
    resetOtpExpiredAt: { type: Date },

    // Array of todos
    todos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Todo" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
