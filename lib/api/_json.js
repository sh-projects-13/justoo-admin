import { backendFetch } from "../backend";

export async function readJsonSafe(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export async function backendFetchJson(path, init) {
    const res = await backendFetch(path, init);
    const data = await readJsonSafe(res);
    return { res, data };
}
