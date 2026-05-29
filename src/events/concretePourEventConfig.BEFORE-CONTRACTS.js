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
    top10ContractsIssued: {
      type: "cosmetic",
      eligibleRank: 10,
      cosmeticId: "enforcer_boss_skin_concrete_pour",
      name: "Exclusive Enforcer Boss Skin",
      label: "Top 10 Most Contracts Issued earn the exclusive Enforcer boss skin. Cosmetic only.",
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
      rule: "Contracts in Southside give 5x Influence versus jobs. Each contract raises City Heat by +1 for everyone.",
      jobInfluenceMultiplier: 1,
      contractInfluenceMultiplier: 5,
      retaliationInfluenceMultiplier: 1,
      propertyInfluenceOnly: false,
      contractsAllowed: true,
      onlyMarkedTargets: false,
      cityHeatPerContract: 1,
    },
    {
      id: "pour",
      name: "Pour",
      startsAtHour: 24,
      endsAtHour: 48,
      rule: "Only Marked bosses can be targeted. Call-outs turn Reputation Wall trash talk into PvP mechanics.",
      jobInfluenceMultiplier: 1,
      contractInfluenceMultiplier: 2,
      retaliationInfluenceMultiplier: 2,
      propertyInfluenceOnly: false,
      contractsAllowed: true,
      onlyMarkedTargets: true,
      cityHeatPerContract: 1,
    },
    {
      id: "cure",
      name: "Cure",
      startsAtHour: 48,
      endsAtHour: 72,
      rule: "Retaliation Contracts give 10x Influence. Losers can fight back and swing the event late.",
      jobInfluenceMultiplier: 0,
      contractInfluenceMultiplier: 1,
      retaliationInfluenceMultiplier: 10,
      propertyInfluenceOnly: true,
      contractsAllowed: true,
      onlyMarkedTargets: false,
      cityHeatPerContract: 1,
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

  crew: {
    actionName: "Deputize",
    maxDeputizedCrew: 1,
    influenceBonus: 0.05,
    lockedFromFights: true,
    uiText:
      "Deputize 1 crew member for the event. They give +5% Influence but cannot be used in fights.",
  },

  story: {
    headline: "Concrete Pour",
    subhead: "Prep the forms. Pour the street. Let Southside cure under your name.",
    mondayStory:
      "We marked KickWhere it hurts, chained 8 contracts, and took Southside. No crates. No excuses.",
  },

  demoLeaderboard: [
    { bossName: "KickWhere", influence: 1620, contractsIssued: 8 },
    { bossName: "Grave Ledger", influence: 1445, contractsIssued: 6 },
    { bossName: "Viper Lane", influence: 1310, contractsIssued: 5 },
    { bossName: "Southside Saint", influence: 1175, contractsIssued: 4 },
    { bossName: "Blacktop Benny", influence: 920, contractsIssued: 3 },
  ],
};

const EVENT_STORAGE_KEY = "shadow_syndicate_concrete_pour_event_v2";

export function getConcretePourState() {
  const saved = localStorage.getItem(EVENT_STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);

      return {
        eventId: eventConfig.id,
        startedAt: Date.now(),
        influenceByBoss: {},
        contractsIssuedByBoss: {},
        retaliationContractsUsedByBoss: {},
        callOutsByTarget: {},
        markedBosses: {},
        deputizedByBoss: {},
        cityHeat: 0,
        lastUpdatedAt: Date.now(),
        ...parsed,
      };
    } catch {
      localStorage.removeItem(EVENT_STORAGE_KEY);
    }
  }

  const fresh = {
    eventId: eventConfig.id,
    startedAt: Date.now(),
    influenceByBoss: {},
    contractsIssuedByBoss: {},
    retaliationContractsUsedByBoss: {},
    callOutsByTarget: {},
    markedBosses: {},
    deputizedByBoss: {},
    cityHeat: 0,
    lastUpdatedAt: Date.now(),
  };

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

export function getConcretePourPhase(state = getConcretePourState(), now = Date.now()) {
  const elapsedHours = (now - state.startedAt) / (1000 * 60 * 60);

  const phase =
    eventConfig.phases.find(
      (item) => elapsedHours >= item.startsAtHour && elapsedHours < item.endsAtHour
    ) || eventConfig.phases[eventConfig.phases.length - 1];

  const eventEndsAt = state.startedAt + eventConfig.durationHours * 60 * 60 * 1000;
  const phaseEndsAt = state.startedAt + phase.endsAtHour * 60 * 60 * 1000;

  return {
    ...phase,
    elapsedHours,
    eventEndsAt,
    phaseEndsAt,
    eventIsActive: now < eventEndsAt,
    hoursRemaining: Math.max(0, (eventEndsAt - now) / (1000 * 60 * 60)),
  };
}

export function formatEventTime(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

export function getBossInfluence(bossName, state = getConcretePourState()) {
  return state.influenceByBoss?.[bossName] || 0;
}

export function getBossContractsIssued(bossName, state = getConcretePourState()) {
  return state.contractsIssuedByBoss?.[bossName] || 0;
}

export function getBossRetaliationsUsed(bossName, state = getConcretePourState()) {
  return state.retaliationContractsUsedByBoss?.[bossName] || 0;
}

export function bossHasDeputizedCrew(bossName, state = getConcretePourState()) {
  return !!state.deputizedByBoss?.[bossName];
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
  const phase = getConcretePourPhase(state);
  const heatAdded = phase.cityHeatPerContract || 0;

  const next = {
    ...state,
    cityHeat: Math.min(100, (state.cityHeat || 0) + heatAdded),
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

export function getEventInfluenceFromContract(contractResult, phase = getConcretePourPhase()) {
  if (!contractResult || !phase?.eventIsActive) return 0;
  if (!phase.contractsAllowed) return 0;

  const district = contractResult.district || contractResult.targetDistrict || "southside";
  const isSouthside = district === eventConfig.districtId;
  const isRetaliation = !!contractResult.isRetaliation;

  if (!isSouthside && !isRetaliation) return 0;

  const baseInfluence = Math.max(
    1,
    Math.round(
      (contractResult.cashStolen || 0) / 100 +
        (contractResult.crewSent || 1) * 15 +
        (contractResult.heatGain || 0) * 3
    )
  );

  const multiplier = isRetaliation
    ? phase.retaliationInfluenceMultiplier || 1
    : phase.contractInfluenceMultiplier || 1;

  return Math.round(baseInfluence * multiplier);
}

export function addConcretePourContractInfluence({
  bossName,
  contractResult,
  isRetaliation = false,
}) {
  if (!bossName || !contractResult) return getConcretePourState();

  const state = getConcretePourState();
  const phase = getConcretePourPhase(state);

  const influence = getEventInfluenceFromContract(
    {
      ...contractResult,
      isRetaliation,
    },
    phase
  );

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

  addConcretePourContractIssued(bossName, 1);

  if (isRetaliation) {
    addConcretePourRetaliationUsed(bossName, 1);
  }

  return {
    ...getConcretePourState(),
    lastContractInfluence: influence,
  };
}

export function isTargetAllowedForConcretePour(target, state = getConcretePourState()) {
  const phase = getConcretePourPhase(state);

  if (!phase.eventIsActive) return false;
  if (!phase.contractsAllowed) return false;

  if (!phase.onlyMarkedTargets) return true;

  const marked = getBossMarkedStatus(target?.id, target?.rivalName || target?.bossName || target?.name, state);

  return marked.marked;
}

export function deputizeConcretePourCrew(bossName) {
  const state = getConcretePourState();

  const next = {
    ...state,
    deputizedByBoss: {
      ...(state.deputizedByBoss || {}),
      [bossName]: true,
    },
  };

  return saveConcretePourState(next);
}

export function removeConcretePourDeputy(bossName) {
  const state = getConcretePourState();

  const next = {
    ...state,
    deputizedByBoss: {
      ...(state.deputizedByBoss || {}),
      [bossName]: false,
    },
  };

  return saveConcretePourState(next);
}

export function getConcretePourJobInfluence(job, game, baseCashEarned = 0) {
  const state = getConcretePourState();
  const phase = getConcretePourPhase(state);
  const bossName = game?.bossName || game?.playerName || "Rookie";

  if (!phase.eventIsActive) return 0;
  if (phase.propertyInfluenceOnly) return 0;
  if (job.district !== eventConfig.districtId) return 0;

  const baseInfluence = Math.max(
    1,
    Math.round((job.energy || 1) * 10 + (job.controlGain || 1) * 20 + baseCashEarned / 100)
  );

  const deputizedMultiplier = bossHasDeputizedCrew(bossName, state)
    ? 1 + eventConfig.crew.influenceBonus
    : 1;

  return Math.round(baseInfluence * phase.jobInfluenceMultiplier * deputizedMultiplier);
}

export function getConcretePourPropertyInfluence(property, incomeEarned, game) {
  const state = getConcretePourState();
  const phase = getConcretePourPhase(state);
  const bossName = game?.bossName || game?.playerName || "Rookie";

  if (!phase.eventIsActive) return 0;
  if (!phase.propertyInfluenceOnly) return 0;
  if (property.district !== eventConfig.districtId) return 0;

  const deputizedMultiplier = bossHasDeputizedCrew(bossName, state)
    ? 1 + eventConfig.crew.influenceBonus
    : 1;

  return Math.max(1, Math.round((incomeEarned || 0) / 10 * deputizedMultiplier));
}

export function callOutBoss({ callerBossName, targetBossId, targetBossName }) {
  const state = getConcretePourState();
  const targetKey = targetBossId || targetBossName;

  if (!callerBossName || !targetKey) {
    return { state, marked: false, callOutCount: 0, needed: eventConfig.reputationWall.minCallOutsToMark };
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

  return {
    state: saveConcretePourState(next),
    marked,
    callOutCount: nextCallOuts.length,
    needed: Math.max(0, eventConfig.reputationWall.minCallOutsToMark - nextCallOuts.length),
  };
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

export function getConcretePourLeaderboard(playerBossName = "Rookie") {
  const state = getConcretePourState();
  const playerInfluence = getBossInfluence(playerBossName, state);
  const playerContracts = getBossContractsIssued(playerBossName, state);

  const rows = [
    ...eventConfig.demoLeaderboard,
    {
      bossName: playerBossName,
      influence: playerInfluence,
      contractsIssued: playerContracts,
      isPlayer: true,
    },
  ];

  const merged = rows.reduce((map, row) => {
    const current = map.get(row.bossName);

    if (!current || row.influence > current.influence) {
      map.set(row.bossName, row);
    }

    return map;
  }, new Map());

  return Array.from(merged.values())
    .sort((a, b) => {
      if (b.influence !== a.influence) return b.influence - a.influence;
      return (b.contractsIssued || 0) - (a.contractsIssued || 0);
    })
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      projectedTribute:
        index < eventConfig.rewardEligibleRank
          ? Math.floor(eventConfig.prizePoolTribute / eventConfig.rewardEligibleRank)
          : 0,
      enforcerSkinEligible: index < eventConfig.rewards.top10ContractsIssued.eligibleRank,
    }));
}

export function getConcretePourFightCrew(game) {
  const bossName = game?.bossName || game?.playerName || "Rookie";
  const state = getConcretePourState();
  const deputized = bossHasDeputizedCrew(bossName, state);

  return Math.max(0, (game?.crew || 0) - (deputized ? 1 : 0));
}