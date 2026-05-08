import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/user", authMiddleware, getUserOrders);
router.get("/admin/all", getAllOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id", updateOrderStatus);

export default router;
