import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
    addInventoryQuantity,
    deleteInventoryItem,
    fetchMe,
    getInventoryItem,
    updateInventoryItem,
} from "../../../../lib/adminApi";

function toNumberOrUndefined(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
}

export default async function InventoryDetailPage({ params, searchParams }) {
    const p = await params;
    const productId = p?.productId;

    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Inventory Item</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }
    const result = await getInventoryItem(productId);

    if (result.res.status === 404) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Inventory Item</h1>
                    <p className="mt-2 text-sm text-zinc-700">Not found.</p>
                </div>
            </div>
        );
    }

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Inventory Item</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load inventory item.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const item = result.data?.inventory;
    const sp = await searchParams;
    const error = sp?.error;

    async function saveAction(formData) {
        "use server";

        const payload = {};

        const costPrice = String(formData.get("costPrice") ?? "").trim();
        const sellingPrice = String(formData.get("sellingPrice") ?? "").trim();
        const discountPercent = String(formData.get("discountPercent") ?? "").trim();

        const quantity = toNumberOrUndefined(formData.get("quantity"));
        const minQuantity = toNumberOrUndefined(formData.get("minQuantity"));

        if (costPrice !== "") payload.costPrice = costPrice;
        if (sellingPrice !== "") payload.sellingPrice = sellingPrice;
        if (discountPercent !== "") payload.discountPercent = discountPercent;
        if (quantity !== undefined) payload.quantity = quantity;
        if (minQuantity !== undefined) payload.minQuantity = minQuantity;

        const updateRes = await updateInventoryItem(productId, payload);
        if (!updateRes.res.ok) {
            const err = updateRes.data?.error || "UPDATE_FAILED";
            redirect(`/admin/inventory/${encodeURIComponent(productId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/inventory");
        redirect("/admin/inventory");
    }

    async function addQtyAction(formData) {
        "use server";

        const quantity = toNumberOrUndefined(formData.get("addQuantity"));
        const reason = String(formData.get("reason") || "ADJUSTMENT").trim() || "ADJUSTMENT";
        const referenceType = String(formData.get("referenceType") || "ADJUSTMENT").trim() || "ADJUSTMENT";
        const referenceIdRaw = String(formData.get("referenceId") || "").trim();

        const payload = {
            quantity,
            reason,
            referenceType,
            referenceId: referenceIdRaw ? referenceIdRaw : null,
        };

        const addRes = await addInventoryQuantity(productId, payload);
        if (!addRes.res.ok) {
            const err = addRes.data?.error || "ADD_QUANTITY_FAILED";
            redirect(`/admin/inventory/${encodeURIComponent(productId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/inventory");
        redirect(`/admin/inventory/${encodeURIComponent(productId)}`);
    }

    async function deleteAction() {
        "use server";

        const delRes = await deleteInventoryItem(productId);
        if (!delRes.res.ok && delRes.res.status !== 204) {
            const err = delRes.data?.error || "DELETE_FAILED";
            redirect(`/admin/inventory/${encodeURIComponent(productId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/inventory");
        redirect("/admin/inventory");
    }

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Edit Inventory</h1>
                        <p className="mt-1 text-sm text-zinc-600">{item?.productName}</p>
                    </div>
                    <Link href="/admin/inventory" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Back
                    </Link>
                </div>

                <div className="mt-4">
                    <Link
                        href={`/admin/inventory/${encodeURIComponent(productId)}/movements`}
                        className="text-sm text-zinc-900 underline underline-offset-4"
                    >
                        View movements
                    </Link>
                </div>

                {error ? (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        {String(error)}
                    </div>
                ) : null}

                <form action={saveAction} className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Cost price</label>
                            <input
                                name="costPrice"
                                defaultValue={item?.costPrice ?? ""}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Selling price</label>
                            <input
                                name="sellingPrice"
                                defaultValue={item?.sellingPrice ?? ""}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Discount percent</label>
                            <input
                                name="discountPercent"
                                defaultValue={item?.discountPercent ?? "0"}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Min quantity</label>
                            <input
                                name="minQuantity"
                                defaultValue={String(item?.minQuantity ?? 0)}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Quantity</label>
                        <input
                            name="quantity"
                            defaultValue={String(item?.quantity ?? 0)}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </div>

                    <button type="submit" className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                        Save
                    </button>
                </form>

                <form action={addQtyAction} className="mt-4 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="text-sm font-medium text-zinc-900">Add quantity</div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Quantity to add</label>
                        <input
                            name="addQuantity"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="1"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Reason</label>
                            <select
                                name="reason"
                                defaultValue="ADJUSTMENT"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            >
                                <option value="INITIAL_STOCK">INITIAL_STOCK</option>
                                <option value="PURCHASE">PURCHASE</option>
                                <option value="ADJUSTMENT">ADJUSTMENT</option>
                                <option value="ORDER_CANCELLED">ORDER_CANCELLED</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Reference type</label>
                            <select
                                name="referenceType"
                                defaultValue="ADJUSTMENT"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            >
                                <option value="ORDER">ORDER</option>
                                <option value="PURCHASE">PURCHASE</option>
                                <option value="ADJUSTMENT">ADJUSTMENT</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Reference ID (optional)</label>
                        <input
                            name="referenceId"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="orderId/purchaseId"
                        />
                    </div>

                    <button type="submit" className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Add
                    </button>
                </form>

                <form action={deleteAction} className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6">
                    <button type="submit" className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                        Delete inventory item
                    </button>
                </form>
            </div>
        </div>
    );
}
