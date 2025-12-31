import { backendFetchJson } from "./_json";

export async function fetchMe() {
    return backendFetchJson("/admin/auth/me", { method: "GET" });
}
