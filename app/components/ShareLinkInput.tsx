// components/ShareLinkInput.tsx
"use client";

import { useRef } from "react";

export default function ShareLinkInput({ url }: { url: string }) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="mt-2">
            <p className="text-sm text-gray-500">Shareable Link:</p>
            <input
                ref={inputRef}
                type="text"
                value={url}
                readOnly
                onClick={() => inputRef.current?.select()}
                className="w-full border px-2 py-1 mt-1 text-xs rounded bg-gray-50"
            />
        </div>
    );
}
