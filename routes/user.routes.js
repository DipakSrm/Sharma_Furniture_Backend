import express from "express";
import auth from "../middleware/auth.js";
import { body } from "express-validator";
import {
  getAllUsers,
  getOwnProfile,
  updateOwnProfile,
  deleteOwnAccount,
} from "../controllers/user.controller.js";

const router = express.Router();

// Admin only
router.get("/", auth, getAllUsers);

// Current user's routes
router.get("/me", auth, getOwnProfile);

router.patch(
  "/me",
  auth,
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().isMobilePhone().withMessage("Invalid phone"),
  ],
  updateOwnProfile
);

router.delete("/me", auth, deleteOwnAccount);

export default router;
