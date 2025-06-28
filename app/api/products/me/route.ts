// app/api/products/me/route.ts
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/product";
import { User } from "@/lib/models/user";
import { Order } from "@/lib/models/order";
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
        const productIds = products.map((p) => p._id);

        const orders = await Order.find({
            product: { $in: productIds },
            paid: true,
        }).lean();

        const enriched = products.map((product) => {
            const buyers = orders.filter((o) => o.product.toString() === product._id.toString());
            const revenue = buyers.reduce((acc, o) => acc + (product.price || 0), 0);
            return {
                ...product,
                buyers,
                buyerCount: buyers.length,
                revenue,
            };
        });

        const totalRevenue = enriched.reduce((acc, p) => acc + p.revenue, 0);

        return NextResponse.json({
            success: true,
            products: enriched,
            sellerName: user.firstName || "seller",
            totalRevenue,
        });
    } catch (err) {
        console.error("GET /api/products/me error:", err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
