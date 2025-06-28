"use client";

import ShareLinkInput from "./ShareLinkInput";
import DeleteButton from "./DeleteButton";

function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
}

interface Buyer {
    _id: string;
    buyerEmail: string;
}

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    zipUrl: string;
    buyers: Buyer[];
    buyerCount: number;
    revenue: number;
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
                        <p className="text-sm text-gray-600 mb-1">{product.description}</p>
                        <p className="text-blue-600 font-semibold mb-1">₹{product.price}</p>

                        <a
                            href={product.zipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 underline"
                        >
                            Download ZIP
                        </a>

                        <div className="mt-3 space-y-1 text-sm text-gray-700">
                            <p>👥 <strong>{product.buyerCount}</strong> buyers</p>
                            <p>💰 <strong>₹{product.revenue}</strong> revenue</p>

                            {product.buyers.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs font-semibold text-gray-500">Buyers:</p>
                                    <ul className="list-disc list-inside text-xs text-gray-700">
                                        {product.buyers.map((buyer) => (
                                            <li key={buyer._id}>{buyer.buyerEmail}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="mt-3">
                            <ShareLinkInput url={shareUrl} />
                        </div>

                        <DeleteButton productId={product._id} onDeleted={onDeleted} />
                    </div>
                );
            })}
        </div>
    );
}
