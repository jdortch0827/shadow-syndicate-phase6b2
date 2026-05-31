import React from 'react';
import { mockPlayers } from '../data/mockPlayers';
import { pvpBounties } from '../data/pvpBounties';
import { classifyTarget } from '../logic/pvp';
import { getNemesisState, getRetaliationRisk } from '../logic/nemesis';
import PvpTargetCard from '../components/PvpTargetCard';
import AttackLog from '../components/AttackLog';
import RevengeList from '../components/RevengeList';
import DefenseSetup from '../components/DefenseSetup';
import RivalHistoryCard from '../components/RivalHistoryCard';

export default function PvpHub({ game, playerProfile, onAttack, onRetaliate, onDefenseChange, onClaimBounty }) {
  const attackLog = Array.isArray(game.pvpAttackLog) ? game.pvpAttackLog : [];
  const revengeList = Array.isArray(game.pvpRevengeList) ? game.pvpRevengeList : [];
  const grudgeMap = game.pvpGrudges || {};
  const bountyProgress = game.pvpBountyProgress || {};
  const rivalHistory = game.pvpRivalHistory || {};
  const claimed = game.pvpBountiesClaimed || {};
  const groups = mockPlayers.reduce((acc, target) => {
    const group = classifyTarget(playerProfile.powerScore, target.powerScore);
    acc[group] = acc[group] || [];
    acc[group].push(target);
    return acc;
  }, {});
  const order = ['Easy Pickings', 'Even Match', 'Dangerous Rival', 'High-Value Target'];

  return (
    <div className="pvp-hub">
      <section className="pvp-profile-panel">
        <div><p className="kicker">Public Boss Profile</p><h3>{playerProfile.bossName}</h3><p>{playerProfile.crewName} • {playerProfile.bossClass}</p></div>
        <div className="stat-grid mini">
          <span>Power <strong>{playerProfile.powerScore}</strong></span>
          <span>Attack <strong>{playerProfile.attackRating}</strong></span>
          <span>Defense <strong>{playerProfile.defenseRating}</strong></span>
          <span>Respect <strong>{playerProfile.respect}</strong></span>
          <span>Heat <strong>{playerProfile.heatLevel}/100</strong></span>
          <span>Crew Loyalty <strong>{playerProfile.crewLoyalty}/100</strong></span>
        </div>
      </section>

      <section className="pvp-section"><div className="card-head"><div><p className="kicker">Find Targets</p><h3>Pick who to mess with</h3><p>Mock local targets now. Later this same screen can pull real saved player profiles from the backend.</p></div></div>
        {order.map((group) => (groups[group]?.length ? <div key={group} className="pvp-target-group"><h3>{group}</h3><div className="pvp-target-grid">{groups[group].map((target) => <PvpTargetCard key={target.id} target={target} group={group} grudge={Number(grudgeMap[target.id] || 0)} nemesisState={getNemesisState(game, target.id)} retaliationRisk={getRetaliationRisk(game, target.id, 15)} possibleReward={`$${Math.max(500, Math.round(target.powerScore * 5)).toLocaleString()}`} onAttack={onAttack} />)}</div></div> : null))}
      </section>

      <section className="pvp-section"><div className="card-head"><div><p className="kicker">Defense Setup</p><h3>How your crew holds the line</h3></div><span>{game.pvpDefensePosture || 'balanced'}</span></div><DefenseSetup selected={game.pvpDefensePosture || 'balanced'} cash={game.cash} onSelect={onDefenseChange} /><p className="soft-text defense-help">Low Profile lowers target chance but is weaker. Balanced has no major drawback. Hard Guard boosts defense but adds heat. Trap House can punish attackers but costs cash or loyalty.</p></section>

      <section className="pvp-section"><div className="card-head"><div><p className="kicker">Revenge List</p><h3>Make it personal</h3></div></div><RevengeList items={revengeList} onRetaliate={onRetaliate} /></section>

      <section className="pvp-section"><div className="card-head"><div><p className="kicker">Bounty Board</p><h3>Local PvP goals</h3></div></div><div className="bounty-grid">{pvpBounties.map((bounty) => { const progress = Number(bountyProgress[bounty.id] || 0); const ready = progress >= bounty.target; const done = Boolean(claimed[bounty.id]); return <article key={bounty.id} className={`bounty-card ${ready ? 'ready' : ''}`}><h3>{bounty.title}</h3><p>{bounty.desc}</p><div className="bar"><i style={{ width: `${Math.min(100, Math.round(progress / bounty.target * 100))}%` }} /></div><small>{progress}/{bounty.target} • ${bounty.reward.cash.toLocaleString()} / +{bounty.reward.respect} Respect</small><button className="primary" disabled={!ready || done} onClick={() => onClaimBounty(bounty)}>{done ? 'Claimed' : ready ? 'Claim Bounty' : 'Not Ready'}</button></article>; })}</div></section>


      <section className="pvp-section"><div className="card-head"><div><p className="kicker">Rival History</p><h3>Who remembers what</h3><p>Every hit, loss, and revenge move should make rivals feel personal.</p></div></div><div className="rival-history-list">{mockPlayers.map((target) => <RivalHistoryCard key={target.id} target={target} history={rivalHistory[target.id]} grudge={Number(grudgeMap[target.id] || 0)} nemesisState={getNemesisState(game, target.id)} />)}</div></section>

      <section className="pvp-section"><div className="card-head"><div><p className="kicker">Attack Log</p><h3>Who hit who</h3></div></div><AttackLog items={attackLog} /></section>
    </div>
  );
}
