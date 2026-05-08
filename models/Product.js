import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    brand: String,
    category: String,
    thumbnail: String,
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
