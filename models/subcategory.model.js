import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
});

export const Subcategory = mongoose.model("Subcategory", subcategorySchema);
