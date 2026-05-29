import React, { useEffect, useState } from "react";
import {
  callOutBoss,
  eventConfig,
  getBossMarkedStatus,
  getConcretePourState,
} from "../events/concretePourEventConfig";

export default function ReputationCallOutButton({
  currentBossName = "Rookie",
  targetBossId,
  targetBossName = "Unknown Boss",
}) {
  const [eventState, setEventState] = useState(() => getConcretePourState());

  useEffect(() => {
    const timer = setInterval(() => setEventState(getConcretePourState()), 1000 * 10);
    return () => clearInterval(timer);
  }, []);

  const targetKey = targetBossId || targetBossName;
  const callOuts = eventState.callOutsByTarget?.[targetKey] || [];
  const alreadyCalled = callOuts.some((item) => item.callerBossName === currentBossName);
  const markedStatus = getBossMarkedStatus(targetBossId, targetBossName, eventState);
  const needed = Math.max(0, eventConfig.reputationWall.minCallOutsToMark - callOuts.length);

  function handleCallOut() {
    if (currentBossName === targetBossName) return;

    const result = callOutBoss({
      callerBossName: currentBossName,
      targetBossId,
      targetBossName,
    });

    setEventState(result.state);
  }

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-head">
        <div>
          <h3>Reputation Call Out</h3>
          <p>
            Call-outs turn trash talk into mechanics. If 3+ players call out {targetBossName},
            they become Marked and lose 10% defense for 24h.
          </p>
        </div>

        <span>{markedStatus.marked ? "Marked" : `${callOuts.length}/3`}</span>
      </div>

      <div className="card-body">
        <div className="info">
          <span>Target</span>
          <strong>{targetBossName}</strong>
        </div>

        <div className="info">
          <span>Call Outs</span>
          <strong>{callOuts.length}/{eventConfig.reputationWall.minCallOutsToMark}</strong>
        </div>

        <div className="info">
          <span>Needed</span>
          <strong>
            {markedStatus.marked
              ? "Target is Marked"
              : `${needed}/3 players needed to Mark`}
          </strong>
        </div>

        <div className="info">
          <span>Status</span>
          <strong>
            {markedStatus.marked
              ? `Marked: ${markedStatus.timeLeft} left`
              : "Not Marked"}
          </strong>
        </div>

        <button
          className={alreadyCalled ? "secondary" : "danger"}
          onClick={handleCallOut}
          disabled={alreadyCalled || currentBossName === targetBossName}
        >
          {alreadyCalled ? "Already Called Out" : `Call Out ${targetBossName}`}
        </button>

        <p className="soft-text">
          Phase 2 uses Marked status for targeting. If the street wants someone hit,
          the wall makes it official.
        </p>
      </div>
    </div>
  );
}