import React from 'react';
export default function WhileYouWereGoneCard({ event, onClose, onOpenPvp }) {
  if (!event) return null;
  return (
    <section className="while-away-card">
      <div>
        <p className="kicker">While You Were Gone</p>
        <h3>{event.title}</h3>
        <p>{event.flavor}</p>
        <div className="result-detail-list">{(event.details || []).map((detail) => <span key={detail}>{detail}</span>)}</div>
      </div>
      <div className="button-row compact-row">
        <button className="secondary" type="button" onClick={onOpenPvp}>Open PvP</button>
        <button className="primary" type="button" onClick={onClose}>Dismiss</button>
      </div>
    </section>
  );
}
