import mongoose from "mongoose";

const SellerStatsSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    totalRevenue: { type: Number, default: 0 },
    netEarnings: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    totalBuyers: { type: Number, default: 0 },
}, { timestamps: true });

export const SellerStats = mongoose.models.SellerStats || mongoose.model("SellerStats", SellerStatsSchema);
