import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/product";
import { notFound } from "next/navigation";
import CashfreeClient from "@/app/components/CashfreeClient";

function slugify(name: string) {
    return name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
}

export default async function ProductPage({
    params,
    searchParams,
}: {
    params: { seller: string; id: string };
    searchParams: { [key: string]: string };
}) {
    const { seller, id } = params;
    const orderId = searchParams.orderId || null;

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

                <CashfreeClient
                    productId={product._id.toString()}
                    price={product.price}
                    orderId={orderId}
                    zipUrl={product.zipUrl}
                />
            </div>
        </div>
    );
}
