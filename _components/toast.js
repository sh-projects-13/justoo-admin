"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";

export function AppToaster() {
    return (
        <Toaster
            richColors
            closeButton
            position="top-right"
            toastOptions={{
                duration: 3500,
            }}
        />
    );
}

/**
 * Shows toasts based on URL query params so server actions can trigger UX feedback.
 * Supported params:
 * - toast: message
 * - toastType: success | error | info | warning
 */
export function ToastListener() {
    const sp = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const lastKeyRef = useRef("");

    useEffect(() => {
        const message = sp.get("toast");
        if (!message) return;

        const type = (sp.get("toastType") || "info").toLowerCase();
        const key = `${pathname}|${type}|${message}`;
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;

        const decoded = safeDecodeURIComponent(message);

        if (type === "success") toast.success(decoded);
        else if (type === "error") toast.error(decoded);
        else if (type === "warning") toast.warning(decoded);
        else toast.message(decoded);

        // Remove toast params so it doesn't re-fire on refresh.
        const next = new URLSearchParams(sp.toString());
        next.delete("toast");
        next.delete("toastType");

        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [sp, router, pathname]);

    return null;
}

function safeDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}
