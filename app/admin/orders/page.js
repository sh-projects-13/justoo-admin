import Link from "next/link";

import { fetchMe, listOrders } from "../../../lib/adminApi";

function buildUrl(base, params) {
    const sp = new URLSearchParams();
    if (params?.filter) sp.set("filter", params.filter);
    if (params?.status) sp.set("status", params.status);
    const qs = sp.toString();
    return `${base}${qs ? `?${qs}` : ""}`;
}

export default async function OrdersPage({ searchParams }) {
    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Orders</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    const filter = typeof searchParams?.filter === "string" ? searchParams.filter : "";
    const status = typeof searchParams?.status === "string" ? searchParams.status : "";

    const result = await listOrders({ filter: filter || undefined, status: status || undefined });

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Orders</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load orders.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const orders = result.data?.orders || [];

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-6xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Orders</h1>
                        <p className="mt-1 text-sm text-zinc-600">View and manage orders.</p>
                    </div>
                    <Link href="/admin" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Back
                    </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                        href={buildUrl("/admin/orders", { filter: "current" })}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                    >
                        Current
                    </Link>
                    <Link
                        href={buildUrl("/admin/orders", { filter: "completed" })}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                    >
                        Completed
                    </Link>
                    <Link
                        href={buildUrl("/admin/orders", { filter: "cancelled" })}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                    >
                        Cancelled
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                    >
                        All
                    </Link>
                </div>

                {(filter || status) ? (
                    <div className="mt-3 text-xs text-zinc-600">
                        Active query: {filter ? `filter=${filter}` : ""}
                        {filter && status ? " · " : ""}
                        {status ? `status=${status}` : ""}
                    </div>
                ) : null}

                <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                            <tr>
                                <th className="px-4 py-3 font-medium">Order</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Customer</th>
                                <th className="px-4 py-3 font-medium">Total</th>
                                <th className="px-4 py-3 font-medium">Rider</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o.id} className="border-b border-zinc-100 last:border-b-0">
                                    <td className="px-4 py-3 text-zinc-900">{o.id}</td>
                                    <td className="px-4 py-3 text-zinc-700">{o.status}</td>
                                    <td className="px-4 py-3 text-zinc-700">{o.customerName}</td>
                                    <td className="px-4 py-3 text-zinc-700">{o.totalAmount}</td>
                                    <td className="px-4 py-3 text-zinc-700">{o.riderName || "—"}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/orders/${encodeURIComponent(o.id)}`}
                                            className="text-zinc-900 underline underline-offset-4"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {!orders.length ? (
                                <tr>
                                    <td className="px-4 py-6 text-zinc-600" colSpan={6}>
                                        No orders found.
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
