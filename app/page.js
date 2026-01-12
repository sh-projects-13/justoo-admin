import { fetchMe } from "../lib/adminApi";

import { ButtonLink, Card, Notice, Page } from "@/_components/ui";

export default async function Home() {
  const me = await fetchMe();
  const isSignedIn = me.res.ok;
  const admin = me.data?.admin;

  return (
    <Page size="lg" className="max-w-3xl">
      <Card className="rounded-3xl p-8 sm:p-10">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">Justoo</div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage admins, customers, inventory, orders, products, riders, and the phone whitelist.
          </p>
        </div>

        {isSignedIn ? (
          <Card className="mt-6 bg-zinc-50 p-4">
            <div className="text-sm text-zinc-600">Signed in</div>
            <div className="mt-1 text-sm font-medium text-zinc-900">{admin?.email || admin?.name || "Admin"}</div>
          </Card>
        ) : (
          <Notice variant="warning" className="mt-6">
            You&apos;re not signed in.
          </Notice>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {isSignedIn ? (
            <>
              <ButtonLink href="/admin" variant="primary" className="h-11">
                Go to admin
              </ButtonLink>
              <ButtonLink href="/logout" variant="secondary" className="h-11">
                Logout
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="primary" className="h-11">
                Login
              </ButtonLink>
              <ButtonLink href="/admin" variant="secondary" className="h-11">
                Open admin
              </ButtonLink>
            </>
          )}
        </div>

        <div className="mt-10 border-t border-zinc-100 pt-6 text-xs text-zinc-500">
          Tip: if you go directly to a protected page, youll be redirected to login.
        </div>
      </Card>
    </Page>
  );
}
