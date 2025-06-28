import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/product";
import { User } from "@/lib/models/user";
import { SellerStats } from "@/lib/models/sellerStats";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, price, description, zipUrl } = await req.json();
        if (!name || !price || !description || !zipUrl)
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        await connectDB();

        const user = await User.findOne({ clerkUserId: userId });
        if (!user || user.role !== "seller")
            return NextResponse.json({ error: "Only sellers can create products" }, { status: 403 });

        const product = await Product.create({
            name,
            price,
            description,
            zipUrl,
            seller: user._id,
        });

        // ✅ Increment product count
        await SellerStats.findOneAndUpdate(
            { seller: user._id },
            { $inc: { totalProducts: 1 } },
            { upsert: true }
        );

        return NextResponse.json({ success: true, product });
    } catch (err) {
        console.error("Product creation failed:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
