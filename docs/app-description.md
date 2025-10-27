## Task Bee

A minimal, light-hearted task manager for companies. Task Bee helps teams capture, organize, complete, and archive tasks, with rich markdown details and simple sharing.

### Overview
Task Bee enables signed-in users to manage their organization’s tasks in a multi-tenant setup. Tasks can include detailed markdown content with edit and preview modes, can be marked complete, archived, and exported as a markdown file. Account admins can manage account details and user roles, while all signed-in users gain access to dashboards and task detail pages.

## Features

- Task management
  - Add tasks
  - Remove tasks
  - Mark tasks as completed
  - Archive tasks
  - Download tasks as a markdown file
  - Store detailed task information in markdown format
    - Includes both edit and preview modes
  - Share a link to a task detail page

- Account and access
  - Multi-tenant accounts with role-based visibility and permissions
  - Invite users to an account via an invite link
  - View account info, logo, and ID
  - Admins can edit account info and manage member roles
  - View user profiles (self and public view)
  - Switch between accounts

## User Roles

- guest
  - A user not signed in
- default
  - Default role for a signed-in user belonging to an account
- manager
  - An account manager with elevated capabilities
- admin
  - A super admin that can manage any account and its users

## Screens

### Landing page
- Route: /
- Seen by roles: all
- Description: A marketing page for Task Bee with a large, eye-catching full-screen hero carousel highlighting the app’s top value propositions.

### Register
- Route: /register
- Seen by roles: all
- Description: Register a new user and create an organizational account. If already signed in, a message indicates the user is already registered.
- Inputs:
  - name
  - email
  - Organization name
  - password

### Sign-in
- Route: /sign-in
- Seen by roles: all
- Description: Sign in as an existing user. If already signed in, a message indicates the user is already signed in.
- Inputs:
  - email
  - password

### Dashboard
- Route: /dashboard
- Seen by roles: all signed-in users
- Description: The central place for managing tasks for the current company/account.
- Capabilities:
  - Add, remove tasks
  - Mark tasks as completed
  - Archive tasks
  - Download tasks as markdown

### Task Detail
- Route: /task/[task-id]
- Seen by roles: all signed-in users
- Description: A dedicated page to manage and view a single task.
- Capabilities:
  - View and edit task details in markdown
    - Toggle between edit and preview modes
  - Mark as completed
  - Archive task
  - Download this task as markdown
  - Share a link to this task

### Account
- Route: /account
- Seen by roles: all signed-in users
- Description: Shows account information and membership.
- Details:
  - Displays:
    - name
    - logo
    - id (muted)
  - Admin-only:
    - Edit account info
    - Invite users via invite link:
      - https://${location.host}/accept-account-invite/${inviteCode}
  - Users section:
    - Grid of user cards (name + profile picture), linking to each user’s public profile
  - Link to create a new account

### Accept Account Invite
- Route: /accept-account-invite/[invite-code]
- Seen by roles: all
- Description: Accept or decline an invite to join an account. If not signed in, users are prompted to sign in first.

### Profile
- Route: /profile
- Seen by roles: all signed-in users
- Description: The private profile page for the current user.
- Capabilities:
  - View personal info
  - View all accounts the user belongs to, with option to switch accounts
  - Edit profile fields, except email address (not editable)

### Public Profile
- Route: /profile/[user-id]
- Seen by roles: all signed-in users
- Description: Public-facing profile page as seen by other users within the account context.
- Admin functionality:
  - Admins can see the user’s role
  - Admins can change the user’s role
  - Admins cannot change their own role

## Task Model and Behaviors

- A task contains:
  - Title and status (active, completed, archived)
  - Detailed description in markdown
  - Metadata related to its account
- Actions:
  - Edit details in markdown with a live preview mode
  - Mark complete for workflow visibility
  - Archive to keep the dashboard focused while retaining historical context
  - Export/download as a markdown file for offline sharing or documentation
  - Share link to the task detail page with teammates

## Styling

- Framework: Tailwind CSS
- Look and feel:
  - Minimalistic
  - Light-hearted
  - Good use of negative space
  - Gradient backgrounds
  - Rounded corners and surfaces
- Custom color palette:
  - CSS variables:
    - --light-blue: #a8d5e2ff
    - --orange-web: #f9a620ff (Brand color)
    - --mustard: #ffd449ff
    - --forest-green: #548c2fff (Secondary)
    - --pakistan-green: #104911ff
- Brand usage rules:
  - Use the brand color (#f9a620ff) sparingly
  - Reserve the brand color primarily for the most important CTAs or as a subtle thin border for highlights when not a main CTA

## Summary

Task Bee streamlines task tracking for companies with a clear, role-aware experience. Users can collaborate on tasks, enrich them with markdown detail, and maintain clean dashboards by completing and archiving items. Admins manage their accounts and memberships, while a thoughtful, minimal visual style ensures focus and clarity.