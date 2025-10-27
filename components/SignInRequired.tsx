import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/util";
import { LogIn, UserPlus } from "lucide-react";

export interface SignInRequiredProps {
    /**
     * A message to display to the user
     */
    message?: string;
    className?: string;
}

export function SignInRequired({ message, className }: SignInRequiredProps) {
    const router = useRouter();

    // Preserve return destination if available (e.g., /task/123)
    const nextParam = useMemo(() => {
        const path = router?.asPath || "";
        if (!path) return undefined;
        // Avoid pointing next back to auth pages
        if (path.startsWith("/sign-in") || path.startsWith("/register")) return undefined;
        return encodeURIComponent(path);
    }, [router?.asPath]);

    const signInHref = nextParam ? `/sign-in?next=${nextParam}` : "/sign-in";
    const registerHref = nextParam ? `/register?next=${nextParam}` : "/register";

    const copy =
        message?.trim() ||
        "Please sign in to continue.";

    return (
        <section
            className={cn(
                "card p-6 sm:p-8 text-center flex flex-col items-center gap-4",
                className
            )}
            aria-labelledby="sign-in-required-heading"
        >
            <div className="brand-frame rounded-full p-3">
                <Logo className="w-10 h-10" />
            </div>

            <div className="flex flex-col items-center gap-1">
                <h2 id="sign-in-required-heading" className="text-xl font-semibold">
                    Sign in required
                </h2>
                <p className="text-zinc-700 max-w-prose">{copy}</p>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Link href={signInHref} className="btn-primary inline-flex items-center justify-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in
                </Link>
                <Link href={registerHref} className="btn-secondary inline-flex items-center justify-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create account
                </Link>
            </div>
        </section>
    );
}