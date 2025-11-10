import dotenv from "dotenv";
dotenv.config();
import connectDB from "../config/mongodb.js"; // tumhara connectDB file
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@example.com";
    const adminPassword = "Admin@123"; // plain password

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = await User.create({
        name: "Seed Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "Admin",
        isAccountVerified: true,
      });
      console.log("✅ Seed Admin created:", admin.email);
      console.log("💡 Use this password to login:", adminPassword);
    } else {
      console.log("⚠ Admin already exists:", adminEmail);
      console.log("💡 Use this password to login:", adminPassword);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
