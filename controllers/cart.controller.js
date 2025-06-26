import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
// Get logged-in user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );
    res.json({ data: cart || { items: [] } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart (or create cart)
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [{ productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        const updatedQuantity = cart.items[itemIndex].quantity + quantity;

        if (product.stock < updatedQuantity) {
          return res
            .status(400)
            .json({ message: "Insufficient stock for requested quantity" });
        }

        cart.items[itemIndex].quantity = updatedQuantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    // Recalculate total
    let total = 0;
    for (const item of cart.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        total += prod.price * item.quantity;
      }
    }

    cart.total = total;
    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ message: "Item added to cart", data: cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update quantity of a product in cart
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;

    // Recalculate total
    let total = 0;
    for (const item of cart.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        total += prod.price * item.quantity;
      }
    }

    cart.total = total;
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Cart updated", data: cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemExists = cart.items.some(
      (item) => item.productId.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Recalculate total
    let total = 0;
    for (const item of cart.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        total += prod.price * item.quantity;
      }
    }

    cart.total = total;
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Item removed from cart", data: cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
