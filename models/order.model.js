import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: Number,
    },
  ],
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    name: String,
    phone: String,
    addressLine: String,
    city: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: { type: String, required: true, enum: ["COD", "Khalti"],default:"COD" },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentToken:{type: String, default: null}, //for khalti payment confirmation
  placedAt: { type: Date, default: Date.now },
  deliveredAt: Date,
});

export const Order = mongoose.model("Order", orderSchema);
