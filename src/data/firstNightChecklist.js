export const firstNightChecklistItems = [
  {
    id: "firstJob",
    title: "Run your first job",
    tab: "jobs",
    rewardText: "+250 cash momentum",
    check: (game = {}) => Number(game.jobsRun || 0) >= 1,
  },
  {
    id: "firstCash",
    title: "Earn $1,000 cash",
    tab: "jobs",
    rewardText: "You have real street money now",
    check: (game = {}) => Number(game.cash || 0) >= 1000,
  },
  {
    id: "firstTurf",
    title: "Push turf control to 25%",
    tab: "territory",
    rewardText: "The block starts listening",
    check: (game = {}) => {
      const district = game.startingDistrictId || "docks";
      return Number(game.territory?.[district] || 0) >= 25;
    },
  },
  {
    id: "firstFront",
    title: "Buy your first front",
    tab: "properties",
    rewardText: "Money starts working for you",
    check: (game = {}) => Object.values(game.properties || {}).reduce((sum, value) => sum + Number(value || 0), 0) >= 1,
  },
  {
    id: "steadyCrew",
    title: "Recruit or steady your crew",
    tab: "crew",
    rewardText: "Your people are starting to believe",
    check: (game = {}) => Number(game.crew || 0) >= 8 || Number(game.crewLoyalty ?? 75) >= 82,
  },
  {
    id: "lowerHeat",
    title: "Lower heat or keep it under control",
    tab: "heat",
    rewardText: "Quiet streets keep money moving",
    check: (game = {}) => Number(game.heat || 0) <= 35 && Number(game.jobsRun || 0) >= 2,
  },
  {
    id: "claimReward",
    title: "Claim your first reward",
    tab: "rewards",
    rewardText: "First night momentum locked in",
    check: (game = {}) => Boolean(game.chapterRewards?.firstMoves) || Boolean(game.dailyRewardClaimedDate) || Boolean(game.loginRewardClaimedDate),
  },
];

export function getFirstNightChecklist(game = {}) {
  return firstNightChecklistItems.map((item) => ({
    ...item,
    done: Boolean(item.check(game)),
  }));
}

export function getFirstNightProgress(game = {}) {
  const items = getFirstNightChecklist(game);
  const completed = items.filter((item) => item.done);
  const nextItem = items.find((item) => !item.done) || items[items.length - 1];
  return {
    items,
    completedCount: completed.length,
    totalCount: items.length,
    nextItem,
    complete: completed.length === items.length,
  };
}
