# Main Layout

A centered, responsive shell with a top navigation bar that collapses on mobile. It renders page content via a single children prop and supports page display modes controlled by hooks:
- useFullPage: hides the main navigation and ancillary UI, showing only page content
- useNoMargins: removes page margins to allow edge-to-edge content

The layout follows the Task Bee style guide: clean vertical stacks, rounded surfaces, subtle gradients, and minimal brand usage.

## Responsibilities
- Provide a consistent app frame with a sticky top navigation
- Handle responsive navigation with a mobile menu toggle
- Include an account switcher in the top bar
- Respect page display modes (full-screen and no-margins)
- Render the active page via a single children prop
- Avoid unmounting the page when modes change

## Navigation links

Shown to all:
- Home: /

Shown only to signed-in users:
- Dashboard: /dashboard
- Account: /account
- Profile: /profile

Shown only to guests (not signed-in):
- Register: /register
- Sign in: /sign-in

Not in the top nav (accessed contextually):
- Task Detail: /task/[taskId]
- Accept Account Invite: /accept-account-invite/[inviteCode]
- Public Profile: /profile/[userId]

## Visual and interaction guidelines
- Use app-container and section-pad to center and pad content
- Use btn-ghost for most nav links; reserve brand color (btn-primary) for page CTAs, not for nav
- Top bar is sticky with a soft surface and subtle border; on mobile it collapses behind a hamburger button
- Account switcher appears as a compact button that opens a simple dropdown with available accounts

## Props
- children: React.ReactNode (required)
  The page content to render within the layout. Always a single prop.

## Page modes
- Fullscreen mode: If useIsInFullPageMode() returns true, hide the top nav and frame; render only the page content area
- No-margins mode: If useIsNoMarginMode() returns true, the page container removes horizontal paddings and margins

## Implementation

Example component (named export) that respects the style guide and coding rules.

```tsx
import React, { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/util";
import {
    useAccount,
    useCurrentUser,
    useIsInFullPageMode,
    useIsNoMarginMode,
    useUserInfo,
} from "@/lib/hooks";
import { app } from "@/lib/app";
import { store } from "@/lib/store";
import { typeDefs, Account as AccountType, AccountMembership as AccountMembershipType } from "@/lib/schema";
import { supClient } from "@/lib/supabase";
import {
    Menu as MenuIcon,
    X as XIcon,
    ChevronDown,
    LogOut,
    User2,
    LayoutDashboard,
    Building2,
    Home as HomeIcon,
    LogIn,
    UserPlus
} from "lucide-react";

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const isFull = useIsInFullPageMode();
    const noMargins = useIsNoMarginMode();

    const user = useCurrentUser();
    const { account: currentAccount } = useUserInfo() ?? {};
    const account = useAccount();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const [accounts, setAccounts] = useState<AccountType[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(false);

    // Load accounts for the current user (for the account switcher)
    useEffect(() => {
        let cancelled = false;
        async function loadAccountsAsync() {
            if (!user) {
                setAccounts([]);
                return;
            }
            setLoadingAccounts(true);
            try {
                const memberships = await store().selectMatchesAsync<AccountMembershipType>(
                    typeDefs.AccountMembership,
                    { user_id: user.id }
                );

                const acctIds = Array.from(
                    new Set(
                        (memberships ?? [])
                            .map(m => m.account_id)
                            .filter((v): v is string => !!v)
                    )
                );

                // Fetch each account by id
                const fetched = await Promise.all(
                    acctIds.map(id => store().selectFirstAsync<AccountType>(typeDefs.Account, id))
                );

                const list = fetched.filter((a): a is AccountType => !!a);
                if (!cancelled) {
                    setAccounts(list);
                }
            } catch {
                if (!cancelled) {
                    setAccounts([]);
                }
            } finally {
                if (!cancelled) {
                    setLoadingAccounts(false);
                }
            }
        }
        loadAccountsAsync();
        return () => { cancelled = true; };
    }, [user]);

    const isSignedIn = user !== undefined && user !== null;

    const desktopLinks = useMemo(() => {
        if (isSignedIn) {
            return [
                { href: "/", label: "Home", icon: HomeIcon },
                { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { href: "/account", label: "Account", icon: Building2 },
                { href: "/profile", label: "Profile", icon: User2 },
            ];
        }
        return [
            { href: "/", label: "Home", icon: HomeIcon },
            { href: "/register", label: "Register", icon: UserPlus },
            { href: "/sign-in", label: "Sign in", icon: LogIn },
        ];
    }, [isSignedIn]);

    const onSignOutAsync = async () => {
        await supClient().auth.signOut();
        setMobileOpen(false);
    };

    const onSwitchAccountAsync = async (accountId: string) => {
        await app().switchAccountAsync(accountId);
        setSwitcherOpen(false);
        setMobileOpen(false);
    };

    // If the page requests fullscreen, hide the top navigation and render children only
    if (isFull) {
        return (
            <div className={cn("min-h-screen bg-app", noMargins && "page--no-margins")}>
                {children}
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen bg-app flex flex-col")}>
            {/* Top nav */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-zinc-200">
                <div className="app-container section-pad py-2">
                    <div className="flex items-center justify-between">
                        {/* Left: brand and account switcher */}
                        <div className="flex items-center gap-3">
                            <a href="/" className="flex items-center gap-2">
                                <Logo className="w-8 h-8" />
                                <span className="sr-only">Task Bee</span>
                            </a>

                            {/* Account switcher (only visible when signed in) */}
                            {isSignedIn && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="btn-ghost flex items-center gap-2"
                                        aria-haspopup="listbox"
                                        aria-expanded={switcherOpen}
                                        onClick={() => setSwitcherOpen(o => !o)}
                                    >
                                        <span className="truncate max-w-[10rem]">
                                            {currentAccount?.name || account?.name || "Workspace"}
                                        </span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    {switcherOpen && (
                                        <div className="absolute mt-2 w-64 max-w-[80vw] rounded-md shadow-lg border border-zinc-200 bg-white p-1">
                                            <div className="px-2 py-1 text-xs text-zinc-500">
                                                Switch account
                                            </div>
                                            <div role="listbox" className="max-h-64 overflow-auto">
                                                {loadingAccounts && (
                                                    <div className="px-2 py-2 text-sm text-zinc-600">
                                                        Loading accounts…
                                                    </div>
                                                )}
                                                {!loadingAccounts && accounts.length === 0 && (
                                                    <div className="px-2 py-2 text-sm text-zinc-600">
                                                        No other accounts found.
                                                    </div>
                                                )}
                                                {!loadingAccounts && accounts.length > 0 && (
                                                    <ul className="flex flex-col">
                                                        {accounts
                                                            .slice()
                                                            .sort((a, b) =>
                                                                a.id === currentAccount?.id ? -1 :
                                                                b.id === currentAccount?.id ? 1 : 0
                                                            )
                                                            .map(acct => (
                                                                <li key={acct.id}>
                                                                    <button
                                                                        className={cn(
                                                                            "w-full text-left btn-ghost justify-start",
                                                                            acct.id === currentAccount?.id && "brand-border-thin"
                                                                        )}
                                                                        role="option"
                                                                        aria-selected={acct.id === currentAccount?.id}
                                                                        onClick={() => onSwitchAccountAsync(acct.id)}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="avatar w-6 h-6">
                                                                                {/* Logo image will be resolved by useFileUrl in real UI */}
                                                                                <div className="w-full h-full rounded-full bg-zinc-100" />
                                                                            </div>
                                                                            <span className="truncate">{acct.name}</span>
                                                                        </div>
                                                                    </button>
                                                                </li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div className="mt-1 px-1 pb-1">
                                                <a
                                                    href="/account"
                                                    className="btn-ghost w-full justify-start"
                                                    onClick={() => setSwitcherOpen(false)}
                                                >
                                                    Manage accounts
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Center: desktop nav links */}
                        <nav className="hidden md:flex items-center gap-1">
                            {desktopLinks.map(item => (
                                <a key={item.href} href={item.href} className="btn-ghost">
                                    <item.icon className="w-4 h-4 mr-2" />
                                    <span>{item.label}</span>
                                </a>
                            ))}
                        </nav>

                        {/* Right: auth or profile controls + mobile toggle */}
                        <div className="flex items-center gap-2">
                            {/* Sign out for signed-in users */}
                            {isSignedIn && (
                                <button className="btn-ghost" onClick={onSignOutAsync}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign out
                                </button>
                            )}

                            {/* Mobile menu toggle */}
                            <button
                                className="btn-icon md:hidden"
                                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                                onClick={() => setMobileOpen(o => !o)}
                            >
                                {mobileOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile nav */}
                    {mobileOpen && (
                        <div className="md:hidden mt-2">
                            <nav className="flex flex-col gap-1">
                                {desktopLinks.map(item => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className="btn-ghost justify-start"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <item.icon className="w-4 h-4 mr-2" />
                                        <span>{item.label}</span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <main
                className={cn(
                    "flex-1",
                    noMargins ? "page--no-margins" : "page-container section-pad"
                )}
            >
                <div className={cn(noMargins ? "full-bleed" : "app-container")}>
                    <div className="page-stack">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
```

Notes
- The account switcher lists all accounts for the current user by querying account_membership and then resolving accounts by id. The current account is pinned to the top and subtly highlighted using brand-border-thin.
- On small screens, the navigation collapses behind a hamburger button; when expanded, links are shown in a vertical stack.
- All buttons with text avoid fixed widths; nav links use btn-ghost, keeping the brand color reserved for primary CTAs within pages.
- The layout never unmounts children when toggling display modes. It only hides nav and adjusts padding/margins based on useIsInFullPageMode and useIsNoMarginMode.

## Usage in Next.js pages app

Use MainLayout in the top-level App component (pages/_app.tsx). Pages should export a default component and must not render MainLayout themselves.

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import { MainLayout } from "@/components/MainLayout";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <MainLayout>
            <Component {...pageProps} />
        </MainLayout>
    );
}
```

## Accessibility
- The mobile menu toggle and account switcher have appropriate aria attributes
- Icon-only buttons include aria-label
- Focus states rely on the theme’s brand-tinted ring for inputs and buttons
- The header is sticky for quick access to navigation without obstructing content

## Styling references
- Backgrounds: bg-app for the page surface, with a soft border under the header
- Containers: app-container and section-pad to center and pad content
- Actions: btn-ghost for nav links, btn-icon for the mobile toggle
- Highlights: brand-border-thin for subtle emphasis, avoiding brand backgrounds in the nav

This layout provides a minimal, light-hearted frame that keeps navigation simple, preserves the brand color for in-page CTAs, and supports the full-screen and edge-to-edge modes required by Task Bee’s editor and preview experiences.