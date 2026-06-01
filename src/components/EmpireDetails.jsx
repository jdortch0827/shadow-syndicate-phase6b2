import React from "react";

export default function EmpireDetails({ stats = [], defaultOpen = false, onToggle, showToggle = false, homeMode = false }) {
  const details = stats.filter(Boolean);

  if (showToggle) {
    return (
      <section className={`empire-details-wrap ${homeMode ? "home-empire-details" : ""}`}>
        <div className="empire-details-toolbar single-empire-toggle">
          <div>
            <strong>Empire Details</strong>
            <span>Full stats, progress, and advanced numbers live here so Home stays action-first.</span>
          </div>
          <button type="button" className="secondary compact-button" onClick={onToggle}>
            {defaultOpen ? "Hide Full Stats" : "View Full Stats"}
          </button>
        </div>

        {defaultOpen && (
          <div className="empire-details open-empire-details" aria-label="Full empire details">
            <div className="empire-details-grid">
              {details.map((stat) => (
                <div key={stat.id} className="mini-info-card">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  {stat.helper && <small>{stat.helper}</small>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className={`empire-details-wrap ${homeMode ? "home-empire-details" : ""}`}>
      <details className="empire-details" open={defaultOpen}>
        <summary>{defaultOpen ? "Full Empire Details" : "Open Full Empire Details"}</summary>
        <div className="empire-details-grid">
          {details.map((stat) => (
            <div key={stat.id} className="mini-info-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              {stat.helper && <small>{stat.helper}</small>}
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
