import React, { useState } from "react";
import { TROOPS, TARGETS, getTroopCounts, calculateArmy } from "../logic/warfare";

export default function WarRoom({ game, onTrain, onRaid, onHeal }) {
  const [quantity, setQuantity] = useState(1);
  const [deployment, setDeployment] = useState({ runners: 0, enforcers: 0, specialists: 0 });
  const [targetId, setTargetId] = useState(TARGETS[0].id);
  const troops = getTroopCounts(game);
  const hospital = game.warfare?.hospital || {};
  const army = calculateArmy(troops);
  const chosen = calculateArmy(deployment);
  const target = TARGETS.find(item => item.id === targetId);
  const healingCost = Object.entries(TROOPS).reduce((sum, [id, unit]) => sum + Number(hospital[id] || 0) * Math.ceil(unit.cost / 2), 0);
  return <div className="war-room">
    <div className="war-summary"><div><span>Active Troops</span><strong>{army.units}</strong></div><div><span>Army Attack</span><strong>{army.attack}</strong></div><div><span>Wounded</span><strong>{Object.values(hospital).reduce((sum,n)=>sum+Number(n||0),0)}</strong></div></div>
    <section className="war-section"><h3>Train Your Crew</h3><p>Build a fighting force. Training costs cash and energy.</p>
      <label className="war-quantity">Train per order <input aria-label="Troops per training order" type="number" min="1" max="25" step="1" value={quantity} onChange={event=>setQuantity(event.target.value)} /></label>
      <div className="war-unit-grid">{Object.entries(TROOPS).map(([id, unit])=><div className="war-unit" key={id}><strong>{unit.name}</strong><small>Level {unit.level} · Attack {unit.attack} · Defense {unit.defense}</small><small>Owned: {troops[id]} · ${unit.cost} and {unit.energy} energy each</small><button className="secondary" type="button" disabled={Number(game.level)<unit.level} onClick={()=>onTrain(id,Number(quantity))}>{Number(game.level)<unit.level ? `Unlocks Level ${unit.level}` : "Train"}</button></div>)}</div>
    </section>
    <section className="war-section"><h3>Launch a Raid</h3><p>Practice combat against simulated enemy positions. These are not real players.</p>
      <label className="war-quantity">Enemy position <select value={targetId} onChange={event=>setTargetId(event.target.value)}>{TARGETS.map(t=><option key={t.id} value={t.id} disabled={Number(game.level)<t.level}>{t.name} · Power {t.power} · Level {t.level}</option>)}</select></label>
      <div className="war-deploy-grid">{Object.entries(TROOPS).map(([id,unit])=><label key={id}>{unit.name}<small>Available {troops[id]}</small><input type="number" min="0" max={troops[id]} step="1" value={deployment[id]} onChange={event=>setDeployment(old=>({...old,[id]:event.target.value}))}/></label>)}</div>
      <p className="war-readout">Deployed: {chosen.units} · Attack: {chosen.attack} · Enemy power: {target.power}</p>
      <button className="primary" type="button" disabled={!chosen.units || Number(game.level)<target.level} onClick={()=>{onRaid(targetId,deployment);setDeployment({runners:0,enforcers:0,specialists:0});}}>Attack Position</button>
    </section>
    <section className="war-section"><h3>Field Hospital</h3><p>Wounded survive raids and can return to duty.</p><p>Healing cost: ${healingCost.toLocaleString()}</p><button className="secondary" type="button" disabled={!healingCost || Number(game.cash)<healingCost} onClick={onHeal}>Heal All Wounded</button></section>
    <section className="war-section"><h3>Battle Reports</h3>{!game.warfare?.reports?.length ? <p>No battles fought yet.</p> : <div className="war-reports">{game.warfare.reports.slice(0,10).map((r,i)=><div key={r.id+"-"+i}><strong>{r.won?"Victory":"Defeat"} · {r.target}</strong><small>Attack {r.attack} / Enemy {r.targetPower} · Reward ${r.reward}</small></div>)}</div>}</section>
    <p className="war-disclaimer">Prototype warfare: battles are local simulations. Online alliances, player attacks, and authoritative server combat are still in development.</p>
  </div>;
}
