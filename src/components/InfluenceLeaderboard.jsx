import React, { useEffect, useMemo, useState } from "react";
import {
  eventConfig,
  getConcretePourLeaderboard,
  getConcretePourPhase,
  getConcretePourState,
} from "../events/concretePourEventConfig";

export default function InfluenceLeaderboard({ playerBossName = "Rookie" }) {
  const [eventState, setEventState] = useState(() => getConcretePourState());

  useEffect(() => {
    const timer = setInterval(() => {
      setEventState(getConcretePourState());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const phase = getConcretePourPhase(eventState);

  const rows = useMemo(() => {
    return getConcretePourLeaderboard(playerBossName);
  }, [playerBossName, eventState]);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="kicker">Concrete Pour</p>
          <h2>Southside Influence Leaderboard</h2>
          <p>
            Phase: {phase.name}. {phase.rule}
          </p>
        </div>
      </div>

      <div className="mini-grid" style={{ marginBottom: 16 }}>
        <div className="stat">
          <span>Prize Pool</span>
          <strong>{eventConfig.prizePoolTribute.toLocaleString()}</strong>
          <small>Tribute split by Top 100</small>
        </div>

        <div className="stat">
          <span>Public Heat</span>
          <strong>{eventState.cityHeat || 0}/100</strong>
          <small>Prep can end at 100</small>
        </div>

        <div className="stat">
          <span>Most Contracts</span>
          <strong>Enforcer</strong>
          <small>cosmetic skin</small>
        </div>

        <div className="stat">
          <span>Most Heat</span>
          <strong>Fireproof</strong>
          <small>cosmetic title</small>
        </div>
      </div>

      <div className="log-list">
        <div className="log-item" style={{ fontWeight: 800 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr 120px 110px 110px",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span>Rank</span>
            <span>Name</span>
            <span>Influence</span>
            <span>Contracts</span>
            <span>Heat Given</span>
          </div>
        </div>

        {rows.map((row) => (
          <div
            key={row.bossName}
            className="log-item"
            style={{
              borderColor: row.isPlayer ? "rgba(245, 158, 11, 0.65)" : undefined,
              background: row.isPlayer ? "rgba(245, 158, 11, 0.1)" : undefined,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 120px 110px 110px",
                gap: 12,
                alignItems: "center",
              }}
            >
              <strong>#{row.rank}</strong>

              <div>
                <strong>
                  {row.bossName}
                  {row.isPlayer ? " (You)" : ""}
                </strong>

                <div style={{ color: "#a1a1aa", fontSize: 12, marginTop: 4 }}>
                  {row.enforcerSkinEligible ? "Enforcer Skin Eligible" : ""}
                  {row.enforcerSkinEligible && row.fireproofEligible ? " / " : ""}
                  {row.fireproofEligible ? "Fireproof Title Eligible" : ""}
                </div>
              </div>

              <span>{(row.influence || 0).toLocaleString()}</span>
              <span>{row.contractsIssued || 0}</span>
              <span>{row.heatGiven || 0}</span>
            </div>

            <div style={{ marginTop: 6, color: "#a1a1aa", fontSize: 13 }}>
              Projected Top 100 reward: {row.projectedTribute || 0} Tribute
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}