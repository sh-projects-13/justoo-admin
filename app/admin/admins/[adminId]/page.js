import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { fetchMe, getAdminById, updateAdmin, deleteAdmin } from "../../../../lib/adminApi";

function parseRoles(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return [];
    return raw
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
}

export default async function AdminDetailPage({ params, searchParams }) {
    const p = await params;
    const adminId = p?.adminId;

    const me = await fetchMe();
    const currentAdmin = me.data?.admin;

    if (!me.res.ok || !(currentAdmin?.roles || []).includes("SUPERADMIN")) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Admin</h1>
                    <p className="mt-2 text-sm text-zinc-700">Forbidden.</p>
                </div>
            </div>
        );
    }

    const result = await getAdminById(adminId);

    if (result.res.status === 404) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Admin</h1>
                    <p className="mt-2 text-sm text-zinc-700">Not found.</p>
                </div>
            </div>
        );
    }

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Admin</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load admin.</p>
                </div>
            </div>
        );
    }

    const admin = result.data?.admin;

    async function saveAction(formData) {
        "use server";

        const payload = {
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            roles: parseRoles(formData.get("roles")),
        };

        const password = String(formData.get("password") || "").trim();
        if (password) payload.password = password;

        const updateRes = await updateAdmin(adminId, payload);
        if (!updateRes.res.ok) {
            const err = updateRes.data?.error || "UPDATE_FAILED";
            redirect(`/admin/admins/${encodeURIComponent(adminId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/admins");
        redirect("/admin/admins");
    }

    async function deleteAction() {
        "use server";

        const delRes = await deleteAdmin(adminId);
        if (!delRes.res.ok && delRes.res.status !== 204) {
            const err = delRes.data?.error || "DELETE_FAILED";
            redirect(`/admin/admins/${encodeURIComponent(adminId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/admins");
        redirect("/admin/admins");
    }

    const sp = await searchParams;
    const error = sp?.error;

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Edit Admin</h1>
                        <p className="mt-1 text-sm text-zinc-600">Update admin details.</p>
                    </div>
                    <Link href="/admin/admins" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Back
                    </Link>
                </div>

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
                            defaultValue={admin?.name || ""}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            defaultValue={admin?.email || ""}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Password (leave blank to keep)</label>
                        <input
                            name="password"
                            type="password"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Roles (comma separated)</label>
                        <input
                            name="roles"
                            defaultValue={(admin?.roles || []).join(", ")}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="ADMIN, SUPERADMIN"
                        />
                        <p className="text-xs text-zinc-500">Clearing the field will remove all roles.</p>
                    </div>

                    <button type="submit" className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                        Save
                    </button>
                </form>

                <form action={deleteAction} className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6">
                    <button type="submit" className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                        Delete admin
                    </button>
                </form>
            </div>
        </div>
    );
}
