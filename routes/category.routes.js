import express from "express";
import auth from "../middleware/auth.js";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin-only routes
router.post("/", auth, createCategory);
router.patch("/:id", auth, updateCategory);
router.delete("/:id", auth, deleteCategory);

export default router;
