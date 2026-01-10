import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createInventoryItem, fetchMe, listProducts } from "../../../../lib/adminApi";

export default async function NewInventoryItemPage({ searchParams }) {
    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">New Inventory Item</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    const productsRes = await listProducts();
    const products = productsRes.res.ok ? productsRes.data?.products || [] : [];

    async function action(formData) {
        "use server";

        const payload = {
            productId: String(formData.get("productId") || "").trim(),
            costPrice: String(formData.get("costPrice") || "").trim(),
            sellingPrice: String(formData.get("sellingPrice") || "").trim(),
            discountPercent: String(formData.get("discountPercent") || "0").trim() || "0",
            quantity: Number(String(formData.get("quantity") || "").trim()),
            minQuantity: Number(String(formData.get("minQuantity") || "0").trim() || 0),
        };

        const result = await createInventoryItem(payload);
        if (!result.res.ok) {
            const err = result.data?.error || "CREATE_FAILED";
            redirect(`/admin/inventory/new?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/inventory");
        redirect("/admin/inventory?toast=" + encodeURIComponent("Inventory created") + "&toastType=success");
    }

    const sp = await searchParams;
    const error = sp?.error;

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">New Inventory Item</h1>
                        <p className="mt-1 text-sm text-zinc-600">Create inventory for a product.</p>
                    </div>
                    <Link href="/admin/inventory" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Back
                    </Link>
                </div>

                {error ? (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        {String(error)}
                    </div>
                ) : null}

                <form action={action} className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Product</label>
                        <select
                            name="productId"
                            required
                            defaultValue=""
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                        >
                            <option value="" disabled>
                                Select a product…
                            </option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        {!productsRes.res.ok ? (
                            <p className="text-xs text-zinc-500">Could not load products list. You can’t create inventory until products load.</p>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Cost price</label>
                            <input
                                name="costPrice"
                                required
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Selling price</label>
                            <input
                                name="sellingPrice"
                                required
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Discount percent</label>
                            <input
                                name="discountPercent"
                                defaultValue="0"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Min quantity</label>
                            <input
                                name="minQuantity"
                                defaultValue="0"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Initial quantity</label>
                        <input
                            name="quantity"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="0"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!productsRes.res.ok || products.length === 0}
                        className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
}
