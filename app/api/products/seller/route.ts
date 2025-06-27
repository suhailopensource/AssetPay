import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/product";
import { User } from "@/lib/models/user";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();

        const user = await User.findOne({ clerkUserId: userId });
        if (!user || user.role !== "seller") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const products = await Product.find({ seller: user._id }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, products });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
