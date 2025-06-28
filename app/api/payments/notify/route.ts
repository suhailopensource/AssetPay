import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { Product } from "@/lib/models/product";
import { UTApi } from "uploadthing/server";
import { Resend } from "resend";

const utapi = new UTApi();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    const { orderId, buyerEmail } = await req.json();
    if (!orderId || !buyerEmail) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findOne({ orderId }).populate("product");
    if (!order || !order.product) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get signed URL for UploadThing file
    const key = order.product.zipUrl?.split("/f/")[1];
    const signed = key ? await utapi.getFileUrls(key) : null;
    const signedUrl = signed?.data?.[0]?.url || order.product.zipUrl;

    const html = `
    <h2>Thank you for purchasing <strong>${order.product.name}</strong></h2>
    <p>You can download your file using the link below:</p>
    <a href="${signedUrl}" target="_blank">Download File</a>
    <hr />
    <h3>Your License</h3>
    <pre>
This license grants you the right to use the digital asset "${order.product.name}" for personal and commercial purposes.
Please do not redistribute or resell.
    </pre>
  `;

    const emailRes = await resend.emails.send({
        from: "Your Store <onboarding@resend.dev>",
        to: buyerEmail,
        subject: `Your purchase: ${order.product.name}`,
        html,
    });

    if (emailRes.error) {
        console.error("Email send error:", emailRes.error);
        return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
