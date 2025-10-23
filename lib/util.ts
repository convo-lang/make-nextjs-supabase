import { cn as ioCn } from "@iyio/common";
import { TypeDef } from "./schema";

export const cn=ioCn;

export const getTableName=(table:string|TypeDef<any,any>):string=>{
    return (typeof table === 'string')?table:(table.sqlTable??table.name);
}