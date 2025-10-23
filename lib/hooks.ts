import { useIncrementSubject, useSubject } from "@iyio/react-common";
import { useEffect, useState } from "react";
import { app } from "./app";
import { fileStore } from "./fileStore";
import { Account, TypeDef, User, UserRole } from "./schema";
import { store } from "./store";
import { fullPageSubject, headerHeightSubject, noMarginsSubject } from "./subjects";
import { SelectOptions, UserInfo } from "./types-util";

export interface UseStoreItemOptions
{
    /**
     * If true useStoreItem will return undefined
     */
    disabled?:boolean;

    /**
     * If true the value will be reset to null when disabled. By default the last loaded
     * value will be returned when disabled.
     */
    resetOnDisabled?:boolean;

    /**
     * If true the value will be reset to null when table or id changes. By default the last loaded
     * value will be returned until the new value is loaded.
     */
    resetOnChange?:boolean;
}

export type UseStoreItemsOptions = UseStoreItemOptions & SelectOptions;

/**
 * Returns an item by id from a given table. Any updates made to the item elsewhere in the app
 * will cause useStoreItem to return the new value.
 *
 * Undefined is returned if the value does not exist in the table and null is returned while
 * the item is being loaded.
 *
 * @param table Name of table to get item from. If null or undefined useStoreItem will return undefined
 * @param id Id of item to get from table. If null or undefined useStoreItem will return undefined
 * @param options Additional options
 */
export const useStoreItem=<T extends Record<string,any>=Record<string,any>>(
    table:TypeDef<T,any>|string|null|undefined,
    id:string|null|undefined,
    options?:UseStoreItemOptions
):T|null|undefined=>{
    
    const tableName=(typeof table === 'string')?table:table?.sqlTable;
    const disabled=options?.disabled || table===null || table===undefined || id===null || id===undefined || !tableName;
    const resetOnDisabled=options?.resetOnDisabled;
    const resetOnChange=options?.resetOnChange;

    const [value,setValue]=useState<T|null|undefined>(null);

    useEffect(()=>{
        if(disabled){
            if(resetOnDisabled){
                setValue(null);
            }
            return;
        }
        if(resetOnChange){
            setValue(null);
        }
        let m=true;
        store().selectFirstAsync(tableName,id).then(value=>{
            if(m){
                setValue(value as T);
            }
        });
        const sub=store().onSetItem.subscribe(e=>{
            if(e.table===tableName && e.id===id && m){
                setValue(e.value as T);
            }
        });
        return ()=>{
            m=false;
            sub.unsubscribe();
        }
    },[tableName,id,disabled,resetOnDisabled,resetOnChange]);

    return value;
}

/**
 * Returns all matching items
 *
 * null is returned while the items are loading.
 *
 * @param table Name of table to get item from. If null or undefined useStoreItem will return undefined
 * @param id Id of item to get from table. If null or undefined useStoreItem will return undefined
 * @param options Additional options
 */
export const useStoreMatchingItems=<T extends Record<string,any>=Record<string,any>>(
    table:TypeDef<T,any>|string|null|undefined,
    match:Partial<T>|null|undefined,
    options?:UseStoreItemsOptions
):T[]|null=>{
    
    const tableName=(typeof table === 'string')?table:table?.sqlTable;
    const disabled=options?.disabled || table===null || table===undefined || match===null || match===undefined || !tableName;
    const resetOnDisabled=options?.resetOnDisabled;
    const resetOnChange=options?.resetOnChange;
    const limit=options?.limit;
    const matchJson=match?JSON.stringify(match):undefined;
    const optionsJson=match?JSON.stringify(options):undefined;
    const [reload,setReload]=useState(0);

    const [value,setValue]=useState<T[]|null>(null);

    useEffect(()=>{
        if(disabled || !matchJson){
            if(resetOnDisabled){
                setValue(null);
            }
            return;
        }
        if(resetOnChange){
            setValue(null);
        }
        let m=true;
        const match=JSON.parse(matchJson);
        const options=optionsJson?JSON.parse(optionsJson):undefined;
        store().selectMatchesAsync(tableName,match,options).then(value=>{
            if(m){
                setValue(value as T[]);
            }
        });
        const sub=store().onSetItem.subscribe(e=>{
            if(e.table===tableName && m){
                setReload(v=>v+1);
            }
        });
        return ()=>{
            m=false;
            sub.unsubscribe();
        }
    },[tableName,matchJson,disabled,resetOnDisabled,resetOnChange,reload,limit,optionsJson]);

    return value;
}


/**
 * Returns all matching items
 *
 * Undefined is returned if the value does not exist in the table and null is returned while
 * the item is being loaded.
 *
 * @param table Name of table to get item from. If null or undefined useStoreItem will return undefined
 * @param id Id of item to get from table. If null or undefined useStoreItem will return undefined
 * @param options Additional options
 */
export const useStoreFirstMatchingItem=<T extends Record<string,any>=Record<string,any>>(
    table:TypeDef<T,any>|string|null|undefined,
    match:Partial<T>|null|undefined,
    options?:UseStoreItemsOptions
):T|null|undefined=>{
    const matches=useStoreMatchingItems(table,match,{limit:1});
    return matches===null?null:matches?.[0];
}

/**
 * Hides common UI controls such as the main nav bar.
 * @param enabled If false the hook is disabled
 */
export const useFullPage=(enabled=true)=>{
    useIncrementSubject(fullPageSubject,enabled);
}
/**
 * Removes all margins and paddings from the main layout while keeping the main navigation and
 * other shared UI elements
 * @param enabled If false the hook is disabled
 */
export const useNoMargins=(enabled=true)=>{
    useIncrementSubject(noMarginsSubject,enabled);
}

/**
 * Returns true if the page should be displayed in full screen
 */
export const useIsInFullPageMode=():boolean=>{
    const count=useSubject(fullPageSubject);
    return count>0;
}

/**
 * Returns true if the page should remove all margins
 */
export const useIsNoMarginMode=():boolean=>{
    const count=useSubject(noMarginsSubject);
    return count>0;
}

/**
 * Returns the current signed-in user.
 * null === user is being loaded
 * undefined === user is not signed in
 */
export const useCurrentUser=():User|null|undefined=>{
    const r=useSubject(app().userInfoSubject);
    return r===null?null:r?.user;
}

/**
 * Returns the current account the user is signed into.
 * null === account is being loaded
 * undefined === No account found for user
 */
export const useAccount=():Account|null|undefined=>{
    const r=useSubject(app().userInfoSubject);
    return r===null?null:r?.account;
}

/**
 * Returns the role of the user in the current account.
 * null === role is being loaded
 * undefined === No role found for user
 */
export const useUserRole=():UserRole|null|undefined=>{
    const r=useSubject(app().userInfoSubject);
    return r===null?null:r?.role;
}

/**
 * Returns the information about the current user, including a user object, account object
 * and the role the user has for the account.
 * null === user info is being loaded
 * undefined === user is not signed in
 */
export const useUserInfo=():UserInfo|null|undefined=>{
    return useSubject(app().userInfoSubject);
}

export const useHeaderHeight=():number=>{
    return useSubject(headerHeightSubject);
}

/**
 * Gets the full URL to a given path
 * Return values:
 * null: URL info is being loaded
 * undefined: URL not available
 * {string}: The full URL of the path
 * @param path The path to get a URL for. If null or undefined then undefined is returned.
 */
export const useFileUrl=(path:string|null|undefined):string|null|undefined=>{

    const [url,setUrl]=useState<string|null|undefined>(path?(fileStore().getCachedUrl(path)??null):undefined);

    useEffect(()=>{
        if(!path){
            setUrl(undefined);
            return;
        }
        setUrl(null);
        let m=true;
        fileStore().getUrlAsync(path).then(url=>{
            if(m){
                setUrl(url);
            }
        })
        return ()=>{
            m=false;
        }

    },[path]);

    return url;
}