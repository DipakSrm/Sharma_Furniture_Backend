import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  brand: { type: String, trim: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
  price: { type: Number, required: true, min: 0 },
  previousPrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  variants: [{ color: String, size: String, stock: Number }],
  images: [{ type: String }],
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Product = mongoose.model("Product", productSchema);
