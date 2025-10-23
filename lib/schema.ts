// The following types are placeholder types.

import { ZodType } from "zod";

export interface TypeMapping
{
    name:string;
    ts?:string;
    zod?:string;
    convo?:string;
    sql?:string;
}

export interface PropDef
{
    name:string;
    type:TypeMapping;
    primary?:boolean;
    description?:string;
    sqlDef?:string;
    optional?:boolean;
    hasDefault?:boolean;
    isArray?:boolean;
    arrayDimensions?:number;
}

export interface TypeDef<
    TValue extends Record<string,any>=Record<string,any>,
    TInsert extends Record<string,any>=Record<string,any>
>{


    name:string;
    description?:string;
    type:'type'|'enum';
    primaryKey:(keyof TValue) & (keyof TInsert);
    sqlTable?:string;
    sqlSchema?:string;
    zodSchema?:ZodType;
    zodInsertSchema?:ZodType;
    props:PropDef[];
}

export interface User
{
    id:string;
    created_at:string;
    name:string;
    email:string;
}
export interface User_insert extends Omit<User,'id'>
{
    id?:string;
}

export interface Account
{
    id:string;
    created_at:string;
    name:string;
}
export interface Account_insert extends Omit<Account,'id'>
{
    id?:string;
}

export type UserRole='admin'|'guest';

export interface AccountMembership
{
    id:string;
    created_at:string;
    last_accessed_at:string;
    user_id:string;
    account_id:string;
    role:UserRole;
}
export interface AccountMembership_insert extends Omit<AccountMembership,'id'>
{
    id?:string;
}