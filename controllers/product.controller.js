import { Product } from "../models/product.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import fs from "fs/promises";

// @desc    Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId subcategoryId");
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categoryId subcategoryId"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const {
      name,
      slug,
      description,
      brand,
      categoryId,
      subcategoryId,
      price,
      previousPrice,
      stock,
      variants,
      tags,
      isFeatured,
      isTrending,
    } = req.body;

    const images = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.path);
      if (url) images.push(url);
      await fs.unlink(file.path); // Cleanup local temp file
    }

    const product = await Product.create({
      name,
      slug,
      description,
      brand,
      categoryId,
      subcategoryId,
      price,
      previousPrice,
      stock,
      variants: JSON.parse(variants || "[]"),
      tags: JSON.parse(tags || "[]"),
      isFeatured,
      isTrending,
      images,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const updatedData = { ...req.body };
    if (updatedData.variants)
      updatedData.variants = JSON.parse(updatedData.variants);
    if (updatedData.tags) updatedData.tags = JSON.parse(updatedData.tags);

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.files && req.files.length > 0) {
      const images = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path);
        if (url) images.push(url);
        await fs.unlink(file.path);
      }
      updatedData.images = images;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );
    res.json({ message: "Product updated", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
