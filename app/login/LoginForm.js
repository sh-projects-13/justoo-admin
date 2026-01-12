"use client";

import { useState } from "react";

import { Button, Field, Input, Notice } from "@/_components/ui";
import { useAuthStore } from "@/lib/stores/auth";

export default function LoginForm({ nextUrl }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/login", {
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
                // Update Zustand auth store with the admin data
                if (data?.admin) {
                    setAuthenticated(data.admin);
                }

                // Use hard navigation to ensure cookie is sent on the next request.
                window.location.href = nextUrl || "/admin";
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
