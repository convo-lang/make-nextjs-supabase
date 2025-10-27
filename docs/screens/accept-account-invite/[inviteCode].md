# Screen Description

Name: Accept Account Invite
Route: /accept-account-invite/[inviteCode]

## Description
A focused, role-agnostic screen where anyone with a valid invite link can review details about the account they’re joining and accept or decline the invitation. The screen prioritizes clarity and safety, showing the target account name, the role that will be granted upon acceptance, who invited the user (if available), and any expiration or revocation status.

Behavior and states, at a glance:
- Loading: The invite code is verified and the related account info is fetched.
- Valid invite:
  - If signed in: The page shows the Account and Role that will be granted. Accepting creates or updates the membership and switches the current context to that account.
  - If not signed in: A simple gate informs the user that sign-in is required before accepting. After sign-in, the user is returned to this page automatically.
- Already a member: If the signed-in user already belongs to the target account, the screen confirms membership and offers to switch to that account.
- Email mismatch (optional): If the invite targets a specific email and the signed-in user’s email differs, the screen shows a non-blocking warning and suggests using the intended email or proceeding if the admin allows.
- Expired or revoked: The screen explains that the invite can’t be used and suggests requesting a new invite from an account admin.
- Acceptance success: Confirms the membership and switches account context; the user can proceed directly to their workspace.
- Decline: The invite is marked as declined (or simply closed client-side if declines aren’t tracked), and the user can move on.

Interaction and visual guidance:
- The primary CTA is Accept invite (brand-colored button).
- Decline and secondary actions use low-emphasis styles.
- If the inviter is known, their avatar/name is shown with a link to their public profile within the account context.

## Actions
- Review invite details:
  - See target account name and logo (if available)
  - See inviter (if available) and the role that will be granted
  - See expiration or revocation status
- Accept invite (primary)
- Decline invite
- Copy invite link to clipboard for reference
- Resolve sign-in requirement if not authenticated (return to this screen post-auth)
- Resolve email mismatch (proceed with current user or switch accounts)
- Switch to the joined account immediately after acceptance
- Retry loading invite if a transient error occurs

## Links
- accept-account-invite/[inviteCode]: deep link to this invite (share/copy)
- profile/[userId]: link to the inviter’s public profile (when available)