// lib/models/product.ts
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    zipUrl: String,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
