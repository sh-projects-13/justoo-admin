import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { deleteRider, fetchMe, getRiderById, updateRider } from "../../../../lib/adminApi";

function canMutateRiders(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && (roles.includes("SUPERADMIN") || roles.includes("ADMIN"));
}

export default async function RiderDetailPage({ params, searchParams }) {
    const me = await fetchMe();
    const currentAdmin = me.data?.admin;

    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Rider</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    const riderId = params?.riderId;
    const result = await getRiderById(riderId);

    if (result.res.status === 404) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Rider</h1>
                    <p className="mt-2 text-sm text-zinc-700">Not found.</p>
                </div>
            </div>
        );
    }

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Rider</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load rider.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const rider = result.data?.rider;
    const canMutate = canMutateRiders(currentAdmin);
    const sp = await searchParams;
    const error = sp?.error;

    async function saveAction(formData) {
        "use server";

        if (!canMutateRiders(currentAdmin)) {
            redirect(`/admin/riders/${encodeURIComponent(riderId)}?error=${encodeURIComponent("ADMIN_FORBIDDEN")}`);
        }

        const payload = {
            name: String(formData.get("name") || "").trim(),
            phone: String(formData.get("phone") || "").trim(),
            username: String(formData.get("username") || "").trim(),
            isActive: formData.get("isActive") === "on",
        };

        const password = String(formData.get("password") || "").trim();
        if (password) payload.password = password;

        const updateRes = await updateRider(riderId, payload);
        if (!updateRes.res.ok) {
            const err = updateRes.data?.error || "UPDATE_FAILED";
            redirect(`/admin/riders/${encodeURIComponent(riderId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/riders");
        redirect("/admin/riders");
    }

    async function deleteAction() {
        "use server";

        if (!canMutateRiders(currentAdmin)) {
            redirect(`/admin/riders/${encodeURIComponent(riderId)}?error=${encodeURIComponent("ADMIN_FORBIDDEN")}`);
        }

        const delRes = await deleteRider(riderId);
        if (!delRes.res.ok && delRes.res.status !== 204) {
            const err = delRes.data?.error || "DELETE_FAILED";
            redirect(`/admin/riders/${encodeURIComponent(riderId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/riders");
        redirect("/admin/riders");
    }

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">{canMutate ? "Edit Rider" : "Rider"}</h1>
                        <p className="mt-1 text-sm text-zinc-600">{rider?.id}</p>
                    </div>
                    <Link href="/admin/riders" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
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
                            disabled={!canMutate}
                            defaultValue={rider?.name || ""}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-60"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Phone</label>
                        <input
                            name="phone"
                            required
                            disabled={!canMutate}
                            defaultValue={rider?.phone || ""}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-60"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Username</label>
                        <input
                            name="username"
                            required
                            disabled={!canMutate}
                            defaultValue={rider?.username || ""}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-60"
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-zinc-800">
                        <input name="isActive" type="checkbox" defaultChecked={!!rider?.isActive} disabled={!canMutate} className="h-4 w-4" />
                        Active
                    </label>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Password (leave blank to keep)</label>
                        <input
                            name="password"
                            type="password"
                            disabled={!canMutate}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-60"
                            placeholder="••••••••"
                        />
                    </div>

                    {canMutate ? (
                        <button type="submit" className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                            Save
                        </button>
                    ) : (
                        <div className="text-sm text-zinc-600">You don’t have permission to edit riders.</div>
                    )}
                </form>

                {canMutate ? (
                    <form action={deleteAction} className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6">
                        <button type="submit" className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                            Delete rider
                        </button>
                    </form>
                ) : null}
            </div>
        </div>
    );
}
