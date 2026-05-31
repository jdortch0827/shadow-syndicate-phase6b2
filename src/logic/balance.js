export function getBalanceSnapshot(game = {}, context = {}) {
  const nextLevelXp = Number(context.nextLevelXp || 100);
  const xp = Number(game.xp || 0);
  const income = Number(context.income || 0);
  const cash = Number(game.cash || 0);
  const heat = Number(context.heat ?? game.heat ?? 0);
  const loyalty = Number(context.crewLoyalty ?? game.crewLoyalty ?? 0);
  const level = Number(game.level || 1);
  const health = Number(game.health || 0);
  const maxHealth = Number(game.maxHealth || 100);
  const ownedFronts = Object.values(game.properties || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const firstFrontCost = Number(context.firstFrontCost || 900);
  const averageJobCash = Number(context.averageJobCash || 145);
  const jobXpAverage = Number(context.averageJobXp || 8);
  const jobsNeededForFront = cash >= firstFrontCost ? 0 : Math.ceil((firstFrontCost - cash) / Math.max(1, averageJobCash));
  const jobsNeededNextLevel = xp >= nextLevelXp ? 0 : Math.ceil((nextLevelXp - xp) / Math.max(1, jobXpAverage));
  const heatRisk = heat >= 80 ? "Critical" : heat >= 60 ? "High" : heat >= 35 ? "Medium" : "Low";
  const healingAffordability = health >= maxHealth ? "Full health" : cash >= 250 ? "Can afford treatment" : "Needs cash before full treatment";
  const lockedSystems = Array.isArray(context.lockedSystems) ? context.lockedSystems : [];
  const nextMajorUnlock = lockedSystems.find((system) => !system.unlocked) || null;

  const unlockedSystems = [
    game.started && "Boss Setup",
    Number(game.jobsRun || 0) > 0 && "Jobs",
    ownedFronts > 0 && "Fronts",
    level >= 2 && "Safehouse / Contracts",
    level >= 3 && "Vault / Market",
    level >= 4 && "Lieutenants",
  ].filter(Boolean);

  return {
    cashPerAction: context.estimatedJobCash || "Varies by job",
    averageCashPerJob: averageJobCash,
    estimatedIncome: income,
    incomePerCollection: income,
    heatRisk,
    heatFiveRiskyActions: Math.min(100, heat + 25),
    rivalThreat: context.topRivalThreat ? `${context.topRivalThreat.rival?.name || "Rival"} ${context.topRivalThreat.pressure}/100` : "Quiet",
    nextMajorUpgrade: cash < 1000 ? "Run jobs until $1,000+" : ownedFronts < 1 ? "Buy first front" : heat >= 55 ? "Lower Heat" : "Upgrade fronts or safehouse",
    nextMajorUnlock: nextMajorUnlock ? `${nextMajorUnlock.name}: ${nextMajorUnlock.requirement}` : "All tracked systems available",
    propertyIncomeTotal: income,
    crewLoyaltyStatus: loyalty >= 80 ? "Strong" : loyalty >= 55 ? "Stable" : "Weak",
    healingAffordability,
    jobsNeededForFront,
    jobsNeededNextLevel,
    levelProgress: `${xp}/${nextLevelXp} XP`,
    unlockedSystems,
    lockedSystems: lockedSystems.filter((system) => !system.unlocked).map((system) => system.name),
  };
}
