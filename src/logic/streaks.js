export function updateActionStreaks(game = {}, type = '') {
  const streaks = { ...(game.streaks || {}) };
  if (type === 'job') streaks.job = Number(streaks.job || 0) + 1;
  if (type === 'revenge') streaks.revenge = Number(streaks.revenge || 0) + 1;
  if (type === 'defense') streaks.defense = Number(streaks.defense || 0) + 1;
  if (type === 'bounty') streaks.bounty = Number(streaks.bounty || 0) + 1;
  return { ...game, streaks };
}

export function getStreakCards(game = {}) {
  const s = game.streaks || {};
  return [
    { id: 'job', title: 'Job Streak', value: Number(s.job || 0), detail: '3 successful jobs in a row starts bonus cash testing.' },
    { id: 'revenge', title: 'Revenge Streak', value: Number(s.revenge || 0), detail: '2 revenge wins in a row boosts respect momentum.' },
    { id: 'defense', title: 'Defense Streak', value: Number(s.defense || 0), detail: 'Holding the line improves street reputation.' },
  ].filter((item) => item.value > 0);
}
