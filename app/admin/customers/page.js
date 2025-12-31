import Link from "next/link";

import { fetchMe, listCustomers } from "../../../lib/adminApi";

export default async function CustomersPage() {
    const me = await fetchMe();

    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Customers</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    const result = await listCustomers();

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Customers</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load customers.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const customers = result.data?.customers || [];

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-4xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Customers</h1>
                        <p className="mt-1 text-sm text-zinc-600">Manage customers.</p>
                    </div>
                    <Link href="/admin" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Back
                    </Link>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
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
                                        <Link
                                            href={`/admin/customers/${encodeURIComponent(c.id)}`}
                                            className="text-zinc-900 underline underline-offset-4"
                                        >
                                            Edit
                                        </Link>
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
                </div>
            </div>
        </div>
    );
}
