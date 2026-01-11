import { NextResponse } from "next/server";

export const runtime = "nodejs";

function normalizeBaseUrl(url) {
    return String(url || "").replace(/\/+$/, "");
}

function getBackendBaseUrl() {
    return normalizeBaseUrl(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL);
}

function parseSetCookieNameValue(setCookie) {
    // setCookie is a full Set-Cookie header value for one cookie.
    // e.g. "justoo.sid=abc123; Path=/; HttpOnly; Secure; SameSite=None"
    if (!setCookie) return null;
    const first = String(setCookie).split(";", 1)[0];
    const idx = first.indexOf("=");
    if (idx <= 0) return null;
    const name = first.slice(0, idx).trim();
    const value = first.slice(idx + 1);
    if (!name) return null;
    return { name, value };
}

function pickSessionCookie(setCookies, preferredName) {
    const parsed = (setCookies || []).map(parseSetCookieNameValue).filter(Boolean);

    if (preferredName) {
        const hit = parsed.find((c) => c.name === preferredName);
        if (hit) return hit;
    }

    // Heuristics: pick a likely session cookie.
    const sid = parsed.find((c) => /(^|\.|_)sid$/i.test(c.name) || /session/i.test(c.name));
    return sid || parsed[0] || null;
}

export async function POST(req) {
    const backendUrl = getBackendBaseUrl();
    const preferredCookieName = process.env.SESSION_COOKIE_NAME || "justoo.sid";

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
            // This is server-to-server; cookies are returned via Set-Cookie.
            body: JSON.stringify({ email, password }),
            // Some backends set session cookies on 302/303. We must not lose those headers.
            redirect: "manual",
            cache: "no-store",
        });
    } catch (err) {
        const message = err?.cause?.code ? `${err.cause.code}: ${err?.cause?.message || err.message}` : err?.message || "Fetch failed";
        return NextResponse.json({ error: "BACKEND_UNREACHABLE", message }, { status: 503 });
    }

    const text = await backendRes.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }

    const setCookies =
        typeof backendRes.headers.getSetCookie === "function"
            ? backendRes.headers.getSetCookie()
            : backendRes.headers.get("set-cookie")
                ? [backendRes.headers.get("set-cookie")]
                : [];

    const sessionCookie = pickSessionCookie(setCookies, preferredCookieName);

    // If backend says failure AND we didn't get any cookie, surface the backend failure.
    // If we DID get a cookie, treat 3xx login flows as success.
    if (!backendRes.ok && !(backendRes.status >= 300 && backendRes.status < 400 && sessionCookie)) {
        return NextResponse.json(data || { error: "LOGIN_FAILED" }, { status: backendRes.status });
    }

    const res = NextResponse.json(data || { ok: true }, { status: 200 });

    // Critical part: set the session cookie on the FRONTEND domain.
    // This makes Next middleware + server components see it on /admin requests.
    if (sessionCookie?.name && typeof sessionCookie.value === "string") {
        // Decode the cookie value if it was URL-encoded by the backend,
        // so we store the raw value. NextResponse.cookies will re-encode if needed.
        let cookieValue = sessionCookie.value;
        try {
            // Only decode if it looks URL-encoded (contains %)
            if (cookieValue.includes("%")) {
                cookieValue = decodeURIComponent(cookieValue);
            }
        } catch {
            // If decoding fails, use the original value
        }

        res.cookies.set(sessionCookie.name, cookieValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
    }

    return res;
}
