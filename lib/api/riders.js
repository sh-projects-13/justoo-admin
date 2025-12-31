import { backendFetchJson } from "./_json";

export async function listRiders() {
    return backendFetchJson("/admin/riders", { method: "GET" });
}

export async function getRiderById(riderId) {
    return backendFetchJson(`/admin/riders/${encodeURIComponent(riderId)}`, {
        method: "GET",
    });
}

export async function createRider(payload) {
    return backendFetchJson("/admin/riders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function updateRider(riderId, payload) {
    return backendFetchJson(`/admin/riders/${encodeURIComponent(riderId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function deleteRider(riderId) {
    return backendFetchJson(`/admin/riders/${encodeURIComponent(riderId)}`, {
        method: "DELETE",
    });
}
