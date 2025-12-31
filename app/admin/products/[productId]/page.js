import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { deleteProduct, fetchMe, getProductById, updateProduct } from "../../../../lib/adminApi";

function canMutateProducts(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && (roles.includes("SUPERADMIN") || roles.includes("ADMIN"));
}

export default async function ProductDetailPage({ params, searchParams }) {
    const me = await fetchMe();
    const currentAdmin = me.data?.admin;

    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Product</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    const productId = params?.productId;
    const result = await getProductById(productId);

    if (result.res.status === 404) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Product</h1>
                    <p className="mt-2 text-sm text-zinc-700">Not found.</p>
                </div>
            </div>
        );
    }

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Product</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load product.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const product = result.data?.product;
    const canMutate = canMutateProducts(currentAdmin);
    const error = searchParams?.error;

    async function saveAction(formData) {
        "use server";

        if (!canMutateProducts(currentAdmin)) {
            redirect(`/admin/products/${encodeURIComponent(productId)}?error=${encodeURIComponent("ADMIN_FORBIDDEN")}`);
        }

        const name = String(formData.get("name") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const isActive = formData.get("isActive") === "on";
        const image = formData.get("image");

        const payload = new FormData();
        if (name) payload.set("name", name);
        payload.set("description", description);
        payload.set("isActive", String(isActive));
        if (image && typeof image === "object" && image.size) {
            payload.set("image", image);
        }

        const updateRes = await updateProduct(productId, payload);
        if (!updateRes.res.ok) {
            const err = updateRes.data?.error || "UPDATE_FAILED";
            redirect(`/admin/products/${encodeURIComponent(productId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/products");
        redirect("/admin/products");
    }

    async function deleteAction() {
        "use server";

        if (!canMutateProducts(currentAdmin)) {
            redirect(`/admin/products/${encodeURIComponent(productId)}?error=${encodeURIComponent("ADMIN_FORBIDDEN")}`);
        }

        const delRes = await deleteProduct(productId);
        if (!delRes.res.ok && delRes.res.status !== 204) {
            const err = delRes.data?.error || "DELETE_FAILED";
            redirect(`/admin/products/${encodeURIComponent(productId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/products");
        redirect("/admin/products");
    }

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">{canMutate ? "Edit Product" : "Product"}</h1>
                        <p className="mt-1 text-sm text-zinc-600">{product?.id}</p>
                    </div>
                    <Link href="/admin/products" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Back
                    </Link>
                </div>

                {product?.imgUrl ? (
                    <div className="mt-4 text-sm">
                        <a className="text-zinc-900 underline underline-offset-4" href={product.imgUrl} target="_blank" rel="noreferrer">
                            View current image
                        </a>
                    </div>
                ) : null}

                {error ? (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        {String(error)}
                    </div>
                ) : null}

                <form action={saveAction} className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Name</label>
                        <input
                            name="name"
                            required
                            disabled={!canMutate}
                            defaultValue={product?.name || ""}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-60"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            disabled={!canMutate}
                            defaultValue={product?.description || ""}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-60"
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-zinc-800">
                        <input name="isActive" type="checkbox" defaultChecked={!!product?.isActive} disabled={!canMutate} className="h-4 w-4" />
                        Active
                    </label>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Replace image (optional)</label>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            disabled={!canMutate}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-60"
                        />
                    </div>

                    {canMutate ? (
                        <button type="submit" className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                            Save
                        </button>
                    ) : (
                        <div className="text-sm text-zinc-600">You don’t have permission to edit products.</div>
                    )}
                </form>

                {canMutate ? (
                    <form action={deleteAction} className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6">
                        <button type="submit" className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                            Delete product
                        </button>
                    </form>
                ) : null}
            </div>
        </div>
    );
}
