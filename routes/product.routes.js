import express from "express";
import auth from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin-only routes
router.post("/", auth, upload.array("images", 5), createProduct);
router.patch("/:id", auth, upload.array("images", 5), updateProduct);
router.delete("/:id", auth, deleteProduct);

export default router;
