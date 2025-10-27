# Screen Description

Name: Account
Route: /account

## Description
The Account screen presents an at-a-glance view of the current organization (tenant) and its membership. It uses a stacked, card-based layout with generous negative space and subtle gradients. All signed-in users can see the account’s name, logo, and a muted account ID, alongside a grid of member cards that link to each person’s public profile.

Role-based controls appear contextually:
- All signed-in users: View account info and member list; open member public profiles.
- Admins: Edit account details (name and logo) and generate a shareable invite link that teammates can use to join the account. The invite link follows this format:
  https://${location.host}/accept-account-invite/${inviteCode}

A lightweight empty state guides new teams to invite members. The primary CTA on this page is Invite (admin-only), reserving the brand color for that single action. A subtle secondary option allows creating another account for users who need multiple workspaces.

Key UI elements:
- Header card with account avatar/logo, name, and muted ID
- Admin-only actions: Edit and Invite
- Members section as a responsive grid of user cards (avatar + name), each linking to a public profile
- Contextual note or link to “Create a new account” for multi-tenant scenarios (kept secondary)

## Actions
- View account information
  - Read account name and see the logo/avatar
  - Copy or reference the account ID (displayed in a muted style)
- Browse members
  - Scan a grid of member cards with avatars and names
  - Open a member’s public profile for more details
- Admin-only
  - Edit account details (name, logo)
  - Generate and copy an invite link to onboard teammates
  - From a member’s public profile, change that member’s role (admins cannot change their own role)
- Create another account (opens the registration flow; presented as a secondary, non-CTA action)

## Links
- /profile/[userId]: Open a member’s public profile
- /accept-account-invite/[inviteCode]: Destination for invite link recipients to accept or decline the invite