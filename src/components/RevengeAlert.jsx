export default function RevengeAlert({ revenge, nemesisCount = 0, onRetaliate, onOpen }) {
  if (!revenge && !nemesisCount) return null;
  const title = revenge ? 'You Got Hit' : 'Nemesis Watching';
  const rival = revenge?.rivalName || 'A rival crew';
  return (
    <section className="revenge-alert">
      <div>
        <p className="kicker">Revenge Hook</p>
        <h3>{title}</h3>
        <p>{revenge ? `${rival} took from you. The city is watching to see if you answer back.` : `${nemesisCount} personal rival${nemesisCount === 1 ? '' : 's'} are watching your crew.`}</p>
        {revenge && <p className="soft-text">Revenge Bonus Active: bonus cash, bonus respect, and extra grudge impact.</p>}
      </div>
      <div className="button-row compact-row">
        {revenge && <button type="button" className="danger" onClick={() => onRetaliate?.(revenge)}>Retaliate</button>}
        <button type="button" className="secondary" onClick={onOpen}>Open Fight Hub</button>
      </div>
    </section>
  );
}
