import { convoCompletionService, convoRagService, HttpConvoCompletionService } from "@convo-lang/convo-lang";
import { initRootScope, isServerSide, ScopeModulePriorities, ScopeRegistration } from "@iyio/common";
import { app } from "./app";

let inited=false;
export const initFrontend=()=>{
    if(inited){
        return;
    }
    inited=true;
    initRootScope(frontendModule);
}

export const frontendModule=(reg:ScopeRegistration)=>{

    if(isServerSide){
        return;
    }
    
    reg.implementService(convoCompletionService,scope=>HttpConvoCompletionService.fromScope(scope,'https://api.convo-lang.ai'));
    reg.implementService(convoRagService,scope=>HttpConvoCompletionService.fromScope(scope,'https://api.convo-lang.ai'));

    reg.use({
        priority:ScopeModulePriorities.config,
        init:async ()=>{
            await app().initAsync();
        }
    })

}

