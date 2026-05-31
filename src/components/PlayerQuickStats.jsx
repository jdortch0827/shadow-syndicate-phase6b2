import React from "react";
export default function PlayerQuickStats({ stats = [], children }) {
  const visible = stats.filter(Boolean);
  return (
    <section className="hud simplified-hud player-quick-stats" aria-label="Player quick stats">
      {visible.map((stat) => (
        <div key={stat.id} className={`stat ${stat.warning ? "warning" : ""}`}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          {stat.helper && <small>{stat.helper}</small>}
        </div>
      ))}
      {children}
    </section>
  );
}
