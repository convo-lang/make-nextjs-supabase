import { delayAsync } from "@iyio/common";
import { supClient } from "./supabase";

let _store:FileStore|undefined;
export const fileStore=():FileStore=>{
    return _store??(_store=new FileStore());
}

export class FileStore
{

    private _urls:Record<string,string>={}

    /**
     * Gets the full URL for a given path. When needed signed URLs will be created. The result of the
     * function will be cached and future calls for the same path will returned immediately
     */
    public async getUrlAsync(path:string):Promise<string|undefined>{
        const loaded=this._urls[path];
        if(loaded){
            return loaded;
        }
        // todo - create signed URL if needed
        await delayAsync(1);
        const url=supClient().storage.from('accounts').getPublicUrl(path).data.publicUrl;

        this._urls[path]=url;
        return url;
    }

    /**
     * Attempts to get the cached URL for the path. If a URL has not been cached for the path
     * undefined will be returned.
     */
    public getCachedUrl(path:string):string|undefined{
        return this._urls[path];
    }
}