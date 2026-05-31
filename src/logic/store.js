export function getStorePrompt(game = {}) {
  if (Number(game.energy || 0) <= 0) return { title: 'Out of Energy', detail: 'Wait for energy or test an Energy Refill from the Tribute Store.', tab: 'store' };
  if (Number(game.stamina || 0) <= 0) return { title: 'Out of Stamina', detail: 'Wait for stamina or test a Stamina Refill before taking revenge.', tab: 'store' };
  if (Number(game.vault || 0) >= Number(game.vaultCapacity || 2500)) return { title: 'Vault Full', detail: 'Upgrade vault capacity before protecting more cash.', tab: 'store' };
  const damaged = Object.keys(game.frontDamage || {}).filter((id) => game.frontDamage?.[id]?.damaged);
  if (damaged.length) return { title: 'Front Damaged', detail: 'Repair damaged fronts or retaliate against whoever hit you.', tab: 'store' };
  return null;
}

export function applyMockStorePurchase(game = {}, item = {}, helpers = {}) {
  const clamp = helpers.clamp || ((v, min, max) => Math.max(min, Math.min(max, v)));
  const tribute = Number(game.tribute || 0);
  if (tribute < Number(item.costTribute || 0)) {
    return { blocked: true, nextGame: game, result: { title: 'Purchase Blocked', flavor: `Need ${Number(item.costTribute || 0) - tribute} more Tribute.`, details: [item.title] } };
  }

  let nextGame = {
    ...game,
    tribute: tribute - Number(item.costTribute || 0),
    mockStorePurchases: { ...(game.mockStorePurchases || {}), [item.id]: Number(game.mockStorePurchases?.[item.id] || 0) + 1 },
    storePromptsSeen: { ...(game.storePromptsSeen || {}), [item.id]: true },
  };

  const details = [`-${item.costTribute} Tribute`];
  if (item.type === 'energy') { nextGame.energy = Number(nextGame.maxEnergy || 100); details.push('Energy restored to full'); nextGame.energyRefillsUsed = Number(game.energyRefillsUsed || 0) + 1; }
  if (item.type === 'stamina') { nextGame.stamina = Number(nextGame.maxStamina || 25); details.push('Stamina restored to full'); nextGame.staminaRefillsUsed = Number(game.staminaRefillsUsed || 0) + 1; }
  if (item.type === 'shield') { nextGame.activeShieldUntil = Date.now() + 8 * 60 * 60 * 1000; details.push('Lay Low Shield active for 8 hours'); }
  if (item.type === 'vault') { nextGame.vaultExpansionLevel = Number(game.vaultExpansionLevel || 0) + 1; nextGame.vaultCapacityBonus = Number(game.vaultCapacityBonus || 0) + 2500; details.push('Vault capacity +$2,500'); }
  if (item.type === 'crew') { nextGame.crew = Number(game.crew || 0) + 3; nextGame.crewLoyalty = clamp(Number(game.crewLoyalty ?? 75) + 4, 0, 100); details.push('+3 Crew', '+4 Crew Loyalty'); }
  if (item.type === 'gear') { nextGame.gear = { ...(game.gear || {}), street_blade: true }; nextGame.gearUpgrades = { ...(game.gearUpgrades || {}), street_blade: Math.max(2, Number(game.gearUpgrades?.street_blade || 1)) }; details.push('Starter weapon boosted'); }
  if (item.type === 'starter') { nextGame.cash = Number(game.cash || 0) + 2500; nextGame.energy = Number(nextGame.maxEnergy || 100); nextGame.stamina = Number(nextGame.maxStamina || 25); nextGame.vaultCapacityBonus = Number(game.vaultCapacityBonus || 0) + 2500; details.push('+$2,500 Cash', 'Energy full', 'Stamina full', 'Vault capacity +$2,500'); }
  if (item.type === 'repair') {
    const damagedId = Object.keys(game.frontDamage || {}).find((id) => game.frontDamage?.[id]?.damaged);
    if (damagedId) { nextGame.frontDamage = { ...(game.frontDamage || {}), [damagedId]: { ...(game.frontDamage?.[damagedId] || {}), damaged: false, repairedAt: Date.now() } }; details.push('One damaged front repaired'); }
    else details.push('No damaged fronts right now');
  }
  if (item.type === 'heat') { nextGame.heat = clamp(Number(game.heat || 0) - 25, 0, 100); details.push('-25 Heat'); }
  if (item.type === 'respect') { nextGame.respectBoostActions = Math.max(Number(game.respectBoostActions || 0), 10); details.push('Respect boost for next 10 actions'); }

  return {
    nextGame,
    result: { title: 'Purchase Complete', flavor: item.effect, details },
    logMessage: `${item.title} purchased from the mock Tribute Store.`,
    streetChatMessage: `Word is ${game.bossName || 'the boss'} picked up ${item.title} from the Black Market Store.`,
  };
}
