export const jobChoices = [
  { id: 'quiet', label: 'Quiet Move', desc: 'Safer cash. Less heat and almost no rival attention.', cashMod: 0.78, heatMod: -2, controlMod: 0.8, rivalNotice: 0 },
  { id: 'standard', label: 'Standard Move', desc: 'Balanced reward, normal heat, normal risk.', cashMod: 1, heatMod: 0, controlMod: 1, rivalNotice: 1 },
  { id: 'aggressive', label: 'Aggressive Push', desc: 'More money and turf, but louder and more likely to draw attention.', cashMod: 1.22, heatMod: 3, controlMod: 1.25, rivalNotice: 3 },
  { id: 'setup', label: 'Setup Move', desc: 'Lower reward now. Sets up a smoother next move and keeps heat lower.', cashMod: 0.9, heatMod: -1, controlMod: 0.9, rivalNotice: 0, setup: true },
];
