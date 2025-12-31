import Link from "next/link";

export default function AdminHomePage() {
    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10">
            <div className="mx-auto w-full max-w-4xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-zinc-900">Admin</h1>
                    <Link
                        href="/logout"
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                    >
                        Logout
                    </Link>
                </div>

                <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-700">
                    <div className="flex flex-col gap-3">
                        <div>You’re signed in.</div>
                        <div>
                            <Link href="/admin/admins" className="text-zinc-900 underline underline-offset-4">
                                Manage admins
                            </Link>
                        </div>
                        <div>
                            <Link href="/admin/customers" className="text-zinc-900 underline underline-offset-4">
                                Manage customers
                            </Link>
                        </div>
                        <div>
                            <Link href="/admin/inventory" className="text-zinc-900 underline underline-offset-4">
                                Manage inventory
                            </Link>
                        </div>
                        <div>
                            <Link href="/admin/orders" className="text-zinc-900 underline underline-offset-4">
                                Manage orders
                            </Link>
                        </div>
                        <div>
                            <Link href="/admin/products" className="text-zinc-900 underline underline-offset-4">
                                Manage products
                            </Link>
                        </div>
                        <div>
                            <Link href="/admin/riders" className="text-zinc-900 underline underline-offset-4">
                                Manage riders
                            </Link>
                        </div>
                        <div>
                            <Link href="/admin/whitelist" className="text-zinc-900 underline underline-offset-4">
                                Manage phone whitelist
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
