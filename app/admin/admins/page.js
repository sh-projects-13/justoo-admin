import Link from "next/link";

import { fetchMe, listAdmins } from "../../../lib/adminApi";

function hasSuperadminRole(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && roles.includes("SUPERADMIN");
}

export default async function AdminsPage() {
    const me = await fetchMe();

    if (!me.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Admins</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unable to load current admin.</p>
                </div>
            </div>
        );
    }

    const currentAdmin = me.data?.admin;
    if (!hasSuperadminRole(currentAdmin)) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Admins</h1>
                    <p className="mt-2 text-sm text-zinc-700">You don’t have permission to manage admins.</p>
                </div>
            </div>
        );
    }

    const result = await listAdmins();

    if (result.res.status === 403) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Admins</h1>
                    <p className="mt-2 text-sm text-zinc-700">Forbidden.</p>
                </div>
            </div>
        );
    }

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Admins</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load admins.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const admins = result.data?.admins || [];

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-4xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Admins</h1>
                        <p className="mt-1 text-sm text-zinc-600">Manage admin accounts.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                            Back
                        </Link>
                        <Link href="/admin/admins/new" className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                            New admin
                        </Link>
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Roles</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((a) => (
                                <tr key={a.id} className="border-b border-zinc-100 last:border-b-0">
                                    <td className="px-4 py-3 text-zinc-900">{a.name}</td>
                                    <td className="px-4 py-3 text-zinc-700">{a.email}</td>
                                    <td className="px-4 py-3 text-zinc-700">{(a.roles || []).join(", ") || "—"}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/admins/${encodeURIComponent(a.id)}`}
                                            className="text-zinc-900 underline underline-offset-4"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {!admins.length ? (
                                <tr>
                                    <td className="px-4 py-6 text-zinc-600" colSpan={4}>
                                        No admins found.
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
