const base = import.meta.env.VITE_SHADOW_SUPABASE_URL;
const key = import.meta.env.VITE_SHADOW_SUPABASE_PUBLISHABLE_KEY;
async function rpc(token,name,payload){
 if(!token||!base||!key) throw new Error("Sign in to Shadow City first.");
 const response=await fetch(base+"/rest/v1/rpc/"+name,{method:"POST",headers:{"Content-Type":"application/json",apikey:key,Authorization:"Bearer "+token},body:JSON.stringify(payload)});
 const result=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(result.message||"Action failed");
 return result;
}
export const trainOnline=(token,unit,quantity)=>rpc(token,"ss_train",{p_kind:unit,p_count:quantity});
export const healOnline=(token,unit,quantity)=>rpc(token,"ss_heal",{p_kind:unit,p_count:quantity});
export const raidOnline=(token,target,army,requestId)=>rpc(token,"ss_raid",{
 p_target:target,p_runners:army.runners||0,p_enforcers:army.enforcers||0,p_specialists:army.specialists||0,p_request:requestId
});
