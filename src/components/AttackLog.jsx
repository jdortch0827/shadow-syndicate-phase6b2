import React from 'react';

export default function AttackLog({ items = [] }) {
  const list = Array.isArray(items) ? items.slice(0, 12) : [];
  return (
    <div className="attack-log-list">
      {list.length === 0 ? <p className="soft-text">No PvP-style moves recorded yet. Hit a target or get tested to start a history.</p> : list.map((item) => (
        <div key={item.id || `${item.time}-${item.text}`} className="attack-log-item">
          <strong>{item.title || 'Street Report'}</strong>
          <p>{item.text}</p>
          <small>{item.timeText || 'just now'}</small>
        </div>
      ))}
    </div>
  );
}
