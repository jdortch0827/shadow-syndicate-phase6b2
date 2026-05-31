export function getFirstSessionRecommendedMove(game = {}, context = {}) {
  const territory = game.territory || {};
  const startingDistrictId = game.startingDistrictId || "docks";
  const startingControl = Number(territory[startingDistrictId] || 0);
  const ownedFronts = Object.values(game.properties || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const heat = Number(context.heat ?? game.heat ?? 0);
  const health = Number(game.health ?? 100);
  const maxHealth = Number(game.maxHealth || 100);
  const topRivalThreat = context.topRivalThreat;
  const dailyRewardReady = context.dailyComplete && !context.dailyClaimed;
  const loginRewardReady = context.loginReward && !context.loginRewardClaimed;

  if (!game.started) {
    return { title: "Create your boss", tab: "command", detail: "Choose a name, class, starting district, and profile image before entering the city." };
  }
  if (health <= Math.round(maxHealth * 0.35)) {
    return { title: "Get patched up", tab: "clinic", detail: "Your health is low. Use the Clinic or quick heal before risky jobs and rival fights." };
  }
  if (loginRewardReady || dailyRewardReady) {
    return { title: "Claim your available reward", tab: "rewards", detail: "A reward is ready. Claim it before making the next move." };
  }
  if (Number(game.jobsRun || 0) < 1) {
    return { title: "Run your first street job", tab: "jobs", detail: "Earn your first cash, XP, and street control so the city knows your name." };
  }
  if (Number(game.cash || 0) < 1000) {
    return { title: "Build your first bankroll", tab: "jobs", detail: "Run jobs until you have at least $1,000 to fund your first serious move." };
  }
  if (startingControl < 25) {
    return { title: "Secure your first turf foothold", tab: "territory", detail: "Push your starting district to 25% control so tribute and stronger territory play open up." };
  }
  if (ownedFronts < 1) {
    return { title: "Buy your first front", tab: "properties", detail: "Turn cash into a property front so your empire starts earning while you play." };
  }
  if (heat >= 55) {
    return { title: "Cool down the streets", tab: "heat", detail: "Heat is getting high. Lay low or spend favors before bigger moves get dangerous." };
  }
  if (Number(game.crew || 0) < 8 || Number(game.crewLoyalty ?? 75) < 65) {
    return { title: "Steady your crew", tab: "crew", detail: "Recruit, train, or pay crew so your people can hold turf and survive pressure." };
  }
  if (topRivalThreat && Number(topRivalThreat.pressure || 0) >= 55) {
    return { title: "Handle rival pressure", tab: "revenge", detail: "A rival crew is getting bold. Lower pressure before retaliation hits your cash or turf." };
  }
  return context.fallback || { title: "Follow the Mission Board", tab: "missions", detail: "Use the mission board to keep building cash, control, fronts, and respect." };
}
