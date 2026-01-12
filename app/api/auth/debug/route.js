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

const SESSION_COOKIE_NAME = "justoo.sid";

export async function GET() {
    const cookieStore = await cookies();
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    const allCookies = cookieStore.getAll().map((c) => ({
        name: c.name,
        valuePreview: c.value ? `${c.value.slice(0, 20)}...` : "(empty)",
        length: c.value?.length || 0,
    }));

    // Check for session cookie (primary and fallbacks)
    let sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    let foundCookieName = SESSION_COOKIE_NAME;

    if (!sessionValue) {
        sessionValue = cookieStore.get("connect.sid")?.value;
        foundCookieName = "connect.sid";
    }

    if (!sessionValue) {
        const envName = process.env.SESSION_COOKIE_NAME;
        if (envName && envName !== SESSION_COOKIE_NAME && envName !== "connect.sid") {
            sessionValue = cookieStore.get(envName)?.value;
            foundCookieName = envName;
        }
    }

    let backendStatus = "not_configured";
    let backendMeResponse = null;

    if (backendUrl && sessionValue) {
        const backendCookieName = process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME;
        try {
            const meRes = await fetch(`${backendUrl.replace(/\/$/, "")}/admin/auth/me`, {
                method: "GET",
                headers: {
                    cookie: `${backendCookieName}=${sessionValue}`,
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
            SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME,
            NODE_ENV: process.env.NODE_ENV,
        },
        cookies: {
            all: allCookies,
            expectedCookieName: SESSION_COOKIE_NAME,
            foundCookieName: sessionValue ? foundCookieName : null,
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
