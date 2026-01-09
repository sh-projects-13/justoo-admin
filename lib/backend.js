import { cookies, headers } from "next/headers";

function normalizeBaseUrl(url) {
    return String(url || "").replace(/\/+$/, "");
}

export function getBackendBaseUrl() {
    const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    return normalizeBaseUrl(url);
}

const SESSION_COOKIE_CANDIDATES = ["justoo.sid", "connect.sid"];

export async function getSessionCookieForBackend() {
    const cookieStore = await cookies();
    const envName = process.env.SESSION_COOKIE_NAME;
    const names = envName
        ? [envName, ...SESSION_COOKIE_CANDIDATES.filter((n) => n !== envName)]
        : SESSION_COOKIE_CANDIDATES;

    for (const name of names) {
        const value = cookieStore.get(name)?.value;
        if (value) {
            const backendCookieName = process.env.SESSION_COOKIE_NAME || "justoo.sid";
            return `${backendCookieName}=${value}`;
        }
    }
    return "";
}

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
        cache: "no-store",
    });
}
