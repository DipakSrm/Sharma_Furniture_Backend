import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
export const getAllCategories = async (req, res) => {
  try {

    const categories = await Category.find();
    if (!categories || categories.length === 0)
      return res.status(404).json({ message: "No categories found" });
for(const category of categories){
  const products = await Product.find({ categoryId: category._id });
  if(products && products.length<0) return 
   await Category.findByIdAndUpdate(
    category._id,
    { ref_image: products[0].images[0], count: products.length },
    {
      new: true,
      runValidators: true,
    }
  );
}

    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json({ data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const { name, slug, description } = req.body;
    if (!name || !slug)
      return res.status(400).json({ message: "Name and slug are required" });

    const existing = await Category.findOne({ slug });
    if (existing)
      return res.status(400).json({ message: "Slug already exists" });

    const category = await Category.create({ name, slug, description });
    res.status(201).json({ message: "Category created", data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedCategory)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category updated", data: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
