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
    const containerRef = useRef<HTMLDivElement>(null);
    const cashfreeRef = useRef<any>(null);
    const orderIdRef = useRef<string | null>(orderId);

    const startPayment = async () => {
        const email = prompt("Enter your email");
        const phone = prompt("Enter your phone number");
        if (!email || !phone) return alert("Email and phone are required");

        setBuyerEmail(email);

        const res = await fetch("/api/payments/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, buyerEmail: email, buyerPhone: phone }),
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
        cashfreeRef.current = cf;

        cf.drop(containerRef.current, {
            components: ["order-details", "card", "upi"],
            onSuccess: async () => {
                setHasPaid(true);

                try {
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

                    cf.destroy();
                } catch (err) {
                    console.error("Notify error:", err);
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
        <div>
            {!sessionId ? (
                <button onClick={startPayment} className="btn-primary">
                    Buy for ₹{price}
                </button>
            ) : (
                <div ref={containerRef} id="cashfree-drop-container" className="mt-4" />
            )}
        </div>
    );
}
