export default function EmpireDetails({ stats = [], defaultOpen = false }) {
  return (
    <details className="empire-details" open={defaultOpen}>
      <summary>Empire Details</summary>
      <div className="empire-details-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="mini-info-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            {stat.helper && <small>{stat.helper}</small>}
          </div>
        ))}
      </div>
    </details>
  );
}
