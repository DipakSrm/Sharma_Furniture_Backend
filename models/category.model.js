import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  ref_image: {
    type: String,
    required: true,
    trim: true,
    default:
      "https://res.cloudinary.com/dgzf4h7hn/image/upload/v1750871162/istockphoto-1415799772-612x612_hfqlhv.jpg",
  },
  count: { type: Number, default: 0 },
});

export const Category = mongoose.model("Category", categorySchema);
