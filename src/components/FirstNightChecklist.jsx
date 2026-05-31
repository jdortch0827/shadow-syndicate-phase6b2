import React from "react";

export default function FirstNightChecklist({ progress, onNavigate }) {
  if (!progress?.items?.length) return null;
  const nextItem = progress.nextItem;

  return (
    <section className="first-night-card">
      <div className="section-heading-row">
        <div>
          <p className="kicker">First Night in the City</p>
          <h3>{progress.completedCount}/{progress.totalCount} first-night moves complete</h3>
          <p className="soft-text">A simple path for the first 10 minutes. It guides new players without blocking experienced players.</p>
        </div>
        <button className="primary" type="button" onClick={() => onNavigate(nextItem?.tab || "missions")}>
          Next Move
        </button>
      </div>

      <div className="first-night-next">
        <span>Next open item</span>
        <strong>{nextItem?.done ? "First night path complete" : nextItem?.title}</strong>
        <p>{nextItem?.done ? "Keep building the empire from the Mission Board." : nextItem?.rewardText}</p>
      </div>

      <div className="first-night-list">
        {progress.items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`first-night-row ${item.done ? "done" : "open"}`}
            onClick={() => onNavigate(item.tab || "command")}
          >
            <span>{item.done ? "Done" : "Open"}</span>
            <div>
              <strong>{item.title}</strong>
              <small>{item.rewardText}</small>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
