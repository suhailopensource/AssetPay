// app/api/buyer/dashboard/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { User } from "@/lib/models/user";

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const orders = await Order.find({ buyerEmail: user.email, paid: true })
        .populate("product")
        .lean();

    const purchases = orders
        .filter((o) => o.product !== null) // Filter out orders with deleted/missing products
        .map((o) => ({
            orderId: o.orderId,
            amount: o.amount,
            purchasedAt: o.createdAt,
            product: {
                id: o.product._id,
                name: o.product.name,
                description: o.product.description,
                price: o.product.price,
                zipUrl: o.product.zipUrl,
            },
        }));

    return NextResponse.json({ success: true, purchases });
}
