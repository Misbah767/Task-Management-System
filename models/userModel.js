import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    isAccountVerified: { type: Boolean, default: false },

    verifyOtp: { type: String, default: null },
    verifyOtpExpiredAt: { type: Date, default: null },

    resetOtp: { type: String, default: null },
    resetOtpExpiredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
