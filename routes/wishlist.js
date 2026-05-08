import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
