import React, { useEffect, useMemo, useState } from "react";
import {
  bossHasDeputizedCrew,
  deputizeConcretePourCrew,
  eventConfig,
  formatEventTime,
  getBossInfluence,
  getConcretePourPhase,
  getConcretePourState,
  removeConcretePourDeputy,
} from "../events/concretePourEventConfig";

export default function EventBanner({ game, setGame }) {
  const bossName = game?.bossName || game?.playerName || "Rookie";
  const [eventState, setEventState] = useState(() => getConcretePourState());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      setEventState(getConcretePourState());
    }, 1000 * 15);

    return () => clearInterval(timer);
  }, []);

  const phase = useMemo(() => getConcretePourPhase(eventState, now), [eventState, now]);
  const influence = getBossInfluence(bossName, eventState);
  const deputized = bossHasDeputizedCrew(bossName, eventState);

  function toggleDeputy() {
    if (!deputized && (game?.crew || 0) < 1) {
      setGame?.((old) => ({
        ...old,
        log: [
          "You need at least 1 crew member to deputize for Concrete Pour.",
          ...(old.log || []),
        ].slice(0, 12),
      }));
      return;
    }

    const nextState = deputized
      ? removeConcretePourDeputy(bossName)
      : deputizeConcretePourCrew(bossName);

    setEventState(nextState);

    setGame?.((old) => ({
      ...old,
      eventDeputizedCrew: !deputized,
      log: [
        deputized
          ? "Concrete Pour deputy removed. Crew member returned to fight duty."
          : "Concrete Pour deputy assigned. +5% Influence, but that crew member cannot be used in fights.",
        ...(old.log || []),
      ].slice(0, 12),
    }));
  }

  return (
    <section className="panel" style={{ borderColor: "rgba(245, 158, 11, 0.55)" }}>
      <div className="panel-head">
        <div>
          <p className="kicker">72-Hour Turf War</p>
          <h2>{eventConfig.story.headline}</h2>
          <p>{eventConfig.story.subhead}</p>
        </div>
      </div>

      <div className="mini-grid">
        <div className="stat">
          <span>Phase</span>
          <strong>{phase.name}</strong>
          <small>{phase.rule}</small>
        </div>

        <div className="stat">
          <span>Time Left</span>
          <strong>{formatEventTime(phase.eventEndsAt - now)}</strong>
          <small>Concrete Pour ends after 72 hours</small>
        </div>

        <div className="stat">
          <span>Your Influence</span>
          <strong>{influence}</strong>
          <small>Top 100 split {eventConfig.prizePoolTribute.toLocaleString()} Tribute</small>
        </div>

        <div className="stat">
          <span>Deputy</span>
          <strong>{deputized ? "Active" : "None"}</strong>
          <small>{deputized ? "+5% Influence" : "Assign 1 crew member"}</small>
        </div>
      </div>

      <div className="button-row">
        <button className={deputized ? "secondary" : "primary"} onClick={toggleDeputy}>
          {deputized ? "Remove Deputy" : "Deputize Crew"}
        </button>
      </div>

      <p className="soft-text">{eventConfig.story.mondayStory}</p>
    </section>
  );
}