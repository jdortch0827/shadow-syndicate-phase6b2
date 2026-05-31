import React from 'react';
import GrudgeMeter from './GrudgeMeter';
export default function RivalHistoryCard({ target, history = {}, grudge = 0, nemesisState }) {
  if (!target) return null;
  const active = Boolean(nemesisState?.active);
  return (
    <article className={`rival-history-card ${active ? 'nemesis-card' : ''}`}>
      <div>
        <p className="kicker">{active ? 'Nemesis' : 'Rival History'}</p>
        <h3>{target.bossName}</h3>
        <p>{target.crewName} • {target.attackStyle}</p>
      </div>
      <GrudgeMeter value={grudge} />
      {active && <div className="nemesis-badge">Nemesis • {nemesisState.grudgeLabel} grudge • Revenge Bonus {nemesisState.revengeBonusActive ? 'Active' : 'Inactive'}</div>}
      <div className="rival-history-grid">
        <span>You attacked <strong>{history.playerAttacks || 0}</strong></span>
        <span>They hit you <strong>{history.rivalAttacks || 0}</strong></span>
        <span>You stole <strong>${Number(history.cashStolenFromThem || 0).toLocaleString()}</strong></span>
        <span>They stole <strong>${Number(history.cashStolenFromYou || 0).toLocaleString()}</strong></span>
        <span>Revenge wins <strong>{history.revengeWins || 0}</strong></span>
        <span>Revenge losses <strong>{history.revengeLosses || 0}</strong></span>
        <span>Last event <strong>{history.lastEvent || 'No history yet'}</strong></span>
      </div>
    </article>
  );
}
