import { SearchLog } from "../models/searchLog.model.js";

// Log a search action
export const logSearch = async (req, res) => {
  try {
    const { query, filtersApplied } = req.body;

    if (!query)
      return res.status(400).json({ message: "Search query required" });

    const log = await SearchLog.create({
      userId: req.user._id,
      query,
      filtersApplied,
    });

    res.status(201).json({ message: "Search logged", data: log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in user's search history
export const getUserSearchLogs = async (req, res) => {
  try {
    const logs = await SearchLog.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin get all search logs
export const getAllSearchLogs = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const logs = await SearchLog.find().sort({ createdAt: -1 });
    res.json({ data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear user's own search history
export const clearUserSearchLogs = async (req, res) => {
  try {
    await SearchLog.deleteMany({ userId: req.user._id });
    res.json({ message: "Search history cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
