import express from "express";
import axios from "axios";
import auth from "../middleware/auth.js";
import { Order } from "../models/order.model.js";

const router = express.Router();

router.post("/khalti/initiate", auth, async (req, res) => {
  const {
    return_url,
    website_url,
    amount,
    purchase_order_id,
    purchase_order_name,
  } = req.body;

  try {
    const khaltiResponse = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        return_url,
        website_url,
        amount,
        purchase_order_id,
        purchase_order_name,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key 586a82b6520247829bb345194b8cbd00`,
        },
      }
    );
    if(khaltiResponse.status === 200) {
      console.log("Khalti Payment Initiated Successfully",khaltiResponse.data);
     await  Order.findByIdAndUpdate(
        purchase_order_id,
        {
          paymentToken: khaltiResponse.data.pidx,
          paymentStatus: "pending",
        },
        { new: true }
      );
      res.status(200).json(khaltiResponse.data);
    }

    
  } catch (error) {
    console.error("Khalti Error", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to initiate Khalti payment",
      error: error.message,
    });
  }
});

export default router;
