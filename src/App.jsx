import React, { useEffect, useMemo, useState } from "react";
import EventBanner from "./components/EventBanner";
import InfluenceLeaderboard from "./components/InfluenceLeaderboard";
import ReputationCallOutButton from "./components/ReputationCallOutButton";
import {
  addConcretePourInfluence,
  addConcretePourContractInfluence,
  getConcretePourJobInfluence,
  getConcretePourPropertyInfluence,
  getConcretePourPhase,
  getConcretePourState,
  isTargetAllowedForConcretePour,
} from "./events/concretePourEventConfig";
import tributeStoreItems from "./data/tributeStore.json";

const SAVE_KEY = "shadow_syndicate_f2p_phase6b2";
const STREET_CHAT_KEY = "shadow_syndicate_street_chat_local_v2";
const COMEBACK_USED_KEY = "shadow_syndicate_harbor_comeback_used_v1";

const BASE_MAX_ENERGY = 30;
const MAX_OVERCHARGE_ENERGY = 1630;
const MAX_HEAT = 100;
const HEAT_THRESHOLD = 50;

const COMEBACK_DURATION_MS = 48 * 60 * 60 * 1000;
const COMEBACK_OFFLINE_MS = 24 * 60 * 60 * 1000;
const COMEBACK_END_LEVEL = 6;
const COMEBACK_JOB_ID = "dock_shift";

const CONTRACT_ENERGY_COST = 2;
const CONTRACT_CREW_LOCK_MS = 10 * 60 * 1000;
const RETALIATION_CONTRACT_EXPIRE_MS = 60 * 60 * 1000;
const MARKED_DURATION_MS = 24 * 60 * 60 * 1000;
const HIGH_HEAT_THRESHOLD = 50;
const TOO_HOT_FOR_CONTRACTS = 80;

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
    comebackBonus: {
      enabled: true,
      cashMultiplier: 2,
      xpMultiplier: 3,
      heatGain: 0,
      durationHours: 48,
      endsAtLevel: 6,
      label: "Harbor Comeback: 2x Cash / 3x XP / +0 Heat",
    },
    desc: "Move quiet cargo through the harbor. During Harbor Comeback, this becomes the smart recovery route out of the Southside grind.",
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

const CONTRACT_TARGETS = [
  {
    id: "contract_dockside_outfit",
    rivalName: "Dockside Outfit",
    avatar: "/art/rivals/dockside-outfit.jpg",
    level: 3,
    bossClass: "Mogul",
    district: "docks",
    power: 44,
    cash: 2400,
    health: 100,
    control: 18,
    properties: {
      dockside_lot: 1,
    },
  },
  {
    id: "contract_southside_saint",
    rivalName: "Southside Saint",
    avatar: "/art/chapters/first-blood-southside.jpg",
    level: 3,
    bossClass: "Strategist",
    district: "southside",
    power: 52,
    cash: 3600,
    health: 100,
    control: 21,
    properties: {
      corner_shop: 1,
    },
  },
  {
    id: "contract_viper_lane",
    rivalName: "Viper Lane",
    avatar: "/art/rivals/riverside-runners.jpg",
    level: 4,
    bossClass: "Ghost",
    district: "riverside",
    power: 68,
    cash: 5200,
    health: 100,
    control: 24,
    properties: {
      auto_garage: 1,
    },
    hiddenUntil: 0,
  },
  {
    id: "contract_warehouse_union",
    rivalName: "Warehouse Union",
    avatar: "/art/properties/warehouse-front.png",
    level: 4,
    bossClass: "Foreman",
    district: "warehouse",
    power: 72,
    cash: 6100,
    health: 100,
    control: 24,
    properties: {
      warehouse_front: 1,
    },
  },
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
  { tab: "chat", title: "Street Chat", image: "/art/pages/city-wire.jpg", desc: "Post as your boss with avatar, level, and class." },
  { tab: "contracts", title: "Open Contracts", image: "/art/rivals/dockside-outfit.jpg", desc: "Target rivals, lock crew, manage heat, and trigger retaliation." },
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
  avatar: "",
  classId: "boss",

  lastLoginAt: Date.now(),

  comebackActive: false,
  comebackStartedAt: null,
  comebackActiveUntil: null,
  comebackStep: 0,
  comebackDockJobs: 0,
  comebackHighlightJob: "",

  markedUntil: 0,
  retaliationContracts: [],
  contractsUsed: 0,
  firstContractComebackUsed: false,
  firstContractComebackDismissed: false,
  contractCrewLocks: [],

  cash: 750,
  vault: 0,
  tribute: 100,
ownedTributeItems: {},
cosmetics: {
  avatarBorder: "",
  chatPrefix: "",
  bossSkin: "",
},
autoManager: false,
heatAlerts: false,
contractIntel: false,
propertyRushCount: 0,
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

tutorialStep: 1,
tutorialSkipped: false,
tutorialCompleted: false,

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

function loadStreetChat() {
  try {
    const saved = localStorage.getItem(STREET_CHAT_KEY);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
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

function wasOfflineLongEnough(gameState, now = Date.now()) {
  const lastLogin = Number(gameState?.lastLoginAt || 0);

  if (!Number.isFinite(lastLogin) || lastLogin <= 0) return false;

  return now - lastLogin >= COMEBACK_OFFLINE_MS;
}

function checkComebackEligible(gameState, now = Date.now()) {
  if (!gameState?.started) return false;

  const used = localStorage.getItem(COMEBACK_USED_KEY) === "yes";
  const southsideControl = gameState.territory?.southside || 0;

  if (used) return false;
  if ((gameState.level || 1) < 3) return false;
  if (southsideControl >= 25) return false;
  if ((gameState.jobsRun || 0) < 10) return false;
  if (!wasOfflineLongEnough(gameState, now)) return false;

  return true;
}

function isHarborComebackActive(gameState, now = Date.now()) {
  if (!gameState?.comebackActive) return false;
  if (!gameState?.comebackActiveUntil) return false;
  if (now > gameState.comebackActiveUntil) return false;
  if ((gameState.level || 1) >= COMEBACK_END_LEVEL) return false;

  return true;
}

function startHarborComeback(gameState, now = Date.now()) {
  localStorage.setItem(COMEBACK_USED_KEY, "yes");

  return addLog(
    {
      ...gameState,
      comebackActive: true,
      comebackStartedAt: now,
      comebackActiveUntil: now + COMEBACK_DURATION_MS,
      comebackStep: 1,
      comebackDockJobs: 0,
      comebackHighlightJob: COMEBACK_JOB_ID,
    },
    "Harbor Comeback started. Work the Docks now gives 2x Cash, 3x XP, and +0 Heat for 48 hours or until Level 6."
  );
}

function getComebackCashMultiplier(gameState, job) {
  if (job.id !== COMEBACK_JOB_ID) return 1;
  if (!isHarborComebackActive(gameState)) return 1;

  return job.comebackBonus?.cashMultiplier || 1;
}

function getComebackXpMultiplier(gameState, job) {
  if (job.id !== COMEBACK_JOB_ID) return 1;
  if (!isHarborComebackActive(gameState)) return 1;

  return job.comebackBonus?.xpMultiplier || 1;
}

function getComebackHeatGain(gameState, job, normalHeatGain) {
  if (job.id !== COMEBACK_JOB_ID) return normalHeatGain;
  if (!isHarborComebackActive(gameState)) return normalHeatGain;

  return job.comebackBonus?.heatGain ?? normalHeatGain;
}

function completeComebackStep(step, gameState) {
  if (!gameState?.comebackActive) return gameState;

  if (step === "dock_shift_run" && gameState.comebackStep === 1) {
    const dockJobs = (gameState.comebackDockJobs || 0) + 1;

    if (dockJobs >= 3) {
      return addLog(
        {
          ...gameState,
          comebackDockJobs: dockJobs,
          comebackStep: 2,
          cash: (gameState.cash || 0) + 500,
          comebackHighlightJob: "dockside_lot",
        },
        "Harbor Comeback Step 1 complete. Reward: $500. Tip: Buy Dockside Lot with this."
      );
    }

    return addLog(
      {
        ...gameState,
        comebackDockJobs: dockJobs,
      },
      `Harbor Comeback: Run Work the Docks ${dockJobs}/3.`
    );
  }

  if (step === "buy_dockside_lot" && gameState.comebackStep === 2) {
    return addLog(
      {
        ...gameState,
        comebackStep: 3,
        energy: clamp((gameState.energy || 0) + 50, 0, MAX_OVERCHARGE_ENERGY),
        comebackHighlightJob: "southside_collections",
      },
      "Harbor Comeback Step 2 complete. Reward: +50 Energy. Tip: Now run Southside Collections. You have a supply chain."
    );
  }

  if (step === "southside_collections_run" && gameState.comebackStep === 3) {
    return addLog(
      {
        ...gameState,
        comebackStep: 4,
        comebackHighlightJob: "",
      },
      "Harbor Comeback Step 3 complete. Dockside Lot made Southside Collections pay better. Territory and supply chains matter."
    );
  }

  return gameState;
}

function getJobPayoutMultiplier(gameState, job) {
  const districtControl = getDistrictControl(gameState, job.district);
  let multiplier = getHeatPenalty(gameState).cashMultiplier;

  const docksideSupplyChainActive =
  job.id === "southside_collections" &&
  (gameState.properties?.dockside_lot || 0) > 0 &&
  (
    (gameState.comebackStep || 0) >= 3 ||
    gameState.tutorialStep === 3 ||
    gameState.tutorialStep === 4
  );

  if (
    job.id === "southside_collections" &&
    districtControl < (job.lowControlPenaltyAt || 25) &&
    !docksideSupplyChainActive
  ) {
    multiplier *= job.lowControlPayoutMultiplier || 0.5;
  }

  multiplier *= 1 + Math.floor(districtControl / 10) * 0.05;

  if (gameState.classId === "mogul") multiplier *= 1.2;

  if (
    gameState.classId === "dispatcher" &&
    gameState.lastJobDistrict &&
    gameState.lastJobDistrict !== job.district
  ) {
    multiplier *= 1.05;
  }

  multiplier *= getComebackCashMultiplier(gameState, job);

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

function getCityControlBracketValue(cityControl) {
  if (cityControl <= 25) return "0-25";
  if (cityControl <= 50) return "26-50";
  if (cityControl <= 75) return "51-75";
  return "76-100";
}

function getPlayerCityControl(gameState) {
  const total = districts.reduce((sum, district) => {
    return sum + (gameState.territory?.[district.id] || 0);
  }, 0);

  return Math.round(total / districts.length);
}

function getHighestControlDistrictId(gameState) {
  let highest = districts[0]?.id || "southside";
  let highestControl = -1;

  districts.forEach((district) => {
    const control = gameState.territory?.[district.id] || 0;

    if (control > highestControl) {
      highest = district.id;
      highestControl = control;
    }
  });

  return highest;
}

function getPlayerContractPower(gameState) {
  const ownedGear = gear.filter((item) => gameState.gear?.[item.id]);
  const gearAttack = ownedGear.reduce((sum, item) => sum + item.attack, 0);
  const gearDefense = ownedGear.reduce((sum, item) => sum + item.defense, 0);
  const classData = bossClasses.find((item) => item.id === gameState.classId) || bossClasses[0];

  const attackPower = Math.round(
    (10 + getAvailableCrew(gameState) * 2 + gearAttack + (gameState.attackSkill || 0) * 5) *
      classData.attack
  );

  const defensePower = Math.round(
    (10 + getAvailableCrew(gameState) * 2 + gearDefense + (gameState.defenseSkill || 0) * 5) *
      classData.defense
  );

  return Math.round((attackPower + defensePower) / 2);
}

function getTargetCityControlBracket(target) {
  const targetControl = target.cityControl ?? target.control ?? 20;
  return getCityControlBracketValue(targetControl);
}

function targetOwnsPropertyInDistrict(target, districtId) {
  const owned = target.properties || {};

  return properties.some((property) => {
    if (property.district !== districtId) return false;
    return (owned[property.id] || 0) > 0;
  });
}

function getContractPropertyBonus(playerState, targetDistrict) {
  if (targetDistrict === "docks" && (playerState.properties?.dockside_lot || 0) > 0) {
    return {
      multiplier: 1.15,
      label: "Bonus: +15% Power if you attack. Dockside Lot controls harbor movement.",
    };
  }

  if (targetDistrict === "southside" && (playerState.properties?.corner_shop || 0) > 0) {
    return {
      multiplier: 1.1,
      label: "Bonus: +10% Power if you attack. Corner Shop gives street pressure.",
    };
  }

  if (targetDistrict === "riverside" && (playerState.properties?.auto_garage || 0) > 0) {
    return {
      multiplier: 1.15,
      label: "Bonus: +15% Power if you attack. Auto Garage controls routes.",
    };
  }

  return {
    multiplier: 1,
    label: "No property attack bonus active.",
  };
}

function getContractDistrictBonus(playerState, targetDistrict) {
  const control = playerState.territory?.[targetDistrict] || 0;

  if (control >= 75) return 15;
  if (control >= 50) return 10;
  if (control >= 25) return 5;

  return 0;
}

function getActiveContractCrewLocks(gameState, now = Date.now()) {
  return (gameState.contractCrewLocks || []).filter((lock) => lock.unlocksAt > now);
}

function getAvailableContractCrew(gameState, now = Date.now()) {
  const lockedCrew = getActiveContractCrewLocks(gameState, now).length;
  const lookoutCrew = gameState.lookouts || 0;

  return Math.max(0, (gameState.crew || 0) - lockedCrew - lookoutCrew);
}

function getContractTargets(playerState, allPlayers = CONTRACT_TARGETS, now = Date.now()) {
  if (!playerState) return [];

  const playerCityControl = getPlayerCityControl(playerState);
  const playerBracket = getCityControlBracketValue(playerCityControl);
  const highestDistrict = getHighestControlDistrictId(playerState);
  const playerPower = getPlayerContractPower(playerState);

  const safeTargets = (allPlayers || []).filter(Boolean);

  const matchedTargets = safeTargets
    .filter((target) => {
      if (!target) return false;
      if (target.id && target.id === playerState.id) return false;
      if (target.hiddenUntil && target.hiddenUntil > now) return false;
      if (target.hospitalUntil && target.hospitalUntil > now) return false;

      const targetPower = target.power || 20;
      const low = playerPower * 0.8;
      const high = playerPower * 1.2;

      if (targetPower < low || targetPower > high) return false;

      return getTargetCityControlBracket(target) === playerBracket;
    })
    .sort((a, b) => {
      const aPriority = targetOwnsPropertyInDistrict(a, highestDistrict) ? 1 : 0;
      const bPriority = targetOwnsPropertyInDistrict(b, highestDistrict) ? 1 : 0;

      if (bPriority !== aPriority) return bPriority - aPriority;

      return (b.cash || 0) - (a.cash || 0);
    });

  if (matchedTargets.length === 0) {
    return safeTargets
      .sort((a, b) => {
        const aPriority = targetOwnsPropertyInDistrict(a, highestDistrict) ? 1 : 0;
        const bPriority = targetOwnsPropertyInDistrict(b, highestDistrict) ? 1 : 0;

        if (bPriority !== aPriority) return bPriority - aPriority;

        return Math.abs((a.power || 20) - playerPower) - Math.abs((b.power || 20) - playerPower);
      })
      .slice(0, 3);
  }

  return matchedTargets.slice(0, 3);
}

function isMarked(gameState, now = Date.now()) {
  return (gameState.markedUntil || 0) > now;
}

function getContractCashStealPercent(attackerState) {
  if ((attackerState.heat || 0) > HIGH_HEAT_THRESHOLD) {
    return 0.04;
  }

  return 0.05;
}

function getRetaliationChanceMultiplier(gameState) {
  if ((gameState.heat || 0) > HIGH_HEAT_THRESHOLD) {
    return 1.5;
  }

  return 1;
}

function lockContractCrew(gameState, crewSent, now = Date.now(), freeFirstContractLock = false) {
  if (freeFirstContractLock) {
    return gameState;
  }

  const newLocks = Array.from({ length: crewSent }).map((_, index) => ({
    id: `contract_crew_lock_${now}_${index}`,
    lockedAt: now,
    unlocksAt: now + CONTRACT_CREW_LOCK_MS,
  }));

  return {
    ...gameState,
    contractCrewLocks: [
      ...getActiveContractCrewLocks(gameState, now),
      ...newLocks,
    ],
  };
}

function getRetaliationContract(target, winnerName, now = Date.now()) {
  return {
    id: `retaliation_${now}_${Math.floor(Math.random() * 99999)}`,
    targetId: target.id,
    targetName: winnerName,
    district: target.district || "docks",
    avatar: target.avatar || "/art/rivals/dockside-outfit.jpg",
    power: target.power || 20,
    cash: target.cash || 0,
    costEnergy: 0,
    crewLockRequired: 1,
    createdAt: now,
    expiresAt: now + RETALIATION_CONTRACT_EXPIRE_MS,
    reason: "Retaliation Contract: one free hit back. Still locks 1 Crew for 10 minutes.",
  };
}

function resolveContract(attacker, defender, crewSent = 1, options = {}) {
  const now = Date.now();
  const targetDistrict = defender.district || "southside";
  const districtBonus = getContractDistrictBonus(attacker, targetDistrict);
  const propertyBonus = getContractPropertyBonus(attacker, targetDistrict);
  const attackerBasePower = attacker.power || getPlayerContractPower(attacker);
  const defenderBasePower = defender.power || getPlayerContractPower(defender);
  const markedPenalty = defender.markedUntil && defender.markedUntil > now ? 0.9 : 1;

  const attackerPower = Math.round(
    ((attackerBasePower * crewSent) + districtBonus) * propertyBonus.multiplier
  );

  const defenderPower = Math.round(defenderBasePower * markedPenalty);

  const won = attackerPower > defenderPower;
  const stealPercent = getContractCashStealPercent(attacker);
  const cashStolen = won
    ? Math.floor((defender.cash || 0) * stealPercent)
    : Math.floor((attacker.cash || 0) * stealPercent);

  const heatGain = won ? 3 : 5;
  const winnerName = won
    ? attacker.bossName || attacker.rivalName || attacker.name || "Attacker"
    : defender.bossName || defender.rivalName || defender.name || "Defender";

  const loserName = won
    ? defender.bossName || defender.rivalName || defender.name || "Defender"
    : attacker.bossName || attacker.rivalName || attacker.name || "Attacker";

  const retaliationContract = !won
    ? getRetaliationContract(defender, winnerName, now)
    : null;

  return {
    won,
    cashStolen,
    heatGain,
    attackerPower,
    defenderPower,
    crewSent,
    propertyBonusLabel: propertyBonus.label,
    districtBonus,
    winnerName,
    loserName,
    stealPercent,
    highHeatPenalty: (attacker.heat || 0) > HIGH_HEAT_THRESHOLD,
    retaliationChanceMultiplier: getRetaliationChanceMultiplier(attacker),
    retaliationContract,
    district: targetDistrict,
    targetDistrict,
    isRetaliation: !!options.isRetaliation,
    markedApplied:
      options.isRetaliation && won
        ? {
            targetId: defender.id,
            targetName: defender.rivalName || defender.bossName || defender.name || "Target",
            markedUntil: now + MARKED_DURATION_MS,
            defensePenalty: 0.1,
          }
        : null,
  };
}

function checkContractComebackEligibility(gameState) {
  if (!gameState.started) return false;
  if ((gameState.level || 1) < 4) return false;
  if ((gameState.contractsUsed || 0) > 0) return false;
  if (gameState.firstContractComebackUsed) return false;
  if (gameState.firstContractComebackDismissed) return false;

  return true;
}

function getTributeItem(itemId) {
  return tributeStoreItems.find((item) => item.id === itemId);
}

function playerOwnsTributeItem(gameState, itemId) {
  return !!gameState.ownedTributeItems?.[itemId];
}

function getCosmeticBossImage(gameState, bossClass) {
  if (gameState.cosmetics?.bossSkin) return gameState.cosmetics.bossSkin;
  return gameState.avatar || bossClass.image;
}

function getStreetChatBossName(gameState) {
  const prefix = gameState.cosmetics?.chatPrefix || "";
  return prefix ? `${prefix} ${gameState.bossName || "Rookie"}` : gameState.bossName || "Rookie";
}

function getAvatarBorderStyle(gameState) {
  if (gameState.cosmetics?.avatarBorder === "gold") {
    return {
      border: "2px solid rgba(251, 191, 36, 0.95)",
      boxShadow: "0 0 18px rgba(251, 191, 36, 0.45)",
    };
  }

  return {};
}

function getDefenderPropertyIntel(target) {
  const owned = target.properties || {};
  const ownedNames = properties
    .filter((property) => (owned[property.id] || 0) > 0)
    .map((property) => property.name);

  if (ownedNames.length === 0) return "No known property bonuses.";

  return `Known fronts: ${ownedNames.join(", ")}. Watch for territory/property bonuses.`;
}

function applyTributePurchase(itemId, gameState) {
  const item = getTributeItem(itemId);

  if (!item) {
    return {
      nextGame: gameState,
      ok: false,
      message: "Tribute item not found.",
    };
  }

  if ((gameState.tribute || 0) < item.cost) {
    return {
      nextGame: gameState,
      ok: false,
      message: `Not enough Tribute for ${item.name}.`,
    };
  }

  const alreadyOwned =
    item.type !== "time" &&
    playerOwnsTributeItem(gameState, item.id);

  if (alreadyOwned) {
    return {
      nextGame: gameState,
      ok: false,
      message: `${item.name} is already owned.`,
    };
  }

  let next = {
    ...gameState,
    tribute: (gameState.tribute || 0) - item.cost,
  };

  if (item.effect.action === "unlock_one_contract_crew") {
    const activeLocks = getActiveContractCrewLocks(next);
    const inactiveLocks = (next.contractCrewLocks || []).filter(
      (lock) => lock.unlocksAt <= Date.now()
    );

    if (activeLocks.length === 0) {
      return {
        nextGame: gameState,
        ok: false,
        message: "No locked Contract crew to expedite.",
      };
    }

    next = {
      ...next,
      contractCrewLocks: [...inactiveLocks, ...activeLocks.slice(1)],
    };

    return {
      nextGame: next,
      ok: true,
      message: "Expedite Crew used. 1 crew member returned from lockout.",
    };
  }

  if (item.effect.action === "collect_one_hour_property_income") {
    const oneHourIncome = Math.max(0, Math.round(getTotalPropertyIncome(next) * 60));

    next = {
      ...next,
      cash: (next.cash || 0) + oneHourIncome,
      propertyRushCount: (next.propertyRushCount || 0) + 1,
    };

    return {
      nextGame: next,
      ok: true,
      message: `Rush Property used. Collected ${money(oneHourIncome)} from 1 hour of current property income.`,
    };
  }

  if (item.effect.action === "reduce_heat") {
    next = {
      ...next,
      heat: clamp((next.heat || 0) - (item.effect.amount || 20), 0, MAX_HEAT),
    };

    return {
      nextGame: next,
      ok: true,
      message: "Heat Bribe used. Heat reduced by 20.",
    };
  }

  if (item.effect.action === "cosmetic_avatar_border") {
    next = {
      ...next,
      ownedTributeItems: {
        ...(next.ownedTributeItems || {}),
        [item.id]: true,
      },
      cosmetics: {
        ...(next.cosmetics || {}),
        avatarBorder: item.effect.border,
      },
    };

    return {
      nextGame: next,
      ok: true,
      message: "Golden Suit unlocked. Avatar border is now active.",
    };
  }

  if (item.effect.action === "cosmetic_chat_prefix") {
    next = {
      ...next,
      ownedTributeItems: {
        ...(next.ownedTributeItems || {}),
        [item.id]: true,
      },
      cosmetics: {
        ...(next.cosmetics || {}),
        chatPrefix: item.effect.prefix,
      },
    };

    return {
      nextGame: next,
      ok: true,
      message: "Enforcer Tag unlocked. Street Chat prefix is now active.",
    };
  }

  if (item.effect.action === "cosmetic_boss_skin") {
    next = {
      ...next,
      ownedTributeItems: {
        ...(next.ownedTributeItems || {}),
        [item.id]: true,
      },
      cosmetics: {
        ...(next.cosmetics || {}),
        bossSkin: item.effect.skin,
      },
    };

    return {
      nextGame: next,
      ok: true,
      message: "Boss Skin: Nightfall unlocked. Cosmetic skin is now active.",
    };
  }

  if (item.effect.action === "enable_auto_manager") {
    next = {
      ...next,
      ownedTributeItems: {
        ...(next.ownedTributeItems || {}),
        [item.id]: true,
      },
      autoManager: true,
    };

    return {
      nextGame: next,
      ok: true,
      message: "Auto-Manager enabled. New properties will auto-assign managers when crew is available.",
    };
  }

  if (item.effect.action === "enable_heat_alerts") {
    next = {
      ...next,
      ownedTributeItems: {
        ...(next.ownedTributeItems || {}),
        [item.id]: true,
      },
      heatAlerts: true,
    };

    return {
      nextGame: next,
      ok: true,
      message: "Heat Alerts enabled. You will see warnings when Heat reaches 45.",
    };
  }

  if (item.effect.action === "enable_contract_intel") {
    next = {
      ...next,
      ownedTributeItems: {
        ...(next.ownedTributeItems || {}),
        [item.id]: true,
      },
      contractIntel: true,
    };

    return {
      nextGame: next,
      ok: true,
      message: "Contract Intel enabled. Contract cards now show defender property intel.",
    };
  }

  return {
    nextGame: gameState,
    ok: false,
    message: "This Tribute item has no valid effect.",
  };
}

const ONBOARDING_STEPS = {
  1: {
    title: "Step 1: Work the Docks",
    targetTab: "jobs",
    highlight: "dock_shift",
    actionText: "Run Work the Docks",
    tip: "Docks pay clean. Southside needs control first.",
  },
  2: {
    title: "Step 2: Buy Dockside Lot",
    targetTab: "properties",
    highlight: "dockside_lot",
    actionText: "Buy Dockside Lot",
    tip: "Harbor property unlocks smuggling routes.",
  },
  3: {
    title: "Step 3: Run Southside Collections",
    targetTab: "jobs",
    highlight: "southside_collections",
    actionText: "Run Southside Collections",
    tip: "Without Docks: $140. With Docks: $225. Territory matters.",
  },
  4: {
    title: "Step 4: Expand Southside",
    targetTab: "territory",
    highlight: "southside",
    actionText: "Expand Southside",
    tip: "Control +4%. At 25%, payouts double. Own the streets.",
  },
};

function isTutorialActive(gameState) {
  return (
    gameState?.started &&
    !gameState?.tutorialSkipped &&
    !gameState?.tutorialCompleted &&
    (gameState?.tutorialStep || 0) > 0 &&
    (gameState?.tutorialStep || 0) <= 4
  );
}

function getTutorialStepConfig(gameState) {
  if (!isTutorialActive(gameState)) return null;
  return ONBOARDING_STEPS[gameState.tutorialStep] || null;
}

function isTutorialActionAllowed(gameState, actionType, itemId) {
  if (!isTutorialActive(gameState)) return true;

  const step = gameState.tutorialStep || 0;

  if (step === 1) {
    return actionType === "job" && itemId === "dock_shift";
  }

  if (step === 2) {
    return actionType === "property" && itemId === "dockside_lot";
  }

  if (step === 3) {
    return actionType === "job" && itemId === "southside_collections";
  }

  if (step === 4) {
    return actionType === "territory" && itemId === "southside";
  }

  return true;
}

function getTutorialRestrictionMessage(gameState) {
  const config = getTutorialStepConfig(gameState);

  if (!config) return "Finish the current tutorial step first.";

  return `Tutorial active: ${config.actionText} first. ${config.tip}`;
}

function nextTutorialStep(gameState, completedAction = "") {
  if (!isTutorialActive(gameState)) return gameState;

  const step = gameState.tutorialStep || 0;

  if (step === 1 && completedAction === "dock_shift") {
    return addLog(
      {
        ...gameState,
        tutorialStep: 2,
      },
      'Tutorial Step 1 complete. Docks pay clean. Southside needs control first.'
    );
  }

  if (step === 2 && completedAction === "buy_dockside_lot") {
    return addLog(
      {
        ...gameState,
        tutorialStep: 3,
      },
      "Tutorial Step 2 complete. Harbor property unlocks smuggling routes."
    );
  }

  if (step === 3 && completedAction === "southside_collections") {
    return addLog(
      {
        ...gameState,
        tutorialStep: 4,
      },
      "Tutorial Step 3 complete. Without Docks: $140. With Docks: $225. Territory matters."
    );
  }

  if (step === 4 && completedAction === "expand_southside") {
    return addLog(
      {
        ...gameState,
        tutorialStep: 0,
        tutorialCompleted: true,
      },
      "Tutorial complete. At 25% Southside control, payouts double. Own the streets."
    );
  }

  return gameState;
}

export default function App() {
  const [game, setGame] = useState(loadGame);
  const [tab, setTab] = useState("command");
  const [bossName, setBossName] = useState(game.bossName || "Rookie");
  const [classId, setClassId] = useState(game.classId || "boss");
  const [openCompletedChapters, setOpenCompletedChapters] = useState({});
  const [chatMessages, setChatMessages] = useState(loadStreetChat);
  const [chatText, setChatText] = useState("");
  const [showComebackModal, setShowComebackModal] = useState(() =>
    checkComebackEligible(loadGame())
  );
  const [contractResult, setContractResult] = useState(null);

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
  const contractComebackReady = checkContractComebackEligibility(game);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  useEffect(() => {
    localStorage.setItem(STREET_CHAT_KEY, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    setGame((old) => ({
      ...old,
      lastLoginAt: Date.now(),
    }));
  }, []);

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
      avatar: chosen.image,
      classId: chosen.id,
      maxEnergy: BASE_MAX_ENERGY,
      energy: BASE_MAX_ENERGY + 200,
      lastLoginAt: Date.now(),
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
if (!isTutorialActionAllowed(old, "job", job.id)) {
  return addLog(old, getTutorialRestrictionMessage(old));
}

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

      const xpReward = Math.round(
        getJobXpReward(job, burnoutTriggered) * getComebackXpMultiplier(old, job)
      );

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

      const normalHeatGain = district ? getJobHeatGain(job, district) : job.heat || 0;
      const finalHeatGain = getComebackHeatGain(old, job, normalHeatGain);
      const heatBurn = getLookoutHeatBurn(old);

      next = {
        ...next,
        heat: clamp((next.heat || 0) + finalHeatGain - heatBurn, 0, MAX_HEAT),
      };

      next = addXp(next, xpReward);

      if (job.id === "dock_shift") {
  next = completeComebackStep("dock_shift_run", next);
  next = nextTutorialStep(next, "dock_shift");
}

if (job.id === "southside_collections") {
  next = completeComebackStep("southside_collections_run", next);
  next = nextTutorialStep(next, "southside_collections");
}

      const nextHeatPenalty = getHeatPenalty(next);
      if (nextHeatPenalty.rivalAttackChance > 0 && Math.random() * 100 < nextHeatPenalty.rivalAttackChance) {
        const rivalLoss = Math.min(next.cash, Math.max(75, Math.round(next.cash * 0.05)));
        next = addLog({ ...next, cash: next.cash - rivalLoss }, `Heat backlash. Rival crews hit your operation and cost you ${money(rivalLoss)}.`);
      }

      const comebackLabel =
        isHarborComebackActive(old) && job.id === "dock_shift"
          ? "Harbor Comeback active: 2x Cash, 3x XP, +0 Heat."
          : "";

      return addLog(
        next,
        `${job.name}: earned ${money(payout)} and ${xpReward} XP. ${
          comebackLabel ? `${comebackLabel} ` : ""
        }${propertySynergy.label} ${
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

      if (!isTutorialActionAllowed(old, "territory", district.id)) {
  return addLog(old, getTutorialRestrictionMessage(old));
}

const tutorialControlGain =
  old.tutorialStep === 4 && district.id === "southside"
    ? 4
    : plan.controlGain;

const newControl = clamp(plan.currentControl + tutorialControlGain, 0, 100);

      let next = {
  ...old,
  cash: old.cash - plan.cashCost,
  energy: old.energy - plan.energyCost,
  territory: { ...old.territory, [district.id]: newControl },
};

if (district.id === "southside") {
  next = nextTutorialStep(next, "expand_southside");
}

return addLog(
  next,
  `${district.name} operation complete. Control increased from ${plan.currentControl}% to ${newControl}%. ${plan.operationText}`
);
    });
  }

  function buyProperty(property) {
    setGame((old) => {
      if (!isTutorialActionAllowed(old, "property", property.id)) {
  return addLog(old, getTutorialRestrictionMessage(old));
}

const tutorialCashBoost =
  old.tutorialStep === 2 &&
  property.id === "dockside_lot" &&
  old.cash < property.cost
    ? 700
    : 0;

if (old.cash + tutorialCashBoost < property.cost) {
  return addLog(old, `You need ${money(property.cost)} to buy ${property.name}.`);
}

      let next = {
  ...old,
  cash: old.cash + tutorialCashBoost - property.cost,
  properties: {
    ...old.properties,
    [property.id]: (old.properties[property.id] || 0) + 1,
  },
};

if (next.autoManager && getAvailableManagers(next) > 0) {
  next = {
    ...next,
    propertyManagers: {
      ...(next.propertyManagers || {}),
      [property.id]: true,
    },
  };
}

      if (property.id === "dockside_lot") {
  next = completeComebackStep("buy_dockside_lot", next);
  next = nextTutorialStep(next, "buy_dockside_lot");

  if (tutorialCashBoost > 0) {
    next = addLog(next, `Tutorial support added ${money(tutorialCashBoost)} temporary cash so you could buy Dockside Lot.`);
  }
}

      return addLog(next, `Purchased ${property.name}.`);
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

  function handleBossAvatarUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setGame((old) => addLog(old, "Please upload an image file for your boss avatar."));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setGame((old) => addLog(old, "Avatar image is too large. Keep it under 5MB."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setGame((old) =>
        addLog(
          {
            ...old,
            avatar: reader.result,
          },
          "Boss avatar updated."
        )
      );
    };

    reader.readAsDataURL(file);
  }

  function sendStreetChatMessage() {
    const message = chatText.trim();

    if (!message) return;

    if (message.length > 300) {
      setGame((old) => addLog(old, "Street Chat messages must be 300 characters or less."));
      return;
    }

    const newMessage = {
      id: `chat_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
      bossName: getStreetChatBossName(game),
      bossLevel: game.level || 1,
      bossClassName: bossClass.name || "Unknown",
      avatar: game.avatar || bossClass.image || "/art/characters/boss-profile.jpg",
      message,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((old) => [newMessage, ...old].slice(0, 75));
    setChatText("");
  }

  function clearStreetChat() {
    if (!confirm("Clear local Street Chat messages on this device?")) return;
    setChatMessages([]);
  }

  function startFirstContractComeback() {
    setGame((old) =>
      addLog(
        {
          ...old,
          firstContractComebackUsed: true,
        },
        "First Contract lesson started. Your first Docks contract has no Crew lockout."
      )
    );

    setTab("contracts");
  }

  function dismissFirstContractComeback() {
    setGame((old) => ({
      ...old,
      firstContractComebackDismissed: true,
    }));
  }

  function runOpenContract(target, crewSent = 1, options = {}) {
    setGame((old) => {
      if ((old.heat || 0) >= TOO_HOT_FOR_CONTRACTS) {
        return addLog(old, "Too hot. Assign Lookouts or wait before starting another contract.");
      }

      const isRetaliation = !!options.isRetaliation;

      const isFreeFirstDocksContract =
        old.firstContractComebackUsed &&
        (old.contractsUsed || 0) === 0 &&
        target.district === "docks";

      const energyCost = isRetaliation ? 0 : CONTRACT_ENERGY_COST;

      if ((old.energy || 0) < energyCost) {
        return addLog(old, `You need ${energyCost} Energy to start this contract.`);
      }

      if (getAvailableContractCrew(old) < crewSent && !isFreeFirstDocksContract) {
        return addLog(
          old,
          "Not enough available crew. Some crew are assigned as Lookouts or locked on contracts."
        );
      }

      const concretePourState = getConcretePourState();
      const concretePourPhase = getConcretePourPhase(concretePourState);

      if (
        concretePourPhase.onlyMarkedTargets &&
        !isRetaliation &&
        !isTargetAllowedForConcretePour(target, concretePourState)
      ) {
        return addLog(
          old,
          "Concrete Pour: Pour phase only allows contracts against Marked bosses. Use the Reputation Wall to call them out first."
        );
      }

      const result = resolveContract(old, target, crewSent, {
        isRetaliation,
      });

      let next = {
        ...old,
        energy: Math.max(0, old.energy - energyCost),
        heat: clamp((old.heat || 0) + result.heatGain, 0, MAX_HEAT),
        contractsUsed: (old.contractsUsed || 0) + 1,
      };

      const concretePourResult = {
  ...result,
  district: target.district || "southside",
  targetDistrict: target.district || "southside",
  isRetaliation,
};

      const updatedConcretePourState = addConcretePourContractInfluence({
        bossName: old.bossName || "Rookie",
        contractResult: concretePourResult,
        isRetaliation,
      });

      const contractInfluence = updatedConcretePourState.lastContractInfluence || 0;

      if (contractInfluence > 0) {
        next = addLog(
          next,
          `Concrete Pour Contract: +${contractInfluence} Influence.`
        );
      }

      next = lockContractCrew(next, crewSent, Date.now(), isFreeFirstDocksContract);

      if (result.won) {
        next = {
          ...next,
          cash: next.cash + result.cashStolen,
          wins: (next.wins || 0) + 1,
        };
      } else {
        next = {
          ...next,
          cash: Math.max(0, next.cash - result.cashStolen),
          losses: (next.losses || 0) + 1,
          retaliationContracts: result.retaliationContract
            ? [...(next.retaliationContracts || []), result.retaliationContract]
            : next.retaliationContracts || [],
        };
      }

      if (isRetaliation && result.markedApplied) {
        next = {
          ...next,
          markedUntil: result.markedApplied.markedUntil,
        };
      }

      if (isRetaliation && options.retaliationId) {
        next = {
          ...next,
          retaliationContracts: (next.retaliationContracts || []).filter(
            (contract) => contract.id !== options.retaliationId
          ),
        };
      }

      setContractResult(result);

      return addLog(
        next,
        result.won
          ? `Contract won. You stole ${money(result.cashStolen)}. ${result.propertyBonusLabel} Heat +${result.heatGain}.`
          : `Contract lost. You lost ${money(result.cashStolen)} and gained a Retaliation Contract. Heat +${result.heatGain}.`
      );
    });
  }

  function useRetaliationContract(contract) {
    const target = {
      id: contract.targetId,
      rivalName: contract.targetName,
      avatar: contract.avatar,
      district: contract.district,
      power: contract.power,
      cash: contract.cash,
      health: 100,
    };

    runOpenContract(target, 1, {
      isRetaliation: true,
      retaliationId: contract.id,
    });
  }

function buyTributeItem(itemId) {
  setGame((old) => {
    const result = applyTributePurchase(itemId, old);

    return addLog(result.nextGame, result.message);
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
            <img
  src={getCosmeticBossImage(game, bossClass)}
  alt={game.bossName || bossClass.name}
  style={getAvatarBorderStyle(game)}
/>
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
          ["chat", "Street Chat"],
          ["campaign", "Campaign"],
          ["jobs", "Jobs"],
          ["contracts", "Contracts"],
["tribute", "Tribute"],
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

          <ComebackModal
            show={showComebackModal}
            setGame={setGame}
            setTab={setTab}
            onClose={() => setShowComebackModal(false)}
          />

<OnboardingOverlay
  game={game}
  setGame={setGame}
  setTab={setTab}
/>

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

          {tab === "chat" && (
            <Panel
              title="Street Chat"
              sub="Local prototype chat. It shows boss name, boss level, avatar, class, and messages saved on this device."
            >
              <div className="card">
                <div className="card-head">
                  <div>
                    <h3>Street Chat Room</h3>
                    <p>Talk trash, call out rivals, or post updates from the street.</p>
                  </div>

                  <span>{chatMessages.length} Messages</span>
                </div>

                <div className="card-body">
                  <div
                    className="info"
                    style={{
                      alignItems: "center",
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 18,
                        overflow: "hidden",
                        border: "1px solid rgba(245,158,11,.45)",
                        background: "#09090b",
                      }}
                    >
                      <img
                        src={game.avatar || bossClass.image}
                        alt={game.bossName || "Boss avatar"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center top",
                        }}
                      />
                    </div>

                    <div>
                      <span className="kicker">Posting As</span>
                      <strong style={{ display: "block", fontSize: 18 }}>{game.bossName}</strong>
                      <small className="soft-text">
                        Level {game.level} / {bossClass.name}
                      </small>
                    </div>

                    <label className="secondary" style={{ cursor: "pointer" }}>
                      Change Avatar
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={handleBossAvatarUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>

                  <div className="button-row">
                    <input
                      value={chatText}
                      onChange={(event) => setChatText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") sendStreetChatMessage();
                      }}
                      placeholder="Say something in Street Chat..."
                      maxLength={300}
                    />

                    <button className="primary" onClick={sendStreetChatMessage}>
                      Send
                    </button>
                  </div>

                  <button className="secondary" onClick={clearStreetChat}>
                    Clear Local Chat
                  </button>

                  <div className="log-list" style={{ marginTop: 16 }}>
                    {chatMessages.length === 0 ? (
                      <div className="log-item">
                        No messages yet. Be the first to talk.
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="log-item"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "52px 1fr",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 14,
                              overflow: "hidden",
                              border: "1px solid rgba(245,158,11,.45)",
                              background: "#09090b",
                            }}
                          >
                            <img
                              src={msg.avatar || "/art/characters/boss-profile.jpg"}
                              alt={msg.bossName || "Boss avatar"}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center top",
                              }}
                            />
                          </div>

                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                              <div>
                                <strong style={{ color: "#fbbf24" }}>{msg.bossName || "Rookie"}</strong>
                                <div style={{ color: "#a1a1aa", fontSize: 12, marginTop: 2 }}>
                                  Level {msg.bossLevel || 1} / {msg.bossClassName || "Unknown"}
                                </div>
                              </div>

                              <small style={{ color: "#71717a", whiteSpace: "nowrap" }}>
                                {new Date(msg.createdAt).toLocaleString()}
                              </small>
                            </div>

                            <p style={{ margin: "8px 0 0", whiteSpace: "pre-wrap" }}>
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
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
              {isHarborComebackActive(game) && (
                <div className="card" style={{ marginBottom: 16, borderColor: "rgba(245, 158, 11, 0.55)" }}>
                  <div className="card-head">
                    <div>
                      <h3>Harbor Comeback Active</h3>
                      <p>
                        Work the Docks gives 2x Cash, 3x XP, and +0 Heat until the timer ends or you reach Level 6.
                      </p>
                    </div>

                    <span>Comeback</span>
                  </div>
                </div>
              )}

              <div className="card-grid">
                {jobs.map((job) => {
                  const districtControl = getDistrictControl(game, job.district);
                  const payoutMultiplier = getJobPayoutMultiplier(game, job);
                  const district = getDistrict(job.district);
                  const normalHeatGain = district ? getJobHeatGain(job, district) : job.heat || 0;
                  const heatGain = getComebackHeatGain(game, job, normalHeatGain);

                  return (
                    <ArtCard key={job.id} title={job.name} image={job.image} tag={districtName(job.district)} desc={job.desc}>
                      <Info label="Energy" value={job.energy} />
                      <Info label="Payout" value={`${money(Math.round(job.cash[0] * payoutMultiplier))} - ${money(Math.round(job.cash[1] * payoutMultiplier))}`} />
                      <Info label="District Control" value={`${districtControl}%`} />
                      <Info label="Heat Added" value={`+${heatGain}`} />
                      <Info label="XP" value={Math.round(job.xp * getComebackXpMultiplier(game, job))} />

                      {game.comebackHighlightJob === job.id && (
                        <p className="soft-text" style={{ color: "#fbbf24", fontWeight: 800 }}>
                          Harbor Comeback target. Run this next.
                        </p>
                      )}

                      {isHarborComebackActive(game) && job.id === "dock_shift" && (
                        <p className="soft-text" style={{ color: "#86efac", fontWeight: 800 }}>
                          Active Bonus: 2x Cash / 3x XP / +0 Heat
                        </p>
                      )}

                      <button
  className={`primary ${isTutorialActive(game) && getTutorialStepConfig(game)?.highlight === job.id ? "tutorial-glow" : ""}`}
  disabled={!isTutorialActionAllowed(game, "job", job.id)}
  onClick={() => runJob(job)}
>
                        {(game.energy || 0) > BASE_MAX_ENERGY && game.overchargeMode ? "Run Job Hot" : "Run Job"}
                      </button>
                    </ArtCard>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === "contracts" && (
            <Panel
              title="Open Contracts"
              sub="No spam attacks. Each contract costs 2 Energy and locks real crew for 10 minutes."
            >
              <RetaliationBanner
                contracts={game.retaliationContracts || []}
                onUse={useRetaliationContract}
              />

              {contractComebackReady && (
                <div className="card" style={{ marginBottom: 16, borderColor: "rgba(245, 158, 11, 0.6)" }}>
                  <div className="card-head">
                    <div>
                      <h3>Your crew is bored.</h3>
                      <p>
                        Rivals in Docks are running unopposed. Issue your first Contract and steal their harbor cash.
                      </p>
                    </div>
                    <span>Comeback</span>
                  </div>

                  <div className="card-body">
                    <p className="soft-text">
                      Your first Docks contract has no Crew lockout. It teaches the system and gives a cash injection without selling power.
                    </p>

                    <div className="button-row">
                      <button className="primary" onClick={startFirstContractComeback}>
                        Start First Contract
                      </button>

                      <button className="secondary" onClick={dismissFirstContractComeback}>
                        Not Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(game.heat || 0) > HIGH_HEAT_THRESHOLD && (game.heat || 0) < TOO_HOT_FOR_CONTRACTS && (
                <div className="card" style={{ marginBottom: 16, borderColor: "rgba(245, 158, 11, 0.6)" }}>
                  <div className="card-head">
                    <div>
                      <h3>High Heat Warning</h3>
                      <p>High Heat: -20% cash stolen, +50% rival retaliation chance.</p>
                    </div>
                    <span>{game.heat || 0}/100</span>
                  </div>
                </div>
              )}

              {(game.heat || 0) >= TOO_HOT_FOR_CONTRACTS && (
                <div className="card" style={{ marginBottom: 16, borderColor: "rgba(239, 68, 68, 0.65)" }}>
                  <div className="card-head">
                    <div>
                      <h3>Too Hot</h3>
                      <p>Too hot. Assign Lookouts or wait before starting more contracts.</p>
                    </div>
                    <span>{game.heat || 0}/100</span>
                  </div>
                </div>
              )}

              {contractResult && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-head">
                    <div>
                      <h3>{contractResult.won ? "Contract Won" : "Contract Lost"}</h3>
                      <p>
                        Attacker Power {contractResult.attackerPower} vs Defender Power {contractResult.defenderPower}.
                        Ties go to defender.
                      </p>
                    </div>
                    <span>{money(contractResult.cashStolen)}</span>
                  </div>

                  <div className="card-body">
                    <Info label="Winner" value={contractResult.winnerName || "Unknown"} />
                    <Info label="Loser" value={contractResult.loserName || "Unknown"} />
                    <Info label="Heat Gain" value={`+${contractResult.heatGain || 0}`} />
                    <Info label="Property Bonus" value={contractResult.propertyBonusLabel || "None"} />
                  </div>
                </div>
              )}

              <div className="mini-grid" style={{ marginBottom: 16 }}>
                <Stat label="Available Crew" value={getAvailableContractCrew(game)} helper="not locked/lookout" />
                <Stat label="Heat" value={`${game.heat || 0}/100`} helper={(game.heat || 0) >= TOO_HOT_FOR_CONTRACTS ? "too hot" : "contract ready"} />
                <Stat label="City Control" value={`${getPlayerCityControl(game)}%`} helper={getCityControlBracketValue(getPlayerCityControl(game))} />
                <Stat label="Contracts Used" value={game.contractsUsed || 0} helper="prototype count" />
              </div>

              {getContractTargets(game, CONTRACT_TARGETS).length === 0 ? (
                <div className="card">
                  <div className="card-head">
                    <div>
                      <h3>No Contracts Available</h3>
                      <p>
                        No matching rivals are available right now. Expand your city control, lower Heat, or check back later.
                      </p>
                    </div>
                    <span>Empty</span>
                  </div>
                </div>
              ) : (
                <div className="card-grid">
                  {getContractTargets(game, CONTRACT_TARGETS).map((target) => (
                    <ContractCardLocal
                      key={target.id}
                      target={target}
                      game={game}
                      onRun={runOpenContract}
                    />
                  ))}
                </div>
              )}
            </Panel>
          )}

                    {tab === "tribute" && (
            <TributeStore
              game={game}
              items={tributeStoreItems}
              onBuy={buyTributeItem}
            />
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
                <button className="secondary" onClick={() => assignLookouts(Math.max(0, (game.lookouts || 0) - 1))}>
                  Remove Lookout
                </button>

                <button className="primary" onClick={() => assignLookouts((game.lookouts || 0) + 1)}>
                  Add Lookout
                </button>
              </div>

              <p className="soft-text">
                {(game.heat || 0) > HEAT_THRESHOLD ? heatUiText.hot : heatUiText.clean}
              </p>

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
                      <button
  className={`primary ${isTutorialActive(game) && getTutorialStepConfig(game)?.highlight === district.id ? "tutorial-glow" : ""}`}
  disabled={!isTutorialActionAllowed(game, "territory", district.id)}
  onClick={() => expandDistrict(district)}
>
  Expand
</button>
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

                      {game.comebackHighlightJob === property.id && (
                        <p className="soft-text" style={{ color: "#fbbf24", fontWeight: 800 }}>
                          Harbor Comeback target. Buy this next.
                        </p>
                      )}

                      <div className="button-row">
                        <button
  className={`primary ${isTutorialActive(game) && getTutorialStepConfig(game)?.highlight === property.id ? "tutorial-glow" : ""}`}
  disabled={!isTutorialActionAllowed(game, "property", property.id)}
  onClick={() => buyProperty(property)}
>
  Buy Property
</button>

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
            <Info label="Contract Crew" value={getAvailableContractCrew(game)} />
            <Info label="Heat" value={`${game.heat || 0}/${MAX_HEAT}`} />
            <Info label="Wins" value={game.wins} />
            <Info label="Losses" value={game.losses} />
            <Info label="Attack" value={attack} />
            <Info label="Defense" value={isMarked(game) ? `${defense} / Marked` : defense} />
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
          ["contracts", "Contracts"],
          ["chat", "Chat"],
          ["rivals", "Fight"],
          ["tribute", "Tribute"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>{label}</button>
        ))}
      </nav>
    </div>
  );
}

function OnboardingOverlay({ game, setGame, setTab }) {
  const config = getTutorialStepConfig(game);

  if (!config) return null;

  function skipTutorial() {
    setGame((old) =>
      addLog(
        {
          ...old,
          tutorialStep: 0,
          tutorialSkipped: true,
          tutorialCompleted: false,
        },
        "Onboarding tutorial skipped."
      )
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 88,
        zIndex: 9998,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "min(620px, 100%)",
          border: "1px solid rgba(245,158,11,.65)",
          borderRadius: 22,
          background: "linear-gradient(180deg, rgba(24,24,27,.98), rgba(9,9,11,.98))",
          boxShadow: "0 18px 60px rgba(0,0,0,.6)",
          padding: 16,
          color: "white",
          pointerEvents: "auto",
        }}
      >
        <div className="card-head">
          <div>
            <p className="kicker">First 5 Minutes</p>
            <h3>{config.title}</h3>
            <p>{config.tip}</p>
          </div>

          <span>{game.tutorialStep}/4</span>
        </div>

        <div className="button-row" style={{ marginTop: 12 }}>
          <button className="primary tutorial-glow" onClick={() => setTab(config.targetTab)}>
            Go To {config.actionText}
          </button>

          <button className="secondary" onClick={skipTutorial}>
            Skip
          </button>
        </div>

        <p className="soft-text" style={{ marginTop: 10 }}>
          Target: {config.highlight}. The glowing button is the next correct move.
        </p>
      </div>
    </div>
  );
}

function ComebackModal({ show, setGame, setTab, onClose }) {
  if (!show) return null;

  function handleStartComeback() {
    setGame((old) => startHarborComeback(old));
    setTab("jobs");
    onClose?.();
  }

  function handleDismiss() {
    onClose?.();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "rgba(0,0,0,.78)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "min(560px, 100%)",
          border: "1px solid rgba(245,158,11,.5)",
          borderRadius: 28,
          background: "linear-gradient(180deg, rgba(24,24,27,.98), rgba(9,9,11,.98))",
          boxShadow: "0 30px 100px rgba(0,0,0,.65)",
          padding: 22,
          color: "white",
        }}
      >
        <img
          src="/art/jobs/work-the-docks.jpg"
          alt="Work the Docks"
          style={{
            width: "100%",
            height: 185,
            objectFit: "cover",
            objectPosition: "center",
            borderRadius: 22,
            border: "1px solid rgba(63,63,70,.9)",
            marginBottom: 16,
          }}
        />

        <p className="kicker">Harbor Comeback</p>

        <h2 style={{ margin: "4px 0 0" }}>
          Southside is locked down.
        </h2>

        <p className="soft-text" style={{ marginTop: 10 }}>
          The Foreman at the Docks has work. Smart bosses build cash first,
          control second.
        </p>

        <div className="mini-grid" style={{ marginTop: 16 }}>
          <Stat label="Work the Docks" value="2x Cash" helper="48hr comeback" />
          <Stat label="XP" value="3x XP" helper="until Level 6" />
          <Stat label="Heat" value="+0" helper="safe recovery route" />
        </div>

        <p className="soft-text" style={{ marginTop: 14 }}>
          Run Work the Docks three times, use the cash to buy Dockside Lot, then
          return to Southside with a supply chain behind you.
        </p>

        <div className="button-row" style={{ marginTop: 18 }}>
          <button className="primary big" onClick={handleStartComeback}>
            Work the Docks
          </button>

          <button className="secondary" onClick={handleDismiss}>
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}

function RetaliationBanner({ contracts, onUse }) {
  const activeContracts = (contracts || []).filter((contract) => {
    return contract.expiresAt > Date.now();
  });

  if (activeContracts.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: 16, borderColor: "rgba(239, 68, 68, 0.65)" }}>
      <div className="card-head">
        <div>
          <h3>Retaliation Available</h3>
          <p>
            You have a 0 Energy contract available. It still locks 1 Crew for 10 minutes.
            Use it within 1 hour to Mark the winner.
          </p>
        </div>

        <span>{activeContracts.length}</span>
      </div>

      <div className="card-body">
        {activeContracts.map((contract) => {
          const minutesLeft = Math.max(0, Math.ceil((contract.expiresAt - Date.now()) / 60000));

          return (
            <div key={contract.id} className="info" style={{ marginBottom: 8 }}>
              <span>
                {contract.targetName} / {minutesLeft} min left
              </span>

              <button className="danger" onClick={() => onUse(contract)}>
                Retaliate
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContractCardLocal({ target, game, onRun }) {
  const [crewSent, setCrewSent] = useState(1);

  if (!target) {
    return (
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Missing Contract Target</h3>
            <p>This target could not be loaded.</p>
          </div>
          <span>Error</span>
        </div>
      </div>
    );
  }

  const availableCrew = getAvailableContractCrew(game);
  const propertyBonus = getContractPropertyBonus(game, target.district);
  const tooHot = (game.heat || 0) >= TOO_HOT_FOR_CONTRACTS;
  const highHeat = (game.heat || 0) > HIGH_HEAT_THRESHOLD;
  const firstFree =
    game.firstContractComebackUsed &&
    (game.contractsUsed || 0) === 0 &&
    target.district === "docks";

  const imageSrc = target.avatar || "/art/rivals/dockside-outfit.jpg";
  const targetName = target.rivalName || target.bossName || target.name || "Unknown Rival";
  const targetDistrict = target.district || "unknown";
  const targetPower = target.power || 20;
  const targetCash = target.cash || 0;
  const targetLevel = target.level || 1;
  const targetClass = target.bossClass || "unknown";

  const canRun =
    !tooHot &&
    (firstFree || availableCrew >= crewSent) &&
    (game.energy || 0) >= CONTRACT_ENERGY_COST;

  return (
    <div className="art-card">
      <img src={imageSrc} alt={targetName} />

      <div className="art-card-content">
        <div className="card-head">
          <div>
            <p className="kicker">Open Contract</p>
            <h3>{targetName}</h3>
            <p>
              Level {targetLevel} / {targetClass} / {targetDistrict}
            </p>
          </div>

          <span>{targetPower} Power</span>
        </div>

        <div className="card-body">
          <Info label="Cash Exposed" value={money(targetCash)} />
          <Info label="Cost" value={firstFree ? "2 Energy / No Crew Lock" : "2 Energy / 1 Crew Lock"} />
          <Info label="Available Crew" value={availableCrew} />
          <Info label="City Bracket" value={getTargetCityControlBracket(target)} />
          <Info label="Property Bonus" value={propertyBonus.label} />

{game.contractIntel && (
  <Info label="Contract Intel" value={getDefenderPropertyIntel(target)} />
)}

          {highHeat && !tooHot && (
            <p className="soft-text">
              High Heat: -20% cash stolen, +50% rival retaliation chance.
            </p>
          )}

          {tooHot && (
            <p className="soft-text">
              Too hot. Assign Lookouts or wait.
            </p>
          )}

          {(game.energy || 0) < CONTRACT_ENERGY_COST && (
            <p className="soft-text">
              Not enough Energy. Contracts need {CONTRACT_ENERGY_COST} Energy.
            </p>
          )}

          <div className="button-row">
            <button
              className="secondary"
              onClick={() => setCrewSent(Math.max(1, crewSent - 1))}
            >
              -
            </button>

            <div className="info" style={{ minWidth: 130 }}>
              <span>Crew Sent</span>
              <strong>{crewSent}</strong>
            </div>

            <button
              className="secondary"
              onClick={() => setCrewSent(Math.min(Math.max(1, availableCrew), crewSent + 1))}
            >
              +
            </button>
          </div>

          <button
            className="danger"
            disabled={!canRun}
            onClick={() => onRun(target, crewSent)}
          >
            {tooHot ? "Too Hot" : "Start Contract"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TributeStore({ game, items, onBuy }) {
  const [storeTab, setStoreTab] = useState("Time");

  const filteredItems = items.filter((item) => item.category === storeTab);

  return (
    <Panel
      title="Tribute Store"
      sub="Fair-play monetization only. Tribute buys time, cosmetics, and information. It never buys attack, defense, XP rate, cash rate, or energy gain."
    >
      <div className="mini-grid" style={{ marginBottom: 16 }}>
        <Stat label="Tribute" value={game.tribute || 0} helper="available" />
        <Stat label="Heat" value={`${game.heat || 0}/100`} helper={game.heatAlerts && (game.heat || 0) >= 45 ? "alert active" : "current"} />
        <Stat label="Locked Crew" value={getActiveContractCrewLocks(game).length} helper="contract lockout" />
        <Stat label="Owned Store Items" value={Object.keys(game.ownedTributeItems || {}).length} helper="cosmetic/utility" />
      </div>

      {game.heatAlerts && (game.heat || 0) >= 45 && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(245, 158, 11, 0.65)" }}>
          <div className="card-head">
            <div>
              <h3>Heat Alert</h3>
              <p>Heat is at {game.heat}/100. Penalties begin after 50. Consider Lookouts or a Heat Bribe.</p>
            </div>
            <span>Alert</span>
          </div>
        </div>
      )}

      <div className="button-row" style={{ marginBottom: 16 }}>
        {["Time", "Flex", "Utility"].map((category) => (
          <button
            key={category}
            className={storeTab === category ? "primary" : "secondary"}
            onClick={() => setStoreTab(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {filteredItems.map((item) => {
          const owned = playerOwnsTributeItem(game, item.id);
          const repeatable = item.type === "time";

          return (
            <div key={item.id} className="card">
              <div className="card-head">
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>
                </div>
                <span>{item.cost} Tribute</span>
              </div>

              <div className="card-body">
                <Info label="Type" value={item.type} />
                <Info label="Fair Play" value={item.fairPlay ? "No P2W Stats" : "Rejected"} />
                <Info label="Effect" value={item.effect.action} />

                {owned && !repeatable && (
                  <p className="soft-text" style={{ color: "#86efac", fontWeight: 800 }}>
                    Owned
                  </p>
                )}

                <button
                  className={owned && !repeatable ? "secondary" : "primary"}
                  disabled={owned && !repeatable}
                  onClick={() => onBuy(item.id)}
                >
                  {owned && !repeatable ? "Owned" : "Buy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
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