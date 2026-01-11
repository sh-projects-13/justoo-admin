import Link from "next/link";

import { fetchMe, listInventory } from "../../../lib/adminApi";

import { ButtonLink, Card, InlineLink, Notice, Page, PageHeader } from "@/_components/ui";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <Page size="lg" className="max-w-5xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Inventory</h1>
                    <Notice className="mt-4">Unauthenticated.</Notice>
                </Card>
            </Page>
        );
    }

    const result = await listInventory();

    if (!result.res.ok) {
        return (
            <Page size="lg" className="max-w-5xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Inventory</h1>
                    <Notice className="mt-4">
                        Failed to load inventory.
                        <div className="mt-1 text-xs opacity-80">{result.data?.error || "UNKNOWN_ERROR"}</div>
                    </Notice>
                </Card>
            </Page>
        );
    }

    const rows = result.data?.inventory || [];

    return (
        <Page size="lg" className="max-w-6xl">
            <PageHeader
                title="Inventory"
                subtitle="View and manage stock."
                actions={
                    <>
                        <ButtonLink href="/admin">Back</ButtonLink>
                        <ButtonLink href="/admin/inventory/new" variant="primary">
                            New item
                        </ButtonLink>
                    </>
                }
            />

            <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink href="/admin/inventory/alerts/low-stock">Low stock alerts</ButtonLink>
                <ButtonLink href="/admin/inventory/alerts/out-of-stock">Out of stock alerts</ButtonLink>
            </div>

            <Card className="mt-6 overflow-hidden p-0">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                        <tr>
                            <th className="px-4 py-3 font-medium">Product</th>
                            <th className="px-4 py-3 font-medium">Qty</th>
                            <th className="px-4 py-3 font-medium">Min</th>
                            <th className="px-4 py-3 font-medium">Selling</th>
                            <th className="px-4 py-3 font-medium">Discount %</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.productId} className="border-b border-zinc-100 last:border-b-0">
                                <td className="px-4 py-3 text-zinc-900">{r.productName}</td>
                                <td className="px-4 py-3 text-zinc-700">{r.quantity}</td>
                                <td className="px-4 py-3 text-zinc-700">{r.minQuantity}</td>
                                <td className="px-4 py-3 text-zinc-700">{r.sellingPrice}</td>
                                <td className="px-4 py-3 text-zinc-700">{r.discountPercent}</td>
                                <td className="px-4 py-3">
                                    <InlineLink href={`/admin/inventory/${encodeURIComponent(r.productId)}`}>Edit</InlineLink>
                                </td>
                            </tr>
                        ))}
                        {!rows.length ? (
                            <tr>
                                <td className="px-4 py-6 text-zinc-600" colSpan={6}>
                                    No inventory items found.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </Card>
        </Page>
    );
}
