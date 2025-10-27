import React, { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { SignInRequired } from "@/components/SignInRequired";
import { cn } from "@/lib/util";
import {
    useAccount,
    useCurrentUser,
    useFileUrl,
    useStoreMatchingItems,
    useUserInfo,
} from "@/lib/hooks";
import { store } from "@/lib/store";
import { supClient } from "@/lib/supabase";
import {
    typeDefs,
    Account as AccountType,
    Account_insert as AccountInsert,
    AccountMembership as AccountMembershipType,
    User as UserType,
    AccountInvite as AccountInviteType,
    AccountInvite_insert as AccountInviteInsert,
} from "@/lib/schema";
import {
    Edit3,
    Save,
    X,
    Users as UsersIcon,
    Link2,
    Copy,
    Plus,
    Image as ImageIcon,
    ExternalLink,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface EditableAccountForm {
    name: string;
    logo_image_path?: string;
    file?: File | null;
}

function truncateId(id?: string) {
    if (!id) return "";
    if (id.length <= 12) return id;
    return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function useMembers(accountId?: string) {
    const memberships = useStoreMatchingItems<AccountMembershipType>(
        typeDefs.AccountMembership,
        { account_id: accountId ?? "" } as Partial<AccountMembershipType>,
        { disabled: !accountId }
    );

    const [users, setUsers] = useState<UserType[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function runAsync() {
            if (!accountId) {
                setUsers(null);
                return;
            }
            if (memberships === null) {
                // loading memberships
                setUsers(null);
                return;
            }
            if (!Array.isArray(memberships)) {
                setUsers(null);
                return;
            }

            if (memberships.length === 0) {
                setUsers([]);
                return;
            }

            try {
                const fetched = await Promise.all(
                    memberships.map((m) =>
                        store().selectFirstAsync<UserType>(typeDefs.User, m.user_id)
                    )
                );
                const list = fetched.filter((u): u is UserType => !!u);
                if (!cancelled) setUsers(list);
            } catch {
                if (!cancelled) setUsers([]);
            }
        }
        runAsync();
        return () => {
            cancelled = true;
        };
    }, [accountId, memberships]);

    return {
        memberships,
        users,
        loading: memberships === null || users === null,
    };
}

function MemberCard({ user, accountId }: { user: UserType; accountId?: string }) {
    const avatarUrl = useFileUrl(user.profile_image_path);
    return (
        <a
            href={`/profile/${encodeURIComponent(user.id)}`}
            className="card card--hover flex items-center gap-3"
            title={user.name}
        >
            <div className="avatar w-10 h-10">
                {avatarUrl === null ? (
                    <div className="w-full h-full rounded-full bg-zinc-100 animate-pulse" />
                ) : avatarUrl ? (
                    <img
                        className="w-full h-full rounded-full object-cover"
                        src={avatarUrl}
                        alt={`${user.name} avatar`}
                    />
                ) : (
                    <div className="w-full h-full rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                        <Logo className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="font-medium truncate">{user.name || "Member"}</div>
        </a>
    );
}

export default function AccountPage() {
    const user = useCurrentUser();
    const userInfo = useUserInfo();
    const account = useAccount();

    const isLoadingUser = user === null || userInfo === null;
    const isGuest = userInfo === undefined || user === undefined;

    if (isLoadingUser) {
        return (
            <div className="page--AccountPage page-container">
                <div className="app-container section-pad">
                    <div className="page-stack">
                        <div className="card">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="avatar w-12 h-12">
                                        <div className="w-full h-full rounded-full bg-zinc-100 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="h-5 w-40 bg-zinc-100 rounded animate-pulse" />
                                        <div className="mt-1 h-4 w-24 bg-zinc-100 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-9 w-20 bg-zinc-100 rounded animate-pulse" />
                                    <div className="h-9 w-20 bg-zinc-100 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-2">
                                <UsersIcon className="w-4 h-4 text-zinc-500" />
                                <h3 className="text-lg font-semibold">Members</h3>
                            </div>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="card">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar w-10 h-10">
                                                <div className="w-full h-full rounded-full bg-zinc-100 animate-pulse" />
                                            </div>
                                            <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isGuest) {
        return (
            <div className="page--AccountPage">
                <div className="app-container section-pad">
                    <SignInRequired message="Sign in to view your account." />
                </div>
            </div>
        );
    }

    const currentAccount = userInfo?.account ?? account ?? undefined;
    const role = userInfo?.role;
    const isAdmin = role === "admin";

    return <AccountInner account={currentAccount} isAdmin={!!isAdmin} currentUser={userInfo!.user} />;
}

function AccountInner({
    account,
    isAdmin,
    currentUser,
}: {
    account?: AccountType;
    isAdmin: boolean;
    currentUser: UserType;
}) {
    const { users, memberships, loading } = useMembers(account?.id);
    const logoUrl = useFileUrl(account?.logo_image_path);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [inviteCreating, setInviteCreating] = useState(false);
    const [invite, setInvite] = useState<AccountInviteType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [form, setForm] = useState<EditableAccountForm>({
        name: account?.name ?? "",
        logo_image_path: account?.logo_image_path,
        file: null,
    });

    useEffect(() => {
        setForm({
            name: account?.name ?? "",
            logo_image_path: account?.logo_image_path,
            file: null,
        });
    }, [account?.id, account?.name, account?.logo_image_path]);

    const countMembers = useMemo(() => {
        if (!memberships || memberships === null) return 0;
        return memberships.length;
    }, [memberships]);

    const onStartEdit = () => {
        setEditing(true);
        setError(null);
    };
    const onCancelEdit = () => {
        setEditing(false);
        setError(null);
        setForm({
            name: account?.name ?? "",
            logo_image_path: account?.logo_image_path,
            file: null,
        });
    };

    const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setForm((prev) => ({ ...prev, file: f }));
        }
    };

    const onSaveAsync = async () => {
        if (!account) return;
        setSaving(true);
        setError(null);
        try {
            let logoPath = form.logo_image_path ?? account.logo_image_path;

            if (form.file) {
                const file = form.file;
                const path = `${account.id}/logo/${Date.now()}-${file.name}`;
                const { error: uploadError } = await supClient()
                    .storage.from("accounts")
                    .upload(path, file, { upsert: true });
                if (uploadError) {
                    throw new Error(uploadError.message);
                }
                logoPath = path;
            }

            const updateValue: Partial<AccountInsert> = {
                name: form.name?.trim() || account.name,
                logo_image_path: logoPath,
            };

            await store().updateAsync<AccountType>(typeDefs.Account, account.id, updateValue as any);
            setEditing(false);
        } catch (err: any) {
            setError(err?.message || "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const onCreateInviteAsync = async () => {
        if (!account || !currentUser) return;
        setInviteCreating(true);
        setError(null);
        try {
            const code = uuidv4();
            const inviteInsert: AccountInviteInsert = {
                account_id: account.id,
                invited_by_user_id: currentUser.id,
                code,
                role: "default",
            };
            const created = await store().insertAsync<AccountInviteInsert>(
                typeDefs.AccountInvite,
                inviteInsert
            );
            // Fetch back the full record if needed; here we just cast
            setInvite({
                id: (created as any).id ?? code,
                created_at: new Date().toISOString(),
                account_id: account.id,
                invited_by_user_id: currentUser.id,
                code,
                email: (created as any).email,
                role: (created as any).role ?? "default",
                expires_at: (created as any).expires_at,
                accepted_at: (created as any).accepted_at,
                accepted_by_user_id: (created as any).accepted_by_user_id,
                revoked_at: (created as any).revoked_at,
            });
        } catch (err: any) {
            setError(err?.message || "Failed to create invite.");
        } finally {
            setInviteCreating(false);
        }
    };

    const inviteLink =
        invite?.code && typeof window !== "undefined"
            ? `https://${location.host}/accept-account-invite/${invite.code}`
            : "";

    const onCopyInvite = async () => {
        if (!inviteLink) return;
        try {
            await navigator.clipboard.writeText(inviteLink);
        } catch {
            // no-op
        }
    };

    return (
        <div className="page--AccountPage">
            <div className="app-container section-pad">
                <div className="page-stack">
                    <header className="card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="avatar w-14 h-14">
                                    {logoUrl === null ? (
                                        <div className="w-full h-full rounded-full bg-zinc-100 animate-pulse" />
                                    ) : logoUrl ? (
                                        <img
                                            className="w-full h-full rounded-full object-cover"
                                            src={logoUrl}
                                            alt={`${account?.name ?? "Account"} logo`}
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                                            <Logo className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{account?.name ?? "Account"}</h1>
                                    <p className="text-sm text-zinc-600">ID: {truncateId(account?.id)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {isAdmin && !editing && (
                                    <>
                                        <button className="btn-secondary" onClick={onStartEdit}>
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Edit
                                        </button>
                                        <button className="btn-primary" onClick={onCreateInviteAsync} disabled={inviteCreating}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            {inviteCreating ? "Inviting…" : "Invite"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {editing && (
                            <>
                                <div className="divider my-4"></div>
                                <form
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        onSaveAsync();
                                    }}
                                >
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input
                                            className="input"
                                            placeholder="Account name"
                                            value={form.name}
                                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                        />
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium mb-1">Logo</label>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar w-12 h-12">
                                                {form.file ? (
                                                    <img
                                                        className="w-full h-full rounded-full object-cover"
                                                        src={URL.createObjectURL(form.file)}
                                                        alt="Logo preview"
                                                    />
                                                ) : logoUrl ? (
                                                    <img
                                                        className="w-full h-full rounded-full object-cover"
                                                        src={logoUrl}
                                                        alt="Current logo"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <ImageIcon className="w-4 h-4 mr-2" />
                                                    Choose
                                                </button>
                                                {form.file && (
                                                    <button
                                                        type="button"
                                                        className="btn-ghost"
                                                        onClick={() => setForm((p) => ({ ...p, file: null }))}
                                                    >
                                                        <X className="w-4 h-4 mr-2" />
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={onFilePick}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="md:col-span-3">
                                            <p className="text-sm text-red-600">{error}</p>
                                        </div>
                                    )}

                                    <div className="md:col-span-3 flex items-center gap-2">
                                        <button type="submit" className="btn-secondary" disabled={saving}>
                                            <Save className="w-4 h-4 mr-2" />
                                            {saving ? "Saving…" : "Save"}
                                        </button>
                                        <button type="button" className="btn-ghost" onClick={onCancelEdit} disabled={saving}>
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {invite && (
                            <>
                                <div className="divider my-4"></div>
                                <div className="card brand-border-thin">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Link2 className="w-4 h-4 text-zinc-600 shrink-0" />
                                            <p className="text-sm text-zinc-700 truncate">
                                                https://{typeof window !== "undefined" ? location.host : "your-host"}/accept-account-invite/{invite.code}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button className="btn-secondary" onClick={onCopyInvite}>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy
                                            </button>
                                            <a
                                                className="btn-ghost"
                                                href={inviteLink}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Open
                                            </a>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-zinc-600">
                                        Share this link to invite teammates to “{account?.name}”.
                                    </p>
                                </div>
                            </>
                        )}
                    </header>

                    <section className="card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <UsersIcon className="w-4 h-4 text-zinc-500" />
                                <h3 className="text-lg font-semibold">Members</h3>
                            </div>
                            {countMembers > 0 && (
                                <div className="text-sm text-zinc-600">
                                    {countMembers} {countMembers === 1 ? "member" : "members"}
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="card">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar w-10 h-10">
                                                    <div className="w-full h-full rounded-full bg-zinc-100 animate-pulse" />
                                                </div>
                                                <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : users && users.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {users
                                        .slice()
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map((u) => (
                                            <MemberCard key={u.id} user={u} accountId={account?.id} />
                                        ))}
                                </div>
                            ) : (
                                <div className="brand-frame">
                                    <p className="text-zinc-700">
                                        No members yet. {isAdmin ? "Invite your first teammate to get started." : "Ask an admin to invite teammates."}
                                    </p>
                                    {isAdmin && (
                                        <div className="mt-3">
                                            <button className="btn-primary" onClick={onCreateInviteAsync} disabled={inviteCreating}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                {inviteCreating ? "Inviting…" : "Invite"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <footer className="flex items-center justify-between">
                        <div className="text-sm text-zinc-600">
                            Need another workspace? You can create a new account.
                        </div>
                        <a className="btn-ghost" href="/register">
                            Create a new account
                        </a>
                    </footer>
                </div>
            </div>
        </div>
    );
}