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

// @desc    Get own profile
export const getOwnProfile = async (req, res) => {
  try {
    res.status(200).json({ data: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update own profile
export const updateOwnProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const updates = { name: req.body.name, phone: req.body.phone };
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Profile updated", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete own account
export const deleteOwnAccount = async (req, res) => {
  try {
    const user = req.user;

    // Cleanup if user is a doctor

    await User.findByIdAndDelete(user._id);
    res.clearCookie("token");
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
