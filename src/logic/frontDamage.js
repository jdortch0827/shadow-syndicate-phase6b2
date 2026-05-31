export function getFrontDamage(game = {}, propertyId) {
  return Math.max(0, Math.min(100, Number(game.frontDamage?.[propertyId] || 0)));
}

export function getFrontDamageIncomeMultiplier(game = {}, propertyId) {
  const damage = getFrontDamage(game, propertyId);
  if (damage <= 0) return 1;
  return Math.max(0.45, 1 - damage / 100);
}

export function getFrontRepairCost(property = {}, game = {}) {
  const damage = getFrontDamage(game, property.id);
  if (damage <= 0) return 0;
  return Math.max(150, Math.round(Number(property.cost || 1000) * (damage / 100) * 0.55));
}

export function damageRandomFront(game = {}, properties = [], severity = 20) {
  const owned = properties.filter((front) => Number(game.properties?.[front.id] || 0) > 0);
  if (!owned.length) return { nextGame: game, damagedFront: null };
  const front = owned[Math.floor(Math.random() * owned.length)];
  const damage = Math.max(10, Math.min(60, Number(severity || 20)));
  const nextDamage = Math.min(100, Number(game.frontDamage?.[front.id] || 0) + damage);
  return {
    nextGame: { ...game, frontDamage: { ...(game.frontDamage || {}), [front.id]: nextDamage } },
    damagedFront: { ...front, damage: nextDamage },
  };
}

export function repairFront(game = {}, property = {}) {
  const damage = getFrontDamage(game, property.id);
  if (damage <= 0) return { blocked: true, reason: `${property.name} is not damaged.`, nextGame: game };
  const cost = getFrontRepairCost(property, game);
  if (Number(game.cash || 0) < cost) return { blocked: true, reason: `Need $${(cost - Number(game.cash || 0)).toLocaleString()} more cash to repair this front.`, nextGame: game };
  return {
    blocked: false,
    cost,
    nextGame: { ...game, cash: Number(game.cash || 0) - cost, frontDamage: { ...(game.frontDamage || {}), [property.id]: 0 } },
    result: { title: 'Front Repaired', flavor: `${property.name} is back to full earning power.`, details: [`-$${cost.toLocaleString()} Cash`, 'Income penalty removed'] },
  };
}
