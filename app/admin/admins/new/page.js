import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createAdmin, fetchMe } from "../../../../lib/adminApi";

import { ButtonLink, Card, Notice, Page, PageHeader } from "@/_components/ui";

export const dynamic = "force-dynamic";

const ROLE_OPTIONS = ["SUPERADMIN", "ADMIN", "INVENTORY_VIEWER"];

export default async function NewAdminPage({ searchParams }) {
    const sp = await searchParams;
    const error = typeof sp?.error === "string" ? sp.error : "";

    const me = await fetchMe();
    const currentAdmin = me.data?.admin;

    if (!me.res.ok || !(currentAdmin?.roles || []).includes("SUPERADMIN")) {
        return (
            <Page size="lg" className="max-w-xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">New Admin</h1>
                    <Notice className="mt-4">Forbidden.</Notice>
                </Card>
            </Page>
        );
    }

    async function action(formData) {
        "use server";

        const payload = {
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            password: String(formData.get("password") || "").trim(),
        };

        const roles = formData
            .getAll("roles")
            .map((r) => String(r).trim())
            .filter(Boolean);
        if (roles.length) payload.roles = roles;

        const result = await createAdmin(payload);
        if (!result.res.ok) {
            const err = result.data?.error || "CREATE_FAILED";
            redirect(`/admin/admins/new?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/admins");
        redirect("/admin/admins");
    }

    return (
        <Page size="lg" className="max-w-xl">
            <PageHeader
                title="New Admin"
                subtitle="Create an admin account."
                actions={<ButtonLink href="/admin/admins">Back</ButtonLink>}
            />

            {error ? <Notice className="mt-4">{error}</Notice> : null}

            <Card className="mt-6">
                <form action={action} className="space-y-4">
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
                        <label className="block text-sm font-medium text-zinc-800">Role</label>
                        <select
                            name="roles"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                        >
                            {ROLE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                        Create
                    </button>
                </form>
            </Card>
        </Page>
    );
}
