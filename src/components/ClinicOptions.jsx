import React from "react";

function money(value) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

export default function ClinicOptions({ options = [], health = 0, maxHealth = 100, onUse }) {
  return (
    <div className="clinic-options-panel">
      <section className="clinic-status-card">
        <div>
          <p className="kicker">Boss Condition</p>
          <h3>{health <= 0 ? "You Got Dropped" : `${health}/${maxHealth} Health`}</h3>
          <p className="soft-text">
            {health <= 0
              ? "Recover before making risky moves. The streets remember weakness, but they also respect survival."
              : "Choose the treatment that fits your cash, heat, and risk level."}
          </p>
        </div>
      </section>

      <div className="clinic-option-grid">
        {options.map((option) => (
          <article key={option.id} className={`clinic-option-card ${option.emergency ? "emergency" : ""}`}>
            <div>
              <p className="kicker">{option.emergency ? "Emergency" : "Treatment"}</p>
              <h3>{option.title}</h3>
              <p>{option.desc}</p>
              <div className="clinic-option-stats">
                <span>Cost <strong>{money(option.cost)}</strong></span>
                <span>Heal <strong>{option.full ? "Full" : `+${option.healAmount}`}</strong></span>
                {option.heatReduction > 0 && <span>Heat <strong>-{option.heatReduction}</strong></span>}
                {option.loyaltyLoss > 0 && <span>Loyalty <strong>-{option.loyaltyLoss}</strong></span>}
              </div>
              <small>{option.consequence}</small>
            </div>
            <button className={option.emergency ? "danger" : "primary"} type="button" disabled={option.disabled} onClick={() => onUse(option.id)}>
              {option.disabled ? "Unavailable" : "Use Treatment"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
