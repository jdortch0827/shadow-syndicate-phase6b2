// Phase 1.54 local warfare vertical slice. NOT a secure multiplayer authority.
export const TROOPS = Object.freeze({
  runners: { name: "Runners", attack: 4, defense: 3, health: 12, cost: 80, energy: 2, level: 1 },
  enforcers: { name: "Enforcers", attack: 10, defense: 9, health: 25, cost: 240, energy: 4, level: 2 },
  specialists: { name: "Specialists", attack: 22, defense: 17, health: 40, cost: 600, energy: 7, level: 3 },
});
export const TARGETS = Object.freeze([
  { id: "dock_patrol", name: "Dockside Patrol", district: "docks", power: 80, defense: 48, reward: 190, level: 1 },
  { id: "warehouse_guard", name: "Warehouse Guards", district: "warehouse", power: 210, defense: 145, reward: 430, level: 2 },
  { id: "financial_convoy", name: "Financial Convoy", district: "financial", power: 460, defense: 330, reward: 950, level: 3 },
]);
const count = value => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
export const getTroopCounts = game => Object.fromEntries(Object.keys(TROOPS).map(id => [id, count(game?.warfare?.troops?.[id])]));
export function trainTroops(game, type, quantity) {
  const unit = TROOPS[type], qty = count(quantity);
  if (!unit || qty < 1 || qty > 25 || !Number.isInteger(Number(quantity))) return { ok: false, error: "Choose 1–25 troops." };
  if (count(game.level) < unit.level) return { ok: false, error: "Boss level too low for this unit." };
  const cost = unit.cost * qty, energy = unit.energy * qty;
  if (count(game.cash) < cost || count(game.energy) < energy) return { ok: false, error: "Not enough cash or energy." };
  const troops = getTroopCounts(game);
  return { ok: true, game: { ...game, cash: game.cash - cost, energy: game.energy - energy, warfare: { ...(game.warfare || {}), troops: { ...troops, [type]: troops[type] + qty } } }, message: `Trained ${qty} ${unit.name}.` };
}
export function calculateArmy(troops) {
  return Object.entries(TROOPS).reduce((army, [id, unit]) => {
    const qty = count(troops?.[id]);
    army.units += qty;
    army.attack += qty * unit.attack;
    army.defense += qty * unit.defense;
    army.health += qty * unit.health;
    return army;
  }, { units: 0, attack: 0, defense: 0, health: 0 });
}
export function resolveRaid(game, targetId, deployment) {
  const target = TARGETS.find(t => t.id === targetId);
  if (!target) return { ok: false, error: "Unknown target." };
  if (count(game.level) < target.level) return { ok: false, error: "Target is locked." };
  const available = getTroopCounts(game);
  const selected = {};
  for (const id of Object.keys(TROOPS)) {
    const raw = deployment?.[id] ?? 0;
    if (!Number.isInteger(Number(raw)) || Number(raw) < 0) return { ok: false, error: "Invalid troop count." };
    selected[id] = count(raw);
    if (selected[id] > available[id]) return { ok: false, error: "Not enough troops." };
  }
  const army = calculateArmy(selected);
  if (!army.units) return { ok: false, error: "Deploy at least one troop." };
  const won = army.attack >= target.power;
  const casualtyRate = won ? Math.min(0.35, target.defense / Math.max(army.attack, 1) * 0.25) : 0.55;
  const wounded = {}, survivors = {}, troops = {};
  for (const id of Object.keys(TROOPS)) {
    wounded[id] = Math.min(selected[id], Math.ceil(selected[id] * casualtyRate));
    survivors[id] = selected[id] - wounded[id];
    troops[id] = available[id] - wounded[id];
  }
  const reward = won ? target.reward : 0;
  const report = { id: `raid-${Date.now()}`, target: target.name, won, deployed: selected, wounded, attack: army.attack, targetPower: target.power, reward, at: Date.now() };
  const hospital = Object.fromEntries(Object.keys(TROOPS).map(id => [id, count(game.warfare?.hospital?.[id]) + wounded[id]]));
  return { ok: true, report, game: { ...game, cash: count(game.cash) + reward, warfare: { ...(game.warfare || {}), troops, hospital, reports: [report, ...(game.warfare?.reports || [])].slice(0, 20) } }, message: won ? `Victory at ${target.name}: +$${reward}.` : `Defeat at ${target.name}. Wounded moved to hospital.` };
}
export function healTroops(game) {
  const hospital = Object.fromEntries(Object.keys(TROOPS).map(id => [id, count(game.warfare?.hospital?.[id])]));
  const total = Object.values(hospital).reduce((a,b)=>a+b,0);
  if (!total) return { ok: false, error: "No wounded troops." };
  const cost = Object.entries(hospital).reduce((sum,[id,qty]) => sum + qty * Math.ceil(TROOPS[id].cost / 2),0);
  if (count(game.cash) < cost) return { ok: false, error: `Healing requires $${cost}.` };
  const troops = getTroopCounts(game);
  return { ok: true, game: { ...game, cash: game.cash - cost, warfare: { ...(game.warfare || {}), troops: Object.fromEntries(Object.keys(TROOPS).map(id=>[id,troops[id]+hospital[id]])), hospital: Object.fromEntries(Object.keys(TROOPS).map(id=>[id,0])) } }, message: `Healed ${total} troops for $${cost}.` };
}
