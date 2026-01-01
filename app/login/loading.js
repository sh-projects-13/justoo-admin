import { Card, Page } from "@/_components/ui";

export default function Loading() {
    return (
        <Page size="sm" className="flex items-center justify-center">
            <Card className="w-full max-w-sm">
                <div className="h-6 w-32 rounded bg-zinc-100" />
                <div className="mt-2 h-4 w-48 rounded bg-zinc-100" />
                <div className="mt-6 space-y-4">
                    <div className="h-10 w-full rounded-xl bg-zinc-100" />
                    <div className="h-10 w-full rounded-xl bg-zinc-100" />
                    <div className="h-10 w-full rounded-xl bg-zinc-100" />
                </div>
            </Card>
        </Page>
    );
}
