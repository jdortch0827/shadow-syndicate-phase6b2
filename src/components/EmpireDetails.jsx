export default function EmpireDetails({ stats = [], defaultOpen = false, onToggle, showToggle = false, homeMode = false }) {
  const details = stats.filter(Boolean);
  return (
    <section className={`empire-details-wrap ${homeMode ? "home-empire-details" : ""}`}>
      {showToggle && (
        <div className="empire-details-toolbar">
          <div>
            <strong>Empire Details</strong>
            <span>Advanced stats live here so Home stays clean.</span>
          </div>
          <button type="button" className="secondary compact-button" onClick={onToggle}>
            {defaultOpen ? "Hide Advanced Stats" : "Show Advanced Stats"}
          </button>
        </div>
      )}
      <details className="empire-details" open={defaultOpen}>
        <summary>{defaultOpen ? "Hide Full Empire Details" : "Open Full Empire Details"}</summary>
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
