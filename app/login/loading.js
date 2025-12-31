export default function Loading() {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="h-6 w-32 rounded bg-zinc-100" />
                <div className="mt-2 h-4 w-48 rounded bg-zinc-100" />
                <div className="mt-6 space-y-4">
                    <div className="h-10 w-full rounded-xl bg-zinc-100" />
                    <div className="h-10 w-full rounded-xl bg-zinc-100" />
                    <div className="h-10 w-full rounded-xl bg-zinc-100" />
                </div>
            </div>
        </div>
    );
}
