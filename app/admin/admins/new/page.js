import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createAdmin, fetchMe } from "../../../../lib/adminApi";

function parseRoles(value) {
    const raw = String(value || "").trim();
    if (!raw) return undefined;
    return raw
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
}

export default async function NewAdminPage() {
    const me = await fetchMe();
    const currentAdmin = me.data?.admin;

    if (!me.res.ok || !(currentAdmin?.roles || []).includes("SUPERADMIN")) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">New Admin</h1>
                    <p className="mt-2 text-sm text-zinc-700">Forbidden.</p>
                </div>
            </div>
        );
    }

    async function action(formData) {
        "use server";

        const payload = {
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            password: String(formData.get("password") || "").trim(),
        };

        const roles = parseRoles(formData.get("roles"));
        if (roles !== undefined) payload.roles = roles;

        const result = await createAdmin(payload);
        if (!result.res.ok) {
            const err = result.data?.error || "CREATE_FAILED";
            redirect(`/admin/admins/new?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/admins");
        redirect("/admin/admins");
    }

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">New Admin</h1>
                        <p className="mt-1 text-sm text-zinc-600">Create an admin account.</p>
                    </div>
                    <Link href="/admin/admins" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Back
                    </Link>
                </div>

                <form action={action} className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Name</label>
                        <input
                            name="name"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="Jane Admin"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Roles (comma separated)</label>
                        <input
                            name="roles"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="ADMIN, SUPERADMIN"
                        />
                        <p className="text-xs text-zinc-500">Leave blank to use backend defaults.</p>
                    </div>

                    <button type="submit" className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
}
