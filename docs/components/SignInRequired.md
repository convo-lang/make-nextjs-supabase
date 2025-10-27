# SignInRequired

A minimal, friendly gate for any screen that requires authentication. It presents a short explanation, a primary Sign in action, and a secondary Create account action, styled as a compact card that fits Task Bee’s light-hearted, spacious visual language.

- Purpose: Redirect unauthenticated users to sign in or register
- Audience: Guests (not signed in)
- Fit: Works inline (inside a section) or as the main focal point of a full page

## Import

```ts
import { SignInRequired } from "@/components/SignInRequired";
```

## Props

```ts
export interface SignInRequiredProps {
    /**
     * A message to display to the user
     */
    message?: string;
    className?: string;
}
```

- message: Optional copy to help the user understand why access is blocked (e.g., “Please sign in to view this task.”). If not provided, the component shows a sensible default.
- className: Optional utility for layout composition (e.g., margin, width constraints, or to switch between inline/full-page placements).

## When to use

- Dashboard, Task Detail, Account, Profile, and Public Profile screens when the user is not signed in
- Accept Account Invite when a guest opens an invite link and must authenticate first
- Any gated feature that requires an authenticated context (e.g., export, edit actions)

## Behavior and UX

- Provides two clear actions:
  - Primary: Sign in (btn-primary; reserve brand background for this main CTA)
  - Secondary: Create account (btn-secondary)
- Keeps copy concise and approachable
- Uses a stacked layout with generous spacing, subtle card surface, and rounded corners
- Links point to /sign-in and /register

Tip: If your sign-in and register pages support a next query parameter, they can redirect the user back to the intended page after authentication. Example: /sign-in?next=/task/123. See the “Preserving return destination (next)” section below for a usage snippet.

## Visual guidelines

- Use the brand color (#f9a620ff) only for the single most important CTA (Sign in)
- Use .card for the container and .btn-primary / .btn-secondary for actions
- Prefer vertical stacks; keep copy short
- Use brand-border-thin if you need a subtle non-CTA highlight state

## Accessibility

- Provide a short, descriptive message in message
- Ensure the card’s heading or text is programmatically reachable
- Keep focus states visible by default; Tailwind theme applies a brand-tinted focus ring

## Examples

Inline usage in a section (recommended for most pages)

```tsx
import { useCurrentUser } from "@/lib/hooks";
import { SignInRequired } from "@/components/SignInRequired";

export default function DashboardPage() {
    const user = useCurrentUser();

    return (
        <main className="page--DashboardPage page--full">
            <section className="page-container">
                {user === null ? (
                    <div className="card">Loading…</div>
                ) : user === undefined ? (
                    <SignInRequired message="Please sign in to access your team’s dashboard." />
                ) : (
                    <div className="page-stack">
                        {/* Authenticated dashboard content */}
                    </div>
                )}
            </section>
        </main>
    );
}
```

Full-page gate (center the card when it is the only content)

```tsx
import { useCurrentUser } from "@/lib/hooks";
import { SignInRequired } from "@/components/SignInRequired";

export default function TaskDetailPage() {
    const user = useCurrentUser();

    return (
        <main className="page--TaskDetailPage page--full">
            <section className="page-container">
                {user === null ? (
                    <div className="card">Loading…</div>
                ) : user === undefined ? (
                    <div className="app-container section-pad flex items-center justify-center">
                        <SignInRequired
                            className="max-w-lg w-full"
                            message="Sign in to view this task’s details."
                        />
                    </div>
                ) : (
                    <div className="page-stack">
                        {/* Task content */}
                    </div>
                )}
            </section>
        </main>
    );
}
```

Accept invite flow (prompt guests to sign in first)

```tsx
import { useCurrentUser } from "@/lib/hooks";
import { SignInRequired } from "@/components/SignInRequired";

export default function AcceptInvitePage() {
    const user = useCurrentUser();

    return (
        <main className="page--AcceptInvitePage page--full">
            <section className="page-container">
                {user === null ? (
                    <div className="card">Loading…</div>
                ) : user === undefined ? (
                    <SignInRequired message="Please sign in to accept your invite." />
                ) : (
                    <div className="page-stack">
                        {/* Accept invite UI for signed-in users */}
                    </div>
                )}
            </section>
        </main>
    );
}
```

## Preserving return destination (next)

If your sign-in/register pages support a next parameter for redirecting back to the requested page:

```tsx
import { useRouter } from "next/router";
import Link from "next/link";

function ExampleCustomGate() {
    const router = useRouter();
    const next = encodeURIComponent(router.asPath || "/dashboard");

    return (
        <div className="card">
            <p className="text-zinc-700">Please sign in to continue.</p>
            <div className="mt-4 flex items-center gap-2">
                <Link className="btn-primary" href={`/sign-in?next=${next}`}>
                    Sign in
                </Link>
                <Link className="btn-secondary" href={`/register?next=${next}`}>
                    Create account
                </Link>
            </div>
        </div>
    );
}
```

Note: SignInRequired itself links to /sign-in and /register. If you need fully custom link behavior (e.g., additional query params), you can render your own small gate like the snippet above or wrap the component with adjacent custom links.

## Styling notes

- Container: .card with rounded corners; optionally pair with bg-app section backgrounds for warmth
- Layout: Use app-container and section-pad when centering on a page
- Actions:
  - .btn-primary for Sign in (only one per view)
  - .btn-secondary for Create account
  - Avoid multiple brand-background buttons on the same view
- Optional highlight: brand-border-thin for subtle emphasis when embedding among other cards

## Screen-by-screen guidance

- Landing page: Not needed (public)
- Register: Not needed (public). If a user is already signed in, show a notice on the page instead of this component.
- Sign-in: Not needed (public). If a user is already signed in, show a notice on the page instead of this component.
- Dashboard, Task Detail, Account, Profile, Public Profile: Show SignInRequired when useCurrentUser() returns undefined
- Accept Account Invite: If user is a guest, display SignInRequired above the invite context to prompt sign-in

## QA checklist

- The primary action uses .btn-primary; secondary uses .btn-secondary
- The brand color appears only once as a background in the view
- Copy is short, clear, and avoids long lines
- Component remains readable on small screens (stacked layout)
- Links route correctly to /sign-in and /register (and support next when used)