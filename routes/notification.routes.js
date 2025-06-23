import express from "express";
import auth from "../middleware/auth.js";
import {
  getUserNotifications,
  markAsRead,
  deleteNotification,
  clearNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(auth); // All routes require login

router.get("/", getUserNotifications); // Get logged-in user's notifications
router.patch("/:id/read", markAsRead); // Mark specific notification as read
router.delete("/:id", deleteNotification); // Delete specific notification
router.delete("/", clearNotifications); // Delete all notifications

export default router;
