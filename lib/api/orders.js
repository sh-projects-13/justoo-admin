import { backendFetchJson } from "./_json";

export async function listOrders(params = {}) {
    const search = new URLSearchParams();
    if (params.filter) search.set("filter", String(params.filter));
    if (params.status) search.set("status", String(params.status));

    const qs = search.toString();
    return backendFetchJson(`/admin/orders${qs ? `?${qs}` : ""}`, {
        method: "GET",
    });
}

export async function getOrderById(orderId) {
    return backendFetchJson(`/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "GET",
    });
}

export async function getOrderEvents(orderId) {
    return backendFetchJson(`/admin/orders/${encodeURIComponent(orderId)}/events`, {
        method: "GET",
    });
}

export async function cancelOrder(orderId, payload) {
    return backendFetchJson(`/admin/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });
}
