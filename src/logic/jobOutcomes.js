export const jobOutcomeTypes = [
  { id: 'clean', title: 'Clean Job', cashMod: 1, xpMod: 1, heatMod: 0, healthMod: 0, loyaltyMod: 1, flavor: 'Clean work. Quiet money. The kind of move crews remember.' },
  { id: 'messy', title: 'Messy Job', cashMod: 1.04, xpMod: 1, heatMod: 3, healthMod: -5, loyaltyMod: 0, flavor: 'The job paid, but it was loud. Cops are paying attention.' },
  { id: 'lucky', title: 'Lucky Break', cashMod: 1.22, xpMod: 1.1, heatMod: 0, healthMod: 0, loyaltyMod: 2, flavor: 'Somebody left money on the table and your crew found it first.' },
  { id: 'setback', title: 'Setback', cashMod: 0.82, xpMod: 0.9, heatMod: 1, healthMod: -7, loyaltyMod: -1, flavor: 'Still profitable, but the street pushed back.' },
  { id: 'rivalNotice', title: 'Rival Notice', cashMod: 1, xpMod: 1, heatMod: 1, healthMod: 0, loyaltyMod: 0, rivalPressure: 5, flavor: 'A rival crew noticed the move. That may come back around.' },
  { id: 'policeAttention', title: 'Police Attention', cashMod: 0.96, xpMod: 1, heatMod: 5, healthMod: 0, loyaltyMod: 0, flavor: 'The money moved, but so did the radio traffic.' },
];

export function chooseJobOutcome(game = {}, job = {}) {
  const seed = (Number(game.jobsRun || 0) + Number(game.heat || 0) + Number(job.energy || 0)) % 100;
  if (seed < 34) return jobOutcomeTypes[0];
  if (seed < 50) return jobOutcomeTypes[1];
  if (seed < 64) return jobOutcomeTypes[2];
  if (seed < 76) return jobOutcomeTypes[3];
  if (seed < 90) return jobOutcomeTypes[4];
  return jobOutcomeTypes[5];
}
