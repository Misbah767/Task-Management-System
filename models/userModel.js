import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "Manager", "User"],
      default: "User",
    },
    isAccountVerified: { type: Boolean, default: false },
    verifyOtp: { type: String },
    verifyOtpExpiredAt: { type: Date },
    resetOtp: { type: String },
    resetOtpExpiredAt: { type: Date },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// For quick email lookup
userSchema.index({ email: 1 });

export default mongoose.model("User", userSchema);
