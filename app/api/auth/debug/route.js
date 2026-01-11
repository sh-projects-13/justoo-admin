import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Debug endpoint to check cookie state and backend connectivity.
 * GET /api/auth/debug
 * 
 * Returns:
 * - Which cookies are present on the frontend
 * - Whether the backend is reachable
 * - Whether the backend considers the session valid
 */
export async function GET(req) {
    const cookieStore = await cookies();
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const sessionCookieName = process.env.SESSION_COOKIE_NAME || "justoo.sid";

    const allCookies = cookieStore.getAll().map((c) => ({
        name: c.name,
        valuePreview: c.value ? `${c.value.slice(0, 20)}...` : "(empty)",
        length: c.value?.length || 0,
    }));

    const sessionCookie = cookieStore.get(sessionCookieName);
    const sessionValue = sessionCookie?.value;

    let backendStatus = "not_configured";
    let backendMeResponse = null;

    if (backendUrl && sessionValue) {
        try {
            const meRes = await fetch(`${backendUrl.replace(/\/$/, "")}/admin/auth/me`, {
                method: "GET",
                headers: {
                    cookie: `${sessionCookieName}=${sessionValue}`,
                    accept: "application/json",
                },
                cache: "no-store",
            });

            backendStatus = meRes.status;
            try {
                backendMeResponse = await meRes.json();
            } catch {
                backendMeResponse = await meRes.text();
            }
        } catch (err) {
            backendStatus = "fetch_error";
            backendMeResponse = err?.message || "Unknown error";
        }
    } else if (!backendUrl) {
        backendStatus = "no_backend_url";
    } else if (!sessionValue) {
        backendStatus = "no_session_cookie";
    }

    return NextResponse.json({
        env: {
            BACKEND_URL: backendUrl ? `${backendUrl.slice(0, 30)}...` : null,
            SESSION_COOKIE_NAME: sessionCookieName,
            NODE_ENV: process.env.NODE_ENV,
        },
        cookies: {
            all: allCookies,
            sessionCookieName,
            hasSessionCookie: !!sessionValue,
            sessionValuePreview: sessionValue ? `${sessionValue.slice(0, 30)}...` : null,
            sessionValueLength: sessionValue?.length || 0,
        },
        backend: {
            status: backendStatus,
            response: backendMeResponse,
        },
    });
}
