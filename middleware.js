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

    const cookieName = process.env.SESSION_COOKIE_NAME || "justoo.sid";
    const sessionCookie = req.cookies.get(cookieName)?.value;

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
        const meRes = await fetch(`${backendUrl.replace(/\/$/, "")}/admin/auth/me`, {
            method: "GET",
            headers: {
                cookie: req.headers.get("cookie") || "",
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
