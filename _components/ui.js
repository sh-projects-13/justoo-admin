import Link from "next/link";

import { cn } from "../lib/cn";

export function AdminShell({ children }) {
    return <div className="min-h-screen bg-zinc-50 px-6 py-10">{children}</div>;
}

export function Shell({ children }) {
    return <div className="min-h-screen bg-zinc-50 px-6 py-10">{children}</div>;
}

export function Page({ size = "xl", className, children }) {
    return (
        <Shell>
            <Container size={size} className={className}>
                {children}
            </Container>
        </Shell>
    );
}

export function Container({ size = "xl", className, children }) {
    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-4xl",
        xl: "max-w-6xl",
    };

    return <div className={cn("mx-auto w-full", sizes[size] || sizes.xl, className)}>{children}</div>;
}

export function Card({ className, children }) {
    return <div className={cn("rounded-2xl border border-zinc-200 bg-white p-6", className)}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
                {subtitle ? <p className="mt-1 text-sm text-zinc-600">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
    );
}

export function Notice({ variant = "error", children, className }) {
    const styles =
        variant === "error"
            ? "border-red-200 bg-red-50 text-red-800"
            : variant === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-zinc-200 bg-zinc-50 text-zinc-800";

    return <div className={cn("rounded-2xl border p-4 text-sm", styles, className)}>{children}</div>;
}

export function Button({ variant = "primary", className, ...props }) {
    const base =
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium outline-none transition-colors focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-60";

    const styles =
        variant === "primary"
            ? "bg-zinc-900 text-white hover:bg-zinc-800"
            : variant === "secondary"
                ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
                : variant === "danger"
                    ? "border border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                    : "border border-zinc-200 bg-white text-zinc-900";

    return <button className={cn(base, styles, className)} {...props} />;
}

export function ButtonLink({ href, variant = "secondary", className, children, ...props }) {
    const base =
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium outline-none transition-colors focus:ring-2 focus:ring-zinc-900/10";

    const styles =
        variant === "primary"
            ? "bg-zinc-900 text-white hover:bg-zinc-800"
            : variant === "secondary"
                ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
                : variant === "danger"
                    ? "border border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                    : "border border-zinc-200 bg-white text-zinc-900";

    return (
        <Link href={href} className={cn(base, styles, className)} {...props}>
            {children}
        </Link>
    );
}

export function Field({ label, hint, children }) {
    return (
        <div className="space-y-1">
            {label ? <label className="block text-sm font-medium text-zinc-800">{label}</label> : null}
            {children}
            {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
        </div>
    );
}

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-shadow focus:ring-2 focus:ring-zinc-900/10",
                className,
            )}
            {...props}
        />
    );
}

export function Textarea({ className, ...props }) {
    return (
        <textarea
            className={cn(
                "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-shadow focus:ring-2 focus:ring-zinc-900/10",
                className,
            )}
            {...props}
        />
    );
}

export function InlineLink({ href, children }) {
    return (
        <Link href={href} className="text-zinc-900 underline underline-offset-4 hover:text-zinc-700">
            {children}
        </Link>
    );
}

export function ExternalLink({ href, children }) {
    return (
        <a
            className="text-zinc-900 underline underline-offset-4 hover:text-zinc-700"
            href={href}
            target="_blank"
            rel="noreferrer"
        >
            {children}
        </a>
    );
}
