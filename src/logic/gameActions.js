export function createActionResult({ nextGame, result, logMessage, streetChatMessage, storePrompt } = {}) {
  return { nextGame, result, logMessage, streetChatMessage, storePrompt };
}

export function blockAction(message, title = 'Action Blocked') {
  return createActionResult({
    nextGame: null,
    result: { title, flavor: message, details: [message] },
    logMessage: message,
  });
}

export function describeActionDelta({ cash = 0, xp = 0, heat = 0, health = 0, respect = 0, turf = 0 } = {}) {
  return [
    cash ? `${cash > 0 ? '+' : '-'}$${Math.abs(cash).toLocaleString()} Cash` : null,
    xp ? `${xp > 0 ? '+' : ''}${xp} XP` : null,
    heat ? `${heat > 0 ? '+' : ''}${heat} Heat` : null,
    health ? `${health > 0 ? '+' : ''}${health} Health` : null,
    respect ? `${respect > 0 ? '+' : ''}${respect} Respect` : null,
    turf ? `${turf > 0 ? '+' : ''}${turf}% Turf` : null,
  ].filter(Boolean);
}
