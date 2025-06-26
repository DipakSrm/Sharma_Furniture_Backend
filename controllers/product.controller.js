import { features } from "process";
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


// @desc    Create new product (Admin only)
export const createProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const {
      name,
      slug,
      description,
      features,
      dimensions,
      materials,
      categoryId,
      subcategoryId,
      price,
      previousPrice,
      stock,
      tags,
      isFeatured,
      isTrending,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !slug ||
      !description ||
      !features ||
      !dimensions ||
      !materials ||
      !categoryId ||
      !price ||
      !stock
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate dimensions object
    let parsedDimensions = dimensions;
    if (typeof dimensions === "string") {
      parsedDimensions = JSON.parse(dimensions);
    }
    if (
      !parsedDimensions.length ||
      !parsedDimensions.width ||
      !parsedDimensions.height ||
      parsedDimensions.length < 0 ||
      parsedDimensions.width < 0 ||
      parsedDimensions.height < 0
    ) {
      return res.status(400).json({ message: "Invalid dimensions" });
    }

    // Parse array fields if they are strings
    const parsedFeatures =
      typeof features === "string" ? JSON.parse(features) : features;
    const parsedMaterials =
      typeof materials === "string" ? JSON.parse(materials) : materials;
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags || [];
    const parsedVariants = req.body.variants
      ? typeof req.body.variants === "string"
        ? JSON.parse(req.body.variants)
        : req.body.variants
      : [];

    const images = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path);
        if (url) images.push(url);
        await fs.unlink(file.path); // Cleanup local temp file
      }
    }

    const product = await Product.create({
      name,
      slug,
      description,
      features: parsedFeatures,
      dimensions: parsedDimensions,
      materials: parsedMaterials,
      categoryId,
      subcategoryId,
      price,
      previousPrice,
      stock,
      variants: parsedVariants,
      tags: parsedTags,
      isFeatured: isFeatured || false,
      isTrending: isTrending || false,
      images,
      ratingAverage: 0,
      ratingCount: 0,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("Create product error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


export const searchAndFilterProducts = async (req, res) => {
  try {
    const {
      search, // Search term for product name
      sortBy, // Sort options: 'price_asc', 'price_desc', 'name_asc', 'name_desc', 'rating_desc'
      category, // Filter by category name
      subcategory, // Filter by subcategory name
      minPrice, // Minimum price filter
      maxPrice, // Maximum price filter
      page = 1, // Pagination
      isFeatured, // Filter for featured products
      isTrending, // Filter for trending products
      limit = 12, // Items per page
    } = req.query;

    // Build the aggregation pipeline
    let pipeline = [
      // Lookup subcategory and category data
      {
        $lookup: {
          from: "subcategories", // Adjust collection name as needed
          localField: "subcategoryId",
          foreignField: "_id",
          as: "subcategory",
        },
      },
      {
        $lookup: {
          from: "categories", // Adjust collection name as needed
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      // Unwind the arrays from lookup
      {
        $unwind: {
          path: "$subcategory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Build match conditions
    let matchConditions = {};

    // Search by product name (case-insensitive)
    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    // Filter by category name
    if (category) {
      matchConditions["category.name"] = {
        $regex: category,
        $options: "i",
      };
    }

    // Filter by subcategory name
    if (subcategory) {
      matchConditions["subcategory.name"] = {
        $regex: subcategory,
        $options: "i",
      };
    }

    // Filter for featured products
    if (isFeatured && (isFeatured === "true" || isFeatured === true)) {
      matchConditions.isFeatured = true;
    }

    // Filter for trending products
    if (isTrending && (isTrending === "true" || isTrending === true)) {
      matchConditions.isTrending = true;
    }

    // Price range filters
    if (minPrice || maxPrice) {
      matchConditions.price = {};
      if (minPrice) {
        matchConditions.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        matchConditions.price.$lte = parseFloat(maxPrice);
      }
    }

    // Add match stage if there are conditions
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({
        $match: matchConditions,
      });
    }

    // Build sort conditions
    let sortConditions = {};

    switch (sortBy) {
      case "price_asc":
        sortConditions.price = 1;
        break;
      case "price_desc":
        sortConditions.price = -1;
        break;
      case "name_asc":
        sortConditions.name = 1;
        break;
      case "name_desc":
        sortConditions.name = -1;
        break;
      case "rating_desc":
        sortConditions.ratingAverage = -1;
        sortConditions.ratingCount = -1; // Secondary sort by rating count
        break;
      case "featured":
        sortConditions.isFeatured = -1; // Featured products first
        sortConditions.createdAt = -1; // Then by newest
        break;
      case "trending":
        sortConditions.isTrending = -1; // Trending products first
        sortConditions.createdAt = -1; // Then by newest
        break;
      default:
        sortConditions.createdAt = -1; // Default sort by newest first
    }

    // Add sort stage
    pipeline.push({
      $sort: sortConditions,
    });

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Add pagination stages
    pipeline.push({
      $facet: {
        products: [{ $skip: skip }, { $limit: parseInt(limit) }],
        totalCount: [{ $count: "count" }],
      },
    });

    // Execute the aggregation
    const result = await Product.aggregate(pipeline); // Adjust model name as needed

    const products = result[0].products;
    const totalProducts = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    // Prepare response
    const response = {
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit),
        },
        filters: {
          search: search || null,
          sortBy: sortBy || "newest",
          category: category || null,
          subcategory: subcategory || null,
          priceRange: {
            min: minPrice ? parseFloat(minPrice) : null,
            max: maxPrice ? parseFloat(maxPrice) : null,
          },
          isFeatured: isFeatured ? isFeatured === "true" : false,
          isTrending: isTrending ? isTrending === "true" : false,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Search and filter error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching and filtering products",
      error: error.message,
    });
  }
};


// @desc    Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const updatedData = { ...req.body };

    // Parse JSON strings for array/object fields
    if (updatedData.features)
      updatedData.features = JSON.parse(updatedData.features);
    if (updatedData.dimensions) {
      const dimensions = JSON.parse(updatedData.dimensions);
      if (
        dimensions.length < 0 ||
        dimensions.width < 0 ||
        dimensions.height < 0
      ) {
        return res.status(400).json({ message: "Invalid dimensions" });
      }
      updatedData.dimensions = dimensions;
    }
    if (updatedData.materials)
      updatedData.materials = JSON.parse(updatedData.materials);
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

    // Prevent updating rating fields directly
    delete updatedData.ratingAverage;
    delete updatedData.ratingCount;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...updatedData, updatedAt: Date.now() },
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
