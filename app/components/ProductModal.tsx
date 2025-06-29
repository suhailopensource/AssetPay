// components/ProductModal.tsx
"use client";

import { useState } from "react";
import { UploadZip } from "./UploadZip"; // ⬅️ import your drag-and-drop uploader

export default function ProductModal({ onCreated }: { onCreated: () => void }) {
    const [form, setForm] = useState({
        name: "",
        price: "",
        description: "",
        zipUrl: "",
    });
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        const res = await fetch("/api/products/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        setLoading(false);
        if (data.success) {
            onCreated();
            setForm({ name: "", price: "", description: "", zipUrl: "" });
            alert("Product created!");
        } else {
            alert(data.error || "Failed to create product");
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-black">Create New Product</h2>

            <input
                type="text"
                placeholder="Product Name"
                className="w-full border p-2 mb-2 rounded text-black"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
                type="number"
                placeholder="Price"
                className="w-full border p-2 mb-2 rounded text-black"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <textarea
                placeholder="Description"
                className="w-full border p-2 mb-2 rounded"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="my-4">
                <UploadZip
                    onUpload={(url) => setForm((prev) => ({ ...prev, zipUrl: url }))}
                />
                {form.zipUrl && (
                    <p className="text-sm text-green-600 mt-2">
                        ✅ File uploaded successfully!
                    </p>
                )}
            </div>

            <button
                onClick={handleCreate}
                disabled={loading || !form.zipUrl}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
                {loading ? "Creating..." : "Create Product"}
            </button>
        </div>
    );
}
