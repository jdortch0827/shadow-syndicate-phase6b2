import React from 'react';
import { defensePostures } from '../logic/pvp';

export default function DefenseSetup({ selected = 'balanced', cash = 0, onSelect }) {
  return (
    <div className="defense-setup-grid">
      {defensePostures.map((posture) => {
        const active = posture.id === selected;
        const disabled = Number(cash || 0) < Number(posture.cost || 0);
        return (
          <button key={posture.id} className={`defense-posture-card ${active ? 'active' : ''}`} disabled={disabled} onClick={() => onSelect(posture)} type="button">
            <strong>{posture.name}</strong>
            <span>{posture.desc}</span>
            <small>{posture.cost ? `$${posture.cost.toLocaleString()} setup` : 'No setup cost'} • Defense {Math.round((posture.defenseMod || 0) * 100)}%</small>
          </button>
        );
      })}
    </div>
  );
}
