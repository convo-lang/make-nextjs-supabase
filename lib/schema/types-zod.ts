import { z } from "zod";

/**
 * Task status states
 * Zod schema for the "TaskStatus" union
 */
export const TaskStatusSchema=z.enum(["active","completed","archived"]).describe("Task status states");

/**
 * Role types for users within an account
 * Zod schema for the "UserRole" union
 */
export const UserRoleSchema=z.enum(["guest","default","manager","admin"]).describe("Role types for users within an account");

/**
 * Zod schema for the "Account" interface
 * @table account
 * @schema public
 */
export const AccountSchema=z.object({
    id:z.string().describe("Unique id of the account"),
    created_at:z.string().describe("Date and time the account was created"),
    updated_at:z.string().describe("Date and time the account was last updated"),
    name:z.string().describe("Display name of the account"),
    logo_image_path:z.string().optional().describe("Path to the account logo image in the 'accounts' storage bucket"),
    hero_image_path:z.string().optional().describe("Path to the account hero image in the 'accounts' storage bucket"),
}).describe("An account/organization (tenant)");

/**
 * Zod schema for the "Account_insert" interface
 * @insertFor Account
 * @table account
 * @schema public
 */
export const Account_insertSchema=z.object({
    id:z.string().optional(),
    created_at:z.string().optional(),
    updated_at:z.string().optional(),
    name:z.string(),
    logo_image_path:z.string().optional(),
    hero_image_path:z.string().optional(),
});

/**
 * Zod schema for the "AccountInvite" interface
 * @table account_invite
 * @schema public
 */
export const AccountInviteSchema=z.object({
    id:z.string().describe("Unique id of the account invite"),
    created_at:z.string().describe("Date and time the invite was created"),
    account_id:z.string().describe("The account this invite grants access to"),
    invited_by_user_id:z.string().optional().describe("The user who created/sent the invite"),
    code:z.string().describe("The invite code to be used in the accept link"),
    email:z.string().optional().describe("Optional email the invite was intended for"),
    role:z.string().describe("The role the invite grants upon acceptance"),
    expires_at:z.string().optional().describe("When the invite expires (if set)"),
    accepted_at:z.string().optional().describe("When the invite was accepted"),
    accepted_by_user_id:z.string().optional().describe("The user who accepted the invite"),
    revoked_at:z.string().optional().describe("When the invite was revoked (if revoked)"),
}).describe("An invitation to join an account via invite link");

/**
 * Zod schema for the "AccountInvite_insert" interface
 * @insertFor AccountInvite
 * @table account_invite
 * @schema public
 */
export const AccountInvite_insertSchema=z.object({
    id:z.string().optional(),
    created_at:z.string().optional(),
    account_id:z.string(),
    invited_by_user_id:z.string().optional(),
    code:z.string(),
    email:z.string().optional(),
    role:z.string().optional(),
    expires_at:z.string().optional(),
    accepted_at:z.string().optional(),
    accepted_by_user_id:z.string().optional(),
    revoked_at:z.string().optional(),
});

/**
 * Zod schema for the "AccountMembership" interface
 * @table account_membership
 * @schema public
 */
export const AccountMembershipSchema=z.object({
    id:z.string().describe("Unique id of the account membership"),
    created_at:z.string().describe("Date and time the membership was created"),
    last_accessed_at:z.string().describe("Date and time the member last accessed the account"),
    user_id:z.string().describe("The user this membership belongs to"),
    account_id:z.string().describe("The account this membership belongs to"),
    role:z.string().describe("The role of the user within the account"),
}).describe("Links a user to an account with a role");

/**
 * Zod schema for the "AccountMembership_insert" interface
 * @insertFor AccountMembership
 * @table account_membership
 * @schema public
 */
export const AccountMembership_insertSchema=z.object({
    id:z.string().optional(),
    created_at:z.string().optional(),
    last_accessed_at:z.string().optional(),
    user_id:z.string(),
    account_id:z.string(),
    role:z.string().optional(),
});

/**
 * Zod schema for the "Task" interface
 * @table task
 * @schema public
 */
export const TaskSchema=z.object({
    id:z.string().describe("Unique id of the task"),
    created_at:z.string().describe("Date and time the task was created"),
    updated_at:z.string().describe("Date and time the task was last updated"),
    account_id:z.string().describe("The account this task belongs to"),
    created_by_user_id:z.string().optional().describe("The user who created the task"),
    updated_by_user_id:z.string().optional().describe("The user who last updated the task"),
    title:z.string().describe("The title of the task"),
    status:z.string().describe("Current status of the task"),
    description_markdown:z.string().describe("Detailed description of the task in markdown"),
    completed_at:z.string().optional().describe("Timestamp when the task was marked as completed"),
    archived_at:z.string().optional().describe("Timestamp when the task was archived"),
}).describe("A task belonging to an account");

/**
 * Zod schema for the "Task_insert" interface
 * @insertFor Task
 * @table task
 * @schema public
 */
export const Task_insertSchema=z.object({
    id:z.string().optional(),
    created_at:z.string().optional(),
    updated_at:z.string().optional(),
    account_id:z.string(),
    created_by_user_id:z.string().optional(),
    updated_by_user_id:z.string().optional(),
    title:z.string(),
    status:z.string().optional(),
    description_markdown:z.string().optional(),
    completed_at:z.string().optional(),
    archived_at:z.string().optional(),
});

/**
 * Zod schema for the "User" interface
 * @table user
 * @schema public
 */
export const UserSchema=z.object({
    id:z.string().describe("Unique id of the user"),
    created_at:z.string().describe("Date and time the user was created"),
    updated_at:z.string().describe("Date and time the user was last updated"),
    name:z.string().describe("Full name of the user"),
    email:z.string().describe("Email address of the user (unique)"),
    profile_image_path:z.string().optional().describe("Path to the user's profile image in the 'accounts' storage bucket: {account_id}/users/{user_id}/..."),
    hero_image_path:z.string().optional().describe("Path to the user's hero image in the 'accounts' storage bucket: {account_id}/users/{user_id}/..."),
}).describe("A user");

/**
 * Zod schema for the "User_insert" interface
 * @insertFor User
 * @table user
 * @schema public
 */
export const User_insertSchema=z.object({
    id:z.string().optional(),
    created_at:z.string().optional(),
    updated_at:z.string().optional(),
    name:z.string(),
    email:z.string(),
    profile_image_path:z.string().optional(),
    hero_image_path:z.string().optional(),
});