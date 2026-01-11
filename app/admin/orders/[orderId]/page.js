import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { cancelOrder, fetchMe, getOrderById } from "../../../../lib/adminApi";

export const dynamic = "force-dynamic";

function canCancel(status) {
    return !["CANCELLED", "DELIVERED", "REFUNDED"].includes(String(status || "").toUpperCase());
}

export default async function OrderDetailPage({ params, searchParams }) {
    const p = await params;
    const orderId = p?.orderId;

    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Order</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }
    const result = await getOrderById(orderId);

    if (result.res.status === 404) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Order</h1>
                    <p className="mt-2 text-sm text-zinc-700">Not found.</p>
                </div>
            </div>
        );
    }

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Order</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load order.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const order = result.data?.order;
    const items = result.data?.items || [];
    const address = result.data?.address;

    const sp = await searchParams;
    const error = sp?.error;

    async function cancelAction(formData) {
        "use server";

        const reason = String(formData.get("reason") || "").trim();
        const cancelRes = await cancelOrder(orderId, { reason });

        if (!cancelRes.res.ok) {
            const err = cancelRes.data?.error || "CANCEL_FAILED";
            redirect(`/admin/orders/${encodeURIComponent(orderId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/orders");
        redirect(`/admin/orders/${encodeURIComponent(orderId)}`);
    }

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-5xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Order</h1>
                        <p className="mt-1 text-sm text-zinc-600">{order?.id}</p>
                    </div>
                    <Link href="/admin/orders" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Back
                    </Link>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-700">
                    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2">
                        Status: <span className="font-medium text-zinc-900">{order?.status}</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2">
                        Total: <span className="font-medium text-zinc-900">{order?.totalAmount}</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2">
                        Customer: <span className="font-medium text-zinc-900">{order?.customerName}</span>
                    </div>
                    <Link
                        href={`/admin/orders/${encodeURIComponent(orderId)}/events`}
                        className="text-zinc-900 underline underline-offset-4"
                    >
                        View events
                    </Link>
                </div>

                {error ? (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        {String(error)}
                    </div>
                ) : null}

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                        <div className="text-sm font-medium text-zinc-900">Items</div>
                        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                                    <tr>
                                        <th className="px-3 py-2 font-medium">Product</th>
                                        <th className="px-3 py-2 font-medium">Qty</th>
                                        <th className="px-3 py-2 font-medium">Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it) => (
                                        <tr key={it.id} className="border-b border-zinc-100 last:border-b-0">
                                            <td className="px-3 py-2 text-zinc-900">{it.productName}</td>
                                            <td className="px-3 py-2 text-zinc-700">{it.quantity}</td>
                                            <td className="px-3 py-2 text-zinc-700">{it.finalPrice}</td>
                                        </tr>
                                    ))}
                                    {!items.length ? (
                                        <tr>
                                            <td className="px-3 py-4 text-zinc-600" colSpan={3}>
                                                No items.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                        <div className="text-sm font-medium text-zinc-900">Delivery address</div>
                        <div className="mt-3 text-sm text-zinc-700">
                            {address ? (
                                <div className="space-y-1">
                                    <div className="text-zinc-900 font-medium">{address.label}</div>
                                    <div>{address.line1}</div>
                                    {address.line2 ? <div>{address.line2}</div> : null}
                                </div>
                            ) : (
                                <div>—</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="text-sm font-medium text-zinc-900">Cancel order</div>
                    <p className="mt-1 text-xs text-zinc-600">Requires a reason. Cancelling restores inventory.</p>

                    {canCancel(order?.status) ? (
                        <form action={cancelAction} className="mt-4 space-y-3">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-zinc-800">Reason</label>
                                <input
                                    name="reason"
                                    required
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                                    placeholder="Customer requested cancellation"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
                            >
                                Cancel order
                            </button>
                        </form>
                    ) : (
                        <div className="mt-3 text-sm text-zinc-600">This order can’t be cancelled.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
