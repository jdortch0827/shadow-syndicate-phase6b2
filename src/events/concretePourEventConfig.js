export const eventConfig = {
  id: "concrete_pour_southside",
  name: "Concrete Pour: Southside",
  districtId: "southside",
  durationHours: 72,
  prizePoolTribute: 10000,
  rewardEligibleRank: 100,
  noCrates: true,

  rewards: {
    top100: {
      type: "tribute_split",
      prizePoolTribute: 10000,
      eligibleRank: 100,
      label: "Top 100 Influence players split 10,000 Tribute.",
    },
    mostContractsIssued: {
      type: "cosmetic",
      cosmeticId: "enforcer_boss_skin_concrete_pour",
      name: "Enforcer Skin",
      label: "Most Contracts Issued earns the exclusive Enforcer skin. Cosmetic only.",
      fairPlaySafe: true,
      power: 0,
      attack: 0,
      defense: 0,
    },
    mostHeatAbsorbed: {
      type: "cosmetic_title",
      title: "Fireproof",
      label: 'Most Heat Absorbed earns the "Fireproof" ContractCard title. Cosmetic only.',
      fairPlaySafe: true,
      power: 0,
      attack: 0,
      defense: 0,
    },
  },

  phases: [
    {
      id: "prep",
      name: "Prep",
      startsAtHour: 0,
      endsAtHour: 24,
      rule: "Contracts issued in Southside give 5x Influence. Each Contract adds +1 public City Heat. At Heat 100, Prep ends early.",
      contractInfluenceMultiplier: 5,
      markedInfluenceMultiplier: 1,
      retaliationInfluenceMultiplier: 0,
      southsideContractsOnly: true,
      retaliationOnly: false,
      cityHeatPerContract: 1,
      phaseEndsEarlyAtHeat: 100,
    },
    {
      id: "pour",
      name: "Pour",
      startsAtHour: 24,
      endsAtHour: 48,
      rule: "Call-outs matter. If 3+ players call out the same boss, that boss is Marked for 24h. Marked targets give 10x Contract Influence.",
      contractInfluenceMultiplier: 1,
      markedInfluenceMultiplier: 10,
      retaliationInfluenceMultiplier: 0,
      southsideContractsOnly: false,
      retaliationOnly: false,
      cityHeatPerContract: 0,
      phaseEndsEarlyAtHeat: null,
    },
    {
      id: "cure",
      name: "Cure",
      startsAtHour: 48,
      endsAtHour: 72,
      rule: "Only Retaliation Contracts give Influence. Retaliation Contracts give 15x Influence.",
      contractInfluenceMultiplier: 0,
      markedInfluenceMultiplier: 0,
      retaliationInfluenceMultiplier: 15,
      southsideContractsOnly: false,
      retaliationOnly: true,
      cityHeatPerContract: 0,
      phaseEndsEarlyAtHeat: null,
    },
  ],

  reputationWall: {
    actionName: "Call Out",
    minCallOutsToMark: 3,
    markedDurationHours: 24,
    markedDefenseModifier: -0.1,
    markedLabel: "Marked",
    markedUiText: "Marked by the street. Defense reduced by 10% for 24h.",
    neededText: "players needed to Mark",
  },

  story: {
    headline: "Concrete Pour",
    subhead: "Prep the forms. Pour the street. Let Southside cure under your name.",
    mondayStory:
      "We coordinated, marked KickWhere, chained 12 contracts, and took Southside at Heat 97.",
  },

  demoLeaderboard: [
    { bossName: "KickWhere", influence: 1620, contractsIssued: 8, heatGiven: 8 },
    { bossName: "Grave Ledger", influence: 1445, contractsIssued: 6, heatGiven: 6 },
    { bossName: "Viper Lane", influence: 1310, contractsIssued: 5, heatGiven: 5 },
    { bossName: "Southside Saint", influence: 1175, contractsIssued: 4, heatGiven: 4 },
    { bossName: "Blacktop Benny", influence: 920, contractsIssued: 3, heatGiven: 3 },
  ],
};

const EVENT_STORAGE_KEY = "shadow_syndicate_concrete_pour_event_v3";

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getDefaultConcretePourState() {
  return {
    eventId: eventConfig.id,
    startedAt: Date.now(),
    influenceByBoss: {},
    contractsIssuedByBoss: {},
    retaliationContractsUsedByBoss: {},
    heatGivenByBoss: {},
    callOutsByTarget: {},
    markedBosses: {},
    cityHeat: 0,
    prepEndedEarlyAt: null,
    phaseShiftHours: 0,
    lastUpdatedAt: Date.now(),
    lastInfluenceReason: "",
    lastContractInfluence: 0,
  };
}

export function getConcretePourState() {
  const saved = localStorage.getItem(EVENT_STORAGE_KEY);

  if (saved) {
    try {
      return {
        ...getDefaultConcretePourState(),
        ...JSON.parse(saved),
      };
    } catch {
      localStorage.removeItem(EVENT_STORAGE_KEY);
    }
  }

  const fresh = getDefaultConcretePourState();
  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveConcretePourState(state) {
  const next = {
    ...state,
    lastUpdatedAt: Date.now(),
  };

  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resetConcretePourEvent() {
  const fresh = getDefaultConcretePourState();
  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function formatEventTime(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

export function getConcretePourPhase(state = getConcretePourState(), now = Date.now()) {
  const rawElapsedHours = (now - state.startedAt) / (1000 * 60 * 60);
  const phaseShiftHours = state.phaseShiftHours || 0;
  const elapsedHours = rawElapsedHours + phaseShiftHours;

  const phase =
    eventConfig.phases.find(
      (item) => elapsedHours >= item.startsAtHour && elapsedHours < item.endsAtHour
    ) || eventConfig.phases[eventConfig.phases.length - 1];

  const adjustedDurationHours = eventConfig.durationHours - phaseShiftHours;
  const eventEndsAt = state.startedAt + adjustedDurationHours * 60 * 60 * 1000;
  const phaseEndsAt =
    state.startedAt + (phase.endsAtHour - phaseShiftHours) * 60 * 60 * 1000;

  return {
    ...phase,
    rawElapsedHours,
    elapsedHours,
    phaseShiftHours,
    eventEndsAt,
    phaseEndsAt,
    eventIsActive: now < eventEndsAt,
    phaseEndsInMs: Math.max(0, phaseEndsAt - now),
    hoursRemaining: Math.max(0, (eventEndsAt - now) / (1000 * 60 * 60)),
    prepEndedEarly: !!state.prepEndedEarlyAt,
  };
}

export function applyCityHeatChange(amount, bossName = "Unknown Boss") {
  const state = getConcretePourState();
  const phase = getConcretePourPhase(state);
  const oldHeat = state.cityHeat || 0;
  const newHeat = clampNumber(oldHeat + amount, 0, 100);

  let next = {
    ...state,
    cityHeat: newHeat,
    heatGivenByBoss: {
      ...(state.heatGivenByBoss || {}),
      ...(amount > 0
        ? {
            [bossName]: (state.heatGivenByBoss?.[bossName] || 0) + amount,
          }
        : {}),
    },
  };

  if (
    phase.id === "prep" &&
    newHeat >= 100 &&
    !state.prepEndedEarlyAt
  ) {
    const shift = Math.max(0, 24 - phase.rawElapsedHours);

    next = {
      ...next,
      prepEndedEarlyAt: Date.now(),
      phaseShiftHours: shift,
    };
  }

  return saveConcretePourState(next);
}

export function getBossInfluence(bossName, state = getConcretePourState()) {
  return state.influenceByBoss?.[bossName] || 0;
}

export function getBossContractsIssued(bossName, state = getConcretePourState()) {
  return state.contractsIssuedByBoss?.[bossName] || 0;
}

export function getBossHeatGiven(bossName, state = getConcretePourState()) {
  return state.heatGivenByBoss?.[bossName] || 0;
}

export function addConcretePourInfluence(bossName, amount, reason = "Influence gained") {
  if (!bossName || !amount || amount <= 0) return getConcretePourState();

  const state = getConcretePourState();

  const next = {
    ...state,
    influenceByBoss: {
      ...(state.influenceByBoss || {}),
      [bossName]: (state.influenceByBoss?.[bossName] || 0) + Math.round(amount),
    },
    lastInfluenceReason: reason,
  };

  return saveConcretePourState(next);
}

export function addConcretePourContractIssued(bossName, amount = 1) {
  if (!bossName || amount <= 0) return getConcretePourState();

  const state = getConcretePourState();

  const next = {
    ...state,
    contractsIssuedByBoss: {
      ...(state.contractsIssuedByBoss || {}),
      [bossName]: (state.contractsIssuedByBoss?.[bossName] || 0) + amount,
    },
  };

  return saveConcretePourState(next);
}

export function addConcretePourRetaliationUsed(bossName, amount = 1) {
  if (!bossName || amount <= 0) return getConcretePourState();

  const state = getConcretePourState();

  const next = {
    ...state,
    retaliationContractsUsedByBoss: {
      ...(state.retaliationContractsUsedByBoss || {}),
      [bossName]: (state.retaliationContractsUsedByBoss?.[bossName] || 0) + amount,
    },
  };

  return saveConcretePourState(next);
}

export function getBossMarkedStatus(targetBossId, targetBossName, state = getConcretePourState()) {
  const targetKey = targetBossId || targetBossName;
  const marked = state.markedBosses?.[targetKey];

  if (!marked || Date.now() > marked.markedUntil) {
    return {
      marked: false,
      defenseModifier: 0,
      label: "Not Marked",
      timeLeft: "",
    };
  }

  return {
    marked: true,
    defenseModifier: marked.defenseModifier,
    label: eventConfig.reputationWall.markedLabel,
    timeLeft: formatEventTime(marked.markedUntil - Date.now()),
  };
}

export function callOutBoss({ callerBossName, targetBossId, targetBossName }) {
  const state = getConcretePourState();
  const targetKey = targetBossId || targetBossName;

  if (!callerBossName || !targetKey) {
    return {
      state,
      marked: false,
      callOutCount: 0,
      needed: eventConfig.reputationWall.minCallOutsToMark,
      message: "Missing caller or target.",
    };
  }

  const oldCallOuts = state.callOutsByTarget?.[targetKey] || [];
  const alreadyCalled = oldCallOuts.some((item) => item.callerBossName === callerBossName);

  const nextCallOuts = alreadyCalled
    ? oldCallOuts
    : [
        ...oldCallOuts,
        {
          callerBossName,
          targetBossId: targetBossId || targetBossName,
          targetBossName,
          calledAt: Date.now(),
        },
      ];

  const marked = nextCallOuts.length >= eventConfig.reputationWall.minCallOutsToMark;
  const markedUntil =
    Date.now() + eventConfig.reputationWall.markedDurationHours * 60 * 60 * 1000;

  const next = {
    ...state,
    callOutsByTarget: {
      ...(state.callOutsByTarget || {}),
      [targetKey]: nextCallOuts,
    },
    markedBosses: {
      ...(state.markedBosses || {}),
      ...(marked
        ? {
            [targetKey]: {
              targetBossId: targetBossId || targetBossName,
              targetBossName,
              markedAt: Date.now(),
              markedUntil,
              defenseModifier: eventConfig.reputationWall.markedDefenseModifier,
            },
          }
        : {}),
    },
  };

  const saved = saveConcretePourState(next);
  const needed = Math.max(0, eventConfig.reputationWall.minCallOutsToMark - nextCallOuts.length);

  return {
    state: saved,
    marked,
    callOutCount: nextCallOuts.length,
    needed,
    message: marked
      ? `${targetBossName} is Marked for 24 hours.`
      : `${needed}/3 players needed to Mark ${targetBossName}.`,
  };
}

export function contractInfluence(contractResult, phase = getConcretePourPhase(), state = getConcretePourState()) {
  if (!contractResult || !phase?.eventIsActive) return 0;

  const district = contractResult.district || contractResult.targetDistrict || "southside";
  const isSouthside = district === eventConfig.districtId;
  const isRetaliation = !!contractResult.isRetaliation;

  const markedStatus = getBossMarkedStatus(
    contractResult.targetId,
    contractResult.targetName,
    state
  );

  const baseInfluence = Math.max(
    1,
    Math.round(
      50 +
        (contractResult.cashStolen || 0) / 100 +
        (contractResult.crewSent || 1) * 10 +
        (contractResult.heatGain || 0) * 5
    )
  );

  if (phase.id === "prep") {
    if (!isSouthside) return 0;
    if (isRetaliation) return 0;

    return Math.round(baseInfluence * phase.contractInfluenceMultiplier);
  }

  if (phase.id === "pour") {
    if (isRetaliation) return 0;
    if (!markedStatus.marked) return 0;

    return Math.round(baseInfluence * phase.markedInfluenceMultiplier);
  }

  if (phase.id === "cure") {
    if (!isRetaliation) return 0;

    return Math.round(baseInfluence * phase.retaliationInfluenceMultiplier);
  }

  return 0;
}

export function getEventInfluenceFromContract(contractResult, phase = getConcretePourPhase()) {
  return contractInfluence(contractResult, phase);
}

export function addConcretePourContractInfluence({
  bossName,
  contractResult,
  isRetaliation = false,
}) {
  if (!bossName || !contractResult) return getConcretePourState();

  let state = getConcretePourState();
  const phase = getConcretePourPhase(state);

  const resultWithRetaliation = {
    ...contractResult,
    isRetaliation,
  };

  const influence = contractInfluence(resultWithRetaliation, phase, state);

  let nextState = state;

  if (influence > 0) {
    nextState = addConcretePourInfluence(
      bossName,
      influence,
      isRetaliation
        ? `Retaliation Contract added ${influence} Concrete Pour Influence.`
        : `Open Contract added ${influence} Concrete Pour Influence.`
    );
  }

  nextState = addConcretePourContractIssued(bossName, 1);

  if (isRetaliation) {
    nextState = addConcretePourRetaliationUsed(bossName, 1);
  }

  if (
    phase.id === "prep" &&
    (resultWithRetaliation.district || resultWithRetaliation.targetDistrict) === eventConfig.districtId &&
    !isRetaliation
  ) {
    nextState = applyCityHeatChange(phase.cityHeatPerContract || 1, bossName);
  }

  return {
    ...getConcretePourState(),
    lastContractInfluence: influence,
  };
}

export function isTargetAllowedForConcretePour(target, state = getConcretePourState()) {
  const phase = getConcretePourPhase(state);

  if (!phase.eventIsActive) return false;

  if (phase.id === "cure") {
    return false;
  }

  return true;
}

export function getConcretePourJobInfluence(job, game, baseCashEarned = 0) {
  const state = getConcretePourState();
  const phase = getConcretePourPhase(state);

  if (!phase.eventIsActive) return 0;
  if (job.district !== eventConfig.districtId) return 0;

  if (phase.id !== "prep") return 0;

  const baseInfluence = Math.max(
    1,
    Math.round((job.energy || 1) * 10 + (job.controlGain || 1) * 20 + baseCashEarned / 100)
  );

  return Math.round(baseInfluence);
}

export function getConcretePourPropertyInfluence(property, incomeEarned, game) {
  const state = getConcretePourState();
  const phase = getConcretePourPhase(state);

  if (!phase.eventIsActive) return 0;
  if (phase.id !== "cure") return 0;
  if (property.district !== eventConfig.districtId) return 0;

  return Math.max(1, Math.round((incomeEarned || 0) / 10));
}

export function getConcretePourLeaderboard(playerBossName = "Rookie") {
  const state = getConcretePourState();

  const playerRow = {
    bossName: playerBossName,
    influence: getBossInfluence(playerBossName, state),
    contractsIssued: getBossContractsIssued(playerBossName, state),
    heatGiven: getBossHeatGiven(playerBossName, state),
    isPlayer: true,
  };

  const dynamicBossNames = new Set([
    ...Object.keys(state.influenceByBoss || {}),
    ...Object.keys(state.contractsIssuedByBoss || {}),
    ...Object.keys(state.heatGivenByBoss || {}),
  ]);

  const dynamicRows = Array.from(dynamicBossNames).map((bossName) => ({
    bossName,
    influence: getBossInfluence(bossName, state),
    contractsIssued: getBossContractsIssued(bossName, state),
    heatGiven: getBossHeatGiven(bossName, state),
    isPlayer: bossName === playerBossName,
  }));

  const rows = [
    ...eventConfig.demoLeaderboard,
    ...dynamicRows,
    playerRow,
  ];

  const merged = rows.reduce((map, row) => {
    const current = map.get(row.bossName);

    if (
      !current ||
      row.influence > current.influence ||
      row.contractsIssued > current.contractsIssued ||
      row.heatGiven > current.heatGiven
    ) {
      map.set(row.bossName, {
        ...current,
        ...row,
        influence: Math.max(current?.influence || 0, row.influence || 0),
        contractsIssued: Math.max(current?.contractsIssued || 0, row.contractsIssued || 0),
        heatGiven: Math.max(current?.heatGiven || 0, row.heatGiven || 0),
        isPlayer: current?.isPlayer || row.isPlayer,
      });
    }

    return map;
  }, new Map());

  const sortedByInfluence = Array.from(merged.values())
    .sort((a, b) => {
      if ((b.influence || 0) !== (a.influence || 0)) return (b.influence || 0) - (a.influence || 0);
      if ((b.contractsIssued || 0) !== (a.contractsIssued || 0)) return (b.contractsIssued || 0) - (a.contractsIssued || 0);
      return (b.heatGiven || 0) - (a.heatGiven || 0);
    })
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      projectedTribute:
        index < eventConfig.rewardEligibleRank
          ? Math.floor(eventConfig.prizePoolTribute / eventConfig.rewardEligibleRank)
          : 0,
    }));

  const mostContractsIssued = [...sortedByInfluence].sort(
    (a, b) => (b.contractsIssued || 0) - (a.contractsIssued || 0)
  )[0];

  const mostHeatAbsorbed = [...sortedByInfluence].sort(
    (a, b) => (b.heatGiven || 0) - (a.heatGiven || 0)
  )[0];

  return sortedByInfluence.map((row) => ({
    ...row,
    enforcerSkinEligible: row.bossName === mostContractsIssued?.bossName,
    fireproofEligible: row.bossName === mostHeatAbsorbed?.bossName,
  }));
}