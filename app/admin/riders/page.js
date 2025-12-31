import Link from "next/link";

import { fetchMe, listRiders } from "../../../lib/adminApi";

import { ButtonLink, Card, InlineLink, Notice, Page, PageHeader } from "@/_components/ui";

function canMutateRiders(admin) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && (roles.includes("SUPERADMIN") || roles.includes("ADMIN"));
}

export default async function RidersPage() {
    const me = await fetchMe();
    if (me.res.status === 401) {
        return (
            <Page size="lg" className="max-w-6xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Riders</h1>
                    <Notice className="mt-4">Unauthenticated.</Notice>
                </Card>
            </Page>
        );
    }

    const currentAdmin = me.data?.admin;
    const canMutate = canMutateRiders(currentAdmin);

    const result = await listRiders();
    if (!result.res.ok) {
        return (
            <Page size="lg" className="max-w-6xl">
                <Card>
                    <h1 className="text-xl font-semibold text-zinc-900">Riders</h1>
                    <Notice className="mt-4">
                        Failed to load riders.
                        <div className="mt-1 text-xs opacity-80">{result.data?.error || "UNKNOWN_ERROR"}</div>
                    </Notice>
                </Card>
            </Page>
        );
    }

    const riders = result.data?.riders || [];

    return (
        <Page size="lg" className="max-w-6xl">
            <PageHeader
                title="Riders"
                subtitle="View and manage riders."
                actions={
                    <>
                        <ButtonLink href="/admin">Back</ButtonLink>
                        {canMutate ? (
                            <ButtonLink href="/admin/riders/new" variant="primary">
                                New rider
                            </ButtonLink>
                        ) : null}
                    </>
                }
            />

            <Card className="mt-6 overflow-hidden p-0">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Phone</th>
                            <th className="px-4 py-3 font-medium">Username</th>
                            <th className="px-4 py-3 font-medium">Active</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riders.map((r) => (
                            <tr key={r.id} className="border-b border-zinc-100 last:border-b-0">
                                <td className="px-4 py-3 text-zinc-900">{r.name}</td>
                                <td className="px-4 py-3 text-zinc-700">{r.phone}</td>
                                <td className="px-4 py-3 text-zinc-700">{r.username}</td>
                                <td className="px-4 py-3 text-zinc-700">{r.isActive ? "Yes" : "No"}</td>
                                <td className="px-4 py-3">
                                    <InlineLink href={`/admin/riders/${encodeURIComponent(r.id)}`}>{canMutate ? "Edit" : "View"}</InlineLink>
                                </td>
                            </tr>
                        ))}
                        {!riders.length ? (
                            <tr>
                                <td className="px-4 py-6 text-zinc-600" colSpan={5}>
                                    No riders found.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </Card>
        </Page>
    );
}
