import { ReadonlySubject } from "@iyio/common/src/lib/rxjs-types";
import { User as SupUser } from "@supabase/supabase-js";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Account, Account_insert, AccountMembership, AccountMembership_insert, User, User_insert } from "./schema";
import { supClient } from "./supabase";
import { UserInfo } from "./types-util";


let _app:AppCtrl|null=null;
export const app=():AppCtrl=>{
    return _app??(_app=new AppCtrl());
}

export class AppCtrl
{

    private readonly _userInfo:BehaviorSubject<UserInfo|null|undefined>=new BehaviorSubject<UserInfo|null|undefined>(null);
    public get userInfoSubject():ReadonlySubject<UserInfo|null|undefined>{return this._userInfo}
    public get userInfo(){return this._userInfo.value}

    private _updateId=0;

    public async initAsync()
    {
        await new Promise<void>(resolve=>{
            supClient().auth.onAuthStateChange(async (e,s)=>{
                console.log('Supabase session update',e,s?.user);
                const uid=++this._updateId;
                setTimeout(async ()=>{
                    if(uid!==this._updateId){
                        return;
                    }
                    try{
                        if(s?.user){
                            this._userInfo.next(null);
                            const r=await this.supUserToUserAsync(s.user);
                            if(uid===this._updateId){
                                this._userInfo.next(r);
                                // do not await 
                                this.setLastMembershipAccessAsync();
                            }
                        }else{
                            this._userInfo.next(undefined);
                        }
                    }finally{
                        resolve();
                    }
                },50);
            })
        });
    }

    public async switchAccountAsync(accountId:string):Promise<UserInfo|undefined>
    {
        const info=this.userInfo;
        if(!info){
            return undefined;
        }
        const uid=++this._updateId;

        const membership=await supClient().from('account_membership').select('id').match({
            user_id:info.user.id,
            account_id:accountId
        }).single<{id:string}>();

        if(!membership.data){
            return undefined;
        }

        await this.setLastMembershipAccessAsync(membership.data.id);
        const supUser=await supClient().auth.getUser();
        if(!supUser?.data?.user){
            return;
        }
        const updatedInfo=await this.supUserToUserAsync(supUser.data.user);
        if(uid===this._updateId){
            this._userInfo.next(updatedInfo);
        }
    }

    private async supUserToUserAsync(supUser:SupUser):Promise<UserInfo|null>{
        const userResult=await supClient().from('user').select('*').eq('id',supUser.id).single<User>();
        const user=userResult.data??await this.createUserAsync(supUser);
        if(!user){
            return null;
        }
        const membership=(
            (await supClient()
                .from('account_membership')
                .select('*')
                .eq('user_id',user.id)
                .order('last_accessed_at',{ascending:false})
                .limit(1)
                .single<AccountMembership>()
            )?.data
            ??
            await this.createAccountWithMembershipAsync(supUser)
        )
        
        const accountResult=(membership?
            await supClient().from('account').select('*').eq('id',membership.account_id).single<Account>()
        :
            undefined
        );
        return {
            user,
            role:membership?.role,
            membership:membership??undefined,
            account:accountResult?.data??undefined,
        }
    }

    private async createUserAsync(supUser:SupUser):Promise<User|undefined>{
        if(!supUser.email){
            return undefined;
        }
        const insert:User_insert={
            id:supUser.id,
            name:supUser.user_metadata?.['name']||supUser.email.split('@')[0]||'New User',
            email:supUser.email,
            created_at:new Date().toISOString(),
            
        }
        const r=await supClient().from('user').upsert(insert).select('*').single<User>();
        return r.data??undefined;
    }

    private async createAccountWithMembershipAsync(supUser:SupUser):Promise<AccountMembership|undefined>
    {
        const account=await this.createAccountForUserAsync(supUser);
        if(!account){
            return undefined;
        }

        const now=new Date().toISOString();
        const insert:AccountMembership_insert={
            account_id:account.id,
            user_id:supUser.id,
            last_accessed_at:now,
            created_at:now,
            role:'admin'
        };

        const r=await supClient().from('account_membership').insert(insert).select('*').single<AccountMembership>();
        return r.data??undefined;
    }

    private async createAccountForUserAsync(supUser:SupUser):Promise<Account|undefined>{
        if(!supUser.email){
            return undefined;
        }
        const insert:Account_insert={
            id:supUser.id,
            name:supUser.user_metadata?.['accountName']||supUser.email.split('@')[0]||'New Account',
            created_at:new Date().toISOString(),
        }
        const r=await supClient().from('account').upsert(insert).select('*').single<Account>();
        return r.data??undefined;
    }

    private async setLastMembershipAccessAsync(membershipId?:string){
        if(!membershipId){
            membershipId=this.userInfo?.membership?.id;
        }
        if(!membershipId){
            return false;
        }
        const update:Partial<AccountMembership>={
            last_accessed_at:new Date().toISOString(),
        }
        await supClient().from('account_membership').update(update).eq('id',membershipId);
        return true;
    }
}