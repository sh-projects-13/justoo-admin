import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createRider, fetchMe } from "../../../../lib/adminApi";

export const dynamic = "force-dynamic";

function normalizePhone10(value) {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.length >= 10 ? digits.slice(-10) : digits;
}

function canMutateRiders(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && (roles.includes("SUPERADMIN") || roles.includes("ADMIN"));
}

export default async function NewRiderPage({ searchParams }) {
    const me = await fetchMe();
    const currentAdmin = me.data?.admin;

    if (me.res.status === 401) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">New Rider</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unauthenticated.</p>
                </div>
            </div>
        );
    }

    if (!canMutateRiders(currentAdmin)) {
        return (
            <div className="min-h-screen bg-zinc-50 px-6 py-10">
                <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
                    <h1 className="text-xl font-semibold text-zinc-900">New Rider</h1>
                    <p className="mt-2 text-sm text-zinc-700">Forbidden.</p>
                </div>
            </div>
        );
    }

    async function action(formData) {
        "use server";

        const phoneRaw = String(formData.get("phone") || "").trim();
        const phone = normalizePhone10(phoneRaw);
        if (phone.length !== 10) {
            redirect(`/admin/riders/new?error=${encodeURIComponent("PHONE_MUST_BE_10_DIGITS")}`);
        }

        const payload = {
            name: String(formData.get("name") || "").trim(),
            phone,
            username: String(formData.get("username") || "").trim(),
            password: String(formData.get("password") || "").trim(),
            isActive: formData.get("isActive") === "on",
        };

        const result = await createRider(payload);
        if (!result.res.ok) {
            const err = result.data?.error || "CREATE_FAILED";
            redirect(`/admin/riders/new?error=${encodeURIComponent(err)}`);
        }

        revalidatePath("/admin/riders");
        redirect("/admin/riders");
    }

    const sp = await searchParams;
    const error = sp?.error;

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">New Rider</h1>
                        <p className="mt-1 text-sm text-zinc-600">Create a rider account.</p>
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

                <form action={action} className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Name</label>
                        <input
                            name="name"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="Rider name"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Phone</label>
                        <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white focus-within:ring-2 focus-within:ring-zinc-900/10">
                            <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700">+91</span>
                            <input
                                name="phone"
                                required
                                inputMode="numeric"
                                autoComplete="tel-national"
                                minLength={10}
                                maxLength={10}
                                className="w-full bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                                placeholder="9876543210"
                            />
                        </div>
                        <p className="text-xs text-zinc-500">Enter a 10-digit mobile number.</p>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-zinc-800">Username</label>
                        <input
                            name="username"
                            required
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            placeholder="rider_username"
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

                    <label className="flex items-center gap-2 text-sm text-zinc-800">
                        <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4" />
                        Active
                    </label>

                    <button type="submit" className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white">
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
}
