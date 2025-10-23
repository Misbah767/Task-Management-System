import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();
router.get("/profile", userAuth, getUserProfile);
router.put("/profile", userAuth, updateUserProfile);

export default router;
