// components/BuyerDashboardClient.tsx
"use client";
import { useEffect, useState } from "react";

export default function BuyerDashboardClient() {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/buyer/dashboard")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setPurchases(data.purchases);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading your purchases...</p>;
    if (purchases.length === 0) return <p>You haven't purchased anything yet.</p>;

    return (
        <div className="space-y-6">
            {purchases.map((p) => (
                <div key={p.orderId} className="border rounded shadow p-4">
                    <h3 className="text-lg font-semibold">{p.product.name}</h3>
                    <p className="text-sm text-gray-600">{p.product.description}</p>
                    <p className="font-semibold mt-2">₹{p.amount}</p>
                    <p className="text-xs text-gray-500">Order ID: {p.orderId}</p>
                    <p className="text-xs text-gray-500">
                        Purchased: {new Date(p.purchasedAt).toLocaleString()}
                    </p>
                    <a
                        href={p.product.zipUrl}
                        target="_blank"
                        className="mt-2 inline-block text-blue-600 underline"
                    >
                        Download
                    </a>
                </div>
            ))}
        </div>
    );
}
