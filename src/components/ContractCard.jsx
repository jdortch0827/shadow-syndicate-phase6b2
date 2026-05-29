import React, { useState } from "react";
import {
  canStartContract,
  getAvailableContractCrew,
  getPropertyPowerBonus,
  openContractsConfig,
  resolveContract,
} from "../systems/openContracts";

export default function ContractCard({
  rival,
  player,
  onResolve,
}) {
  const [crewSent, setCrewSent] = useState(1);

  const availableCrew = getAvailableContractCrew(player);
  const propertyBonus = getPropertyPowerBonus(player, rival.district);
  const canStart = canStartContract(player, crewSent);

  function handleStartContract() {
    if (!canStart.ok) return;

    const result = resolveContract(player, rival, crewSent);

    onResolve?.({
      rival,
      crewSent,
      result,
    });
  }

  return (
    <div className="contract-card">
      <img
        src={rival.avatar}
        alt={rival.rivalName}
        className="contract-avatar"
      />

      <div className="contract-body">
        <div className="contract-top">
          <div>
            <p className="kicker">Open Contract</p>

            <h3>
              {rival.rivalName}
            </h3>

            <p>
              Level {rival.level} / {rival.bossClass}
            </p>
          </div>

          <span className="contract-power">
            {rival.power} Power
          </span>
        </div>

        <div className="contract-info-grid">
          <div className="info">
            <span>District</span>
            <strong>{rival.district}</strong>
          </div>

          <div className="info">
            <span>Cash Exposed</span>
            <strong>${Number(rival.cash || 0).toLocaleString()}</strong>
          </div>

          <div className="info">
            <span>Cost</span>
            <strong>{openContractsConfig.contractEnergyCost} Energy</strong>
          </div>

          <div className="info">
            <span>Crew Lock</span>
            <strong>{openContractsConfig.crewLockMinutes} min</strong>
          </div>

          <div className="info">
            <span>Available Crew</span>
            <strong>{availableCrew}</strong>
          </div>

          <div className="info">
            <span>Property Bonus</span>
            <strong>{propertyBonus.label}</strong>
          </div>
        </div>

        <div className="contract-crew-row">
          <button
            type="button"
            className="secondary"
            onClick={() => setCrewSent(Math.max(1, crewSent - 1))}
          >
            -
          </button>

          <div className="contract-crew-count">
            <strong>{crewSent}</strong>
            <span>Crew Sent</span>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={() => setCrewSent(Math.min(availableCrew, crewSent + 1))}
          >
            +
          </button>
        </div>

        {!canStart.ok && (
          <p className="soft-text">
            {canStart.reason}
          </p>
        )}

        <button
          type="button"
          className="danger big"
          disabled={!canStart.ok}
          onClick={handleStartContract}
        >
          Start Contract
        </button>

        <p className="soft-text">
          Winner steals 5% of the loser’s cash. Ties go to the defender. No crates. No bought power.
        </p>
      </div>
    </div>
  );
}