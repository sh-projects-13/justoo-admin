import Link from "next/link";

import { fetchMe, listProducts } from "../../../lib/adminApi";
import { formatProductCategory } from "../../../lib/constants/productCategories";

import { ButtonLink, Card, ExternalLink, InlineLink, Notice, Page, PageHeader } from "@/_components/ui";

// Ensure this page is always dynamically rendered (not cached/static)
export const dynamic = "force-dynamic";

function canMutateProducts(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && (roles.includes("SUPERADMIN") || roles.includes("ADMIN"));
}

export default async function ProductsPage() {
    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <Page size="lg" className="max-w-6xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Products</h1>
                    <Notice className="mt-4">Unauthenticated.</Notice>
                </Card>
            </Page>
        );
    }

    const currentAdmin = me.data?.admin;
    const canMutate = canMutateProducts(currentAdmin);

    const result = await listProducts();

    if (!result.res.ok) {
        return (
            <Page size="lg" className="max-w-6xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Products</h1>
                    <Notice className="mt-4">
                        Failed to load products.
                        <div className="mt-1 text-xs opacity-80">{result.data?.error || "UNKNOWN_ERROR"}</div>
                    </Notice>
                </Card>
            </Page>
        );
    }

    const products = result.data?.products || [];

    return (
        <Page size="lg" className="max-w-6xl">
            <PageHeader
                title="Products"
                subtitle="View and manage products."
                actions={
                    <>
                        <ButtonLink href="/admin">Back</ButtonLink>
                        {canMutate ? (
                            <ButtonLink href="/admin/products/new" variant="primary">
                                New product
                            </ButtonLink>
                        ) : null}
                    </>
                }
            />

            <Card className="mt-6 overflow-hidden p-0">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Category</th>
                            <th className="px-4 py-3 font-medium">Active</th>
                            <th className="px-4 py-3 font-medium">Image</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="border-b border-zinc-100 last:border-b-0">
                                <td className="px-4 py-3 text-zinc-900">{p.name}</td>
                                <td className="px-4 py-3 text-zinc-700">{formatProductCategory(p.productCategory)}</td>
                                <td className="px-4 py-3 text-zinc-700">{p.isActive ? "Yes" : "No"}</td>
                                <td className="px-4 py-3 text-zinc-700">
                                    {p.imgUrl ? (
                                        <ExternalLink href={p.imgUrl}>View</ExternalLink>
                                    ) : (
                                        "—"
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <InlineLink href={`/admin/products/${encodeURIComponent(p.id)}`}>{canMutate ? "Edit" : "View"}</InlineLink>
                                </td>
                            </tr>
                        ))}
                        {!products.length ? (
                            <tr>
                                <td className="px-4 py-6 text-zinc-600" colSpan={5}>
                                    No products found.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </Card>
        </Page>
    );
}
