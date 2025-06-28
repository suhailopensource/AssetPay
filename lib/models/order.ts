import mongoose from "mongoose";
const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    buyerEmail: String,
    paid: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
