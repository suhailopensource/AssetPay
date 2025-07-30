import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import { SellerStats } from "@/lib/models/sellerStats";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const user = await User.findOne({ clerkUserId: userId });
        if (!user) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

        const stats = await SellerStats.findOne({ seller: user._id });
        if (!stats) return NextResponse.json({
            success: true, stats: {
                totalRevenue: 0,
                netEarnings: 0,
                totalBuyers: 0,
                totalProducts: 0,
            }
        });

        return NextResponse.json({ success: true, stats });
    } catch (err) {
        console.error("Stats fetch failed:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
