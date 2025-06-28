"use client";

import { useEffect, useState } from "react";
import CreateAssetModal from "./CreateAssetModal";
import ClientProductList from "./ClientProductList";

interface Buyer {
    buyerEmail: string;
    _id: string;
    createdAt?: string;
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

export default function SellerDashboardClient({
    sellerName,
    baseUrl,
}: {
    sellerName: string;
    baseUrl: string;
}) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/products/me");
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
                setTotalRevenue(data.totalRevenue);
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
                <h2 className="text-xl font-semibold mb-2">Your Products</h2>
                <p className="text-green-700 font-semibold mb-6">
                    💰 Total Revenue: ₹{totalRevenue}
                </p>
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
