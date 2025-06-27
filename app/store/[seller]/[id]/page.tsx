// app/store/[seller]/[id]/page.tsx
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/product";
import { notFound } from "next/navigation";

interface Props {
    params: { seller: string; id: string };
}

function slugify(name: string) {
    return name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
}

export default async function ProductPage({ params }: Props) {
    const { seller, id } = params;
    await connectDB();

    const product = await Product.findById(id).populate("seller");
    if (!product) return notFound();

    const actualSellerSlug = slugify(product.seller.firstName || "seller");
    if (actualSellerSlug !== seller) return notFound();

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <p className="text-blue-600 font-semibold mb-4">Price: ₹{product.price}</p>

                <a
                    href={product.zipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Download ZIP
                </a>
            </div>
        </div>
    );
}
