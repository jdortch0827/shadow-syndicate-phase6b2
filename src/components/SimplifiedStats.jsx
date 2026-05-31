export default function SimplifiedStats({ stats = [], beginner = true, children }) {
  const core = stats.filter((s) => s.core || !beginner);
  return (
    <section className="hud simplified-hud">
      {core.map((stat) => (
        <div key={stat.id} className={`stat ${stat.warning ? 'warning' : ''}`}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          {stat.helper && <small>{stat.helper}</small>}
        </div>
      ))}
      {children}
    </section>
  );
}
