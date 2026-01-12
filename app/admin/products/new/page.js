import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createProduct, fetchMe } from "../../../../lib/adminApi";
import { formatProductCategory, PRODUCT_CATEGORIES } from "../../../../lib/constants/productCategories";

import { SubmitButton } from "@/_components/submit-button";

export const dynamic = "force-dynamic";

function canMutateProducts(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && (roles.includes("SUPERADMIN") || roles.includes("ADMIN"));
}

export default async function NewProductPage({ searchParams }) {
    const me = await fetchMe();
    const currentAdmin = me.data?.admin;

    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">New Product</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    if (!canMutateProducts(currentAdmin)) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">New Product</h1>
                    <p className="mt-2 text-sm text-zinc-700">Forbidden.</p>
                </div>
            </div>
        );
    }

    async function action(formData) {
        "use server";

        const name = String(formData.get("name") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const isActive = formData.get("isActive") === "on";
        const productCategory = String(formData.get("productCategory") || "").trim() || "others";
        const image = formData.get("image");

        const payload = new FormData();
        payload.set("name", name);
        if (description) payload.set("description", description);
        payload.set("productCategory", productCategory);
        payload.set("isActive", String(isActive));
        if (image && typeof image === "object") {
            payload.set("image", image);
        }

        const result = await createProduct(payload);
        if (!result.res.ok) {
            const err = result.data?.error || "CREATE_FAILED";
            redirect(`/admin/products/new?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/products");
        redirect("/admin/products?toast=" + encodeURIComponent("Product created") + "&toastType=success");
    }

    const sp = await searchParams;
    const error = sp?.error;

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">New Product</h1>
                        <p className="mt-1 text-sm text-zinc-600">Create a product.</p>
                    </div>
                    <Link href="/admin/products" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
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
                        <label className="block text-sm font-medium text-zinc-800">Name</label>
                        <input
                            name="name"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="Product name"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="Optional"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Category</label>
                        <select
                            name="productCategory"
                            defaultValue="others"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                        >
                            {PRODUCT_CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {formatProductCategory(c)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-zinc-800">
                        <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4" />
                        Active
                    </label>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Image (optional)</label>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                        />
                    </div>

                    <SubmitButton className="w-full" pendingText="Creating…">
                        Create
                    </SubmitButton>
                </form>
            </div>
        </div>
    );
}
