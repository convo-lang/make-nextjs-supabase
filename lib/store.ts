import { Observable, Subject } from "rxjs";
import { TypeDef } from "./schema";
import { supClient } from "./supabase";
import { SelectOptions } from "./types-util";
import { getTableName } from "./util";

let _store:Store|undefined;
export const store=()=>{
    return _store??(_store=new Store());
}

export type ItemChangeEventType='set'|'delete';


export interface ItemChangeEvent
{
    type:ItemChangeEventType;
    table:string;
    id:string;
    value:Record<string,any>|undefined;
    prevValue:Record<string,any>|undefined;
}

export class Store
{

    private loaded=false;

    private readonly _onSetItem=new Subject<ItemChangeEvent>();
    public get onSetItem():Observable<ItemChangeEvent>{return this._onSetItem}

    private load()
    {
        // do nothing for now
        this.loaded=true;
    }

    /**
     * Gets an item from a table by table name and id. Undefined is returned if no item exists
     * in the table with the given id.
     * @param table Name of table to get item from
     * @param id Id of item to get
     */
    public async selectFirstAsync<T extends Record<string,any>>(table:string|TypeDef<T,any>,id:string):Promise<T|undefined>{
        if(!this.loaded){
            this.load();
        }
        const r=await supClient().from(getTableName(table)).select('*').eq('id',id).single();
        return r.data||undefined;
    }

    /**
     * Selects all matching items from the given table
     * @param table Name of table to select from
     * @param match An object with properties to match against
     * @param options Options used to control selection
     */
    public async selectMatchesAsync<T extends Record<string,any>>(table:string|TypeDef<T,any>,match:Partial<T>,options?:SelectOptions):Promise<Record<string,any>[]>{
        if(!this.loaded){
            this.load();
        }
        
        const limit=options?.limit??1000;
        const offset=options?.offset??0;

        let query=supClient().from(getTableName(table)).select('*').match(match).range(offset,offset+limit-1);
        if(options?.orderBy!==undefined){
            query=query.order(options.orderBy,{ascending:!options.orderByDesc});
        }
        const r=await query;

        return r.data??[];
    }

    /**
     * Selects the first matching item form the given table
     * @param table Table to select from
     * @param match An object with properties to match against
     */
    public async selectFirstMatchesAsync<T extends Record<string,any>>(table:string|TypeDef<T>,match:Partial<T>):Promise<Record<string,any>|undefined>{
        if(!this.loaded){
            this.load();
        }
        
        const ary=await this.selectMatchesAsync<T>(table,match,{limit:1});
        return ary[0];
    }
    
    /**
     * Updates an item value in a table by id.
     * @param table Name of table to set the item in.
     * @param id Id of the item to set
     * @param value Value of the item to set
     * @returns The value passed to the setItem function
     */
    public async updateAsync<T extends Record<string,any>>(table:string|TypeDef<T,any>,id:string,value:Partial<T>):Promise<T>{
        if(!this.loaded){
            this.load();
        }

        const prevValue={...value}
        
        const r=await supClient().from(getTableName(table)).update(value).eq('id',id).select('*').single();
        if(!r.data){
            console.error('Update item failed.',{id,value});
            throw new Error('Unable to update item');
        }
        
        this._onSetItem.next({
            type:'set',
            table:getTableName(table),
            id,
            value:r.data,
            prevValue,
        });

        return r.data;
    }
    
    /**
     * Updates an item value in a table by id.
     * @param table Name of table to set the item in.
     * @param id Id of the item to set
     * @param value Value of the item to set
     * @returns The value passed to the setItem function
     */
    public async insertAsync<T extends Record<string,any>>(table:string|TypeDef<any,T>,value:T):Promise<T>{
        if(!this.loaded){
            this.load();
        }

        const prevValue={...value}
        
        const r=await supClient().from(getTableName(table)).insert(value).select('*').single();
        if(!r.data){
            console.error('Insert item failed.',{value});
            throw new Error('Unable to insert item');
        }
        
        this._onSetItem.next({
            type:'set',
            table:getTableName(table),
            id:r.data?.['id'],
            value:r.data,
            prevValue,
        });

        return r.data;
    }
    
    /**
     * Deletes an item from a table
     * @param table The name of the table to delete the item from
     * @param id The Id of the item to delete
     * @returns The value of the item before being delete or undefined
     */
    public async deleteAsync<T extends Record<string,any>>(table:string|TypeDef<T,any>,id:string):Promise<T|undefined>{
        if(!this.loaded){
            this.load();
        }
        
        const r=await supClient().from(getTableName(table)).delete().eq('id',id).select('*').single();

        this._onSetItem.next({
            type:'delete',
            table:getTableName(table),
            id,
            value:undefined,
            prevValue:r.data,
        });
        return r.data;
    }
}

