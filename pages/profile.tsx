import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/util";
import {
    useAccount,
    useCurrentUser,
    useUserInfo,
    useStoreMatchingItems,
    useFileUrl,
} from "@/lib/hooks";
import { typeDefs, User as UserType, Account as AccountType, AccountMembership as AccountMembershipType } from "@/lib/schema";
import { store } from "@/lib/store";
import { supClient } from "@/lib/supabase";
import { app } from "@/lib/app";
import { SignInRequired } from "@/components/SignInRequired";
import {
    Camera,
    Image as ImageIcon,
    Trash2,
    Copy,
    ExternalLink,
    Check,
    Loader2,
    RefreshCcw,
    Building2,
    Shield,
    UserCircle2
} from "lucide-react";

interface ProfileForm {
    name: string;
    profile_image_path?: string | null;
    hero_image_path?: string | null;
    email: string;
}

function RoleBadge({ role }: { role?: string }) {
    if (!role) {
        return <span className="badge">Member</span>;
    }
    const label = role.charAt(0).toUpperCase() + role.slice(1);
    return (
        <span className={cn("badge", role === "admin" && "badge--success")}>
            <span className="sr-only">Role:</span> {label}
        </span>
    );
}

export default function ProfilePage() {
    const user = useCurrentUser();
    const account = useAccount();
    const userInfo = useUserInfo();

    const accountId = userInfo?.account?.id ?? account?.id;
    const userId = user?.id;

    const memberships = useStoreMatchingItems<AccountMembershipType>(
        typeDefs.AccountMembership,
        user ? { user_id: user.id } : undefined
    );

    const [accountsById, setAccountsById] = useState<Record<string, AccountType>>({});
    const [loadingAccounts, setLoadingAccounts] = useState(false);

    const [form, setForm] = useState<ProfileForm | null>(null);
    const [errors, setErrors] = useState<{ name?: string }>({});
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<number | null>(null);

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingHero, setUploadingHero] = useState(false);

    const [copiedProfileLink, setCopiedProfileLink] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const heroInputRef = useRef<HTMLInputElement>(null);

    // Initialize form from user
    useEffect(() => {
        if (user === null) return; // loading
        if (!user) return; // not signed-in handled below
        const initial: ProfileForm = {
            name: user.name ?? "",
            email: user.email ?? "",
            profile_image_path: user.profile_image_path ?? null,
            hero_image_path: user.hero_image_path ?? null,
        };
        setForm(initial);
        setErrors({});
    }, [user?.id]); // re-init if user changes

    // Load accounts for memberships
    useEffect(() => {
        let cancelled = false;
        async function loadAccountsAsync() {
            if (!memberships || memberships.length === 0) {
                setAccountsById({});
                return;
            }
            setLoadingAccounts(true);
            try {
                const ids = Array.from(
                    new Set(
                        memberships
                            .map(m => m.account_id)
                            .filter((v): v is string => !!v)
                    )
                );
                const fetched = await Promise.all(
                    ids.map(id => store().selectFirstAsync<AccountType>(typeDefs.Account, id))
                );
                const map: Record<string, AccountType> = {};
                ids.forEach((id, idx) => {
                    const acct = fetched[idx];
                    if (acct) map[id] = acct;
                });
                if (!cancelled) {
                    setAccountsById(map);
                }
            } catch {
                if (!cancelled) {
                    setAccountsById({});
                }
            } finally {
                if (!cancelled) {
                    setLoadingAccounts(false);
                }
            }
        }
        if (memberships !== null) {
            loadAccountsAsync();
        }
        return () => {
            cancelled = true;
        };
    }, [memberships?.length]);

    const avatarUrl = useFileUrl(form?.profile_image_path || undefined);
    const heroUrl = useFileUrl(form?.hero_image_path || undefined);

    const isSignedIn = user !== undefined && user !== null;

    const validate = (draft: ProfileForm) => {
        const e: { name?: string } = {};
        if (!draft.name || draft.name.trim().length === 0) {
            e.name = "Name is required";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSaveAsync = async () => {
        if (!user) return;
        if (!form) return;
        const draft = { ...form, name: form.name.trim() };
        if (!validate(draft)) return;
        setSaving(true);
        try {
            await store().updateAsync<UserType>(typeDefs.User, user.id, {
                name: draft.name,
                // Cast to any to allow null-clearing when removing
                profile_image_path: (draft.profile_image_path ?? null) as any,
                hero_image_path: (draft.hero_image_path ?? null) as any,
            });
            setSavedAt(Date.now());
        } catch (err) {
            // Optionally show an error UI; keeping minimal
        } finally {
            setSaving(false);
            // Refresh user form state after save to ensure local form reflects DB
            // In many apps, store hooks propagate; here we conservatively keep form as-is
        }
    };

    const onCancel = () => {
        if (!user) return;
        setForm({
            name: user.name ?? "",
            email: user.email ?? "",
            profile_image_path: user.profile_image_path ?? null,
            hero_image_path: user.hero_image_path ?? null,
        });
        setErrors({});
    };

    const onChooseAvatar = () => avatarInputRef.current?.click();
    const onChooseHero = () => heroInputRef.current?.click();

    function getFileExt(file: File) {
        const fromName = file.name.includes(".") ? file.name.split(".").pop() : undefined;
        if (fromName) return fromName.toLowerCase();
        const mime = file.type;
        if (mime.startsWith("image/")) {
            return mime.substring("image/".length);
        }
        return "jpg";
    }

    const uploadToStorageAsync = async (file: File, kind: "profile" | "hero"): Promise<string | undefined> => {
        if (!accountId || !userId) {
            return undefined;
        }
        const ext = getFileExt(file);
        const key = `${accountId}/users/${userId}/${kind}-${Date.now()}.${ext}`;
        const res = await supClient().storage.from("accounts").upload(key, file, {
            cacheControl: "3600",
            upsert: true,
        });
        if (res.error) {
            return undefined;
        }
        return key;
    };

    const onAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.currentTarget.value = ""; // reset
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const path = await uploadToStorageAsync(file, "profile");
            if (path && form) {
                setForm({ ...form, profile_image_path: path });
            }
        } finally {
            setUploadingAvatar(false);
        }
    };

    const onHeroSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.currentTarget.value = ""; // reset
        if (!file) return;
        setUploadingHero(true);
        try {
            const path = await uploadToStorageAsync(file, "hero");
            if (path && form) {
                setForm({ ...form, hero_image_path: path });
            }
        } finally {
            setUploadingHero(false);
        }
    };

    const onRemoveAvatar = () => {
        if (!form) return;
        setForm({ ...form, profile_image_path: null });
    };

    const onRemoveHero = () => {
        if (!form) return;
        setForm({ ...form, hero_image_path: null });
    };

    const publicProfileHref = user ? `/profile/${encodeURIComponent(user.id)}` : "#";

    const onCopyPublicProfile = async () => {
        try {
            const url = `${location.origin}${publicProfileHref}`;
            await navigator.clipboard.writeText(url);
            setCopiedProfileLink(true);
            setTimeout(() => setCopiedProfileLink(false), 1500);
        } catch {}
    };

    const onCopyText = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {}
    };

    const onSwitchAccountAsync = async (targetAccountId: string) => {
        await app().switchAccountAsync(targetAccountId);
    };

    // Derived booleans
    const hasChanges = useMemo(() => {
        if (!user || !form) return false;
        return (
            (form.name ?? "").trim() !== (user.name ?? "").trim() ||
            (form.profile_image_path ?? null) !== (user.profile_image_path ?? null) ||
            (form.hero_image_path ?? null) !== (user.hero_image_path ?? null)
        );
    }, [user?.id, form?.name, form?.profile_image_path, form?.hero_image_path, user?.name, user?.profile_image_path, user?.hero_image_path]);

    if (user === undefined) {
        // Not signed in
        return (
            <div className="page--ProfilePage">
                <div className="app-container section-pad">
                    <SignInRequired message="You need to sign in to view your profile." />
                </div>
            </div>
        );
    }

    if (user === null || form === null) {
        // Loading
        return (
            <div className="page--ProfilePage">
                <div className="app-container section-pad">
                    <div className="page-stack">
                        <div className="card">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                                <span className="text-zinc-700">Loading profile…</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page--ProfilePage">
            <section className="page-container section-pad">
                <div className="page-stack">
                    {/* Hero banner */}
                    <div className={cn("relative rounded-lg overflow-hidden", !heroUrl && "bg-surface-soft")}>
                        <div className="w-full h-48 md:h-56 lg:h-64">
                            {heroUrl === null ? (
                                <div className="w-full h-full bg-zinc-100 animate-pulse" />
                            ) : heroUrl === undefined ? (
                                <div className="w-full h-full bg-surface-soft flex items-center justify-center text-zinc-400">
                                    <ImageIcon className="w-10 h-10" />
                                </div>
                            ) : (
                                <img
                                    src={heroUrl}
                                    alt="Profile hero"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        {/* Hero actions */}
                        <div className="absolute right-3 top-3 flex items-center gap-2">
                            <button
                                className="btn-secondary btn-icon md:btn-secondary"
                                onClick={onChooseHero}
                                aria-label="Upload banner"
                                disabled={!accountId || uploadingHero}
                                title={!accountId ? "No active account to store files" : "Upload banner"}
                            >
                                {uploadingHero ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                            </button>
                            <button
                                className="btn-ghost btn-icon"
                                onClick={onRemoveHero}
                                aria-label="Remove banner"
                                disabled={form.hero_image_path == null}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <input
                                ref={heroInputRef}
                                className="hidden"
                                type="file"
                                accept="image/*"
                                onChange={onHeroSelected}
                            />
                        </div>

                        {/* Avatar on banner */}
                        <div className="absolute left-4 bottom-[-2.5rem] flex items-end gap-3">
                            <div className="avatar w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow">
                                {avatarUrl === null ? (
                                    <div className="w-full h-full rounded-full bg-zinc-100 animate-pulse" />
                                ) : avatarUrl === undefined ? (
                                    <div className="w-full h-full rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500">
                                        <UserCircle2 className="w-10 h-10" />
                                    </div>
                                ) : (
                                    <img
                                        src={avatarUrl}
                                        alt="User avatar"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="mb-2 flex items-center gap-2">
                                <button
                                    className="btn-secondary btn-icon md:btn-secondary"
                                    onClick={onChooseAvatar}
                                    aria-label="Upload avatar"
                                    disabled={!accountId || uploadingAvatar}
                                    title={!accountId ? "No active account to store files" : "Upload avatar"}
                                >
                                    {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                </button>
                                <button
                                    className="btn-ghost btn-icon"
                                    onClick={onRemoveAvatar}
                                    aria-label="Remove avatar"
                                    disabled={form.profile_image_path == null}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <input
                                    ref={avatarInputRef}
                                    className="hidden"
                                    type="file"
                                    accept="image/*"
                                    onChange={onAvatarSelected}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Header: name and email */}
                    <div className="card mt-12">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <h1 className="text-2xl font-bold">{form.name || "Unnamed user"}</h1>
                                <p className="text-sm text-zinc-600">{form.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="btn-ghost" onClick={onCopyPublicProfile}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy public link
                                </button>
                                <a className="btn-secondary" href={publicProfileHref} target="_blank" rel="noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open public
                                </a>
                            </div>
                        </div>
                        {copiedProfileLink && (
                            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                                <Check className="w-4 h-4" /> Copied!
                            </div>
                        )}
                    </div>

                    {/* Profile editor */}
                    <div className="card max-w-2xl">
                        <h2 className="text-lg font-semibold">Edit profile</h2>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Display name</label>
                                <input
                                    className="input"
                                    value={form.name}
                                    aria-invalid={!!errors.name}
                                    placeholder="Enter your name"
                                    onChange={(e) => {
                                        const next = { ...form, name: e.target.value };
                                        setForm(next);
                                        if (errors.name) validate(next);
                                    }}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input className="input" value={form.email} readOnly />
                                <p className="text-xs text-zinc-500 mt-1">Email is read-only</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="btn-primary"
                                    onClick={onSaveAsync}
                                    disabled={saving || !hasChanges || !!errors.name}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        <>Save changes</>
                                    )}
                                </button>
                                <button className="btn-ghost" type="button" onClick={onCancel} disabled={saving || !hasChanges}>
                                    Cancel
                                </button>
                                {savedAt && !saving && (
                                    <div className="text-sm text-green-600 flex items-center gap-1">
                                        <Check className="w-4 h-4" /> Saved
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Memberships */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Account memberships</h2>
                            {loadingAccounts && (
                                <div className="text-sm text-zinc-600 flex items-center gap-1">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                                </div>
                            )}
                        </div>

                        <div className="mt-4 space-y-2">
                            {memberships === null ? (
                                <div className="text-zinc-600">Loading memberships…</div>
                            ) : memberships && memberships.length > 0 ? (
                                memberships
                                    .slice()
                                    .sort((a, b) => {
                                        const an = accountsById[a.account_id]?.name || "";
                                        const bn = accountsById[b.account_id]?.name || "";
                                        return an.localeCompare(bn);
                                    })
                                    .map((m) => {
                                        const acct = accountsById[m.account_id];
                                        const current = m.account_id === accountId;
                                        return (
                                            <div
                                                key={m.id}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border border-zinc-200",
                                                    current && "brand-border-thin"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="avatar w-8 h-8">
                                                        <div className="w-full h-full rounded-full bg-zinc-100" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium truncate flex items-center gap-2">
                                                            <span className="truncate">
                                                                {acct?.name ?? "Account"}
                                                            </span>
                                                            <RoleBadge role={m.role} />
                                                        </div>
                                                        <div className="text-xs text-zinc-500 truncate">
                                                            {acct?.id ?? m.account_id}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {current ? (
                                                        <span className="badge--success">Current</span>
                                                    ) : (
                                                        <button
                                                            className="btn-secondary"
                                                            onClick={() => onSwitchAccountAsync(m.account_id)}
                                                        >
                                                            <RefreshCcw className="w-4 h-4 mr-2" />
                                                            Switch
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn-ghost btn-icon"
                                                        aria-label="Copy account name"
                                                        onClick={() => onCopyText(acct?.name ?? "Account")}
                                                        title="Copy account name"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="btn-ghost btn-icon"
                                                        aria-label="Copy account ID"
                                                        onClick={() => onCopyText(acct?.id ?? m.account_id)}
                                                        title="Copy account ID"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="brand-frame">
                                    <p className="text-zinc-700">
                                        You don’t belong to any accounts yet. Join or create one from the Account page.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick tips / info */}
                    <div className="card bg-surface-soft">
                        <div className="flex items-start gap-3">
                            <Building2 className="w-5 h-5 text-zinc-500 mt-0.5" />
                            <p className="text-sm text-zinc-700">
                                Uploads are stored per-account in Supabase storage using the path:
                                <br />
                                <code className="text-xs">
                                    {accountId && userId
                                        ? `${accountId}/users/${userId}/...`
                                        : "{account_id}/users/{user_id}/..."}
                                </code>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}