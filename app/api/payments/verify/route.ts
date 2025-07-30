import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { SellerStats } from "@/lib/models/sellerStats";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// /app/api/payments/verify/route.ts


export async function GET(req: Request) {
    const { orderId } = Object.fromEntries(new URL(req.url).searchParams);
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    await connectDB();
    const order = await Order.findOne({ orderId });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const cashfree = new Cashfree(CFEnvironment.SANDBOX,
        process.env.CASHFREE_APP_ID!, process.env.CASHFREE_SECRET_KEY!);

    try {
        const info = await cashfree.PGFetchOrder(orderId);
        if (info.data.order_status === "PAID" && !order.paid) {
            order.paid = true;
            await order.save();

            const gst = order.amount * 0.18;
            const cashfreeFee = order.amount * 0.0025;
            const platformFee = order.amount * 0.05;
            const net = order.amount - gst - cashfreeFee - platformFee;

            await SellerStats.findOneAndUpdate(
                { seller: order.seller },
                { $inc: { totalRevenue: order.amount, netEarnings: net, totalBuyers: 1 } },
                { upsert: true }
            );
        }
        return NextResponse.json({ success: true, paid: order.paid });
    } catch (err) {
        console.error("verify error", err);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
