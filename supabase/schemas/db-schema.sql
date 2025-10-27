-- Enable pgcrypto for gen_random_uuid
create extension if not exists pgcrypto with schema public;

-- Role types for users within an account
create type public.user_role as enum (
    'guest',
    'default',
    'manager',
    'admin'
);

-- Task status states
create type public.task_status as enum (
    'active',
    'completed',
    'archived'
);

-- A user
create table public."user" (
    -- Unique id of the user
    id uuid not null default gen_random_uuid(),

    -- Date and time the user was created
    created_at timestamptz not null default now(),

    -- Date and time the user was last updated
    updated_at timestamptz not null default now(),

    -- Full name of the user
    name text not null,

    -- Email address of the user (unique)
    email text not null,

    -- Path to the user's profile image in the 'accounts' storage bucket: {account_id}/users/{user_id}/...
    profile_image_path text,

    -- Path to the user's hero image in the 'accounts' storage bucket: {account_id}/users/{user_id}/...
    hero_image_path text,

    constraint user_pkey primary key (id),
    constraint user_email_unique unique (email)
);

-- An account/organization (tenant)
create table public.account (
    -- Unique id of the account
    id uuid not null default gen_random_uuid(),

    -- Date and time the account was created
    created_at timestamptz not null default now(),

    -- Date and time the account was last updated
    updated_at timestamptz not null default now(),

    -- Display name of the account
    name text not null,

    -- Path to the account logo image in the 'accounts' storage bucket
    logo_image_path text,

    -- Path to the account hero image in the 'accounts' storage bucket
    hero_image_path text,

    constraint account_pkey primary key (id)
);

-- Links a user to an account with a role
create table public.account_membership (
    -- Unique id of the account membership
    id uuid not null default gen_random_uuid(),

    -- Date and time the membership was created
    created_at timestamptz not null default now(),

    -- Date and time the member last accessed the account
    last_accessed_at timestamptz not null default now(),

    -- The user this membership belongs to
    user_id uuid not null,

    -- The account this membership belongs to
    account_id uuid not null,

    -- The role of the user within the account
    role public.user_role not null default 'default',

    constraint account_membership_pkey primary key (id),
    constraint account_membership_user_fk foreign key (user_id) references public."user"(id) on delete cascade,
    constraint account_membership_account_fk foreign key (account_id) references public.account(id) on delete cascade,
    constraint account_membership_user_account_unique unique (user_id, account_id)
);

-- A task belonging to an account
create table public.task (
    -- Unique id of the task
    id uuid not null default gen_random_uuid(),

    -- Date and time the task was created
    created_at timestamptz not null default now(),

    -- Date and time the task was last updated
    updated_at timestamptz not null default now(),

    -- The account this task belongs to
    account_id uuid not null,

    -- The user who created the task
    created_by_user_id uuid,

    -- The user who last updated the task
    updated_by_user_id uuid,

    -- The title of the task
    title text not null,

    -- Current status of the task
    status public.task_status not null default 'active',

    -- Detailed description of the task in markdown
    description_markdown text not null default '',

    -- Timestamp when the task was marked as completed
    completed_at timestamptz,

    -- Timestamp when the task was archived
    archived_at timestamptz,

    constraint task_pkey primary key (id),
    constraint task_account_fk foreign key (account_id) references public.account(id) on delete cascade,
    constraint task_created_by_user_fk foreign key (created_by_user_id) references public."user"(id) on delete set null,
    constraint task_updated_by_user_fk foreign key (updated_by_user_id) references public."user"(id) on delete set null
);

-- An invitation to join an account via invite link
create table public.account_invite (
    -- Unique id of the account invite
    id uuid not null default gen_random_uuid(),

    -- Date and time the invite was created
    created_at timestamptz not null default now(),

    -- The account this invite grants access to
    account_id uuid not null,

    -- The user who created/sent the invite
    invited_by_user_id uuid,

    -- The invite code to be used in the accept link
    code text not null,

    -- Optional email the invite was intended for
    email text,

    -- The role the invite grants upon acceptance
    role public.user_role not null default 'default',

    -- When the invite expires (if set)
    expires_at timestamptz,

    -- When the invite was accepted
    accepted_at timestamptz,

    -- The user who accepted the invite
    accepted_by_user_id uuid,

    -- When the invite was revoked (if revoked)
    revoked_at timestamptz,

    constraint account_invite_pkey primary key (id),
    constraint account_invite_account_fk foreign key (account_id) references public.account(id) on delete cascade,
    constraint account_invite_invited_by_user_fk foreign key (invited_by_user_id) references public."user"(id) on delete set null,
    constraint account_invite_accepted_by_user_fk foreign key (accepted_by_user_id) references public."user"(id) on delete set null,
    constraint account_invite_code_unique unique (code)
);

-- Indexes

-- Quick lookup of memberships by user
create index account_membership_user_idx on public.account_membership (user_id);

-- Quick lookup of memberships by account
create index account_membership_account_idx on public.account_membership (account_id);

-- Quick lookup of tasks by account
create index task_account_idx on public.task (account_id);

-- Filter tasks by status efficiently
create index task_status_idx on public.task (status);

-- Task creator lookup
create index task_created_by_user_idx on public.task (created_by_user_id);

-- Task updater lookup
create index task_updated_by_user_idx on public.task (updated_by_user_id);

-- Invite lookup by account
create index account_invite_account_idx on public.account_invite (account_id);

-- Email lookup for users
create index user_email_idx on public."user" (email);