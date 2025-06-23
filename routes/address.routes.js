import express from "express";
import auth from "../middleware/auth.js";
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";

const router = express.Router();

router.use(auth); // All routes protected

router.get("/", getAddresses); // Get all addresses of logged-in user
router.get("/:id", getAddressById); // Get single address of logged-in user by ID
router.post("/", createAddress); // Create new address for logged-in user
router.patch("/:id", updateAddress); // Update address by ID (own address)
router.delete("/:id", deleteAddress); // Delete address by ID (own address)

export default router;
