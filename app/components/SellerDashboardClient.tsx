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

interface Payment {
    _id: string;
    orderId: string;
    product: { name: string };
    buyerEmail: string;
    amount: number;
    createdAt: string;
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
        netEarnings: 0,
    });
    const [payments, setPayments] = useState<Payment[]>([]);

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

    const fetchPayments = async () => {
        const res = await fetch("/api/seller/payments");
        const data = await res.json();
        if (data.success) {
            setPayments(data.orders);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchStats();
        fetchPayments();
    }, []);

    return (
        <>
            <CreateAssetModal
                onCreated={() => {
                    fetchProducts();
                    fetchStats();
                    fetchPayments();
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
                            fetchPayments();
                        }}
                    />
                )}
            </div>

            {/* Payment Log Table */}
            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-2">🧾 Payment Logs</h2>
                {payments.length === 0 ? (
                    <p className="text-black">No payments yet.</p>
                ) : (
                    <div className=" text-black overflow-auto max-h-[400px] border rounded p-4 bg-white">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 pr-4">Product</th>
                                    <th className="py-2 pr-4">Buyer</th>
                                    <th className="py-2 pr-4">Amount</th>
                                    <th className="py-2 pr-4">Order ID</th>
                                    <th className="py-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p._id} className="border-b">
                                        <td className="py-2 pr-4">{p.product?.name}</td>
                                        <td className="py-2 pr-4">{p.buyerEmail}</td>
                                        <td className="py-2 pr-4">₹{p.amount}</td>
                                        <td className="py-2 pr-4 text-xs">{p.orderId}</td>
                                        <td className="py-2 text-xs">{new Date(p.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
