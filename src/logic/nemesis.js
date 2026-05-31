import { getGrudgeTier } from './pvp';

export function isNemesis(game = {}, targetId) {
  const history = game.pvpRivalHistory?.[targetId] || {};
  const grudge = Number(game.pvpGrudges?.[targetId] || 0);
  const stolenTotal = Number(history.cashStolenFromThem || 0) + Number(history.cashStolenFromYou || 0);
  return Boolean(game.pvpNemesisMap?.[targetId]) || grudge >= 75 || Number(history.playerAttacks || 0) + Number(history.rivalAttacks || 0) >= 4 || stolenTotal >= 3000 || Number(history.revengeWins || 0) >= 2;
}

export function getNemesisState(game = {}, targetId) {
  const history = game.pvpRivalHistory?.[targetId] || {};
  const grudge = Number(game.pvpGrudges?.[targetId] || 0);
  const tier = getGrudgeTier(grudge);
  const active = isNemesis(game, targetId);
  const revenge = game.pvpRevengeBonuses?.[targetId];
  return {
    active,
    grudge,
    grudgeLabel: tier.label,
    revengeBonusActive: Boolean(revenge && Number(revenge.expiresAt || 0) > Date.now()),
    attacksByPlayer: Number(history.playerAttacks || 0),
    attacksByRival: Number(history.rivalAttacks || 0),
    cashStolenFromThem: Number(history.cashStolenFromThem || 0),
    cashStolenFromYou: Number(history.cashStolenFromYou || 0),
    revengeWins: Number(history.revengeWins || 0),
    revengeLosses: Number(history.revengeLosses || 0),
    lastEvent: history.lastEvent || 'No major history yet.',
  };
}

export function updateNemesisMap(game = {}, targetId) {
  if (!targetId || !isNemesis(game, targetId)) return game;
  if (game.pvpNemesisMap?.[targetId]) return game;
  return {
    ...game,
    pvpNemesisMap: { ...(game.pvpNemesisMap || {}), [targetId]: true },
  };
}

export function getRetaliationRisk(game = {}, targetId, base = 0) {
  const grudge = Number(game.pvpGrudges?.[targetId] || 0);
  const nemesisBonus = isNemesis(game, targetId) ? 22 : 0;
  const posture = game.pvpDefensePosture || 'balanced';
  const postureMod = posture === 'low_profile' ? -12 : posture === 'hard_guard' ? -6 : posture === 'trap_house' ? -10 : 0;
  const score = Math.max(0, Math.min(100, Math.round(base + grudge * 0.6 + nemesisBonus + postureMod)));
  if (score >= 70) return { score, label: 'High' };
  if (score >= 40) return { score, label: 'Medium' };
  return { score, label: 'Low' };
}
