import React,{useEffect,useState} from "react";
import {loadMyWallet,loadMyGear,buyMobGear,recruitMob} from "../lib/underground";
const catalog=[
 {id:"brass_knuckles",name:"Brass Knuckles",type:"weapon",price:70,attack:3,defense:1,rarity:"STREET"},
 {id:"tommy_gun",name:"Tommy Gun",type:"weapon",price:450,attack:14,defense:3,rarity:"ENFORCER"},
 {id:"kevlar_vest",name:"Kevlar Vest",type:"armor",price:300,attack:1,defense:11,rarity:"PROTECTION"},
 {id:"armored_coat",name:"Armored Coat",type:"armor",price:650,attack:4,defense:20,rarity:"HEAVY"},
 {id:"getaway_car",name:"Getaway Car",type:"vehicle",price:550,attack:10,defense:6,rarity:"TRANSPORT"},
 {id:"armored_suv",name:"Armored SUV",type:"vehicle",price:1200,attack:15,defense:19,rarity:"PREMIUM"}
];
const money=value=>"$"+Number(value||0).toLocaleString();
export default function MobArmory({token,world,self,mobSize=1,onChanged}){
 const [wallet,setWallet]=useState(null),[gear,setGear]=useState([]),[quantity,setQuantity]=useState(1),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[filter,setFilter]=useState("all");
 const reload=async()=>{const [w,g]=await Promise.all([loadMyWallet(token,self,world.world_id),loadMyGear(token,self)]);setWallet(w?.[0]||null);setGear(g||[])};
 useEffect(()=>{reload().catch(e=>setNotice(e.message))},[token,self,world.world_id]);
 async function purchase(action,item){setBusy(true);setNotice("");try{const result=await(action==="recruit"?recruitMob(token,quantity):buyMobGear(token,item.id,quantity));setNotice(action==="recruit"?"Your mob just grew by "+result.quantity+".":"Purchased "+result.quantity+" × "+item.name+".");await reload();await onChanged?.()}catch(e){setNotice(e.message)}finally{setBusy(false)}}
 const totalAttack=gear.reduce((n,g)=>n+Math.min(g.owned,mobSize)*g.attack,0);
 const totalDefense=gear.reduce((n,g)=>n+Math.min(g.owned,mobSize)*g.defense,0);
 return <section className="ug-armory">
 <div className="ug-section-heading"><div><small>02 / BUILD YOUR EMPIRE</small><h2>THE BLACK MARKET</h2><p>Your mob is only as dangerous as the gear you put in its hands.</p></div><span className="ug-counter">REAL EQUIPMENT / REAL STATS</span></div>
 <div className="ug-armory-overview"><div><small>AVAILABLE CASH</small><strong>{wallet?money(wallet.cash):"—"}</strong><span>Spend it. Earn more. Get stronger.</span></div><div><small>MOB MEMBERS</small><strong>{mobSize.toLocaleString()}</strong><span>Each member can carry equipment.</span></div><div><small>GEAR ATTACK</small><strong>+{totalAttack.toLocaleString()}</strong><span>Equipment in your arsenal</span></div><div><small>GEAR DEFENSE</small><strong>+{totalDefense.toLocaleString()}</strong><span>Protect your operation</span></div></div>
 <div className="ug-recruit-panel"><div><small>GROW YOUR ORGANIZATION</small><h3>EVERY BOSS NEEDS BACKUP.</h3><p>Recruit mobsters for {money(100)} each. More members let you bring more gear into every fight.</p></div><div className="ug-recruit-actions"><label>QUANTITY<select value={quantity} onChange={e=>setQuantity(Number(e.target.value))}>{[1,5,10,25,50,100].map(n=><option key={n} value={n}>{n}</option>)}</select></label><button disabled={busy||!wallet||wallet.cash<quantity*100||mobSize+quantity>10000} onClick={()=>purchase("recruit")}>RECRUIT {quantity} · {money(quantity*100)} ↗</button></div></div>
 <div className="ug-armory-filter" aria-label="Equipment categories">{["all","weapon","armor","vehicle"].map(t=><button key={t} className={filter===t?"selected":""} onClick={()=>setFilter(t)}>{t==="all"?"ALL EQUIPMENT":t==="weapon"?"WEAPONS":t==="armor"?"ARMOR":"VEHICLES"}</button>)}</div>
 <div className="ug-shop-grid">{catalog.filter(x=>filter==="all"||x.type===filter).map(item=>{const owned=gear.find(g=>g.item_id===item.id)?.owned||0;return <article className="ug-shop-item" key={item.id}><div className={"ug-shop-illustration "+item.type}><span>{item.type==="weapon"?"W":item.type==="armor"?"A":"V"}</span><small>{item.rarity}</small></div><div className="ug-shop-info"><small>{item.type.toUpperCase()} / {item.rarity}</small><h3>{item.name}</h3><div className="ug-shop-stats"><span>ATK +{item.attack}</span><span>DEF +{item.defense}</span><span>OWNED {owned}</span></div><div className="ug-shop-buy"><strong>{money(item.price)}</strong><button disabled={busy||!wallet||wallet.cash<item.price*quantity} onClick={()=>purchase("buy",item)}>BUY {quantity} ↗</button></div></div></article>})}</div>
 <p className="ug-armory-tip">Combat uses up to one of each equipment item per mob member. More equipment without more mob members may not increase your fight power.</p>
 {notice&&<p className="ug-alert" role="status">{notice}</p>}
 </section>;
}
