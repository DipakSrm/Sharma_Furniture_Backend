import User from "../models/user.model.js";
import { validationResult } from "express-validator";

// @desc    Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({ role: "user" });
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfileById = async (req, res) => {
  try {
    const user = req.user; // This is set by the auth middleware

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optionally exclude sensitive fields
    const { passwordHash, ...userData } = user.toObject();
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Update user profile by ID (admin or own)
export const updateUserProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if requester is admin or the same user
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile updated", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account by ID (admin or own)
export const deleteUserAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if requester is admin or the same user
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: Clear cookie only if deleting own account
    if (req.user._id.toString() === id) {
      res.clearCookie("token");
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
