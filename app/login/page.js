import { redirect } from "next/navigation";

import { fetchMe } from "../../lib/adminApi";

import { Card, Page } from "@/_components/ui";
import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }) {
    const sp = await searchParams;
    const nextUrl = typeof sp?.next === "string" && sp.next.startsWith("/") ? sp.next : "/admin";

    const me = await fetchMe();
    if (me.res.ok) {
        redirect(nextUrl);
    }

    return (
        <Page size="sm" className="flex items-center justify-center">
            <Card className="w-full max-w-sm">
                <h1 className="text-xl font-semibold text-zinc-900">Login</h1>
                <p className="mt-1 text-sm text-zinc-600">Sign in to continue.</p>
                <LoginForm nextUrl={nextUrl} />
            </Card>
        </Page>
    );
}
