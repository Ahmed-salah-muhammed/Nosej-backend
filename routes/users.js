import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/userController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/change-password", changePassword);
router.delete("/account", deleteAccount);

export default router;
