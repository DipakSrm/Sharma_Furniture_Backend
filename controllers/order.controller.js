import axios from "axios";
import { Order } from "../models/order.model.js";
import {Product} from "../models/product.model.js";
// Create new order (user only)
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      paymentStatus,
      shippingAddress,
      paymentMethod,
    } = req.body;
let TotalAmountAccumulated = 0;
    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order items required" });

if (
  paymentMethod === "Khalti" &&
  paymentStatus &&
  paymentStatus == "completed" 
) {
  return res.status(400).json({ message: "Invalid Payment Status " });
}

for (const item of items) {
      const { productId, quantity } = item;
      if (!productId || !quantity)
        return res.status(400).json({ message: "Product ID and quantity required" });
      // Check if product exists and has enough stock
      const product = await Product
        .findById(productId)
        .select("stock");
      console.log(product);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      if (product.stock < quantity)
        return res.status(400).json({ message: `Insufficient stock for product ${productId}` });
      // Check if product stock is sufficient
    }

for (const item of items) {
  const { productId, quantity } = item;
  const product = await Product.findById(productId);
  if (product) {
    TotalAmountAccumulated += product.price * quantity;
    
  } 
}

const calculatedTotal = parseFloat((TotalAmountAccumulated * 1.13).toFixed(2));
const clientTotal = parseFloat(parseFloat(totalAmount).toFixed(2));

if (calculatedTotal !== clientTotal) {
  return res
    .status(400)
    .json({ message: "Total amount does not match the calculated amount" });
}


    if (!totalAmount || !paymentMethod || !shippingAddress)
      return res
        .status(400)
        .json({ message: "Total amount and payment method required and Shipping Address required" });

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount: TotalAmountAccumulated*1.13,
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
    const orders = await Order.find({ userId: req.user._id }).populate("items.productId").sort({
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
    const order = await Order.findById(req.params.id).populate("items.productId");

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
export const updatePaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
const paymentToken = req.body.paymentToken;
console.log("Payment Token Received:", paymentToken);
    if (order.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });


if(order.paymentToken !== paymentToken) {
  return res.status(400).json({ message: "Invalid payment token" });
}

try {
  const khaltiResponse = await axios.post(
    "https://dev.khalti.com/api/v2/epayment/lookup/",
    {
      pidx:paymentToken
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key 586a82b6520247829bb345194b8cbd00`,
      },
    }
  );
  if(khaltiResponse.status === 200 && khaltiResponse.data.status === "Completed") {
    console.log("Khalti Payment Confirmed Successfully",khaltiResponse.data);
    order.paymentStatus = "completed";
    await order.save();
    res.json({ message: "Order status updated", data: order });
  
  }
} catch (error) {
  console.log("Error in payment confirmation update", error);
  res.status(500).json({ message: "Payment confirmation failed" });
}


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
