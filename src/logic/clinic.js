export function clampHealth(value, maxHealth) {
  return Math.max(0, Math.min(Number(maxHealth || 100), Number(value || 0)));
}

export function getClinicOptions(game = {}, discount = 0) {
  const maxHealth = Number(game.maxHealth || 100);
  const health = clampHealth(game.health, maxHealth);
  const cash = Number(game.cash || 0);
  const safeDiscount = Math.min(0.35, Math.max(0, Number(discount || 0)));
  const makeCost = (base) => Math.max(50, Math.round(base * (1 - safeDiscount)));
  const missing = Math.max(0, maxHealth - health);

  return [
    {
      id: "patch",
      title: "Patch Up",
      desc: "Cheap partial heal. Good when you are hurt but not desperate.",
      cost: makeCost(175),
      healAmount: Math.max(18, Math.round(maxHealth * 0.3)),
      heatReduction: 0,
      consequence: "No extra attention.",
      disabled: missing <= 0 || cash < makeCost(175),
    },
    {
      id: "full",
      title: "Full Treatment",
      desc: "More expensive. Restores the boss to full health.",
      cost: makeCost(Math.max(250, maxHealth * 2)),
      healAmount: missing,
      full: true,
      heatReduction: 0,
      consequence: "Back to full strength.",
      disabled: missing <= 0 || cash < makeCost(Math.max(250, maxHealth * 2)),
    },
    {
      id: "laylow",
      title: "Lay Low Recovery",
      desc: "Recover health and cool the streets at the same time.",
      cost: makeCost(450),
      healAmount: Math.max(26, Math.round(maxHealth * 0.45)),
      heatReduction: 12,
      consequence: "Costs more, but lowers Heat.",
      disabled: (missing <= 0 && Number(game.heat || 0) <= 0) || cash < makeCost(450),
    },
    {
      id: "emergency",
      title: "Emergency Recovery",
      desc: "For when you got dropped. Gets you moving again with a loyalty consequence.",
      cost: makeCost(125),
      healAmount: Math.max(35, Math.round(maxHealth * 0.4)),
      emergency: true,
      loyaltyLoss: 3,
      heatReduction: 0,
      consequence: "Crew loyalty drops slightly.",
      disabled: health > 20 || cash < makeCost(125),
    },
  ];
}
