# Screen Description

Name: Public Profile
Route: /profile/[userId]

## Description
A public-facing profile for a user within the context of the currently selected account (tenant). All signed-in users can view this page. It presents the user’s display name, avatar, and optional hero image with a clean, minimal layout and generous negative space. Email is not shown to preserve privacy.

Admins see the user’s role for the current account and can change it, with clear guardrails:
- Admins cannot change their own role (the control is disabled with an explanatory hint).
- Role options reflect the app’s role model: guest, default, manager, admin.
- Changes apply only to this account’s membership for the user (multi-tenant aware).
- A confirm step helps prevent accidental changes.

The profile may include light contextual info, such as when the user joined the account and a small “recent activity” snippet (when available). If recent tasks are shown, each task title links to its Task Detail page.

The page is designed to be easily shareable inside the workspace; a Copy link action provides the canonical link to this public profile route.

## Actions
- View a teammate’s public-facing information (name, avatar, optional hero image).
- Copy the shareable link to this public profile.
- Optional: Open “recent tasks” created or last updated by this user (when shown).
- Admin only:
  - View the user’s current role for this account.
  - Change the user’s role among: guest, default, manager, admin.
  - Confirm a role change before it’s applied.
  - Cannot modify their own role (control disabled with a note).

## Links
- profile/[userId]: share or copy the public profile link for this user
- task/[taskId]: open a specific task from the user’s “recent activity” list (when shown)