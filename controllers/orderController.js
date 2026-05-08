import Order from "../models/Order.js";
import Cart from "../models/cart.js";

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const order = await Order.create({
      user: userId,
      items: cart.items,
      totalPrice,
      shippingAddress,
      status: "pending",
    });

    await cart.deleteOne();

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ user: userId }).populate("items.product");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("items.product");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};
