import { AuthGuard } from "@/_components/auth-guard";

export const metadata = {
    title: "Justoo Admin",
};

/**
 * Admin layout with auth protection.
 * 
 * All routes under /admin/* are protected by the AuthGuard component.
 * This provides client-side auth validation that:
 * - Checks auth status on mount
 * - Redirects to /login if not authenticated
 * - Shows loading state during validation
 * - Caches auth state to prevent unnecessary re-checks
 */
export default function AdminLayout({ children }) {
    return <AuthGuard>{children}</AuthGuard>;
}
