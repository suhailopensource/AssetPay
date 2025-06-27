import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/product";
import { User } from "@/lib/models/user";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi(); // ✅ Don't pass options

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();

        const user = await User.findOne({ clerkUserId: userId });
        if (!user || user.role !== "seller") {
            return NextResponse.json({ error: "Only sellers can delete products" }, { status: 403 });
        }

        const product = await Product.findById(params.id);
        if (!product || product.seller.toString() !== user._id.toString()) {
            return NextResponse.json({ error: "Product not found or not owned by you" }, { status: 404 });
        }

        const key = product.zipUrl?.split("/f/")[1];
        if (key) {
            await utapi.deleteFiles(key);
        }

        await product.deleteOne();

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("❌ Error deleting product:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
