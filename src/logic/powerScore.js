export function calculatePowerScore(game = {}, ratings = {}) {
  const level = Number(game.level || 1);
  const crew = Number(game.crew || 0);
  const loyalty = Number(game.crewLoyalty ?? 75);
  const fronts = Object.values(game.properties || {}).reduce((s, v) => s + Number(v || 0), 0);
  const turf = Object.values(game.territory || {}).reduce((s, v) => s + Number(v || 0), 0);
  const safehouse = Object.values(game.safehouse || {}).reduce((s, v) => s + Number(v || 0), 0);
  const skills = ['attackSkill','defenseSkill','operationsSkill','influenceSkill','stealthSkill','energySkill'].reduce((s, key) => s + Number(game[key] || 0), 0);
  const gearLevels = Object.values(game.gearUpgrades || {}).reduce((s, v) => s + Number(v || 0), 0);
  const attack = Number(ratings.attack || 0);
  const defense = Number(ratings.defense || 0);
  return Math.max(1, Math.round(level * 30 + crew * 8 + loyalty * 0.55 + fronts * 24 + turf * 0.35 + safehouse * 18 + skills * 10 + gearLevels * 9 + attack * 0.9 + defense * 0.9));
}

export function getPublicProfileSummary(game = {}, bossClass = {}, ratings = {}) {
  const turfControl = Object.values(game.territory || {}).reduce((s, v) => s + Number(v || 0), 0);
  const fronts = Object.values(game.properties || {}).reduce((s, v) => s + Number(v || 0), 0);
  return {
    playerId: game.playerId || 'local-player',
    bossName: game.bossName || 'Rookie',
    crewName: game.crewName || `${game.bossName || 'Rookie'} Crew`,
    bossClass: bossClass.name || game.classId || 'Boss',
    level: Number(game.level || 1),
    respect: Number(game.respect || 0),
    powerScore: calculatePowerScore(game, ratings),
    attackRating: Number(ratings.attack || 0),
    defenseRating: Number(ratings.defense || 0),
    heatLevel: Number(game.heat || 0),
    turfControl,
    vaultValue: Number(game.vault || 0),
    frontCount: fronts,
    crewLoyalty: Number(game.crewLoyalty ?? 75),
    lastActiveText: 'active now'
  };
}
