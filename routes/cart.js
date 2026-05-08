import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateCart);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

export default router;
