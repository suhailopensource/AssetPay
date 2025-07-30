import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { SellerStats } from "@/lib/models/sellerStats";
import { User } from "@/lib/models/user";

export const dynamic = "force-dynamic";

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user || user.role !== "seller") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const stats = await SellerStats.findOne({ seller: user._id }) || {
        totalRevenue: 0,
        totalBuyers: 0,
        totalProducts: 0,
        netEarnings: 0
    };

    return NextResponse.json({
        success: true,
        stats: {
            totalRevenue: stats.totalRevenue,
            totalBuyers: stats.totalBuyers,
            totalProducts: stats.totalProducts,
            netEarnings: stats.netEarnings
        }
    });
}
