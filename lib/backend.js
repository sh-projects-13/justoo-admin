import { cookies } from "next/headers";

/**
 * Backend API client for server components and server actions.
 * 
 * Handles cross-origin session cookie forwarding for session-based auth.
 * The frontend and backend are on different domains, so we manually forward
 * the session cookie to the backend with every request.
 */

const SESSION_COOKIE_NAME = "justoo.sid";

function normalizeBaseUrl(url) {
    return String(url || "").replace(/\/+$/, "");
}

export function getBackendBaseUrl() {
    const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    return normalizeBaseUrl(url);
}

/**
 * Get the session cookie value from the incoming request.
 * Checks primary name first, then fallbacks.
 */
export async function getSessionCookieValue() {
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

/**
 * Build the cookie header string to send to the backend.
 * The backend expects the cookie with its configured session name.
 */
export async function getSessionCookieForBackend() {
    const value = await getSessionCookieValue();
    if (!value) return "";

    // Use the backend's expected cookie name (from env or default)
    const backendCookieName = process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME;
    return `${backendCookieName}=${value}`;
}

/**
 * Fetch wrapper that forwards the session cookie to the backend.
 * Always uses cache: "no-store" to prevent stale auth state.
 */
export async function backendFetch(path, init = {}) {
    const baseUrl = getBackendBaseUrl();
    if (!baseUrl) {
        throw new Error("Missing BACKEND_URL (or NEXT_PUBLIC_BACKEND_URL)");
    }

    const pathname = String(path || "");
    const url = `${baseUrl}${pathname.startsWith("/") ? "" : "/"}${pathname}`;

    const cookie = await getSessionCookieForBackend();

    const headersObj = new Headers(init.headers || {});
    if (cookie) headersObj.set("cookie", cookie);
    if (!headersObj.has("accept")) headersObj.set("accept", "application/json");

    return fetch(url, {
        ...init,
        headers: headersObj,
        // CRITICAL: Always bypass cache for auth-dependent requests
        cache: "no-store",
    });
}
