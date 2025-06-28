import express from "express";
import auth from "../middleware/auth.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

router.use(auth);

// Users create order
router.post("/", createOrder);

// Users get their order history
router.get("/my-orders", getUserOrders);

// Admin gets all orders
router.get("/", getAllOrders);

// Get order details (user can get own order, admin can get any)
router.get("/:id", getOrderById);

// Admin update order status
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/payment", updatePaymentStatus);


// Users can cancel their own orders if needed
router.patch("/:id/cancel", cancelOrder);

export default router;
