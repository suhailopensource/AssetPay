"use client";

import { useEffect, useState } from "react";
import CreateAssetModal from "./CreateAssetModal";
import ClientProductList from "./ClientProductList";

interface Buyer {
    buyerEmail: string;
    _id: string;
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
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBuyers: 0,
        totalProducts: 0,
        netEarnings: 0
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/products/me");
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (err) {
            console.error("Error fetching products", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        const res = await fetch("/api/seller/stats");
        const data = await res.json();
        if (data.success) {
            setStats(data.stats);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchStats();
    }, []);

    return (
        <>
            <CreateAssetModal
                onCreated={() => {
                    fetchProducts();
                    fetchStats();
                }}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                <StatCard label="💰 Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} />
                <StatCard label="🎯 Net Earnings (After Fees)" value={`₹${stats.netEarnings.toFixed(2)}`} />
                <StatCard label="📦 Total Products Created" value={stats.totalProducts} />
                <StatCard label="👥 Total Buyers" value={stats.totalBuyers} />
            </div>

            {/* Products List */}
            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-2">Your Products</h2>
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : products.length === 0 ? (
                    <p className="text-gray-500">You haven't added any products yet.</p>
                ) : (
                    <ClientProductList
                        products={products}
                        sellerName={sellerName}
                        baseUrl={baseUrl}
                        onDeleted={() => {
                            fetchProducts();
                            fetchStats();
                        }}
                    />
                )}
            </div>
        </>
    );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-white border shadow rounded p-4">
            <p className="text-gray-600 text-sm">{label}</p>
            <p className="text-2xl font-bold text-blue-600">{value}</p>
        </div>
    );
}
