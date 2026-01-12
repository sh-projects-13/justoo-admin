import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Login proxy route - handles cross-origin session cookie setup.
 * 
 * Problem: Frontend and backend are on different domains. The backend sets a
 * session cookie with SameSite=None, but the browser won't send it to the
 * frontend domain. Solution: This route proxies the login request, extracts
 * the session cookie from the backend response, and sets it on the frontend
 * domain.
 */

const SESSION_COOKIE_NAME = "justoo.sid";

function normalizeBaseUrl(url) {
    return String(url || "").replace(/\/+$/, "");
}

function getBackendBaseUrl() {
    return normalizeBaseUrl(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL);
}

/**
 * Parse a Set-Cookie header value to extract name and value.
 */
function parseSetCookieNameValue(setCookie) {
    if (!setCookie) return null;
    const first = String(setCookie).split(";", 1)[0];
    const idx = first.indexOf("=");
    if (idx <= 0) return null;
    const name = first.slice(0, idx).trim();
    const value = first.slice(idx + 1);
    if (!name) return null;
    return { name, value };
}

/**
 * Pick the session cookie from backend Set-Cookie headers.
 */
function pickSessionCookie(setCookies) {
    const parsed = (setCookies || []).map(parseSetCookieNameValue).filter(Boolean);

    // Prefer our known session cookie name
    const preferred = parsed.find((c) => c.name === SESSION_COOKIE_NAME);
    if (preferred) return preferred;

    // Fallback: connect.sid
    const connectSid = parsed.find((c) => c.name === "connect.sid");
    if (connectSid) return connectSid;

    // Fallback: any cookie that looks like a session ID
    const sid = parsed.find((c) => /(^|\.|_)sid$/i.test(c.name) || /session/i.test(c.name));
    return sid || parsed[0] || null;
}

export async function POST(req) {
    const backendUrl = getBackendBaseUrl();

    if (!backendUrl) {
        return NextResponse.json({ error: "MISSING_BACKEND_URL" }, { status: 500 });
    }

    let body = null;
    try {
        body = await req.json();
    } catch {
        body = null;
    }

    const email = String(body?.email || "").trim();
    const password = String(body?.password || "").trim();

    if (!email || !password) {
        return NextResponse.json({ error: "MISSING_CREDENTIALS" }, { status: 400 });
    }

    let backendRes;
    try {
        backendRes = await fetch(`${backendUrl}/admin/auth/login`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({ email, password }),
            redirect: "manual",
            cache: "no-store",
        });
    } catch (err) {
        const message = err?.cause?.code
            ? `${err.cause.code}: ${err?.cause?.message || err.message}`
            : err?.message || "Fetch failed";
        return NextResponse.json({ error: "BACKEND_UNREACHABLE", message }, { status: 503 });
    }

    const text = await backendRes.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }

    // Extract Set-Cookie headers from backend response
    const setCookies =
        typeof backendRes.headers.getSetCookie === "function"
            ? backendRes.headers.getSetCookie()
            : backendRes.headers.get("set-cookie")
                ? [backendRes.headers.get("set-cookie")]
                : [];

    const sessionCookie = pickSessionCookie(setCookies);

    // If backend says failure AND we didn't get a session cookie, surface the error
    const isRedirectSuccess = backendRes.status >= 300 && backendRes.status < 400 && sessionCookie;
    if (!backendRes.ok && !isRedirectSuccess) {
        return NextResponse.json(data || { error: "LOGIN_FAILED" }, { status: backendRes.status });
    }

    const res = NextResponse.json(data || { ok: true }, { status: 200 });

    // Set the session cookie on the frontend domain
    if (sessionCookie?.name && typeof sessionCookie.value === "string") {
        let cookieValue = sessionCookie.value;

        // Decode URL-encoded cookie value if needed
        try {
            if (cookieValue.includes("%")) {
                cookieValue = decodeURIComponent(cookieValue);
            }
        } catch {
            // Keep original value if decoding fails
        }

        res.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // Frontend cookie doesn't need SameSite=None
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });
    }

    return res;
}
