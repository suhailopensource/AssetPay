// components/UploadZip.tsx
"use client";

import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "../api/uploadthing/core";

export function UploadZip({ onUpload }: { onUpload: (url: string) => void }) {
    return (
        <UploadDropzone<OurFileRouter, "productZipUploader">
            endpoint="productZipUploader"
            onClientUploadComplete={(res) => {
                if (res?.[0]?.ufsUrl || res?.[0]?.url) {
                    const url = res[0].ufsUrl || res[0].url; // use ufsUrl if available
                    onUpload(url);
                }
            }}
            onUploadError={(error) => {
                alert("Upload failed.");
                console.error(error);
            }}
            config={{
                mode: "auto", // "manual" if you want more control
            }}
            className="ut-label:text-blue-600 ut-button:bg-blue-600 ut-button:hover:bg-blue-700 ut-upload-icon:text-blue-500"
        />
    );
}
