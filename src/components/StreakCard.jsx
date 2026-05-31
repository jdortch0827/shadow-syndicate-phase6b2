export default function StreakCard({ streaks = [] }) {
  if (!streaks.length) return null;
  return (
    <section className="streak-panel">
      <div className="section-heading-row">
        <div>
          <p className="kicker">Momentum</p>
          <h3>Active Streaks</h3>
        </div>
      </div>
      <div className="streak-grid">
        {streaks.map((item) => (
          <article key={item.id} className="streak-card">
            <strong>{item.value}</strong>
            <span>{item.title}</span>
            <small>{item.detail}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
