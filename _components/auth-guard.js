"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuthStore, useAuthCheck } from "@/lib/stores/auth";

/**
 * AuthGuard component - Protects routes that require authentication.
 * 
 * This replaces middleware-based auth protection with a client-side approach
 * that's more reliable and doesn't cause redirect loops.
 * 
 * How it works:
 * 1. On mount, checks auth status via the Zustand store
 * 2. If not authenticated (or stale), validates with the server
 * 3. If validation fails, redirects to /login
 * 4. Shows loading state during validation
 */
export function AuthGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { checkAuth, isAuthenticated } = useAuthCheck();
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function validate() {
            const result = await checkAuth();

            if (!mounted) return;

            if (result.isAuthenticated) {
                setIsValid(true);
                setIsLoading(false);
            } else {
                // Redirect to login with return URL
                const returnUrl = encodeURIComponent(pathname);
                router.replace(`/login?next=${returnUrl}`);
            }
        }

        validate();

        return () => {
            mounted = false;
        };
    }, [pathname]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"></div>
                    <p className="mt-4 text-sm text-zinc-600">Verifying session...</p>
                </div>
            </div>
        );
    }

    // Not valid = redirecting
    if (!isValid) {
        return null;
    }

    return children;
}

/**
 * Hook to get current admin from the store.
 * Use this in client components that need admin data.
 */
export function useAdmin() {
    const { admin, isAuthenticated } = useAuthStore();
    return { admin, isAuthenticated };
}

/**
 * Hook to handle logout.
 * Clears the store and redirects to /logout route.
 */
export function useLogout() {
    const router = useRouter();
    const clear = useAuthStore((s) => s.clear);

    const logout = () => {
        clear();
        router.push("/logout");
    };

    return logout;
}
