// app/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import { Product } from "@/lib/models/product";
import CreateAssetModal from "../components/CreateAssetModal";
import ShareLinkInput from "../components/ShareLinkInput"; // ✅ correct
// ❌ wrong for default exports


export const dynamic = "force-dynamic";

function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
}

export default async function SellerDashboard() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    await connectDB();
    const user = await User.findOne({ clerkUserId: userId });
    if (!user || user.role !== "seller") redirect("/sign-in");

    const products = await Product.find({ seller: user._id }).sort({ createdAt: -1 });
    const sellerSlug = slugify(user.firstName || "seller");

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product) => {
                            const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/store/${sellerSlug}/${product._id}`;

                            return (
                                <div key={product._id.toString()} className="bg-white p-4 rounded shadow border">
                                    <h3 className="text-lg font-semibold">{product.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                    <p className="text-blue-600 font-semibold mb-2">₹{product.price}</p>
                                    <a
                                        href={product.zipUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-500 underline"
                                    >
                                        Download ZIP
                                    </a>

                                    <div className="mt-2">

                                        <ShareLinkInput url={shareUrl} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
