"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Auth store using Zustand with persistence.
 * 
 * This store manages client-side auth state and persists it to sessionStorage
 * so it survives page reloads within the same browser session.
 * 
 * The actual auth validation still happens via the session cookie + backend,
 * but this store prevents unnecessary login redirects by caching the auth state.
 */

export const useAuthStore = create(
    persist(
        (set, get) => ({
            // Auth state
            isAuthenticated: false,
            admin: null,
            lastChecked: null,

            // Actions
            setAuthenticated: (admin) => {
                set({
                    isAuthenticated: true,
                    admin,
                    lastChecked: Date.now(),
                });
            },

            setUnauthenticated: () => {
                set({
                    isAuthenticated: false,
                    admin: null,
                    lastChecked: Date.now(),
                });
            },

            // Check if we should revalidate (e.g., after 5 minutes)
            shouldRevalidate: () => {
                const { lastChecked } = get();
                if (!lastChecked) return true;
                const fiveMinutes = 5 * 60 * 1000;
                return Date.now() - lastChecked > fiveMinutes;
            },

            // Clear auth state (for logout)
            clear: () => {
                set({
                    isAuthenticated: false,
                    admin: null,
                    lastChecked: null,
                });
            },
        }),
        {
            name: "justoo-admin-auth",
            storage: createJSONStorage(() => sessionStorage),
            // Only persist these fields
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                admin: state.admin,
                lastChecked: state.lastChecked,
            }),
        }
    )
);

/**
 * Hook to check auth status from the server.
 * Returns a function that validates auth and updates the store.
 */
export function useAuthCheck() {
    const { setAuthenticated, setUnauthenticated, shouldRevalidate, isAuthenticated, admin } = useAuthStore();

    const checkAuth = async (force = false) => {
        // Skip if we recently checked and auth is valid
        if (!force && !shouldRevalidate() && isAuthenticated) {
            return { isAuthenticated: true, admin };
        }

        try {
            const res = await fetch("/api/auth/me", {
                method: "GET",
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                if (data.admin) {
                    setAuthenticated(data.admin);
                    return { isAuthenticated: true, admin: data.admin };
                }
            }

            setUnauthenticated();
            return { isAuthenticated: false, admin: null };
        } catch {
            // On network error, don't immediately logout - keep existing state
            return { isAuthenticated, admin };
        }
    };

    return { checkAuth, isAuthenticated, admin };
}
