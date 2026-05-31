import React from "react";

export default function RewardToast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="reward-toast" role="status" aria-live="polite">
      <div>
        <p className="kicker">Result</p>
        <strong>{message.title || "Move Complete"}</strong>
        <span>{message.detail || String(message)}</span>
      </div>
      <button type="button" className="secondary compact-button" onClick={onClose}>Dismiss</button>
    </div>
  );
}
