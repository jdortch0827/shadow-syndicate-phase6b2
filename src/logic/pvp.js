export const defensePostures = [
  { id: 'low_profile', name: 'Low Profile', desc: 'Lower chance of being targeted, but weaker if attacked.', defenseMod: -0.08, heatMod: -2, cost: 0 },
  { id: 'balanced', name: 'Balanced Defense', desc: 'Normal defense and normal heat.', defenseMod: 0, heatMod: 0, cost: 0 },
  { id: 'hard_guard', name: 'Hard Guard', desc: 'Higher defense, but more heat from visible muscle.', defenseMod: 0.16, heatMod: 3, cost: 250 },
  { id: 'trap_house', name: 'Trap House', desc: 'Chance to punish attackers, but costs cash and loyalty.', defenseMod: 0.08, heatMod: 5, cost: 500, loyaltyCost: 2 }
];

export function getGrudgeTier(value = 0) {
  const v = Number(value || 0);
  if (v >= 100) return { label: 'War', className: 'war' };
  if (v >= 75) return { label: 'Personal', className: 'personal' };
  if (v >= 50) return { label: 'Heated', className: 'heated' };
  if (v >= 25) return { label: 'Watching', className: 'watching' };
  return { label: 'Cold', className: 'cold' };
}

export function classifyTarget(playerPower = 0, targetPower = 0) {
  const diff = targetPower - playerPower;
  if (diff <= -55) return 'Easy Pickings';
  if (diff <= 35) return 'Even Match';
  if (diff <= 110) return 'Dangerous Rival';
  return 'High-Value Target';
}

export function simulatePvpAttack({ game, target, playerAttack, playerDefense, powerScore }) {
  const heatPenalty = Math.max(0, Number(game.heat || 0) * 0.12);
  const loyaltyBonus = (Number(game.crewLoyalty ?? 75) - 60) * 0.12;
  const healthPenalty = Number(game.health || 0) < 35 ? 12 : 0;
  const random = Math.random() * 42 - 16;
  const targetDefense = Number(target.defenseRating || target.powerScore * 0.35);
  const score = Number(playerAttack || 0) + loyaltyBonus - heatPenalty - healthPenalty + random - targetDefense;
  let outcome = 'Close Call';
  if (score >= 38) outcome = 'Clean Win';
  else if (score >= 14) outcome = 'Messy Win';
  else if (score >= -8) outcome = 'Close Call';
  else if (score >= -28) outcome = 'Failed Hit';
  else if (score >= -52) outcome = 'Bad Loss';
  else outcome = 'Rival Trap';

  const win = ['Clean Win','Messy Win','Close Call'].includes(outcome);
  const cashBase = Math.max(150, Math.round(Number(target.powerScore || 100) * (win ? 5.5 : 1.2)));
  const isNewPlayer = Number(game.level || 1) <= 2 || Number(game.jobsRun || 0) < 5;
  const maxEarlyLoss = Math.max(75, Math.round(Number(game.cash || 0) * 0.18));
  const normalLoss = Math.min(Number(game.cash || 0), Math.round(cashBase * 0.45));
  const cashDelta = win ? cashBase : -Math.min(normalLoss, isNewPlayer ? maxEarlyLoss : normalLoss);
  const respectDelta = win ? (outcome === 'Clean Win' ? 18 : outcome === 'Messy Win' ? 12 : 7) : (isNewPlayer ? -3 : (outcome === 'Rival Trap' ? -12 : -6));
  const rawHealthLoss = win ? (outcome === 'Clean Win' ? 4 : outcome === 'Messy Win' ? 12 : 18) : (outcome === 'Rival Trap' ? 38 : 25);
  const healthLoss = isNewPlayer ? Math.min(rawHealthLoss, 16) : rawHealthLoss;
  const heatGain = win ? (outcome === 'Clean Win' ? 5 : 8) : (isNewPlayer ? 6 : 10);
  const grudgeGain = win ? 18 + Math.round(Math.max(0, cashDelta) / 300) : 10;
  const turfGain = win ? (outcome === 'Clean Win' ? 3 : 1) : 0;
  const revengeRisk = Math.min(100, Math.round((target.powerScore || 100) / Math.max(80, powerScore || 100) * 35 + grudgeGain));

  return { outcome, win, cashDelta, respectDelta, healthLoss, heatGain, grudgeGain, turfGain, revengeRisk };
}

export function makeAttackLogLine(target, result) {
  if (result.win) return `You hit ${target.bossName}'s ${target.crewName} and walked away with $${Math.max(0, result.cashDelta).toLocaleString()}.`;
  return `${target.bossName}'s ${target.crewName} turned your hit into a lesson. You lost $${Math.abs(result.cashDelta).toLocaleString()}.`;
}

export function makeStreetChatLine(target, result) {
  if (result.outcome === 'Clean Win') return `Word is you embarrassed ${target.crewName}. People are starting to pick sides.`;
  if (result.win) return `${target.bossName} noticed that hit. Expect the ${target.crewName} to remember it.`;
  if (result.outcome === 'Rival Trap') return `${target.bossName} baited somebody into a trap tonight. Your crew knows who it was.`;
  return `${target.crewName} has been telling people your last move looked weak.`;
}
