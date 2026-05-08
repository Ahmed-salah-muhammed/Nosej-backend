import Wishlist from "../models/wishlist.js";
import Product from "../models/Product.js";

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.userId;
    const wishlist = await Wishlist.findOne({ user: userId }).populate(
      "products"
    );

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        products: [],
      });
    }

    res.status(200).json({
      success: true,
      products: wishlist.products,
    });
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [productId],
      });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    await wishlist.populate("products");

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();

    await wishlist.populate("products");

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (err) {
    next(err);
  }
};
