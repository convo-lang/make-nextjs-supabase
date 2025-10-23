# Account
Route: /account
Seen by roles: (All signed-in users)

## Requirements
- Shows basic account info including:
    - name
    - logo
    - id - muted

- Users with the admin role can edit account info

- Users Sections: a grid of user cards of users that belong to the account. The cards should include the name
of the user and their profile picture. The cards should link to the public profile of the user

- link to create a new account

- Account admins should be able to invite users to the account via an invite link: `https://${location.host}/accept-account-invite/${inviteCode}`