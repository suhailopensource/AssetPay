// /app/api/seller/payments/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { User } from "@/lib/models/user";

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const seller = await User.findOne({ clerkUserId: userId });
    if (!seller || seller.role !== "seller") return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const orders = await Order.find({ seller: seller._id, paid: true })
        .populate("product").sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
}
