import { NextResponse } from "next/server";

function isPublicAdminPath(pathname) {
    return pathname === "/admin/login" || pathname === "/admin/logout";
}

function isPublicRootPath(pathname) {
    return pathname === "/login" || pathname === "/logout";
}

export async function middleware(req) {
    const { pathname, search } = req.nextUrl;

    if (isPublicRootPath(pathname)) {
        return NextResponse.next();
    }

    if (!pathname.startsWith("/admin")) {
        return NextResponse.next();
    }

    if (isPublicAdminPath(pathname)) {
        return NextResponse.next();
    }

    const candidateCookieNames = Array.from(
        new Set([
            process.env.SESSION_COOKIE_NAME,
            "justoo.sid",
            "connect.sid",
        ].filter(Boolean))
    );

    const found = candidateCookieNames
        .map((name) => ({ name, value: req.cookies.get(name)?.value }))
        .find((c) => c.value);

    const cookieName = found?.name || (process.env.SESSION_COOKIE_NAME);
    const sessionCookie = found?.value;

    if (!sessionCookie) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname + (search || ""));
        return NextResponse.redirect(url);
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
        return NextResponse.next();
    }

    try {
        // Forward the session cookie to backend for validation.
        // We must send the cookie with the correct name the backend expects.
        const backendCookieName = process.env.SESSION_COOKIE_NAME || "justoo.sid";
        const meRes = await fetch(`${backendUrl.replace(/\/$/, "")}/admin/auth/me`, {
            method: "GET",
            headers: {
                cookie: `${backendCookieName}=${sessionCookie}`,
                accept: "application/json",
            },
            cache: "no-store",
        });

        if (meRes.status === 401) {
            const url = req.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("next", pathname + (search || ""));

            const res = NextResponse.redirect(url);
            res.cookies.set(cookieName, "", { expires: new Date(0), path: "/" });
            return res;
        }

        return NextResponse.next();
    } catch {
        // If backend is unreachable, fall back to cookie presence.
        return NextResponse.next();
    }
}

export const config = {
    matcher: ["/admin/:path*"],
};
