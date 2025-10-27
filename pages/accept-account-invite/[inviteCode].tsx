import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
    AlertTriangle,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    Link as LinkIcon,
    Shield,
    UserPlus,
    XCircle,
} from "lucide-react";
import { SignInRequired } from "@/components/SignInRequired";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/util";
import {
    useCurrentUser,
    useFileUrl,
    useStoreFirstMatchingItem,
    useStoreItem,
} from "@/lib/hooks";
import {
    typeDefs,
    Account as AccountType,
    AccountInvite as AccountInviteType,
    AccountMembership as AccountMembershipType,
    User as UserType,
} from "@/lib/schema";
import { store } from "@/lib/store";
import { app } from "@/lib/app";

type InviteRole = "guest" | "default" | "manager" | "admin";

function sanitizeRole(role: string | undefined | null): InviteRole {
    const r = (role || "").toLowerCase();
    if (r === "admin" || r === "manager" || r === "guest" || r === "default") {
        return r;
    }
    return "default";
}

const roleRank: Record<InviteRole, number> = {
    guest: 0,
    default: 1,
    manager: 2,
    admin: 3,
};

function maxRole(a: InviteRole, b: InviteRole): InviteRole {
    return roleRank[a] >= roleRank[b] ? a : b;
}

function formatDate(iso?: string) {
    if (!iso) return undefined;
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch {
        return iso;
    }
}

export default function AcceptAccountInvitePage() {
    const router = useRouter();
    const inviteCodeParam = router.query.inviteCode;
    const inviteCode = Array.isArray(inviteCodeParam) ? inviteCodeParam[0] : inviteCodeParam;

    const user = useCurrentUser();

    // Load invite by code
    const invite = useStoreFirstMatchingItem<AccountInviteType>(
        typeDefs.AccountInvite,
        inviteCode ? { code: inviteCode } : undefined
    );

    // Load related account and inviter when invite is available
    const account = useStoreItem<AccountType>(
        typeDefs.Account,
        invite?.account_id
    );

    const inviter = useStoreItem<UserType>(
        typeDefs.User,
        invite?.invited_by_user_id
    );

    // Current user's membership in the target account (if signed-in)
    const membership = useStoreFirstMatchingItem<AccountMembershipType>(
        typeDefs.AccountMembership,
        user && invite ? { user_id: user.id, account_id: invite.account_id } : undefined
    );

    const accountLogoUrl = useFileUrl(account?.logo_image_path);
    const inviterAvatarUrl = useFileUrl(inviter?.profile_image_path);

    const [accepting, setAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const isLoading = invite === null || (invite && (account === null || inviter === null));
    const inviteNotFound = invite === undefined && !!inviteCode;
    const invalidNoCode = !inviteCode;

    const expiresAt = invite?.expires_at ? new Date(invite.expires_at) : undefined;
    const isExpired = !!expiresAt && Date.now() > expiresAt.getTime();
    const isRevoked = !!invite?.revoked_at;

    const acceptedAt = invite?.accepted_at ? new Date(invite.accepted_at) : undefined;
    const acceptedByOther =
        !!invite?.accepted_at &&
        !!invite?.accepted_by_user_id &&
        !!user &&
        invite.accepted_by_user_id !== user.id;

    const acceptedBySelf =
        !!invite?.accepted_at &&
        !!invite?.accepted_by_user_id &&
        !!user &&
        invite.accepted_by_user_id === user.id;

    const inviteRole = sanitizeRole(invite?.role);
    const alreadyMember = !!membership;

    const emailMismatch =
        !!invite?.email &&
        !!user?.email &&
        invite.email.toLowerCase() !== user.email.toLowerCase();

    const canAccept =
        !!user &&
        !!invite &&
        !isExpired &&
        !isRevoked &&
        !acceptedByOther;

    const shareUrl = useMemo(() => {
        if (typeof window === "undefined" || !inviteCode) return "";
        return `${window.location.origin}/accept-account-invite/${inviteCode}`;
    }, [inviteCode]);

    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(t);
    }, [copied]);

    async function onCopyAsync() {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }

    async function onAcceptAsync() {
        if (!canAccept || !invite || !account || !user) {
            return;
        }
        setError(undefined);
        setAccepting(true);
        try {
            // Ensure membership exists and set appropriate role
            let currentMembership = membership;
            const nowIso = new Date().toISOString();

            if (!currentMembership) {
                const insertValue = {
                    user_id: user.id,
                    account_id: account.id,
                    role: inviteRole,
                    last_accessed_at: nowIso,
                } as Partial<AccountMembershipType>;
                await store().insertAsync(typeDefs.AccountMembership, insertValue as any);
            } else {
                // Upgrade role if invite grants higher role
                const currentRole = sanitizeRole(currentMembership.role as string);
                const newRole = maxRole(currentRole, inviteRole);
                if (newRole !== currentRole) {
                    currentMembership = await store().updateAsync(
                        typeDefs.AccountMembership,
                        currentMembership.id,
                        { role: newRole, last_accessed_at: nowIso }
                    );
                } else {
                    await store().updateAsync(
                        typeDefs.AccountMembership,
                        currentMembership.id,
                        { last_accessed_at: nowIso }
                    );
                }
            }

            // Mark invite accepted if not already accepted by someone else
            if (!invite.accepted_at) {
                await store().updateAsync(typeDefs.AccountInvite, invite.id, {
                    accepted_at: nowIso,
                    accepted_by_user_id: user.id,
                });
            } else if (invite.accepted_by_user_id === user.id) {
                // already accepted by this user; it's fine
            } else if (invite.accepted_at && invite.accepted_by_user_id && invite.accepted_by_user_id !== user.id) {
                throw new Error("Invite was already used by another user.");
            }

            setAccepted(true);

            // Switch context to the account and proceed to dashboard
            await app().switchAccountAsync(account.id);
            await router.push("/dashboard");
        } catch (e: any) {
            setError(e?.message || "Failed to accept invite. Please try again.");
            setAccepted(false);
        } finally {
            setAccepting(false);
        }
    }

    async function onDecline() {
        // Client-side decline: simply navigate away
        router.push("/");
    }

    function goToWorkspace() {
        if (!account) return;
        app().switchAccountAsync(account.id).then(() => {
            router.push("/dashboard");
        });
    }

    function goToAccount() {
        router.push("/account");
    }

    function onRetry() {
        if (inviteCode) {
            router.replace(router.asPath);
        } else {
            router.push("/");
        }
    }

    // Unauthenticated state: show a sign-in gate with context
    if (user === undefined) {
        // not signed in
        return (
            <main className="page--AcceptAccountInvitePage">
                <section className="page-container">
                    <div className="app-container section-pad">
                        <div className="page-stack max-w-2xl mx-auto">
                            <header className="text-center">
                                <div className="mx-auto w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-zinc-100">
                                    <UserPlus className="w-6 h-6 text-zinc-700" />
                                </div>
                                <h1 className="text-2xl font-bold">Accept account invite</h1>
                                <p className="text-zinc-600">Sign in to continue</p>
                            </header>
                            <div className="card">
                                <SignInRequired
                                    message="You need to sign in to accept this invitation."
                                />
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <a
                                        className="btn-primary"
                                        href={`/sign-in?redirect=${encodeURIComponent(
                                            `/accept-account-invite/${inviteCode ?? ""}`
                                        )}`}
                                    >
                                        Sign in
                                    </a>
                                    <a
                                        className="btn-secondary"
                                        href={`/register?redirect=${encodeURIComponent(
                                            `/accept-account-invite/${inviteCode ?? ""}`
                                        )}`}
                                    >
                                        Register
                                    </a>
                                    {inviteCode && (
                                        <button className="btn-ghost" onClick={onCopyAsync}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            {copied ? "Copied" : "Copy invite link"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="page--AcceptAccountInvitePage">
            <section className="page-container">
                <div className="app-container section-pad">
                    <div className="page-stack max-w-3xl mx-auto">
                        <header className="text-center">
                            <div className="mx-auto w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-zinc-100">
                                <Logo className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-bold">Accept account invite</h1>
                            <p className="text-zinc-600">
                                Join a workspace to collaborate with your team
                            </p>
                        </header>

                        {/* Loading state */}
                        {isLoading && (
                            <div className="card">
                                <div className="flex items-center gap-3 text-zinc-700">
                                    <Clock className="w-5 h-5" />
                                    <div>Verifying invite…</div>
                                </div>
                            </div>
                        )}

                        {/* Invalid/No code */}
                        {!isLoading && (invalidNoCode || inviteNotFound) && (
                            <div className="card">
                                <div className="flex items-center gap-3 text-red-700">
                                    <XCircle className="w-5 h-5" />
                                    <div>
                                        {invalidNoCode
                                            ? "No invite code provided."
                                            : "Invite not found or code is invalid."}
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <button className="btn-secondary" onClick={onRetry}>Retry</button>
                                    <a className="btn-ghost" href="/">Go home</a>
                                </div>
                            </div>
                        )}

                        {/* Invite card */}
                        {!isLoading && !!invite && (
                            <div className={cn("card", (isExpired || isRevoked || acceptedByOther) && "brand-border-thin")}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar w-12 h-12">
                                            {accountLogoUrl === null ? (
                                                <div className="w-full h-full rounded-full bg-zinc-200" />
                                            ) : accountLogoUrl === undefined ? (
                                                <div className="w-full h-full rounded-full bg-zinc-100" />
                                            ) : (
                                                <img
                                                    src={accountLogoUrl}
                                                    alt={account?.name || "Account"}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm text-zinc-600">Account</div>
                                            <h2 className="text-xl font-semibold">
                                                {account?.name ?? "Loading…"}
                                            </h2>
                                            <div className="text-sm text-zinc-500">ID: {account?.id}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isRevoked && <span className="badge">Revoked</span>}
                                        {isExpired && !isRevoked && <span className="badge">Expired</span>}
                                        {acceptedByOther && !isExpired && !isRevoked && (
                                            <span className="badge">Already used</span>
                                        )}
                                        {acceptedBySelf && !isExpired && !isRevoked && (
                                            <span className="badge--success">Accepted</span>
                                        )}
                                    </div>
                                </div>

                                <div className="divider my-4"></div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="surface p-3 rounded-md">
                                        <div className="flex items-center gap-2 text-zinc-700">
                                            <Shield className="w-4 h-4" />
                                            <div className="font-medium">Role on join</div>
                                        </div>
                                        <div className="mt-1 text-zinc-800 capitalize">{inviteRole}</div>
                                    </div>

                                    <div className="surface p-3 rounded-md">
                                        <div className="flex items-center gap-2 text-zinc-700">
                                            <Clock className="w-4 h-4" />
                                            <div className="font-medium">Invite status</div>
                                        </div>
                                        <div className="mt-1 text-zinc-800">
                                            {isRevoked
                                                ? "This invite was revoked."
                                                : isExpired
                                                ? `Expired ${formatDate(invite.expires_at)}`
                                                : "Active"}
                                        </div>
                                        <div className="mt-1 text-sm text-zinc-600">
                                            {invite.expires_at && !isExpired && `Expires ${formatDate(invite.expires_at)}`}
                                        </div>
                                    </div>
                                </div>

                                {inviter && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="avatar w-10 h-10">
                                            {inviterAvatarUrl === null ? (
                                                <div className="w-full h-full rounded-full bg-zinc-200" />
                                            ) : inviterAvatarUrl === undefined ? (
                                                <div className="w-full h-full rounded-full bg-zinc-100" />
                                            ) : (
                                                <img
                                                    src={inviterAvatarUrl}
                                                    alt={inviter.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            Invited by{" "}
                                            <a className="link" href={`/profile/${inviter.id}`}>
                                                {inviter.name}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {emailMismatch && (
                                    <div className="mt-4 brand-border-thin rounded-md p-3 bg-surface-soft">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 mt-[2px]" />
                                            <div className="text-sm text-zinc-800">
                                                This invite was sent to {invite.email}, but you are signed in as {user?.email}.
                                                You can still proceed if allowed by the admin, or sign out and accept with the intended email.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!!error && (
                                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-wrap items-center gap-2">
                                    {/* Primary Accept CTA */}
                                    <button
                                        className="btn-primary"
                                        disabled={!canAccept || accepting}
                                        onClick={onAcceptAsync}
                                    >
                                        {accepting ? "Accepting…" : "Accept invite"}
                                    </button>

                                    {/* Secondary actions */}
                                    <button className="btn-secondary" onClick={onDecline}>
                                        Decline
                                    </button>

                                    <button className="btn-ghost" onClick={onCopyAsync}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        {copied ? "Copied" : "Copy link"}
                                    </button>

                                    {!isExpired && !isRevoked && acceptedByOther && (
                                        <button className="btn-secondary" onClick={onRetry}>
                                            Retry
                                        </button>
                                    )}
                                </div>

                                {/* Already a member or accepted by self */}
                                {alreadyMember && (
                                    <div className="mt-6 rounded-md bg-surface-soft p-3">
                                        <div className="flex items-center gap-2 text-zinc-800">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <div className="font-medium">
                                                You are already a member of {account?.name}.
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <button className="btn-secondary" onClick={goToWorkspace}>
                                                Go to workspace
                                            </button>
                                            <button className="btn-ghost" onClick={goToAccount}>
                                                Account details
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {acceptedBySelf && !alreadyMember && (
                                    <div className="mt-6 rounded-md bg-surface-soft p-3">
                                        <div className="flex items-center gap-2 text-zinc-800">
                                            <Check className="w-5 h-5 text-green-600" />
                                            <div className="font-medium">You have accepted this invite.</div>
                                        </div>
                                        <div className="mt-3">
                                            <button className="btn-secondary" onClick={goToWorkspace}>
                                                Open workspace
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {(isExpired || isRevoked) && (
                                    <div className="mt-6 rounded-md bg-surface-soft p-3">
                                        <div className="flex items-start gap-2 text-zinc-800">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 mt-[2px]" />
                                            <div>
                                                <div className="font-medium mb-1">
                                                    {isRevoked ? "This invite was revoked." : "This invite has expired."}
                                                </div>
                                                <div className="text-sm text-zinc-700">
                                                    Please request a new invite from an account admin.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Helpful links */}
                        {!isLoading && !!invite && (
                            <div className="card brand-border-thin">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-zinc-700">
                                        Share or keep this invite link for reference.
                                        <div className="mt-1 text-sm text-zinc-600 break-all">
                                            <LinkIcon className="inline w-4 h-4 mr-1 align-[-2px]" />
                                            {shareUrl || "—"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="btn-secondary" onClick={onCopyAsync}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            {copied ? "Copied" : "Copy"}
                                        </button>
                                        {account && (
                                            <a className="btn-ghost" href={`/account`}>
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Account
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

export const __acceptAccountInvitePlaceholder = true;