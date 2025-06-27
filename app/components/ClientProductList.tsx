// components/ClientProductList.tsx
"use client";

import ShareLinkInput from "./ShareLinkInput";
import DeleteButton from "./DeleteButton";

function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
}

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    zipUrl: string;
}

export default function ClientProductList({
    products,
    sellerName,
    baseUrl,
    onDeleted,
}: {
    products: Product[];
    sellerName: string;
    baseUrl: string;
    onDeleted: () => void;
}) {
    const sellerSlug = slugify(sellerName || "seller");

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
                const shareUrl = `${baseUrl}/store/${sellerSlug}/${product._id}`;

                return (
                    <div key={product._id} className="bg-white p-4 rounded shadow border">
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        <p className="text-blue-600 font-semibold mb-2">₹{product.price}</p>
                        <a
                            href={product.zipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 underline"
                        >
                            Download ZIP
                        </a>

                        <div className="mt-2">
                            <ShareLinkInput url={shareUrl} />
                        </div>

                        <DeleteButton productId={product._id} onDeleted={onDeleted} />
                    </div>
                );
            })}
        </div>
    );
}
