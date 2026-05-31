import React from "react";
export default function JobChoicePanel({ choices = [], selected, onSelect }) {
  return (
    <div className="job-choice-panel">
      {choices.map((choice) => (
        <button key={choice.id} type="button" className={`job-choice ${selected === choice.id ? 'active' : ''}`} onClick={() => onSelect?.(choice.id)}>
          <strong>{choice.label}</strong>
          <span>{choice.desc}</span>
        </button>
      ))}
    </div>
  );
}
