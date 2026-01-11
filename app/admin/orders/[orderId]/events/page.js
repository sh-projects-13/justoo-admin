import Link from "next/link";

import { fetchMe, getOrderEvents } from "../../../../../lib/adminApi";

export const dynamic = "force-dynamic";

export default async function OrderEventsPage({ params }) {
    const p = await params;
    const orderId = p?.orderId;

    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Order Events</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }
    const result = await getOrderEvents(orderId);

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Order Events</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load events.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const events = result.data?.events || [];

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-5xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Order Events</h1>
                        <p className="mt-1 text-sm text-zinc-600">Order: {orderId}</p>
                    </div>
                    <Link
                        href={`/admin/orders/${encodeURIComponent(orderId)}`}
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
                                <th className="px-4 py-3 font-medium">From</th>
                                <th className="px-4 py-3 font-medium">To</th>
                                <th className="px-4 py-3 font-medium">Actor</th>
                                <th className="px-4 py-3 font-medium">Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((e) => (
                                <tr key={e.id} className="border-b border-zinc-100 last:border-b-0">
                                    <td className="px-4 py-3 text-zinc-700">{String(e.createdAt || "")}</td>
                                    <td className="px-4 py-3 text-zinc-700">{e.fromStatus}</td>
                                    <td className="px-4 py-3 text-zinc-700">{e.toStatus}</td>
                                    <td className="px-4 py-3 text-zinc-700">
                                        {e.actorType}:{e.actorId}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-700">{e.reason || "—"}</td>
                                </tr>
                            ))}
                            {!events.length ? (
                                <tr>
                                    <td className="px-4 py-6 text-zinc-600" colSpan={5}>
                                        No events found.
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
