import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Auth check API route - validates session with backend.
 * 
 * This is a client-callable endpoint that checks if the current session
 * is valid by forwarding the cookie to the backend's /admin/auth/me.
 * 
 * Used by the Zustand auth store for client-side auth state management.
 */

const SESSION_COOKIE_NAME = "justoo.sid";

function getBackendBaseUrl() {
    const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    return String(url || "").replace(/\/+$/, "");
}

async function getSessionCookieValue() {
    const cookieStore = await cookies();

    // Primary: justoo.sid
    let value = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (value) return value;

    // Fallback: connect.sid
    value = cookieStore.get("connect.sid")?.value;
    if (value) return value;

    // Fallback: env-configured name
    const envName = process.env.SESSION_COOKIE_NAME;
    if (envName && envName !== SESSION_COOKIE_NAME && envName !== "connect.sid") {
        value = cookieStore.get(envName)?.value;
        if (value) return value;
    }

    return null;
}

export async function GET() {
    const backendUrl = getBackendBaseUrl();
    const sessionValue = await getSessionCookieValue();

    // No cookie = not authenticated
    if (!sessionValue) {
        return NextResponse.json({ authenticated: false, admin: null }, { status: 401 });
    }

    // No backend URL configured
    if (!backendUrl) {
        return NextResponse.json({ error: "MISSING_BACKEND_URL" }, { status: 500 });
    }

    try {
        const backendCookieName = process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME;
        const meRes = await fetch(`${backendUrl}/admin/auth/me`, {
            method: "GET",
            headers: {
                cookie: `${backendCookieName}=${sessionValue}`,
                accept: "application/json",
            },
            cache: "no-store",
        });

        if (meRes.ok) {
            const data = await meRes.json();
            return NextResponse.json({
                authenticated: true,
                admin: data.admin || null,
            });
        }

        // Backend says not authenticated
        return NextResponse.json({ authenticated: false, admin: null }, { status: 401 });
    } catch (err) {
        // Network error - don't assume logged out
        return NextResponse.json(
            { error: "BACKEND_UNREACHABLE", message: err?.message },
            { status: 503 }
        );
    }
}
