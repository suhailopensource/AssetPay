import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import CreateAssetModal from "../components/CreateAssetModal"; // ✅ Correct import

export const dynamic = "force-dynamic";

export default async function SellerDashboard() {
    const { userId } = await auth();

    if (!userId) redirect("/sign-in");

    await connectDB();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user || user.role !== "seller") redirect("/sign-in");

    return (
        <div className="min-h-screen  p-6">
            <h1 className="text-3xl font-bold mb-4">Seller Dashboard</h1>
            <p className="text-gray-600 mb-6">Welcome, {user.firstName || "Seller"}!</p>

            <CreateAssetModal /> {/* ✅ Client-side modal */}
        </div>
    );
}
