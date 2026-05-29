import React, { useEffect, useMemo, useState } from "react";
import EventBanner from "./components/EventBanner";
import InfluenceLeaderboard from "./components/InfluenceLeaderboard";
import ReputationCallOutButton from "./components/ReputationCallOutButton";
import {
  addConcretePourInfluence,
  getConcretePourJobInfluence,
  getConcretePourPropertyInfluence,
} from "./events/concretePourEventConfig";

const SAVE_KEY = "shadow_syndicate_f2p_phase6b2";
const BASE_MAX_ENERGY = 30;
const MAX_OVERCHARGE_ENERGY = 1630;
const MAX_HEAT = 100;
const HEAT_THRESHOLD = 50;

const DISTRICT_RISK_HEAT = { Low: 1, Medium: 1.35, High: 1.75 };

const DISTRICT_ADJACENCY_BONUSES = {
  southside: [
    {
      from: "docks",
      minControl: 15,
      type: "energyDiscount",
      amount: 0.8,
      label: "Dock logistics reduce Southside expansion energy by 20%.",
    },
  ],
  warehouse: [
    {
      from: "southside",
      minControl: 25,
      type: "cashDiscount",
      amount: 0.9,
      label: "Southside street control reduces Warehouse setup cost by 10%.",
    },
  ],
};

const heatUiText = {
  clean: "Heat is under control. Jobs are paying full value.",
  hot: "Heat is over 50. Rival crews are watching. Job cash is reduced by 20% and rival attacks can trigger.",
  lookouts:
    "Assign crew as Lookouts to burn Heat after each job. Lookouts reduce available crew for other work, but keep the operation clean.",
};

const overchargeUiText = {
  body:
    "Energy normally caps at 30, but bonus Energy can stack up to 1,630. While overcharged, each job has a 10% chance to trigger Burnout: lose 50 Energy, but gain 2x XP from that job.",
  choice:
    "Overcharge is a player choice. Turn it on when you want faster leveling. Turn it off when you want safer grinding.",
};

const bossClasses = [
  {
    id: "boss",
    name: "The Boss",
    short: "Balanced leader",
    image: "/art/characters/boss-profile.jpg",
    bonus: "Balanced growth with no major weakness.",
    attack: 1,
    defense: 1,
    income: 1,
    control: 1,
  },
  {
    id: "ghost",
    name: "The Ghost",
    short: "Move unseen",
    image: "/art/classes/ghost.jpg",
    bonus: "+20% territory expansion gains.",
    attack: 1,
    defense: 1.05,
    income: 1,
    control: 1.2,
  },
  {
    id: "mogul",
    name: "The Mogul",
    short: "Money first",
    image: "/art/classes/mogul.jpg",
    bonus: "+20% property income gains.",
    attack: 1,
    defense: 1,
    income: 1.2,
    control: 1,
  },
  {
    id: "strategist",
    name: "The Strategist",
    short: "Win with brains",
    image: "/art/classes/strategist.jpg",
    bonus: "+10% attack and +10% defense.",
    attack: 1.1,
    defense: 1.1,
    income: 1,
    control: 1,
  },
  {
    id: "foreman",
    name: "The Foreman",
    short: "Crew efficiency",
    image: "/art/characters/enforcer-crew.jpg",
    bonus: "Crew assigned to districts auto-collect income offline.",
    attack: 1,
    defense: 1.05,
    income: 1.05,
    control: 1.05,
  },
  {
    id: "dispatcher",
    name: "The Dispatcher",
    short: "Route boss",
    image: "/art/pages/city-wire.jpg",
    bonus: "First job after changing districts costs 1 less Energy.",
    attack: 1,
    defense: 1,
    income: 1,
    control: 1.1,
  },
  {
    id: "watchman",
    name: "The Watchman",
    short: "Heat control",
    image: "/art/gear/war-room.png",
    bonus: "Lookouts burn 50% more Heat and reduce rival attack chance.",
    attack: 1,
    defense: 1.05,
    income: 1,
    control: 1,
  },
];

const districts = [
  { id: "southside", name: "Southside", level: 1, control: 8, cost: 175, energy: 5, risk: "Low" },
  { id: "docks", name: "Docks", level: 1, control: 15, cost: 150, energy: 5, risk: "Low" },
  { id: "warehouse", name: "Warehouse District", level: 1, control: 0, cost: 375, energy: 7, risk: "Medium" },
  { id: "riverside", name: "Riverside", level: 2, control: 0, cost: 550, energy: 8, risk: "Medium" },
  { id: "nightlife", name: "Nightlife District", level: 2, control: 0, cost: 700, energy: 9, risk: "Medium" },
  { id: "financial", name: "Financial Core", level: 3, control: 0, cost: 1300, energy: 12, risk: "High" },
];

const jobs = [
  {
    id: "dock_shift",
    name: "Work the Docks",
    district: "docks",
    image: "/art/jobs/work-the-docks.jpg",
    level: 1,
    energy: 4,
    cash: [95, 155],
    xp: 8,
    requiredControl: 0,
    heat: 5,
    controlGain: 1,
    tags: ["smuggling", "distribution"],
    desc: "Move quiet cargo through the harbor. This is the safe comeback route if Southside stalls out.",
  },
  {
    id: "southside_collections",
    name: "Southside Collections",
    district: "southside",
    image: "/art/chapters/first-blood-southside.jpg",
    level: 1,
    energy: 5,
    cash: [140, 225],
    xp: 11,
    requiredControl: 5,
    lowControlPenaltyAt: 25,
    lowControlPayoutMultiplier: 0.5,
    heat: 7,
    controlGain: 1,
    tags: ["laundering", "distribution"],
    desc: "Pays half until Southside reaches 25% control. This prevents early Southside spam.",
  },
  {
    id: "warehouse_setup",
    name: "Set Up Warehouse Front",
    district: "warehouse",
    image: "/art/chapters/harbor-money.jpg",
    level: 1,
    energy: 7,
    cash: [240, 380],
    xp: 16,
    requiredControl: 10,
    heat: 10,
    controlGain: 2,
    tags: ["smuggling", "distribution"],
    desc: "Turn an empty building into an operation hub.",
  },
  {
    id: "riverside_runs",
    name: "Riverside Runs",
    district: "riverside",
    image: "/art/rivals/riverside-runners.jpg",
    level: 2,
    energy: 8,
    cash: [340, 520],
    xp: 22,
    requiredControl: 15,
    heat: 12,
    controlGain: 2,
    tags: ["distribution"],
    desc: "Use garages, back roads, and trusted drivers.",
  },
  {
    id: "nightlife_favors",
    name: "Nightlife Favors",
    district: "nightlife",
    image: "/art/rivals/nightlife-cartel.jpg",
    level: 2,
    energy: 9,
    cash: [440, 680],
    xp: 26,
    requiredControl: 20,
    heat: 14,
    controlGain: 3,
    tags: ["laundering"],
    desc: "Shake hands with owners, promoters, and people who hear things.",
  },
  {
    id: "financial_pressure",
    name: "Financial Pressure",
    district: "financial",
    image: "/art/pages/city-wire.jpg",
    level: 3,
    energy: 12,
    cash: [700, 1100],
    xp: 40,
    requiredControl: 25,
    heat: 18,
    controlGain: 4,
    tags: ["financial", "laundering"],
    desc: "Use leverage and timing to make power moves downtown.",
  },
];

const properties = [
  {
    id: "corner_shop",
    name: "Corner Shop",
    district: "southside",
    image: "/art/properties/corner-store.png",
    cost: 900,
    income: 45,
    desc: "Small street-level front that becomes stronger when supplied by docks and garage routes.",
    tags: ["laundering", "distribution"],
    upkeep: {
      heatThreshold: 50,
      penaltyRate: 0.05,
      managerRequired: true,
    },
    supplyLinks: [
      {
        requires: ["dockside_lot", "auto_garage"],
        multiplier: 1.25,
        label: "Docks → Garage → Shop supply chain",
      },
    ],
  },
  {
    id: "dockside_lot",
    name: "Dockside Lot",
    district: "docks",
    image: "/art/properties/dockyard.png",
    cost: 1400,
    income: 80,
    desc: "Harbor access that feeds goods into the city and unlocks smuggling supply chains.",
    tags: ["smuggling", "distribution"],
    upkeep: {
      heatThreshold: 50,
      penaltyRate: 0.05,
      managerRequired: true,
    },
    supplyLinks: [
      {
        requires: ["warehouse_front"],
        multiplier: 1.2,
        label: "Warehouse storage improves dock turnover",
      },
    ],
  },
  {
    id: "auto_garage",
    name: "Auto Garage",
    district: "riverside",
    image: "/art/properties/garage.png",
    cost: 2200,
    income: 125,
    desc: "Vehicles, repairs, drivers, and quiet movement through the city.",
    tags: ["distribution"],
    upkeep: {
      heatThreshold: 50,
      penaltyRate: 0.05,
      managerRequired: true,
    },
    supplyLinks: [
      {
        requires: ["dockside_lot"],
        multiplier: 1.15,
        label: "Dock cargo keeps the garage moving",
      },
    ],
  },
  {
    id: "warehouse_front",
    name: "Warehouse Front",
    district: "warehouse",
    image: "/art/properties/warehouse-front.png",
    cost: 5200,
    income: 310,
    desc: "Storage, staging, and back-room coordination for larger operations.",
    tags: ["smuggling", "distribution"],
    upkeep: {
      heatThreshold: 50,
      penaltyRate: 0.05,
      managerRequired: true,
    },
    supplyLinks: [
      {
        requires: ["dockside_lot", "auto_garage"],
        multiplier: 1.3,
        label: "Dock freight and garage routes create a full distribution loop",
      },
    ],
  },
  {
    id: "empire_nightclub",
    name: "Empire Nightclub",
    district: "nightlife",
    image: "/art/properties/nightclub.png",
    cost: 12500,
    income: 850,
    desc: "Status, cash flow, contacts, and quiet laundering through the nightlife district.",
    tags: ["laundering"],
    upkeep: {
      heatThreshold: 50,
      penaltyRate: 0.05,
      managerRequired: true,
    },
    supplyLinks: [
      {
        requires: ["corner_shop", "warehouse_front"],
        multiplier: 1.25,
        label: "Street cash and warehouse storage feed nightlife laundering",
      },
    ],
  },
  {
    id: "private_equity_front",
    name: "Private Equity Front",
    district: "financial",
    image: "/art/properties/executive-lobby.png",
    cost: 25000,
    income: 1800,
    desc: "Polished paperwork, serious money, and city-level influence.",
    tags: ["laundering", "financial"],
    upkeep: {
      heatThreshold: 50,
      penaltyRate: 0.05,
      managerRequired: true,
    },
    supplyLinks: [
      {
        requires: ["empire_nightclub", "warehouse_front"],
        multiplier: 1.35,
        label: "Nightlife cash and warehouse records support financial control",
      },
    ],
  },
];

const gear = [
  { id: "street_suit", name: "Tailored Street Suit", type: "Style", image: "/art/gear/tailored-suit.png", cost: 500, attack: 1, defense: 2 },
  { id: "armored_sedan", name: "Armored Sedan", type: "Vehicle", image: "/art/gear/armored-sedan.png", cost: 1800, attack: 2, defense: 5 },
  { id: "loyal_enforcer", name: "Loyal Enforcer", type: "Crew Asset", image: "/art/gear/loyal-enforcer.png", cost: 3500, attack: 7, defense: 4 },
  { id: "city_intel", name: "City Intel Network", type: "Influence", image: "/art/gear/war-room.png", cost: 7000, attack: 6, defense: 9 },
];

const rivals = [
  { id: "alley_crew", name: "Alley Crew", district: "southside", image: "/art/chapters/first-blood-southside.jpg", power: 9, reward: [200, 370], xp: 14, control: 4 },
  { id: "dockside_outfit", name: "Dockside Outfit", district: "docks", image: "/art/rivals/dockside-outfit.jpg", power: 18, reward: [420, 660], xp: 27, control: 5 },
  { id: "riverside_runners", name: "Riverside Runners", district: "riverside", image: "/art/rivals/riverside-runners.jpg", power: 28, reward: [575, 850], xp: 35, control: 5 },
  { id: "nightlife_cartel", name: "Nightlife Cartel", district: "nightlife", image: "/art/rivals/nightlife-cartel.jpg", power: 43, reward: [950, 1400], xp: 52, control: 6 },
];

const campaign = [
  {
    id: "c1",
    title: "Chapter 1: First Blood in Southside",
    image: "/art/chapters/first-blood-southside.jpg",
    desc: "Start small, build respect, and take your first piece of the city.",
    missions: [
      { id: "c1_jobs", title: "Make Your First Moves", desc: "Run 3 jobs anywhere in the city.", type: "stats", key: "jobsRun", target: 3, reward: { cash: 500, xp: 25 } },
      { id: "c1_first_win", title: "Send a Message", desc: "Win your first fight against any rival.", type: "wins", target: 1, reward: { cash: 750, xp: 50, skillPoints: 1 } },
      { id: "c1_southside", title: "Claim Southside", desc: "Reach 25% control in Southside.", type: "district", district: "southside", target: 25, reward: { cash: 1000, xp: 60, control: { southside: 5 } } },
      { id: "c1_property", title: "Buy Your First Front", desc: "Buy any property.", type: "properties", target: 1, reward: { cash: 500, energy: 50 } },
      { id: "c1_level", title: "Earn Your Name", desc: "Reach Level 2.", type: "level", target: 2, reward: { tribute: 5, skillPoints: 1 } },
    ],
  },
  {
    id: "c2",
    title: "Chapter 2: Harbor Money",
    image: "/art/chapters/harbor-money.jpg",
    desc: "The docks are where the real cash starts moving.",
    missions: [
      { id: "c2_docks", title: "Control the Harbor", desc: "Reach 35% control in the Docks.", type: "district", district: "docks", target: 35, reward: { cash: 1200, xp: 75 } },
      { id: "c2_dockside_lot", title: "Buy Into the Harbor", desc: "Own the Dockside Lot.", type: "property", property: "dockside_lot", target: 1, reward: { cash: 900, energy: 75 } },
      { id: "c2_dockside_outfit", title: "Break the Dockside Outfit", desc: "Defeat the Dockside Outfit.", type: "rival", rival: "dockside_outfit", target: 1, reward: { cash: 1500, xp: 100, skillPoints: 1 } },
      { id: "c2_city_control", title: "Become a Rising Crew", desc: "Reach 20% overall city control.", type: "city", target: 20, reward: { cash: 2000, tribute: 5, xp: 125 } },
    ],
  },
];

const pageCards = [
  { tab: "jobs", title: "Run Jobs", image: "/ui/run-jobs.png", desc: "Spend energy, earn cash, and build city influence." },
  { tab: "event", title: "Concrete Pour", image: "/art/chapters/first-blood-southside.jpg", desc: "72-hour Southside turf war. Earn Influence. No crates." },
  { tab: "crew", title: "Recruit Crew", image: "/ui/recruit-crew.png", desc: "Build muscle, buy gear, and increase your power." },
  { tab: "territory", title: "Take Districts", image: "/ui/take-districts.png", desc: "Expand control and unlock stronger money routes." },
  { tab: "heat", title: "Control Heat", image: "/art/pages/city-wire.jpg", desc: "Use Lookouts to keep rival attention under control." },
  { tab: "vault", title: "Vault", image: "/art/pages/vault.jpg", desc: "Protect cash from rival attacks." },
  { tab: "clinic", title: "Clinic", image: "/art/pages/clinic.jpg", desc: "Patch up your boss before the next hit." },
];

const defaultTerritory = Object.fromEntries(districts.map((d) => [d.id, d.control]));

const startGame = {
  started: false,
  bossName: "Rookie",
  classId: "boss",
  cash: 750,
  vault: 0,
  tribute: 100,
  influence: 0,
  level: 1,
  xp: 0,
  health: 100,
  maxHealth: 100,
  energy: BASE_MAX_ENERGY,
  maxEnergy: BASE_MAX_ENERGY,
  stamina: 25,
  maxStamina: 25,
  heat: 0,
  lookouts: 0,
  propertyManagers: {},
  overchargeMode: true,
  lastJobDistrict: "",
  crew: 5,
  wins: 0,
  losses: 0,
  skillPoints: 0,
  attackSkill: 0,
  defenseSkill: 0,
  jobsRun: 0,
  territory: defaultTerritory,
  properties: {},
  gear: {},
  beaten: {},
  claimedMissions: {},
  log: ["Welcome to Shadow Syndicate. Build your crew. Claim your city. Rule the underworld."],
};

function money(value) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function xpNeeded(level) {
  return 100 + (level - 1) * 75;
}

function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return startGame;
    return { ...startGame, ...JSON.parse(saved) };
  } catch {
    return startGame;
  }
}

function addLog(game, message) {
  return { ...game, log: [message, ...(game.log || [])].slice(0, 12) };
}

function addXp(game, amount) {
  let next = { ...game, xp: game.xp + amount };

  while (next.xp >= xpNeeded(next.level)) {
    next.xp -= xpNeeded(next.level);
    next.level += 1;
    next.skillPoints += 6;
    next.maxEnergy = BASE_MAX_ENERGY;
    next.energy = clamp((next.energy || 0) + 200, 0, MAX_OVERCHARGE_ENERGY);
    next.maxHealth += 10;
    next.health = next.maxHealth;
    next.stamina = Math.max(next.stamina, next.maxStamina);
    next.crew += 5;
    next = addLog(
      next,
      `Level up. You reached Level ${next.level}, gained 6 skill points, gained +200 Overcharge Energy, and your crew grew by 5.`
    );
  }

  return next;
}

function getDistrict(id) {
  return districts.find((district) => district.id === id);
}

function districtName(id) {
  return districts.find((d) => d.id === id)?.name || id;
}

function getDistrictControl(gameState, districtId) {
  const base = getDistrict(districtId)?.control || 0;
  return gameState.territory?.[districtId] ?? base;
}

function getAdjacencyBonuses(gameState, districtId) {
  const rules = DISTRICT_ADJACENCY_BONUSES[districtId] || [];
  return rules.filter((rule) => getDistrictControl(gameState, rule.from) >= rule.minControl);
}

function getExpandPlan(gameState, district) {
  const currentControl = getDistrictControl(gameState, district.id);
  const bonuses = getAdjacencyBonuses(gameState, district.id);
  let energyCost = district.energy;
  let cashCost = district.cost;

  bonuses.forEach((bonus) => {
    if (bonus.type === "energyDiscount") energyCost = Math.ceil(energyCost * bonus.amount);
    if (bonus.type === "cashDiscount") cashCost = Math.ceil(cashCost * bonus.amount);
  });

  const riskPenalty = district.risk === "High" ? 2 : district.risk === "Medium" ? 1 : 0;
  const logisticsBonus = bonuses.length;
  const crewSupport = Math.min(3, Math.floor((gameState.crew || 0) / 10));
  const bossControlBonus =
    gameState.classId === "ghost"
      ? 1.2
      : gameState.classId === "foreman"
        ? 1.05
        : gameState.classId === "dispatcher"
          ? 1.1
          : 1;
  const baseGain = Math.max(2, rand(4, 8) - riskPenalty + logisticsBonus + crewSupport);
  const controlGain = Math.max(2, Math.round(baseGain * bossControlBonus));

  return {
    currentControl,
    energyCost,
    cashCost,
    controlGain,
    bonuses,
    operationText: bonuses.length > 0 ? bonuses.map((bonus) => bonus.label).join(" / ") : "No logistics support active.",
  };
}

function getAvailableCrew(gameState) {
  return Math.max(0, (gameState.crew || 0) - (gameState.lookouts || 0));
}

function getLookoutHeatBurn(gameState) {
  const baseBurn = (gameState.lookouts || 0) * 4;
  return gameState.classId === "watchman" ? Math.ceil(baseBurn * 1.5) : baseBurn;
}

function getJobHeatGain(job, district) {
  const riskMultiplier = DISTRICT_RISK_HEAT[district.risk] || 1;
  return Math.ceil((job.heat || job.energy || 1) * riskMultiplier);
}

function getHeatPenalty(gameState) {
  if ((gameState.heat || 0) <= HEAT_THRESHOLD) {
    return { cashMultiplier: 1, rivalAttackChance: 0, label: "Clean" };
  }

  const excessHeat = (gameState.heat || 0) - HEAT_THRESHOLD;
  const watchmanReduction = gameState.classId === "watchman" ? 0.5 : 1;

  return {
    cashMultiplier: 0.8,
    rivalAttackChance: Math.min(35, (10 + excessHeat * 0.5) * watchmanReduction),
    label: "Hot",
  };
}

function applyHeatAfterJob(gameState, job, district) {
  const heatGain = getJobHeatGain(job, district);
  const heatBurn = getLookoutHeatBurn(gameState);
  return { ...gameState, heat: clamp((gameState.heat || 0) + heatGain - heatBurn, 0, MAX_HEAT) };
}

function getOwnedPropertyCount(playerState, propertyId) {
  return playerState.properties?.[propertyId] || 0;
}

function playerOwnsProperty(playerState, propertyId) {
  return getOwnedPropertyCount(playerState, propertyId) > 0;
}

function hasSupplyLink(playerState, link) {
  return link.requires.every((propertyId) => playerOwnsProperty(playerState, propertyId));
}

function getPropertyById(propertyId) {
  return properties.find((property) => property.id === propertyId);
}

function getAssignedManagerCount(playerState) {
  return Object.values(playerState.propertyManagers || {}).filter(Boolean).length;
}

function getAvailableManagers(playerState) {
  const availableCrewAfterLookouts = Math.max(0, (playerState.crew || 0) - (playerState.lookouts || 0));
  return Math.max(0, availableCrewAfterLookouts - getAssignedManagerCount(playerState));
}

function propertyHasManager(playerState, propertyId) {
  return !!playerState.propertyManagers?.[propertyId];
}

function getPropertyIncome(propertyId, playerState) {
  const property = getPropertyById(propertyId);

  if (!property) {
    return {
      baseIncome: 0,
      finalIncome: 0,
      multiplier: 1,
      upkeepPenalty: 0,
      activeSupplyLinks: [],
      hasManager: false,
      label: "Property not found.",
    };
  }

  const owned = getOwnedPropertyCount(playerState, propertyId);

  if (owned <= 0) {
    return {
      baseIncome: property.income,
      finalIncome: 0,
      multiplier: 1,
      upkeepPenalty: 0,
      activeSupplyLinks: [],
      hasManager: false,
      label: "Not owned.",
    };
  }

  const activeSupplyLinks = (property.supplyLinks || []).filter((link) =>
    hasSupplyLink(playerState, link)
  );

  const supplyMultiplier = activeSupplyLinks.reduce(
    (multiplier, link) => multiplier * link.multiplier,
    1
  );

  const districtControl = playerState.territory?.[property.district] || 0;
  const controlMultiplier = 1 + Math.floor(districtControl / 25) * 0.05;

  let finalIncome = property.income * owned * supplyMultiplier * controlMultiplier;

  const heatIsHigh = (playerState.heat || 0) > (property.upkeep?.heatThreshold || 50);
  const hasManager = propertyHasManager(playerState, propertyId);

  let upkeepPenalty = 0;

  if (heatIsHigh && property.upkeep?.managerRequired && !hasManager) {
    upkeepPenalty = finalIncome * (property.upkeep.penaltyRate || 0.05);
    finalIncome -= upkeepPenalty;
  }

  return {
    baseIncome: Math.round(property.income * owned),
    finalIncome: Math.max(0, Math.round(finalIncome)),
    multiplier: Number((supplyMultiplier * controlMultiplier).toFixed(2)),
    upkeepPenalty: Math.round(upkeepPenalty),
    activeSupplyLinks,
    hasManager,
    label:
      activeSupplyLinks.length > 0
        ? activeSupplyLinks.map((link) => link.label).join(" / ")
        : "No supply links active.",
  };
}

function getTotalPropertyIncome(playerState) {
  return properties.reduce((total, property) => {
    return total + getPropertyIncome(property.id, playerState).finalIncome;
  }, 0);
}

function getOwnedPropertyTagsInDistrict(playerState, districtId) {
  const tags = new Set();

  properties.forEach((property) => {
    if (property.district !== districtId) return;
    if (!playerOwnsProperty(playerState, property.id)) return;

    (property.tags || []).forEach((tag) => tags.add(tag));
  });

  return Array.from(tags);
}

function getJobPropertySynergy(job, playerState) {
  const ownedTags = getOwnedPropertyTagsInDistrict(playerState, job.district);
  const jobTags = job.tags || [];
  const matchingTags = jobTags.filter((tag) => ownedTags.includes(tag));

  if (matchingTags.length === 0) {
    return {
      multiplier: 1,
      matchingTags: [],
      label: "No property synergy active.",
    };
  }

  return {
    multiplier: 1.15,
    matchingTags,
    label: `Property synergy active: ${matchingTags.join(", ")} +15% cash.`,
  };
}

function getJobPayoutMultiplier(gameState, job) {
  const districtControl = getDistrictControl(gameState, job.district);
  let multiplier = getHeatPenalty(gameState).cashMultiplier;

  if (job.id === "southside_collections" && districtControl < (job.lowControlPenaltyAt || 25)) {
    multiplier *= job.lowControlPayoutMultiplier || 0.5;
  }

  multiplier *= 1 + Math.floor(districtControl / 10) * 0.05;
  if (gameState.classId === "mogul") multiplier *= 1.2;
  if (gameState.classId === "dispatcher" && gameState.lastJobDistrict && gameState.lastJobDistrict !== job.district) multiplier *= 1.05;

  return multiplier;
}

function shouldTriggerBurnout(gameState) {
  if (!gameState.overchargeMode) return false;
  if ((gameState.energy || 0) <= BASE_MAX_ENERGY) return false;
  return Math.random() < 0.1;
}

function applyBurnout(gameState) {
  return { ...gameState, energy: Math.max(0, (gameState.energy || 0) - 50) };
}

function getJobXpReward(job, burnoutTriggered) {
  return burnoutTriggered ? job.xp * 2 : job.xp;
}

export default function App() {
  const [game, setGame] = useState(loadGame);
  const [tab, setTab] = useState("command");
  const [bossName, setBossName] = useState(game.bossName || "Rookie");
  const [classId, setClassId] = useState(game.classId || "boss");
  const [openCompletedChapters, setOpenCompletedChapters] = useState({});

  const bossClass = bossClasses.find((item) => item.id === game.classId) || bossClasses[0];
  const ownedGear = gear.filter((item) => game.gear[item.id]);
  const gearAttack = ownedGear.reduce((sum, item) => sum + item.attack, 0);
  const gearDefense = ownedGear.reduce((sum, item) => sum + item.defense, 0);

  const income = useMemo(() => {
    return Math.round(getTotalPropertyIncome(game) * (bossClass.income || 1));
  }, [game, bossClass]);

  const cityControl = useMemo(() => {
    const total = districts.reduce((sum, d) => sum + (game.territory[d.id] || 0), 0);
    return Math.round(total / districts.length);
  }, [game.territory]);

  const attack = Math.round((10 + getAvailableCrew(game) * 2 + gearAttack + game.attackSkill * 5) * bossClass.attack);
  const defense = Math.round((10 + getAvailableCrew(game) * 2 + gearDefense + game.defenseSkill * 5) * bossClass.defense);
  const heatPenalty = getHeatPenalty(game);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGame((old) => {
        if (!old.started) return old;

        const earned = Math.floor(income / 6);

        let next = {
          ...old,
          cash: old.cash + earned,
          health: Math.min(old.maxHealth, old.health + 3),
          energy: old.energy < old.maxEnergy ? Math.min(old.maxEnergy, old.energy + 1) : old.energy,
          stamina: old.stamina < old.maxStamina ? Math.min(old.maxStamina, old.stamina + 1) : old.stamina,
        };

        if (earned > 0) {
          let eventInfluence = 0;

          properties
            .filter((property) => property.district === "southside")
            .forEach((property) => {
              const incomeData = getPropertyIncome(property.id, old);
              const tickIncome = Math.floor((incomeData.finalIncome * (bossClass.income || 1)) / 6);

              eventInfluence += getConcretePourPropertyInfluence(
                property,
                tickIncome,
                old
              );
            });

          if (eventInfluence > 0) {
            addConcretePourInfluence(
              old.bossName || old.playerName || "Rookie",
              eventInfluence,
              `Southside property income added ${eventInfluence} Concrete Pour Influence.`
            );

            next = addLog(
              next,
              `Concrete Pour Cure: +${eventInfluence} Influence from Southside property income.`
            );
          }

          next = addLog(next, `Properties generated ${money(earned)}.`);
        }

        return next;
      });
    }, 10000);

    return () => clearInterval(timer);
  }, [income, bossClass]);

  function startNewGame() {
    const cleanName = bossName.trim().replace(/\s+/g, " ").slice(0, 22);

    if (cleanName.length < 3 || cleanName.toLowerCase() === "rookie") {
      alert("Enter a boss name with at least 3 characters.");
      return;
    }

    const chosen = bossClasses.find((item) => item.id === classId) || bossClasses[0];

    setGame({
      ...startGame,
      started: true,
      bossName: cleanName,
      classId: chosen.id,
      maxEnergy: BASE_MAX_ENERGY,
      energy: BASE_MAX_ENERGY + 200,
      log: [
        "Daily login bonus: +200 Energy.",
        `You started as ${chosen.name}.`,
        `Your boss name is ${cleanName}.`,
        "Welcome to Shadow Syndicate. Build your crew. Claim your city. Rule the underworld.",
      ],
    });

    setTab("command");
  }

  function runJob(job) {
    setGame((old) => {
      const district = getDistrict(job.district);
      const districtControl = getDistrictControl(old, job.district);

      if (!district) return addLog(old, `District not found for ${job.name}.`);
      if (old.level < district.level || old.level < (job.level || 1)) return addLog(old, `${job.name} unlocks at Level ${Math.max(district.level, job.level || 1)}.`);
      if (districtControl < (job.requiredControl || 0)) return addLog(old, `${job.name} requires ${job.requiredControl}% control in ${district.name}.`);

      let energyCost = job.energy;
      if (old.classId === "dispatcher" && old.lastJobDistrict && old.lastJobDistrict !== job.district) energyCost = Math.max(1, energyCost - 1);
      if ((old.energy || 0) < energyCost) return addLog(old, `Not enough Energy to run ${job.name}.`);

      const burnoutTriggered = shouldTriggerBurnout(old);
      const propertySynergy = getJobPropertySynergy(job, old);
      const payout = Math.round(
        rand(job.cash[0], job.cash[1]) *
          getJobPayoutMultiplier(old, job) *
          propertySynergy.multiplier
      );
      const xpReward = getJobXpReward(job, burnoutTriggered);
      const eventInfluence = getConcretePourJobInfluence(job, old, payout);

      if (eventInfluence > 0) {
        addConcretePourInfluence(
          old.bossName || old.playerName || "Rookie",
          eventInfluence,
          `${job.name} added ${eventInfluence} Concrete Pour Influence.`
        );
      }

      let next = {
        ...old,
        energy: old.energy - energyCost,
        cash: old.cash + payout,
        jobsRun: (old.jobsRun || 0) + 1,
        lastJobDistrict: job.district,
        territory: {
          ...old.territory,
          [job.district]: clamp(districtControl + (job.controlGain || 1), 0, 100),
        },
      };

      if (burnoutTriggered) next = applyBurnout(next);
      next = applyHeatAfterJob(next, job, district);
      next = addXp(next, xpReward);

      const nextHeatPenalty = getHeatPenalty(next);
      if (nextHeatPenalty.rivalAttackChance > 0 && Math.random() * 100 < nextHeatPenalty.rivalAttackChance) {
        const rivalLoss = Math.min(next.cash, Math.max(75, Math.round(next.cash * 0.05)));
        next = addLog({ ...next, cash: next.cash - rivalLoss }, `Heat backlash. Rival crews hit your operation and cost you ${money(rivalLoss)}.`);
      }

      return addLog(
        next,
        `${job.name}: earned ${money(payout)} and ${xpReward} XP. ${propertySynergy.label} ${
          burnoutTriggered ? "Burnout triggered: lost 50 Energy, but earned 2x XP." : ""
        } ${
          eventInfluence > 0 ? `Concrete Pour: +${eventInfluence} Influence.` : ""
        } Heat is now ${next.heat || 0}/${MAX_HEAT}.`
      );
    });
  }

  function expandDistrict(district) {
    setGame((old) => {
      const plan = getExpandPlan(old, district);

      if (old.level < district.level) return addLog(old, `${district.name} unlocks at Level ${district.level}.`);
      if (plan.currentControl >= 100) return addLog(old, `${district.name} is already fully controlled.`);
      if (old.energy < plan.energyCost) return addLog(old, `Not enough Energy to expand ${district.name}. Need ${plan.energyCost} Energy.`);
      if (old.cash < plan.cashCost) return addLog(old, `Not enough cash to expand ${district.name}. Need ${money(plan.cashCost)}.`);

      const newControl = clamp(plan.currentControl + plan.controlGain, 0, 100);

      return addLog(
        {
          ...old,
          cash: old.cash - plan.cashCost,
          energy: old.energy - plan.energyCost,
          territory: { ...old.territory, [district.id]: newControl },
        },
        `${district.name} operation complete. Control increased from ${plan.currentControl}% to ${newControl}%. ${plan.operationText}`
      );
    });
  }

  function buyProperty(property) {
    setGame((old) => {
      if (old.cash < property.cost) return addLog(old, `You need ${money(property.cost)} to buy ${property.name}.`);

      return addLog(
        {
          ...old,
          cash: old.cash - property.cost,
          properties: { ...old.properties, [property.id]: (old.properties[property.id] || 0) + 1 },
        },
        `Purchased ${property.name}.`
      );
    });
  }

  function togglePropertyManager(propertyId) {
    setGame((old) => {
      const alreadyManaged = !!old.propertyManagers?.[propertyId];
      const propertyName = getPropertyById(propertyId)?.name || "property";

      if (alreadyManaged) {
        return addLog(
          {
            ...old,
            propertyManagers: {
              ...(old.propertyManagers || {}),
              [propertyId]: false,
            },
          },
          `Manager removed from ${propertyName}.`
        );
      }

      if (getAvailableManagers(old) <= 0) {
        return addLog(old, "No available crew. Remove a manager somewhere else, remove a Lookout, or recruit more crew.");
      }

      return addLog(
        {
          ...old,
          propertyManagers: {
            ...(old.propertyManagers || {}),
            [propertyId]: true,
          },
        },
        `Manager assigned to ${propertyName}.`
      );
    });
  }

  function buyGear(item) {
    setGame((old) => {
      if (old.gear[item.id]) return addLog(old, `${item.name} is already owned.`);
      if (old.cash < item.cost) return addLog(old, `You need ${money(item.cost)} to buy ${item.name}.`);

      return addLog(
        {
          ...old,
          cash: old.cash - item.cost,
          gear: { ...old.gear, [item.id]: true },
        },
        `Purchased ${item.name}. Attack +${item.attack}, Defense +${item.defense}.`
      );
    });
  }

  function fightRival(rival) {
    setGame((old) => {
      if (old.stamina < 1) return addLog(old, `Not enough stamina to attack ${rival.name}.`);
      if (old.health <= 0) return addLog(old, "You are out of health. Visit the clinic.");

      const won = attack + rand(1, 20) >= rival.power + rand(1, 20);
      let next = { ...old, stamina: old.stamina - 1 };

      if (won) {
        const payout = rand(rival.reward[0], rival.reward[1]);
        next = {
          ...next,
          cash: next.cash + payout,
          wins: next.wins + 1,
          beaten: { ...next.beaten, [rival.id]: true },
          territory: {
            ...next.territory,
            [rival.district]: clamp((next.territory[rival.district] || 0) + rival.control, 0, 100),
          },
        };
        next = addXp(next, rival.xp);
        return addLog(next, `Victory over ${rival.name}. Earned ${money(payout)} and ${rival.xp} XP.`);
      }

      const loss = Math.min(next.cash, rand(75, 240));
      const damage = rand(6, 18);

      return addLog(
        { ...next, cash: next.cash - loss, health: Math.max(0, next.health - damage), losses: next.losses + 1 },
        `Lost to ${rival.name}. Dropped ${money(loss)} and took ${damage} damage.`
      );
    });
  }

  function spendSkill(type) {
    setGame((old) => {
      if (old.skillPoints <= 0) return addLog(old, "You do not have any skill points to spend.");

      if (type === "attack") return addLog({ ...old, skillPoints: old.skillPoints - 1, attackSkill: old.attackSkill + 1 }, "Spent 1 skill point on Attack.");
      if (type === "defense") return addLog({ ...old, skillPoints: old.skillPoints - 1, defenseSkill: old.defenseSkill + 1 }, "Spent 1 skill point on Defense.");
      if (type === "energy") return addLog({ ...old, skillPoints: old.skillPoints - 1, maxEnergy: BASE_MAX_ENERGY, energy: clamp(old.energy + 30, 0, MAX_OVERCHARGE_ENERGY) }, "Spent 1 skill point on Energy. Added +30 bonus Energy.");

      return old;
    });
  }

  function depositVault(percent) {
    setGame((old) => {
      const amount = Math.floor(old.cash * percent);
      if (amount <= 0) return addLog(old, "No cash available to vault.");
      return addLog({ ...old, cash: old.cash - amount, vault: old.vault + amount }, `Moved ${money(amount)} into the vault.`);
    });
  }

  function withdrawVault() {
    setGame((old) => {
      if (old.vault <= 0) return addLog(old, "The vault is empty.");
      return addLog({ ...old, cash: old.cash + old.vault, vault: 0 }, "Withdrew all vault cash.");
    });
  }

  function healBoss() {
    setGame((old) => {
      if (old.health >= old.maxHealth) return addLog(old, "You are already at full health.");
      const cost = Math.max(250, old.maxHealth * 2);
      if (old.cash < cost) return addLog(old, `You need ${money(cost)} to heal.`);
      return addLog({ ...old, cash: old.cash - cost, health: old.maxHealth }, `Clinic visit complete. Healed to ${old.maxHealth}/${old.maxHealth}.`);
    });
  }

  function assignLookouts(count) {
    setGame((old) => {
      const safeCount = clamp(count, 0, old.crew || 0);
      return addLog({ ...old, lookouts: safeCount }, `${safeCount} crew member${safeCount === 1 ? "" : "s"} assigned as Lookouts.`);
    });
  }

  function missionProgress(mission, state = game) {
    if (mission.type === "stats") return state[mission.key] || 0;
    if (mission.type === "wins") return state.wins || 0;
    if (mission.type === "district") return state.territory?.[mission.district] || 0;
    if (mission.type === "property") return state.properties?.[mission.property] || 0;
    if (mission.type === "properties") return Object.values(state.properties || {}).reduce((sum, count) => sum + count, 0);
    if (mission.type === "rival") return state.beaten?.[mission.rival] ? 1 : 0;
    if (mission.type === "level") return state.level || 1;
    if (mission.type === "city") return Math.round(districts.reduce((sum, district) => sum + (state.territory?.[district.id] || 0), 0) / districts.length);
    return 0;
  }

  function missionDone(mission, state = game) {
    return missionProgress(mission, state) >= (mission.target || 1);
  }

  function chapterStatus(chapter, state = game) {
    const total = chapter.missions.length;
    const claimed = chapter.missions.filter((mission) => state.claimedMissions?.[mission.id]).length;
    const ready = chapter.missions.filter((mission) => missionDone(mission, state) && !state.claimedMissions?.[mission.id]).length;
    return { total, claimed, ready, complete: claimed >= total };
  }

  function rewardText(reward = {}) {
    const parts = [];
    if (reward.cash) parts.push(money(reward.cash));
    if (reward.xp) parts.push(`${reward.xp} XP`);
    if (reward.energy) parts.push(`+${reward.energy} Energy`);
    if (reward.tribute) parts.push(`+${reward.tribute} Tribute`);
    if (reward.skillPoints) parts.push(`+${reward.skillPoints} Skill Point${reward.skillPoints === 1 ? "" : "s"}`);
    if (reward.control) Object.entries(reward.control).forEach(([districtId, amount]) => parts.push(`+${amount}% ${districtName(districtId)} control`));
    return parts.join(" / ") || "No reward";
  }

  function claimMission(mission) {
    setGame((old) => {
      if (old.claimedMissions?.[mission.id]) return addLog(old, `${mission.title} has already been claimed.`);
      if (!missionDone(mission, old)) return addLog(old, `${mission.title} is not complete yet.`);

      const reward = mission.reward || {};
      let next = {
        ...old,
        cash: old.cash + (reward.cash || 0),
        energy: clamp(old.energy + (reward.energy || 0), 0, MAX_OVERCHARGE_ENERGY),
        tribute: old.tribute + (reward.tribute || 0),
        skillPoints: old.skillPoints + (reward.skillPoints || 0),
        claimedMissions: { ...(old.claimedMissions || {}), [mission.id]: true },
      };

      if (reward.control) {
        const updatedTerritory = { ...next.territory };
        Object.entries(reward.control).forEach(([districtId, amount]) => {
          updatedTerritory[districtId] = clamp((updatedTerritory[districtId] || 0) + amount, 0, 100);
        });
        next = { ...next, territory: updatedTerritory };
      }

      if (reward.xp) next = addXp(next, reward.xp);
      return addLog(next, `Campaign reward claimed: ${mission.title}. Reward: ${rewardText(reward)}.`);
    });
  }

  function resetGame() {
    if (!confirm("Reset this prototype save?")) return;
    localStorage.removeItem(SAVE_KEY);
    setGame(startGame);
    setBossName("Rookie");
    setClassId("boss");
    setTab("command");
  }

  if (!game.started) {
    return (
      <div className="start-page">
        <div className="start-shell">
          <section className="start-hero">
            <div className="hero-overlay">
              <img src="/logo-shadow-syndicate.png" alt="Shadow Syndicate" className="brand-logo" />
              <p className="tagline">Build your crew. Take the streets. Own the city.</p>
            </div>
          </section>

          <section className="panel welcome-panel">
            <img src="/ui/welcome-city.png" alt="Welcome" />
            <div>
              <p className="kicker">Welcome to the Underworld</p>
              <h1>Start as a nobody. Build the name they all whisper.</h1>
              <p>Recruit your crew, run jobs, buy fronts, hit rivals, and grow your shadow across the city.</p>
            </div>
          </section>

          <section className="panel">
            <p className="kicker">Boss Profile</p>
            <div className="start-grid">
              <label>
                Boss Name
                <input value={bossName} onChange={(e) => setBossName(e.target.value)} maxLength={22} />
              </label>
              <label>
                Starting District
                <input value="Steelgate Docks" readOnly />
              </label>
            </div>

            <div className="class-grid">
              {bossClasses.map((item) => (
                <button key={item.id} className={`class-card ${classId === item.id ? "active" : ""}`} onClick={() => setClassId(item.id)} type="button">
                  <img src={item.image} alt={item.name} />
                  <span>{item.name}</span>
                  <small>{item.short}</small>
                  <small>{item.bonus}</small>
                </button>
              ))}
            </div>

            <button className="primary big" onClick={startNewGame}>New Game</button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="top-hero">
        <div className="top-hero-overlay">
          <div>
            <p className="kicker">Mobile Crime Strategy Prototype</p>
            <img src="/logo-shadow-syndicate.png" alt="Shadow Syndicate" className="top-logo" />
            <p className="tagline">Build your crew. Claim your city. Rule the underworld.</p>
          </div>

          <div className="boss-card">
            <img src={bossClass.image} alt={bossClass.name} />
            <div>
              <p className="kicker">Boss Tag</p>
              <h2>{game.bossName}</h2>
              <p>{bossClass.name}</p>
            </div>
            <div className="level-pill">
              <span>Level</span>
              <strong>{game.level}</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="hud">
        <Stat label="Cash" value={money(game.cash)} helper={`${money(income)}/min`} />
        <Stat label="Vault" value={money(game.vault)} helper="protected" />
        <Stat label="Tribute" value={game.tribute} helper="speed/cosmetic" />
        <Stat label="Health" value={`${game.health}/${game.maxHealth}`} helper="combat" />
        <Stat label="Energy" value={`${game.energy}/${game.maxEnergy}`} helper={(game.energy || 0) > BASE_MAX_ENERGY ? "overcharged" : "jobs"} />
        <Stat label="Stamina" value={`${game.stamina}/${game.maxStamina}`} helper="attacks" />
        <Stat label="Heat" value={`${game.heat || 0}/${MAX_HEAT}`} helper={heatPenalty.label} />
        <Stat label="Power" value={`${attack}/${defense}`} helper="atk / def" />
      </section>

      <nav className="main-nav">
        {[
          ["command", "Command"],
          ["event", "Event"],
          ["campaign", "Campaign"],
          ["jobs", "Jobs"],
          ["heat", "Heat"],
          ["overcharge", "Overcharge"],
          ["territory", "Territory"],
          ["crew", "Crew"],
          ["properties", "Properties"],
          ["rivals", "Rivals"],
          ["vault", "Vault"],
          ["clinic", "Clinic"],
          ["wire", "City Wire"],
          ["log", "Log"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>{label}</button>
        ))}
      </nav>

      <main className="layout">
        <section className="main-panel">
          <EventBanner game={game} setGame={setGame} />

          {tab === "command" && (
            <Panel title="Command Center" sub="Choose your next move and keep the city moving in your direction.">
              <div className="command-grid">
                {pageCards.map((card) => (
                  <button key={card.tab} className="command-card" onClick={() => setTab(card.tab)}>
                    <img src={card.image} alt={card.title} />
                    <div>
                      <h3>{card.title}</h3>
                      <p>{card.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
          )}

          {tab === "event" && (
            <>
              <InfluenceLeaderboard
                playerBossName={game.bossName || game.playerName || "Rookie"}
              />

              <ReputationCallOutButton
                currentBossName={game.bossName || game.playerName || "Rookie"}
                targetBossId="demo_kickwhere"
                targetBossName="KickWhere"
              />
            </>
          )}

          {tab === "campaign" && (
            <Panel title="Campaign" sub="Complete missions, claim rewards, and move chapter by chapter toward controlling the city.">
              <div className="campaign-stack">
                {campaign.map((chapter) => {
                  const status = chapterStatus(chapter);
                  const isComplete = status.complete;
                  const isOpen = !isComplete || openCompletedChapters[chapter.id];

                  return (
                    <div key={chapter.id} className={`campaign-chapter ${isComplete ? "complete" : ""}`}>
                      <div className="chapter-header">
                        <img src={chapter.image} alt={chapter.title} className="chapter-art" />
                        <div className="chapter-copy">
                          <div className="chapter-title-row">
                            <div>
                              <p className="kicker">Campaign Chapter</p>
                              <h3>{chapter.title}</h3>
                              <p>{chapter.desc}</p>
                            </div>
                            <div className="chapter-status">
                              <strong>{status.claimed}/{status.total}</strong>
                              <span>{isComplete ? "Complete" : status.ready > 0 ? `${status.ready} Ready` : "Open"}</span>
                            </div>
                          </div>

                          <Progress label="Chapter Progress" value={status.claimed} max={status.total} />

                          {isComplete && (
                            <button type="button" className="secondary chapter-toggle" onClick={() => setOpenCompletedChapters((old) => ({ ...old, [chapter.id]: !old[chapter.id] }))}>
                              {isOpen ? "Collapse Chapter" : "View Chapter"}
                            </button>
                          )}
                        </div>
                      </div>

                      {!isOpen && isComplete && <div className="collapsed-note">Chapter complete. Missions are collapsed to keep the campaign screen shorter.</div>}

                      {isOpen && (
                        <div className="mission-list">
                          {chapter.missions.map((mission) => {
                            const progress = missionProgress(mission);
                            const target = mission.target || 1;
                            const done = missionDone(mission);
                            const claimed = !!game.claimedMissions?.[mission.id];

                            return (
                              <div key={mission.id} className={`mission-card ${claimed ? "claimed" : done ? "ready" : ""}`}>
                                <div className="mission-top">
                                  <div>
                                    <h4>{mission.title}</h4>
                                    <p>{mission.desc}</p>
                                  </div>
                                  <span className="mission-badge">{claimed ? "Claimed" : done ? "Ready" : "Open"}</span>
                                </div>
                                <Progress label="Progress" value={Math.min(progress, target)} max={target} />
                                <Info label="Reward" value={rewardText(mission.reward)} />
                                <button type="button" className="primary" disabled={!done || claimed} onClick={() => claimMission(mission)}>
                                  {claimed ? "Reward Claimed" : done ? "Claim Reward" : "Not Complete"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === "jobs" && (
            <Panel title="City Jobs" sub="Spend energy to earn cash, XP, district control, Heat, and event Influence.">
              <div className="card-grid">
                {jobs.map((job) => {
                  const districtControl = getDistrictControl(game, job.district);
                  const payoutMultiplier = getJobPayoutMultiplier(game, job);
                  const district = getDistrict(job.district);
                  const heatGain = district ? getJobHeatGain(job, district) : job.heat || 0;

                  return (
                    <ArtCard key={job.id} title={job.name} image={job.image} tag={districtName(job.district)} desc={job.desc}>
                      <Info label="Energy" value={job.energy} />
                      <Info label="Payout" value={`${money(Math.round(job.cash[0] * payoutMultiplier))} - ${money(Math.round(job.cash[1] * payoutMultiplier))}`} />
                      <Info label="District Control" value={`${districtControl}%`} />
                      <Info label="Heat Added" value={`+${heatGain}`} />
                      <Info label="XP" value={job.xp} />
                      <button className="primary" onClick={() => runJob(job)}>
                        {(game.energy || 0) > BASE_MAX_ENERGY && game.overchargeMode ? "Run Job Hot" : "Run Job"}
                      </button>
                    </ArtCard>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === "heat" && (
            <Panel title="Heat" sub="Every job creates attention. Assign Lookouts to keep the operation clean.">
              <PageHero image="/art/pages/city-wire.jpg" title="Keep the Jobsite Clean" desc="Run too loud and rivals start watching. Lookouts work like spotters: they control exposure before it turns into damage." />
              <div className="mini-grid">
                <Stat label="Current Heat" value={`${game.heat || 0}/${MAX_HEAT}`} helper={getHeatPenalty(game).label} />
                <Stat label="Lookouts" value={game.lookouts || 0} helper="assigned crew" />
                <Stat label="Available Crew" value={getAvailableCrew(game)} helper="working crew" />
                <Stat label="Heat Burn" value={getLookoutHeatBurn(game)} helper="per job" />
              </div>
              <div className="button-row">
                <button className="secondary" onClick={() => assignLookouts(Math.max(0, (game.lookouts || 0) - 1))}>Remove Lookout</button>
                <button className="primary" onClick={() => assignLookouts((game.lookouts || 0) + 1)}>Add Lookout</button>
              </div>
              <p className="soft-text">{(game.heat || 0) > HEAT_THRESHOLD ? heatUiText.hot : heatUiText.clean}</p>
              <p className="soft-text">{heatUiText.lookouts}</p>
            </Panel>
          )}

          {tab === "overcharge" && (
            <Panel title="Overcharge" sub={overchargeUiText.body}>
              <PageHero image="/art/pages/vault.jpg" title="No Energy Wall" desc="Energy has a normal cap, but bonus Energy stacks above it. You decide when to run hot." />
              <div className="mini-grid">
                <Stat label="Energy Cap" value={BASE_MAX_ENERGY} helper="normal cap" />
                <Stat label="Current Energy" value={game.energy || 0} helper={(game.energy || 0) > BASE_MAX_ENERGY ? "overcharged" : "normal"} />
                <Stat label="Max Overcharge" value={MAX_OVERCHARGE_ENERGY} helper="hard ceiling" />
                <Stat label="Burnout Chance" value={(game.energy || 0) > BASE_MAX_ENERGY ? "10%" : "None"} helper="per job" />
              </div>
              <button className={game.overchargeMode ? "danger" : "secondary"} onClick={() => setGame((old) => ({ ...old, overchargeMode: !old.overchargeMode }))}>
                {game.overchargeMode ? "Overcharge ON" : "Overcharge OFF"}
              </button>
              <p className="soft-text">{overchargeUiText.choice}</p>
            </Panel>
          )}

          {tab === "territory" && (
            <Panel title="Territory Map" sub="Expand district control to unlock opportunities and increase influence. Docks can create logistics bonuses for Southside.">
              <div className="card-grid">
                {districts.map((district) => {
                  const plan = getExpandPlan(game, district);
                  return (
                    <Card key={district.id} title={district.name} tag={district.risk}>
                      <Progress label="Control" value={game.territory[district.id] || 0} max={100} />
                      <Info label="Unlock Level" value={district.level} />
                      <Info label="Cost" value={`${money(plan.cashCost)} / ${plan.energyCost} Energy`} />
                      <Info label="Expected Gain" value={`+${plan.controlGain}%`} />
                      <Info label="Logistics" value={plan.bonuses.length ? "Active" : "None"} />
                      <button className="primary" onClick={() => expandDistrict(district)}>Expand</button>
                    </Card>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === "crew" && (
            <Panel title="Crew & Gear" sub="Build your crew, assign Lookouts, spend skill points, and buy permanent upgrades.">
              <div className="mini-grid">
                <Stat label="Crew" value={game.crew} helper="total members" />
                <Stat label="Available Crew" value={getAvailableCrew(game)} helper="not on lookout" />
                <Stat label="Lookouts" value={game.lookouts || 0} helper="burn Heat" />
                <Stat label="Skill Points" value={game.skillPoints} helper="unspent" />
              </div>
              <div className="button-row">
                <button className="primary" onClick={() => spendSkill("attack")}>Add Attack</button>
                <button className="primary" onClick={() => spendSkill("defense")}>Add Defense</button>
                <button className="primary" onClick={() => spendSkill("energy")}>Add Energy</button>
                <button className="secondary" onClick={() => assignLookouts((game.lookouts || 0) + 1)}>Add Lookout</button>
                <button className="secondary" onClick={() => assignLookouts(Math.max(0, (game.lookouts || 0) - 1))}>Remove Lookout</button>
              </div>
              <div className="card-grid">
                {gear.map((item) => (
                  <ArtCard key={item.id} title={item.name} image={item.image} tag={item.type}>
                    <Info label="Cost" value={money(item.cost)} />
                    <Info label="Attack" value={`+${item.attack}`} />
                    <Info label="Defense" value={`+${item.defense}`} />
                    <button className="primary" disabled={game.gear[item.id]} onClick={() => buyGear(item)}>{game.gear[item.id] ? "Owned" : "Buy Gear"}</button>
                  </ArtCard>
                ))}
              </div>
            </Panel>
          )}

          {tab === "properties" && (
            <Panel title="Properties" sub="Buy fronts and build supply chains. Linked properties boost each other, and managers protect income when Heat gets high.">
              <div className="mini-grid">
                <Stat label="Total Income" value={`${money(income)}/min`} helper="after links/upkeep" />
                <Stat label="Heat" value={`${game.heat || 0}/${MAX_HEAT}`} helper={(game.heat || 0) > HEAT_THRESHOLD ? "upkeep active" : "clean"} />
                <Stat label="Managers" value={getAssignedManagerCount(game)} helper={`${getAvailableManagers(game)} crew available`} />
                <Stat label="Owned Fronts" value={Object.values(game.properties || {}).reduce((sum, count) => sum + count, 0)} helper="property count" />
              </div>

              <div className="card-grid">
                {properties.map((property) => {
                  const incomeData = getPropertyIncome(property.id, game);
                  const owned = game.properties[property.id] || 0;

                  return (
                    <ArtCard key={property.id} title={property.name} image={property.image} tag={districtName(property.district)} desc={property.desc}>
                      <Info label="Owned" value={owned} />
                      <Info label="Cost" value={money(property.cost)} />
                      <Info label="Tags" value={(property.tags || []).join(", ")} />
                      <Info label="Base Income" value={`${money(incomeData.baseIncome)}/min`} />
                      <Info label="Final Income" value={`${money(Math.round(incomeData.finalIncome * (bossClass.income || 1)))}/min`} />
                      <Info label="Supply Links" value={incomeData.label} />
                      <Info label="Heat Upkeep" value={incomeData.upkeepPenalty > 0 ? `-${money(incomeData.upkeepPenalty)}/min` : "None"} />
                      <Info label="Manager" value={incomeData.hasManager ? "Assigned" : "None"} />

                      <div className="button-row">
                        <button className="primary" onClick={() => buyProperty(property)}>Buy Property</button>

                        {owned > 0 && (
                          <button className="secondary" onClick={() => togglePropertyManager(property.id)}>
                            {incomeData.hasManager ? "Remove Manager" : "Assign Manager"}
                          </button>
                        )}
                      </div>
                    </ArtCard>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === "rivals" && (
            <Panel title="Rivals" sub="Challenge rival crews for cash, XP, and control.">
              <div className="card-grid">
                {rivals.map((rival) => (
                  <ArtCard key={rival.id} title={rival.name} image={rival.image} tag={districtName(rival.district)}>
                    <Info label="Power" value={rival.power} />
                    <Info label="Reward" value={`${money(rival.reward[0])} - ${money(rival.reward[1])}`} />
                    <Info label="Status" value={game.beaten[rival.id] ? "Defeated" : "Open"} />
                    <button className="danger" onClick={() => fightRival(rival)}>Attack Rival</button>
                  </ArtCard>
                ))}
              </div>
            </Panel>
          )}

          {tab === "vault" && (
            <Panel title="Vault" sub="Move exposed cash into protected storage.">
              <PageHero image="/art/pages/vault.jpg" title="Protected Money" desc="Cash in the vault cannot be taken by rivals in this prototype." />
              <div className="button-row">
                <button className="primary" onClick={() => depositVault(0.5)}>Vault 50%</button>
                <button className="primary" onClick={() => depositVault(1)}>Vault All</button>
                <button className="secondary" onClick={withdrawVault}>Withdraw Vault</button>
              </div>
            </Panel>
          )}

          {tab === "clinic" && (
            <Panel title="Clinic" sub="Patch yourself up before the next move.">
              <PageHero image="/art/pages/clinic.jpg" title="Backroom Clinic" desc="Health matters. A broke boss cannot hold the city." />
              <button className="danger" onClick={healBoss}>Heal Boss</button>
            </Panel>
          )}

          {tab === "wire" && (
            <Panel title="City Wire" sub="Street updates, rumors, and prototype status.">
              <PageHero image="/art/pages/city-wire.jpg" title="City Wire" desc="Live multiplayer systems will come later. For now, this is a local playable demo base." />
            </Panel>
          )}

          {tab === "log" && (
            <Panel title="Activity Log" sub="Recent game actions.">
              <div className="log-list">
                {game.log.map((line, index) => <div key={`${line}-${index}`} className="log-item">{line}</div>)}
              </div>
            </Panel>
          )}
        </section>

        <aside className="sidebar">
          <Panel title="Empire Status">
            <Info label="Boss Class" value={bossClass.name} />
            <Info label="City Control" value={`${cityControl}%`} />
            <Info label="Income" value={`${money(income)}/min`} />
            <Info label="Crew" value={game.crew} />
            <Info label="Lookouts" value={game.lookouts || 0} />
            <Info label="Available Crew" value={getAvailableCrew(game)} />
            <Info label="Heat" value={`${game.heat || 0}/${MAX_HEAT}`} />
            <Info label="Wins" value={game.wins} />
            <Info label="Losses" value={game.losses} />
            <Info label="Attack" value={attack} />
            <Info label="Defense" value={defense} />
          </Panel>

          <Panel title="Boss Bonus">
            <p className="soft-text">{bossClass.bonus}</p>
          </Panel>

          <Panel title="Overcharge">
            <Info label="Mode" value={game.overchargeMode ? "On" : "Off"} />
            <Info label="Energy" value={`${game.energy}/${game.maxEnergy}`} />
            <Info label="Burnout" value={(game.energy || 0) > BASE_MAX_ENERGY && game.overchargeMode ? "10% per job" : "None"} />
          </Panel>

          <Panel title="District Control">
            {districts.map((district) => (
              <Progress key={district.id} label={district.name} value={game.territory[district.id] || 0} max={100} />
            ))}
          </Panel>

          <button className="reset" onClick={resetGame}>Reset Prototype Save</button>
        </aside>
      </main>

      <nav className="bottom-nav">
        {[
          ["command", "Home"],
          ["jobs", "Jobs"],
          ["event", "Event"],
          ["rivals", "Fight"],
          ["crew", "Crew"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>{label}</button>
        ))}
      </nav>
    </div>
  );
}

function Panel({ title, sub, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, helper }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  );
}

function Card({ title, tag, desc, children }) {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>{title}</h3>
          {desc && <p>{desc}</p>}
        </div>
        {tag && <span>{tag}</span>}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function ArtCard({ title, image, tag, desc, children }) {
  return (
    <div className="art-card">
      <img src={image} alt={title} />
      <div className="art-card-content">
        <div className="card-head">
          <div>
            <h3>{title}</h3>
            {desc && <p>{desc}</p>}
          </div>
          {tag && <span>{tag}</span>}
        </div>
        <div className="card-body">{children}</div>
      </div>
    </div>
  );
}

function PageHero({ image, title, desc }) {
  return (
    <div className="page-hero">
      <img src={image} alt={title} />
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Progress({ label, value, max }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="progress">
      <div>
        <span>{label}</span>
        <strong>{value}/{max}</strong>
      </div>
      <div className="bar">
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}