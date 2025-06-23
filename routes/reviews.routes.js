import express from "express";
import auth from "../middleware/auth.js";
import {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.js";

const router = express.Router();

router.use(auth); // All routes protected

// User adds a review
router.post("/", createReview);

// Get reviews for a specific product
router.get("/product/:productId", getProductReviews);

// Admin gets all reviews
router.get("/", getAllReviews);

// User updates their review
router.patch("/:id", updateReview);

// User or Admin deletes a review
router.delete("/:id", deleteReview);

export default router;
