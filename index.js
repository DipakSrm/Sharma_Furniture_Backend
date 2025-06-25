import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import { config as configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import addressRoutes from "./routes/address.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import productRoutes from "./routes/product.routes.js"
import subCategoryRoutes from "./routes/subCategory.routes.js"
import searchLogsRoutes from "./routes/searchlogs.routes.js"
import reviewRoutes from "./routes/reviews.routes.js";
import orderRoutes from "./routes/order.routes.js";
import categoryRoutes from "./routes/category.routes.js";


const app = express();
app.use(cookieParser());
configDotenv();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:8080", // Frontend origin
    credentials: true, // Allow cookies
  })
);

app.use(helmet());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/subcategories", subCategoryRoutes);
app.use("/api/v1/searchlogs", searchLogsRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/categories", categoryRoutes);



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});