import Cart from "../models/cart.js";
import Product from "../models/Product.js";

export const getCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        items: [],
        totalPrice: 0,
      });
    }

    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      items: cart.items,
      totalPrice,
    });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity, price: product.price }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, price: product.price });
      }
      await cart.save();
    }

    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();

    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    item.quantity = quantity;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    }

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (err) {
    next(err);
  }
};
