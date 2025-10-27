import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Logo } from "@/components/Logo";
import { useCurrentUser, useFullPage } from "@/lib/hooks";
import { supClient } from "@/lib/supabase";
import { LogIn, LogOut, ArrowRight } from "lucide-react";
import { cn } from "@/lib/util";

interface SignInForm {
    email: string;
    password: string;
}

function isValidEmail(email: string): boolean {
    // Simple email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function sanitizeReturnPath(candidate: string | null): string | null {
    if (!candidate) return null;
    try {
        // Allow relative paths only, prevent open redirects
        const url = new URL(candidate, window.location.origin);
        if (url.origin !== window.location.origin) return null;
        // Disallow protocol-relative or external
        if (!url.pathname.startsWith("/")) return null;
        return url.pathname + url.search + url.hash;
    } catch {
        return null;
    }
}

export default function SignInPage() {
    const router = useRouter();
    const user = useCurrentUser();
    const isGuest = user === undefined;
    const isLoadingUser = user === null;

    // Hide main nav for guests on the sign-in screen; show it when already signed in
    useFullPage(isGuest);

    const [form, setForm] = useState<SignInForm>({ email: "", password: "" });
    const [errors, setErrors] = useState<Partial<Record<keyof SignInForm, string>>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [invitePath, setInvitePath] = useState<string | null>(null);
    const [returnPath, setReturnPath] = useState<string | null>(null);

    // Extract redirect cues from the URL
    useEffect(() => {
        if (!router.isReady) return;

        const { redirect, next, returnTo, inviteCode } = router.query;

        if (typeof inviteCode === "string" && inviteCode.trim().length > 0) {
            setInvitePath(`/accept-account-invite/${inviteCode.trim()}`);
        } else {
            setInvitePath(null);
        }

        const candidate =
            (typeof redirect === "string" && redirect) ||
            (typeof next === "string" && next) ||
            (typeof returnTo === "string" && returnTo) ||
            null;

        const safe = typeof window !== "undefined" ? sanitizeReturnPath(candidate) : null;
        setReturnPath(safe);
    }, [router.isReady, router.query]);

    const redirectAfterSignIn = useCallback((): string => {
        // Priority: invite acceptance > provided return path > dashboard
        if (invitePath) return invitePath;
        if (returnPath) return returnPath;
        return "/dashboard";
    }, [invitePath, returnPath]);

    const onSubmitAsync = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        const newErrors: Partial<Record<keyof SignInForm, string>> = {};
        if (!form.email.trim()) newErrors.email = "Email is required";
        else if (!isValidEmail(form.email)) newErrors.email = "Enter a valid email";
        if (!form.password) newErrors.password = "Password is required";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supClient().auth.signInWithPassword({
                email: form.email.trim(),
                password: form.password,
            });

            if (error) {
                setSubmitError(error.message || "Unable to sign in. Please try again.");
                return;
            }

            const target = redirectAfterSignIn();
            // Prefer client-side navigation for same-origin paths
            router.replace(target);
        } catch (err: any) {
            setSubmitError(err?.message ?? "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const onSignOutAsync = async () => {
        await supClient().auth.signOut();
        // After sign out, stay on sign-in page
        if (router.pathname !== "/sign-in") {
            router.push("/sign-in");
        } else {
            // refresh state
            setForm({ email: "", password: "" });
            setSubmitError(null);
        }
    };

    const alreadySignedInPrimaryCta = useMemo(() => {
        const label = invitePath || returnPath ? "Continue" : "Go to Dashboard";
        const href = invitePath || returnPath || "/dashboard";
        return { label, href };
    }, [invitePath, returnPath]);

    return (
        <div className={cn("page--SignInPage bg-app min-h-screen")}>
            <section className="app-container section-pad">
                <div className="flex items-center justify-center min-h-[70vh]">
                    {/* Loading state while we determine auth */}
                    {isLoadingUser && (
                        <div className="card w-full max-w-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 animate-pulse" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-zinc-100 rounded w-1/3 animate-pulse" />
                                    <div className="h-3 bg-zinc-100 rounded w-2/3 animate-pulse" />
                                </div>
                            </div>
                            <div className="mt-4 h-10 bg-zinc-100 rounded animate-pulse" />
                        </div>
                    )}

                    {/* Already signed in notice */}
                    {!isLoadingUser && user && (
                        <div className="card w-full max-w-md">
                            <div className="flex items-center gap-3">
                                <Logo className="w-8 h-8" />
                                <div>
                                    <h1 className="text-xl font-semibold">You’re already signed in</h1>
                                    <p className="text-sm text-zinc-600">
                                        {invitePath
                                            ? "Continue to accept your account invite."
                                            : returnPath
                                                ? "Continue to your previous destination."
                                                : "Head to your dashboard or switch accounts from the top bar."}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center gap-2">
                                <a className="btn-primary" href={alreadySignedInPrimaryCta.href}>
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    {alreadySignedInPrimaryCta.label}
                                </a>
                                <button className="btn-ghost" onClick={onSignOutAsync}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign out
                                </button>
                            </div>

                            {(invitePath || returnPath) && (
                                <p className="mt-3 text-xs text-zinc-600">
                                    Returning to:{" "}
                                    <span className="break-all">{invitePath || returnPath}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Guest: Sign-in form */}
                    {!isLoadingUser && isGuest && (
                        <form onSubmit={onSubmitAsync} className="card w-full max-w-md" noValidate>
                            <div className="flex items-center gap-3">
                                <Logo className="w-9 h-9" />
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                                    <p className="text-sm text-zinc-600">
                                        Sign in to continue to Task Bee
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        className="input w-full"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        aria-invalid={!!errors.email || undefined}
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                        disabled={submitting}
                                        required
                                    />
                                    {errors.email && (
                                        <p id="email-error" className="mt-1 text-sm text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        className="input w-full"
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        aria-invalid={!!errors.password || undefined}
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                        disabled={submitting}
                                        required
                                    />
                                    {errors.password && (
                                        <p id="password-error" className="mt-1 text-sm text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {submitError && (
                                    <div className="brand-border-thin rounded p-2 text-sm text-red-700 bg-red-50" role="alert" aria-live="polite">
                                        {submitError}
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting}
                                        aria-busy={submitting}
                                    >
                                        <LogIn className="w-4 h-4 mr-2" />
                                        {submitting ? "Signing in…" : "Sign in"}
                                    </button>
                                    <a href="/register" className="btn-ghost">
                                        Create an account
                                    </a>
                                </div>

                                {(invitePath || returnPath) && (
                                    <p className="text-xs text-zinc-600">
                                        After sign-in you’ll be redirected to{" "}
                                        <span className="break-all">{invitePath || returnPath}</span>
                                    </p>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}