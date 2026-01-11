import Link from "next/link";

import { fetchMe, listOutOfStockInventory } from "../../../../../lib/adminApi";

export const dynamic = "force-dynamic";

export default async function OutOfStockInventoryPage() {
    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Out of Stock</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    const result = await listOutOfStockInventory();

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Out of Stock</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load out-of-stock inventory.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const rows = result.data?.inventory || [];

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-5xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Out of Stock Alerts</h1>
                        <p className="mt-1 text-sm text-zinc-600">Items with quantity 0.</p>
                    </div>
                    <Link href="/admin/inventory" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Back
                    </Link>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                            <tr>
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">Qty</th>
                                <th className="px-4 py-3 font-medium">Min</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.productId} className="border-b border-zinc-100 last:border-b-0">
                                    <td className="px-4 py-3 text-zinc-900">{r.productName}</td>
                                    <td className="px-4 py-3 text-zinc-700">{r.quantity}</td>
                                    <td className="px-4 py-3 text-zinc-700">{r.minQuantity}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/inventory/${encodeURIComponent(r.productId)}`}
                                            className="text-zinc-900 underline underline-offset-4"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {!rows.length ? (
                                <tr>
                                    <td className="px-4 py-6 text-zinc-600" colSpan={4}>
                                        No out-of-stock items.
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
