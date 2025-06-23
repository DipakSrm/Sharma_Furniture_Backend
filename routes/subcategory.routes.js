import express from "express";
import auth from "../middleware/auth.js";
import {
  getAllSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/subcategory.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllSubcategories);
router.get("/:id", getSubcategoryById);

// Admin-only routes
router.post("/", auth, createSubcategory);
router.patch("/:id", auth, updateSubcategory);
router.delete("/:id", auth, deleteSubcategory);

export default router;
