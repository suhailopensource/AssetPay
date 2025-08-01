"use client";

import { useState } from "react";
import ProductModal from "./ProductModal";

export default function CreateAssetModal({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700 transition"
            >
                + Create New Asset
            </button>

            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-500 p-6 rounded shadow-lg relative">
                        <button
                            className="absolute top-2 right-2 text-white hover:text-black"
                            onClick={() => setOpen(false)}
                        >
                            ✕
                        </button>
                        <ProductModal
                            onCreated={() => {
                                setOpen(false);
                                onCreated(); // refresh product list
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
