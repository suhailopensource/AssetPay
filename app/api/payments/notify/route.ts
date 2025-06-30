// /app/api/payments/notify/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { UTApi } from "uploadthing/server";
import { Resend } from "resend";

const utapi = new UTApi();
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
    const { orderId, buyerEmail } = await req.json();
    if (!orderId || !buyerEmail) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await connectDB();
    const order = await Order.findOne({ orderId }).populate("product");
    if (!order || !order.product) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const key = order.product.zipUrl?.split("/f/")[1];
    const signed = key ? await utapi.getFileUrls(key) : null;
    const signedUrl = signed?.data?.[0]?.url || order.product.zipUrl;

    const html = `
    <h2>🧾 Receipt: ${order.product.name}</h2>
    <p><strong>Order:</strong> ${order.orderId}</p>
    <p><strong>Amount:</strong> ₹${order.amount}</p>
    <a href="${signedUrl}">Download File</a>
     <p><strong>SIGN UP TO ACCESS YOUR PURCHASE IN THE DASHBOARD</strong>    <a href="http://localhost:3000/sign-up">Sign Up NOW</a></p>
    <hr/><h3>License:</h3>
    <p>Use for personal & commercial; no redistribution.</p>
  `;

    const sent = await resend.emails.send({
        from: "Your Store <onboarding@resend.dev>",
        to: buyerEmail,
        subject: `Receipt & Download: ${order.product.name}`,
        html,
    });
    if (sent.error) return NextResponse.json({ error: "Email failed" }, { status: 500 });
    return NextResponse.json({ success: true });
}
