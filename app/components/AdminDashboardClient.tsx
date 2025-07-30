"use client";

import useSWR from "swr";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboardClient() {
    const { data, error, isLoading } = useSWR("/api/admin/overview", fetcher);

    if (isLoading) return <p className="p-6">Loading dashboard...</p>;
    if (error || data?.error) return <p className="p-6 text-red-500">Failed to load admin data.</p>;

    const { stats, recentOrders, users } = data;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Summary Stats */}
            <div className="text-black grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                <Stat label="Total Users" value={stats.totalUsers} />
                <Stat label="Total Products" value={stats.totalProducts} />
                <Stat label="Total Orders" value={stats.totalOrders} />
                <Stat label="Paid Orders" value={stats.paidOrders} />
                <Stat label="Total Revenue" value={`₹${stats.totalRevenue}`} />
            </div>

            {/* Recent Orders */}
            <h2 className="text-xl font-semibold mt-10 mb-4">Recent Orders</h2>
            <div className="overflow-auto border rounded-lg mb-10">
                <table className="min-w-full table-auto text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Product</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Buyer Email</th>
                            <th className="p-3">Paid</th>
                            <th className="p-3">Seller</th>
                            <th className="p-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((order: any) => (
                            <tr key={order.orderId} className="border-t">
                                <td className="p-3">{order.orderId}</td>
                                <td className="p-3">{order.product}</td>
                                <td className="p-3">₹{order.amount}</td>
                                <td className="p-3">{order.buyerEmail}</td>
                                <td className="p-3">{order.paid ? "✅ Yes" : "❌ No"}</td>
                                <td className="p-3">{order.sellerEmail}</td>
                                <td className="p-3">{format(new Date(order.date), "Pp")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Breakdown */}
            <h2 className="text-xl font-semibold mb-4">All Users</h2>
            <div className="space-y-6">
                {users.map((user: any) => (
                    <div key={user._id} className="border p-4 rounded-xl text-black bg-white shadow">
                        <p className="text-lg font-medium">
                            {user.name} ({user.email}) —{" "}
                            <span className="uppercase text-blue-600">{user.role}</span>
                        </p>

                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div>Products: {user.products.length}</div>
                            <div>Purchases: {user.purchases}</div>
                            <div>Is Buyer: {user.isBuyer ? "✅" : "❌"}</div>
                            {user.sellerStats && (
                                <>
                                    <div>Total Revenue: ₹{user.sellerStats.totalRevenue}</div>
                                    <div>Net Earnings: ₹{user.sellerStats.netEarnings}</div>
                                    <div>Total Buyers: {user.sellerStats.totalBuyers}</div>
                                </>
                            )}
                        </div>

                        {user.products.length > 0 && (
                            <div className="mt-4">
                                <p className="font-medium">Products:</p>
                                <ul className="list-disc ml-6 text-sm text-gray-700">
                                    {user.products.map((p: any, idx: number) => (
                                        <li key={idx}>
                                            {p.name} – ₹{p.price}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow border">
            <p className="text-gray-600 text-sm">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    );
}
