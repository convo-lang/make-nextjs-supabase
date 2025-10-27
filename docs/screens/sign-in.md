# Screen Description

Name: Sign-in
Route: /sign-in

## Description
A focused, minimal sign-in screen for existing users. Guests see a centered card with:
- Logo header and concise welcome copy
- Email and password inputs
- A single primary CTA button: “Sign in” (uses the brand color)
- Subtle inline validation and error feedback
- A small, low-emphasis link to “Create an account” for new users

If the user is already signed in, the page shows a friendly notice instead of the form, with contextual actions (go to Dashboard, switch accounts via the main layout, or sign out). The design uses a stacked layout, generous negative space, and a soft gradient background. Buttons never have fixed widths, and copy is kept short. Brand accents outside the main CTA are limited to thin borders or focus rings.

Form behaviors:
- Email and password are required; inputs display errors inline when invalid
- Submit is disabled during authentication and shows a lightweight “Signing in…” state
- On success, the user is redirected to the previously requested route (if any) or to /dashboard
- If the user arrived from an account invite, they are sent back to the acceptance flow after sign-in

Accessibility:
- Labels and aria-invalid states are applied to inputs
- The primary CTA is reachable by keyboard and shows a brand-tinted focus ring
- Icon-only controls include aria-labels where present

## Actions
- Enter email and password
- Submit to sign in
- View inline validation errors and retry
- If already signed in, proceed to Dashboard or sign out
- Continue back to the originally requested route after successful sign-in (e.g., invite acceptance)

## Links
- /accept-account-invite/[inviteCode]: Return to an in-progress invite flow after signing in
- /task/[taskId]: Return to a previously requested task detail page after signing in (when applicable)