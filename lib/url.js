export function buildQueryUrl(base, params) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params || {})) {
        if (value === undefined || value === null || value === "") continue;
        sp.set(key, String(value));
    }
    const qs = sp.toString();
    return `${base}${qs ? `?${qs}` : ""}`;
}
