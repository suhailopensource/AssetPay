// app/api/products/me/route.ts
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/product";
import { User } from "@/lib/models/user";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ success: false }, { status: 401 });

        await connectDB();

        const user = await User.findOne({ clerkUserId: userId });
        if (!user || user.role !== "seller") {
            return NextResponse.json({ success: false }, { status: 403 });
        }

        const products = await Product.find({ seller: user._id }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({
            success: true,
            products,
            sellerName: user.firstName || "seller",
        });
    } catch (err) {
        console.error("GET /api/products/me error:", err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
