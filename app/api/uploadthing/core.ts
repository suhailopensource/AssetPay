// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
    productZipUploader: f(["blob"]) // Accept any file type — or use "application"
        .middleware(async () => {
            const { userId } = await auth();
            if (!userId) throw new Error("Unauthorized");
            return { userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("✅ Upload complete for:", metadata.userId);
            console.log("📦 File URL:", file.url);
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
