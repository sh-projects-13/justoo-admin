import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
    addPhoneToWhitelist,
    deletePhoneFromWhitelist,
    fetchMe,
    listWhitelistedPhones,
} from "../../../lib/adminApi";

function canManageWhitelist(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && (roles.includes("SUPERADMIN") || roles.includes("ADMIN"));
}

export default async function WhitelistPage({ searchParams }) {
    const me = await fetchMe();
    const currentAdmin = me.data?.admin;

    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Phone Whitelist</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    if (!canManageWhitelist(currentAdmin)) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Phone Whitelist</h1>
                    <p className="mt-2 text-sm text-zinc-700">Forbidden.</p>
                </div>
            </div>
        );
    }

    async function addAction(formData) {
        "use server";

        const phone = String(formData.get("phone") || "").trim();
        const result = await addPhoneToWhitelist({ phone });

        if (!result.res.ok) {
            const err = result.data?.error || "ADD_FAILED";
            redirect(`/admin/whitelist?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/whitelist");
        redirect("/admin/whitelist");
    }

    async function deleteAction(formData) {
        "use server";

        const phone = String(formData.get("phone") || "").trim();
        const result = await deletePhoneFromWhitelist(phone);

        if (!result.res.ok && result.res.status !== 204) {
            const err = result.data?.error || "DELETE_FAILED";
            redirect(`/admin/whitelist?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/whitelist");
        redirect("/admin/whitelist");
    }

    const error = searchParams?.error;

    const listRes = await listWhitelistedPhones();
    if (!listRes.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Phone Whitelist</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load whitelist.</p>
                    <p className="mt-1 text-xs text-zinc-500">{listRes.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const phones = listRes.data?.phones || [];

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-5xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Phone Whitelist</h1>
                        <p className="mt-1 text-sm text-zinc-600">Allow-listed phone numbers.</p>
                    </div>
                    <Link href="/admin" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
                        Back
                    </Link>
                </div>

                {error ? (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        {String(error)}
                    </div>
                ) : null}

                <form action={addAction} className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="text-sm font-medium text-zinc-900">Add phone</div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-1">
                            <label className="block text-sm font-medium text-zinc-800">Phone</label>
                            <input
                                name="phone"
                                required
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                                placeholder="+1 555 123 4567"
                            />
                        </div>
                        <button type="submit" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
                            Add
                        </button>
                    </div>
                </form>

                <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                            <tr>
                                <th className="px-4 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 font-medium">Added by</th>
                                <th className="px-4 py-3 font-medium">Created</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {phones.map((p) => (
                                <tr key={p.phone} className="border-b border-zinc-100 last:border-b-0">
                                    <td className="px-4 py-3 text-zinc-900">{p.phone}</td>
                                    <td className="px-4 py-3 text-zinc-700">{p.addedByAdminId || "—"}</td>
                                    <td className="px-4 py-3 text-zinc-700">{String(p.createdAt || "")}</td>
                                    <td className="px-4 py-3">
                                        <form action={deleteAction}>
                                            <input type="hidden" name="phone" value={p.phone} />
                                            <button
                                                type="submit"
                                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {!phones.length ? (
                                <tr>
                                    <td className="px-4 py-6 text-zinc-600" colSpan={4}>
                                        No phones whitelisted.
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
