"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  const { user } = useUser();
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;

      try {
        const res = await fetch(`/api/user-role?clerkId=${user.id}`);
        const data = await res.json();
        setIsSeller(data.role === "seller");
      } catch (err) {
        console.error("Error fetching role", err);
      }
    };

    checkRole();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white">
      <nav className="flex items-center justify-between p-4 shadow-md bg-white">
        <div className="text-2xl font-bold text-blue-600">AssetPay</div>
        <div className="space-x-4 flex items-center">
          {isSeller && (
            <Link href="/dashboard">
              <button className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
                Dashboard
              </button>
            </Link>
          )}

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                Login
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center px-4">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
          Sell & Buy Digital Assets Securely
        </h1>
        <p className="text-lg text-gray-600 max-w-xl">
          Empowering creators to monetize their work and buyers to access high-quality digital products instantly.
        </p>
      </main>
    </div>
  );
}
