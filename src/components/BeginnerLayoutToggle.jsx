export default function BeginnerLayoutToggle({ enabled, onToggle }) {
  return (
    <button type="button" className={`beginner-toggle ${enabled ? 'on' : 'off'}`} onClick={onToggle}>
      <div>
        <strong>Beginner Layout: {enabled ? 'On' : 'Off'}</strong>
        <span>{enabled ? 'Simplified stats, fewer tabs, and extra guidance.' : 'Advanced details are easier to see.'}</span>
      </div>
      <span>{enabled ? 'On' : 'Off'}</span>
    </button>
  );
}
