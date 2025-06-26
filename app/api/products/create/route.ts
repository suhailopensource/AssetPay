// app/api/products/create/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/product";
import { User } from "@/lib/models/user";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, price, description, zipUrl } = body;

        await connectDB();
        const user = await User.findOne({ clerkUserId: userId });
        if (!user || user.role !== "seller") {
            return NextResponse.json({ error: "Only sellers can create products" }, { status: 403 });
        }

        const product = await Product.create({
            name,
            price,
            description,
            zipUrl,
            seller: user._id,
        });

        return NextResponse.json({ success: true, product });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
