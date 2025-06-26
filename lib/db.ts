// lib/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
    throw new Error("Please add MONGODB_URI to your .env.local");
}

export async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    return mongoose.connect(MONGODB_URI);
}
export async function disconnectDB() {
    if (mongoose.connection.readyState === 0) return;

    return mongoose.disconnect();
}