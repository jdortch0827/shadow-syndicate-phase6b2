export default function MockStoreItemCard({ item, tribute = 0, owned = 0, onPurchase }) {
  const blocked = Number(tribute || 0) < Number(item.costTribute || 0);
  const missing = Math.max(0, Number(item.costTribute || 0) - Number(tribute || 0));
  return (
    <article className="mock-store-card">
      <div>
        <p className="kicker">{item.category}</p>
        <h3>{item.title}</h3>
        <p>{item.desc}</p>
        <p className="soft-text">{item.effect}</p>
      </div>
      <div className="store-card-footer">
        <span>{item.costTribute} Tribute</span>
        {owned > 0 && <small>Purchased {owned}x</small>}
        <button type="button" className={blocked ? 'secondary' : 'primary'} onClick={() => onPurchase?.(item)}>
          {blocked ? `Need ${missing} Tribute` : 'Purchase'}
        </button>
      </div>
    </article>
  );
}
