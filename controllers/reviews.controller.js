import { Review } from "../models/reviews.model.js";

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { productId, title, comment } = req.body;

    if (!productId || !title || !comment)
      return res.status(400).json({ message: "All fields required" });

    // Prevent duplicate review by same user
    const existing = await Review.findOne({ userId: req.user._id, productId });
    if (existing)
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });

    const review = await Review.create({
      userId: req.user._id,
      productId,
      title,
      comment,
    });

    res.status(201).json({ message: "Review submitted", data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    res.json({ data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin gets all reviews
export const getAllReviews = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User updates their review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    const { title, comment } = req.body;

    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();
    res.json({ message: "Review updated", data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User deletes own review OR admin deletes any
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (
      review.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
