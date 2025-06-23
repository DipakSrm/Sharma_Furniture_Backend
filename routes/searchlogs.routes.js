import express from "express";
import auth from "../middleware/auth.js";
import {
  logSearch,
  getUserSearchLogs,
  getAllSearchLogs,
  clearUserSearchLogs,
} from "../controllers/searchlogs.controller.js";

const router = express.Router();

router.use(auth); // All routes protected

// Log new search (user)
router.post("/", logSearch);

// Get user's own search history
router.get("/my-logs", getUserSearchLogs);

// Admin get all search logs
router.get("/", getAllSearchLogs);

// Clear user's own search logs
router.delete("/", clearUserSearchLogs);

export default router;
