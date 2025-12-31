import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { fetchMe, getCustomerById, updateCustomer, deleteCustomer } from "../../../../lib/adminApi";

export default async function CustomerDetailPage({ params, searchParams }) {
    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Customer</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    const customerId = params?.customerId;
    const result = await getCustomerById(customerId);

    if (result.res.status === 404) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Customer</h1>
                    <p className="mt-2 text-sm text-zinc-700">Not found.</p>
                </div>
            </div>
        );
    }

    if (!result.res.ok) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">Customer</h1>
                    <p className="mt-2 text-sm text-zinc-700">Failed to load customer.</p>
                    <p className="mt-1 text-xs text-zinc-500">{result.data?.error || "UNKNOWN_ERROR"}</p>
                </div>
            </div>
        );
    }

    const customer = result.data?.customer;

    async function saveAction(formData) {
        "use server";

        const payload = {
            name: String(formData.get("name") || "").trim(),
            phone: String(formData.get("phone") || "").trim() || undefined,
        };

        const emailValue = String(formData.get("email") ?? "");
        // backend allows email to be explicitly null/undefined-ish; safest is send empty string as null intent? We'll send empty string to clear.
        payload.email = emailValue.trim();

        const updateRes = await updateCustomer(customerId, payload);
        if (!updateRes.res.ok) {
            const err = updateRes.data?.error || "UPDATE_FAILED";
            redirect(`/admin/customers/${encodeURIComponent(customerId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/customers");
        redirect("/admin/customers");
    }

    async function deleteAction() {
        "use server";

        const delRes = await deleteCustomer(customerId);
        if (!delRes.res.ok && delRes.res.status !== 204) {
            const err = delRes.data?.error || "DELETE_FAILED";
            redirect(`/admin/customers/${encodeURIComponent(customerId)}?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/customers");
        redirect("/admin/customers");
    }

    const error = searchParams?.error;

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Edit Customer</h1>
                        <p className="mt-1 text-sm text-zinc-600">Update customer details.</p>
                    </div>
                    <Link href="/admin/customers" className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900">
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
                            defaultValue={customer?.name || ""}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Phone</label>
                        <input
                            name="phone"
                            defaultValue={customer?.phone || ""}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="+1 555 123 4567"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Email</label>
                        <input
                            name="email"
                            type="email"
                            defaultValue={customer?.email ?? ""}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="customer@example.com"
                        />
                        <p className="text-xs text-zinc-500">Leave blank to clear.</p>
                    </div>

                    <button type="submit" className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                        Save
                    </button>
                </form>

                <form action={deleteAction} className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6">
                    <button type="submit" className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                        Delete customer
                    </button>
                </form>
            </div>
        </div>
    );
}
