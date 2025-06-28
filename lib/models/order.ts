// lib/models/order.ts
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    buyerEmail: String,
    amount: Number,
    paid: { type: Boolean, default: false },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
});

export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
