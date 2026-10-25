import React,{useState} from "react";
import {trainOnline,healOnline,raidOnline} from "../lib/alphaActions";
export default function AlphaWarfare({token,targets=[],troops=[],refresh}){
 const [unit,setUnit]=useState("runners"),[quantity,setQuantity]=useState(1),[target,setTarget]=useState("dockside");
 const [army,setArmy]=useState({runners:0,enforcers:0,specialists:0});
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const run=async(fn)=>{setBusy(true);setMessage("");try{const result=await fn();setMessage(JSON.stringify(result));await refresh();}catch(error){setMessage(error.message)}finally{setBusy(false)}};
 const available=Object.fromEntries(troops.map(t=>[t.unit_type,t.available]));
 return <section className="war-section"><h3>Online Warfare</h3><p>Actions use persistent server balances. Offline War Room troops do not transfer.</p>
 <div className="button-row"><label>Unit <select value={unit} onChange={e=>setUnit(e.target.value)}>{["runners","enforcers","specialists"].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Quantity <input type="number" min="1" max="25" value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></label>
 <button type="button" disabled={busy||quantity<1||quantity>25} onClick={()=>run(()=>trainOnline(token,unit,quantity))}>Train</button>
 <button type="button" disabled={busy||quantity<1||quantity>100} onClick={()=>run(()=>healOnline(token,unit,quantity))}>Heal</button></div>
 <h4>Raid Deployment</h4><label>Target <select value={target} onChange={e=>setTarget(e.target.value)}>{targets.map(x=><option key={x.id} value={x.id}>{x.name} · Defense {x.defense}</option>)}</select></label>
 <div className="button-row">{["runners","enforcers","specialists"].map(x=><label key={x}>{x} ({available[x]||0} ready) <input type="number" min="0" max={available[x]||0} value={army[x]} onChange={e=>setArmy(old=>({...old,[x]:Math.max(0,Math.floor(Number(e.target.value)||0))}))}/></label>)}</div>
 <button type="button" disabled={busy||!targets.length||Object.values(army).every(x=>x===0)} onClick={()=>run(()=>raidOnline(token,target,army,crypto.randomUUID()))}>Launch Server Raid</button>
 {message&&<p role="status">{message}</p>}
 <p className="war-disclaimer">Raid outcomes, casualties and rewards are calculated on the server. Test accounts only.</p></section>;
}
