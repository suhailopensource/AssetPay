import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";
import { Product } from "@/lib/models/product";
import { Order } from "@/lib/models/order";
import { SellerStats } from "@/lib/models/sellerStats";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const admin = await User.findOne({ clerkUserId: userId });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [users, products, orders, sellerStats] = await Promise.all([
      User.find().lean(),
      Product.find().populate("seller").lean(),
      Order.find().sort({ createdAt: -1 }).populate("product").populate("seller").lean(),
      SellerStats.find().populate("seller").lean(),
    ]);

    const userPurchases = new Map<string, number>();
    orders.forEach((order) => {
      if (order.paid) {
        userPurchases.set(order.buyerEmail, (userPurchases.get(order.buyerEmail) || 0) + 1);
      }
    });

    const totalRevenue = sellerStats.reduce((sum, stat) => sum + stat.totalRevenue, 0);

    const userDetails = users.map((user) => {
      const userProducts = products.filter((p) => p.seller._id.toString() === user._id.toString());
      const stats = sellerStats.find((s) => s.seller._id.toString() === user._id.toString());
      const isBuyer = userPurchases.has(user.email);
      const purchases = userPurchases.get(user.email) || 0;

      return {
        _id: user._id,
        email: user.email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        role: user.role,
        products: userProducts.map((p) => ({
          name: p.name,
          price: p.price,
        })),
        purchases,
        isBuyer,
        sellerStats: stats
          ? {
            totalRevenue: stats.totalRevenue,
            netEarnings: stats.netEarnings,
            totalBuyers: stats.totalBuyers,
            totalProducts: stats.totalProducts,
          }
          : null,
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        paidOrders: orders.filter((o) => o.paid).length,
        totalRevenue,
      },
      recentOrders: orders.map((order) => ({
        orderId: order.orderId,
        product: order.product?.name || "Deleted Product",
        amount: order.amount,
        buyerEmail: order.buyerEmail,
        paid: order.paid,
        sellerEmail: order.seller?.email || "Unknown",
        date: order.createdAt,
      })),
      users: userDetails,
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
