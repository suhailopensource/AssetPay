import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import AdminDashboardClient from "@/app/components/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    await connectDB();
    const admin = await User.findOne({ clerkUserId: userId });
    if (!admin || admin.role !== "admin") redirect("/dashboard");

    return <AdminDashboardClient />;
}
