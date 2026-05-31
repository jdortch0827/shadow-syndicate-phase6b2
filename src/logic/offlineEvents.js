export function shouldRunOfflineEvent(game = {}, now = Date.now()) {
  const last = Number(game.lastSeenAt || 0);
  if (!last) return false;
  return now - last > 1000 * 60 * 25;
}

export function simulateOfflineEvent(game = {}, targets = [], defensePostures = {}) {
  const cash = Number(game.cash || 0);
  const heat = Number(game.heat || 0);
  const defenseKey = game.pvpDefensePosture || 'balanced';
  const postureMap = Array.isArray(defensePostures) ? Object.fromEntries(defensePostures.map((item) => [item.id, item])) : defensePostures;
  const posture = postureMap[defenseKey] || postureMap.balanced || { defenseMod: 0, defenseBonus: 0, targetChanceMod: 1 };
  const nemesisTargets = targets.filter((item) => game.pvpNemesisMap?.[item.id]);
  const pool = nemesisTargets.length && Math.random() > 0.35 ? nemesisTargets : targets;
  const target = pool[Math.abs((cash + heat + Number(game.level || 1)) % Math.max(1, pool.length))] || pool[0];
  if (!target) return { nextGame: game, event: null };

  const defenseHold = (Number(game.defense || 0) + Number(posture.defenseBonus || 0) + Number(posture.defenseMod || 0) * 100 + Number(game.crewLoyalty || 75) / 3) >= (target.attackRating || 80) * 0.72;
  const lostCash = defenseHold ? 0 : Math.min(cash, Math.max(75, Math.round((target.powerScore || 100) * 1.4)));
  const grudge = Math.min(100, Number(game.pvpGrudges?.[target.id] || 0) + (defenseHold ? 8 : 16));
  const logItem = {
    id: `offline-${Date.now()}`,
    targetId: target.id,
    targetName: target.bossName,
    title: defenseHold ? 'Defense Held' : 'Rival Hit Your Front',
    outcome: defenseHold ? 'Defense Held' : 'You Got Hit',
    line: defenseHold ? `${target.bossName} tested your defense. Your crew held the line.` : `${target.bossName} hit one of your fronts and took $${lostCash.toLocaleString()}.`,
    at: Date.now(),
  };
  const event = {
    title: defenseHold ? `${target.bossName} tested your defense.` : `${target.bossName} hit your operation.`,
    flavor: defenseHold ? 'Your crew held the line while you were away.' : 'A revenge opportunity is waiting. This is how grudges start.',
    details: defenseHold ? ['+8 Respect', `Grudge: ${grudge}/100`] : [`Lost $${lostCash.toLocaleString()}`, 'Revenge available', `Grudge: ${grudge}/100`],
  };
  let nextGame = {
    ...game,
    cash: Math.max(0, cash - lostCash),
    respect: Number(game.respect || 0) + (defenseHold ? 8 : 0),
    pvpGrudges: { ...(game.pvpGrudges || {}), [target.id]: grudge },
    pvpAttackLog: [logItem, ...(game.pvpAttackLog || [])].slice(0, 50),
    lastOfflineEventAt: Date.now(),
  };
  if (!defenseHold) {
    nextGame = {
      ...nextGame,
      pvpRevengeList: [{ id: `rev-${Date.now()}`, targetId: target.id, targetName: target.bossName, taken: lostCash, powerScore: target.powerScore, reason: 'Offline hit', at: Date.now() }, ...(game.pvpRevengeList || [])].slice(0, 20),
      pvpRivalHistory: {
        ...(game.pvpRivalHistory || {}),
        [target.id]: {
          ...((game.pvpRivalHistory || {})[target.id] || {}),
          rivalAttacks: Number(((game.pvpRivalHistory || {})[target.id] || {}).rivalAttacks || 0) + 1,
          cashStolenFromYou: Number(((game.pvpRivalHistory || {})[target.id] || {}).cashStolenFromYou || 0) + lostCash,
          lastEvent: `Hit you for $${lostCash.toLocaleString()}`,
        },
      },
    };
  }
  return { nextGame, event };
}
