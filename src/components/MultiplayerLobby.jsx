import React,{useEffect,useState} from "react";
import {joinShadowAlpha,restoreShadowSession,shadowUserFromToken} from "../lib/shadowAuth";
import {loadMyPlayer} from "../lib/underground";
import Underground from "./Underground";

// The home page owns authentication. This screen never asks for credentials or signs players out.
export default function MultiplayerLobby({legacyHandle="",onPractice}){
 const [token,setToken]=useState("");
 const [world,setWorld]=useState(null);
 const [message,setMessage]=useState("");
 const [loading,setLoading]=useState(true);
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;
  (async()=>{
   setLoading(true);
   setMessage("");
   try{
    const access=await restoreShadowSession();
    if(!access)throw new Error("Your session has expired. Please sign in again from the home page.");
    const identity=shadowUserFromToken(access);
    if(!identity?.id)throw new Error("Your account session could not be verified. Sign in again from the home page.");
    const player=await loadMyPlayer(access);
    // A new account gets a stable temporary handle. The boss name is selected in game setup.
    const preferred=String(player?.handle||legacyHandle||"").replace(/[^A-Za-z0-9_]/g,"").slice(0,24);
    const fallback="boss_"+identity.id.replace(/-/g,"").slice(0,12);
    const handle=preferred.length>=3?preferred:fallback;
    const joined=await joinShadowAlpha(access,handle);
    if(!active)return;
    setToken(access);
    setWorld(joined);
   }catch(error){if(active)setMessage(error.message||"Could not enter the Underground.");}
   finally{if(active)setLoading(false);}
  })();
  return()=>{active=false};
 },[retry,legacyHandle]);
 return <div className="ug-lobby">
  {loading?<section className="ug-entry-card"><span>SHADOW SYNDICATE</span><h3>ENTERING THE UNDERGROUND</h3><p role="status">Connecting your game account to Shadow City...</p></section>:
  world&&token?<Underground token={token} world={world}/>:
  <section className="ug-entry-card"><span>CONNECTION UNAVAILABLE</span><h3>THE STREETS ARE OFFLINE.</h3><p role="alert">{message}</p><button className="primary" type="button" onClick={()=>setRetry(n=>n+1)}>TRY AGAIN</button>{onPractice&&<button className="secondary" type="button" onClick={onPractice}>PRACTICE FIGHTS</button>}</section>}
 </div>;
}
