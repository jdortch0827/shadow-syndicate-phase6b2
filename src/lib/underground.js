const base=import.meta.env.VITE_SHADOW_SUPABASE_URL;
const key=import.meta.env.VITE_SHADOW_SUPABASE_PUBLISHABLE_KEY;
async function api(token,path,body){
 if(!base||!key||!token)throw new Error("Sign in to Shadow City.");
 const response=await fetch(base+"/rest/v1/"+path,{method:body?"POST":"GET",headers:{apikey:key,Authorization:"Bearer "+token,...(body?{"Content-Type":"application/json",Prefer:"return=representation"}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(data?.message||"Request failed");
 return data;
}
export const loadPlayers=token=>api(token,"ss_players?select=user_id,handle&order=handle.asc&limit=100");
export const loadMobProfiles=token=>api(token,"ss_mob_profiles?select=user_id,mob_size,attack_points,defense_points,wins,losses,hospital_until");
export const loadRivals=token=>api(token,"ss_mob_rivals?select=rival_id,attacks,wins,last_fight_at&order=last_fight_at.desc&limit=30");
export const attackMob=(token,defenderId)=>api(token,"rpc/ss_mob_attack",{p_defender:defenderId,p_request:crypto.randomUUID()});
export const loadThreads=(token,worldId)=>api(token,"ss_forum_threads?world_id=eq."+encodeURIComponent(worldId)+"&select=id,author_id,category,title,body,created_at,locked&order=created_at.desc&limit=50");
export const loadReplies=(token,threadId)=>api(token,"ss_forum_replies?thread_id=eq."+encodeURIComponent(threadId)+"&select=id,author_id,body,created_at&order=created_at.asc&limit=100");
export const createThread=(token,worldId,category,title,body)=>api(token,"ss_forum_threads",{world_id:worldId,category,title,body,author_id:parseJwtUser(token)});
export const createReply=(token,threadId,body)=>api(token,"ss_forum_replies",{thread_id:threadId,body,author_id:parseJwtUser(token)});
function parseJwtUser(token){
 const part=token.split(".")[1];if(!part)throw new Error("Invalid session");
 const raw=atob(part.replace(/-/g,"+").replace(/_/g,"/"));return JSON.parse(raw).sub;
}

export async function loadMyPlayer(token){
 const uid=parseJwtUser(token);
 const rows=await api(token,"ss_players?user_id=eq."+encodeURIComponent(uid)+"&select=user_id,handle&limit=1");
 return rows?.[0]||null;
}

export const loadFightReports=token=>api(token,"ss_battle_reports?target=eq.mob-pvp&select=id,attacker_id,defender_id,won,attack,defense,reward,created_at&order=created_at.desc&limit=30");
