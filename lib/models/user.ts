// lib/models/user.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    clerkUserId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    slug: { type: String, unique: true }, // ✅ add this
    role: { type: String, enum: ["admin", "seller", "buyer"], default: "seller" },
    createdAt: { type: Date, default: Date.now },
});


export const User = mongoose.models.User || mongoose.model("User", UserSchema);
