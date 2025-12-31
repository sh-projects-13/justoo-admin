import { backendFetchJson } from "./_json";

export async function listCustomers() {
    return backendFetchJson("/admin/customers", { method: "GET" });
}

export async function getCustomerById(customerId) {
    return backendFetchJson(`/admin/customers/${encodeURIComponent(customerId)}`, {
        method: "GET",
    });
}

export async function updateCustomer(customerId, payload) {
    return backendFetchJson(`/admin/customers/${encodeURIComponent(customerId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function deleteCustomer(customerId) {
    return backendFetchJson(`/admin/customers/${encodeURIComponent(customerId)}`, {
        method: "DELETE",
    });
}
