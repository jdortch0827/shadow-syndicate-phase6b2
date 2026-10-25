import React,{useCallback,useEffect,useMemo,useState} from "react";
import {readStreetMessages,postStreetMessage,readPlayerWall,postToPlayerWall,deleteWallPost,readMyBlocks,blockPlayer,unblockPlayer,reportSocialPost,getOnlineUserId} from "../lib/socialUnderworld";
const stamp=date=>{try{return new Date(date).toLocaleString()}catch{return ""}};
const face=name=>String(name||"?").slice(0,2).toUpperCase();

export default function SocialUnderworld({token,world,players=[],profiles=[],focusPlayerId=null,onChallenge}) {
 const self=getOnlineUserId(token);
 const [screen,setScreen]=useState(focusPlayerId?"profile":"chat");
 const [selected,setSelected]=useState(focusPlayerId||self);
 const [messages,setMessages]=useState([]);
 const [wall,setWall]=useState([]);
 const [blocked,setBlocked]=useState([]);
 const [draft,setDraft]=useState("");
 const [wallDraft,setWallDraft]=useState("");
 const [search,setSearch]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const roster=useMemo(()=>Object.fromEntries(players.map(p=>[p.user_id,p.handle])),[players]);
 const name=id=>roster[id]||(id===self?"You":"Unknown boss");
 const selectedPlayer=players.find(p=>p.user_id===selected);
 const selectedProfile=profiles.find(p=>p.user_id===selected);
 const isBlocked=blocked.includes(selected);
 const visibleMessages=messages.filter(m=>!blocked.includes(m.author_id));
 const directory=players.filter(p=>p.handle.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.handle.localeCompare(b.handle));
 const refreshChat=useCallback(async()=>{const rows=await readStreetMessages(token,world.world_id);setMessages(Array.isArray(rows)?rows:[])},[token,world.world_id]);
 const refreshWall=useCallback(async(id)=>{if(!id)return;const rows=await readPlayerWall(token,id);setWall(Array.isArray(rows)?rows:[])},[token]);
 const refreshBlocks=useCallback(async()=>{const rows=await readMyBlocks(token);setBlocked((rows||[]).map(r=>r.blocked_id))},[token]);
 useEffect(()=>{let active=true;Promise.allSettled([refreshChat(),refreshBlocks()]).then(results=>{if(active&&results.some(r=>r.status==="rejected"))setError("Couldn't load every social feature. Try Refresh.")});return()=>{active=false}},[refreshChat,refreshBlocks]);
 useEffect(()=>{if(selected)refreshWall(selected).catch(e=>setError(e.message))},[selected,refreshWall]);
 useEffect(()=>{if(!token||!world?.world_id)return;const interval=setInterval(()=>{refreshChat().catch(()=>{});if(selected&&screen==="profile")refreshWall(selected).catch(()=>{})},12000);return()=>clearInterval(interval)},[refreshChat,refreshWall,token,world?.world_id,selected,screen]);
 useEffect(()=>{if(focusPlayerId){setSelected(focusPlayerId);setScreen("profile")}},[focusPlayerId]);
 function openProfile(id){setSelected(id);setScreen("profile");setError("");setNotice("");}
 async function action(task,success){setBusy(true);setError("");setNotice("");try{await task();setNotice(success)}catch(e){setError(e.message)}finally{setBusy(false)}}
 function submitChat(e){e.preventDefault();const line=draft.trim();if(!line||busy)return;action(async()=>{await postStreetMessage(token,world.world_id,line);setDraft("");await refreshChat()},"Your message is on the street.")}
 function submitWall(e){e.preventDefault();const line=wallDraft.trim();if(!line||busy||!selected)return;action(async()=>{await postToPlayerWall(token,selected,line);setWallDraft("");await refreshWall(selected)},"Signed the wall. They'll know who said it.")}
 function report(type,id){if(!window.confirm("Report this post to the moderators?"))return;action(()=>reportSocialPost(token,type,id),"Report submitted.")}
 return <div className="social-underworld">
  <header className="social-head"><div><span className="ug-eyebrow">SHADOW CITY / SOCIAL UNDERWORLD</span><h2>THE STREETS HAVE EARS.</h2><p>Talk your trash, find your enemies, and leave your mark. These are real player posts, not scripted rumors.</p></div><button type="button" className="secondary" disabled={busy} onClick={()=>Promise.all([refreshChat(),refreshBlocks(),selected?refreshWall(selected):Promise.resolve()]).catch(e=>setError(e.message))}>Refresh</button></header>
  <nav className="social-tabs" aria-label="Social sections">
   <button type="button" className={screen==="chat"?"active":""} onClick={()=>setScreen("chat")}>STREET CHAT</button>
   <button type="button" className={screen==="players"?"active":""} onClick={()=>setScreen("players")}>FIND MOBSTERS <small>{players.length}</small></button>
   <button type="button" className={screen==="profile"?"active":""} onClick={()=>{setSelected(selected||self);setScreen("profile")}}>PLAYER WALL</button>
  </nav>
  {error&&<div className="ug-alert" role="alert">{error}</div>}
  {notice&&<p className="social-confirmation" role="status">{notice}</p>}
  {screen==="chat"&&<section className="social-panel"><div className="social-title"><div><h3>STREET CHAT</h3><p>Public room · everyone in Shadow City can read your posts.</p></div><strong>{visibleMessages.length} messages</strong></div>
   <div className="social-message-stream" role="log" aria-label="Street chat messages">
    {[...visibleMessages].reverse().map(m=><article className="social-message" key={m.id}><button type="button" className="social-avatar" onClick={()=>openProfile(m.author_id)} aria-label={"Visit "+name(m.author_id)+" profile"}>{face(name(m.author_id))}</button><div><div className="social-message-top"><button type="button" className="social-author" onClick={()=>openProfile(m.author_id)}>{name(m.author_id)}</button><small>{stamp(m.created_at)}</small>{m.author_id!==self&&<button type="button" className="social-link" onClick={()=>report("chat",m.id)}>Report</button>}</div><p>{m.body}</p></div></article>)}
    {!visibleMessages.length&&<div className="ug-empty">No real messages yet. Be the first boss to speak.</div>}
   </div>
   <form className="social-compose" onSubmit={submitChat}><label htmlFor="street-message">SAY SOMETHING</label><div><input id="street-message" maxLength="500" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Who's running their mouth tonight?" /><button type="submit" className="primary" disabled={busy||!draft.trim()}>SEND</button></div><small>{draft.length}/500 · Keep rivalries inside the game.</small></form>
  </section>}
  {screen==="players"&&<section className="social-panel"><div className="social-title"><div><h3>THE CITY DIRECTORY</h3><p>Real online accounts. Choose a boss to view their public wall.</p></div></div>
   <label className="social-search">SEARCH MOBSTERS<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a boss by name" maxLength="50"/></label>
   <div className="social-directory">{directory.map(p=>{const profile=profiles.find(x=>x.user_id===p.user_id);return <button type="button" className="social-player-card" key={p.user_id} onClick={()=>openProfile(p.user_id)}><span className="social-avatar">{face(p.handle)}</span><span><strong>{p.handle}{p.user_id===self?" (YOU)":""}</strong><small>Mob {profile?.mob_size??1} · {profile?.wins??0}W / {profile?.losses??0}L</small></span><b>VIEW WALL →</b></button>})}</div>
   {!directory.length&&<div className="ug-empty">No mobsters match that name.</div>}
  </section>}
  {screen==="profile"&&<section className="social-panel">
   <div className="social-profile"><div className="social-avatar huge">{face(name(selected))}</div><div><span className="ug-eyebrow">PUBLIC MOBSTER PROFILE</span><h3>{selectedPlayer?.handle||name(selected)}</h3><p>{selected===self?"This is your public page.":"Leave a message. Settle a grudge. Make a rival."}</p></div></div>
   <div className="social-profile-stats"><div><span>CREW</span><strong>{selectedProfile?.mob_size??1}</strong></div><div><span>WINS</span><strong>{selectedProfile?.wins??0}</strong></div><div><span>LOSSES</span><strong>{selectedProfile?.losses??0}</strong></div><div><span>ATTACK</span><strong>{selectedProfile?.attack_points??0}</strong></div></div>
   {selected!==self&&<div className="social-profile-actions"><button type="button" className="primary" onClick={()=>onChallenge?.(selected)}>CHALLENGE THIS MOB</button><button type="button" className="secondary" disabled={busy} onClick={()=>action(async()=>{if(isBlocked)await unblockPlayer(token,selected);else await blockPlayer(token,selected);await refreshBlocks()},isBlocked?"Boss unblocked.":"Boss blocked.")}>{isBlocked?"UNBLOCK PLAYER":"BLOCK PLAYER"}</button></div>}
   <div className="social-wall-heading"><h3>{selected===self?"YOUR WALL":name(selected).toUpperCase()+"'S WALL"}</h3><p>What gets said here stays on the record.</p></div>
   {!isBlocked&&<form className="social-compose" onSubmit={submitWall}><label htmlFor="wall-message">SIGN THE WALL</label><div><input id="wall-message" maxLength="500" value={wallDraft} onChange={e=>setWallDraft(e.target.value)} placeholder="Got something to say to this boss?" /><button type="submit" className="primary" disabled={busy||!wallDraft.trim()}>POST</button></div><small>{wallDraft.length}/500</small></form>}
   {isBlocked&&<p className="soft-text">Unblock this player to post on their wall.</p>}
   <div className="social-message-stream wall">{wall.filter(p=>!blocked.includes(p.author_id)).map(p=><article className="social-message" key={p.id}><button type="button" className="social-avatar" onClick={()=>openProfile(p.author_id)}>{face(name(p.author_id))}</button><div><div className="social-message-top"><button type="button" className="social-author" onClick={()=>openProfile(p.author_id)}>{name(p.author_id)}</button><small>{stamp(p.created_at)}</small>{(p.author_id===self||p.owner_id===self)?<button type="button" className="social-link" disabled={busy} onClick={()=>action(async()=>{await deleteWallPost(token,p.id);await refreshWall(selected)},"Post removed.")}>Delete</button>:<button type="button" className="social-link" onClick={()=>report("wall",p.id)}>Report</button>}</div><p>{p.body}</p></div></article>)}{!wall.length&&<div className="ug-empty">Nothing written on this wall yet. Start something.</div>}</div>
  </section>}
 </div>;
}
