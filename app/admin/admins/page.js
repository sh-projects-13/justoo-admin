import Link from "next/link";

import { fetchMe, listAdmins } from "../../../lib/adminApi";

import { ButtonLink, Card, InlineLink, Notice, Page, PageHeader } from "@/_components/ui";

function hasSuperadminRole(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && roles.includes("SUPERADMIN");
}

export default async function AdminsPage() {
    const me = await fetchMe();

    if (!me.res.ok) {
        return (
            <Page size="lg" className="max-w-4xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Admins</h1>
                    <p className="mt-2 text-sm text-zinc-700">Unable to load current admin.</p>
                </Card>
            </Page>
        );
    }

    const currentAdmin = me.data?.admin;
    if (!hasSuperadminRole(currentAdmin)) {
        return (
            <Page size="lg" className="max-w-4xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Admins</h1>
                    <Notice className="mt-4">You don’t have permission to manage admins.</Notice>
                </Card>
            </Page>
        );
    }

    const result = await listAdmins();

    if (result.res.status === 403) {
        return (
            <Page size="lg" className="max-w-4xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Admins</h1>
                    <Notice className="mt-4">Forbidden.</Notice>
                </Card>
            </Page>
        );
    }

    if (!result.res.ok) {
        return (
            <Page size="lg" className="max-w-4xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Admins</h1>
                    <Notice className="mt-4">
                        Failed to load admins.
                        <div className="mt-1 text-xs opacity-80">{result.data?.error || "UNKNOWN_ERROR"}</div>
                    </Notice>
                </Card>
            </Page>
        );
    }

    const admins = result.data?.admins || [];

    return (
        <Page size="lg" className="max-w-4xl">
            <PageHeader
                title="Admins"
                subtitle="Manage admin accounts."
                actions={
                    <>
                        <ButtonLink href="/admin">Back</ButtonLink>
                        <ButtonLink href="/admin/admins/new" variant="primary">
                            New admin
                        </ButtonLink>
                    </>
                }
            />

            <Card className="mt-6 overflow-hidden p-0">
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
                                    <InlineLink href={`/admin/admins/${encodeURIComponent(a.id)}`}>Edit</InlineLink>
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
            </Card>
        </Page>
    );
}
