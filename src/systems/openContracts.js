const CONTRACT_ENERGY_COST = 2;
const CONTRACT_CREW_LOCK_MINUTES = 10;
const HOSPITAL_HEALTH_THRESHOLD = 20;
const HOSPITAL_DURATION_MINUTES = 15;

export const openContractsConfig = {
  contractEnergyCost: CONTRACT_ENERGY_COST,
  crewLockMinutes: CONTRACT_CREW_LOCK_MINUTES,
  hospitalHealthThreshold: HOSPITAL_HEALTH_THRESHOLD,
  hospitalDurationMinutes: HOSPITAL_DURATION_MINUTES,
  stealPercent: 0.05,
  ghostHideMinutesAfterHit: 5,
  tributeExpedite: {
    id: "expedite_contract_crew",
    name: "Expedite Crew",
    costTribute: 2,
    effect: "Returns locked contract crew in 1 minute instead of 10 minutes.",
    fairPlaySafe: true,
    reason:
      "This only speeds up crew return. It does not buy Power, Attack, Defense, Contracts, or PvP wins.",
  },
};

export function getCityControlBracket(cityControl) {
  if (cityControl < 25) return "0-25";
  if (cityControl < 50) return "25-50";
  if (cityControl < 75) return "50-75";
  return "75-100";
}

export function getPlayerPower(player) {
  if (typeof player.power === "number") return player.power;

  const attack = player.attack || 10;
  const defense = player.defense || 10;

  return Math.round((attack + defense) / 2);
}

export function isWithinPowerRange(playerPower, rivalPower) {
  const low = playerPower * 0.8;
  const high = playerPower * 1.2;

  return rivalPower >= low && rivalPower <= high;
}

export function isGhostHidden(rival, now = Date.now()) {
  if (rival.bossClass !== "ghost") return false;
  if (!rival.hiddenUntil) return false;

  return now < rival.hiddenUntil;
}

export function isInHospital(player, now = Date.now()) {
  if (!player.hospitalUntil) return false;
  return now < player.hospitalUntil;
}

export function getAvailableContractCrew(player, now = Date.now()) {
  const lockedCrew = (player.lockedCrew || []).filter((lock) => lock.unlocksAt > now).length;
  return Math.max(0, (player.crew || 0) - lockedCrew);
}

export function getEligibleContractTargets(player, rivals, now = Date.now()) {
  const playerPower = getPlayerPower(player);
  const playerBracket = getCityControlBracket(player.cityControl || 0);

  return rivals
    .filter((rival) => !isGhostHidden(rival, now))
    .filter((rival) => !isInHospital(rival, now))
    .filter((rival) => isWithinPowerRange(playerPower, rival.power))
    .filter((rival) => rival.cityControlBracket === playerBracket)
    .slice(0, 3);
}

export function getDistrictBonus(attacker, defenderDistrict) {
  const control = attacker.territory?.[defenderDistrict] || 0;

  if (control >= 75) return 15;
  if (control >= 50) return 10;
  if (control >= 25) return 5;

  return 0;
}

export function getPropertyPowerBonus(attacker, defenderDistrict) {
  const ownedProperties = attacker.properties || {};

  if (defenderDistrict === "docks" && ownedProperties.dockside_lot > 0) {
    return {
      multiplier: 1.15,
      label: "Dockside Lot logistics: +15% contract power",
    };
  }

  if (defenderDistrict === "southside" && ownedProperties.corner_shop > 0) {
    return {
      multiplier: 1.1,
      label: "Corner Shop street network: +10% contract power",
    };
  }

  if (defenderDistrict === "riverside" && ownedProperties.auto_garage > 0) {
    return {
      multiplier: 1.15,
      label: "Auto Garage route control: +15% contract power",
    };
  }

  return {
    multiplier: 1,
    label: "No property bonus active",
  };
}

export function canStartContract(player, crewSent = 1, now = Date.now()) {
  if (isInHospital(player, now)) {
    return {
      ok: false,
      reason: "You are in hospital and cannot start a contract yet.",
    };
  }

  if ((player.energy || 0) < CONTRACT_ENERGY_COST) {
    return {
      ok: false,
      reason: `You need ${CONTRACT_ENERGY_COST} Energy to start a contract.`,
    };
  }

  if (crewSent < 1) {
    return {
      ok: false,
      reason: "Send at least 1 crew member.",
    };
  }

  if (getAvailableContractCrew(player, now) < crewSent) {
    return {
      ok: false,
      reason: "Not enough available crew. Some crew are already locked on contracts.",
    };
  }

  return {
    ok: true,
    reason: "",
  };
}

export function lockContractCrew(player, crewSent, now = Date.now()) {
  const locks = Array.from({ length: crewSent }).map((_, index) => ({
    id: `contract_lock_${now}_${index}`,
    type: "contract",
    lockedAt: now,
    unlocksAt: now + CONTRACT_CREW_LOCK_MINUTES * 60 * 1000,
  }));

  return {
    ...player,
    lockedCrew: [...(player.lockedCrew || []), ...locks],
  };
}

export function sendToHospital(player, now = Date.now()) {
  return {
    ...player,
    hospitalUntil: now + HOSPITAL_DURATION_MINUTES * 60 * 1000,
  };
}

export function applyGhostHide(defender, now = Date.now()) {
  if (defender.bossClass !== "ghost") return defender;

  return {
    ...defender,
    hiddenUntil: now + openContractsConfig.ghostHideMinutesAfterHit * 60 * 1000,
  };
}

/**
 * Resolves one Open Contract fight.
 *
 * No random roll.
 * Ties go to defender.
 * Winner steals 5% of loser cash.
 * Loser receives one free Retaliation Contract.
 */
export function resolveContract(attacker, defender, crewSent = 1) {
  const defenderDistrict = defender.district || "southside";
  const attackerBasePower = getPlayerPower(attacker);
  const defenderBasePower = getPlayerPower(defender);

  const districtBonus = getDistrictBonus(attacker, defenderDistrict);
  const propertyBonus = getPropertyPowerBonus(attacker, defenderDistrict);

  const attackerPower = Math.round(
    ((attackerBasePower * crewSent) + districtBonus) * propertyBonus.multiplier
  );

  const defenderPower = defenderBasePower;

  const won = attackerPower > defenderPower;

  const cashStolen = won
    ? Math.floor((defender.cash || 0) * openContractsConfig.stealPercent)
    : Math.floor((attacker.cash || 0) * openContractsConfig.stealPercent);

  const heatGain = 8 + crewSent * 2;

  return {
    won,
    cashStolen,
    heatGain,
    attackerPower,
    defenderPower,
    crewSent,
    districtBonus,
    propertyBonusLabel: propertyBonus.label,
    winner: won ? attacker.bossName || attacker.name || "Attacker" : defender.bossName || defender.name || "Defender",
    loser: won ? defender.bossName || defender.name || "Defender" : attacker.bossName || attacker.name || "Attacker",
    retaliationContract: {
      id: `retaliation_${Date.now()}`,
      costEnergy: 0,
      expiresInMinutes: 60,
      targetName: won
        ? attacker.bossName || attacker.name || "Attacker"
        : defender.bossName || defender.name || "Defender",
      reason: "Retaliation Contract: one free hit back because you lost cash.",
    },
  };
}

export function applyContractResult(attacker, defender, result, now = Date.now()) {
  let nextAttacker = {
    ...attacker,
    energy: Math.max(0, (attacker.energy || 0) - CONTRACT_ENERGY_COST),
    heat: Math.min(100, (attacker.heat || 0) + result.heatGain),
  };

  let nextDefender = applyGhostHide(defender, now);

  nextAttacker = lockContractCrew(nextAttacker, result.crewSent, now);

  if (result.won) {
    nextAttacker.cash = (nextAttacker.cash || 0) + result.cashStolen;
    nextDefender.cash = Math.max(0, (nextDefender.cash || 0) - result.cashStolen);
    nextDefender.retaliationContracts = [
      ...(nextDefender.retaliationContracts || []),
      result.retaliationContract,
    ];
  } else {
    nextAttacker.cash = Math.max(0, (nextAttacker.cash || 0) - result.cashStolen);
    nextDefender.cash = (nextDefender.cash || 0) + result.cashStolen;
    nextAttacker.retaliationContracts = [
      ...(nextAttacker.retaliationContracts || []),
      result.retaliationContract,
    ];
  }

  if ((nextAttacker.health || 100) < HOSPITAL_HEALTH_THRESHOLD) {
    nextAttacker = sendToHospital(nextAttacker, now);
  }

  if ((nextDefender.health || 100) < HOSPITAL_HEALTH_THRESHOLD) {
    nextDefender = sendToHospital(nextDefender, now);
  }

  return {
    attacker: nextAttacker,
    defender: nextDefender,
  };
}

export function expediteContractCrew(player, lockId, now = Date.now()) {
  if ((player.tribute || 0) < openContractsConfig.tributeExpedite.costTribute) {
    return {
      ok: false,
      player,
      reason: "Not enough Tribute.",
    };
  }

  return {
    ok: true,
    reason: "Crew expedited. They return in 1 minute.",
    player: {
      ...player,
      tribute: player.tribute - openContractsConfig.tributeExpedite.costTribute,
      lockedCrew: (player.lockedCrew || []).map((lock) =>
        lock.id === lockId
          ? {
              ...lock,
              unlocksAt: now + 60 * 1000,
              expedited: true,
            }
          : lock
      ),
    },
  };
}