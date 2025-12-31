import Link from "next/link";

import { fetchMe, listRiders } from "../../../lib/adminApi";

function canMutateRiders(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && (roles.includes("SUPERADMIN") || roles.includes("ADMIN"));
}

export default async function RidersPage() {
    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Riders</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    const currentAdmin = me.data?.admin;
    const canMutate = canMutateRiders(currentAdmin);

    const result = await listRiders();
    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Riders</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load riders.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const riders = result.data?.riders || [];

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-6xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Riders</h1>
                        <p className="mt-1 text-sm text-zinc-600">View and manage riders.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                            Back
                        </Link>
                        {canMutate ? (
                            <Link href="/admin/riders/new" className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                                New rider
                            </Link>
                        ) : null}
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 font-medium">Username</th>
                                <th className="px-4 py-3 font-medium">Active</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riders.map((r) => (
                                <tr key={r.id} className="border-b border-zinc-100 last:border-b-0">
                                    <td className="px-4 py-3 text-zinc-900">{r.name}</td>
                                    <td className="px-4 py-3 text-zinc-700">{r.phone}</td>
                                    <td className="px-4 py-3 text-zinc-700">{r.username}</td>
                                    <td className="px-4 py-3 text-zinc-700">{r.isActive ? "Yes" : "No"}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/riders/${encodeURIComponent(r.id)}`}
                                            className="text-zinc-900 underline underline-offset-4"
                                        >
                                            {canMutate ? "Edit" : "View"}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {!riders.length ? (
                                <tr>
                                    <td className="px-4 py-6 text-zinc-600" colSpan={5}>
                                        No riders found.
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
