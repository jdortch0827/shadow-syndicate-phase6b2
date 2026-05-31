import React from "react";

export default function ActionResultCard({ result, onClose }) {
  if (!result) return null;
  const details = Array.isArray(result.details) ? result.details : [];

  return (
    <div className="action-result-card" role="status" aria-live="polite">
      <div>
        <p className="kicker">{result.type || "Action Result"}</p>
        <h3>{result.title || "Move Complete"}</h3>
        <p>{result.flavor || result.detail || "The city changed because of your move."}</p>
        {!!details.length && (
          <div className="action-result-details">
            {details.map((detail, index) => (
              <span key={`${detail}-${index}`}>{detail}</span>
            ))}
          </div>
        )}
      </div>
      <button type="button" className="secondary compact-button" onClick={onClose}>Dismiss</button>
    </div>
  );
}
