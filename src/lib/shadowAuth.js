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
