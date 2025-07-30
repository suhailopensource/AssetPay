// app/dashboard/buyer/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import BuyerDashboardClient from "@/app/components/BuyerDashboardClient";

export default async function BuyerDashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    await connectDB();
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) redirect("/sign-in");

    return (
        <div className="min-h-screen p-6">
            <h1 className="text-3xl font-bold mb-4">Buyer Dashboard</h1>
            <BuyerDashboardClient />
        </div>
    );
}
