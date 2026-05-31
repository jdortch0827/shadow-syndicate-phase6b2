import React from 'react';
import SafeImage from './SafeImage';
import GrudgeMeter from './GrudgeMeter';

export default function PvpTargetCard({ target, group, grudge = 0, possibleReward, onAttack, nemesisState, retaliationRisk }) {
  const isNemesis = Boolean(nemesisState?.active);
  return (
    <article className={`pvp-target-card ${isNemesis ? 'nemesis-card' : ''}`}>
      <SafeImage src={target.image} alt={target.bossName} className="pvp-target-image" />
      <div className="pvp-target-body">
        <div className="card-head tight">
          <div><p className="kicker">{isNemesis ? 'Nemesis' : group}</p><h3>{target.bossName}</h3><p>{target.crewName}</p></div>
          <span>{target.lastActive}</span>
        </div>
        {isNemesis && <div className="nemesis-badge">Nemesis • Bonus revenge active when they hit you</div>}
        <p className="soft-text">{target.personality}</p>
        <div className="stat-grid mini">
          <span>Level <strong>{target.level}</strong></span>
          <span>Power <strong>{target.powerScore}</strong></span>
          <span>Defense <strong>{target.defenseRating}</strong></span>
          <span>District <strong>{target.districtControlled}</strong></span>
          <span>Reward <strong>{possibleReward}</strong></span>
          <span>Retaliation <strong>{retaliationRisk?.label || 'Low'}</strong></span>
        </div>
        <blockquote className="taunt-line">“{target.taunt}”</blockquote>
        <GrudgeMeter value={grudge} />
        <button className="danger" type="button" onClick={() => onAttack(target)}>Attack Crew</button>
      </div>
    </article>
  );
}
