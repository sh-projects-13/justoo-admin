"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/stores/auth";

/**
 * Logout page - clears client-side auth state and calls the logout API.
 * 
 * This ensures both the Zustand store and the session cookie are cleared.
 */
export default function LogoutPage() {
    const router = useRouter();
    const clear = useAuthStore((s) => s.clear);
    const [status, setStatus] = useState("logging out");

    useEffect(() => {
        async function performLogout() {
            // Clear client-side auth store first
            clear();

            try {
                // Call the API to clear server-side cookie
                await fetch("/api/auth/logout", {
                    method: "POST",
                    credentials: "include",
                });
            } catch {
                // Ignore errors - store is already cleared
            }

            setStatus("redirecting");

            // Redirect to login page
            router.replace("/login");
        }

        performLogout();
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
            <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
                <p className="mt-4 text-sm capitalize text-zinc-600">{status}...</p>
            </div>
        </div>
    );
}
