import { NextResponse } from "next/server";

/**
 * Simplified auth middleware for Next.js.
 * 
 * This middleware ONLY checks for cookie presence. It does NOT make network
 * calls to the backend. Backend validation happens in server components via
 * fetchMe(), which already uses `dynamic = "force-dynamic"`.
 * 
 * Why this approach:
 * 1. Middleware runs on every request and should be fast (no network I/O).
 * 2. Network calls in middleware cause race conditions, caching issues, and latency.
 * 3. Server components already validate auth; middleware just gates access.
 * 4. If the cookie is invalid/expired, server components will show "Unauthenticated"
 *    and the user can click "Login" — no infinite redirect loops.
 */

const SESSION_COOKIE_NAME = "justoo.sid";

function getSessionCookie(req) {
    // Check the primary cookie name, then fallback candidates
    const primary = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (primary) return { name: SESSION_COOKIE_NAME, value: primary };

    // Fallback: check connect.sid (express-session default)
    const connectSid = req.cookies.get("connect.sid")?.value;
    if (connectSid) return { name: "connect.sid", value: connectSid };

    // Fallback: check env-configured name if different
    const envName = process.env.SESSION_COOKIE_NAME;
    if (envName && envName !== SESSION_COOKIE_NAME && envName !== "connect.sid") {
        const envValue = req.cookies.get(envName)?.value;
        if (envValue) return { name: envName, value: envValue };
    }

    return null;
}

export function middleware(req) {
    const { pathname, search } = req.nextUrl;

    // Allow public routes
    if (pathname === "/login" || pathname === "/logout") {
        return NextResponse.next();
    }

    // Allow legacy /admin/login and /admin/logout (they redirect anyway)
    if (pathname === "/admin/login" || pathname === "/admin/logout") {
        return NextResponse.next();
    }

    // Only protect /admin/* routes
    if (!pathname.startsWith("/admin")) {
        return NextResponse.next();
    }

    // Check for session cookie presence (no backend call)
    const session = getSessionCookie(req);

    if (!session) {
        // No cookie → redirect to login
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname + (search || ""));
        return NextResponse.redirect(url);
    }

    // Cookie exists → allow request to proceed
    // Server components will validate the session with the backend
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all /admin routes except static files
        "/admin/:path*",
    ],
};
