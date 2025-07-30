"use client";

import { useEffect, useState, useRef } from "react";

export default function CashfreeClient({
    productId,
    price,
    orderId,
}: {
    productId: string;
    price: number;
    orderId: string | null;
}) {
    const [sessionId, setSessionId] = useState("");
    const [hasPaid, setHasPaid] = useState(false);
    const [buyerEmail, setBuyerEmail] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [showForm, setShowForm] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const orderIdRef = useRef<string | null>(orderId);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!buyerEmail || !buyerPhone) return alert("Email and phone are required");

        const res = await fetch("/api/payments/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, buyerEmail, buyerPhone }),
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("Payment session error", data);
            return alert(data.error || "Failed to create session");
        }

        setSessionId(data.sessionId);
        orderIdRef.current = data.orderId;
        window.history.replaceState({}, "", `?orderId=${data.orderId}`);
    };

    useEffect(() => {
        if (!sessionId || !window?.Cashfree || !containerRef.current) return;

        const cf = new window.Cashfree(sessionId);

        cf.drop(containerRef.current, {
            components: ["order-details", "card", "upi"],
            onSuccess: async () => {
                try {
                    const verifyRes = await fetch(`/api/payments/verify?orderId=${orderIdRef.current}`);
                    const verifyData = await verifyRes.json();

                    if (!verifyRes.ok || !verifyData.paid) {
                        console.error("Verification failed:", verifyData);
                        return alert("Payment verification failed.");
                    }

                    const notifyRes = await fetch("/api/payments/notify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            orderId: orderIdRef.current,
                            buyerEmail,
                        }),
                    });

                    const notifyData = await notifyRes.json();
                    if (!notifyData.success) {
                        console.warn("Notify failed:", notifyData);
                    }

                    setHasPaid(true);
                    containerRef.current.innerHTML = "";
                } catch (err) {
                    console.error("Payment success handling error:", err);
                }
            },
            onFailure: (err: any) => {
                console.error("Payment failed", err);
            },
        });
    }, [sessionId]);

    if (hasPaid) {
        return (
            <p className="text-green-700 font-semibold">
                ✅ Payment successful! A download link has been sent to <strong>{buyerEmail}</strong>.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {!sessionId && !showForm && (
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    Buy for ₹{price}
                </button>
            )}

            {!sessionId && showForm && (
                <form onSubmit={handleFormSubmit} className="space-y-4 border p-4 rounded bg-white  shadow">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email address</label>
                        <input
                            type="email"
                            value={buyerEmail}
                            onChange={(e) => setBuyerEmail(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border rounded text-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone number</label>
                        <input
                            type="tel"
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border rounded text-black"
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full">
                        Process Order
                    </button>
                </form>
            )}

            {sessionId && (
                <div ref={containerRef} id="cashfree-drop-container" className="mt-6" />
            )}
        </div>
    );
}
