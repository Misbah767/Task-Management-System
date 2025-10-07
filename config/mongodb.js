
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export default async function connectDB() {
  if (!process.env.MONGODB_URL) throw new Error("MONGODB_URL not set");

  try {
    await mongoose.connect(process.env.MONGODB_URL, { dbName: "authdb" });
    console.log("✅ MongoDB connected!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
