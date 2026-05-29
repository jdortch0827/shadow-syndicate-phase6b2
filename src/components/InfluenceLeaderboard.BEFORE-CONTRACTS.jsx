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
    const timer = setInterval(() => setEventState(getConcretePourState()), 1000 * 10);
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
          <span>City Heat</span>
          <strong>{eventState.cityHeat || 0}/100</strong>
          <small>Contracts raise heat for everyone</small>
        </div>

        <div className="stat">
          <span>Top 10 Contract Reward</span>
          <strong>Enforcer Skin</strong>
          <small>Cosmetic only</small>
        </div>
      </div>

      <div className="log-list">
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
                gridTemplateColumns: "60px 1fr 100px 110px",
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

                {row.enforcerSkinEligible && (
                  <div style={{ color: "#fbbf24", fontSize: 12, marginTop: 4 }}>
                    Enforcer Skin Eligible
                  </div>
                )}
              </div>

              <span>{row.influence.toLocaleString()} Influence</span>

              <span>Contracts: {row.contractsIssued || 0}</span>
            </div>

            <div style={{ marginTop: 6, color: "#a1a1aa", fontSize: 13 }}>
              Projected reward: {row.projectedTribute} Tribute
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}