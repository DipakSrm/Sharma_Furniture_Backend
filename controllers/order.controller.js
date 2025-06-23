import { Order } from "../models/order.model.js";

// Create new order (user only)
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order items required" });

    if (!totalAmount || !paymentMethod)
      return res
        .status(400)
        .json({ message: "Total amount and payment method required" });

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    res.status(201).json({ message: "Order placed", data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders of logged-in user (order history)
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      placedAt: -1,
    });
    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID (user can only access own order, admin any)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // If user is not admin, check ownership
    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin get all orders
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const orders = await Order.find().sort({ placedAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin update order status
export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const { status } = req.body;
    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;

    // Set deliveredAt date if status is delivered
    if (status === "delivered") {
      order.deliveredAt = new Date();
    } else {
      order.deliveredAt = undefined;
    }

    await order.save();

    res.json({ message: "Order status updated", data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User cancel own order (only if pending or processing)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!["pending", "processing"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Cannot cancel order at this stage" });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled", data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
