import Link from "next/link";

import { fetchMe, listCustomers } from "../../../lib/adminApi";

import { ButtonLink, Card, InlineLink, Notice, Page, PageHeader } from "@/_components/ui";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
    const me = await fetchMe();

    if (me.res.status === 401) {
        return (
            <Page size="lg" className="max-w-4xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Customers</h1>
                    <Notice className="mt-4">Unauthenticated.</Notice>
                </Card>
            </Page>
        );
    }

    const result = await listCustomers();

    if (!result.res.ok) {
        return (
            <Page size="lg" className="max-w-4xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Customers</h1>
                    <Notice className="mt-4">
                        Failed to load customers.
                        <div className="mt-1 text-xs opacity-80">{result.data?.error || "UNKNOWN_ERROR"}</div>
                    </Notice>
                </Card>
            </Page>
        );
    }

    const customers = result.data?.customers || [];

    return (
        <Page size="lg" className="max-w-4xl">
            <PageHeader
                title="Customers"
                subtitle="Manage customers."
                actions={<ButtonLink href="/admin">Back</ButtonLink>}
            />

            <Card className="mt-6 overflow-hidden p-0">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Phone</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((c) => (
                            <tr key={c.id} className="border-b border-zinc-100 last:border-b-0">
                                <td className="px-4 py-3 text-zinc-900">{c.name}</td>
                                <td className="px-4 py-3 text-zinc-700">{c.phone || "—"}</td>
                                <td className="px-4 py-3 text-zinc-700">{c.email ?? "—"}</td>
                                <td className="px-4 py-3">
                                    <InlineLink href={`/admin/customers/${encodeURIComponent(c.id)}`}>Edit</InlineLink>
                                </td>
                            </tr>
                        ))}
                        {!customers.length ? (
                            <tr>
                                <td className="px-4 py-6 text-zinc-600" colSpan={4}>
                                    No customers found.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </Card>
        </Page>
    );
}
