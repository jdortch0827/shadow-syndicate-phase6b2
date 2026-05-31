export function getOneRecommendedMove(game = {}, context = {}) {
  const revenge = (game.pvpRevengeList || []).find((item) => !item.completed);
  if (revenge) return { title: 'Retaliate', tab: 'pvp', detail: `${revenge.rivalName || 'A rival'} hit you. Revenge bonus is active.`, cta: 'Retaliate' };
  if (Number(game.health || 0) < Math.max(30, Number(game.maxHealth || 100) * 0.35)) return { title: 'Heal up', tab: 'clinic', detail: 'Your health is low. Patch up before another fight.', cta: 'Heal Boss' };
  if (Number(game.jobsRun || 0) < 1) return { title: 'Run your first job', tab: 'jobs', detail: 'Make your first move, earn cash, and let the streets know your name.', cta: 'Run First Job' };
  if (!game.chapterRewards?.firstMoves) return { title: 'Claim your first reward', tab: 'command', detail: 'You made your first move. Claim the reward and keep the streak going.', cta: 'Claim Reward' };
  const startDistrict = game.startingDistrictId || 'docks';
  if (Number(game.territory?.[startDistrict] || 0) < 25) return { title: 'Push turf control to 25%', tab: 'territory', detail: 'Start making one district feel like yours.', cta: 'Take Turf' };
  const fronts = Object.values(game.properties || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  if (fronts < 1) return { title: 'Buy your first front', tab: 'properties', detail: 'Fronts create income and give rivals something personal to attack.', cta: 'Buy Front' };
  if (Number(game.heat || 0) >= 65) return { title: 'Lower heat', tab: 'heat', detail: 'Heat is getting too high. Cool things down before the city pushes back.', cta: 'Manage Heat' };
  if (Number(game.stamina || 0) > 0) return { title: 'Pick a fight', tab: 'pvp', detail: 'Choose a target, build a grudge, and make PvP feel personal.', cta: 'Find Targets' };
  return { title: 'Build the empire', tab: 'empire', detail: 'Collect income, upgrade fronts, and prepare for revenge.', cta: 'Open Empire' };
}
