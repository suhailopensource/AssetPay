// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <SignIn path="/sign-in" routing="path" />
        </div>
    );
}
