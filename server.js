import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import "./config/corn.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
dotenv.config();
const app = express();

// ----------------- CORS CONFIG -----------------
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://taskify-app-ten.vercel.app", // Vercel deployment
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy: This origin is not allowed - ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// ----------------- MIDDLEWARE -----------------
app.use(express.json());
app.use(cookieParser());

// ----------------- TEST ROUTE -----------------
app.get("/", (req, res) => res.send("🚀 API Server running..."));

// ----------------- MOUNT ROUTES -----------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes); // Task management routes

app.use("/api/reminder", reminderRoutes);
// ----------------- ERROR HANDLER -----------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// ----------------- START SERVER -----------------
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB connection failed:", err));
