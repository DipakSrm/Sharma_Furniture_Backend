import express from "express";
import auth from "../middleware/auth.js";
import { body } from "express-validator";
import {
  getAllUsers,
  getUserProfileById,
  updateUserProfileById,
  deleteUserAccountById,
} from "../controllers/user.controller.js";

const router = express.Router();

// Admin only
router.get("/", auth, getAllUsers);

// Access, update, delete user profile by id (admin or user)
router.get("/me", auth, getUserProfileById);

router.patch(
  "/me/:id",
  auth,
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().isMobilePhone().withMessage("Invalid phone"),
  ],
  updateUserProfileById
);

router.delete("/me/:id", auth, deleteUserAccountById);

export default router;
