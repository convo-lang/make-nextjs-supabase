import { delayAsync } from "@iyio/common";
import { Observable, Subject } from "rxjs";

let _store:LocalStore|undefined;
export const localStore=()=>{
    return _store??(_store=new LocalStore());
}

export type ItemChangeEventType='set'|'delete';

export type ItemRecord=Record<string,any>;

export interface ItemChangeEvent
{
    type:ItemChangeEventType;
    table:string;
    id:string;
    value:ItemRecord|undefined;
    prevValue:ItemRecord|undefined;
}

export class LocalStore
{
    private readonly keyBase='convo-make-app::';

    private readonly data:Record<string,ItemRecord>={};

    private loaded=false;

    private readonly _onSetItem=new Subject<ItemChangeEvent>();
    public get onSetItem():Observable<ItemChangeEvent>{return this._onSetItem}

    private load()
    {
        if(!globalThis.localStorage){
            return;
        }
        for(let i=0;i<globalThis.localStorage.length;i++){
            const key=globalThis.localStorage.key(i);
            if(!key?.startsWith(this.keyBase)){
                continue;
            }
            try{
                this.data[key]=JSON.parse(globalThis.localStorage.getItem(key)??'null');
            }catch(ex){
                console.error(`Unable to load store item[${key}]`,ex);
            }
        }
        this.loaded=true;
    }

    public async clearAsync(){
        await delayAsync(1);
        for(const e in this.data){
            delete this.data[e];
        }
        if(!globalThis.localStorage){
            return;
        }
        const keys:string[]=[];
        for(let i=0;i<globalThis.localStorage.length;i++){
            const key=globalThis.localStorage.key(i);
            if(!key?.startsWith(this.keyBase)){
                continue;
            }
            keys.push(key);
        }
        for(const key of keys){
            globalThis.localStorage.removeItem(key);
        }
    }

    public getItemKey(table:string,id:string){
        return `${this.keyBase}::${table}::${id}`;
    }
    public getTableKey(table:string){
        return `${this.keyBase}::${table}::`;
    }

    /**
     * Gets an item from a table by table name and id. Undefined is returned if no item exists
     * in the table with the given id.
     * @param table Name of table to get item from
     * @param id Id of item to get
     */
    public async getItemAsync(table:string,id:string):Promise<ItemRecord|undefined>{
        if(!this.loaded){
            this.load();
        }
        await delayAsync(1);
        return this.data[this.getItemKey(table,id)];
    }
    
    /**
     * Sets an item value in a table by id. If value is undefined the item is delete from the table.
     * @param table Name of table to set the item in.
     * @param id Id of the item to set
     * @param value Value of the item to set
     * @returns The value passed to the setItem function
     */
    public async setItemAsync<T extends ItemRecord|undefined>(table:string,id:string,value:T):Promise<T>{
        if(!this.loaded){
            this.load();
        }
        if(!value || (typeof value !== 'object')){
            this.deleteItemAsync(table,id);
            return undefined as T;
        }

        
        await delayAsync(1);
        const key=this.getItemKey(table,id);
        const prevValue=this.data[key];
        this.data[key]=value;
        globalThis.localStorage?.setItem(key,JSON.stringify(value));
        this._onSetItem.next({
            type:'set',
            table,
            id,
            value,
            prevValue,
        });
        return value;
    }
    
    /**
     * Deletes an item from a table
     * @param table The name of the table to delete the item from
     * @param id The Id of the item to delete
     * @returns The value of the item before being delete or undefined
     */
    public async deleteItemAsync(table:string,id:string):Promise<ItemRecord|undefined>{
        if(!this.loaded){
            this.load();
        }
        await delayAsync(1);
        const key=this.getItemKey(table,id);
        const prevValue=this.data[key];
        delete this.data[key];
        globalThis.localStorage?.removeItem(key);

        this._onSetItem.next({
            type:'delete',
            table,
            id,
            value:undefined,
            prevValue,
        });
        return prevValue;
    }

    /**
     * Selects all items from the given table
     * @param table Name of table to select from
     * @param filter An optional callback function that can be used to filter returned items
     */
    public async selectAsync(table:string,filter?:(item:ItemRecord,id:string)=>boolean):Promise<ItemRecord[]>{
        if(!this.loaded){
            this.load();
        }
        await delayAsync(1);
        const items:any[]=[];
        const tableKey=this.getTableKey(table);
        for(const e in this.data){
            if(!e.startsWith(tableKey)){
                continue;
            }
            const item=this.data[e];
            if(filter){
                try{
                    const r=filter(item,e.substring(tableKey.length));
                    if(r===false){
                        continue;
                    }
                }catch(ex){
                    console.error('select filter error',ex);
                    continue;
                }
            }
            items.push(item);
        }
        return items;
    }
}