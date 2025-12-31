import { backendFetchJson } from "./_json";

export async function listAdmins() {
    return backendFetchJson("/admin/admins", { method: "GET" });
}

export async function getAdminById(adminId) {
    return backendFetchJson(`/admin/admins/${encodeURIComponent(adminId)}`, {
        method: "GET",
    });
}

export async function createAdmin(payload) {
    return backendFetchJson("/admin/admins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function updateAdmin(adminId, payload) {
    return backendFetchJson(`/admin/admins/${encodeURIComponent(adminId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function deleteAdmin(adminId) {
    return backendFetchJson(`/admin/admins/${encodeURIComponent(adminId)}`, {
        method: "DELETE",
    });
}
