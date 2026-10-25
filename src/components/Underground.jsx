import React,{useEffect,useState} from "react";
import {loadPlayers,loadMobProfiles,loadRivals,attackMob,loadThreads,loadReplies,createThread,createReply} from "../lib/underground";
const sections=["Rivals","Forums"];
export default function Underground({token,world}){
 const [section,setSection]=useState("Rivals"),[players,setPlayers]=useState([]),[profiles,setProfiles]=useState([]),[rivals,setRivals]=useState([]),[threads,setThreads]=useState([]),[replies,setReplies]=useState([]),[thread,setThread]=useState(null);
 const [category,setCategory]=useState("general"),[title,setTitle]=useState(""),[body,setBody]=useState(""),[reply,setReply]=useState(""),[status,setStatus]=useState(""),[busy,setBusy]=useState(false);
 const names=Object.fromEntries(players.map(p=>[p.user_id,p.handle]));
 const self=(()=>{try{return JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"))).sub}catch{return null}})();
 async function refresh(){const [p,m,r,t]=await Promise.all([loadPlayers(token),loadMobProfiles(token),loadRivals(token),loadThreads(token,world.world_id)]);setPlayers(p);setProfiles(m);setRivals(r);setThreads(t)}
 useEffect(()=>{refresh().catch(e=>setStatus(e.message))},[token,world.world_id]);
 async function act(action){setBusy(true);setStatus("");try{const result=await action();if(result?.won!==undefined)setStatus(result.won?"Victory! Won $"+result.cash:"Defeat. Your rival won this round.");else setStatus("Posted successfully.");await refresh();if(thread)setReplies(await loadReplies(token,thread.id))}catch(e){setStatus(e.message)}finally{setBusy(false)}}
 async function openThread(t){setThread(t);setReplies([]);try{setReplies(await loadReplies(token,t.id))}catch(e){setStatus(e.message)}}
 return <div className="war-room"><section className="war-section"><h2>The Underground</h2><p>Real players. Real rivalries. Your reputation follows you.</p><div className="button-row">{sections.map(s=><button type="button" className={section===s?"primary":"secondary"} key={s} onClick={()=>setSection(s)}>{s}</button>)}</div></section>
 {section==="Rivals"?<section className="war-section"><h3>Fight List</h3><p>Classic mob combat: your mob size determines how much of each equipment category contributes to the fight. Attack and defense stats matter. Results are calculated on the server.</p>
 {players.filter(p=>p.user_id!==self).map(p=>{const profile=profiles.find(x=>x.user_id===p.user_id);return <div key={p.user_id} className="war-summary"><div><strong>{p.handle}</strong><p>Mob {profile?.mob_size||1} · {profile?.wins||0} wins / {profile?.losses||0} losses</p></div><button type="button" className="primary" disabled={busy} onClick={()=>act(()=>attackMob(token,p.user_id))}>Attack</button></div>})}
 {!players.some(p=>p.user_id!==self)&&<p>No rivals in Alpha yet. Invite another test player.</p>}
 <h3>My Rivalries</h3>{rivals.map(r=><p key={r.rival_id}>{names[r.rival_id]||"Unknown rival"} · {r.attacks} attacks · {r.wins} wins</p>)}{!rivals.length&&<p>Your rival history will appear here after your first fight.</p>}</section>:
 <section className="war-section"><h3>Underground Forums</h3><p>Callouts, crews, fight receipts and general trash talk. Keep it in-game; threats, doxxing and real-world harassment are not allowed.</p>
 {!thread?<><label>Forum <select value={category} onChange={e=>setCategory(e.target.value)}>{["general","callouts","crews","battle-reports","market"].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
 <label>Topic <input maxLength="120" value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Post <textarea maxLength="4000" value={body} onChange={e=>setBody(e.target.value)}/></label>
 <button className="primary" disabled={busy||title.trim().length<5||body.trim().length<5} onClick={()=>act(async()=>{const x=await createThread(token,world.world_id,category,title.trim(),body.trim());setTitle("");setBody("");return x})}>Start Discussion</button>
 <h3>Latest Discussions</h3>{threads.map(t=><div className="war-summary" key={t.id}><div><strong>{t.title}</strong><p>{t.category} · {names[t.author_id]||"Mobster"}</p></div><button className="secondary" onClick={()=>openThread(t)}>Read / Reply</button></div>)}{!threads.length&&<p>No discussions yet. Start the first one.</p>}</>:
 <><button className="secondary" onClick={()=>setThread(null)}>Back to Forums</button><h3>{thread.title}</h3><p>{names[thread.author_id]||"Mobster"}: {thread.body}</p>{replies.map(r=><p key={r.id}><strong>{names[r.author_id]||"Mobster"}:</strong> {r.body}</p>)}{!thread.locked&&<><label>Reply <textarea maxLength="2500" value={reply} onChange={e=>setReply(e.target.value)}/></label><button className="primary" disabled={busy||!reply.trim()} onClick={()=>act(async()=>{const result=await createReply(token,thread.id,reply.trim());setReply("");return result})}>Post Reply</button></>}</>}
 </section>}
 {status&&<p role="status">{status}</p>}</div>
}
