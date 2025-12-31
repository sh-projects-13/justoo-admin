import { NextResponse } from "next/server";

export async function GET(req) {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const cookieName = process.env.SESSION_COOKIE_NAME || "justoo.sid";

    if (backendUrl) {
        try {
            await fetch(`${backendUrl.replace(/\/$/, "")}/admin/auth/logout`, {
                method: "POST",
                headers: {
                    cookie: req.headers.get("cookie") || "",
                    accept: "application/json",
                },
                cache: "no-store",
            });
        } catch {
            // ignore
        }
    }

    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set(cookieName, "", { expires: new Date(0), path: "/" });
    return res;
}
