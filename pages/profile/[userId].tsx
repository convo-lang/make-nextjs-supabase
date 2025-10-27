import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
    useAccount,
    useCurrentUser,
    useFileUrl,
    useStoreFirstMatchingItem,
    useStoreItem,
    useStoreMatchingItems,
    useUserRole,
} from "@/lib/hooks";
import { cn } from "@/lib/util";
import { SignInRequired } from "@/components/SignInRequired";
import { store } from "@/lib/store";
import {
    typeDefs,
    User as UserType,
    AccountMembership as AccountMembershipType,
    Task as TaskType,
} from "@/lib/schema";
import {
    Copy,
    Check,
    Shield,
    AlertTriangle,
    User as UserIcon,
    Clock,
} from "lucide-react";

type RoleOption = "guest" | "default" | "manager" | "admin";

const ROLE_OPTIONS: RoleOption[] = ["guest", "default", "manager", "admin"];

function formatDate(d?: string) {
    if (!d) return "";
    try {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return d;
        return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return d;
    }
}

function StatusBadge({ status }: { status?: string }) {
    const label =
        status === "completed" ? "Completed" :
        status === "archived" ? "Archived" :
        "Active";
    const cls =
        status === "completed" ? "badge--success" :
        status === "archived" ? "badge" :
        "badge";
    return <span className={cls}>{label}</span>;
}

export default function PublicProfilePage() {
    const router = useRouter();
    const { userId } = router.query as { userId?: string };

    const currentUser = useCurrentUser();
    const account = useAccount();
    const viewerRole = useUserRole();

    const isLoadingUser = currentUser === null;
    const isGuest = currentUser === undefined;

    // Target user (being viewed)
    const viewedUser = useStoreItem<UserType>(
        typeDefs.User,
        userId,
        { resetOnChange: true }
    );

    // Membership of the viewed user in the current account
    const membership = useStoreFirstMatchingItem<AccountMembershipType>(
        typeDefs.AccountMembership,
        userId && account?.id ? { user_id: userId, account_id: account.id } : null,
        { resetOnChange: true }
    );

    // Recent activity (created and/or updated tasks) for the viewed user in this account
    const createdTasks = useStoreMatchingItems<TaskType>(
        typeDefs.Task,
        userId && account?.id ? { account_id: account.id, created_by_user_id: userId } : null,
        { limit: 10, orderBy: "updated_at", orderByDesc: true, resetOnChange: true }
    );
    const updatedTasks = useStoreMatchingItems<TaskType>(
        typeDefs.Task,
        userId && account?.id ? { account_id: account.id, updated_by_user_id: userId } : null,
        { limit: 10, orderBy: "updated_at", orderByDesc: true, resetOnChange: true }
    );

    const recentTasks = useMemo(() => {
        if (createdTasks === null || updatedTasks === null) return null; // loading
        if (!createdTasks && !updatedTasks) return undefined; // disabled/not ready
        const combined = new Map<string, TaskType>();
        (createdTasks ?? []).forEach(t => combined.set(t.id, t));
        (updatedTasks ?? []).forEach(t => combined.set(t.id, t));
        const list = Array.from(combined.values());
        list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        return list.slice(0, 5);
    }, [createdTasks, updatedTasks]);

    // Media URLs
    const heroUrl = useFileUrl((viewedUser as UserType | undefined)?.hero_image_path);
    const avatarUrl = useFileUrl((viewedUser as UserType | undefined)?.profile_image_path);

    // Share link
    const [shareUrl, setShareUrl] = useState("");
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (typeof window !== "undefined" && userId) {
            setShareUrl(`${window.location.origin}/profile/${userId}`);
        }
    }, [userId]);

    // Role change state
    const isAdmin = viewerRole === "admin";
    const isSelf = currentUser && userId && currentUser.id === userId;
    const [roleValue, setRoleValue] = useState<RoleOption | "">("");
    const [updatingRole, setUpdatingRole] = useState(false);

    useEffect(() => {
        if (membership && membership !== null) {
            const r = (membership as AccountMembershipType).role as RoleOption;
            setRoleValue(ROLE_OPTIONS.includes(r) ? r : "default");
        } else if (membership === undefined) {
            setRoleValue("");
        }
    }, [membership]);

    async function onCopyLink() {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // ignore
        }
    }

    async function onChangeRole(nextRole: RoleOption) {
        if (!isAdmin || isSelf || !membership || membership === null) return;
        if ((membership as AccountMembershipType).role === nextRole) return;

        const confirmed = typeof window !== "undefined"
            ? window.confirm(`Change role to "${nextRole}" for this user in this account?`)
            : true;

        if (!confirmed) {
            // revert select UI to current value from membership
            const r = (membership as AccountMembershipType).role as RoleOption;
            setRoleValue(ROLE_OPTIONS.includes(r) ? r : "default");
            return;
        }

        try {
            setUpdatingRole(true);
            await store().updateAsync<AccountMembershipType>(
                typeDefs.AccountMembership,
                (membership as AccountMembershipType).id,
                { role: nextRole as any }
            );
            setRoleValue(nextRole);
        } catch {
            // revert on error
            const r = (membership as AccountMembershipType).role as RoleOption;
            setRoleValue(ROLE_OPTIONS.includes(r) ? r : "default");
        } finally {
            setUpdatingRole(false);
        }
    }

    // Access control: all signed-in users can view. Guests see sign-in card.
    if (isGuest) {
        return (
            <div className="page--PublicProfilePage">
                <section className="page-container">
                    <div className="app-container">
                        <SignInRequired message="Sign in to view public profiles." />
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="page--PublicProfilePage page--full">
            {/* Hero */}
            <section className="page-container">
                <div className="app-container">
                    <div className="card p-0 overflow-hidden">
                        <div className="relative w-full h-40 md:h-56 bg-surface-soft">
                            {heroUrl === null ? (
                                <div className="w-full h-full animate-pulse bg-zinc-100" />
                            ) : heroUrl === undefined ? (
                                <div className="w-full h-full surface-gradient" />
                            ) : (
                                <img
                                    src={heroUrl}
                                    alt="Hero"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Avatar */}
                            <div className="absolute -bottom-8 left-6 flex items-center">
                                <div className={cn("avatar w-16 h-16 md:w-20 md:h-20 ring-4 ring-white rounded-full overflow-hidden bg-zinc-100")}>
                                    {avatarUrl === null ? (
                                        <div className="w-full h-full animate-pulse" />
                                    ) : avatarUrl === undefined ? (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                            <UserIcon className="w-8 h-8" />
                                        </div>
                                    ) : (
                                        <img
                                            src={avatarUrl}
                                            alt={(viewedUser as UserType | undefined)?.name ?? "Avatar"}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Header content */}
                        <div className="px-6 pt-12 pb-6">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold">
                                        {(viewedUser as UserType | null | undefined) === null
                                            ? "Loading…"
                                            : (viewedUser as UserType | undefined)?.name ?? "Unknown user"}
                                    </h1>
                                    <p className="text-sm text-zinc-600 mt-1">
                                        Email is hidden for privacy.
                                    </p>
                                </div>

                                {/* Share link */}
                                <div className="brand-border-thin rounded-md p-2">
                                    <div className="flex items-center gap-2">
                                        <div className="truncate max-w-[50vw] md:max-w-xs text-sm text-zinc-700">
                                            {shareUrl || "…"}
                                        </div>
                                        <button className={cn("btn-primary", copied && "brand-ring")} onClick={onCopyLink} aria-label="Copy profile link">
                                            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                            {copied ? "Copied" : "Copy link"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Admin role controls */}
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="card">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-zinc-600" />
                                            <h3 className="font-semibold">Account membership</h3>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-2 text-sm text-zinc-700">
                                        <div className="flex items-center justify-between">
                                            <span>Joined</span>
                                            <span className="text-zinc-600">
                                                {membership === null
                                                    ? "Loading…"
                                                    : membership === undefined
                                                        ? "—"
                                                        : formatDate((membership as AccountMembershipType).created_at)}
                                            </span>
                                        </div>

                                        {isAdmin ? (
                                            <div className="flex items-center justify-between">
                                                <label htmlFor="roleSelect" className="mr-3">Role</label>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        id="roleSelect"
                                                        className="select"
                                                        value={roleValue || ""}
                                                        disabled={!!isSelf || updatingRole || !membership || membership === undefined}
                                                        onChange={(e) => onChangeRole(e.target.value as RoleOption)}
                                                    >
                                                        {ROLE_OPTIONS.map(r => (
                                                            <option key={r} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                    {isSelf && (
                                                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                            <AlertTriangle className="w-3.5 h-3.5" />
                                                            <span>Cannot change your own role</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <span>Role</span>
                                                <span className="text-zinc-600">Only admins can view roles</span>
                                            </div>
                                        )}

                                        {membership === undefined && (
                                            <p className="text-sm text-zinc-600 mt-2">
                                                This user is not a member of the current account.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Recent activity */}
                                <div className="card">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-zinc-600" />
                                        <h3 className="font-semibold">Recent activity</h3>
                                    </div>

                                    <div className="mt-3">
                                        {recentTasks === null && (
                                            <p className="text-sm text-zinc-600">Loading activity…</p>
                                        )}
                                        {recentTasks !== null && (recentTasks === undefined || recentTasks.length === 0) && (
                                            <p className="text-sm text-zinc-600">No recent tasks to show.</p>
                                        )}
                                        {recentTasks && recentTasks.length > 0 && (
                                            <ul className="space-y-2">
                                                {recentTasks.map(t => (
                                                    <li key={t.id} className="flex items-start justify-between gap-3">
                                                        <a className="link truncate" href={`/task/${t.id}`}>
                                                            {t.title}
                                                        </a>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <StatusBadge status={t.status} />
                                                            <span className="text-xs text-zinc-600">
                                                                {formatDate(t.updated_at)}
                                                            </span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Not found state */}
                            {(viewedUser === undefined) && (
                                <div className="mt-4 card brand-border-thin">
                                    <p className="text-zinc-700">
                                        User not found.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export const PageRoute = "/profile/[userId]";