import Link from "next/link";

import { fetchMe, listInventoryMovementsForProduct } from "../../../../../lib/adminApi";

export default async function InventoryMovementsPage({ params }) {
    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Movements</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    const productId = params?.productId;
    const result = await listInventoryMovementsForProduct(productId);

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Movements</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load movements.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const movements = result.data?.movements || [];

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-5xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Inventory Movements</h1>
                        <p className="mt-1 text-sm text-zinc-600">Product: {productId}</p>
                    </div>
                    <Link
                        href={`/admin/inventory/${encodeURIComponent(productId)}`}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                    >
                        Back
                    </Link>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                            <tr>
                                <th className="px-4 py-3 font-medium">When</th>
                                <th className="px-4 py-3 font-medium">Delta</th>
                                <th className="px-4 py-3 font-medium">Reason</th>
                                <th className="px-4 py-3 font-medium">Ref</th>
                                <th className="px-4 py-3 font-medium">Actor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map((m) => (
                                <tr key={m.id} className="border-b border-zinc-100 last:border-b-0">
                                    <td className="px-4 py-3 text-zinc-700">{String(m.createdAt || "")}</td>
                                    <td className="px-4 py-3 text-zinc-900">{m.deltaQuantity}</td>
                                    <td className="px-4 py-3 text-zinc-700">{m.reason}</td>
                                    <td className="px-4 py-3 text-zinc-700">
                                        {m.referenceType}
                                        {m.referenceId ? `:${m.referenceId}` : ""}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-700">
                                        {m.actorType}:{m.actorId}
                                    </td>
                                </tr>
                            ))}
                            {!movements.length ? (
                                <tr>
                                    <td className="px-4 py-6 text-zinc-600" colSpan={5}>
                                        No movements found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
