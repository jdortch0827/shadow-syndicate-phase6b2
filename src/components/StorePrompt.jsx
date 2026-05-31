import React from "react";
export default function StorePrompt({ prompt, onOpen, onDismiss }) {
  if (!prompt) return null;
  return (
    <section className="store-prompt-card">
      <div>
        <p className="kicker">Helpful Option</p>
        <h3>{prompt.title}</h3>
        <p>{prompt.detail}</p>
      </div>
      <div className="button-row compact-row">
        <button type="button" className="primary" onClick={onOpen}>Go to Store</button>
        {onDismiss && <button type="button" className="secondary" onClick={onDismiss}>Wait</button>}
      </div>
    </section>
  );
}
