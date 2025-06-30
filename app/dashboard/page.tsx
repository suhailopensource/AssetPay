// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";

export const dynamic = "force-dynamic";

export default async function DashboardEntry() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    await connectDB();
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) redirect("/sign-in");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-6">
            <h1 className="text-3xl font-bold">Welcome, {user.firstName || "User"}!</h1>
            <p className="text-gray-600">Which dashboard would you like?</p>
            <div className="flex gap-4">
                {["seller", "admin"].includes(user.role) && (
                    <a href="/dashboard/seller" className="btn-primary">
                        Seller Dashboard
                    </a>
                )}
                <a href="/dashboard/buyer" className="btn-secondary">
                    Buyer Dashboard
                </a>
            </div>
        </div>
    );
}
