import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Logo } from "@/components/Logo";
import { supClient } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/hooks";
import { Eye, EyeOff, Mail, User, Building2, UserPlus } from "lucide-react";

interface RegisterForm {
    name: string;
    email: string;
    accountName: string;
    password: string;
}

type FieldErrors = Partial<Record<keyof RegisterForm, string>>;

function validate(form: RegisterForm): FieldErrors {
    const errors: FieldErrors = {};
    if (!form.name.trim()) errors.name = "Your name is required.";
    if (!form.email.trim()) {
        errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
        errors.email = "Enter a valid email address.";
    }
    if (!form.accountName.trim()) errors.accountName = "Organization name is required.";
    if (!form.password) {
        errors.password = "Password is required.";
    } else if (form.password.length < 8) {
        errors.password = "Use at least 8 characters.";
    }
    return errors;
}

export default function RegisterPage() {
    const router = useRouter();
    const currentUser = useCurrentUser();

    const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);
    const [form, setForm] = useState<RegisterForm>({
        name: "",
        email: "",
        accountName: "",
        password: "",
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const q = router.query;
        const code =
            (q.inviteCode as string) ||
            (q.invite as string) ||
            (q.code as string) ||
            undefined;
        if (code) setInviteCode(code);
    }, [router.query]);

    const isLoadingUser = currentUser === null;
    const isSignedIn = !!currentUser;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        const nextErrors = validate(form);
        setErrors(nextErrors);
        setServerError(null);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        try {
            setSubmitting(true);
            const { data, error } = await supClient().auth.signUp({
                email: form.email.trim(),
                password: form.password,
                options: {
                    data: {
                        name: form.name,
                        accountName: form.accountName,
                    },
                },
            });

            if (error) {
                setServerError(error.message || "Something went wrong. Please try again.");
                return;
            }

            // If a session is immediately available, proceed to the app
            if (data?.session) {
                router.replace("/dashboard");
                return;
            }

            // Otherwise, likely email confirmation is required
            setEmailConfirmationSent(true);
        } catch (err: any) {
            setServerError(err?.message ?? "Unexpected error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const formDisabled = submitting || emailConfirmationSent;

    const AlreadySignedInCard = useMemo(() => {
        if (!isSignedIn) return null;
        return (
            <section className="app-container section-pad">
                <div className="page-stack items-center text-center">
                    <div className="flex items-center gap-2">
                        <Logo className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">You’re already registered</h1>
                    </div>
                    <p className="text-zinc-600 max-w-md">
                        You’re signed in and ready to go. Head to your workspace to start capturing tasks.
                    </p>
                    <div className="card w-full max-w-md">
                        <div className="page-stack">
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    className="btn-primary"
                                    onClick={() => router.push("/dashboard")}
                                >
                                    Go to dashboard
                                </button>
                                <a className="btn-ghost" href="/account">Account</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }, [isSignedIn, router]);

    if (isLoadingUser) {
        return (
            <div className="page--RegisterPage">
                <section className="app-container section-pad">
                    <div className="page-stack items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 animate-pulse" />
                            <div className="h-6 w-40 bg-zinc-200 rounded animate-pulse" />
                        </div>
                        <div className="card w-full max-w-xl">
                            <div className="space-y-3">
                                <div className="h-6 w-1/2 bg-zinc-200 rounded animate-pulse" />
                                <div className="h-10 w-full bg-zinc-200 rounded animate-pulse" />
                                <div className="h-10 w-full bg-zinc-200 rounded animate-pulse" />
                                <div className="h-10 w-full bg-zinc-200 rounded animate-pulse" />
                                <div className="h-10 w-full bg-zinc-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (isSignedIn) {
        return <div className="page--RegisterPage">{AlreadySignedInCard}</div>;
    }

    if (emailConfirmationSent) {
        return (
            <div className="page--RegisterPage">
                <section className="app-container section-pad">
                    <div className="page-stack items-center text-center">
                        <div className="flex items-center gap-2">
                            <Logo className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">Check your email</h1>
                        </div>
                        <p className="text-zinc-600 max-w-md">
                            We’ve sent a confirmation link to {form.email.trim()}. Open it to verify your email and finish creating your workspace.
                        </p>
                        <div className="card w-full max-w-md">
                            <div className="page-stack">
                                <button className="btn-primary" onClick={() => router.push("/sign-in")}>
                                    Go to sign in
                                </button>
                                <a className="btn-ghost" href="/">
                                    Back to home
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="page--RegisterPage">
            <section className="app-container section-pad">
                <div className="page-stack items-center">
                    <div className="page-stack items-center text-center">
                        <div className="flex items-center gap-2">
                            <Logo className="w-8 h-8" />
                            <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
                        </div>
                        <p className="text-zinc-600 max-w-md">
                            Start a new workspace for your team. You can invite teammates later.
                        </p>
                    </div>

                    {inviteCode && (
                        <div className="card brand-border-thin w-full max-w-xl">
                            <div className="flex items-start gap-3">
                                <div className="badge">Invite</div>
                                <div className="flex-1">
                                    <p className="text-sm text-zinc-700">
                                        It looks like you have an invite code.
                                        You may want to join an existing workspace instead.
                                    </p>
                                    <div className="mt-2">
                                        <a
                                            className="btn-ghost"
                                            href={`/accept-account-invite/${encodeURIComponent(inviteCode)}`}
                                        >
                                            Use invite instead
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form className="card w-full max-w-xl" onSubmit={onSubmit} noValidate>
                        <div className="page-stack">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1">
                                    Full name
                                </label>
                                <div className="relative">
                                    <input
                                        id="name"
                                        className="input w-full"
                                        placeholder="Alex Rivera"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        aria-invalid={!!errors.name}
                                        disabled={formDisabled}
                                        autoComplete="name"
                                    />
                                    <User className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        className="input w-full"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        aria-invalid={!!errors.email}
                                        disabled={formDisabled}
                                        autoComplete="email"
                                    />
                                    <Mail className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="accountName" className="block text-sm font-medium mb-1">
                                    Organization name
                                </label>
                                <div className="relative">
                                    <input
                                        id="accountName"
                                        className="input w-full"
                                        placeholder="Bee Org"
                                        value={form.accountName}
                                        onChange={(e) =>
                                            setForm({ ...form, accountName: e.target.value })
                                        }
                                        aria-invalid={!!errors.accountName}
                                        disabled={formDisabled}
                                        autoComplete="organization"
                                    />
                                    <Building2 className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {errors.accountName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.accountName}</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                                        Password
                                    </label>
                                    <span className="text-xs text-zinc-500">Use at least 8 characters</span>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="input w-full pr-10"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        aria-invalid={!!errors.password}
                                        disabled={formDisabled}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn-icon absolute right-1.5 top-1/2 -translate-y-1/2"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword((v) => !v)}
                                        disabled={formDisabled}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {serverError && (
                                <div role="alert" aria-live="polite" className="brand-border-thin p-3 rounded">
                                    <p className="text-sm text-red-700">{serverError}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={formDisabled}
                                >
                                    {submitting ? "Creating…" : "Create account"}
                                </button>
                                <a className="btn-ghost" href="/sign-in">I already have an account</a>
                            </div>
                        </div>
                    </form>

                    <div className="text-sm text-zinc-600">
                        By creating an account, you agree to our{" "}
                        <a className="link" href="/terms">Terms</a> and{" "}
                        <a className="link" href="/privacy">Privacy Policy</a>.
                    </div>
                </div>
            </section>
        </div>
    );
}