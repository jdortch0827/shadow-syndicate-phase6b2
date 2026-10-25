// Separate multiplayer identity from legacy local prototype accounts.
const base = import.meta.env.VITE_SHADOW_SUPABASE_URL;
const key = import.meta.env.VITE_SHADOW_SUPABASE_PUBLISHABLE_KEY;
const headers = { apikey: key, "Content-Type": "application/json" };
async function request(path, payload, accessToken) {
 if (!base || !key) throw new Error("Shadow multiplayer backend is not configured.");
 const response=await fetch(base+path,{method:"POST",headers:{...headers,...(accessToken?{Authorization:"Bearer "+accessToken}:{})},body:JSON.stringify(payload)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok) throw new Error(data.msg||data.message||data.error_description||data.error||"Request failed");
 return data;
}
export const registerShadowAccount=(email,password)=>request("/auth/v1/signup",{email,password});
export const signInShadowAccount=(email,password)=>request("/auth/v1/token?grant_type=password",{email,password});
export const joinShadowAlpha=(accessToken,handle)=>request("/rest/v1/rpc/ss_join_alpha",{p_handle:handle},accessToken);

const SESSION_KEY="shadow_syndicate_multiplayer_session_v1";
export function saveShadowSession(data){
 if(!data?.access_token||!data?.refresh_token)return;
 try{localStorage.setItem(SESSION_KEY,JSON.stringify({access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()+Math.max(60,Number(data.expires_in||3600)-30)*1000}));}catch{}
}
export function clearShadowSession(){try{localStorage.removeItem(SESSION_KEY)}catch{}}
export async function restoreShadowSession(){
 let saved;try{saved=JSON.parse(localStorage.getItem(SESSION_KEY)||"null")}catch{return null}
 if(!saved?.access_token||!saved?.refresh_token)return null;
 if(saved.expires_at>Date.now()+60000)return saved.access_token;
 try{
  const renewed=await request("/auth/v1/token?grant_type=refresh_token",{refresh_token:saved.refresh_token});
  saveShadowSession(renewed);
  return renewed.access_token;
 }catch{clearShadowSession();return null}
}

/** Identity is established only by a successful server-authenticated session, not by an entered name. */
export function shadowUserFromToken(token) {
 try {
  const part=String(token||"").split(".")[1];
  if(!part)return null;
  const padded=part.replace(/-/g,"+").replace(/_/g,"/");
  const claims=JSON.parse(atob(padded));
  return claims?.sub?{id:claims.sub,email:claims.email||"",username:claims.user_metadata?.username||""}:null;
 }catch{return null}
}
/** Trigger a Supabase password recovery email; never reveal whether an address is registered. */
export async function requestShadowPasswordReset(email){
 const clean=String(email||"").trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean))throw new Error("Enter a valid email address.");
 await request("/auth/v1/recover",{email:clean});
 return true;
}
