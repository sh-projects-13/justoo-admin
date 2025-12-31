"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getBackendUrl() {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    return base ? base.replace(/\/$/, "") : "";
}

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const nextUrl = useMemo(() => {
        const n = searchParams?.get("next");
        return n && n.startsWith("/") ? n : "/admin";
    }, [searchParams]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        const backendUrl = getBackendUrl();
        if (!backendUrl) {
            setError("Missing NEXT_PUBLIC_BACKEND_URL");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${backendUrl}/admin/auth/login`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                let msg = "LOGIN_FAILED";
                try {
                    const data = await res.json();
                    msg = data?.error || msg;
                } catch {
                    // ignore
                }
                setError(msg);
                return;
            }

            router.replace(nextUrl);
            router.refresh();
        } catch {
            setError("NETWORK_ERROR");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6">
                <h1 className="text-xl font-semibold text-zinc-900">Login</h1>
                <p className="mt-1 text-sm text-zinc-600">Sign in to continue.</p>

                <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            autoComplete="current-password"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="••••••••"
                        />
                    </div>

                    {error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {isSubmitting ? "Signing in…" : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
