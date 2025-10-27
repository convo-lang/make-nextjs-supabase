# Screen Description

Name: Profile
Route: /profile

## Description
The private Profile page lets a signed-in user view and manage their personal details and workspace memberships. It emphasizes a simple, stacked layout with generous spacing and cards. The user can update their display name, change profile and hero images, and quickly switch between accounts they belong to. Email is visible but not editable.

The header presents the user’s avatar, name, and a read-only email. A profile editor card provides fields for name and image controls. A memberships section lists all accounts the user belongs to with role badges; each account entry includes a quick Switch action to set the active account without leaving the page.

Uploads for profile and hero images follow the storage path convention in the accounts bucket:
- {account_id}/users/{user_id}/profile.jpg (or equivalent)
- {account_id}/users/{user_id}/hero.jpg (or equivalent)

Removing an image clears the corresponding path in the user record. The page uses minimal brand highlights, reserving the brand color for only the most important action (e.g., Save changes).

Empty states:
- No profile image: show a neutral avatar placeholder.
- No hero image: show a soft surface frame.
- No memberships: show a short note with guidance to join or create an account (linking to Account is available via main nav, not within this screen’s links).

Accessibility:
- Image buttons include aria-labels (Upload avatar, Remove avatar, Upload banner).
- Email is read-only and clearly labeled.
- Role badges include text alternatives.

## Actions
- Edit profile
  - Change display name (required)
  - View email (read-only, non-editable)
  - Upload/replace profile image (avatar)
  - Remove profile image
  - Upload/replace hero image (banner)
  - Remove hero image
  - Save changes
  - Cancel edits
- Account memberships
  - View all accounts the user belongs to (name + role badge)
  - Switch active account directly from the list
  - Copy account name or ID (optional utility action on each row)
- Public presence
  - Copy link to public profile
  - Open public profile in a new tab

Validation and behavior notes:
- Name is required; show inline error for empty or whitespace-only values.
- Email is read-only and cannot be edited.
- File uploads store only the storage path in the database; full URLs are resolved client-side.
- Switch account calls the app controller and updates the active workspace without leaving the page context.

## Links
- profile/[user-id]: Open the public view of the current user’s profile