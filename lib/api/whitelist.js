import { backendFetchJson } from "./_json";

export async function listWhitelistedPhones() {
    return backendFetchJson("/admin/whitelist", { method: "GET" });
}

export async function addPhoneToWhitelist(payload) {
    return backendFetchJson("/admin/whitelist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function deletePhoneFromWhitelist(phone) {
    return backendFetchJson(`/admin/whitelist/${encodeURIComponent(phone)}`, {
        method: "DELETE",
    });
}
