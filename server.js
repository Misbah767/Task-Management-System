import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

// CORS for Vite frontend
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // 🔹 frontend URL
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => res.send("🚀 API Server running..."));

// Mount Auth routes
app.use("/api/auth", authRoutes);

// Mount User routes (protected)
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ DB connection failed:", err));
