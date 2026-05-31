export const jobChoices = [
  { id: 'quiet', label: 'Quiet Move', desc: 'Less cash, less heat.', cashMod: 0.72, heatMod: -2, controlMod: 0.75, rivalNotice: 0 },
  { id: 'standard', label: 'Standard Move', desc: 'Normal reward and normal risk.', cashMod: 1, heatMod: 0, controlMod: 1, rivalNotice: 1 },
  { id: 'aggressive', label: 'Aggressive Push', desc: 'More cash and turf, more heat and rival attention.', cashMod: 1.28, heatMod: 3, controlMod: 1.35, rivalNotice: 4 },
  { id: 'setup', label: 'Setup Move', desc: 'Lower reward now, better rhythm for the next action.', cashMod: 0.86, heatMod: -1, controlMod: 0.9, rivalNotice: 0, setup: true },
];
