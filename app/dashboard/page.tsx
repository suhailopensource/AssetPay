import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import { Product } from "@/lib/models/product";
import CreateAssetModal from "../components/CreateAssetModal";
import ClientProductList from "../components/ClientProductList"; // ✅ new

export const dynamic = "force-dynamic";

export default async function SellerDashboard() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    await connectDB();
    const user = await User.findOne({ clerkUserId: userId });
    if (!user || user.role !== "seller") redirect("/sign-in");

    const products = await Product.find({ seller: user._id }).lean().sort({ createdAt: -1 });

    return (
        <div className="min-h-screen p-6">
            <h1 className="text-3xl font-bold mb-4">Seller Dashboard</h1>
            <p className="text-gray-600 mb-6">Welcome, {user.firstName || "Seller"}!</p>

            <CreateAssetModal />

            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Your Products</h2>
                {products.length === 0 ? (
                    <p className="text-gray-500">You haven't added any products yet.</p>
                ) : (
                    <ClientProductList
                        products={JSON.parse(JSON.stringify(products))}
                        sellerName={user.firstName || "seller"}
                        baseUrl={process.env.NEXT_PUBLIC_BASE_URL!}
                    />
                )}
            </div>
        </div>
    );
}
