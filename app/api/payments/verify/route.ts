// app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { Cashfree, CFEnvironment } from "cashfree-pg";

export async function GET(req: Request) {
    const { orderId } = Object.fromEntries(new URL(req.url).searchParams);
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    await connectDB();
    const order = await Order.findOne({ orderId });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const cashfree = new Cashfree(
        CFEnvironment.SANDBOX,
        process.env.CASHFREE_APP_ID!,
        process.env.CASHFREE_SECRET_KEY!
    );

    const info = await cashfree.PGFetchOrder(orderId);
    if (info.data.order_status === "PAID") {
        if (!order.paid) {
            order.paid = true;
            await order.save();
        }
        return NextResponse.json({ success: true, paid: true });
    }

    return NextResponse.json({ paid: false });
}
