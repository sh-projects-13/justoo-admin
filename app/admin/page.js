import Link from "next/link";

import { ButtonLink, Card, Page, PageHeader } from "@/_components/ui";

export default function AdminHomePage() {
    return (
        <Page size="lg" className="max-w-5xl">
            <PageHeader
                title="Admin"
                subtitle="You&apos;re signed in. Choose a section to manage."
                actions={<ButtonLink href="/logout">Logout</ButtonLink>}
            />

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link href="/admin/admins" className="block">
                    <Card className="h-full hover:bg-zinc-50">
                        <div className="text-sm font-medium text-zinc-900">Admins</div>
                        <div className="mt-1 text-sm text-zinc-600">Create, update, and remove admin accounts.</div>
                    </Card>
                </Link>

                <Link href="/admin/customers" className="block">
                    <Card className="h-full hover:bg-zinc-50">
                        <div className="text-sm font-medium text-zinc-900">Customers</div>
                        <div className="mt-1 text-sm text-zinc-600">View and edit customer details.</div>
                    </Card>
                </Link>

                <Link href="/admin/inventory" className="block">
                    <Card className="h-full hover:bg-zinc-50">
                        <div className="text-sm font-medium text-zinc-900">Inventory</div>
                        <div className="mt-1 text-sm text-zinc-600">Stock levels, movements, and alerts.</div>
                    </Card>
                </Link>

                <Link href="/admin/orders" className="block">
                    <Card className="h-full hover:bg-zinc-50">
                        <div className="text-sm font-medium text-zinc-900">Orders</div>
                        <div className="mt-1 text-sm text-zinc-600">Track orders, view events, and cancel when needed.</div>
                    </Card>
                </Link>

                <Link href="/admin/products" className="block">
                    <Card className="h-full hover:bg-zinc-50">
                        <div className="text-sm font-medium text-zinc-900">Products</div>
                        <div className="mt-1 text-sm text-zinc-600">Create products and manage images.</div>
                    </Card>
                </Link>

                <Link href="/admin/riders" className="block">
                    <Card className="h-full hover:bg-zinc-50">
                        <div className="text-sm font-medium text-zinc-900">Riders</div>
                        <div className="mt-1 text-sm text-zinc-600">Create and manage rider accounts.</div>
                    </Card>
                </Link>

                <Link href="/admin/whitelist" className="block sm:col-span-2">
                    <Card className="h-full hover:bg-zinc-50">
                        <div className="text-sm font-medium text-zinc-900">Phone whitelist</div>
                        <div className="mt-1 text-sm text-zinc-600">Allow-listed phone numbers for access.</div>
                    </Card>
                </Link>
            </div>
        </Page>
    );
}
