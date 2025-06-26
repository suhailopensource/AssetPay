// app/api/webhooks/clerk/route.ts
import { headers } from "next/headers";
import { Webhook } from "svix";
import { buffer } from "node:stream/consumers";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";

// Clerk secret from your dashboard
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
    const payload = await req.text();
    const headerPayload = await headers(); // ✅ fix here

    const svix_id = headerPayload.get("svix-id") as string;
    const svix_timestamp = headerPayload.get("svix-timestamp") as string;
    const svix_signature = headerPayload.get("svix-signature") as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: any;

    try {
        evt = wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error("Webhook verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { type, data } = evt;
    if (type === "user.created") {
        const { id, email_addresses, first_name, last_name } = data;
        const email = email_addresses?.[0]?.email_address;

        try {
            await connectDB();

            const existingUser = await User.findOne({ email });

            if (!existingUser) {
                await User.create({
                    clerkUserId: id,
                    email,
                    firstName: first_name || "",
                    lastName: last_name || "",

                });

                console.log("✅ New user created:", email);
            } else {
                console.log("⚠️ User already exists:", email);
            }
        } catch (err) {
            console.error("❌ DB error:", err);
            return NextResponse.json({ error: "DB error" }, { status: 500 });
        }
    }
    if (type === "user.deleted") {
        const { id } = data; // Clerk user ID

        try {
            await connectDB();

            const deletedUser = await User.findOneAndDelete({ clerkUserId: id });

            if (deletedUser) {
                console.log("🗑️ Deleted user:", deletedUser.email);
            } else {
                console.log("⚠️ Tried to delete non-existent user:", id);
            }
        } catch (err) {
            console.error("❌ Error deleting user:", err);
            return NextResponse.json({ error: "Delete failed" }, { status: 500 });
        }
    }

    if (type === "user.updated") {
        const { id, email_addresses, first_name, last_name } = data;
        const email = email_addresses?.[0]?.email_address;

        try {
            await connectDB();

            const updatedUser = await User.findOneAndUpdate(
                { clerkUserId: id },
                {
                    $set: {
                        email,
                        firstName: first_name || "",
                        lastName: last_name || "",
                    },
                },
                { new: true }
            );

            if (updatedUser) {
                console.log("🔄 User updated:", updatedUser.email);
            } else {
                console.log("⚠️ No user found to update:", id);
            }
        } catch (err) {
            console.error("❌ Error updating user:", err);
            return NextResponse.json({ error: "Update failed" }, { status: 500 });
        }
    }




    return NextResponse.json({ success: true });
}
