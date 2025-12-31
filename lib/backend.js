import { headers } from "next/headers";

function normalizeBaseUrl(url) {
    return String(url || "").replace(/\/+$/, "");
}

export function getBackendBaseUrl() {
    const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    return normalizeBaseUrl(url);
}

export function getRequestCookieHeader() {
    return headers().get("cookie") || "";
}

export async function backendFetch(path, init = {}) {
    const baseUrl = getBackendBaseUrl();
    if (!baseUrl) {
        throw new Error("Missing BACKEND_URL (or NEXT_PUBLIC_BACKEND_URL)");
    }

    const pathname = String(path || "");
    const url = `${baseUrl}${pathname.startsWith("/") ? "" : "/"}${pathname}`;

    const cookie = getRequestCookieHeader();

    const headersObj = new Headers(init.headers || {});
    if (cookie) headersObj.set("cookie", cookie);
    if (!headersObj.has("accept")) headersObj.set("accept", "application/json");

    return fetch(url, {
        ...init,
        headers: headersObj,
        cache: "no-store",
    });
}
