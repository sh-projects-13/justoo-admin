import Link from "next/link";

import { fetchMe, listProducts } from "../../../lib/adminApi";

function canMutateProducts(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && (roles.includes("SUPERADMIN") || roles.includes("ADMIN"));
}

export default async function ProductsPage() {
    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Products</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    const currentAdmin = me.data?.admin;
    const canMutate = canMutateProducts(currentAdmin);

    const result = await listProducts();

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Products</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load products.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const products = result.data?.products || [];

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-6xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Products</h1>
                        <p className="mt-1 text-sm text-zinc-600">View and manage products.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                            Back
                        </Link>
                        {canMutate ? (
                            <Link href="/admin/products/new" className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                                New product
                            </Link>
                        ) : null}
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Active</th>
                                <th className="px-4 py-3 font-medium">Image</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id} className="border-b border-zinc-100 last:border-b-0">
                                    <td className="px-4 py-3 text-zinc-900">{p.name}</td>
                                    <td className="px-4 py-3 text-zinc-700">{p.isActive ? "Yes" : "No"}</td>
                                    <td className="px-4 py-3 text-zinc-700">
                                        {p.imgUrl ? (
                                            <a className="underline underline-offset-4" href={p.imgUrl} target="_blank" rel="noreferrer">
                                                View
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/products/${encodeURIComponent(p.id)}`}
                                            className="text-zinc-900 underline underline-offset-4"
                                        >
                                            {canMutate ? "Edit" : "View"}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {!products.length ? (
                                <tr>
                                    <td className="px-4 py-6 text-zinc-600" colSpan={4}>
                                        No products found.
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
