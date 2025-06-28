import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { Product } from "@/lib/models/product";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const { productId, buyerEmail, buyerPhone } = await req.json();
        if (!productId || !buyerEmail || !buyerPhone) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();
        const product = await Product.findById(productId).populate("seller");
        if (!product || !product.seller) {
            return NextResponse.json({ error: "Product or seller not found" }, { status: 404 });
        }

        const sellerSlug = (product.seller.firstName || "seller")
            .toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

        const orderId = "ORDER_" + uuidv4().replace(/-/g, "").slice(0, 15);

        const cashfree = new Cashfree(
            CFEnvironment.SANDBOX,
            process.env.CASHFREE_APP_ID!,
            process.env.CASHFREE_SECRET_KEY!
        );

        const session = await cashfree.PGCreateOrder({
            order_amount: Number(product.price),
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: buyerEmail.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50),
                customer_email: buyerEmail,
                customer_phone: buyerPhone.trim(),
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/${sellerSlug}/${product._id}?orderId=${orderId}`,
            },
        });

        await Order.create({
            orderId,
            product: product._id,
            buyerEmail,
            paid: false,
        });

        return NextResponse.json({
            sessionId: session.data.payment_session_id,
            orderId,
        });
    } catch (err: any) {
        console.error("Cashfree payment session creation failed:", err?.response?.data || err.message || err);
        return NextResponse.json({ error: "Payment session creation failed" }, { status: 500 });
    }
}
