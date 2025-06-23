import express from "express";
import auth from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();
router.use(auth); // All cart operations require login

router.get("/", getCart); // GET user cart
router.post("/", addToCart); // ADD item to cart
router.patch("/:productId", updateCartItem); // UPDATE quantity of specific product
router.delete("/:productId", removeCartItem); // REMOVE one item
router.delete("/", clearCart); // CLEAR entire cart

export default router;
