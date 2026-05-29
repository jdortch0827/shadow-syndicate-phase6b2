import React, { useEffect, useState } from "react";
import {
  eventConfig,
  formatEventTime,
  getConcretePourPhase,
  getConcretePourState,
} from "../events/concretePourEventConfig";

export default function EventBanner() {
  const [eventState, setEventState] = useState(() => getConcretePourState());

  useEffect(() => {
    const timer = setInterval(() => {
      setEventState(getConcretePourState());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const phase = getConcretePourPhase(eventState);
  const heatPercent = Math.min(100, Math.max(0, eventState.cityHeat || 0));

  return (
    <section className="panel" style={{ marginBottom: 16 }}>
      <div className="panel-head">
        <div>
          <p className="kicker">{eventConfig.name}</p>
          <h2>{phase.name} Phase</h2>
          <p>{phase.rule}</p>
        </div>

        <div className="level-pill">
          <span>Phase Ends</span>
          <strong>{formatEventTime(phase.phaseEndsInMs)}</strong>
        </div>
      </div>

      <div className="mini-grid" style={{ marginBottom: 14 }}>
        <div className="stat">
          <span>Prize Pool</span>
          <strong>{eventConfig.prizePoolTribute.toLocaleString()}</strong>
          <small>Top 100 split Tribute</small>
        </div>

        <div className="stat">
          <span>Phase</span>
          <strong>{phase.name}</strong>
          <small>{phase.prepEndedEarly ? "Prep ended early" : "active"}</small>
        </div>

        <div className="stat">
          <span>Public Heat</span>
          <strong>{eventState.cityHeat || 0}/100</strong>
          <small>{phase.id === "prep" ? "100 ends Prep early" : "event pressure"}</small>
        </div>

        <div className="stat">
          <span>No Crates</span>
          <strong>Fair Play</strong>
          <small>cosmetic rewards only</small>
        </div>
      </div>

      <div className="progress">
        <div>
          <span>Public City Heat</span>
          <strong>{eventState.cityHeat || 0}/100</strong>
        </div>

        <div className="bar">
          <i style={{ width: `${heatPercent}%` }} />
        </div>
      </div>

      <p className="soft-text" style={{ marginTop: 12 }}>
        Monday story: {eventConfig.story.mondayStory}
      </p>
    </section>
  );
}