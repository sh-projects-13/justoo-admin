import { backendFetchJson, readJsonSafe } from "./_json";
import { backendFetch } from "../backend";

export async function listProducts() {
    return backendFetchJson("/admin/products", { method: "GET" });
}

export async function getProductById(productId) {
    return backendFetchJson(`/admin/products/${encodeURIComponent(productId)}`, {
        method: "GET",
    });
}

export async function createProduct(form) {
    const res = await backendFetch("/admin/products", {
        method: "POST",
        body: form,
    });
    const data = await readJsonSafe(res);
    return { res, data };
}

export async function updateProduct(productId, form) {
    const res = await backendFetch(`/admin/products/${encodeURIComponent(productId)}`, {
        method: "PATCH",
        body: form,
    });
    const data = await readJsonSafe(res);
    return { res, data };
}

export async function deleteProduct(productId) {
    return backendFetchJson(`/admin/products/${encodeURIComponent(productId)}`, {
        method: "DELETE",
    });
}
