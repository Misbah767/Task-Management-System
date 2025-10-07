import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const userAuth = async (req, res, next) => {
  try {
    // Only look at Authorization header for access token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    req.user = user; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: " + err.message });
  }
};
