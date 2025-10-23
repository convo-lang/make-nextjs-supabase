import { Account, AccountMembership, User, UserRole } from "./schema";

export interface UserInfo
{
    user:User;
    role?:UserRole;
    membership?:AccountMembership;
    account?:Account;
}

/**
 * Options used with select queries
 */
export interface SelectOptions
{
    offset?:number;
    limit?:number;
    orderBy?:string;
    /**
     * If true return items will be ordered in descending order
     */
    orderByDesc?:boolean;
}