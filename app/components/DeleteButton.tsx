"use client";

import { useState } from "react";

export default function DeleteButton({ productId, onDeleted }: { productId: string; onDeleted: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (data.success) {
                onDeleted(); // trigger parent refresh or state update
            } else {
                alert("Failed to delete product: " + data.error);
            }
        } catch (err) {
            console.error("Error deleting product", err);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
        >
            {loading ? "Deleting..." : "Delete"}
        </button>
    );
}
