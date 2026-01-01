import { backendFetch } from "../backend";

export async function readJsonSafe(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export async function backendFetchJson(path, init) {
    try {
        const res = await backendFetch(path, init);
        const data = await readJsonSafe(res);
        return { res, data };
    } catch (err) {
        const message =
            err?.cause?.code ? `${err.cause.code}: ${err?.cause?.message || err.message || "Fetch failed"}` : err?.message || "Fetch failed";
        const data = { error: "FETCH_FAILED", message };

        return {
            res: new Response(JSON.stringify(data), {
                status: 503,
                headers: { "content-type": "application/json" },
            }),
            data,
        };
    }
}
