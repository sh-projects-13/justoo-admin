import { backendFetchJson } from "./_json";

export async function listInventory() {
    return backendFetchJson("/admin/inventory", { method: "GET" });
}

export async function listLowStockInventory() {
    return backendFetchJson("/admin/inventory/alerts/low-stock", { method: "GET" });
}

export async function listOutOfStockInventory() {
    return backendFetchJson("/admin/inventory/alerts/out-of-stock", { method: "GET" });
}

export async function getInventoryItem(productId) {
    return backendFetchJson(`/admin/inventory/${encodeURIComponent(productId)}`, {
        method: "GET",
    });
}

export async function listInventoryMovementsForProduct(productId) {
    return backendFetchJson(`/admin/inventory/${encodeURIComponent(productId)}/movements`, {
        method: "GET",
    });
}

export async function createInventoryItem(payload) {
    return backendFetchJson("/admin/inventory", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function addInventoryQuantity(productId, payload) {
    return backendFetchJson(`/admin/inventory/${encodeURIComponent(productId)}/add-quantity`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function updateInventoryItem(productId, payload) {
    return backendFetchJson(`/admin/inventory/${encodeURIComponent(productId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function deleteInventoryItem(productId) {
    return backendFetchJson(`/admin/inventory/${encodeURIComponent(productId)}`, {
        method: "DELETE",
    });
}
