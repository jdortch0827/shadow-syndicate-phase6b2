import React from 'react';
import { getGrudgeTier } from '../logic/pvp';

export default function GrudgeMeter({ value = 0 }) {
  const tier = getGrudgeTier(value);
  return (
    <div className={`grudge-meter ${tier.className}`}>
      <div className="grudge-meter-row"><span>Grudge</span><strong>{tier.label}</strong></div>
      <div className="bar"><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
    </div>
  );
}
