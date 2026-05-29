import React, { useEffect, useState } from "react";
import {
  callOutBoss,
  eventConfig,
  getBossMarkedStatus,
  getConcretePourPhase,
  getConcretePourState,
} from "../events/concretePourEventConfig";

export default function ReputationCallOutButton({
  currentBossName = "Rookie",
  targetBossId,
  targetBossName = "Unknown Boss",
}) {
  const [eventState, setEventState] = useState(() => getConcretePourState());
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setEventState(getConcretePourState());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const phase = getConcretePourPhase(eventState);
  const targetKey = targetBossId || targetBossName;
  const callOuts = eventState.callOutsByTarget?.[targetKey] || [];
  const alreadyCalled = callOuts.some((item) => item.callerBossName === currentBossName);
  const markedStatus = getBossMarkedStatus(targetBossId, targetBossName, eventState);
  const needed = Math.max(0, eventConfig.reputationWall.minCallOutsToMark - callOuts.length);
  const callOutsMatter = phase.id === "pour";

  function handleCallOut() {
    const result = callOutBoss({
      callerBossName: currentBossName,
      targetBossId,
      targetBossName,
    });

    setEventState(result.state);
    setMessage(result.message);
  }

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-head">
        <div>
          <h3>Reputation Call Out</h3>
          <p>
            Call-outs turn trash talk into mechanics. If 3+ players call out {targetBossName},
            that boss becomes Marked for 24h.
          </p>
        </div>

        <span>
          {markedStatus.marked ? "Marked" : `${callOuts.length}/3`}
        </span>
      </div>

      <div className="card-body">
        <InfoLine label="Current Phase" value={phase.name} />
        <InfoLine label="Target" value={targetBossName} />
        <InfoLine label="Call Outs" value={`${callOuts.length}/${eventConfig.reputationWall.minCallOutsToMark}`} />
        <InfoLine
          label="Needed"
          value={markedStatus.marked ? "Target is Marked" : `${needed}/3 players needed to Mark`}
        />
        <InfoLine
          label="Status"
          value={markedStatus.marked ? `Marked: ${markedStatus.timeLeft} left` : "Not Marked"}
        />

        {!callOutsMatter && (
          <p className="soft-text">
            Call-outs are active now, but they matter most during the Pour phase when Marked targets give 10x Contract Influence.
          </p>
        )}

        {message && (
          <p className="soft-text" style={{ color: "#fbbf24", fontWeight: 800 }}>
            {message}
          </p>
        )}

        <button
          className={alreadyCalled ? "secondary" : "danger"}
          onClick={handleCallOut}
          disabled={alreadyCalled || currentBossName === targetBossName}
        >
          {alreadyCalled ? "Already Called Out" : `Call Out ${targetBossName}`}
        </button>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}