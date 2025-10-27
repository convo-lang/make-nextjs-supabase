# Screen Description

Name: Register
Route: /register

## Description
The Register screen enables new users to create an account and bootstrap a new organization in a single step. Guests see a clean, centered form with stacked inputs for name, email, organization name, and password. On submit, the app signs the user up via Supabase and passes the provided name and organization name as metadata to seed their initial workspace. If a user is already signed in, this screen replaces the form with a simple message indicating they are already registered, with guidance to proceed to their workspace.

The layout follows Task Bee’s minimal, light-hearted style: a single primary CTA, generous negative space, gentle gradients, rounded surfaces, and short, clear copy. The brand color is reserved for the primary “Create account” action only.

## Actions
- Enter full name
- Enter email address
- Enter organization name
- Enter password
- Submit registration (primary CTA)
- Toggle password visibility (optional)
- View client-side validation errors for required fields and email format
- See server error messages from sign-up (e.g., email already in use)
- If sign-up requires email confirmation: see post-submit “Check your email” notice
- If already signed in: acknowledge “You’re already registered” notice and proceed to your workspace

## Links
- accept-account-invite/[inviteCode]: If the user arrived via or has an invite code, direct them to accept an account invite instead of creating a new organization.

## Form fields
- Name: Required text input for the user’s full name
- Email: Required email input (trimmed before submit)
- Organization name: Required text input for the new workspace
- Password: Required password input with optional show/hide control

## Validation and behavior
- All fields are required; email must be valid format
- Password: minimum 8 characters recommended (show inline guidance)
- Disable primary CTA while submitting; show a subtle loading state
- Display inline errors beneath inputs; use aria-invalid on invalid fields
- On submit, call Supabase auth signUp and include metadata for backend bootstrapping:
  - options.data: { name: form.name, accountName: form.accountName }
- Do not insert records directly into the database; backend manages user/account setup
- On success:
  - If a session is immediately available: proceed to the app (typically dashboard)
  - If email confirmation is required: show a confirmation notice with instructions to verify email

## States
- Guest (default): Shows registration form inside a card
- Submitting: Primary button disabled, form read-only; subtle progress feedback
- Success:
  - Immediate session: show brief success message then transition into the app
  - Email confirmation required: show “Check your email” card
- Error: Show descriptive server error (e.g., “Email already registered”)
- Already signed in: Replace form with a friendly notice that registration is complete for the current user

## Accessibility
- Each input has an associated label
- Invalid fields set aria-invalid="true" and show error text
- Announce submission errors via an aria-live region
- Password toggle includes an accessible label (e.g., “Show password”)

## Style notes
- Use a stacked column layout with generous spacing (app-container, page-stack, section-pad)
- Render the form in a card with soft elevation; avoid dense borders
- Use .btn-primary only for “Create account”
- Use .btn-ghost for low-emphasis secondary actions (e.g., “I already have an account”)
- Keep button labels short; do not set fixed widths on text buttons
- Reserve brand color for the primary CTA background or thin borders for subtle emphasis only