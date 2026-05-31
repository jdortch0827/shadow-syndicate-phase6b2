import React from 'react';
export default function EmptyState({ title, children, actionLabel, onAction }) {
  return (
    <section className="empty-state-card">
      <p className="kicker">Nothing here yet</p>
      <h3>{title}</h3>
      <div className="soft-text">{children}</div>
      {actionLabel && onAction && <button className="secondary" type="button" onClick={onAction}>{actionLabel}</button>}
    </section>
  );
}
