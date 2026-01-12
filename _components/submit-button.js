"use client";

import { useFormStatus } from "react-dom";

import { cn } from "../lib/cn";

export function SubmitButton({
    children,
    pendingText = "Submitting…",
    variant = "primary",
    className,
    disabled,
    type = "submit",
    ...props
}) {
    const { pending } = useFormStatus();
    const isDisabled = Boolean(disabled || pending);

    const base =
        "inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2 text-sm font-medium outline-none transition-colors focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-200 disabled:text-zinc-500";

    const styles =
        variant === "primary"
            ? "bg-zinc-900 text-white hover:bg-zinc-800"
            : variant === "secondary"
                ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
                : variant === "danger"
                    ? "border border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                    : "border border-zinc-200 bg-white text-zinc-900";

    return (
        <button
            type={type}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            className={cn(base, styles, className)}
            {...props}
        >
            {pending ? pendingText : children}
        </button>
    );
}
