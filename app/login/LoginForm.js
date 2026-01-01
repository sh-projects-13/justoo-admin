"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Field, Input, Notice } from "@/_components/ui";

function getBackendUrl() {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    return base ? base.replace(/\/$/, "") : "";
}

export default function LoginForm({ nextUrl }) {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const backendUrl = getBackendUrl();
            if (!backendUrl) {
                setError("Missing NEXT_PUBLIC_BACKEND_URL.");
                return;
            }

            const res = await fetch(`${backendUrl}/admin/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const text = await res.text();
            let data = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }

            if (res.ok) {
                router.replace(nextUrl || "/admin");
                return;
            }

            setError(data?.message || data?.error || `Login failed (${res.status}).`);
        } catch (err) {
            setError(err?.message || "Network error.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Field label="Email">
                <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@example.com"
                />
            </Field>

            <Field label="Password">
                <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                />
            </Field>

            {error ? <Notice>{error}</Notice> : null}

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
        </form>
    );
}
