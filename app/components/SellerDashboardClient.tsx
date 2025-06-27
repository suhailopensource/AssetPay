// components/SellerDashboardClient.tsx
"use client";

import { useEffect, useState } from "react";
import CreateAssetModal from "./CreateAssetModal";
import ClientProductList from "./ClientProductList";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    zipUrl: string;
}

export default function SellerDashboardClient({
    sellerName,
    baseUrl,
}: {
    sellerName: string;
    baseUrl: string;
}) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/products/me");
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            } else {
                console.error("Failed to fetch products");
            }
        } catch (err) {
            console.error("Error fetching products", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <>
            <CreateAssetModal onCreated={fetchProducts} />
            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Your Products</h2>
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : products.length === 0 ? (
                    <p className="text-gray-500">You haven't added any products yet.</p>
                ) : (
                    <ClientProductList
                        products={products}
                        sellerName={sellerName}
                        baseUrl={baseUrl}
                        onDeleted={fetchProducts}
                    />
                )}
            </div>
        </>
    );
}
