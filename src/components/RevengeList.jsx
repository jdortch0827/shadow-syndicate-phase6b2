import React from 'react';

export default function RevengeList({ items = [], onRetaliate }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="revenge-list">
      {list.length === 0 ? <p className="soft-text">Nobody is owed yet. That will change once someone hits you or a rivalry turns ugly.</p> : list.map((item) => (
        <article key={item.id} className="revenge-card">
          <div><p className="kicker">Revenge Available</p><h3>{item.bossName}</h3><p>{item.reason}</p></div>
          <div className="stat-grid mini"><span>Took <strong>${Number(item.cashTaken || 0).toLocaleString()}</strong></span><span>Power <strong>{item.powerScore}</strong></span><span>Reward <strong>{item.reward}</strong></span><span>Risk <strong>{item.risk}</strong></span></div>
          <button className="danger" type="button" onClick={() => onRetaliate(item)}>Retaliate</button>
        </article>
      ))}
    </div>
  );
}
