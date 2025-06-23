import { Subcategory } from "../models/subcategory.model.js";

export const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate("categoryId");
    res.json({ data: subcategories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate(
      "categoryId"
    );
    if (!subcategory)
      return res.status(404).json({ message: "Subcategory not found" });
    res.json({ data: subcategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubcategory = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const { name, slug, categoryId } = req.body;
    if (!name || !slug || !categoryId)
      return res
        .status(400)
        .json({ message: "Name, slug, and categoryId are required" });

    const existing = await Subcategory.findOne({ slug });
    if (existing)
      return res.status(400).json({ message: "Slug already exists" });

    const subcategory = await Subcategory.create({ name, slug, categoryId });
    res.status(201).json({ message: "Subcategory created", data: subcategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedSubcategory)
      return res.status(404).json({ message: "Subcategory not found" });

    res.json({ message: "Subcategory updated", data: updatedSubcategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const deleted = await Subcategory.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Subcategory not found" });

    res.json({ message: "Subcategory deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
