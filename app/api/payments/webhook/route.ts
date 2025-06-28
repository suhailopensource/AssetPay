import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/order";

const CLIENT_SECRET = process.env.CASHFREE_SECRET_KEY;
const IS_TESTING = true; // ⚠️ set to false in production

export async function POST(req: Request) {
    try {
        if (!CLIENT_SECRET) {
            throw new Error("Missing CASHFREE_WEBHOOK_SECRET in env");
        }

        const rawBody = await req.text();
        const signature = req.headers.get("x-webhook-signature");
        const timestamp = req.headers.get("x-webhook-timestamp");

        const signedPayload = `${timestamp}.${rawBody}`;
        const expectedSignature = crypto
            .createHmac("sha256", CLIENT_SECRET)
            .update(signedPayload)
            .digest("base64");

        if (!IS_TESTING && signature !== expectedSignature) {
            console.warn("❌ Webhook signature mismatch");
            return new Response("Unauthorized", { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const data = payload.data;

        if (!data?.order?.order_id || data?.payment?.payment_status !== "SUCCESS") {
            return new Response("Invalid webhook payload", { status: 400 });
        }

        await connectDB();

        const updated = await Order.findOneAndUpdate(
            { orderId: data.order.order_id },
            { paid: true },
            { new: true }
        );

        if (!updated) {
            console.warn("⚠️ No matching order found:", data.order.order_id);
        } else {
            console.log("✅ Order marked as paid:", updated.orderId);
        }

        return new Response("OK", { status: 200 });
    } catch (err: any) {
        console.error("❌ Webhook processing error:", err.message);
        return new Response("Internal Server Error", { status: 500 });
    }
}
