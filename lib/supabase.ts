import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if(!supabaseUrl){
    console.error('NEXT_PUBLIC_SUPABASE_URL env variable not set');
}
if(!supabaseKey){
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY env variable not set');
}

let _client:SupabaseClient;

export const supClient=()=>{
    if(!supabaseUrl){
        throw new Error('NEXT_PUBLIC_SUPABASE_URL env variable not set');
    }
    if(!supabaseKey){
        throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY env variable not set');
    }
    return _client??(_client=createClient(supabaseUrl,supabaseKey));
}