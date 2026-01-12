import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Logout API route - clears the frontend session cookie and notifies backend.
 * 
 * This is called by the client-side /logout page after clearing the Zustand store.
 * Returns JSON instead of redirecting so the client can handle navigation.
 */

const SESSION_COOKIE_NAME = "justoo.sid";

export async function POST(req) {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    // Notify backend to invalidate session (best effort)
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
            // Ignore errors - we still want to clear the frontend cookie
        }
    }

    const res = NextResponse.json({ ok: true });

    // Clear all possible session cookie names
    const cookiesToClear = [SESSION_COOKIE_NAME, "connect.sid"];
    const envName = process.env.SESSION_COOKIE_NAME;
    if (envName && !cookiesToClear.includes(envName)) {
        cookiesToClear.push(envName);
    }

    for (const name of cookiesToClear) {
        res.cookies.set(name, "", { expires: new Date(0), path: "/" });
    }

    return res;
}

// Also support GET for direct browser navigation
export async function GET(req) {
    return POST(req);
}
