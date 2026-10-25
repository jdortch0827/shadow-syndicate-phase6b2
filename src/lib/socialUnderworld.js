// Multiplayer social APIs: use the online Supabase session, never the local prototype save.
const base = import.meta.env.VITE_SHADOW_SUPABASE_URL;
const key = import.meta.env.VITE_SHADOW_SUPABASE_PUBLISHABLE_KEY;
export function getOnlineUserId(token) {
 try { return JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"))).sub || null; }
 catch { return null; }
}
async function request(token, resource, { method="GET", data }={}) {
 if(!base || !key || !token) throw new Error("Connect your online Shadow City account to use Street Chat.");
 const response=await fetch(base+"/rest/v1/"+resource, {
  method,
  headers:{ apikey:key, Authorization:"Bearer "+token, ...(data?{"Content-Type":"application/json",Prefer:"return=representation"}:{}) },
  ...(data?{body:JSON.stringify(data)}:{})
 });
 const json=await response.json().catch(()=>null);
 if(!response.ok) throw new Error(json?.message||json?.hint||json?.error||"The streets aren't responding.");
 return json;
}
const uid=token=>{const id=getOnlineUserId(token);if(!id)throw new Error("Your online session expired. Sign in again.");return id;};
export const readStreetMessages=(token,worldId)=>request(token,"ss_street_messages?world_id=eq."+encodeURIComponent(worldId)+"&select=id,world_id,author_id,body,created_at&order=created_at.desc&limit=80");
export const postStreetMessage=(token,worldId,body)=>request(token,"ss_street_messages",{method:"POST",data:{world_id:worldId,author_id:uid(token),body:body.trim()}});
export const readPlayerWall=(token,playerId)=>request(token,"ss_player_wall_posts?owner_id=eq."+encodeURIComponent(playerId)+"&select=id,owner_id,author_id,body,created_at&order=created_at.desc&limit=60");
export const postToPlayerWall=(token,playerId,body)=>request(token,"ss_player_wall_posts",{method:"POST",data:{owner_id:playerId,author_id:uid(token),body:body.trim()}});
export const deleteWallPost=(token,postId)=>request(token,"ss_player_wall_posts?id=eq."+encodeURIComponent(postId),{method:"DELETE"});
export const readMyBlocks=token=>request(token,"ss_social_blocks?blocker_id=eq."+encodeURIComponent(uid(token))+"&select=blocked_id");
export const blockPlayer=(token,otherId)=>request(token,"ss_social_blocks",{method:"POST",data:{blocker_id:uid(token),blocked_id:otherId}});
export const unblockPlayer=(token,otherId)=>request(token,"ss_social_blocks?blocker_id=eq."+encodeURIComponent(uid(token))+"&blocked_id=eq."+encodeURIComponent(otherId),{method:"DELETE"});
export const reportSocialPost=(token,type,id,reason="Inappropriate in-game conduct")=>request(token,"ss_social_reports",{method:"POST",data:{reporter_id:uid(token),content_type:type,content_id:id,reason}});
