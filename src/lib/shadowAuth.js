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
export const registerShadowAccount=(email,password,username)=>{const redirect=typeof window!=="undefined"?window.location.origin+"/":"";return request("/auth/v1/signup"+(redirect?"?redirect_to="+encodeURIComponent(redirect):""),{email,password,data:username?{username}:{}});};
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

export function shadowUserFromToken(accessToken){try{const payload=JSON.parse(atob(accessToken.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));return {id:payload.sub,email:payload.email,username:payload.user_metadata?.username||""}}catch{return null}}
export async function ensureShadowHomeSession({email,password,username,create=false,migrate=false}){
 const existing=await restoreShadowSession();if(existing)return existing;
 if(!email||!password)throw new Error("Enter your email and password on the home login to enable online play.");
 if(create){const registered=await registerShadowAccount(email,password,username);if(registered.access_token){saveShadowSession(registered);return registered.access_token}}
 let signed;try{signed=await signInShadowAccount(email,password)}catch(error){if(!migrate)throw error;const registered=await registerShadowAccount(email,password,username);if(!registered.access_token)throw new Error("Check your email to verify the online account, then sign in again on the home page.");signed=registered;}saveShadowSession(signed);return signed.access_token;
}
