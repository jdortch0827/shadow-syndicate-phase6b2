import React, { useEffect, useMemo, useState } from "react";

const SAVE_KEY = "shadow_syndicate_live_source_save_v1";
const AUTH_USERS_KEY = "shadow_syndicate_auth_users_v1";
const AUTH_SESSION_KEY = "shadow_syndicate_auth_session_v1";
const INSTALL_PROMPT_DISMISSED_KEY = "shadow_syndicate_install_prompt_dismissed_v1";
const INSTALL_PROMPT_ACCEPTED_KEY = "shadow_syndicate_install_prompt_accepted_v1";
const ADMIN_USERNAME = "admin";
const ADMIN_DEFAULT_PASSWORD = "admin123";
const ADMIN_DEFAULT_PIN = "0000";
const APP_PHASE = "Phase 1.25";
const APP_BUILD_NAME = "App Icon & Install Prompt";
const APP_BUILD_LABEL = `${APP_PHASE} • ${APP_BUILD_NAME}`;


const bossClasses = [
  {
    id: "boss",
    name: "The Boss",
    short: "Balanced leader",
    image: "/art/characters/boss-profile.jpg",
    perk: "Balanced growth with no major weakness.",
    attack: 1,
    defense: 1,
    income: 1,
    control: 1,
  },
  {
    id: "enforcer",
    name: "The Enforcer",
    short: "Power through force",
    image: "/art/characters/enforcer-crew.jpg",
    perk: "Stronger attack and intimidation.",
    attack: 1.18,
    defense: 1.05,
    income: 1,
    control: 1,
  },
  {
    id: "fixer",
    name: "The Fixer",
    short: "Smooth operator",
    image: "/art/characters/fixer.jpg",
    perk: "Better job payout and cleaner progress.",
    attack: 1,
    defense: 1,
    income: 1.1,
    control: 1,
  },
  {
    id: "mogul",
    name: "The Mogul",
    short: "Money first",
    image: "/art/classes/mogul.jpg",
    perk: "Better property income and business growth.",
    attack: 1,
    defense: 1,
    income: 1.22,
    control: 1,
  },
  {
    id: "ghost",
    name: "The Ghost",
    short: "Move unseen",
    image: "/art/classes/ghost.jpg",
    perk: "Better control gains and lower exposure.",
    attack: 1,
    defense: 1.05,
    income: 1,
    control: 1.22,
  },
  {
    id: "strategist",
    name: "The Strategist",
    short: "Win with brains",
    image: "/art/classes/strategist.jpg",
    perk: "Better attack and defense planning.",
    attack: 1.1,
    defense: 1.1,
    income: 1,
    control: 1,
  },
];

const bossSkills = [
  {
    id: "attackSkill",
    name: "Muscle",
    short: "Win harder fights",
    max: 10,
    effect: "+5 Attack per rank",
    desc: "Makes rival fights and score settling easier to win.",
  },
  {
    id: "defenseSkill",
    name: "Protection",
    short: "Take less punishment",
    max: 10,
    effect: "+5 Defense per rank",
    desc: "Helps protect cash, health, and turf when pressure turns ugly.",
  },
  {
    id: "operationsSkill",
    name: "Operations",
    short: "Cleaner money flow",
    max: 10,
    effect: "+3% job cash and +2% front income per rank",
    desc: "Improves job payouts and front income without changing the whole economy.",
  },
  {
    id: "influenceSkill",
    name: "Influence",
    short: "Better street pull",
    max: 10,
    effect: "+4% tribute and up to 35% lower crew costs",
    desc: "Improves tribute collections and makes crew actions cheaper.",
  },
  {
    id: "stealthSkill",
    name: "Low Profile",
    short: "Less heat and payback",
    max: 10,
    effect: "Reduces Heat gain and rival pressure buildup",
    desc: "Keeps jobs, fights, tribute, and expansion from making too much noise.",
  },
  {
    id: "energySkill",
    name: "Stamina Bank",
    short: "More moves per session",
    max: 10,
    effect: "+10 Max Energy per rank",
    desc: "Lets the player stay active longer before running out of energy.",
  },
];

const districts = [
  { id: "southside", name: "Southside", level: 1, control: 12, cost: 175, energy: 5, risk: "Low" },
  { id: "docks", name: "Docks", level: 1, control: 15, cost: 150, energy: 5, risk: "Low" },
  { id: "warehouse", name: "Warehouse District", level: 1, control: 0, cost: 375, energy: 7, risk: "Medium" },
  { id: "riverside", name: "Riverside", level: 2, control: 0, cost: 550, energy: 8, risk: "Medium" },
  { id: "nightlife", name: "Nightlife District", level: 2, control: 0, cost: 700, energy: 9, risk: "Medium" },
  { id: "financial", name: "Financial Core", level: 3, control: 0, cost: 1300, energy: 12, risk: "High" },
];

const startingDistrictOptions = [
  { id: "docks", name: "Steelgate Docks", note: "steady cash, low heat" },
  { id: "southside", name: "Southside", note: "street control, quick jobs" },
  { id: "warehouse", name: "Warehouse District", note: "slower start, better growth" },
];

const jobs = [
  {
    id: "work_docks",
    name: "Work the Docks",
    district: "docks",
    image: "/art/jobs/work-the-docks.jpg",
    level: 1,
    energy: 4,
    cash: [95, 155],
    xp: 8,
    control: 1,
    desc: "Move quiet cargo through the harbor.",
  },
  {
    id: "secure_warehouse",
    name: "Secure the Warehouse",
    district: "warehouse",
    image: "/art/chapters/harbor-money.jpg",
    level: 1,
    energy: 7,
    cash: [210, 330],
    xp: 15,
    control: 2,
    desc: "Turn an empty building into an operation hub.",
  },
  {
    id: "riverside_routes",
    name: "Control Riverside Routes",
    district: "riverside",
    image: "/art/rivals/riverside-runners.jpg",
    level: 2,
    energy: 9,
    cash: [320, 500],
    xp: 21,
    control: 2,
    desc: "Use garages, back roads, and trusted drivers.",
  },
  {
    id: "nightlife_contacts",
    name: "Build Nightclub Contacts",
    district: "nightlife",
    image: "/art/rivals/nightlife-cartel.jpg",
    level: 2,
    energy: 10,
    cash: [390, 590],
    xp: 24,
    control: 3,
    desc: "Shake hands with owners, promoters, and people who hear things.",
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
    desc: "Small, steady income.",
  },
  {
    id: "dockside_lot",
    name: "Dockside Lot",
    district: "docks",
    image: "/art/properties/dockyard.png",
    cost: 1400,
    income: 80,
    desc: "Eyes on incoming movement.",
  },
  {
    id: "auto_garage",
    name: "Auto Garage",
    district: "riverside",
    image: "/art/properties/garage.png",
    cost: 2200,
    income: 125,
    desc: "A useful front with loyal mechanics.",
  },
  {
    id: "warehouse_front",
    name: "Warehouse Front",
    district: "warehouse",
    image: "/art/properties/warehouse-front.png",
    cost: 5200,
    income: 310,
    desc: "Storage, meetings, and strong presence.",
  },
  {
    id: "empire_nightclub",
    name: "Empire Nightclub",
    district: "nightlife",
    image: "/art/properties/nightclub.png",
    cost: 12500,
    income: 850,
    desc: "Money, status, and attention.",
  },
  {
    id: "private_equity_front",
    name: "Private Equity Front",
    district: "financial",
    image: "/art/properties/executive-lobby.png",
    cost: 25000,
    income: 1800,
    desc: "Downtown money with polished paperwork.",
  },
];


const supplyRoutes = [
  {
    id: "backroom_pipeline",
    name: "Backroom Pipeline",
    properties: ["corner_shop", "warehouse_front"],
    control: { southside: 25, warehouse: 25 },
    cost: 1200,
    incomeBonus: 0.08,
    heatBuffer: 2,
    desc: "Connect the neighborhood front to storage so cash and goods move cleaner.",
  },
  {
    id: "dock_to_garage",
    name: "Dock-to-Garage Route",
    properties: ["dockside_lot", "auto_garage"],
    control: { docks: 35, riverside: 25 },
    cost: 2400,
    incomeBonus: 0.12,
    heatBuffer: 3,
    desc: "Move harbor money through repair bays and trusted drivers.",
  },
  {
    id: "nightlife_cash_lane",
    name: "Nightlife Cash Lane",
    properties: ["empire_nightclub", "private_equity_front"],
    control: { nightlife: 50, financial: 35 },
    cost: 6500,
    incomeBonus: 0.18,
    heatBuffer: 5,
    desc: "Turn loud nightlife cash into polished downtown money.",
  },
];

const gear = [
  {
    id: "street_suit",
    name: "Tailored Street Suit",
    type: "Style",
    image: "/art/gear/tailored-suit.png",
    cost: 500,
    attack: 1,
    defense: 2,
  },
  {
    id: "armored_sedan",
    name: "Armored Sedan",
    type: "Vehicle",
    image: "/art/gear/armored-sedan.png",
    cost: 1800,
    attack: 2,
    defense: 5,
  },
  {
    id: "loyal_enforcer",
    name: "Loyal Enforcer",
    type: "Crew Asset",
    image: "/art/gear/loyal-enforcer.png",
    cost: 3500,
    attack: 7,
    defense: 4,
  },
  {
    id: "city_intel",
    name: "City Intel Network",
    type: "Influence",
    image: "/art/gear/war-room.png",
    cost: 7000,
    attack: 6,
    defense: 9,
  },
];

const blackMarketDeals = [
  {
    id: "burner_network",
    title: "Burner Phone Network",
    tag: "Low Profile",
    image: "/art/pages/city-wire.jpg",
    desc: "Set up throwaway lines and quiet runners so the next moves do not leave as much noise behind.",
    costCash: 650,
    costTribute: 25,
    heatReduction: 14,
    pressureReduction: 7,
    rep: 2,
  },
  {
    id: "street_armor",
    title: "Street Armor Cache",
    tag: "Defense",
    image: "/art/gear/tailored-suit.png",
    desc: "Buy better protection for the inner circle and unlock the tailored street suit if it is not owned yet.",
    costCash: 1100,
    costTribute: 40,
    gearId: "street_suit",
    defenseBonus: 4,
    heat: 1,
    rep: 3,
  },
  {
    id: "offbook_mechanics",
    title: "Off-Book Mechanics",
    tag: "Vehicle",
    image: "/art/gear/armored-sedan.png",
    desc: "A dirty garage can harden a vehicle, stash emergency fuel, and keep the crew moving after a bad night.",
    costCash: 1600,
    costTribute: 60,
    gearId: "armored_sedan",
    energyReward: 25,
    defenseBonus: 2,
    heat: 2,
    rep: 4,
  },
  {
    id: "backroom_payroll",
    title: "Backroom Payroll",
    tag: "Loyalty",
    image: "/art/characters/enforcer-crew.jpg",
    desc: "Move cash through the right hands so one more person joins up and the current crew stays loyal.",
    costCash: 900,
    costTribute: 35,
    crew: 1,
    loyalty: 12,
    respect: 2,
    rep: 3,
  },
];


const safehouseRooms = [
  {
    id: "office",
    name: "Back Office",
    tag: "Money",
    image: "/art/gear/war-room.png",
    baseCost: 1200,
    baseTribute: 25,
    baseEnergy: 4,
    max: 5,
    incomeBonus: 0.03,
    tributeBonus: 0.02,
    desc: "A locked room for ledgers, favors, and cleaner money movement.",
    effect: "+3% front income and +2% tribute per level",
  },
  {
    id: "garage",
    name: "Safehouse Garage",
    tag: "Energy",
    image: "/art/properties/garage.png",
    baseCost: 1500,
    baseTribute: 30,
    baseEnergy: 5,
    max: 5,
    maxEnergy: 10,
    maxStamina: 1,
    desc: "Hidden bays, spare vehicles, and a cleaner way to keep the crew moving.",
    effect: "+10 max Energy and +1 max Stamina per level",
  },
  {
    id: "armory",
    name: "Armory Room",
    tag: "Power",
    image: "/art/gear/armored-sedan.png",
    baseCost: 1700,
    baseTribute: 35,
    baseEnergy: 6,
    max: 5,
    attack: 3,
    defense: 3,
    maxHealth: 5,
    desc: "Better protection, better tools, and fewer surprises when rivals push back.",
    effect: "+3 Attack, +3 Defense, and +5 max Health per level",
  },
  {
    id: "lounge",
    name: "Crew Lounge",
    tag: "Loyalty",
    image: "/art/properties/nightclub.png",
    baseCost: 1000,
    baseTribute: 20,
    baseEnergy: 4,
    max: 5,
    loyalty: 3,
    heatReductionEvery: 2,
    desc: "A quiet room where the crew eats, talks, and remembers why they follow you.",
    effect: "+3 Loyalty per level and small Heat reduction at higher levels",
  },
];

const vaultOperations = [
  {
    id: "launder",
    title: "Launder Vault Cash",
    tag: "Money Flow",
    image: "/art/pages/vault.jpg",
    desc: "Move protected cash back into working money through fronts. You lose a small cut, gain XP and Respect, and add a little Heat.",
  },
  {
    id: "burn_trail",
    title: "Burn Paper Trail",
    tag: "Heat Control",
    image: "/art/gear/war-room.png",
    desc: "Spend protected cash, tribute, and energy to reduce Heat and lower pressure across rival crews.",
  },
];


const underworldContacts = [
  {
    id: "dock_foreman",
    name: "Dock Foreman",
    tag: "Jobs",
    image: "/art/jobs/work-the-docks.jpg",
    max: 5,
    baseCost: 900,
    baseRespect: 4,
    baseTribute: 10,
    desc: "A working boss on the docks who hears what moves before the street does.",
    effect: "+2% job cash per level and small rival pressure control.",
    jobBonus: 0.02,
    rivalPressureReductionEvery: 3,
    favor: {
      title: "Call Cargo Tip",
      desc: "Use the foreman's rumor network for a quick payout and a little dock control.",
      costEnergy: 4,
      cash: 700,
      respect: 1,
      controlDistrict: "docks",
      control: 1,
      heat: 1,
    },
  },
  {
    id: "city_clerk",
    name: "City Clerk",
    tag: "Heat",
    image: "/art/pages/city-wire.jpg",
    max: 5,
    baseCost: 1100,
    baseRespect: 6,
    baseTribute: 15,
    desc: "A quiet paper-pusher who can slow down attention before it becomes a real problem.",
    effect: "Reduces Heat gain and unlocks cleaner cooldown favors.",
    heatReductionEvery: 2,
    favor: {
      title: "Delay the Paperwork",
      desc: "Spend a favor to cut Heat without burning crew or front money.",
      costEnergy: 3,
      costCash: 300,
      heatReduction: 18,
      respect: 1,
    },
  },
  {
    id: "street_doctor",
    name: "Street Doctor",
    tag: "Clinic",
    image: "/art/pages/clinic.jpg",
    max: 5,
    baseCost: 1000,
    baseRespect: 5,
    baseTribute: 12,
    desc: "A backroom doctor who keeps the boss standing when the streets get ugly.",
    effect: "Lowers clinic costs and gives emergency healing favors.",
    clinicDiscount: 0.03,
    favor: {
      title: "Emergency Patch-Up",
      desc: "Recover health without paying the full clinic price.",
      costEnergy: 2,
      costCash: 350,
      health: 35,
      loyalty: 1,
    },
  },
  {
    id: "union_broker",
    name: "Union Broker",
    tag: "Tribute",
    image: "/art/chapters/harbor-money.jpg",
    max: 5,
    baseCost: 1250,
    baseRespect: 7,
    baseTribute: 18,
    desc: "A fixer with hands in labor halls, loading docks, and backroom collections.",
    effect: "+3% tribute per level and better crew loyalty favors.",
    tributeBonus: 0.03,
    favor: {
      title: "Push Quiet Collections",
      desc: "Collect a small tribute bump and remind the crew the operation pays.",
      costEnergy: 4,
      tribute: 90,
      loyalty: 4,
      respect: 1,
      heat: 1,
    },
  },
  {
    id: "backroom_bookkeeper",
    name: "Backroom Bookkeeper",
    tag: "Vault",
    image: "/art/gear/war-room.png",
    max: 5,
    baseCost: 1400,
    baseRespect: 8,
    baseTribute: 20,
    desc: "A numbers person who knows how to move cash without making the whole city stare.",
    effect: "Improves front income and vault laundering rate.",
    frontBonus: 0.015,
    launderBonus: 0.01,
    favor: {
      title: "Clean Small Ledger",
      desc: "Move a small amount directly into protected cash and lower pressure on the books.",
      costEnergy: 5,
      costTribute: 15,
      vaultCash: 600,
      heatReduction: 8,
      pressureReduction: 5,
    },
  },
];


const lieutenantAssignments = [
  { id: "idle", name: "Idle", short: "No active post" },
  { id: "jobs", name: "Jobs", short: "Better job cash and control" },
  { id: "muscle", name: "Muscle", short: "More attack and defense" },
  { id: "turf", name: "Turf", short: "Faster district control" },
  { id: "fronts", name: "Fronts", short: "Better front and vault money" },
  { id: "heat", name: "Heat", short: "Quieter moves and pressure control" },
];

const lieutenants = [
  {
    id: "numbers_calder",
    name: "Vito \"Numbers\" Calder",
    role: "jobs",
    tag: "Jobs",
    image: "/art/gear/war-room.png",
    max: 5,
    baseCost: 1250,
    baseRespect: 4,
    baseTribute: 12,
    desc: "A backroom planner who turns small jobs into cleaner money and steadier control.",
    effect: "Assigned to Jobs: +3.5% job cash per level, +1 job control every 2 levels, and bonus XP.",
    jobBonus: 0.035,
    jobControlEvery: 2,
    jobXp: 2,
  },
  {
    id: "brass_knox",
    name: "Rhea \"Brass\" Knox",
    role: "muscle",
    tag: "Muscle",
    image: "/art/characters/enforcer-crew.jpg",
    max: 5,
    baseCost: 1400,
    baseRespect: 5,
    baseTribute: 14,
    desc: "A hard-nosed lieutenant who keeps fighters disciplined when rivals start testing the crew.",
    effect: "Assigned to Muscle: +4 Attack and +3 Defense per level.",
    attack: 4,
    defense: 3,
  },
  {
    id: "switch_reyes",
    name: "Miles \"Switch\" Reyes",
    role: "turf",
    tag: "Turf",
    image: "/art/chapters/first-blood-southside.jpg",
    max: 5,
    baseCost: 1500,
    baseRespect: 6,
    baseTribute: 16,
    desc: "A block captain who knows which corners can be flipped without turning the whole city loud.",
    effect: "Assigned to Turf: faster expansion and stronger tribute collections.",
    turfGain: 1,
    tributeBonus: 0.025,
  },
  {
    id: "keys_marr",
    name: "Ellis \"Keys\" Marr",
    role: "fronts",
    tag: "Fronts",
    image: "/art/properties/garage.png",
    max: 5,
    baseCost: 1650,
    baseRespect: 7,
    baseTribute: 18,
    desc: "A front operator who keeps shops, garages, and ledgers turning into cleaner empire money.",
    effect: "Assigned to Fronts: +2.5% front income and +1% laundering rate per level.",
    frontBonus: 0.025,
    launderBonus: 0.01,
  },
  {
    id: "ice_vale",
    name: "Nora \"Ice\" Vale",
    role: "heat",
    tag: "Heat",
    image: "/art/pages/city-wire.jpg",
    max: 5,
    baseCost: 1700,
    baseRespect: 8,
    baseTribute: 20,
    desc: "A quiet fixer who slows paper trails, rival whispers, and the kind of attention that hurts growth.",
    effect: "Assigned to Heat: reduces Heat gain and rival pressure buildup.",
    heatReductionEvery: 2,
    rivalPressureReductionEvery: 2,
  },
];

const rivals = [
  {
    id: "alley_crew",
    name: "Alley Crew",
    district: "southside",
    image: "/art/chapters/first-blood-southside.jpg",
    power: 9,
    reward: [200, 370],
    xp: 14,
    control: 4,
  },
  {
    id: "dockside_outfit",
    name: "Dockside Outfit",
    district: "docks",
    image: "/art/rivals/dockside-outfit.jpg",
    power: 18,
    reward: [420, 660],
    xp: 27,
    control: 5,
  },
  {
    id: "riverside_runners",
    name: "Riverside Runners",
    district: "riverside",
    image: "/art/rivals/riverside-runners.jpg",
    power: 28,
    reward: [575, 850],
    xp: 35,
    control: 5,
  },
  {
    id: "nightlife_cartel",
    name: "Nightlife Cartel",
    district: "nightlife",
    image: "/art/rivals/nightlife-cartel.jpg",
    power: 43,
    reward: [950, 1400],
    xp: 52,
    control: 6,
  },
  {
    id: "warehouse_union",
    name: "Warehouse Union",
    district: "warehouse",
    image: "/art/chapters/harbor-money.jpg",
    power: 24,
    reward: [500, 760],
    xp: 32,
    control: 5,
  },
  {
    id: "financial_circle",
    name: "Financial Circle",
    district: "financial",
    image: "/art/properties/executive-lobby.png",
    power: 65,
    reward: [1700, 2400],
    xp: 72,
    control: 7,
  },
];

const campaign = [
  {
    id: "c1",
    title: "Chapter 1: First Blood in Southside",
    image: "/art/chapters/first-blood-southside.jpg",
    desc: "Start small, build respect, and take your first piece of the city.",
    goals: ["Run 3 jobs", "Win your first fight", "Reach 25% Southside control"],
  },
  {
    id: "c2",
    title: "Chapter 2: Harbor Money",
    image: "/art/chapters/harbor-money.jpg",
    desc: "The docks are where the real cash starts moving.",
    goals: ["Control the harbor", "Buy into the docks", "Break a rival crew"],
  },
];

const pageCards = [
  {
    tab: "daily",
    title: "Daily Orders",
    image: "/art/pages/city-wire.jpg",
    desc: "Clear today's street orders, build a streak, and claim a fresh reward each day.",
  },
  {
    tab: "event",
    title: "Concrete Pour",
    image: "/art/chapters/first-blood-southside.jpg",
    desc: "A 72-hour Southside turf event with Influence, phases, a deputy crew choice, and a local leaderboard.",
  },
  {
    tab: "campaign",
    title: "Campaign",
    image: "/art/chapters/first-blood-southside.jpg",
    desc: "Follow chapter goals, claim rewards, and grow from street boss to city power.",
  },
  {
    tab: "skills",
    title: "Boss Skills",
    image: "/art/gear/war-room.png",
    desc: "Spend skill points on muscle, influence, operations, low profile moves, and energy capacity.",
  },
  {
    tab: "safehouse",
    title: "Safehouse",
    image: "/art/gear/war-room.png",
    desc: "Upgrade your base of operations for stronger income, more energy, better defense, and quieter heat.",
  },
  {
    tab: "contacts",
    title: "Contacts",
    image: "/art/pages/city-wire.jpg",
    desc: "Build underworld relationships, unlock favors, and improve jobs, heat control, tribute, and vault work.",
  },
  {
    tab: "lieutenants",
    title: "Lieutenants",
    image: "/art/characters/enforcer-crew.jpg",
    desc: "Recruit trusted lieutenants, promote them, and assign them to jobs, turf, fronts, muscle, or heat control.",
  },
  {
    tab: "market",
    title: "Black Market",
    image: "/art/gear/war-room.png",
    desc: "Buy daily underworld favors and upgrade owned gear into stronger boss assets.",
  },
  {
    tab: "jobs",
    title: "Run Jobs",
    image: "/ui/run-jobs.png",
    desc: "Spend energy, earn cash, and build city influence.",
  },
  {
    tab: "crew",
    title: "Recruit Crew",
    image: "/ui/recruit-crew.png",
    desc: "Build muscle, buy gear, and increase your power.",
  },
  {
    tab: "territory",
    title: "Take Districts",
    image: "/ui/take-districts.png",
    desc: "Expand control and unlock stronger money routes.",
  },
  {
    tab: "heat",
    title: "Street Heat",
    image: "/art/pages/city-wire.jpg",
    desc: "Lower attention before the city starts pushing back.",
  },
  {
    tab: "revenge",
    title: "Revenge Log",
    image: "/art/pages/revenge-log.jpg",
    desc: "Track rival pressure and stop payback before it hits your streets.",
  },
  {
    tab: "vault",
    title: "Vault",
    image: "/art/pages/vault.jpg",
    desc: "Protect cash, upgrade storage, launder money, and burn the paper trail.",
  },
  {
    tab: "clinic",
    title: "Clinic",
    image: "/art/pages/clinic.jpg",
    desc: "Patch up your boss before the next hit.",
  },
  {
    tab: "wire",
    title: "City Wire",
    image: "/art/pages/city-wire.jpg",
    desc: "Track city updates and underworld movement.",
  },
];

const streetOpportunities = [
  {
    id: "loose_cargo",
    title: "Loose Cargo at the Docks",
    tag: "Cash Move",
    district: "docks",
    image: "/art/jobs/work-the-docks.jpg",
    desc: "A dock worker says a small shipment is sitting where nobody official wants to claim it.",
    options: [
      {
        id: "move_cargo",
        label: "Move the Cargo",
        desc: "Spend energy, take the bigger cash, and accept the extra attention.",
        costEnergy: 8,
        cash: 950,
        xp: 18,
        respect: 3,
        heat: 6,
        pressure: 9,
      },
      {
        id: "sell_tip",
        label: "Sell the Tip",
        desc: "Take a smaller payout and keep the streets quieter.",
        costEnergy: 2,
        cash: 350,
        xp: 6,
        respect: 1,
        heat: 1,
        pressure: 2,
      },
    ],
  },
  {
    id: "neighborhood_favor",
    title: "Neighborhood Favor",
    tag: "Respect",
    district: "southside",
    image: "/art/chapters/first-blood-southside.jpg",
    desc: "A local shop owner needs a problem handled quietly before it turns into police attention.",
    options: [
      {
        id: "handle_quiet",
        label: "Handle It Quiet",
        desc: "Use your crew to solve it clean and gain local respect.",
        costEnergy: 6,
        cash: 250,
        xp: 14,
        respect: 5,
        loyalty: 2,
        control: 2,
        heat: 2,
        pressure: 4,
      },
      {
        id: "send_message",
        label: "Send a Message",
        desc: "Push harder for more control, but the city notices.",
        costEnergy: 7,
        cash: 420,
        xp: 18,
        respect: 4,
        control: 4,
        heat: 5,
        pressure: 8,
      },
    ],
  },
  {
    id: "dirty_tip",
    title: "Dirty Tip from City Hall",
    tag: "Low Heat",
    district: "financial",
    image: "/art/pages/city-wire.jpg",
    desc: "A clerk wants cash for information that could lower pressure before the next push.",
    options: [
      {
        id: "buy_file",
        label: "Buy the File",
        desc: "Pay cash to lower Heat and gain a little XP.",
        costCash: 700,
        costEnergy: 1,
        xp: 10,
        respect: 1,
        heatReduction: 14,
        pressureReduction: 8,
      },
      {
        id: "burn_contact",
        label: "Burn the Contact",
        desc: "Use influence instead of cash. It cools Heat but hurts loyalty a little.",
        costEnergy: 4,
        xp: 8,
        respect: 1,
        loyalty: -3,
        heatReduction: 9,
        pressureReduction: 5,
      },
    ],
  },
  {
    id: "rival_messenger",
    title: "Rival Messenger Spotted",
    tag: "Pressure",
    district: "warehouse",
    image: "/art/pages/revenge-log.jpg",
    desc: "A runner tied to a rival crew is moving through neutral streets with a message for your enemies.",
    options: [
      {
        id: "intercept",
        label: "Intercept the Runner",
        desc: "Risk a small fight to cut pressure before it grows.",
        costEnergy: 7,
        cash: 300,
        xp: 20,
        respect: 3,
        heat: 4,
        pressureReduction: 16,
      },
      {
        id: "follow",
        label: "Follow from a Distance",
        desc: "Play it safer and gather useful information.",
        costEnergy: 5,
        cash: 150,
        xp: 12,
        respect: 1,
        heat: 1,
        pressureReduction: 8,
      },
    ],
  },
];


const liveEvent = {
  id: "concrete_pour_southside",
  name: "Concrete Pour: Southside",
  shortName: "Concrete Pour",
  districtId: "southside",
  durationHours: 72,
  milestoneInfluence: 500,
  prizePoolTribute: 10000,
  phases: [
    {
      id: "prep",
      name: "Prep",
      startsAtHour: 0,
      endsAtHour: 24,
      rule: "Southside jobs give 2x Influence.",
      jobMultiplier: 2,
      propertyOnly: false,
    },
    {
      id: "pour",
      name: "Pour",
      startsAtHour: 24,
      endsAtHour: 48,
      rule: "Southside jobs give normal Influence.",
      jobMultiplier: 1,
      propertyOnly: false,
    },
    {
      id: "cure",
      name: "Cure",
      startsAtHour: 48,
      endsAtHour: 72,
      rule: "Southside front income and tribute count for Influence.",
      jobMultiplier: 0,
      propertyOnly: true,
    },
  ],
  demoLeaderboard: [
    { bossName: "Grave Ledger", influence: 1620 },
    { bossName: "Viper Lane", influence: 1445 },
    { bossName: "Southside Saint", influence: 1310 },
    { bossName: "Blacktop Benny", influence: 920 },
    { bossName: "The Velvet Hammer", influence: 760 },
  ],
};

const defaultTerritory = Object.fromEntries(districts.map((d) => [d.id, d.control]));

const startGame = {
  started: false,
  profileComplete: false,
  bossName: "Rookie",
  classId: "boss",
  startingDistrictId: "docks",
  profileImage: "/art/characters/boss-profile.jpg",
  cash: 750,
  vault: 0,
  vaultLevel: 0,
  launderedCash: 0,
  vaultOperations: 0,
  tribute: 100,
  level: 1,
  xp: 0,
  health: 100,
  maxHealth: 100,
  heat: 0,
  energy: 300,
  maxEnergy: 100,
  stamina: 25,
  maxStamina: 25,
  crew: 5,
  crewLoyalty: 75,
  crewAttackBonus: 0,
  crewDefenseBonus: 0,
  respect: 0,
  wins: 0,
  losses: 0,
  skillPoints: 0,
  attackSkill: 0,
  defenseSkill: 0,
  operationsSkill: 0,
  influenceSkill: 0,
  stealthSkill: 0,
  energySkill: 0,
  jobsRun: 0,
  territory: defaultTerritory,
  properties: {},
  propertyUpgrades: {},
  supplyRoutes: {},
  gear: {},
  gearUpgrades: {},
  safehouse: {},
  safehouseMoves: 0,
  contacts: {},
  contactFavors: {},
  contactMoves: 0,
  lieutenants: {},
  lieutenantAssignments: {},
  lieutenantMoves: 0,
  marketRep: 0,
  blackMarketDate: "",
  blackMarketDeals: {},
  blackMarketPurchases: 0,
  beaten: {},
  rivalPressure: {},
  revengeLog: [],
  rivalHitsBlocked: 0,
  districtCollections: {},
  dailyOrdersDate: "",
  dailyStats: { jobs: 0, turf: 0, crew: 0, heat: 0, tribute: 0, rival: 0, fronts: 0 },
  dailyRewardClaimedDate: "",
  dailyStreak: 0,
  lastDailyClaimDate: "",
  cityEventId: "",
  cityEventExpiresAt: 0,
  cityWireMoves: 0,
  cityWireResolved: 0,
  liveEventStartedAt: 0,
  liveEventInfluence: 0,
  liveEventMoves: 0,
  liveEventDeputized: false,
  liveEventRewards: { concretePourMilestone: false },
  chapterRewards: { firstMoves: false, chapterOne: false, chapterTwo: false, chapterThree: false, chapterFour: false },
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

function safeEncode(value) {
  try {
    return btoa(String(value || ""));
  } catch {
    return String(value || "");
  }
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function createAuthUser({ username, password, pin, displayName, role = "player" }) {
  const cleanUsername = normalizeUsername(username);
  return {
    username: cleanUsername,
    displayName: String(displayName || cleanUsername || "Player").trim().slice(0, 28),
    password: safeEncode(password),
    recoveryPin: safeEncode(pin),
    role,
    createdAt: Date.now(),
    lastLoginAt: 0,
  };
}

function loadAuthUsers() {
  const seededAdmin = createAuthUser({
    username: ADMIN_USERNAME,
    password: ADMIN_DEFAULT_PASSWORD,
    pin: ADMIN_DEFAULT_PIN,
    displayName: "Admin",
    role: "admin",
  });

  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || "{}");
    const users = saved && typeof saved === "object" ? saved : {};
    if (!users[ADMIN_USERNAME]) users[ADMIN_USERNAME] = seededAdmin;
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    return users;
  } catch {
    const users = { [ADMIN_USERNAME]: seededAdmin };
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    return users;
  }
}

function saveAuthUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users || {}));
}

function loadAuthSession() {
  try {
    const session = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
    return session?.username ? session : null;
  } catch {
    return null;
  }
}

function getUserSaveKey(username) {
  return `${SAVE_KEY}_${normalizeUsername(username)}`;
}

function loadGameForUser(username) {
  const cleanUsername = normalizeUsername(username);

  try {
    if (cleanUsername) {
      const savedForUser = localStorage.getItem(getUserSaveKey(cleanUsername));
      if (savedForUser) return normalizeGame(JSON.parse(savedForUser));
    }

    const oldSharedSave = localStorage.getItem(SAVE_KEY);
    if (oldSharedSave && cleanUsername === ADMIN_USERNAME) return normalizeGame(JSON.parse(oldSharedSave));

    return normalizeGame(startGame);
  } catch {
    return normalizeGame(startGame);
  }
}

function passwordMatches(user, password) {
  return user?.password === safeEncode(password);
}

function pinMatches(user, pin) {
  return user?.recoveryPin === safeEncode(pin);
}

function updateUserPassword(user, password, options = {}) {
  return {
    ...user,
    password: safeEncode(password),
    mustResetPassword: Boolean(options.mustResetPassword),
    passwordUpdatedAt: Date.now(),
  };
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function getEmptyDailyStats() {
  return { jobs: 0, turf: 0, crew: 0, heat: 0, tribute: 0, rival: 0, fronts: 0 };
}

function ensureDailyState(game) {
  const today = getTodayKey();
  if (game.dailyOrdersDate === today) {
    return {
      ...game,
      dailyStats: { ...getEmptyDailyStats(), ...(game.dailyStats || {}) },
    };
  }

  return {
    ...game,
    dailyOrdersDate: today,
    dailyStats: getEmptyDailyStats(),
    dailyRewardClaimedDate: game.dailyRewardClaimedDate === today ? game.dailyRewardClaimedDate : "",
  };
}

function addDailyProgress(game, key, amount = 1) {
  const dailyGame = ensureDailyState(game);
  const stats = { ...getEmptyDailyStats(), ...(dailyGame.dailyStats || {}) };

  return {
    ...dailyGame,
    dailyStats: {
      ...stats,
      [key]: Math.max(0, Number(stats[key] || 0) + amount),
    },
  };
}

function isDailyRewardClaimed(game) {
  return game.dailyRewardClaimedDate === getTodayKey();
}

function getDailyOrders(game) {
  const dailyGame = ensureDailyState(game);
  const stats = { ...getEmptyDailyStats(), ...(dailyGame.dailyStats || {}) };
  const heatOrTribute = Number(stats.heat || 0) + Number(stats.tribute || 0);

  return [
    { id: "jobs", label: "Run 2 jobs", current: Number(stats.jobs || 0), target: 2, action: "jobs" },
    { id: "turf", label: "Gain 5% turf control", current: Number(stats.turf || 0), target: 5, action: "territory" },
    { id: "crew", label: "Make 1 crew move", current: Number(stats.crew || 0), target: 1, action: "crew" },
    { id: "heat", label: "Collect tribute or cool Heat", current: heatOrTribute, target: 1, action: "heat" },
  ].map((order) => ({ ...order, done: order.current >= order.target }));
}

function getDailyReward(game) {
  const streak = Number(game.dailyStreak || 0);
  const streakBonus = streak > 0 && (streak + 1) % 3 === 0;

  return {
    cash: 1250 + streak * 150,
    energy: 75,
    respect: 4 + Math.min(6, Math.floor(streak / 2)),
    skillPoints: streakBonus ? 1 : 0,
  };
}

function getActiveStreetOpportunity(game) {
  const eventId = game?.cityEventId || "";
  if (!eventId) return null;
  if (Number(game?.cityEventExpiresAt || 0) <= Date.now()) return null;
  return streetOpportunities.find((event) => event.id === eventId) || null;
}

function getStreetOpportunityLabel(game) {
  const expiresAt = Number(game?.cityEventExpiresAt || 0);
  if (!game?.cityEventId) return "No active lead";
  if (expiresAt <= Date.now()) return "Lead expired";

  const minutes = Math.max(1, Math.ceil((expiresAt - Date.now()) / 60000));
  return `${minutes} min left`;
}

function getStreetOpportunityCost(option) {
  const parts = [];
  if (option.costCash) parts.push(money(option.costCash));
  if (option.costEnergy) parts.push(`${option.costEnergy} Energy`);
  return parts.length ? parts.join(" / ") : "Free";
}

function getStreetOpportunityReward(option) {
  const parts = [];
  if (option.cash) parts.push(money(option.cash));
  if (option.xp) parts.push(`${option.xp} XP`);
  if (option.respect) parts.push(`+${option.respect} Respect`);
  if (option.control) parts.push(`+${option.control}% Control`);
  if (option.heatReduction) parts.push(`-${option.heatReduction} Heat`);
  if (option.pressureReduction) parts.push(`-${option.pressureReduction} Rival Pressure`);
  return parts.length ? parts.join(" • ") : "Street advantage";
}

function getSkillLevel(game, skillId) {
  const skill = bossSkills.find((item) => item.id === skillId);
  const max = skill?.max || 10;
  return clamp(Number(game?.[skillId] || 0), 0, max);
}

function getBossSkillStats(game) {
  const attackRank = getSkillLevel(game, "attackSkill");
  const defenseRank = getSkillLevel(game, "defenseSkill");
  const operationsRank = getSkillLevel(game, "operationsSkill");
  const influenceRank = getSkillLevel(game, "influenceSkill");
  const stealthRank = getSkillLevel(game, "stealthSkill");
  const energyRank = getSkillLevel(game, "energySkill");

  return {
    attackRank,
    defenseRank,
    operationsRank,
    influenceRank,
    stealthRank,
    energyRank,
    totalRanks: attackRank + defenseRank + operationsRank + influenceRank + stealthRank + energyRank,
    attackBonus: attackRank * 5,
    defenseBonus: defenseRank * 5,
    jobIncomeMultiplier: 1 + operationsRank * 0.03,
    frontIncomeMultiplier: 1 + operationsRank * 0.02,
    tributeMultiplier: 1 + influenceRank * 0.04,
    crewDiscount: Math.min(0.35, influenceRank * 0.035),
    heatReduction: Math.floor(stealthRank / 2),
    rivalPressureReduction: Math.floor(stealthRank / 2),
  };
}

function getHeatTier(heat) {
  if (heat >= 85) {
    return {
      label: "Lockdown",
      tone: "danger",
      desc: "The city is watching every move. Jobs pay less and bad rolls hurt more.",
      advice: "Lay low before running more jobs or starting fights.",
    };
  }

  if (heat >= 60) {
    return {
      label: "Hot",
      tone: "warning",
      desc: "Police pressure and rival eyes are building around your operation.",
      advice: "Run smaller moves or spend cash to cool things down.",
    };
  }

  if (heat >= 30) {
    return {
      label: "Watched",
      tone: "watch",
      desc: "You are making noise, but the streets are still manageable.",
      advice: "Keep earning, but do not let heat get out of control.",
    };
  }

  return {
    label: "Quiet",
    tone: "quiet",
    desc: "Your crew is moving clean and staying below the radar.",
    advice: "Good time to run jobs, buy fronts, and build control.",
  };
}

function heatPayoutMultiplier(heat) {
  if (heat >= 85) return 0.7;
  if (heat >= 60) return 0.85;
  if (heat >= 30) return 0.95;
  return 1;
}

function getCrewStanding(loyalty) {
  if (loyalty >= 85) {
    return {
      label: "Locked In",
      tone: "strong",
      desc: "Your crew trusts the plan and performs better under pressure.",
    };
  }

  if (loyalty >= 60) {
    return {
      label: "Solid",
      tone: "steady",
      desc: "The crew is loyal enough, but they still expect to be paid and trained.",
    };
  }

  if (loyalty >= 35) {
    return {
      label: "Shaky",
      tone: "watch",
      desc: "The crew is starting to question leadership. Power drops if this gets worse.",
    };
  }

  return {
    label: "Fractured",
    tone: "danger",
    desc: "The crew is close to breaking. Pay them before taking bigger risks.",
  };
}

function crewEffectiveness(loyalty) {
  if (loyalty >= 85) return 1.08;
  if (loyalty >= 60) return 1;
  if (loyalty >= 35) return 0.9;
  return 0.75;
}

function getControlTier(control) {
  if (control >= 100) {
    return {
      label: "Owned",
      tone: "owned",
      desc: "Your name controls this district. Income and tribute are strongest here.",
      incomeBonus: 1.35,
      tributeBonus: 1.45,
    };
  }

  if (control >= 75) {
    return {
      label: "Stronghold",
      tone: "stronghold",
      desc: "Your crew has real weight here. Businesses pay better and rivals hesitate.",
      incomeBonus: 1.22,
      tributeBonus: 1.28,
    };
  }

  if (control >= 50) {
    return {
      label: "Street Grip",
      tone: "grip",
      desc: "You have enough corners covered to squeeze better money out of the area.",
      incomeBonus: 1.1,
      tributeBonus: 1.15,
    };
  }

  if (control >= 25) {
    return {
      label: "Foothold",
      tone: "foothold",
      desc: "You have a foothold. The district can now produce small tribute collections.",
      incomeBonus: 1,
      tributeBonus: 1,
    };
  }

  return {
    label: "Unclaimed",
    tone: "unclaimed",
    desc: "Your name does not carry enough weight here yet. Build control before collecting tribute.",
    incomeBonus: 0.85,
    tributeBonus: 0,
  };
}

function getDistrictIncomeMultiplier(control) {
  return getControlTier(control).incomeBonus;
}

function getDistrictTribute(district, control, bossIncome = 1, loyalty = 75, tributeMultiplier = 1) {
  const tier = getControlTier(control);
  if (control < 25) return 0;

  const loyaltyMultiplier = loyalty >= 85 ? 1.1 : loyalty < 45 ? 0.85 : 1;
  const base = 150 + district.level * 110 + control * 8;
  return Math.round(base * tier.tributeBonus * bossIncome * loyaltyMultiplier * tributeMultiplier);
}

function getPropertyName(id) {
  return properties.find((property) => property.id === id)?.name || id;
}

function getDistrictName(id) {
  return districts.find((district) => district.id === id)?.name || id;
}

function getPropertyLevel(game, propertyId) {
  const owned = Number(game.properties?.[propertyId] || 0);
  if (owned <= 0) return 0;
  return clamp(Number(game.propertyUpgrades?.[propertyId] || 1), 1, 5);
}

function getPropertyLevelMultiplier(level) {
  if (level <= 0) return 0;
  return 1 + (level - 1) * 0.18;
}

function getPropertyUpgradeCost(property, level) {
  return Math.round(property.cost * 0.55 * Math.max(1, level));
}

function getPropertyIncomeValue(property, game, bossIncome = 1) {
  const owned = Number(game.properties?.[property.id] || 0);
  const level = getPropertyLevel(game, property.id);
  if (owned <= 0 || level <= 0) return 0;

  const districtControl = game.territory?.[property.district] || 0;
  const districtMultiplier = getDistrictIncomeMultiplier(districtControl);
  return Math.round(property.income * owned * bossIncome * districtMultiplier * getPropertyLevelMultiplier(level));
}

function getSupplyRouteStats(game) {
  const activeRoutes = supplyRoutes.filter((route) => Boolean(game.supplyRoutes?.[route.id]));
  const incomeBonus = activeRoutes.reduce((sum, route) => sum + route.incomeBonus, 0);
  const heatBuffer = activeRoutes.reduce((sum, route) => sum + route.heatBuffer, 0);

  return {
    activeCount: activeRoutes.length,
    incomeBonus,
    heatBuffer,
    incomeMultiplier: 1 + incomeBonus,
  };
}

function getAdjustedHeatGain(game, baseGain) {
  const buffer = getSupplyRouteStats(game).heatBuffer;
  const lowProfile = getBossSkillStats(game).heatReduction;
  const safehouseHeatReduction = getSafehouseStats(game).heatReduction;
  const vaultHeatReduction = Math.floor(getVaultLevel(game) / 3);
  const contactHeatReduction = getContactStats(game).heatReduction;
  const lieutenantHeatReduction = getLieutenantStats(game).heatReduction;
  return Math.max(0, Number(baseGain || 0) - Math.floor(buffer / 2) - lowProfile - safehouseHeatReduction - vaultHeatReduction - contactHeatReduction - lieutenantHeatReduction);
}

function getRouteStatus(route, game) {
  const missingProperties = route.properties.filter((propertyId) => !Number(game.properties?.[propertyId] || 0));
  const missingControl = Object.entries(route.control).filter(
    ([districtId, needed]) => (game.territory?.[districtId] || 0) < needed
  );

  return {
    active: Boolean(game.supplyRoutes?.[route.id]),
    unlocked: missingProperties.length === 0 && missingControl.length === 0,
    missingProperties,
    missingControl,
  };
}

function getRivalPressure(game, rivalId) {
  return clamp(Number(game.rivalPressure?.[rivalId] || 0), 0, 100);
}

function getRivalPressureTier(pressure) {
  if (pressure >= 85) {
    return {
      label: "Payback Imminent",
      tone: "danger",
      desc: "This crew is close to hitting back. Vault cash and settle the pressure soon.",
    };
  }

  if (pressure >= 60) {
    return {
      label: "Retaliation Risk",
      tone: "warning",
      desc: "They are watching your moves and looking for a chance to answer.",
    };
  }

  if (pressure >= 30) {
    return {
      label: "Agitated",
      tone: "watch",
      desc: "They have noticed your push, but the problem is still manageable.",
    };
  }

  return {
    label: "Quiet",
    tone: "quiet",
    desc: "No serious revenge pressure from this crew right now.",
  };
}

function getRivalsForDistrict(districtId) {
  return rivals.filter((rival) => rival.district === districtId);
}

function getTopRivalPressure(game) {
  return rivals
    .map((rival) => ({ rival, pressure: getRivalPressure(game, rival.id), tier: getRivalPressureTier(getRivalPressure(game, rival.id)) }))
    .sort((a, b) => b.pressure - a.pressure)[0];
}

function addRevengeLog(game, message) {
  return {
    ...game,
    revengeLog: [message, ...(game.revengeLog || [])].slice(0, 16),
  };
}

function addRivalPressureById(game, rivalId, amount, reason) {
  const rival = rivals.find((item) => item.id === rivalId);
  const adjustedAmount = Math.max(0, Number(amount || 0) - getBossSkillStats(game).rivalPressureReduction - getContactStats(game).rivalPressureReduction - getLieutenantStats(game).rivalPressureReduction);
  if (!rival || adjustedAmount <= 0) return game;

  const current = getRivalPressure(game, rivalId);
  const nextPressure = clamp(current + adjustedAmount, 0, 100);
  let next = {
    ...game,
    rivalPressure: {
      ...(game.rivalPressure || {}),
      [rivalId]: nextPressure,
    },
  };

  if (nextPressure >= 60 && current < 60) {
    next = addRevengeLog(next, `${rival.name} moved into retaliation risk after ${reason}.`);
  }

  if (nextPressure >= 85 && current < 85) {
    next = addRevengeLog(next, `${rival.name} is close to payback. Pressure reached ${nextPressure}/100.`);
  }

  return next;
}

function addDistrictRivalPressure(game, districtId, amount, reason) {
  const localRivals = getRivalsForDistrict(districtId);
  if (!localRivals.length) return game;

  return localRivals.reduce((next, rival) => addRivalPressureById(next, rival.id, amount, reason), game);
}

function maybeRivalRetaliation(game, districtId, chance = 0) {
  const localRivals = getRivalsForDistrict(districtId);
  if (!localRivals.length) return game;

  const rival = localRivals
    .map((item) => ({ ...item, pressure: getRivalPressure(game, item.id) }))
    .sort((a, b) => b.pressure - a.pressure)[0];

  if (!rival || rival.pressure < 70 || rand(1, 100) > chance) return game;

  const pressureTier = getRivalPressureTier(rival.pressure);
  const vaultStats = getVaultStats(game);
  const vaultProtection = vaultStats.rivalLossMultiplier;
  const defenseProtection = Math.max(0.45, 1 - Number(game.crewDefenseBonus || 0) / 140);
  const cashLoss = Math.min(
    Number(game.cash || 0),
    Math.round(rand(140, 380) * vaultProtection * defenseProtection * (pressureTier.tone === "danger" ? 1.25 : 1))
  );
  const healthDamage = Math.round(rand(4, 12) * defenseProtection);
  const controlLoss = rand(1, 3);
  const nextPressure = Math.max(0, rival.pressure - rand(22, 34));

  let next = {
    ...game,
    cash: Math.max(0, Number(game.cash || 0) - cashLoss),
    health: Math.max(0, Number(game.health || 0) - healthDamage),
    rivalPressure: {
      ...(game.rivalPressure || {}),
      [rival.id]: nextPressure,
    },
    territory: {
      ...(game.territory || {}),
      [districtId]: clamp((game.territory?.[districtId] || 0) - controlLoss, 0, 100),
    },
  };

  next = addRevengeLog(
    next,
    `${rival.name} hit back in ${getDistrictName(districtId)}. Lost ${money(cashLoss)}, ${healthDamage} Health, and ${controlLoss}% control.`
  );

  return addLog(
    next,
    `${rival.name} retaliated in ${getDistrictName(districtId)}. Vault cash and lower rival pressure to prevent more hits.`
  );
}

function getCollectionStatus(game, districtId) {
  const last = Number(game.districtCollections?.[districtId] || 0);
  const cooldown = 15 * 60 * 1000;
  const remaining = Math.max(0, cooldown - (Date.now() - last));

  return {
    ready: remaining <= 0,
    remaining,
    label: remaining <= 0 ? "Ready" : `${Math.ceil(remaining / 60000)} min`,
  };
}

function getCampaignChapters(game) {
  const territory = game.territory || {};
  const rewards = game.chapterRewards || {};
  const ownedPropertyCount = Object.values(game.properties || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const upgradedFrontCount = Object.values(game.propertyUpgrades || {}).filter((level) => Number(level || 0) > 1).length;
  const activeRoutes = Object.values(game.supplyRoutes || {}).filter(Boolean).length;
  const startingDistrictId = game.startingDistrictId || "docks";
  const startingDistrictName = getDistrictName(startingDistrictId);
  const startingControl = territory[startingDistrictId] || 0;
  const cityControl = Math.round(districts.reduce((sum, district) => sum + (territory[district.id] || 0), 0) / districts.length);
  const strongholds = districts.filter((district) => (territory[district.id] || 0) >= 75).length;
  const ownedDistricts = districts.filter((district) => (territory[district.id] || 0) >= 100).length;
  const topPressure = getTopRivalPressure(game)?.pressure || 0;

  const chapters = [
    {
      id: "chapterOne",
      title: "Chapter 1: First Blood",
      image: "/art/chapters/first-blood-southside.jpg",
      desc: `Prove your name matters in ${startingDistrictName}. Run jobs, win a fight, and take enough turf to be noticed.`,
      rewardText: "$1,500 • +60 Energy • +2 Crew • +6 Respect",
      reward: { cash: 1500, energy: 60, crew: 2, respect: 6, xp: 35 },
      requirements: [
        { label: "Run 3 jobs", done: Number(game.jobsRun || 0) >= 3, action: "jobs" },
        { label: "Win 1 rival fight", done: Number(game.wins || 0) >= 1, action: "rivals" },
        { label: `Reach 35% control in ${startingDistrictName}`, done: startingControl >= 35, action: "territory" },
      ],
    },
    {
      id: "chapterTwo",
      title: "Chapter 2: Money Through Fronts",
      image: "/art/chapters/harbor-money.jpg",
      desc: "The streets do not respect noise for long. Buy fronts, upgrade them, and start turning territory into steady money.",
      rewardText: "$3,000 • +80 Energy • +8 Respect • -10 Heat",
      reward: { cash: 3000, energy: 80, crew: 0, respect: 8, xp: 55, heatReduction: 10 },
      requirements: [
        { label: "Own 2 fronts", done: ownedPropertyCount >= 2, action: "properties" },
        { label: "Upgrade any front", done: upgradedFrontCount >= 1, action: "properties" },
        { label: "Reach $200/min income", done: Number(game.cash || 0) >= 0 && getSupplyRouteStats(game) && properties.reduce((sum, item) => sum + getPropertyIncomeValue(item, game, 1), 0) >= 200, action: "properties" },
      ],
    },
    {
      id: "chapterThree",
      title: "Chapter 3: The Crew Has a Name",
      image: "/art/gear/war-room.png",
      desc: "A boss without loyal people is just a target. Build respect, keep the crew paid, and make your operation harder to push around.",
      rewardText: "$4,500 • +3 Crew • +10 Respect • +1 Skill Point",
      reward: { cash: 4500, energy: 50, crew: 3, respect: 10, xp: 75, skillPoints: 1 },
      requirements: [
        { label: "Reach 25 Respect", done: Number(game.respect || 0) >= 25, action: "crew" },
        { label: "Build crew to 12 members", done: Number(game.crew || 0) >= 12, action: "crew" },
        { label: "Keep loyalty at 70 or higher", done: Number(game.crewLoyalty ?? 75) >= 70, action: "crew" },
      ],
    },
    {
      id: "chapterFour",
      title: "Chapter 4: Citywide Pressure",
      image: "/art/pages/revenge-log.jpg",
      desc: "Now the city knows your name. Hold turf, open supply routes, and keep rivals from turning pressure into payback.",
      rewardText: "$7,500 • +120 Energy • +15 Respect • +2 Skill Points",
      reward: { cash: 7500, energy: 120, crew: 0, respect: 15, xp: 110, skillPoints: 2 },
      requirements: [
        { label: "Reach 35% city control", done: cityControl >= 35, action: "territory" },
        { label: "Create 1 stronghold", done: strongholds >= 1, action: "territory" },
        { label: "Open 1 supply route", done: activeRoutes >= 1, action: "properties" },
        { label: "Keep top rival pressure under 70", done: topPressure < 70, action: "revenge" },
      ],
    },
  ];

  return chapters.map((chapter, index) => {
    const previous = chapters[index - 1];
    const unlocked = index === 0 || Boolean(rewards?.[previous.id]);
    const complete = chapter.requirements.every((item) => item.done);
    const claimed = Boolean(rewards?.[chapter.id]);

    return { ...chapter, unlocked, complete, claimed };
  });
}

function getCampaignRewardLabel(reward) {
  const parts = [];
  if (reward.cash) parts.push(money(reward.cash));
  if (reward.energy) parts.push(`+${reward.energy} Energy`);
  if (reward.crew) parts.push(`+${reward.crew} Crew`);
  if (reward.respect) parts.push(`+${reward.respect} Respect`);
  if (reward.skillPoints) parts.push(`+${reward.skillPoints} Skill Point${reward.skillPoints === 1 ? "" : "s"}`);
  if (reward.heatReduction) parts.push(`-${reward.heatReduction} Heat`);
  return parts.join(", ");
}

function getRecruitCost(game) {
  const discount = getBossSkillStats(game).crewDiscount;
  return Math.round((300 + Number(game.crew || 0) * 90 + Number(game.level || 1) * 50) * (1 - discount));
}

function getTrainingCost(game) {
  const discount = getBossSkillStats(game).crewDiscount;
  return Math.round((350 + Number(game.level || 1) * 90) * (1 - discount));
}

function getPayrollCost(game) {
  const discount = getBossSkillStats(game).crewDiscount;
  return Math.max(150, Math.round(Number(game.crew || 0) * 55 * (1 - discount)));
}

function getGearLevel(game, gearId) {
  if (!game?.gear?.[gearId]) return 0;
  return clamp(Number(game?.gearUpgrades?.[gearId] || 1), 1, 5);
}

function getGearAttackValue(item, game) {
  const level = getGearLevel(game, item.id);
  if (level <= 0) return 0;
  return Math.round(Number(item.attack || 0) * (1 + (level - 1) * 0.45));
}

function getGearDefenseValue(item, game) {
  const level = getGearLevel(game, item.id);
  if (level <= 0) return 0;
  return Math.round(Number(item.defense || 0) * (1 + (level - 1) * 0.45));
}

function getOwnedGearStats(game) {
  const owned = gear.filter((item) => Boolean(game?.gear?.[item.id]));
  const totalLevels = owned.reduce((sum, item) => sum + getGearLevel(game, item.id), 0);

  return {
    owned,
    ownedCount: owned.length,
    attack: owned.reduce((sum, item) => sum + getGearAttackValue(item, game), 0),
    defense: owned.reduce((sum, item) => sum + getGearDefenseValue(item, game), 0),
    upgradedCount: owned.filter((item) => getGearLevel(game, item.id) > 1).length,
    averageLevel: owned.length ? Number((totalLevels / owned.length).toFixed(1)) : 0,
  };
}

function getGearUpgradeCost(item, level) {
  return {
    cash: Math.round(Number(item.cost || 0) * 0.55 * Math.max(1, level)),
    tribute: 20 + Math.max(1, level) * 15,
    energy: 4 + Math.max(1, level) * 2,
  };
}

function ensureBlackMarketState(game) {
  const today = getTodayKey();
  if (game?.blackMarketDate === today) {
    return {
      ...game,
      blackMarketDeals: { ...(game.blackMarketDeals || {}) },
    };
  }

  return {
    ...game,
    blackMarketDate: today,
    blackMarketDeals: {},
  };
}

function isMarketDealBought(game, dealId) {
  const marketGame = ensureBlackMarketState(game);
  return Boolean(marketGame.blackMarketDeals?.[dealId]);
}

function getMarketDealCost(deal) {
  const parts = [];
  if (deal.costCash) parts.push(money(deal.costCash));
  if (deal.costTribute) parts.push(`${deal.costTribute} Tribute`);
  if (deal.costEnergy) parts.push(`${deal.costEnergy} Energy`);
  return parts.length ? parts.join(" / ") : "Free";
}

function getMarketDealReward(deal) {
  const parts = [];
  if (deal.gearId) parts.push(`Gear: ${gear.find((item) => item.id === deal.gearId)?.name || "Asset"}`);
  if (deal.heatReduction) parts.push(`-${deal.heatReduction} Heat`);
  if (deal.pressureReduction) parts.push(`-${deal.pressureReduction} Rival Pressure`);
  if (deal.energyReward) parts.push(`+${deal.energyReward} Energy`);
  if (deal.defenseBonus) parts.push(`+${deal.defenseBonus} Crew Defense`);
  if (deal.attackBonus) parts.push(`+${deal.attackBonus} Crew Attack`);
  if (deal.crew) parts.push(`+${deal.crew} Crew`);
  if (deal.loyalty) parts.push(`+${deal.loyalty} Loyalty`);
  if (deal.respect) parts.push(`+${deal.respect} Respect`);
  if (deal.rep) parts.push(`+${deal.rep} Market Rep`);
  return parts.join(" • ");
}



function getSafehouseRoomLevel(game, roomId) {
  const room = safehouseRooms.find((item) => item.id === roomId);
  const max = room?.max || 5;
  return clamp(Number(game?.safehouse?.[roomId] || 0), 0, max);
}

function getSafehouseStats(game) {
  const office = getSafehouseRoomLevel(game, "office");
  const garage = getSafehouseRoomLevel(game, "garage");
  const armory = getSafehouseRoomLevel(game, "armory");
  const lounge = getSafehouseRoomLevel(game, "lounge");

  return {
    office,
    garage,
    armory,
    lounge,
    totalLevels: office + garage + armory + lounge,
    incomeMultiplier: 1 + office * 0.03,
    tributeMultiplier: 1 + office * 0.02,
    maxEnergyBonus: garage * 10,
    maxStaminaBonus: garage,
    attackBonus: armory * 3,
    defenseBonus: armory * 3,
    maxHealthBonus: armory * 5,
    loyaltyBonus: lounge * 3,
    heatReduction: Math.floor(lounge / 2),
  };
}

function getSafehouseUpgradeCost(room, level) {
  const nextLevel = Math.max(1, Number(level || 0) + 1);
  return {
    cash: Math.round(Number(room.baseCost || 1000) * nextLevel * (1 + Number(level || 0) * 0.35)),
    tribute: Math.round(Number(room.baseTribute || 20) * nextLevel),
    energy: Number(room.baseEnergy || 4) + Number(level || 0) * 2,
  };
}

function getSafehouseUpgradeLabel(room, level) {
  if (level >= (room.max || 5)) return "Maxed";
  const cost = getSafehouseUpgradeCost(room, level);
  return `${money(cost.cash)} / ${cost.tribute} Tribute / ${cost.energy} Energy`;
}


function getContactLevel(game, contactId) {
  const contact = underworldContacts.find((item) => item.id === contactId);
  return clamp(Number(game?.contacts?.[contactId] || 0), 0, contact?.max || 5);
}

function getContactStats(game) {
  return underworldContacts.reduce((stats, contact) => {
    const level = getContactLevel(game, contact.id);
    stats.totalLevels += level;
    if (level > 0) stats.unlockedCount += 1;
    stats.jobIncomeMultiplier += level * Number(contact.jobBonus || 0);
    stats.frontIncomeMultiplier += level * Number(contact.frontBonus || 0);
    stats.tributeMultiplier += level * Number(contact.tributeBonus || 0);
    stats.launderBonus += level * Number(contact.launderBonus || 0);
    stats.clinicDiscount += level * Number(contact.clinicDiscount || 0);
    stats.heatReduction += contact.heatReductionEvery ? Math.floor(level / contact.heatReductionEvery) : 0;
    stats.rivalPressureReduction += contact.rivalPressureReductionEvery ? Math.floor(level / contact.rivalPressureReductionEvery) : 0;
    return stats;
  }, {
    totalLevels: 0,
    unlockedCount: 0,
    jobIncomeMultiplier: 1,
    frontIncomeMultiplier: 1,
    tributeMultiplier: 1,
    launderBonus: 0,
    clinicDiscount: 0,
    heatReduction: 0,
    rivalPressureReduction: 0,
  });
}

function getContactUpgradeCost(contact, level) {
  const nextLevel = Math.max(1, Number(level || 0) + 1);
  return {
    cash: Math.round(Number(contact.baseCost || 900) * nextLevel * (1 + Number(level || 0) * 0.28)),
    respect: Math.round(Number(contact.baseRespect || 4) * nextLevel),
    tribute: Math.round(Number(contact.baseTribute || 10) * nextLevel),
    energy: 3 + Number(level || 0),
  };
}

function getContactUpgradeLabel(contact, level) {
  if (level >= (contact.max || 5)) return "Maxed";
  const cost = getContactUpgradeCost(contact, level);
  return `${money(cost.cash)} / ${cost.respect} Respect / ${cost.tribute} Tribute / ${cost.energy} Energy`;
}

function getContactFavorStatus(game, contactId) {
  const last = Number(game?.contactFavors?.[contactId] || 0);
  const cooldown = 20 * 60 * 1000;
  const remaining = Math.max(0, cooldown - (Date.now() - last));

  return {
    ready: remaining <= 0,
    remaining,
    label: remaining <= 0 ? "Ready" : `${Math.ceil(remaining / 60000)} min`,
  };
}

function getContactFavorCost(favor) {
  const parts = [];
  if (favor.costCash) parts.push(money(favor.costCash));
  if (favor.costTribute) parts.push(`${favor.costTribute} Tribute`);
  if (favor.costEnergy) parts.push(`${favor.costEnergy} Energy`);
  return parts.length ? parts.join(" / ") : "Free";
}

function getContactFavorReward(favor) {
  const parts = [];
  if (favor.cash) parts.push(money(favor.cash));
  if (favor.vaultCash) parts.push(`${money(favor.vaultCash)} protected`);
  if (favor.tribute) parts.push(`+${favor.tribute} Tribute`);
  if (favor.respect) parts.push(`+${favor.respect} Respect`);
  if (favor.energyReward) parts.push(`+${favor.energyReward} Energy`);
  if (favor.health) parts.push(`+${favor.health} Health`);
  if (favor.loyalty) parts.push(`+${favor.loyalty} Loyalty`);
  if (favor.control) parts.push(`+${favor.control}% ${getDistrictName(favor.controlDistrict)} control`);
  if (favor.heatReduction) parts.push(`-${favor.heatReduction} Heat`);
  if (favor.pressureReduction) parts.push(`-${favor.pressureReduction} Rival Pressure`);
  return parts.length ? parts.join(" • ") : "Street favor";
}


function getLieutenantLevel(game, lieutenantId) {
  const lieutenant = lieutenants.find((item) => item.id === lieutenantId);
  return clamp(Number(game?.lieutenants?.[lieutenantId] || 0), 0, lieutenant?.max || 5);
}

function getLieutenantAssignment(game, lieutenantId) {
  return game?.lieutenantAssignments?.[lieutenantId] || "idle";
}

function getLieutenantAssignmentName(assignmentId) {
  return lieutenantAssignments.find((item) => item.id === assignmentId)?.name || "Idle";
}

function getLieutenantStats(game) {
  return lieutenants.reduce((stats, lieutenant) => {
    const level = getLieutenantLevel(game, lieutenant.id);
    const assignment = getLieutenantAssignment(game, lieutenant.id);
    stats.totalLevels += level;
    if (level > 0) stats.unlockedCount += 1;
    if (level > 0 && assignment !== "idle") stats.assignedCount += 1;

    if (level <= 0 || assignment === "idle") return stats;

    if (assignment === "jobs") {
      stats.jobIncomeMultiplier += level * Number(lieutenant.jobBonus || 0);
      stats.jobControlBonus += lieutenant.jobControlEvery ? Math.floor(level / lieutenant.jobControlEvery) : 0;
      stats.jobXpBonus += level * Number(lieutenant.jobXp || 0);
    }

    if (assignment === "muscle") {
      stats.attackBonus += level * Number(lieutenant.attack || 0);
      stats.defenseBonus += level * Number(lieutenant.defense || 0);
    }

    if (assignment === "turf") {
      stats.turfGainBonus += level * Number(lieutenant.turfGain || 0);
      stats.tributeMultiplier += level * Number(lieutenant.tributeBonus || 0);
    }

    if (assignment === "fronts") {
      stats.frontIncomeMultiplier += level * Number(lieutenant.frontBonus || 0);
      stats.launderBonus += level * Number(lieutenant.launderBonus || 0);
    }

    if (assignment === "heat") {
      stats.heatReduction += lieutenant.heatReductionEvery ? Math.floor(level / lieutenant.heatReductionEvery) : 0;
      stats.rivalPressureReduction += lieutenant.rivalPressureReductionEvery ? Math.floor(level / lieutenant.rivalPressureReductionEvery) : 0;
    }

    return stats;
  }, {
    totalLevels: 0,
    unlockedCount: 0,
    assignedCount: 0,
    jobIncomeMultiplier: 1,
    jobControlBonus: 0,
    jobXpBonus: 0,
    attackBonus: 0,
    defenseBonus: 0,
    turfGainBonus: 0,
    tributeMultiplier: 1,
    frontIncomeMultiplier: 1,
    launderBonus: 0,
    heatReduction: 0,
    rivalPressureReduction: 0,
  });
}

function getLieutenantUpgradeCost(lieutenant, level) {
  const nextLevel = Math.max(1, Number(level || 0) + 1);
  return {
    cash: Math.round(Number(lieutenant.baseCost || 1200) * nextLevel * (1 + Number(level || 0) * 0.3)),
    respect: Math.round(Number(lieutenant.baseRespect || 4) * nextLevel),
    tribute: Math.round(Number(lieutenant.baseTribute || 12) * nextLevel),
    energy: 3 + Number(level || 0),
  };
}

function getLieutenantUpgradeLabel(lieutenant, level) {
  if (level >= (lieutenant.max || 5)) return "Maxed";
  const cost = getLieutenantUpgradeCost(lieutenant, level);
  return `${money(cost.cash)} / ${cost.respect} Respect / ${cost.tribute} Tribute / ${cost.energy} Energy`;
}

function getLieutenantEffectLabel(lieutenant, level, assignment) {
  if (level <= 0) return "Unlock this lieutenant first.";
  if (assignment === "idle") return "Idle. No active bonus until assigned.";
  if (assignment === "jobs") return `Jobs: +${Math.round((level * Number(lieutenant.jobBonus || 0)) * 100)}% job cash, +${lieutenant.jobControlEvery ? Math.floor(level / lieutenant.jobControlEvery) : 0} control, +${level * Number(lieutenant.jobXp || 0)} XP.`;
  if (assignment === "muscle") return `Muscle: +${level * Number(lieutenant.attack || 0)} Attack, +${level * Number(lieutenant.defense || 0)} Defense.`;
  if (assignment === "turf") return `Turf: +${level * Number(lieutenant.turfGain || 0)} expansion control and +${Math.round((level * Number(lieutenant.tributeBonus || 0)) * 100)}% tribute.`;
  if (assignment === "fronts") return `Fronts: +${Math.round((level * Number(lieutenant.frontBonus || 0)) * 100)}% front income and +${Math.round((level * Number(lieutenant.launderBonus || 0)) * 100)}% launder rate.`;
  if (assignment === "heat") return `Heat: -${lieutenant.heatReductionEvery ? Math.floor(level / lieutenant.heatReductionEvery) : 0} Heat gain and -${lieutenant.rivalPressureReductionEvery ? Math.floor(level / lieutenant.rivalPressureReductionEvery) : 0} rival pressure.`;
  return "Assigned.";
}

function getVaultLevel(game) {
  return clamp(Number(game?.vaultLevel || 0), 0, 5);
}

function getVaultStats(game) {
  const level = getVaultLevel(game);
  const office = getSafehouseRoomLevel(game, "office");
  const current = Math.max(0, Number(game?.vault || 0));
  const capacity = Math.round(2500 + level * 6500 + office * 1200);
  const protectedCash = Math.min(current, capacity);
  const overflow = Math.max(0, current - capacity);
  const contactLaunderBonus = getContactStats(game).launderBonus;
  const lieutenantLaunderBonus = getLieutenantStats(game).launderBonus;
  const launderRate = Math.min(0.94, 0.78 + level * 0.025 + office * 0.01 + contactLaunderBonus + lieutenantLaunderBonus);
  const rivalLossMultiplier = current > 0 ? Math.max(0.46, 0.78 - level * 0.055 - office * 0.015) : 1;

  return {
    level,
    maxLevel: 5,
    current,
    capacity,
    protectedCash,
    overflow,
    capacityUsedPct: capacity ? Math.min(100, Math.round((protectedCash / capacity) * 100)) : 0,
    launderRate,
    launderRatePct: Math.round(launderRate * 100),
    rivalLossMultiplier,
    rivalProtectionPct: Math.round((1 - rivalLossMultiplier) * 100),
    heatReduction: Math.floor(level / 3),
    launderedCash: Number(game?.launderedCash || 0),
    operations: Number(game?.vaultOperations || 0),
  };
}

function getVaultUpgradeCost(level) {
  const nextLevel = Math.max(1, Number(level || 0) + 1);
  return {
    cash: Math.round(1500 * nextLevel * (1 + Number(level || 0) * 0.42)),
    tribute: 25 + nextLevel * 20,
    energy: 5 + Number(level || 0) * 2,
  };
}

function getVaultUpgradeLabel(level) {
  if (Number(level || 0) >= 5) return "Maxed";
  const cost = getVaultUpgradeCost(level);
  return `${money(cost.cash)} / ${cost.tribute} Tribute / ${cost.energy} Energy`;
}

function getVaultLaunderAmount(game) {
  const stats = getVaultStats(game);
  return Math.min(stats.current, Math.max(250, Math.round(stats.capacity * 0.18)));
}

function getVaultBurnTrailCost(game) {
  const level = getVaultLevel(game);
  return {
    vaultCash: 450 + level * 175,
    tribute: 10 + level * 5,
    energy: 4,
  };
}

function formatEventTime(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function normalizeGame(game) {
  const merged = {
    ...startGame,
    ...(game || {}),
    territory: { ...startGame.territory, ...((game || {}).territory || {}) },
    properties: { ...startGame.properties, ...((game || {}).properties || {}) },
    propertyUpgrades: { ...startGame.propertyUpgrades, ...((game || {}).propertyUpgrades || {}) },
    supplyRoutes: { ...startGame.supplyRoutes, ...((game || {}).supplyRoutes || {}) },
    gear: { ...startGame.gear, ...((game || {}).gear || {}) },
    gearUpgrades: { ...startGame.gearUpgrades, ...((game || {}).gearUpgrades || {}) },
    safehouse: { ...startGame.safehouse, ...((game || {}).safehouse || {}) },
    contacts: { ...startGame.contacts, ...((game || {}).contacts || {}) },
    contactFavors: { ...startGame.contactFavors, ...((game || {}).contactFavors || {}) },
    lieutenants: { ...startGame.lieutenants, ...((game || {}).lieutenants || {}) },
    lieutenantAssignments: { ...startGame.lieutenantAssignments, ...((game || {}).lieutenantAssignments || {}) },
    blackMarketDeals: { ...startGame.blackMarketDeals, ...((game || {}).blackMarketDeals || {}) },
    beaten: { ...startGame.beaten, ...((game || {}).beaten || {}) },
    rivalPressure: { ...startGame.rivalPressure, ...((game || {}).rivalPressure || {}) },
    districtCollections: { ...startGame.districtCollections, ...((game || {}).districtCollections || {}) },
    dailyStats: { ...startGame.dailyStats, ...((game || {}).dailyStats || {}) },
    chapterRewards: { ...startGame.chapterRewards, ...((game || {}).chapterRewards || {}) },
    liveEventRewards: { ...startGame.liveEventRewards, ...((game || {}).liveEventRewards || {}) },
  };

  if (!merged.liveEventStartedAt) {
    merged.liveEventStartedAt = Date.now();
  }

  return merged;
}

function getLiveEventPhase(game, now = Date.now()) {
  const startedAt = Number(game?.liveEventStartedAt || now);
  const elapsedHours = (now - startedAt) / (1000 * 60 * 60);
  const phase = liveEvent.phases.find((item) => elapsedHours >= item.startsAtHour && elapsedHours < item.endsAtHour) || liveEvent.phases[liveEvent.phases.length - 1];
  const eventEndsAt = startedAt + liveEvent.durationHours * 60 * 60 * 1000;
  const phaseEndsAt = startedAt + phase.endsAtHour * 60 * 60 * 1000;

  return {
    ...phase,
    eventEndsAt,
    phaseEndsAt,
    eventIsActive: now < eventEndsAt,
    hoursRemaining: Math.max(0, (eventEndsAt - now) / (1000 * 60 * 60)),
  };
}

function getLiveEventBonus(game) {
  return game?.liveEventDeputized ? 1.05 : 1;
}

function getLiveEventJobInfluence(job, payout, controlGain, game) {
  const phase = getLiveEventPhase(game);
  if (!phase.eventIsActive) return 0;
  if (phase.propertyOnly) return 0;
  if (job.district !== liveEvent.districtId) return 0;

  const baseInfluence = Math.max(1, Math.round((job.energy || 1) * 10 + controlGain * 20 + payout / 100));
  return Math.round(baseInfluence * phase.jobMultiplier * getLiveEventBonus(game));
}

function getLiveEventTributeInfluence(district, payout, game) {
  const phase = getLiveEventPhase(game);
  if (!phase.eventIsActive) return 0;
  if (district.id !== liveEvent.districtId) return 0;
  return Math.max(1, Math.round((payout || 0) / 45 * getLiveEventBonus(game)));
}

function getDistrictFrontIncome(game, districtId, bossIncome = 1, supplyIncomeMultiplier = 1, skillIncomeMultiplier = 1) {
  const frontIncome = properties.reduce((sum, property) => {
    if (property.district !== districtId) return sum;
    return sum + getPropertyIncomeValue(property, game, bossIncome);
  }, 0);

  return Math.round(frontIncome * supplyIncomeMultiplier * skillIncomeMultiplier);
}

function getLiveEventPropertyInfluence(game, southsideEarned) {
  const phase = getLiveEventPhase(game);
  if (!phase.eventIsActive || !phase.propertyOnly || southsideEarned <= 0) return 0;
  return Math.max(1, Math.round((southsideEarned || 0) / 12 * getLiveEventBonus(game)));
}

function addLiveEventInfluence(game, amount) {
  const influence = Math.max(0, Math.round(amount || 0));
  if (influence <= 0) return game;

  return {
    ...game,
    liveEventInfluence: Number(game.liveEventInfluence || 0) + influence,
    liveEventMoves: Number(game.liveEventMoves || 0) + 1,
  };
}

function getLiveEventLeaderboard(game) {
  const playerName = game?.bossName || "Rookie";
  const playerRow = {
    bossName: playerName,
    influence: Number(game?.liveEventInfluence || 0),
    isPlayer: true,
  };

  return [...liveEvent.demoLeaderboard, playerRow]
    .sort((a, b) => b.influence - a.influence)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      projectedTribute: Math.max(0, Math.round(liveEvent.prizePoolTribute / (index + 3))),
    }));
}

function xpNeeded(level) {
  return 100 + (level - 1) * 75;
}

function loadGame() {
  const session = loadAuthSession();
  return loadGameForUser(session?.username);
}

function addLog(game, message) {
  return {
    ...game,
    log: [message, ...(game.log || [])].slice(0, 12),
  };
}

function addXp(game, amount) {
  let next = { ...game, xp: game.xp + amount };

  while (next.xp >= xpNeeded(next.level)) {
    next.xp -= xpNeeded(next.level);
    next.level += 1;
    next.skillPoints += 6;
    next.maxHealth += 10;
    next.health = next.maxHealth;
    next.energy = Math.max(next.energy, next.maxEnergy);
    next.stamina = Math.max(next.stamina, next.maxStamina);
    next.crew += 5;

    next = addLog(
      next,
      `Level up. You reached Level ${next.level}, gained 6 skill points, and your crew grew by 5.`
    );
  }

  return next;
}

export default function App() {
  const [users, setUsers] = useState(loadAuthUsers);
  const [session, setSession] = useState(loadAuthSession);
  const [game, setGame] = useState(loadGame);
  const [tab, setTab] = useState("command");
  const [bossName, setBossName] = useState(game.bossName || "Rookie");
  const [classId, setClassId] = useState(game.classId || "boss");
  const [startingDistrictId, setStartingDistrictId] = useState(game.startingDistrictId || "docks");
  const [setupProfileImage, setSetupProfileImage] = useState("");
  const [setupError, setSetupError] = useState("");
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPromptMode, setInstallPromptMode] = useState("native");
  const [installPromptDismissed, setInstallPromptDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "1" || window.localStorage.getItem(INSTALL_PROMPT_ACCEPTED_KEY) === "1";
  });

  const currentUser = session?.username ? users[session.username] : null;
  const selectedClass = bossClasses.find((item) => item.id === classId) || bossClasses[0];
  const selectedDistrict = startingDistrictOptions.find((item) => item.id === startingDistrictId) || startingDistrictOptions[0];
  const cleanSetupName = bossName.trim().replace(/\s+/g, " ").slice(0, 22);
  const nameIsReady = cleanSetupName.length >= 3 && cleanSetupName.toLowerCase() !== "rookie";
  const setupPreviewImage = setupProfileImage || selectedClass.image;
  const setupReady = nameIsReady && Boolean(selectedClass) && Boolean(selectedDistrict) && Boolean(setupPreviewImage);

  const bossClass = bossClasses.find((item) => item.id === game.classId) || bossClasses[0];

  const gearStats = useMemo(() => getOwnedGearStats(game), [game.gear, game.gearUpgrades]);
  const ownedGear = gearStats.owned;
  const gearAttack = gearStats.attack;
  const gearDefense = gearStats.defense;

  const supplyStats = useMemo(() => getSupplyRouteStats(game), [game.supplyRoutes]);
  const topRivalThreat = useMemo(() => getTopRivalPressure(game), [game.rivalPressure]);
  const totalRivalPressure = useMemo(
    () => rivals.reduce((sum, rival) => sum + getRivalPressure(game, rival.id), 0),
    [game.rivalPressure]
  );

  const skillStats = useMemo(() => getBossSkillStats(game), [game]);
  const safehouseStats = useMemo(() => getSafehouseStats(game), [game.safehouse]);
  const contactStats = useMemo(() => getContactStats(game), [game.contacts]);
  const lieutenantStats = useMemo(() => getLieutenantStats(game), [game.lieutenants, game.lieutenantAssignments]);
  const vaultStats = useMemo(() => getVaultStats(game), [game.vault, game.vaultLevel, game.launderedCash, game.vaultOperations, game.safehouse, game.contacts, game.lieutenants, game.lieutenantAssignments]);

  const income = useMemo(() => {
    const frontIncome = properties.reduce((sum, item) => {
      return sum + getPropertyIncomeValue(item, game, bossClass.income);
    }, 0);

    return Math.round(frontIncome * supplyStats.incomeMultiplier * skillStats.frontIncomeMultiplier * safehouseStats.incomeMultiplier * contactStats.frontIncomeMultiplier * lieutenantStats.frontIncomeMultiplier);
  }, [game.properties, game.propertyUpgrades, game.territory, bossClass, supplyStats.incomeMultiplier, skillStats.frontIncomeMultiplier, safehouseStats.incomeMultiplier, contactStats.frontIncomeMultiplier, lieutenantStats.frontIncomeMultiplier]);

  const cityControl = useMemo(() => {
    const total = districts.reduce((sum, d) => sum + (game.territory[d.id] || 0), 0);
    return Math.round(total / districts.length);
  }, [game.territory]);

  const controlledDistricts = useMemo(() => {
    return districts.filter((district) => (game.territory?.[district.id] || 0) >= 100).length;
  }, [game.territory]);

  const strongholdDistricts = useMemo(() => {
    return districts.filter((district) => (game.territory?.[district.id] || 0) >= 75).length;
  }, [game.territory]);

  const nextTurfTarget = useMemo(() => {
    return [...districts]
      .filter((district) => (game.territory?.[district.id] || 0) < 100 && game.level >= district.level)
      .sort((a, b) => (game.territory?.[b.id] || 0) - (game.territory?.[a.id] || 0))[0] || districts[0];
  }, [game.territory, game.level]);

  const heat = clamp(Number(game.heat || 0), 0, 100);
  const heatTier = getHeatTier(heat);
  const payoutMultiplier = heatPayoutMultiplier(heat);
  const crewLoyalty = clamp(Number(game.crewLoyalty ?? 75), 0, 100);
  const crewStanding = getCrewStanding(crewLoyalty);
  const crewPowerMultiplier = crewEffectiveness(crewLoyalty);
  const crewAttackBonus = Number(game.crewAttackBonus || 0);
  const crewDefenseBonus = Number(game.crewDefenseBonus || 0);
  const recruitCrewCost = getRecruitCost(game);
  const trainingCrewCost = getTrainingCost(game);
  const payrollCrewCost = getPayrollCost(game);
  const eventDeputyLocked = Boolean(game.liveEventDeputized);
  const effectiveCrewForPower = Math.max(0, Number(game.crew || 0) - (eventDeputyLocked ? 1 : 0));
  const attack = Math.round((10 + effectiveCrewForPower * 2 * crewPowerMultiplier + gearAttack + skillStats.attackBonus + safehouseStats.attackBonus + lieutenantStats.attackBonus + crewAttackBonus) * bossClass.attack);
  const defense = Math.round((10 + effectiveCrewForPower * 2 * crewPowerMultiplier + gearDefense + skillStats.defenseBonus + safehouseStats.defenseBonus + lieutenantStats.defenseBonus + crewDefenseBonus) * bossClass.defense);
  const startingDistrictControl = game.territory?.[game.startingDistrictId || "docks"] || 0;
  const ownedPropertyCount = Object.values(game.properties || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const upgradedFrontCount = Object.values(game.propertyUpgrades || {}).filter((level) => Number(level || 0) > 1).length;
  const firstMoves = [
    { id: "first_job", label: "Run your first job", done: game.jobsRun >= 1, action: "Jobs" },
    { id: "first_fight", label: "Win your first fight", done: game.wins >= 1, action: "Rivals" },
    { id: "first_control", label: `Reach 25% control in ${districtName(game.startingDistrictId || "docks")}`, done: startingDistrictControl >= 25, action: "Territory" },
    { id: "first_property", label: "Buy your first property", done: ownedPropertyCount >= 1, action: "Properties" },
  ];
  const firstMovesComplete = firstMoves.every((item) => item.done);
  const firstMovesRewardClaimed = Boolean(game.chapterRewards?.firstMoves);
  const campaignChapters = useMemo(() => getCampaignChapters(game), [game]);
  const nextCampaignChapter = campaignChapters.find((chapter) => !chapter.claimed) || campaignChapters[campaignChapters.length - 1];
  const campaignClaimedCount = campaignChapters.filter((chapter) => chapter.claimed).length;
  const dailyOrders = useMemo(() => getDailyOrders(game), [game.dailyOrdersDate, game.dailyStats, game.dailyRewardClaimedDate]);
  const dailyComplete = dailyOrders.every((order) => order.done);
  const dailyClaimed = isDailyRewardClaimed(game);
  const dailyReward = getDailyReward(game);
  const activeStreetOpportunity = getActiveStreetOpportunity(game);
  const cityWireLeadLabel = getStreetOpportunityLabel(game);
  const cityWireExpired = Boolean(game.cityEventId) && !activeStreetOpportunity;
  const liveEventPhase = getLiveEventPhase(game);
  const liveEventLeaderboard = useMemo(() => getLiveEventLeaderboard(game), [game.liveEventInfluence, game.bossName]);
  const liveEventRank = liveEventLeaderboard.find((row) => row.isPlayer)?.rank || liveEventLeaderboard.length;
  const liveEventMilestoneReady = Number(game.liveEventInfluence || 0) >= liveEvent.milestoneInfluence;
  const liveEventMilestoneClaimed = Boolean(game.liveEventRewards?.concretePourMilestone);

  useEffect(() => {
    if (!session?.username) return;
    localStorage.setItem(getUserSaveKey(session.username), JSON.stringify(game));
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game, session]);

  useEffect(() => {
    if (!game.started) return;
    setGame((old) => ensureDailyState(old));
  }, [game.started]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGame((old) => {
        if (!old.started) return old;

        const earned = Math.floor(income / 6);
        const southsideEarned = Math.floor(getDistrictFrontIncome(old, liveEvent.districtId, bossClass.income, supplyStats.incomeMultiplier, skillStats.frontIncomeMultiplier) / 6);
        const eventInfluence = getLiveEventPropertyInfluence(old, southsideEarned);
        let next = {
          ...old,
          cash: old.cash + earned,
          health: Math.min(old.maxHealth, old.health + 3),
          heat: old.heat > 0 ? Math.max(0, old.heat - 1 - getSafehouseStats(old).heatReduction) : old.heat,
          energy: old.energy < old.maxEnergy ? Math.min(old.maxEnergy, old.energy + 1) : old.energy,
          stamina: old.stamina < old.maxStamina ? Math.min(old.maxStamina, old.stamina + 1) : old.stamina,
        };

        if (eventInfluence > 0) {
          next = addLiveEventInfluence(next, eventInfluence);
        }

        if (earned > 0) {
          const eventLine = eventInfluence > 0 ? ` Concrete Pour +${eventInfluence} Influence.` : "";
          next = addLog(next, `Properties generated ${money(earned)}.${eventLine}`);
        }

        return next;
      });
    }, 10000);

    return () => clearInterval(timer);
  }, [income]);

  function refreshUsers(nextUsers) {
    saveAuthUsers(nextUsers);
    setUsers(nextUsers);
  }

  function syncSetupState(nextGame) {
    setBossName(nextGame.bossName || "Rookie");
    setClassId(nextGame.classId || "boss");
    setStartingDistrictId(nextGame.startingDistrictId || "docks");
    setSetupProfileImage("");
    setSetupError("");
  }

  function signIn(username, password) {
    const cleanUsername = normalizeUsername(username);
    const user = users[cleanUsername];

    if (!user || !passwordMatches(user, password)) {
      return "That username or password is not right.";
    }

    const nextUsers = {
      ...users,
      [cleanUsername]: {
        ...user,
        lastLoginAt: Date.now(),
      },
    };

    refreshUsers(nextUsers);
    const nextSession = { username: cleanUsername, signedInAt: Date.now() };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);

    const loadedGame = loadGameForUser(cleanUsername);
    setGame(loadedGame);
    syncSetupState(loadedGame);
    setTab(user.mustResetPassword ? "account" : "command");
    return user.mustResetPassword ? "Temporary password accepted. Please change your password on the Account screen." : "";
  }

  function createPlayerAccount({ username, displayName, password, confirmPassword, pin }) {
    const cleanUsername = normalizeUsername(username);

    if (cleanUsername.length < 3) return "Username needs at least 3 letters or numbers.";
    if (users[cleanUsername]) return "That username already exists.";
    if (String(password || "").length < 4) return "Password needs at least 4 characters for this prototype.";
    if (password !== confirmPassword) return "The two passwords do not match.";
    if (String(pin || "").trim().length < 4) return "Use at least a 4-digit recovery PIN.";

    const nextUsers = {
      ...users,
      [cleanUsername]: createAuthUser({
        username: cleanUsername,
        displayName: displayName || cleanUsername,
        password,
        pin,
        role: "player",
      }),
    };

    refreshUsers(nextUsers);

    const nextSession = { username: cleanUsername, signedInAt: Date.now() };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);

    const freshGame = normalizeGame(startGame);
    setGame(freshGame);
    syncSetupState(freshGame);
    setTab("command");
    return "";
  }

  function resetOwnPassword({ username, pin, newPassword, confirmPassword }) {
    const cleanUsername = normalizeUsername(username);
    const user = users[cleanUsername];

    if (!user) return "I could not find that account.";
    if (!pinMatches(user, pin)) return "That recovery PIN is not right.";
    if (String(newPassword || "").length < 4) return "New password needs at least 4 characters.";
    if (newPassword !== confirmPassword) return "The two new passwords do not match.";

    refreshUsers({
      ...users,
      [cleanUsername]: updateUserPassword(user, newPassword),
    });

    return "Password reset. You can sign in now.";
  }

  function signOut() {
    if (session?.username) {
      localStorage.setItem(getUserSaveKey(session.username), JSON.stringify(game));
    }
    localStorage.removeItem(AUTH_SESSION_KEY);
    setSession(null);
    setTab("command");
  }

  function updateCurrentDisplayName(displayName) {
    if (!currentUser) return "Sign in first.";
    const cleanDisplayName = String(displayName || "").trim().slice(0, 28);
    if (cleanDisplayName.length < 2) return "Display name needs at least 2 characters.";

    refreshUsers({
      ...users,
      [currentUser.username]: {
        ...currentUser,
        displayName: cleanDisplayName,
      },
    });

    return "Profile name updated.";
  }

  function changeCurrentPassword({ currentPassword, newPassword, confirmPassword }) {
    if (!currentUser) return "Sign in first.";
    if (!passwordMatches(currentUser, currentPassword)) return "Current password is not right.";
    if (String(newPassword || "").length < 4) return "New password needs at least 4 characters.";
    if (newPassword !== confirmPassword) return "The two new passwords do not match.";

    refreshUsers({
      ...users,
      [currentUser.username]: updateUserPassword(currentUser, newPassword, { mustResetPassword: false }),
    });

    return "Password updated.";
  }

  function adminResetPlayerPassword({ username, newPassword }) {
    if (currentUser?.role !== "admin") return "Only the admin can reset player passwords here.";
    const cleanUsername = normalizeUsername(username);
    const target = users[cleanUsername];

    if (!target) return "That player account was not found.";
    if (String(newPassword || "").length < 4) return "Temporary password needs at least 4 characters.";

    refreshUsers({
      ...users,
      [cleanUsername]: updateUserPassword(target, newPassword, { mustResetPassword: true }),
    });

    return `Password reset for ${cleanUsername}. They will be sent to Account to change it after signing in.`;
  }

  function adminCreatePlayerAccount({ username, displayName, password, pin }) {
    if (currentUser?.role !== "admin") return "Only the admin can create player accounts here.";

    const cleanUsername = normalizeUsername(username);
    if (cleanUsername.length < 3) return "Username needs at least 3 letters or numbers.";
    if (users[cleanUsername]) return "That username already exists.";
    if (String(password || "").length < 4) return "Temporary password needs at least 4 characters.";
    if (String(pin || "").trim().length < 4) return "Recovery PIN needs at least 4 digits.";

    refreshUsers({
      ...users,
      [cleanUsername]: {
        ...createAuthUser({
          username: cleanUsername,
          displayName: displayName || cleanUsername,
          password,
          pin,
          role: "player",
        }),
        mustResetPassword: true,
      },
    });

    return `Player account created for ${cleanUsername}. Give them the temporary password and have them change it after signing in.`;
  }

  function readImageFile(file, callback) {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setSetupError("Use a picture file or GIF image file.");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setSetupError("Keep the picture or GIF under 2.5 MB for local save storage.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => callback(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function uploadSetupProfileImage(file) {
    readImageFile(file, (image) => {
      setSetupProfileImage(image);
      setSetupError("");
    });
  }

  function updateGameProfileImage(image) {
    const cleanImage = String(image || "").trim();
    if (!cleanImage) return "No image was selected.";

    setGame((old) => addLog({ ...old, profileImage: cleanImage }, "Boss profile picture updated."));
    return "Boss profile picture updated.";
  }

  function uploadGameProfileImage(file) {
    let message = "";
    readImageFile(file, (image) => {
      message = updateGameProfileImage(image);
    });
    return message;
  }

  function startNewGame() {
    const cleanName = bossName.trim().replace(/\s+/g, " ").slice(0, 22);
    const chosen = bossClasses.find((item) => item.id === classId) || bossClasses[0];
    const district = startingDistrictOptions.find((item) => item.id === startingDistrictId) || startingDistrictOptions[0];

    if (cleanName.length < 3 || cleanName.toLowerCase() === "rookie") {
      setSetupError("Give your boss a real name before entering the city.");
      return;
    }

    const startingTerritory = {
      ...defaultTerritory,
      [district.id]: Math.max(defaultTerritory[district.id] || 0, 20),
    };

    setSetupError("");
    setGame({
      ...startGame,
      started: true,
      profileComplete: true,
      bossName: cleanName,
      classId: chosen.id,
      startingDistrictId: district.id,
      profileImage: setupPreviewImage,
      territory: startingTerritory,
      heat: 0,
      energy: 300,
      dailyOrdersDate: getTodayKey(),
      dailyStats: getEmptyDailyStats(),
      dailyRewardClaimedDate: "",
      dailyStreak: 0,
      lastDailyClaimDate: "",
      cityEventId: "",
      cityEventExpiresAt: 0,
      cityWireMoves: 0,
      cityWireResolved: 0,
      gearUpgrades: {},
      safehouse: {},
      safehouseMoves: 0,
      contacts: {},
      contactFavors: {},
      contactMoves: 0,
      lieutenants: {},
      lieutenantAssignments: {},
      lieutenantMoves: 0,
      marketRep: 0,
      blackMarketDate: getTodayKey(),
      blackMarketDeals: {},
      blackMarketPurchases: 0,
      liveEventStartedAt: Date.now(),
      liveEventInfluence: 0,
      liveEventMoves: 0,
      liveEventDeputized: false,
      liveEventRewards: { concretePourMilestone: false },
      crewLoyalty: 75,
      crewAttackBonus: 0,
      crewDefenseBonus: 0,
      respect: 0,
      log: [
        `Daily login bonus: +200 Energy.`,
        `Starting district selected: ${district.name}.`,
        `You started as ${chosen.name}.`,
        `Your boss name is ${cleanName}.`,
        "Welcome to Shadow Syndicate. Build your crew. Claim your city. Rule the underworld.",
      ],
    });

    setTab("command");
  }

  function runJob(job) {
    setGame((old) => {
      if (old.level < job.level) return addLog(old, `${job.name} unlocks at Level ${job.level}.`);
      if (old.energy < job.energy) return addLog(old, `Not enough energy to run ${job.name}.`);

      const currentHeat = clamp(Number(old.heat || 0), 0, 100);
      const heatGain = getAdjustedHeatGain(old, rand(2, 4) + job.level);
      const jobSkillStats = getBossSkillStats(old);
      const jobContactStats = getContactStats(old);
      const jobLieutenantStats = getLieutenantStats(old);
      const payout = Math.round(rand(job.cash[0], job.cash[1]) * bossClass.income * heatPayoutMultiplier(currentHeat) * jobSkillStats.jobIncomeMultiplier * jobContactStats.jobIncomeMultiplier * jobLieutenantStats.jobIncomeMultiplier);
      const controlGain = Math.max(1, Math.round(job.control * bossClass.control + jobLieutenantStats.jobControlBonus));
      const xpAward = job.xp + jobLieutenantStats.jobXpBonus;
      const crackdown = currentHeat >= 85 && rand(1, 100) <= 35;

      let next = {
        ...old,
        heat: clamp(currentHeat + heatGain, 0, 100),
        energy: old.energy - job.energy,
        cash: old.cash + payout,
        jobsRun: old.jobsRun + 1,
        respect: Number(old.respect || 0) + 1,
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) + 1, 0, 100),
        territory: {
          ...old.territory,
          [job.district]: clamp((old.territory[job.district] || 0) + controlGain, 0, 100),
        },
      };

      next = addDailyProgress(next, "jobs", 1);
      next = addDailyProgress(next, "turf", controlGain);
      next = addXp(next, xpAward);
      next = addDistrictRivalPressure(next, job.district, 3 + job.level, `running ${job.name}`);
      const eventInfluence = getLiveEventJobInfluence(job, payout, controlGain, old);
      if (eventInfluence > 0) {
        next = addLiveEventInfluence(next, eventInfluence);
      }
      next = maybeRivalRetaliation(next, job.district, currentHeat >= 85 ? 28 : currentHeat >= 60 ? 16 : 6);
      const eventLine = eventInfluence > 0 ? ` Concrete Pour +${eventInfluence} Influence.` : "";

      if (crackdown) {
        const fine = Math.min(next.cash, rand(175, 425));
        next = {
          ...next,
          cash: next.cash - fine,
          health: Math.max(0, next.health - rand(4, 12)),
        };

        return addLog(
          next,
          `${job.name}: earned ${money(payout)}, ${xpAward} XP, +${controlGain}% ${districtName(job.district)} control, and Heat +${heatGain}.${eventLine} Crackdown cost ${money(fine)}.`
        );
      }

      return addLog(
        next,
        `${job.name}: earned ${money(payout)}, ${xpAward} XP, +${controlGain}% ${districtName(job.district)} control, and Heat +${heatGain}.${eventLine}`
      );
    });
  }

  function expandDistrict(district) {
    setGame((old) => {
      if (old.level < district.level) return addLog(old, `${district.name} unlocks at Level ${district.level}.`);
      if (old.cash < district.cost) return addLog(old, `You need ${money(district.cost)} to expand into ${district.name}.`);
      if (old.energy < district.energy) return addLog(old, `Not enough energy to expand into ${district.name}.`);

      const lieutenantTurfStats = getLieutenantStats(old);
      const gain = Math.max(2, Math.round(rand(4, 8) * bossClass.control + lieutenantTurfStats.turfGainBonus));
      const heatGain = getAdjustedHeatGain(old, rand(3, 7));

      let next = {
        ...old,
        cash: old.cash - district.cost,
        energy: old.energy - district.energy,
        heat: clamp(Number(old.heat || 0) + heatGain, 0, 100),
        respect: Number(old.respect || 0) + 2,
        territory: {
          ...old.territory,
          [district.id]: clamp((old.territory[district.id] || 0) + gain, 0, 100),
        },
      };

      next = addDailyProgress(next, "turf", gain);
      next = addDistrictRivalPressure(next, district.id, 8, `expanding into ${district.name}`);
      next = maybeRivalRetaliation(next, district.id, heat >= 60 ? 18 : 8);

      return addLog(next, `${district.name} control increased by ${gain}%. Heat +${heatGain}.`);
    });
  }

  function buyProperty(property) {
    setGame((old) => {
      if (old.cash < property.cost) return addLog(old, `You need ${money(property.cost)} to buy ${property.name}.`);

      const heatGain = getAdjustedHeatGain(old, 1);

      let next = {
        ...old,
        cash: old.cash - property.cost,
        heat: clamp(Number(old.heat || 0) + heatGain, 0, 100),
        respect: Number(old.respect || 0) + 1,
        properties: {
          ...old.properties,
          [property.id]: (old.properties[property.id] || 0) + 1,
        },
        propertyUpgrades: {
          ...(old.propertyUpgrades || {}),
          [property.id]: Math.max(1, Number(old.propertyUpgrades?.[property.id] || 1)),
        },
      };

      next = addDailyProgress(next, "fronts", 1);
      next = addDistrictRivalPressure(next, property.district, 6, `buying ${property.name}`);
      next = maybeRivalRetaliation(next, property.district, heat >= 60 ? 16 : 6);

      return addLog(next, `Purchased ${property.name}. Heat +${heatGain}.`);
    });
  }

  function upgradeProperty(property) {
    setGame((old) => {
      const owned = Number(old.properties?.[property.id] || 0);
      if (owned <= 0) return addLog(old, `Buy ${property.name} before upgrading the front.`);

      const level = getPropertyLevel(old, property.id);
      if (level >= 5) return addLog(old, `${property.name} is already fully upgraded.`);

      const cost = getPropertyUpgradeCost(property, level);
      const energyCost = 6 + level * 2;
      if (old.cash < cost) return addLog(old, `You need ${money(cost)} to upgrade ${property.name}.`);
      if (old.energy < energyCost) return addLog(old, `You need ${energyCost} Energy to upgrade ${property.name}.`);

      const heatGain = getAdjustedHeatGain(old, 2);

      let next = {
        ...old,
        cash: old.cash - cost,
        energy: old.energy - energyCost,
        heat: clamp(Number(old.heat || 0) + heatGain, 0, 100),
        respect: Number(old.respect || 0) + 2,
        propertyUpgrades: {
          ...(old.propertyUpgrades || {}),
          [property.id]: level + 1,
        },
      };

      next = addDailyProgress(next, "fronts", 1);
      next = addDistrictRivalPressure(next, property.district, 5, `upgrading ${property.name}`);
      next = maybeRivalRetaliation(next, property.district, heat >= 60 ? 14 : 5);

      return addLog(next, `${property.name} upgraded to Level ${level + 1}. Income improved. Heat +${heatGain}.`);
    });
  }

  function activateSupplyRoute(route) {
    setGame((old) => {
      const status = getRouteStatus(route, old);
      if (status.active) return addLog(old, `${route.name} is already active.`);
      if (!status.unlocked) {
        const missingFronts = status.missingProperties.map(getPropertyName).join(", ");
        const missingTurf = status.missingControl
          .map(([districtId, needed]) => `${getDistrictName(districtId)} ${needed}%`)
          .join(", ");
        const details = [missingFronts && `fronts: ${missingFronts}`, missingTurf && `control: ${missingTurf}`]
          .filter(Boolean)
          .join("; ");
        return addLog(old, `${route.name} is locked. Need ${details}.`);
      }
      if (old.cash < route.cost) return addLog(old, `You need ${money(route.cost)} to open ${route.name}.`);

      let next = {
        ...old,
        cash: old.cash - route.cost,
        respect: Number(old.respect || 0) + 3,
        supplyRoutes: {
          ...(old.supplyRoutes || {}),
          [route.id]: true,
        },
      };

      next = addDailyProgress(next, "fronts", 1);

      return addLog(
        next,
        `${route.name} opened. Front income increased by ${Math.round(route.incomeBonus * 100)}%.`
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
          gear: {
            ...old.gear,
            [item.id]: true,
          },
          gearUpgrades: {
            ...(old.gearUpgrades || {}),
            [item.id]: 1,
          },
          marketRep: Number(old.marketRep || 0) + 1,
        },
        `Purchased ${item.name}. Attack +${item.attack}, Defense +${item.defense}. Market Rep +1.`
      );
    });
  }

  function upgradeGear(item) {
    setGame((old) => {
      if (!old.gear?.[item.id]) return addLog(old, `Buy ${item.name} before upgrading it.`);

      const level = getGearLevel(old, item.id);
      if (level >= 5) return addLog(old, `${item.name} is already fully upgraded.`);

      const cost = getGearUpgradeCost(item, level);
      if (Number(old.cash || 0) < cost.cash) return addLog(old, `You need ${money(cost.cash)} to upgrade ${item.name}.`);
      if (Number(old.tribute || 0) < cost.tribute) return addLog(old, `You need ${cost.tribute} Tribute to upgrade ${item.name}.`);
      if (Number(old.energy || 0) < cost.energy) return addLog(old, `You need ${cost.energy} Energy to upgrade ${item.name}.`);

      return addLog(
        {
          ...old,
          cash: Number(old.cash || 0) - cost.cash,
          tribute: Number(old.tribute || 0) - cost.tribute,
          energy: Number(old.energy || 0) - cost.energy,
          respect: Number(old.respect || 0) + 1,
          marketRep: Number(old.marketRep || 0) + 2,
          gearUpgrades: {
            ...(old.gearUpgrades || {}),
            [item.id]: level + 1,
          },
        },
        `${item.name} upgraded to Level ${level + 1}/5. Respect +1. Market Rep +2.`
      );
    });
  }

  function buyBlackMarketDeal(deal) {
    setGame((old) => {
      const marketGame = ensureBlackMarketState(old);
      if (marketGame.blackMarketDeals?.[deal.id]) return addLog(marketGame, `${deal.title} has already been taken today.`);
      if (Number(marketGame.cash || 0) < Number(deal.costCash || 0)) return addLog(marketGame, `You need ${money(deal.costCash)} for ${deal.title}.`);
      if (Number(marketGame.tribute || 0) < Number(deal.costTribute || 0)) return addLog(marketGame, `You need ${deal.costTribute} Tribute for ${deal.title}.`);
      if (Number(marketGame.energy || 0) < Number(deal.costEnergy || 0)) return addLog(marketGame, `You need ${deal.costEnergy} Energy for ${deal.title}.`);

      let next = {
        ...marketGame,
        cash: Number(marketGame.cash || 0) - Number(deal.costCash || 0),
        tribute: Number(marketGame.tribute || 0) - Number(deal.costTribute || 0),
        energy: Number(marketGame.energy || 0) - Number(deal.costEnergy || 0) + Number(deal.energyReward || 0),
        heat: clamp(Number(marketGame.heat || 0) + getAdjustedHeatGain(marketGame, Number(deal.heat || 0)) - Number(deal.heatReduction || 0), 0, 100),
        crew: Number(marketGame.crew || 0) + Number(deal.crew || 0),
        crewLoyalty: clamp(Number(marketGame.crewLoyalty ?? 75) + Number(deal.loyalty || 0), 0, 100),
        crewAttackBonus: Number(marketGame.crewAttackBonus || 0) + Number(deal.attackBonus || 0),
        crewDefenseBonus: Number(marketGame.crewDefenseBonus || 0) + Number(deal.defenseBonus || 0),
        respect: Number(marketGame.respect || 0) + Number(deal.respect || 0),
        marketRep: Number(marketGame.marketRep || 0) + Number(deal.rep || 0),
        blackMarketPurchases: Number(marketGame.blackMarketPurchases || 0) + 1,
        blackMarketDeals: {
          ...(marketGame.blackMarketDeals || {}),
          [deal.id]: true,
        },
      };

      if (deal.gearId) {
        next = {
          ...next,
          gear: {
            ...(next.gear || {}),
            [deal.gearId]: true,
          },
          gearUpgrades: {
            ...(next.gearUpgrades || {}),
            [deal.gearId]: Math.max(1, Number(next.gearUpgrades?.[deal.gearId] || 1)),
          },
        };
      }

      if (deal.pressureReduction) {
        next = {
          ...next,
          rivalPressure: { ...(next.rivalPressure || {}) },
        };
        rivals.forEach((rival) => {
          next.rivalPressure[rival.id] = Math.max(0, getRivalPressure(next, rival.id) - Number(deal.pressureReduction || 0));
        });
      }

      return addLog(next, `${deal.title} completed through the Black Market. ${getMarketDealReward(deal)}.`);
    });
  }

  function recruitCrew() {
    setGame((old) => {
      const cost = getRecruitCost(old);
      if (old.cash < cost) return addLog(old, `You need ${money(cost)} to recruit another crew member.`);

      const next = addDailyProgress({
        ...old,
        cash: old.cash - cost,
        crew: old.crew + 1,
        heat: clamp(Number(old.heat || 0) + 2, 0, 100),
        respect: Number(old.respect || 0) + 1,
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) - 2, 0, 100),
      }, "crew", 1);

      return addLog(
        next,
        `Recruited 1 crew member for ${money(cost)}. Heat +2.`
      );
    });
  }

  function trainCrew(type) {
    setGame((old) => {
      const cost = getTrainingCost(old);
      const energyCost = 6;
      if (old.cash < cost) return addLog(old, `You need ${money(cost)} to train the crew.`);
      if (old.energy < energyCost) return addLog(old, `You need ${energyCost} Energy to train the crew.`);

      const isMuscle = type === "muscle";
      const next = addDailyProgress({
        ...old,
        cash: old.cash - cost,
        energy: old.energy - energyCost,
        heat: clamp(Number(old.heat || 0) + 1, 0, 100),
        respect: Number(old.respect || 0) + 1,
        crewAttackBonus: Number(old.crewAttackBonus || 0) + (isMuscle ? 2 : 0),
        crewDefenseBonus: Number(old.crewDefenseBonus || 0) + (isMuscle ? 0 : 2),
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) + 1, 0, 100),
      }, "crew", 1);

      return addLog(
        next,
        isMuscle ? "Trained muscle. Crew Attack Bonus +2." : "Trained lookouts. Crew Defense Bonus +2."
      );
    });
  }

  function payCrew() {
    setGame((old) => {
      const cost = getPayrollCost(old);
      if (old.cash < cost) return addLog(old, `You need ${money(cost)} to pay the crew.`);

      const next = addDailyProgress({
        ...old,
        cash: old.cash - cost,
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) + 15, 0, 100),
      }, "crew", 1);

      return addLog(
        next,
        `Paid the crew ${money(cost)}. Loyalty improved.`
      );
    });
  }

  function fightRival(rival) {
    setGame((old) => {
      if (old.stamina < 1) return addLog(old, `Not enough stamina to attack ${rival.name}.`);
      if (old.health <= 0) return addLog(old, "You are out of health. Visit the clinic.");

      const heatGain = getAdjustedHeatGain(old, rand(4, 9));
      const currentHeat = clamp(Number(old.heat || 0), 0, 100);
      const roll = attack + rand(1, 20);
      const rivalRoll = rival.power + rand(1, 20);
      const won = roll >= rivalRoll;

      let next = {
        ...old,
        heat: clamp(currentHeat + heatGain, 0, 100),
        stamina: old.stamina - 1,
      };

      next = addDailyProgress(next, "rival", 1);

      if (won) {
        const payout = rand(rival.reward[0], rival.reward[1]);

        next = {
          ...next,
          cash: next.cash + payout,
          wins: next.wins + 1,
          respect: Number(next.respect || 0) + 3,
          crewLoyalty: clamp(Number(next.crewLoyalty ?? 75) + 2, 0, 100),
          beaten: {
            ...next.beaten,
            [rival.id]: true,
          },
          territory: {
            ...next.territory,
            [rival.district]: clamp((next.territory[rival.district] || 0) + rival.control, 0, 100),
          },
        };

        next = addXp(next, rival.xp);
        next = addRivalPressureById(next, rival.id, 20, `defeating ${rival.name}`);
        next = maybeRivalRetaliation(next, rival.district, currentHeat >= 85 ? 30 : currentHeat >= 60 ? 18 : 8);

        return addLog(next, `Victory over ${rival.name}. Earned ${money(payout)}, ${rival.xp} XP, and Heat +${heatGain}.`);
      }

      const loss = Math.min(next.cash, rand(75, 240));
      const damage = rand(6, 18);

      next = {
        ...next,
        cash: next.cash - loss,
        health: Math.max(0, next.health - damage),
        losses: next.losses + 1,
        crewLoyalty: clamp(Number(next.crewLoyalty ?? 75) - 4, 0, 100),
      };

      next = addRivalPressureById(next, rival.id, 8, `challenging ${rival.name}`);

      return addLog(next, `Lost to ${rival.name}. Dropped ${money(loss)}, took ${damage} damage, and Heat +${heatGain}.`);
    });
  }

  function spendBossSkill(skillId) {
    setGame((old) => {
      const skill = bossSkills.find((item) => item.id === skillId);
      if (!skill) return old;
      if (Number(old.skillPoints || 0) <= 0) return addLog(old, "You do not have any skill points to spend.");

      const currentRank = getSkillLevel(old, skillId);
      if (currentRank >= skill.max) return addLog(old, `${skill.name} is already maxed out.`);

      const next = {
        ...old,
        skillPoints: Number(old.skillPoints || 0) - 1,
        [skillId]: currentRank + 1,
      };

      if (skillId === "energySkill") {
        next.maxEnergy = Number(old.maxEnergy || 100) + 10;
        next.energy = Number(old.energy || 0) + 10;
      }

      return addLog(next, `Spent 1 skill point on ${skill.name}. Rank is now ${currentRank + 1}/${skill.max}.`);
    });
  }

  function depositVault(percent) {
    setGame((old) => {
      const stats = getVaultStats(old);
      const capacityLeft = Math.max(0, stats.capacity - stats.current);
      const amount = Math.min(Math.floor(Number(old.cash || 0) * percent), capacityLeft);
      if (amount <= 0 && Number(old.cash || 0) <= 0) return addLog(old, "No cash available to vault.");
      if (amount <= 0) return addLog(old, "The vault is full. Upgrade vault security before stashing more cash.");

      return addLog(
        {
          ...old,
          cash: Number(old.cash || 0) - amount,
          vault: Number(old.vault || 0) + amount,
        },
        `Moved ${money(amount)} into the vault. Protected cash is now ${money(Number(old.vault || 0) + amount)}.`
      );
    });
  }

  function withdrawVault() {
    setGame((old) => {
      if (old.vault <= 0) return addLog(old, "The vault is empty.");

      return addLog(
        {
          ...old,
          cash: old.cash + old.vault,
          vault: 0,
        },
        "Withdrew all vault cash."
      );
    });
  }

  function upgradeVaultSecurity() {
    setGame((old) => {
      const level = getVaultLevel(old);
      if (level >= 5) return addLog(old, "Vault security is already maxed out.");

      const cost = getVaultUpgradeCost(level);
      if (Number(old.cash || 0) < cost.cash) return addLog(old, `You need ${money(cost.cash)} to upgrade vault security.`);
      if (Number(old.tribute || 0) < cost.tribute) return addLog(old, `You need ${cost.tribute} Tribute to upgrade vault security.`);
      if (Number(old.energy || 0) < cost.energy) return addLog(old, `You need ${cost.energy} Energy to upgrade vault security.`);

      const nextLevel = level + 1;
      return addLog(
        {
          ...old,
          cash: Number(old.cash || 0) - cost.cash,
          tribute: Number(old.tribute || 0) - cost.tribute,
          energy: Number(old.energy || 0) - cost.energy,
          vaultLevel: nextLevel,
          vaultOperations: Number(old.vaultOperations || 0) + 1,
          respect: Number(old.respect || 0) + 1,
        },
        `Vault security upgraded to Level ${nextLevel}. Capacity and rival protection improved.`
      );
    });
  }

  function launderVaultCash() {
    setGame((old) => {
      const stats = getVaultStats(old);
      const amount = getVaultLaunderAmount(old);
      const energyCost = 6;

      if (stats.current < 250) return addLog(old, "You need at least $250 in the vault before laundering money through fronts.");
      if (Number(old.energy || 0) < energyCost) return addLog(old, `You need ${energyCost} Energy to launder vault cash.`);

      const cleaned = Math.round(amount * stats.launderRate);
      const fee = amount - cleaned;
      const heatGain = getAdjustedHeatGain(old, 3);

      let next = {
        ...old,
        vault: Math.max(0, Number(old.vault || 0) - amount),
        cash: Number(old.cash || 0) + cleaned,
        energy: Number(old.energy || 0) - energyCost,
        heat: clamp(Number(old.heat || 0) + heatGain, 0, 100),
        respect: Number(old.respect || 0) + 1,
        launderedCash: Number(old.launderedCash || 0) + cleaned,
        vaultOperations: Number(old.vaultOperations || 0) + 1,
      };

      next = addXp(next, 10 + stats.level * 2);
      next = addDailyProgress(next, "fronts", 1);

      return addLog(next, `Laundered ${money(amount)} from the vault into ${money(cleaned)} usable cash. Lost ${money(fee)} in cuts and added Heat +${heatGain}.`);
    });
  }

  function burnPaperTrail() {
    setGame((old) => {
      const cost = getVaultBurnTrailCost(old);
      if (Number(old.vault || 0) < cost.vaultCash) return addLog(old, `You need ${money(cost.vaultCash)} in the vault to burn the paper trail.`);
      if (Number(old.tribute || 0) < cost.tribute) return addLog(old, `You need ${cost.tribute} Tribute to burn the paper trail.`);
      if (Number(old.energy || 0) < cost.energy) return addLog(old, `You need ${cost.energy} Energy to burn the paper trail.`);

      const heatReduction = 10 + getVaultLevel(old) * 3;
      const pressureReduction = 8 + getVaultLevel(old) * 2;
      const rivalPressure = { ...(old.rivalPressure || {}) };
      rivals.forEach((rival) => {
        rivalPressure[rival.id] = Math.max(0, Number(rivalPressure[rival.id] || 0) - pressureReduction);
      });

      let next = {
        ...old,
        vault: Math.max(0, Number(old.vault || 0) - cost.vaultCash),
        tribute: Number(old.tribute || 0) - cost.tribute,
        energy: Number(old.energy || 0) - cost.energy,
        heat: Math.max(0, Number(old.heat || 0) - heatReduction),
        rivalPressure,
        vaultOperations: Number(old.vaultOperations || 0) + 1,
      };

      next = addDailyProgress(next, "heat", 1);

      return addLog(next, `Burned the paper trail. Heat -${heatReduction} and rival pressure -${pressureReduction} across the city.`);
    });
  }

  function healBoss() {
    setGame((old) => {
      if (old.health >= old.maxHealth) return addLog(old, "You are already at full health.");

      const contactDiscount = Math.min(0.35, getContactStats(old).clinicDiscount);
      const cost = Math.max(150, Math.round(old.maxHealth * 2 * (1 - contactDiscount)));
      if (old.cash < cost) return addLog(old, `You need ${money(cost)} to heal.`);

      return addLog(
        {
          ...old,
          cash: old.cash - cost,
          health: old.maxHealth,
        },
        `Clinic visit complete. Healed to ${old.maxHealth}/${old.maxHealth}.`
      );
    });
  }


  function claimDailyOrdersReward() {
    setGame((old) => {
      const dailyGame = ensureDailyState(old);
      const orders = getDailyOrders(dailyGame);
      const complete = orders.every((order) => order.done);
      const today = getTodayKey();

      if (!complete) return addLog(dailyGame, "Daily Orders are not finished yet.");
      if (dailyGame.dailyRewardClaimedDate === today) return addLog(dailyGame, "Today's Daily Orders reward has already been claimed.");

      const yesterday = getYesterdayKey();
      const continuedStreak = dailyGame.lastDailyClaimDate === yesterday;
      const streak = continuedStreak ? Number(dailyGame.dailyStreak || 0) + 1 : 1;
      const reward = getDailyReward({ ...dailyGame, dailyStreak: streak - 1 });

      return addLog(
        {
          ...dailyGame,
          cash: Number(dailyGame.cash || 0) + reward.cash,
          energy: Number(dailyGame.energy || 0) + reward.energy,
          respect: Number(dailyGame.respect || 0) + reward.respect,
          skillPoints: Number(dailyGame.skillPoints || 0) + reward.skillPoints,
          dailyRewardClaimedDate: today,
          lastDailyClaimDate: today,
          dailyStreak: streak,
        },
        `Daily Orders completed. Claimed ${money(reward.cash)}, +${reward.energy} Energy, +${reward.respect} Respect${reward.skillPoints ? ", and +1 Skill Point" : ""}. Streak: ${streak}.`
      );
    });
  }

  function claimFirstMovesReward() {
    setGame((old) => {
      const currentDistrictControl = old.territory?.[old.startingDistrictId || "docks"] || 0;
      const currentPropertyCount = Object.values(old.properties || {}).reduce((sum, count) => sum + Number(count || 0), 0);
      const complete = old.jobsRun >= 1 && old.wins >= 1 && currentDistrictControl >= 25 && currentPropertyCount >= 1;

      if (!complete) return addLog(old, "First Moves is not finished yet.");
      if (old.chapterRewards?.firstMoves) return addLog(old, "First Moves reward has already been claimed.");

      return addLog(
        {
          ...old,
          cash: old.cash + 1000,
          energy: old.energy + 50,
          crew: old.crew + 3,
          respect: Number(old.respect || 0) + 5,
          chapterRewards: {
            ...(old.chapterRewards || {}),
            firstMoves: true,
          },
        },
        "First Moves completed. Claimed $1,000, +50 Energy, and +3 Crew."
      );
    });
  }

  function claimCampaignReward(chapterId) {
    setGame((old) => {
      const chapter = getCampaignChapters(old).find((item) => item.id === chapterId);
      if (!chapter) return old;
      if (!chapter.unlocked) return addLog(old, `${chapter.title} is locked. Finish the previous chapter first.`);
      if (chapter.claimed) return addLog(old, `${chapter.title} reward has already been claimed.`);
      if (!chapter.complete) return addLog(old, `${chapter.title} is not finished yet.`);

      const reward = chapter.reward || {};
      let next = {
        ...old,
        cash: Number(old.cash || 0) + Number(reward.cash || 0),
        energy: Number(old.energy || 0) + Number(reward.energy || 0),
        crew: Number(old.crew || 0) + Number(reward.crew || 0),
        respect: Number(old.respect || 0) + Number(reward.respect || 0),
        skillPoints: Number(old.skillPoints || 0) + Number(reward.skillPoints || 0),
        heat: Math.max(0, Number(old.heat || 0) - Number(reward.heatReduction || 0)),
        chapterRewards: {
          ...(old.chapterRewards || {}),
          [chapter.id]: true,
        },
      };

      if (reward.xp) {
        next = addXp(next, reward.xp);
      }

      return addLog(next, `${chapter.title} completed. Claimed ${getCampaignRewardLabel(reward)}.`);
    });
  }

  function layLow() {
    setGame((old) => {
      const currentHeat = clamp(Number(old.heat || 0), 0, 100);
      if (currentHeat <= 0) return addLog(old, "Heat is already quiet.");

      const cost = 150 + old.level * 50;
      const energyCost = 8;
      if (old.cash < cost) return addLog(old, `You need ${money(cost)} to lay low.`);
      if (old.energy < energyCost) return addLog(old, `You need ${energyCost} Energy to lay low.`);

      const reduction = rand(14, 24);
      const next = addDailyProgress({
        ...old,
        cash: old.cash - cost,
        energy: old.energy - energyCost,
        heat: Math.max(0, currentHeat - reduction),
      }, "heat", 1);

      return addLog(
        next,
        `Laid low and cooled the streets by ${reduction} Heat.`
      );
    });
  }

  function bribeOfficials() {
    setGame((old) => {
      const currentHeat = clamp(Number(old.heat || 0), 0, 100);
      if (currentHeat <= 0) return addLog(old, "Nobody important is watching right now.");

      const cost = 650 + old.level * 125;
      if (old.cash < cost) return addLog(old, `You need ${money(cost)} to pay for a clean favor.`);

      const reduction = rand(25, 40);
      const next = addDailyProgress({
        ...old,
        cash: old.cash - cost,
        heat: Math.max(0, currentHeat - reduction),
      }, "heat", 1);

      return addLog(
        next,
        `Paid for a clean favor. Heat dropped by ${reduction}.`
      );
    });
  }

  function sendDecoyCrew() {
    setGame((old) => {
      const currentHeat = clamp(Number(old.heat || 0), 0, 100);
      if (currentHeat <= 0) return addLog(old, "No decoy needed. The streets are quiet.");
      if (old.crew <= 1) return addLog(old, "You need more crew before sending a decoy.");

      const reduction = rand(18, 30);
      const next = addDailyProgress({
        ...old,
        crew: old.crew - 1,
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) - 8, 0, 100),
        heat: Math.max(0, currentHeat - reduction),
      }, "heat", 1);

      return addLog(
        next,
        `Sent a decoy crew to pull attention away. Heat dropped by ${reduction}, but you lost 1 Crew.`
      );
    });
  }


  function collectDistrictTribute(district) {
    setGame((old) => {
      const control = old.territory?.[district.id] || 0;
      if (control < 25) return addLog(old, `${district.name} needs at least 25% control before it can pay tribute.`);

      const status = getCollectionStatus(old, district.id);
      if (!status.ready) return addLog(old, `${district.name} tribute is cooling down. Ready in ${status.label}.`);

      const currentLoyalty = clamp(Number(old.crewLoyalty ?? 75), 0, 100);
      const payout = getDistrictTribute(district, control, bossClass.income, currentLoyalty, getBossSkillStats(old).tributeMultiplier * getSafehouseStats(old).tributeMultiplier * getContactStats(old).tributeMultiplier * getLieutenantStats(old).tributeMultiplier);
      const heatGain = getAdjustedHeatGain(old, control >= 75 ? 4 : 2);

      let next = {
        ...old,
        cash: old.cash + payout,
        heat: clamp(Number(old.heat || 0) + heatGain, 0, 100),
        respect: Number(old.respect || 0) + 1,
        districtCollections: {
          ...(old.districtCollections || {}),
          [district.id]: Date.now(),
        },
      };

      const eventInfluence = getLiveEventTributeInfluence(district, payout, old);
      if (eventInfluence > 0) {
        next = addLiveEventInfluence(next, eventInfluence);
      }

      next = addDailyProgress(next, "tribute", 1);
      next = addDistrictRivalPressure(next, district.id, control >= 75 ? 12 : 8, `collecting tribute from ${district.name}`);
      next = maybeRivalRetaliation(next, district.id, heat >= 60 ? 20 : 8);
      const eventLine = eventInfluence > 0 ? ` Concrete Pour +${eventInfluence} Influence.` : "";

      return addLog(next, `Collected ${money(payout)} tribute from ${district.name}. Heat +${heatGain}.${eventLine}`);
    });
  }

  function settleRivalPressure(rival) {
    setGame((old) => {
      const pressure = getRivalPressure(old, rival.id);
      if (pressure <= 0) return addLog(old, `${rival.name} has no pressure to settle right now.`);
      if (old.stamina < 1) return addLog(old, `Not enough stamina to settle pressure with ${rival.name}.`);
      if (old.energy < 8) return addLog(old, `You need 8 Energy to settle pressure with ${rival.name}.`);
      if (old.health <= 0) return addLog(old, "You are out of health. Visit the clinic before settling scores.");

      const heatGain = getAdjustedHeatGain(old, 3);
      const roll = attack + defense + rand(1, 30);
      const rivalRoll = rival.power * 2 + pressure + rand(1, 24);
      const won = roll >= rivalRoll;
      const reduction = won ? rand(32, 48) : rand(12, 24);
      const nextPressure = Math.max(0, pressure - reduction);

      let next = {
        ...old,
        stamina: old.stamina - 1,
        energy: old.energy - 8,
        heat: clamp(Number(old.heat || 0) + heatGain, 0, 100),
        rivalPressure: {
          ...(old.rivalPressure || {}),
          [rival.id]: nextPressure,
        },
      };

      next = addDailyProgress(next, "rival", 1);

      if (won) {
        const payout = rand(Math.floor(rival.reward[0] / 3), Math.floor(rival.reward[1] / 2));
        next = {
          ...next,
          cash: next.cash + payout,
          respect: Number(next.respect || 0) + 2,
          crewLoyalty: clamp(Number(next.crewLoyalty ?? 75) + 1, 0, 100),
        };
        next = addRevengeLog(next, `Settled pressure with ${rival.name}. Pressure dropped by ${reduction}.`);
        return addLog(next, `Settled the score with ${rival.name}. Earned ${money(payout)} and reduced pressure by ${reduction}.`);
      }

      const cashLoss = Math.min(next.cash, rand(120, 300));
      const damage = rand(5, 14);
      next = {
        ...next,
        cash: next.cash - cashLoss,
        health: Math.max(0, next.health - damage),
        crewLoyalty: clamp(Number(next.crewLoyalty ?? 75) - 3, 0, 100),
      };
      next = addRevengeLog(next, `Tried to settle pressure with ${rival.name}, but it went sideways. Pressure still dropped by ${reduction}.`);
      return addLog(next, `The sit-down with ${rival.name} went sideways. Lost ${money(cashLoss)} and took ${damage} damage.`);
    });
  }

  function buyQuiet(rival) {
    setGame((old) => {
      const pressure = getRivalPressure(old, rival.id);
      if (pressure <= 0) return addLog(old, `${rival.name} is already quiet.`);

      const cost = 350 + old.level * 90 + pressure * 8;
      if (old.cash < cost) return addLog(old, `You need ${money(cost)} to buy quiet with ${rival.name}.`);

      const reduction = rand(24, 38);
      const nextPressure = Math.max(0, pressure - reduction);
      let next = {
        ...old,
        cash: old.cash - cost,
        rivalPressure: {
          ...(old.rivalPressure || {}),
          [rival.id]: nextPressure,
        },
      };

      next = addDailyProgress(next, "rival", 1);
      next = addRevengeLog(next, `Bought quiet with ${rival.name}. Pressure dropped by ${reduction}.`);
      return addLog(next, `Paid ${money(cost)} to cool things down with ${rival.name}.`);
    });
  }

  function scoutStreetOpportunity() {
    setGame((old) => {
      const active = getActiveStreetOpportunity(old);
      if (active) return addLog(old, `${active.title} is already active in City Wire.`);

      const scoutCost = 5;
      if (old.energy < scoutCost) return addLog(old, `You need ${scoutCost} Energy to scout the City Wire.`);

      const heatLevel = clamp(Number(old.heat || 0), 0, 100);
      const available = streetOpportunities.filter((event) => {
        if (event.id === "dirty_tip" && heatLevel < 20) return false;
        return true;
      });
      const pool = available.length ? available : streetOpportunities;
      const chosen = pool[rand(0, pool.length - 1)];

      return addLog(
        {
          ...old,
          energy: old.energy - scoutCost,
          cityEventId: chosen.id,
          cityEventExpiresAt: Date.now() + 15 * 60 * 1000,
          cityWireMoves: Number(old.cityWireMoves || 0) + 1,
        },
        `City Wire lead opened: ${chosen.title}.`
      );
    });
  }

  function resolveStreetOpportunity(eventId, optionId) {
    setGame((old) => {
      const event = getActiveStreetOpportunity(old);
      if (!event || event.id !== eventId) {
        return addLog(
          { ...old, cityEventId: "", cityEventExpiresAt: 0 },
          "That City Wire lead has gone cold. Scout for a new one."
        );
      }

      const option = event.options.find((item) => item.id === optionId);
      if (!option) return old;
      if (option.costCash && old.cash < option.costCash) return addLog(old, `You need ${money(option.costCash)} for ${option.label}.`);
      if (option.costEnergy && old.energy < option.costEnergy) return addLog(old, `You need ${option.costEnergy} Energy for ${option.label}.`);

      const heatGain = option.heat ? getAdjustedHeatGain(old, option.heat) : 0;
      let next = {
        ...old,
        cash: Number(old.cash || 0) - Number(option.costCash || 0) + Number(option.cash || 0),
        energy: Number(old.energy || 0) - Number(option.costEnergy || 0),
        heat: clamp(Number(old.heat || 0) + heatGain - Number(option.heatReduction || 0), 0, 100),
        respect: Number(old.respect || 0) + Number(option.respect || 0),
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) + Number(option.loyalty || 0), 0, 100),
        cityEventId: "",
        cityEventExpiresAt: 0,
        cityWireResolved: Number(old.cityWireResolved || 0) + 1,
      };

      if (option.control && event.district) {
        next = {
          ...next,
          territory: {
            ...(next.territory || {}),
            [event.district]: clamp(Number(next.territory?.[event.district] || 0) + Number(option.control || 0), 0, 100),
          },
        };
        next = addDailyProgress(next, "turf", option.control);
      }

      if (option.pressure && event.district) {
        next = addDistrictRivalPressure(next, event.district, option.pressure, `working City Wire lead ${event.title}`);
      }

      if (option.pressureReduction) {
        const localRivals = getRivalsForDistrict(event.district);
        const pressureDrop = Number(option.pressureReduction || 0);
        if (localRivals.length) {
          next = {
            ...next,
            rivalPressure: { ...(next.rivalPressure || {}) },
          };
          localRivals.forEach((rival) => {
            next.rivalPressure[rival.id] = Math.max(0, getRivalPressure(next, rival.id) - pressureDrop);
          });
        }
      }

      next = addDailyProgress(next, "jobs", 1);

      if (option.xp) {
        next = addXp(next, option.xp);
      }

      return addLog(
        next,
        `${option.label} completed from City Wire. ${getStreetOpportunityReward(option)}.`
      );
    });
  }


  function toggleLiveEventDeputy() {
    setGame((old) => {
      const alreadyDeputized = Boolean(old.liveEventDeputized);
      if (!alreadyDeputized && Number(old.crew || 0) < 1) {
        return addLog(old, "You need at least 1 crew member before you can deputize someone for Concrete Pour.");
      }

      return addLog(
        {
          ...old,
          liveEventDeputized: !alreadyDeputized,
        },
        alreadyDeputized
          ? "Concrete Pour deputy removed. That crew member is back on regular fight duty."
          : "Concrete Pour deputy assigned. Influence gains increase by 5%, but 1 crew member is locked out of fight power."
      );
    });
  }

  function claimLiveEventMilestone() {
    setGame((old) => {
      if (old.liveEventRewards?.concretePourMilestone) {
        return addLog(old, "Concrete Pour milestone reward has already been claimed.");
      }
      if (Number(old.liveEventInfluence || 0) < liveEvent.milestoneInfluence) {
        return addLog(old, `You need ${liveEvent.milestoneInfluence} Concrete Pour Influence before claiming this reward.`);
      }

      return addLog(
        {
          ...old,
          cash: old.cash + 1500,
          tribute: Number(old.tribute || 0) + 100,
          respect: Number(old.respect || 0) + 5,
          skillPoints: Number(old.skillPoints || 0) + 2,
          liveEventRewards: {
            ...(old.liveEventRewards || {}),
            concretePourMilestone: true,
          },
        },
        "Concrete Pour milestone claimed: $1,500, +100 Tribute, +5 Respect, and +2 Skill Points."
      );
    });
  }


  function upgradeSafehouseRoom(room) {
    setGame((old) => {
      const level = getSafehouseRoomLevel(old, room.id);
      if (level >= (room.max || 5)) return addLog(old, `${room.name} is already fully upgraded.`);

      const cost = getSafehouseUpgradeCost(room, level);
      if (Number(old.cash || 0) < cost.cash) return addLog(old, `You need ${money(cost.cash)} to upgrade ${room.name}.`);
      if (Number(old.tribute || 0) < cost.tribute) return addLog(old, `You need ${cost.tribute} Tribute to upgrade ${room.name}.`);
      if (Number(old.energy || 0) < cost.energy) return addLog(old, `You need ${cost.energy} Energy to upgrade ${room.name}.`);

      const nextLevel = level + 1;
      let next = {
        ...old,
        cash: Number(old.cash || 0) - cost.cash,
        tribute: Number(old.tribute || 0) - cost.tribute,
        energy: Number(old.energy || 0) - cost.energy,
        safehouseMoves: Number(old.safehouseMoves || 0) + 1,
        respect: Number(old.respect || 0) + 1,
        safehouse: {
          ...(old.safehouse || {}),
          [room.id]: nextLevel,
        },
      };

      if (room.maxEnergy) {
        next = {
          ...next,
          maxEnergy: Number(next.maxEnergy || 0) + Number(room.maxEnergy || 0),
          energy: Number(next.energy || 0) + Number(room.maxEnergy || 0),
        };
      }

      if (room.maxStamina) {
        next = {
          ...next,
          maxStamina: Number(next.maxStamina || 0) + Number(room.maxStamina || 0),
          stamina: Number(next.stamina || 0) + Number(room.maxStamina || 0),
        };
      }

      if (room.maxHealth) {
        next = {
          ...next,
          maxHealth: Number(next.maxHealth || 0) + Number(room.maxHealth || 0),
          health: Number(next.health || 0) + Number(room.maxHealth || 0),
        };
      }

      if (room.loyalty) {
        next = {
          ...next,
          crewLoyalty: clamp(Number(next.crewLoyalty ?? 75) + Number(room.loyalty || 0), 0, 100),
        };
      }

      next = addDailyProgress(next, "fronts", 1);

      return addLog(next, `${room.name} upgraded to Level ${nextLevel}/${room.max || 5}. ${room.effect}.`);
    });
  }


  function upgradeContact(contact) {
    setGame((old) => {
      const level = getContactLevel(old, contact.id);
      if (level >= (contact.max || 5)) return addLog(old, `${contact.name} is already fully connected.`);

      const cost = getContactUpgradeCost(contact, level);
      if (Number(old.cash || 0) < cost.cash) return addLog(old, `You need ${money(cost.cash)} to build trust with ${contact.name}.`);
      if (Number(old.respect || 0) < cost.respect) return addLog(old, `You need ${cost.respect} Respect to build trust with ${contact.name}.`);
      if (Number(old.tribute || 0) < cost.tribute) return addLog(old, `You need ${cost.tribute} Tribute to build trust with ${contact.name}.`);
      if (Number(old.energy || 0) < cost.energy) return addLog(old, `You need ${cost.energy} Energy to build trust with ${contact.name}.`);

      const nextLevel = level + 1;
      let next = {
        ...old,
        cash: Number(old.cash || 0) - cost.cash,
        respect: Number(old.respect || 0) - cost.respect + 1,
        tribute: Number(old.tribute || 0) - cost.tribute,
        energy: Number(old.energy || 0) - cost.energy,
        contactMoves: Number(old.contactMoves || 0) + 1,
        contacts: {
          ...(old.contacts || {}),
          [contact.id]: nextLevel,
        },
      };

      next = addDailyProgress(next, "crew", 1);

      return addLog(next, `${contact.name} trust increased to Level ${nextLevel}/${contact.max || 5}. ${contact.effect}`);
    });
  }

  function callContactFavor(contact) {
    setGame((old) => {
      const level = getContactLevel(old, contact.id);
      if (level <= 0) return addLog(old, `Unlock ${contact.name} before calling in a favor.`);

      const favor = contact.favor || {};
      const status = getContactFavorStatus(old, contact.id);
      if (!status.ready) return addLog(old, `${contact.name} is cooling down. Favor ready in ${status.label}.`);

      if (Number(old.cash || 0) < Number(favor.costCash || 0)) return addLog(old, `You need ${money(favor.costCash)} to call ${contact.name}.`);
      if (Number(old.tribute || 0) < Number(favor.costTribute || 0)) return addLog(old, `You need ${favor.costTribute} Tribute to call ${contact.name}.`);
      if (Number(old.energy || 0) < Number(favor.costEnergy || 0)) return addLog(old, `You need ${favor.costEnergy} Energy to call ${contact.name}.`);

      const heatGain = favor.heat ? getAdjustedHeatGain(old, favor.heat) : 0;
      const vaultStatsNow = getVaultStats(old);
      const vaultRoom = Math.max(0, vaultStatsNow.capacity - vaultStatsNow.current);
      const vaultCash = Math.min(vaultRoom, Number(favor.vaultCash || 0));

      let next = {
        ...old,
        cash: Number(old.cash || 0) - Number(favor.costCash || 0) + Number(favor.cash || 0),
        tribute: Number(old.tribute || 0) - Number(favor.costTribute || 0) + Number(favor.tribute || 0),
        energy: Number(old.energy || 0) - Number(favor.costEnergy || 0) + Number(favor.energyReward || 0),
        health: clamp(Number(old.health || 0) + Number(favor.health || 0), 0, Number(old.maxHealth || 100)),
        heat: clamp(Number(old.heat || 0) + heatGain - Number(favor.heatReduction || 0), 0, 100),
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) + Number(favor.loyalty || 0), 0, 100),
        respect: Number(old.respect || 0) + Number(favor.respect || 0),
        vault: Number(old.vault || 0) + vaultCash,
        contactMoves: Number(old.contactMoves || 0) + 1,
        contactFavors: {
          ...(old.contactFavors || {}),
          [contact.id]: Date.now(),
        },
      };

      if (favor.control && favor.controlDistrict) {
        next = {
          ...next,
          territory: {
            ...(next.territory || {}),
            [favor.controlDistrict]: clamp(Number(next.territory?.[favor.controlDistrict] || 0) + Number(favor.control || 0), 0, 100),
          },
        };
        next = addDailyProgress(next, "turf", Number(favor.control || 0));
      }

      if (favor.pressureReduction) {
        const pressureDrop = Number(favor.pressureReduction || 0);
        next = { ...next, rivalPressure: { ...(next.rivalPressure || {}) } };
        rivals.forEach((rival) => {
          next.rivalPressure[rival.id] = Math.max(0, getRivalPressure(next, rival.id) - pressureDrop);
        });
      }

      next = addDailyProgress(next, favor.heatReduction ? "heat" : "crew", 1);

      return addLog(next, `${contact.name} favor used: ${favor.title}. ${getContactFavorReward(favor)}.`);
    });
  }


  function upgradeLieutenant(lieutenant) {
    setGame((old) => {
      const level = getLieutenantLevel(old, lieutenant.id);
      if (level >= (lieutenant.max || 5)) return addLog(old, `${lieutenant.name} is already maxed out.`);

      const cost = getLieutenantUpgradeCost(lieutenant, level);
      if (Number(old.cash || 0) < cost.cash) return addLog(old, `You need ${money(cost.cash)} to build ${lieutenant.name}.`);
      if (Number(old.respect || 0) < cost.respect) return addLog(old, `You need ${cost.respect} Respect to build ${lieutenant.name}.`);
      if (Number(old.tribute || 0) < cost.tribute) return addLog(old, `You need ${cost.tribute} Tribute to build ${lieutenant.name}.`);
      if (Number(old.energy || 0) < cost.energy) return addLog(old, `You need ${cost.energy} Energy to build ${lieutenant.name}.`);

      const nextLevel = level + 1;
      const assignments = { ...(old.lieutenantAssignments || {}) };
      if (!assignments[lieutenant.id] || assignments[lieutenant.id] === "idle") {
        assignments[lieutenant.id] = lieutenant.role;
      }

      const next = addDailyProgress({
        ...old,
        cash: Number(old.cash || 0) - cost.cash,
        respect: Number(old.respect || 0) - cost.respect,
        tribute: Number(old.tribute || 0) - cost.tribute,
        energy: Number(old.energy || 0) - cost.energy,
        lieutenants: {
          ...(old.lieutenants || {}),
          [lieutenant.id]: nextLevel,
        },
        lieutenantAssignments: assignments,
        lieutenantMoves: Number(old.lieutenantMoves || 0) + 1,
      }, "crew", 1);

      return addLog(next, `${level <= 0 ? "Recruited" : "Promoted"} ${lieutenant.name} to Level ${nextLevel}. Assigned to ${getLieutenantAssignmentName(assignments[lieutenant.id])}.`);
    });
  }

  function assignLieutenant(lieutenant, assignmentId) {
    setGame((old) => {
      const level = getLieutenantLevel(old, lieutenant.id);
      if (level <= 0) return addLog(old, `Unlock ${lieutenant.name} before assigning them.`);
      if (!lieutenantAssignments.some((item) => item.id === assignmentId)) return old;

      const energyCost = assignmentId === "idle" ? 0 : 2;
      if (Number(old.energy || 0) < energyCost) return addLog(old, `You need ${energyCost} Energy to assign ${lieutenant.name}.`);

      const next = addDailyProgress({
        ...old,
        energy: Number(old.energy || 0) - energyCost,
        lieutenantAssignments: {
          ...(old.lieutenantAssignments || {}),
          [lieutenant.id]: assignmentId,
        },
        lieutenantMoves: Number(old.lieutenantMoves || 0) + 1,
      }, "crew", 1);

      return addLog(next, `${lieutenant.name} assigned to ${getLieutenantAssignmentName(assignmentId)}.`);
    });
  }

  function resetGame() {
    if (!confirm("Reset this prototype save?")) return;
    localStorage.removeItem(SAVE_KEY);
    if (session?.username) localStorage.removeItem(getUserSaveKey(session.username));
    const freshGame = normalizeGame(startGame);
    setGame(freshGame);
    setBossName("Rookie");
    setClassId("boss");
    setStartingDistrictId("docks");
    setSetupProfileImage("");
    setSetupError("");
    setTab("command");
  }

  function districtName(id) {
    return getDistrictName(id);
  }

  const handleDismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setInstallPromptDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "1");
    }
  };

  const handleInstallApp = async () => {
    if (installPromptMode === "ios") {
      handleDismissInstallPrompt();
      return;
    }

    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    const choiceResult = await deferredInstallPrompt.userChoice.catch(() => null);

    if (choiceResult?.outcome === "accepted") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(INSTALL_PROMPT_ACCEPTED_KEY, "1");
      }
      setInstallPromptDismissed(true);
      setShowInstallPrompt(false);
    }

    setDeferredInstallPrompt(null);
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const accepted = window.localStorage.getItem(INSTALL_PROMPT_ACCEPTED_KEY) === "1";
    if (accepted || installPromptDismissed) return undefined;

    const isStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
    if (isStandalone) return undefined;

    const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent || "") && /safari/i.test(window.navigator.userAgent || "");

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
      setInstallPromptMode("native");
      setShowInstallPrompt(true);
    };

    const onAppInstalled = () => {
      window.localStorage.setItem(INSTALL_PROMPT_ACCEPTED_KEY, "1");
      setInstallPromptDismissed(true);
      setShowInstallPrompt(false);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    if (isiOS) {
      setInstallPromptMode("ios");
      setShowInstallPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [installPromptDismissed]);

  if (!session || !currentUser) {
    return (
      <>
        <InstallPromptBanner
          visible={showInstallPrompt}
          mode={installPromptMode}
          onInstall={handleInstallApp}
          onDismiss={handleDismissInstallPrompt}
        />
        <AuthScreen
          users={users}
          onSignIn={signIn}
          onCreateAccount={createPlayerAccount}
          onResetPassword={resetOwnPassword}
        />
      </>
    );
  }

  const signedInLabel = currentUser?.displayName || currentUser?.username || "Player";

  if (!game.started) {
    return (
      <>
        <InstallPromptBanner
          visible={showInstallPrompt}
          mode={installPromptMode}
          onInstall={handleInstallApp}
          onDismiss={handleDismissInstallPrompt}
        />
        <div className="start-page">
        <div className="start-shell">
          <div className="quick-account-bar">
            <div>
              <span>Signed in as</span>
              <strong>{signedInLabel}</strong>
              <small className="build-tag">{APP_BUILD_LABEL}</small>
            </div>
            <button type="button" className="secondary compact-button" onClick={signOut}>
              Log Out
            </button>
          </div>

          <section className="start-hero" aria-label="Shadow Syndicate start screen">
            <div className="hero-overlay">
              <img src="/logo-shadow-syndicate.png" alt="Shadow Syndicate" className="brand-logo" />
              <p className="tagline">Build your crew. Take the streets. Own the city.</p>
            </div>
          </section>

          <section className="panel welcome-panel">
            <img src="/ui/welcome-city.png" alt="Welcome to the underworld" />
            <div>
              <h1>WELCOME TO THE UNDERWORLD</h1>
              <p>
                You are not starting as a hero. You are building power from the bottom. Recruit your crew, run jobs, control districts, and turn your name into fear.
              </p>
            </div>
          </section>

          <section className="panel boss-profile-panel">
            <div className="setup-heading">
              <div>
                <p className="kicker">Boss Profile</p>
                <h2>Create Your Boss</h2>
              </div>
              <span>Step 1 of 1</span>
            </div>

            <div className="start-grid">
              <label>
                Boss Name
                <input
                  value={bossName}
                  onChange={(e) => {
                    setBossName(e.target.value);
                    if (setupError) setSetupError("");
                  }}
                  maxLength={22}
                  placeholder="Enter your street name"
                />
              </label>

              <label>
                Starting District
                <select value={startingDistrictId} onChange={(e) => setStartingDistrictId(e.target.value)}>
                  {startingDistrictOptions.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name} — {district.note}
                    </option>
                  ))}
                </select>
              </label>

              <div className="profile-preview" aria-label="Selected profile picture">
                <img src={setupPreviewImage} alt="Selected boss profile" />
                <div>
                  <span>Profile Pic / GIF</span>
                  <strong>{setupProfileImage ? "Custom Upload" : selectedClass.name}</strong>
                  <small>Upload a picture or animated GIF, or use the selected boss class image.</small>
                  <input
                    className="file-input"
                    type="file"
                    accept="image/*,.gif"
                    onChange={(e) => uploadSetupProfileImage(e.target.files?.[0])}
                  />
                </div>
              </div>
            </div>

            <div className="setup-status-strip">
              <span className={nameIsReady ? "ready" : "pending"}>Boss Name</span>
              <span className="ready">District</span>
              <span className="ready">Boss Class</span>
              <span className="ready">Profile Image</span>
            </div>

            {setupError && <p className="setup-error">{setupError}</p>}

            <div className="class-grid">
              {bossClasses.map((item) => (
                <button
                  key={item.id}
                  className={`class-card ${classId === item.id ? "active" : ""}`}
                  onClick={() => setClassId(item.id)}
                  type="button"
                >
                  <img src={item.image} alt={item.name} />
                  <span>{item.name}</span>
                  <small>{item.short}</small>
                </button>
              ))}
            </div>

            <button className="primary big" onClick={startNewGame} disabled={!setupReady}>
              Start Empire
            </button>
          </section>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <InstallPromptBanner
        visible={showInstallPrompt}
        mode={installPromptMode}
        onInstall={handleInstallApp}
        onDismiss={handleDismissInstallPrompt}
      />
    <div className="app">
      <header className="top-hero">
        <div className="top-hero-overlay">
          <div>
            <p className="kicker">Mobile Crime Strategy Prototype</p>
            <img src="/logo-shadow-syndicate.png" alt="Shadow Syndicate" className="top-logo" />
            <p className="tagline">Build your crew. Claim your city. Rule the underworld.</p>
          </div>

          <div className="boss-stack">
            <div className="quick-account-bar in-game-account-bar">
              <div>
                <span>Signed in as</span>
                <strong>{signedInLabel}</strong>
                <small className="build-tag">{APP_BUILD_LABEL}</small>
              </div>
              <div className="quick-account-actions">
                <button type="button" className="secondary compact-button" onClick={() => setTab("account")}>
                  Account
                </button>
                <button type="button" className="secondary compact-button" onClick={signOut}>
                  Log Out
                </button>
              </div>
            </div>

            <div className="boss-card">
              <img src={game.profileImage || bossClass.image} alt={bossClass.name} />
              <div>
                <p className="kicker">Boss Tag</p>
                <h2>{game.bossName}</h2>
                <p>{bossClass.name} • {districtName(game.startingDistrictId || "docks")}</p>
              </div>
              <div className="level-pill">
                <span>Level</span>
                <strong>{game.level}</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="hud">
        <Stat label="Cash" value={money(game.cash)} helper={`${money(income)}/min`} />
        <Stat label="Vault" value={money(game.vault)} helper={`L${vaultStats.level} / ${money(vaultStats.capacity)} cap`} />
        <Stat label="Tribute" value={game.tribute} helper="premium" />
        <Stat label="Event" value={game.liveEventInfluence || 0} helper={`rank #${liveEventRank}`} />
        <Stat label="Fronts" value={ownedPropertyCount} helper={`${supplyStats.activeCount} routes`} />
        <Stat label="Base" value={safehouseStats.totalLevels} helper="safehouse" />
        <Stat label="Contacts" value={`${contactStats.unlockedCount}/${underworldContacts.length}`} helper={`${contactStats.totalLevels} trust`} />
        <Stat label="Lts" value={`${lieutenantStats.unlockedCount}/${lieutenants.length}`} helper={`${lieutenantStats.assignedCount} assigned`} />
        <Stat label="Health" value={`${game.health}/${game.maxHealth}`} helper="combat" />
        <Stat label="Heat" value={`${heat}/100`} helper={heatTier.label} />
        <Stat label="Respect" value={game.respect || 0} helper="street rep" />
        <Stat label="Skill Pts" value={game.skillPoints || 0} helper={`${skillStats.totalRanks} ranks`} />
        <Stat label="Energy" value={`${game.energy}/${game.maxEnergy}`} helper="jobs" />
        <Stat label="Stamina" value={`${game.stamina}/${game.maxStamina}`} helper="attacks" />
        <Stat label="Power" value={`${attack}/${defense}`} helper="atk / def" />
      </section>

      <nav className="main-nav">
        {[
          ["command", "Command"],
          ["daily", "Daily"],
          ["event", "Event"],
          ["heat", "Heat"],
          ["campaign", "Campaign"],
          ["skills", "Skills"],
          ["market", "Market"],
          ["safehouse", "Safehouse"],
          ["contacts", "Contacts"],
          ["lieutenants", "Lieutenants"],
          ["jobs", "Jobs"],
          ["territory", "Territory"],
          ["crew", "Crew"],
          ["properties", "Properties"],
          ["rivals", "Rivals"],
          ["revenge", "Revenge"],
          ["vault", "Vault"],
          ["clinic", "Clinic"],
          ["wire", "City Wire"],
          ["log", "Log"],
          ["account", "Account"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>
            {label}
          </button>
        ))}
      </nav>

      <main className="layout">
        <section className="main-panel">
          {tab === "command" && (
            <Panel title="Command Center" sub="Choose your next move and keep the city moving in your direction.">
              <FirstMovesPanel
                moves={firstMoves}
                complete={firstMovesComplete}
                claimed={firstMovesRewardClaimed}
                onClaim={claimFirstMovesReward}
                onNavigate={setTab}
              />

              <DailyOrdersSummaryCard
                orders={dailyOrders}
                complete={dailyComplete}
                claimed={dailyClaimed}
                streak={game.dailyStreak || 0}
                reward={dailyReward}
                onOpen={() => setTab("daily")}
                onClaim={claimDailyOrdersReward}
              />

              <LiveEventSummaryCard
                game={game}
                phase={liveEventPhase}
                rank={liveEventRank}
                milestoneReady={liveEventMilestoneReady}
                milestoneClaimed={liveEventMilestoneClaimed}
                onOpen={() => setTab("event")}
                onClaim={claimLiveEventMilestone}
              />

              <CampaignSummaryCard
                chapter={nextCampaignChapter}
                completeCount={campaignClaimedCount}
                totalCount={campaignChapters.length}
                onOpen={() => setTab("campaign")}
              />

              <SkillSummaryCard
                skillPoints={game.skillPoints || 0}
                stats={skillStats}
                onOpen={() => setTab("skills")}
              />

              <BlackMarketSummaryCard
                marketRep={game.marketRep || 0}
                boughtToday={Object.values(ensureBlackMarketState(game).blackMarketDeals || {}).filter(Boolean).length}
                totalDeals={blackMarketDeals.length}
                gearStats={gearStats}
                onOpen={() => setTab("market")}
              />

              <SafehouseSummaryCard
                stats={safehouseStats}
                safehouseMoves={game.safehouseMoves || 0}
                onOpen={() => setTab("safehouse")}
              />

              <ContactsSummaryCard
                stats={contactStats}
                contacts={underworldContacts}
                game={game}
                onOpen={() => setTab("contacts")}
              />

              <LieutenantsSummaryCard
                stats={lieutenantStats}
                game={game}
                onOpen={() => setTab("lieutenants")}
              />

              <VaultSummaryCard
                stats={vaultStats}
                onOpen={() => setTab("vault")}
                onDeposit={() => depositVault(0.5)}
                onLaunder={launderVaultCash}
              />


              <HeatSummaryCard heat={heat} tier={heatTier} payoutMultiplier={payoutMultiplier} onOpen={() => setTab("heat")} />

              <CityWireSummaryCard
                activeEvent={activeStreetOpportunity}
                leadLabel={cityWireLeadLabel}
                expired={cityWireExpired}
                resolved={game.cityWireResolved || 0}
                onOpen={() => setTab("wire")}
                onScout={scoutStreetOpportunity}
              />

              <CrewSummaryCard
                crew={game.crew}
                loyalty={crewLoyalty}
                standing={crewStanding}
                respect={game.respect || 0}
                attackBonus={crewAttackBonus}
                defenseBonus={crewDefenseBonus}
                onOpen={() => setTab("crew")}
              />

              <TurfSummaryCard
                cityControl={cityControl}
                controlledDistricts={controlledDistricts}
                strongholdDistricts={strongholdDistricts}
                target={nextTurfTarget}
                targetControl={game.territory?.[nextTurfTarget.id] || 0}
                onOpen={() => setTab("territory")}
              />

              <FrontNetworkSummaryCard
                income={income}
                ownedPropertyCount={ownedPropertyCount}
                upgradedFrontCount={upgradedFrontCount}
                activeRoutes={supplyStats.activeCount}
                incomeBonus={supplyStats.incomeBonus}
                heatBuffer={supplyStats.heatBuffer}
                onOpen={() => setTab("properties")}
              />

              <RivalPressureSummaryCard
                topThreat={topRivalThreat}
                totalPressure={totalRivalPressure}
                onOpen={() => setTab("revenge")}
              />

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
            <Panel title="Concrete Pour" sub="A 72-hour Southside live event built for local-save play now and server leaderboards later.">
              <LiveEventPanel
                game={game}
                phase={liveEventPhase}
                leaderboard={liveEventLeaderboard}
                rank={liveEventRank}
                milestoneReady={liveEventMilestoneReady}
                milestoneClaimed={liveEventMilestoneClaimed}
                onToggleDeputy={toggleLiveEventDeputy}
                onClaim={claimLiveEventMilestone}
                onNavigate={setTab}
              />
            </Panel>
          )}

          {tab === "daily" && (
            <Panel title="Daily Street Orders" sub="Quick daily goals that give the player a reason to come back, make a few moves, and claim a reward.">
              <DailyOrdersPanel
                orders={dailyOrders}
                complete={dailyComplete}
                claimed={dailyClaimed}
                streak={game.dailyStreak || 0}
                reward={dailyReward}
                dateKey={ensureDailyState(game).dailyOrdersDate}
                onNavigate={setTab}
                onClaim={claimDailyOrdersReward}
              />
            </Panel>
          )}

          {tab === "heat" && (
            <Panel title="Street Heat" sub="Manage police pressure and keep your operation moving clean.">
              <HeatPanel
                heat={heat}
                tier={heatTier}
                payoutMultiplier={payoutMultiplier}
                cash={game.cash}
                energy={game.energy}
                crew={game.crew}
                level={game.level}
                onLayLow={layLow}
                onBribe={bribeOfficials}
                onDecoy={sendDecoyCrew}
              />
            </Panel>
          )}

          {tab === "campaign" && (
            <Panel title="Campaign" sub="Move chapter by chapter toward controlling the city and claim rewards when the work is done.">
              <CampaignProgressPanel
                chapters={campaignChapters}
                onClaim={claimCampaignReward}
                onNavigate={setTab}
              />
            </Panel>
          )}

          {tab === "skills" && (
            <Panel title="Boss Skills" sub="Spend skill points to shape how your boss grows. This turns XP and campaign rewards into permanent advantages.">
              <BossSkillsPanel
                game={game}
                stats={skillStats}
                attack={attack}
                defense={defense}
                income={income}
                onSpend={spendBossSkill}
              />
            </Panel>
          )}

          {tab === "market" && (
            <Panel title="Black Market" sub="Buy daily underworld favors and upgrade owned gear into stronger boss assets.">
              <BlackMarketPanel
                game={ensureBlackMarketState(game)}
                deals={blackMarketDeals}
                gearItems={gear}
                gearStats={gearStats}
                onBuyDeal={buyBlackMarketDeal}
                onBuyGear={buyGear}
                onUpgradeGear={upgradeGear}
              />
            </Panel>
          )}

          {tab === "safehouse" && (
            <Panel title="Safehouse" sub="Upgrade your base of operations and turn it into a real underworld headquarters.">
              <SafehousePanel
                game={game}
                rooms={safehouseRooms}
                stats={safehouseStats}
                onUpgrade={upgradeSafehouseRoom}
              />
            </Panel>
          )}

          {tab === "contacts" && (
            <Panel title="Underworld Contacts" sub="Build relationships that improve jobs, heat control, tribute, healing, front income, and vault work.">
              <ContactsPanel
                game={game}
                contacts={underworldContacts}
                stats={contactStats}
                onUpgrade={upgradeContact}
                onFavor={useContactFavor}
              />
            </Panel>
          )}

          {tab === "lieutenants" && (
            <Panel title="Lieutenants" sub="Recruit trusted crew leaders, promote them, and assign them to the part of the empire that needs help right now.">
              <LieutenantsPanel
                game={game}
                lieutenants={lieutenants}
                assignments={lieutenantAssignments}
                stats={lieutenantStats}
                onUpgrade={upgradeLieutenant}
                onAssign={assignLieutenant}
              />
            </Panel>
          )}

          {tab === "jobs" && (
            <Panel title="City Jobs" sub="Spend energy to earn cash, XP, and district control.">
              <div className="card-grid">
                {jobs.map((job) => (
                  <ArtCard key={job.id} title={job.name} image={job.image} tag={districtName(job.district)} desc={job.desc}>
                    <Info label="Energy" value={job.energy} />
                    <Info label="Payout" value={`${money(job.cash[0])} - ${money(job.cash[1])}`} />
                    <Info label="XP" value={job.xp} />
                    <button className="primary" onClick={() => runJob(job)}>
                      Run Job
                    </button>
                  </ArtCard>
                ))}
              </div>
            </Panel>
          )}

          {tab === "territory" && (
            <Panel title="District Control" sub="Take blocks, create strongholds, and collect tribute from districts where your name carries weight.">
              <TurfOperationsPanel
                cityControl={cityControl}
                controlledDistricts={controlledDistricts}
                strongholdDistricts={strongholdDistricts}
                nextTarget={nextTurfTarget}
                nextTargetControl={game.territory?.[nextTurfTarget.id] || 0}
              />

              <div className="card-grid">
                {districts.map((district) => {
                  const control = game.territory[district.id] || 0;
                  const tier = getControlTier(control);
                  const tribute = getDistrictTribute(district, control, bossClass.income, crewLoyalty, skillStats.tributeMultiplier);
                  const collection = getCollectionStatus(game, district.id);

                  return (
                    <Card key={district.id} title={district.name} tag={tier.label}>
                      <Progress label="Control" value={control} max={100} />
                      <p className="soft-text district-desc">{tier.desc}</p>
                      <Info label="Unlock Level" value={district.level} />
                      <Info label="Risk" value={district.risk} />
                      <Info label="Property Income" value={`${Math.round(tier.incomeBonus * 100)}%`} />
                      <Info label="Tribute" value={control >= 25 ? money(tribute) : "Needs 25% control"} />
                      <Info label="Tribute Status" value={control >= 25 ? collection.label : "Locked"} />
                      <div className="button-row compact-row">
                        <button className="primary" onClick={() => expandDistrict(district)}>
                          Expand
                        </button>
                        <button className="secondary" disabled={control < 25 || !collection.ready} onClick={() => collectDistrictTribute(district)}>
                          Collect Tribute
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === "crew" && (
            <Panel title="Crew & Gear" sub="Build your crew, spend skill points, and buy permanent upgrades.">
              <div className="mini-grid">
                <Stat label="Crew" value={game.crew} helper="members" />
                <Stat label="Loyalty" value={`${crewLoyalty}/100`} helper={crewStanding.label} />
                <Stat label="Respect" value={game.respect || 0} helper="street rep" />
                <Stat label="Skill Points" value={game.skillPoints} helper="unspent" />
              </div>

              <CrewOperationsPanel
                crew={game.crew}
                loyalty={crewLoyalty}
                standing={crewStanding}
                respect={game.respect || 0}
                recruitCost={recruitCrewCost}
                trainingCost={trainingCrewCost}
                payrollCost={payrollCrewCost}
                attackBonus={crewAttackBonus}
                defenseBonus={crewDefenseBonus}
                onRecruit={recruitCrew}
                onTrainMuscle={() => trainCrew("muscle")}
                onTrainLookouts={() => trainCrew("lookouts")}
                onPayCrew={payCrew}
              />

              <SkillQuickSpend
                skillPoints={game.skillPoints || 0}
                stats={skillStats}
                onOpen={() => setTab("skills")}
                onSpend={spendBossSkill}
              />

              <div className="card-grid">
                {gear.map((item) => {
                  const owned = Boolean(game.gear?.[item.id]);
                  const level = getGearLevel(game, item.id);
                  const nextCost = getGearUpgradeCost(item, Math.max(1, level));

                  return (
                    <ArtCard key={item.id} title={item.name} image={item.image} tag={item.type}>
                      <Info label="Cost" value={money(item.cost)} />
                      <Info label="Level" value={owned ? `${level}/5` : "Not owned"} />
                      <Info label="Attack" value={`+${owned ? getGearAttackValue(item, game) : item.attack}`} />
                      <Info label="Defense" value={`+${owned ? getGearDefenseValue(item, game) : item.defense}`} />
                      <Info label="Next Upgrade" value={owned && level < 5 ? `${money(nextCost.cash)} / ${nextCost.tribute} Tribute / ${nextCost.energy} Energy` : owned ? "Maxed" : "Buy first"} />
                      <div className="button-row compact-row">
                        <button className="primary" disabled={owned} onClick={() => buyGear(item)}>
                          {owned ? "Owned" : "Buy Gear"}
                        </button>
                        <button className="secondary" disabled={!owned || level >= 5} onClick={() => upgradeGear(item)}>
                          Upgrade
                        </button>
                      </div>
                    </ArtCard>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === "properties" && (
            <Panel title="Properties" sub="Buy fronts, upgrade them, and connect supply routes into a stronger money network.">
              <FrontNetworkPanel
                routes={supplyRoutes}
                game={game}
                stats={supplyStats}
                income={income}
                onActivate={activateSupplyRoute}
              />

              <div className="card-grid">
                {properties.map((property) => {
                  const owned = Number(game.properties?.[property.id] || 0);
                  const level = getPropertyLevel(game, property.id);
                  const currentIncome = getPropertyIncomeValue(property, game, bossClass.income);
                  const upgradeCost = getPropertyUpgradeCost(property, Math.max(1, level));
                  const upgradeEnergy = 6 + Math.max(1, level) * 2;
                  const control = game.territory?.[property.district] || 0;
                  const controlTier = getControlTier(control);

                  return (
                    <ArtCard key={property.id} title={property.name} image={property.image} tag={districtName(property.district)} desc={property.desc}>
                      <Info label="Owned" value={owned} />
                      <Info label="Front Level" value={level > 0 ? `${level}/5` : "Not owned"} />
                      <Info label="District Status" value={`${controlTier.label} • ${control}%`} />
                      <Info label="Cost" value={money(property.cost)} />
                      <Info label="Income" value={`${money(currentIncome)}/min`} />
                      <Info label="Next Upgrade" value={level > 0 && level < 5 ? `${money(upgradeCost)} / ${upgradeEnergy} Energy` : level >= 5 ? "Maxed" : "Buy first"} />
                      <div className="button-row compact-row">
                        <button className="primary" onClick={() => buyProperty(property)}>
                          Buy Property
                        </button>
                        <button className="secondary" disabled={level <= 0 || level >= 5} onClick={() => upgradeProperty(property)}>
                          Upgrade Front
                        </button>
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
                {rivals.map((rival) => {
                  const pressure = getRivalPressure(game, rival.id);
                  const tier = getRivalPressureTier(pressure);

                  return (
                    <ArtCard key={rival.id} title={rival.name} image={rival.image} tag={districtName(rival.district)}>
                      <Info label="Power" value={rival.power} />
                      <Info label="Reward" value={`${money(rival.reward[0])} - ${money(rival.reward[1])}`} />
                      <Info label="Status" value={game.beaten[rival.id] ? "Defeated" : "Open"} />
                      <Info label="Pressure" value={`${pressure}/100 ${tier.label}`} />
                      <Progress label="Revenge Pressure" value={pressure} max={100} />
                      <button className="danger" onClick={() => fightRival(rival)}>
                        Attack Rival
                      </button>
                    </ArtCard>
                  );
                })}
              </div>
            </Panel>
          )}

          {tab === "revenge" && (
            <Panel title="Revenge Log" sub="Rivals now remember your moves. Lower pressure before a crew hits back.">
              <RivalPressurePanel
                game={game}
                onSettle={settleRivalPressure}
                onBuyQuiet={buyQuiet}
              />
            </Panel>
          )}

          {tab === "vault" && (
            <Panel title="Vault Network" sub="Protect cash, upgrade storage, launder money back into play, and burn the paper trail when the city gets hot.">
              <VaultPanel
                game={game}
                stats={vaultStats}
                onDepositHalf={() => depositVault(0.5)}
                onDepositAll={() => depositVault(1)}
                onWithdraw={withdrawVault}
                onUpgrade={upgradeVaultSecurity}
                onLaunder={launderVaultCash}
                onBurnTrail={burnPaperTrail}
              />
            </Panel>
          )}

          {tab === "clinic" && (
            <Panel title="Clinic" sub="Patch yourself up before the next move.">
              <PageHero image="/art/pages/clinic.jpg" title="Backroom Clinic" desc="Health matters. A broke boss cannot hold the city." />
              <button className="danger" onClick={healBoss}>
                Heal Boss
              </button>
            </Panel>
          )}

          {tab === "wire" && (
            <Panel title="City Wire" sub="Scout temporary street leads and choose how your boss handles them.">
              <CityWirePanel
                game={game}
                activeEvent={activeStreetOpportunity}
                leadLabel={cityWireLeadLabel}
                expired={cityWireExpired}
                onScout={scoutStreetOpportunity}
                onResolve={resolveStreetOpportunity}
              />
            </Panel>
          )}

          {tab === "log" && (
            <Panel title="Activity Log" sub="Recent game actions.">
              <div className="log-list">
                {game.log.map((line, index) => (
                  <div key={`${line}-${index}`} className="log-item">
                    {line}
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {tab === "account" && (
            <Panel title="Account" sub="Manage sign-in, password, admin resets, and your boss picture or animated GIF.">
              <AccountPanel
                currentUser={currentUser}
                users={users}
                game={game}
                bossClass={bossClass}
                onDisplayName={updateCurrentDisplayName}
                onChangePassword={changeCurrentPassword}
                onAdminReset={adminResetPlayerPassword}
                onAdminCreate={adminCreatePlayerAccount}
                onImageFile={uploadGameProfileImage}
                onImageUrl={updateGameProfileImage}
                onLogout={signOut}
                onResetGame={resetGame}
              />
            </Panel>
          )}
        </section>

        <aside className="sidebar">
          <Panel title="Empire Status">
            <Info label="Build" value={APP_BUILD_LABEL} />
            <Info label="Boss Class" value={bossClass.name} />
            <Info label="Campaign" value={`${campaignClaimedCount}/${campaignChapters.length} chapters`} />
            <Info label="Daily Orders" value={dailyClaimed ? `Claimed • ${game.dailyStreak || 0} streak` : `${dailyOrders.filter((order) => order.done).length}/${dailyOrders.length} complete`} />
            <Info label="Concrete Pour" value={`${game.liveEventInfluence || 0} Influence / Rank #${liveEventRank}`} />
            <Info label="Event Phase" value={liveEventPhase.eventIsActive ? liveEventPhase.name : "Ended"} />
            <Info label="Skill Points" value={`${game.skillPoints || 0} unspent / ${skillStats.totalRanks} ranks`} />
            <Info label="Black Market" value={`${game.marketRep || 0} rep / ${Object.values(ensureBlackMarketState(game).blackMarketDeals || {}).filter(Boolean).length} deals today`} />
            <Info label="Safehouse" value={`${safehouseStats.totalLevels}/20 room levels`} />
            <Info label="Contacts" value={`${contactStats.unlockedCount}/${underworldContacts.length} unlocked • ${contactStats.totalLevels} trust`} />
            <Info label="Lieutenants" value={`${lieutenantStats.unlockedCount}/${lieutenants.length} unlocked • ${lieutenantStats.assignedCount} assigned`} />
            <Info label="Vault Network" value={`Level ${vaultStats.level}/5 • ${money(vaultStats.protectedCash)} protected`} />
            <Info label="Laundered Cash" value={money(vaultStats.launderedCash)} />
            <Info label="Gear" value={`${gearStats.ownedCount} owned / ${gearStats.upgradedCount} upgraded`} />
            <Info label="Starting District" value={districtName(game.startingDistrictId || "docks")} />
            <Info label="Heat" value={`${heat}/100 ${heatTier.label}`} />
            <Info label="Respect" value={game.respect || 0} />
            <Info label="Crew Loyalty" value={`${crewLoyalty}/100 ${crewStanding.label}`} />
            <Info label="City Control" value={`${cityControl}%`} />
            <Info label="Strongholds" value={strongholdDistricts} />
            <Info label="Owned Districts" value={controlledDistricts} />
            <Info label="Income" value={`${money(income)}/min`} />
            <Info label="Fronts" value={`${ownedPropertyCount} owned / ${upgradedFrontCount} upgraded`} />
            <Info label="Supply Routes" value={`${supplyStats.activeCount} active`} />
            <Info label="Top Rival Threat" value={topRivalThreat ? `${topRivalThreat.rival.name} ${topRivalThreat.pressure}/100` : "Quiet"} />
            <Info label="Crew" value={game.crew} />
            <Info label="Wins" value={game.wins} />
            <Info label="Losses" value={game.losses} />
            <Info label="Attack" value={attack} />
            <Info label="Defense" value={defense} />
            <Info label="Crew Attack Bonus" value={`+${crewAttackBonus}`} />
            <Info label="Crew Defense Bonus" value={`+${crewDefenseBonus}`} />
            <Info label="Lt. Attack/Defense" value={`+${lieutenantStats.attackBonus}/+${lieutenantStats.defenseBonus}`} />
          </Panel>

          <Panel title="Boss Bonus">
            <p className="soft-text">{bossClass.perk}</p>
          </Panel>

          <Panel title="District Control">
            {districts.map((district) => (
              <Progress key={district.id} label={district.name} value={game.territory[district.id] || 0} max={100} />
            ))}
          </Panel>

          <button className="reset" onClick={resetGame}>
            Reset Prototype Save
          </button>
        </aside>
      </main>

      <nav className="bottom-nav">
        {[
          ["command", "Home"],
          ["daily", "Daily"],
          ["event", "Event"],
          ["jobs", "Jobs"],
          ["territory", "Turf"],
          ["rivals", "Fight"],
          ["heat", "Heat"],
          ["crew", "Crew"],
          ["market", "Market"],
          ["safehouse", "Base"],
          ["contacts", "Contacts"],
          ["lieutenants", "Lts"],
          ["vault", "Vault"],
          ["account", "Acct"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>
            {label}
          </button>
        ))}
      </nav>
    </div>
    </>
  );
}

function InstallPromptBanner({ visible, mode, onInstall, onDismiss }) {
  if (!visible) return null;

  const isIos = mode === "ios";

  return (
    <div className="install-prompt-banner" role="dialog" aria-label="Install Shadow Syndicate">
      <div className="install-prompt-icon-wrap">
        <img src="/icon-192.png" alt="Shadow Syndicate app icon" className="install-prompt-icon" />
      </div>
      <div className="install-prompt-copy">
        <span className="install-kicker">Install Shadow Syndicate</span>
        <strong>Put the city on your home screen.</strong>
        <p>
          {isIos
            ? "Add the game to your home screen. Tap Share, then tap Add to Home Screen for a full app-style launch."
            : "Install the game for a faster launch, a cleaner full-screen feel, and a real app icon on your phone or desktop."}
        </p>
      </div>
      <div className="install-prompt-actions">
        <button type="button" className="primary compact-button" onClick={onInstall}>
          {isIos ? "Got It" : "Install"}
        </button>
        <button type="button" className="secondary compact-button" onClick={onDismiss}>
          Not Now
        </button>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder = "Password", autoComplete = "current-password" }) {
  const [show, setShow] = useState(false);

  return (
    <label>
      {label}
      <div className="password-wrap">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-eye-button"
          onClick={() => setShow((old) => !old)}
          aria-label={show ? "Hide password" : "Show password"}
          title={show ? "Hide password" : "Show password"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z" />
            <circle cx="12" cy="12" r="3.15" />
            {show && <path className="eye-slash" d="M4.5 4.5 19.5 19.5" />}
          </svg>
        </button>
      </div>
    </label>
  );
}

function AuthScreen({ users, onSignIn, onCreateAccount, onResetPassword }) {
  const [mode, setMode] = useState("signin");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const title = mode === "signin" ? "Sign In" : mode === "create" ? "Create Account" : "Reset Password";
  const helper = mode === "signin"
    ? "Sign in before entering the city. This keeps player saves separated on this device."
    : mode === "create"
      ? "Create your boss profile, lock in your save, and step into the city like a future kingpin."
      : "Use your recovery PIN to reset your own password.";

  function submit(event) {
    event.preventDefault();
    setMessage("");

    const result = mode === "signin"
      ? onSignIn(username, password)
      : mode === "create"
        ? onCreateAccount({ username, displayName, password, confirmPassword, pin })
        : onResetPassword({ username, pin, newPassword, confirmPassword: confirmNewPassword });

    if (result) setMessage(result);
  }

  const featureCallouts = [
    { title: "Run Jobs", text: "Earn cash, XP, and street control." },
    { title: "Control Turf", text: "Take districts block by block." },
    { title: "Build Fronts", text: "Turn properties into an empire." },
    { title: "Crush Rivals", text: "Fight pressure before it fights you." },
  ];

  return (
    <div className="start-page auth-page cinematic-auth-page">
      <div className="auth-atmosphere" aria-hidden="true">
        <span className="city-glow city-glow-one" />
        <span className="city-glow city-glow-two" />
        <span className="rain-line rain-line-one" />
        <span className="rain-line rain-line-two" />
        <span className="rain-line rain-line-three" />
      </div>
      <div className="auth-shell">
        <section className="start-hero auth-hero" aria-label="Shadow Syndicate sign in">
          <div className="auth-brand-lockup">
            <img src="/logo-shadow-syndicate.png" alt="Shadow Syndicate" className="brand-logo" />
            <p className="tagline">Build your crew. Take the streets. Own the city.</p>
          </div>

          <div className="auth-world-card">
            <div className="auth-world-art" role="img" aria-label="A lone underworld boss overlooking the city from a rooftop at night" />
            <div className="auth-world-copy">
              <p className="kicker">Enter the underworld</p>
              <h1>Enter the city. Build your crew. Make the streets remember your name.</h1>
              <p>
                Run jobs, control districts, build fronts, crush rivals, and rise through the underworld.
              </p>
            </div>
          </div>

          <div className="auth-feature-grid" aria-label="Shadow Syndicate game features">
            {featureCallouts.map((feature) => (
              <article key={feature.title} className="auth-feature-card">
                <strong>{feature.title}</strong>
                <span>{feature.text}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel auth-panel">
          <div className="login-panel-art" aria-label="Shadow Syndicate rooftop city underworld artwork">
            <img src="/login-panel-premium.png" alt="Shadow boss overlooking the city at night" />
            <div className="login-panel-art-overlay" />
            <div className="login-panel-art-copy">
              <span>Shadow Syndicate</span>
              <strong>Own the night.</strong>
            </div>
          </div>
          <div className="setup-heading">
            <div>
              <p className="kicker">Player Access</p>
              <h2>{title}</h2>
            </div>
            <span>{APP_PHASE} • {Object.keys(users || {}).length} Accounts</span>
          </div>

          <p className="soft-text">{helper}</p>

          <form className="auth-form" onSubmit={submit}>
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="player name" autoComplete="username" />
            </label>

            {mode === "create" && (
              <label>
                Display Name
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="what people see" />
              </label>
            )}

            {mode !== "reset" && (
              <PasswordField label="Password" value={password} onChange={setPassword} autoComplete={mode === "create" ? "new-password" : "current-password"} />
            )}

            {mode === "create" && (
              <>
                <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="type it again" autoComplete="new-password" />
                <label>
                  Recovery PIN
                  <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="4 digits you can remember" inputMode="numeric" />
                </label>
              </>
            )}

            {mode === "reset" && (
              <>
                <label>
                  Recovery PIN
                  <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="your recovery PIN" inputMode="numeric" />
                </label>
                <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
                <PasswordField label="Confirm New Password" value={confirmNewPassword} onChange={setConfirmNewPassword} placeholder="type it again" autoComplete="new-password" />
              </>
            )}

            {message && <p className={message.includes("reset") || message.includes("updated") ? "setup-success" : "setup-error"}>{message}</p>}

            <button className="primary big" type="submit">
              {mode === "signin" ? "Sign In" : mode === "create" ? "Create Account" : "Reset Password"}
            </button>
          </form>

          <div className="auth-switch-row">
            <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setMessage(""); }}>
              Sign In
            </button>
            <button type="button" className={mode === "create" ? "active" : ""} onClick={() => { setMode("create"); setMessage(""); }}>
              New Player
            </button>
            <button type="button" className={mode === "reset" ? "active" : ""} onClick={() => { setMode("reset"); setMessage(""); }}>
              Forgot Password
            </button>
          </div>

          <div className="auth-admin-note">
            <strong>Prototype admin login:</strong> admin / admin123. Admin recovery PIN: 0000. Change it after you sign in.<br />
            <strong>Build check:</strong> You should see Phase 1.25 on this screen. If not, the wrong folder is running.
          </div>
        </section>
      </div>
    </div>
  );
}

function AccountPanel({ currentUser, users, game, bossClass, onDisplayName, onChangePassword, onAdminReset, onAdminCreate, onImageFile, onImageUrl, onLogout, onResetGame }) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [imageUrl, setImageUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createDisplayName, setCreateDisplayName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createPin, setCreatePin] = useState("");
  const [message, setMessage] = useState("");

  function showMessage(result) {
    if (result) setMessage(result);
  }

  return (
    <div className="account-panel">
      <section className="account-hero-card">
        <img src={game.profileImage || bossClass.image} alt="Boss profile" />
        <div>
          <p className="kicker">Signed In</p>
          <h3>{currentUser?.displayName || currentUser?.username}</h3>
          <p className="soft-text">Username: {currentUser?.username} • Role: {currentUser?.role || "player"}</p>
          <p className="soft-text">Running: {APP_BUILD_LABEL}</p>
        </div>
      </section>

      {currentUser?.mustResetPassword && (
        <p className="setup-error">You are using a temporary password. Change it here before continuing.</p>
      )}

      {message && <p className={message.includes("updated") || message.includes("reset") || message.includes("created") ? "setup-success" : "setup-error"}>{message}</p>}

      <div className="account-grid">
        <section className="account-box">
          <h3>Profile Picture / GIF</h3>
          <p className="soft-text">Upload a picture, animated GIF, or paste an image/GIF URL.</p>
          <input className="file-input full" type="file" accept="image/*,.gif" onChange={(e) => showMessage(onImageFile(e.target.files?.[0]))} />
          <label>
            Image or GIF URL
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/boss.gif" />
          </label>
          <button className="secondary" type="button" onClick={() => showMessage(onImageUrl(imageUrl))}>
            Use Image URL
          </button>
        </section>

        <section className="account-box">
          <h3>Player Name</h3>
          <label>
            Display Name
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="display name" />
          </label>
          <button className="secondary" type="button" onClick={() => showMessage(onDisplayName(displayName))}>
            Save Display Name
          </button>
        </section>

        <section className="account-box">
          <h3>Change My Password</h3>
          <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
          <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
          <PasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="type it again" autoComplete="new-password" />
          <button className="secondary" type="button" onClick={() => showMessage(onChangePassword({ currentPassword, newPassword, confirmPassword }))}>
            Change Password
          </button>
        </section>

        {currentUser?.role === "admin" && (
          <>
            <section className="account-box admin-box">
              <h3>Admin Password Reset</h3>
              <p className="soft-text">Reset a player's password from inside the game. The player will be forced to change the temporary password after signing in.</p>
              <label>
                Player Username
                <select value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)}>
                  <option value="">Choose player</option>
                  {Object.values(users || {}).map((user) => (
                    <option key={user.username} value={user.username}>{user.username} • {user.role}</option>
                  ))}
                </select>
              </label>
              <PasswordField label="Temporary Password" value={adminPassword} onChange={setAdminPassword} autoComplete="new-password" />
              <button className="danger" type="button" onClick={() => showMessage(onAdminReset({ username: adminUsername, newPassword: adminPassword }))}>
                Admin Reset Password
              </button>
            </section>

            <section className="account-box admin-box">
              <h3>Create Player Account</h3>
              <p className="soft-text">Create a local prototype player account from the admin screen.</p>
              <label>
                Username
                <input value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} placeholder="new player username" />
              </label>
              <label>
                Display Name
                <input value={createDisplayName} onChange={(e) => setCreateDisplayName(e.target.value)} placeholder="what they see in game" />
              </label>
              <PasswordField label="Temporary Password" value={createPassword} onChange={setCreatePassword} autoComplete="new-password" />
              <label>
                Recovery PIN
                <input value={createPin} onChange={(e) => setCreatePin(e.target.value)} placeholder="4 digit PIN" inputMode="numeric" />
              </label>
              <button className="secondary" type="button" onClick={() => showMessage(onAdminCreate({ username: createUsername, displayName: createDisplayName, password: createPassword, pin: createPin }))}>
                Create Player
              </button>
            </section>

            <section className="account-box admin-box player-directory-box">
              <h3>Admin Player Directory</h3>
              <p className="soft-text">Quick check for who exists on this local prototype build.</p>
              <div className="player-directory">
                {Object.values(users || {}).map((user) => (
                  <div key={user.username} className="player-directory-row">
                    <div>
                      <strong>{user.displayName || user.username}</strong>
                      <span>{user.username} • {user.role || "player"}</span>
                    </div>
                    <small>{user.mustResetPassword ? "Temp password" : user.lastLoginAt ? `Last login ${new Date(user.lastLoginAt).toLocaleDateString()}` : "Never logged in"}</small>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <div className="button-row account-actions">
        <button className="secondary" type="button" onClick={onLogout}>Sign Out</button>
        <button className="reset" type="button" onClick={onResetGame}>Reset This Save</button>
      </div>
    </div>
  );
}


function LiveEventSummaryCard({ game, phase, rank, milestoneReady, milestoneClaimed, onOpen, onClaim }) {
  const influence = Number(game.liveEventInfluence || 0);
  const progress = Math.min(100, Math.round((influence / liveEvent.milestoneInfluence) * 100));

  return (
    <section className={`live-event-summary ${phase.eventIsActive ? "active" : "ended"}`}>
      <div>
        <p className="kicker">72-Hour Live Event</p>
        <h3>{liveEvent.shortName}: {phase.eventIsActive ? phase.name : "Ended"}</h3>
        <p>{phase.eventIsActive ? phase.rule : "The current Concrete Pour has ended. Keep the structure ready for the next live event."}</p>
      </div>

      <div className="event-mini-stats">
        <span>Influence <strong>{influence}</strong></span>
        <span>Rank <strong>#{rank}</strong></span>
        <span>Time <strong>{formatEventTime(phase.eventEndsAt - Date.now())}</strong></span>
      </div>

      <div className="event-progress-wrap">
        <div className="bar"><i style={{ width: `${progress}%` }} /></div>
        <small>{milestoneClaimed ? "Milestone claimed" : `${influence}/${liveEvent.milestoneInfluence} milestone Influence`}</small>
      </div>

      <div className="event-summary-actions">
        <button className="secondary" type="button" onClick={onOpen}>Open Event</button>
        <button className="primary" type="button" disabled={!milestoneReady || milestoneClaimed} onClick={onClaim}>
          {milestoneClaimed ? "Claimed" : milestoneReady ? "Claim Milestone" : "Not Ready"}
        </button>
      </div>
    </section>
  );
}

function LiveEventPanel({ game, phase, leaderboard, rank, milestoneReady, milestoneClaimed, onToggleDeputy, onClaim, onNavigate }) {
  const influence = Number(game.liveEventInfluence || 0);
  const progress = Math.min(100, Math.round((influence / liveEvent.milestoneInfluence) * 100));

  return (
    <div className="live-event-panel">
      <section className="live-event-hero">
        <img src="/art/chapters/first-blood-southside.jpg" alt="Concrete Pour Southside" />
        <div>
          <p className="kicker">{liveEvent.name}</p>
          <h3>Prep the forms. Pour the street. Let Southside cure under your name.</h3>
          <p>
            This is a prototype live-ops event. Southside actions build Influence, the event changes phases over 72 hours, and the leaderboard shows how the system will work before we add a server.
          </p>
        </div>
      </section>

      <section className="live-event-status-grid">
        <div className="event-status-card">
          <span>Current Phase</span>
          <strong>{phase.eventIsActive ? phase.name : "Ended"}</strong>
          <small>{phase.eventIsActive ? phase.rule : "Waiting for next event"}</small>
        </div>
        <div className="event-status-card">
          <span>Time Left</span>
          <strong>{formatEventTime(phase.eventEndsAt - Date.now())}</strong>
          <small>72-hour event timer</small>
        </div>
        <div className="event-status-card">
          <span>Your Influence</span>
          <strong>{influence}</strong>
          <small>Rank #{rank} right now</small>
        </div>
        <div className="event-status-card">
          <span>Deputy Crew</span>
          <strong>{game.liveEventDeputized ? "Assigned" : "None"}</strong>
          <small>{game.liveEventDeputized ? "+5% Influence / -1 fight crew" : "Assign 1 crew for bonus Influence"}</small>
        </div>
      </section>

      <section className="event-milestone-card">
        <div>
          <p className="kicker">Milestone Reward</p>
          <h3>{milestoneClaimed ? "Reward Claimed" : milestoneReady ? "Reward Ready" : "Reach 500 Influence"}</h3>
          <p>Claiming the local milestone gives $1,500, +100 Tribute, +5 Respect, and +2 Skill Points. No crates, no pay-to-win shortcut.</p>
          <div className="bar"><i style={{ width: `${progress}%` }} /></div>
          <small>{influence}/{liveEvent.milestoneInfluence} Influence</small>
        </div>
        <button className="primary" disabled={!milestoneReady || milestoneClaimed} onClick={onClaim}>
          {milestoneClaimed ? "Already Claimed" : milestoneReady ? "Claim Reward" : "Keep Building"}
        </button>
      </section>

      <section className="event-action-row">
        <button className={game.liveEventDeputized ? "secondary" : "primary"} type="button" onClick={onToggleDeputy}>
          {game.liveEventDeputized ? "Remove Deputy" : "Deputize Crew"}
        </button>
        <button className="secondary" type="button" onClick={() => onNavigate("jobs")}>Run Southside Jobs</button>
        <button className="secondary" type="button" onClick={() => onNavigate("territory")}>Work Southside Turf</button>
        <button className="secondary" type="button" onClick={() => onNavigate("properties")}>Build Fronts</button>
      </section>

      <section className="event-phase-grid">
        {liveEvent.phases.map((item) => (
          <div key={item.id} className={`event-phase-card ${phase.id === item.id && phase.eventIsActive ? "active" : ""}`}>
            <span>{item.startsAtHour}-{item.endsAtHour} hr</span>
            <strong>{item.name}</strong>
            <small>{item.rule}</small>
          </div>
        ))}
      </section>

      <section className="event-leaderboard">
        <div className="card-head">
          <div>
            <h3>Southside Influence Leaderboard</h3>
            <p>Local prototype leaderboard. This same idea can later move to Supabase for real player rankings.</p>
          </div>
          <span>Top 100 split {liveEvent.prizePoolTribute.toLocaleString()} Tribute</span>
        </div>
        <div className="log-list">
          {leaderboard.map((row) => (
            <div key={row.bossName} className={`log-item ${row.isPlayer ? "player-event-row" : ""}`}>
              <div className="event-rank-row">
                <strong>#{row.rank} {row.bossName}{row.isPlayer ? " (You)" : ""}</strong>
                <span>{row.influence.toLocaleString()} Influence</span>
              </div>
              <small>Projected tribute: {row.projectedTribute.toLocaleString()}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CityWireSummaryCard({ activeEvent, leadLabel, expired, resolved, onOpen, onScout }) {
  return (
    <section className={`city-wire-summary ${activeEvent ? "active" : expired ? "expired" : "empty"}`}>
      <div>
        <p className="kicker">City Wire</p>
        <h3>{activeEvent ? activeEvent.title : expired ? "Lead Went Cold" : "No Active Lead"}</h3>
        <p>Scout short street opportunities for cash, respect, lower Heat, or pressure control.</p>
      </div>
      <div className="wire-mini-stats">
        <span>Status <strong>{leadLabel}</strong></span>
        <span>Resolved <strong>{resolved}</strong></span>
      </div>
      <div className="wire-summary-actions">
        <button className="primary" type="button" onClick={activeEvent ? onOpen : onScout}>
          {activeEvent ? "Open Lead" : "Scout Lead"}
        </button>
        <button className="secondary" type="button" onClick={onOpen}>City Wire</button>
      </div>
    </section>
  );
}

function CityWirePanel({ game, activeEvent, leadLabel, expired, onScout, onResolve }) {
  return (
    <div className="city-wire-panel">
      <PageHero
        image="/art/pages/city-wire.jpg"
        title="Street Leads"
        desc="The City Wire now gives the player short opportunities with a timer. Scout a lead, choose how to handle it, then deal with the reward and risk."
      />

      <div className={`street-lead-card ${activeEvent ? "active" : expired ? "expired" : "empty"}`}>
        <div className="street-lead-head">
          <div>
            <p className="kicker">Current Lead</p>
            <h3>{activeEvent ? activeEvent.title : expired ? "Lead Expired" : "No Lead Active"}</h3>
            <p>
              {activeEvent
                ? activeEvent.desc
                : expired
                  ? "That opportunity went cold. Scout the wire again for a fresh move."
                  : "Spend 5 Energy to scout the city for a temporary opportunity."}
            </p>
          </div>
          <div className="street-lead-status">
            <span>Status</span>
            <strong>{leadLabel}</strong>
            <small>{game.cityWireResolved || 0} resolved</small>
          </div>
        </div>

        {activeEvent ? (
          <>
            <img className="street-lead-image" src={activeEvent.image} alt={activeEvent.title} />
            <div className="street-choice-grid">
              {activeEvent.options.map((option) => (
                <Card key={option.id} title={option.label} tag={activeEvent.tag} desc={option.desc}>
                  <Info label="Cost" value={getStreetOpportunityCost(option)} />
                  <Info label="Reward" value={getStreetOpportunityReward(option)} />
                  <Info label="Risk" value={option.heat ? `Heat +${option.heat}` : option.heatReduction ? "Lowers Heat" : "Low"} />
                  <button className="primary" type="button" onClick={() => onResolve(activeEvent.id, option.id)}>
                    Take This Move
                  </button>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="street-scout-box">
            <Info label="Scout Cost" value="5 Energy" />
            <Info label="Current Energy" value={`${game.energy}/${game.maxEnergy}`} />
            <Info label="Current Heat" value={`${game.heat || 0}/100`} />
            <button className="primary" type="button" onClick={onScout}>Scout the Wire</button>
          </div>
        )}
      </div>
    </div>
  );
}

function DailyOrdersSummaryCard({ orders, complete, claimed, streak, reward, onOpen, onClaim }) {
  const doneCount = orders.filter((order) => order.done).length;

  return (
    <section className={`daily-summary ${claimed ? "claimed" : complete ? "ready" : "open"}`}>
      <div>
        <p className="kicker">Daily Street Orders</p>
        <h3>{claimed ? "Orders Claimed" : complete ? "Reward Ready" : `${doneCount}/${orders.length} Orders Complete`}</h3>
        <p>Small daily goals give the player a reason to run a few jobs, move turf, handle crew business, and keep coming back.</p>
      </div>
      <div className="daily-mini-stats">
        <span>Streak <strong>{streak}</strong></span>
        <span>Reward <strong>{money(reward.cash)}</strong></span>
        <span>Energy <strong>+{reward.energy}</strong></span>
        <span>Respect <strong>+{reward.respect}</strong></span>
      </div>
      <div className="daily-summary-actions">
        <button className="secondary" type="button" onClick={onOpen}>Open Daily</button>
        <button className="primary" type="button" disabled={!complete || claimed} onClick={onClaim}>
          {claimed ? "Claimed" : complete ? "Claim Reward" : "Not Ready"}
        </button>
      </div>
    </section>
  );
}

function DailyOrdersPanel({ orders, complete, claimed, streak, reward, dateKey, onNavigate, onClaim }) {
  const doneCount = orders.filter((order) => order.done).length;

  return (
    <div className="daily-orders-panel">
      <section className={`daily-orders-head ${claimed ? "claimed" : complete ? "ready" : "open"}`}>
        <div>
          <p className="kicker">Today's Work</p>
          <h3>{claimed ? "Street Orders Complete" : complete ? "Reward Ready" : "Clear the Board"}</h3>
          <p>These reset each day. They are short on purpose so the first few minutes of play always have a clear direction.</p>
        </div>
        <div className="daily-score-card">
          <span>{dateKey}</span>
          <strong>{doneCount}/{orders.length}</strong>
          <small>{claimed ? `Claimed • ${streak} streak` : complete ? "ready to claim" : "orders complete"}</small>
        </div>
      </section>

      <div className="daily-order-grid">
        {orders.map((order) => (
          <button key={order.id} className={`daily-order ${order.done ? "done" : "open"}`} type="button" onClick={() => onNavigate(order.action)}>
            <span>{order.done ? "Done" : "Order"}</span>
            <strong>{order.label}</strong>
            <small>{Math.min(order.current, order.target)}/{order.target}</small>
            <div className="bar"><i style={{ width: `${Math.min(100, Math.round((order.current / order.target) * 100))}%` }} /></div>
          </button>
        ))}
      </div>

      <section className="daily-reward-card">
        <div>
          <p className="kicker">Daily Reward</p>
          <h3>{money(reward.cash)} • +{reward.energy} Energy • +{reward.respect} Respect{reward.skillPoints ? " • +1 Skill Point" : ""}</h3>
          <p>Every claimed day builds the streak. Every third streak day adds a bonus skill point.</p>
        </div>
        <button className="primary" disabled={!complete || claimed} onClick={onClaim}>
          {claimed ? "Reward Claimed" : complete ? "Claim Daily Reward" : "Finish Orders First"}
        </button>
      </section>
    </div>
  );
}

function SkillSummaryCard({ skillPoints, stats, onOpen }) {
  return (
    <section className="skill-summary">
      <div>
        <p className="kicker">Boss Growth</p>
        <h3>{skillPoints} Skill Point{skillPoints === 1 ? "" : "s"} Ready</h3>
        <p>Spend points to make your boss stronger instead of only watching numbers go up after level gains.</p>
      </div>
      <div className="skill-mini-stats">
        <span>Ranks <strong>{stats.totalRanks}</strong></span>
        <span>Income <strong>+{Math.round((stats.jobIncomeMultiplier - 1) * 100)}%</strong></span>
        <span>Heat Cut <strong>-{stats.heatReduction}</strong></span>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>
        Open Skills
      </button>
    </section>
  );
}

function SkillQuickSpend({ skillPoints, stats, onOpen, onSpend }) {
  return (
    <section className="skill-quick-spend">
      <div>
        <p className="kicker">Boss Skills</p>
        <h3>{skillPoints} Unspent Skill Point{skillPoints === 1 ? "" : "s"}</h3>
        <p>Quick spend your main combat skills here or open the full Boss Skills screen for all tracks.</p>
      </div>
      <div className="button-row compact-row">
        <button className="primary" disabled={skillPoints <= 0 || stats.attackRank >= 10} onClick={() => onSpend("attackSkill")}>Add Muscle</button>
        <button className="primary" disabled={skillPoints <= 0 || stats.defenseRank >= 10} onClick={() => onSpend("defenseSkill")}>Add Protection</button>
        <button className="secondary" onClick={onOpen}>Open Full Skills</button>
      </div>
    </section>
  );
}

function BossSkillsPanel({ game, stats, attack, defense, income, onSpend }) {
  return (
    <div className="boss-skills-panel">
      <section className="skill-ops-head">
        <div>
          <p className="kicker">Permanent Growth</p>
          <h3>{game.skillPoints || 0} Skill Point{Number(game.skillPoints || 0) === 1 ? "" : "s"} Available</h3>
          <p>Leveling up and campaign rewards now matter more. Skill points can improve fighting, income, heat control, tribute, and energy capacity.</p>
        </div>
        <div className="skill-score-card">
          <span>Total Ranks</span>
          <strong>{stats.totalRanks}</strong>
          <small>Boss build progress</small>
        </div>
      </section>

      <div className="skill-effects-grid">
        <Stat label="Attack" value={attack} helper={`+${stats.attackBonus} skills`} />
        <Stat label="Defense" value={defense} helper={`+${stats.defenseBonus} skills`} />
        <Stat label="Job Cash" value={`${Math.round(stats.jobIncomeMultiplier * 100)}%`} helper="operations" />
        <Stat label="Front Income" value={money(income)} helper={`${Math.round(stats.frontIncomeMultiplier * 100)}% skill rate`} />
        <Stat label="Tribute" value={`${Math.round(stats.tributeMultiplier * 100)}%`} helper="influence" />
        <Stat label="Heat Cut" value={`-${stats.heatReduction}`} helper="low profile" />
      </div>

      <div className="skill-track-grid">
        {bossSkills.map((skill) => {
          const rank = getSkillLevel(game, skill.id);
          const maxed = rank >= skill.max;
          const canSpend = Number(game.skillPoints || 0) > 0 && !maxed;

          return (
            <Card key={skill.id} title={skill.name} tag={`${rank}/${skill.max}`} desc={skill.desc}>
              <Progress label="Rank" value={rank} max={skill.max} />
              <Info label="Focus" value={skill.short} />
              <Info label="Effect" value={skill.effect} />
              <button className="primary" disabled={!canSpend} onClick={() => onSpend(skill.id)}>
                {maxed ? "Maxed" : "Spend 1 Skill Point"}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CampaignSummaryCard({ chapter, completeCount, totalCount, onOpen }) {
  const doneCount = chapter?.requirements?.filter((item) => item.done).length || 0;
  const totalRequirements = chapter?.requirements?.length || 0;

  return (
    <div className="campaign-summary">
      <div>
        <p className="kicker">Story Progress</p>
        <h3>{chapter?.title || "Campaign Complete"}</h3>
        <p>
          {chapter?.claimed
            ? "All current campaign chapters are claimed. More city story can be added in the next phase."
            : chapter?.unlocked
              ? `${doneCount}/${totalRequirements} goals complete. Keep pushing the story forward.`
              : "Finish the previous chapter to unlock the next move."}
        </p>
      </div>
      <div className="campaign-mini-stats">
        <span>Chapters <strong>{completeCount}/{totalCount}</strong></span>
        <span>Current <strong>{chapter?.claimed ? "Complete" : chapter?.unlocked ? "Open" : "Locked"}</strong></span>
      </div>
      <button className="secondary" onClick={onOpen}>Open Campaign</button>
    </div>
  );
}

function CampaignProgressPanel({ chapters, onClaim, onNavigate }) {
  return (
    <div className="campaign-panel">
      <div className="campaign-panel-head">
        <div>
          <h3>Story Chapters</h3>
          <p>
            These chapters give the player a clear path. Finish the listed goals, claim the reward, and unlock the next push into the city.
          </p>
        </div>
        <div className="campaign-score">
          <span>Progress</span>
          <strong>{chapters.filter((chapter) => chapter.claimed).length}/{chapters.length}</strong>
          <small>chapters claimed</small>
        </div>
      </div>

      <div className="chapter-grid">
        {chapters.map((chapter, index) => {
          const doneCount = chapter.requirements.filter((item) => item.done).length;
          const total = chapter.requirements.length;

          return (
            <div key={chapter.id} className={`chapter-card ${chapter.claimed ? "claimed" : chapter.unlocked ? "open" : "locked"}`}>
              <img src={chapter.image} alt={chapter.title} />
              <div className="chapter-body">
                <div className="chapter-title-row">
                  <div>
                    <p className="kicker">Chapter {index + 1}</p>
                    <h3>{chapter.title}</h3>
                  </div>
                  <span>{chapter.claimed ? "Claimed" : chapter.unlocked ? `${doneCount}/${total}` : "Locked"}</span>
                </div>
                <p>{chapter.desc}</p>

                <div className="chapter-reward">
                  <small>Reward</small>
                  <strong>{chapter.rewardText}</strong>
                </div>

                <div className="chapter-goals">
                  {chapter.requirements.map((requirement) => (
                    <button
                      key={requirement.label}
                      type="button"
                      className={requirement.done ? "done" : "open"}
                      disabled={!chapter.unlocked}
                      onClick={() => onNavigate(requirement.action)}
                    >
                      <span>{requirement.done ? "Done" : "Goal"}</span>
                      <strong>{requirement.label}</strong>
                    </button>
                  ))}
                </div>

                <button
                  className="primary"
                  disabled={!chapter.unlocked || !chapter.complete || chapter.claimed}
                  onClick={() => onClaim(chapter.id)}
                >
                  {chapter.claimed ? "Reward Claimed" : chapter.unlocked ? "Claim Chapter Reward" : "Locked"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RivalPressureSummaryCard({ topThreat, totalPressure, onOpen }) {
  const pressure = topThreat?.pressure || 0;
  const tier = topThreat?.tier || getRivalPressureTier(0);
  const rivalName = topThreat?.rival?.name || "No active rival";

  return (
    <section className={`rival-summary rival-${tier.tone}`}>
      <div>
        <p className="kicker">Rival Pressure</p>
        <h3>{rivalName}</h3>
        <p>{pressure > 0 ? tier.desc : "The street is quiet for now, but every job, fight, and tribute collection can create payback."}</p>
      </div>
      <div className="rival-mini-meter">
        <strong>{pressure}/100</strong>
        <div className="bar">
          <i style={{ width: `${pressure}%` }} />
        </div>
        <small>Total pressure: {totalPressure}</small>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>
        Open Revenge Log
      </button>
    </section>
  );
}

function RivalPressurePanel({ game, onSettle, onBuyQuiet }) {
  const topThreat = getTopRivalPressure(game);
  const recentLog = game.revengeLog || [];

  return (
    <div className="rival-pressure-panel">
      <PageHero
        image="/art/pages/revenge-log.jpg"
        title="Rival Payback"
        desc="When you take turf, collect tribute, buy fronts, or beat crews, rival pressure rises. If it gets too high, they can hit back and cost you cash, health, or control."
      />

      <section className={`rival-pressure-head rival-${topThreat?.tier?.tone || "quiet"}`}>
        <div>
          <p className="kicker">Highest Threat</p>
          <h3>{topThreat?.rival?.name || "Quiet Streets"}</h3>
          <p>{topThreat?.tier?.desc || "No major revenge pressure right now."}</p>
        </div>
        <div className="rival-threat-score">
          <span>Pressure</span>
          <strong>{topThreat?.pressure || 0}/100</strong>
          <small>{topThreat?.tier?.label || "Quiet"}</small>
        </div>
      </section>

      <div className="rival-grid">
        {rivals.map((rival) => {
          const pressure = getRivalPressure(game, rival.id);
          const tier = getRivalPressureTier(pressure);
          const quietCost = 350 + Number(game.level || 1) * 90 + pressure * 8;

          return (
            <Card key={rival.id} title={rival.name} tag={tier.label} desc={`${getDistrictName(rival.district)} rival crew.`}>
              <Info label="District" value={getDistrictName(rival.district)} />
              <Info label="Power" value={rival.power} />
              <Info label="Pressure" value={`${pressure}/100`} />
              <Info label="Buy Quiet" value={pressure > 0 ? money(quietCost) : "Not needed"} />
              <Progress label="Pressure" value={pressure} max={100} />
              <div className="button-row compact-row">
                <button className="danger" disabled={pressure <= 0} onClick={() => onSettle(rival)}>
                  Settle Score
                </button>
                <button className="secondary" disabled={pressure <= 0} onClick={() => onBuyQuiet(rival)}>
                  Buy Quiet
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <section className="revenge-feed">
        <div className="card-head">
          <div>
            <h3>Recent Rival Movement</h3>
            <p>Payback events and pressure warnings show here.</p>
          </div>
          <span>{recentLog.length} items</span>
        </div>
        <div className="log-list">
          {recentLog.length ? (
            recentLog.map((line, index) => (
              <div key={`${line}-${index}`} className="log-item">
                {line}
              </div>
            ))
          ) : (
            <div className="log-item">No revenge movement yet. Start taking turf and the city will answer.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function FrontNetworkSummaryCard({ income, ownedPropertyCount, upgradedFrontCount, activeRoutes, incomeBonus, heatBuffer, onOpen }) {
  return (
    <section className="front-summary">
      <div>
        <p className="kicker">Front Network</p>
        <h3>{money(income)}/min</h3>
        <p>Upgrade fronts and connect supply routes so your properties feel like a real empire instead of one-off purchases.</p>
      </div>
      <div className="front-mini-stats">
        <span>Owned <strong>{ownedPropertyCount}</strong></span>
        <span>Upgraded <strong>{upgradedFrontCount}</strong></span>
        <span>Routes <strong>{activeRoutes}</strong></span>
        <span>Bonus <strong>+{Math.round(incomeBonus * 100)}%</strong></span>
        <span>Buffer <strong>{heatBuffer}</strong></span>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>
        Manage Fronts
      </button>
    </section>
  );
}

function FrontNetworkPanel({ routes, game, stats, income, onActivate }) {
  return (
    <section className="front-network-panel">
      <div className="front-network-head">
        <div>
          <p className="kicker">Front Operations</p>
          <h3>{money(income)}/min Front Income</h3>
          <p>Properties now have levels. Supply routes unlock after you own the right fronts and control the right districts.</p>
        </div>
        <div className="front-network-score">
          <span>Network Bonus</span>
          <strong>+{Math.round(stats.incomeBonus * 100)}%</strong>
          <small>{stats.activeCount} active routes • {stats.heatBuffer} heat buffer</small>
        </div>
      </div>

      <div className="route-grid">
        {routes.map((route) => {
          const status = getRouteStatus(route, game);
          const missingFronts = status.missingProperties.map(getPropertyName).join(", ");
          const missingControl = status.missingControl
            .map(([districtId, needed]) => `${getDistrictName(districtId)} ${needed}%`)
            .join(", ");

          return (
            <Card key={route.id} title={route.name} tag={status.active ? "Active" : status.unlocked ? "Ready" : "Locked"} desc={route.desc}>
              <Info label="Cost" value={money(route.cost)} />
              <Info label="Income Bonus" value={`+${Math.round(route.incomeBonus * 100)}%`} />
              <Info label="Heat Buffer" value={`+${route.heatBuffer}`} />
              <Info label="Required Fronts" value={route.properties.map(getPropertyName).join(" + ")} />
              <Info label="Required Control" value={Object.entries(route.control).map(([districtId, needed]) => `${getDistrictName(districtId)} ${needed}%`).join(" + ")} />
              {!status.unlocked && (
                <p className="route-lock-note">
                  Missing: {[missingFronts && `fronts ${missingFronts}`, missingControl && `control ${missingControl}`].filter(Boolean).join("; ")}
                </p>
              )}
              <button className="primary" disabled={!status.unlocked || status.active} onClick={() => onActivate(route)}>
                {status.active ? "Route Active" : "Open Route"}
              </button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}




function LieutenantsSummaryCard({ stats, game, onOpen }) {
  const topAssigned = lieutenants.find((lieutenant) => getLieutenantLevel(game, lieutenant.id) > 0 && getLieutenantAssignment(game, lieutenant.id) !== "idle");

  return (
    <section className="lieutenant-summary">
      <div>
        <p className="kicker">Lieutenant Bench</p>
        <h3>{stats.unlockedCount}/{lieutenants.length} Lieutenants</h3>
        <p>Trusted crew leaders now give focused bonuses when assigned to jobs, turf, muscle, fronts, or Heat control.</p>
      </div>
      <div className="lieutenant-mini-stats">
        <span>Assigned <strong>{stats.assignedCount}</strong></span>
        <span>Levels <strong>{stats.totalLevels}</strong></span>
        <span>Moves <strong>{game.lieutenantMoves || 0}</strong></span>
        <span>Top Post <strong>{topAssigned ? getLieutenantAssignmentName(getLieutenantAssignment(game, topAssigned.id)) : "None"}</strong></span>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>Open Lieutenants</button>
    </section>
  );
}

function LieutenantsPanel({ game, lieutenants, assignments, stats, onUpgrade, onAssign }) {
  return (
    <div className="lieutenant-panel">
      <section className="lieutenant-hero">
        <img src="/art/characters/enforcer-crew.jpg" alt="Lieutenant crew leaders" />
        <div>
          <p className="kicker">Crew Leadership</p>
          <h3>Put the right people over the right parts of the city</h3>
          <p>Lieutenants are permanent crew leaders. Unlock them, promote them, then assign each one to a post. The assignment controls which bonus is active.</p>
        </div>
        <div className="lieutenant-score-card">
          <span>Bench</span>
          <strong>{stats.assignedCount}/{stats.unlockedCount || 0}</strong>
          <small>{stats.totalLevels} total lieutenant levels</small>
        </div>
      </section>

      <div className="lieutenant-status-grid">
        <Stat label="Job Cash" value={`${Math.round((stats.jobIncomeMultiplier - 1) * 100)}%`} helper="assigned bonus" />
        <Stat label="Job Control" value={`+${stats.jobControlBonus}`} helper="per job" />
        <Stat label="Turf Push" value={`+${stats.turfGainBonus}`} helper="expansion" />
        <Stat label="Front Income" value={`${Math.round((stats.frontIncomeMultiplier - 1) * 100)}%`} helper="fronts" />
        <Stat label="Heat Buffer" value={`-${stats.heatReduction}`} helper="noisy moves" />
        <Stat label="Power" value={`+${stats.attackBonus}/+${stats.defenseBonus}`} helper="attack / defense" />
      </div>

      <div className="lieutenant-grid">
        {lieutenants.map((lieutenant) => {
          const level = getLieutenantLevel(game, lieutenant.id);
          const assignment = getLieutenantAssignment(game, lieutenant.id);
          const unlocked = level > 0;

          return (
            <ArtCard key={lieutenant.id} title={lieutenant.name} image={lieutenant.image} tag={lieutenant.tag} desc={lieutenant.desc}>
              <Info label="Rank" value={unlocked ? `Level ${level}/${lieutenant.max || 5}` : "Locked"} />
              <Info label="Specialty" value={getLieutenantAssignmentName(lieutenant.role)} />
              <Info label="Current Post" value={unlocked ? getLieutenantAssignmentName(assignment) : "Locked"} />
              <Info label="Upgrade Cost" value={getLieutenantUpgradeLabel(lieutenant, level)} />
              <Info label="Permanent Effect" value={lieutenant.effect} />
              <Info label="Active Bonus" value={getLieutenantEffectLabel(lieutenant, level, assignment)} />
              <div className="button-row compact-row lieutenant-action-row">
                <button className="primary" disabled={level >= (lieutenant.max || 5)} onClick={() => onUpgrade(lieutenant)}>
                  {level <= 0 ? "Recruit Lt." : "Promote"}
                </button>
                <button className="secondary" disabled={!unlocked || assignment === lieutenant.role} onClick={() => onAssign(lieutenant, lieutenant.role)}>
                  Assign Specialty
                </button>
                <button className="secondary" disabled={!unlocked || assignment === "idle"} onClick={() => onAssign(lieutenant, "idle")}>Idle</button>
              </div>
              <div className="lieutenant-post-row">
                {assignments.filter((item) => item.id !== "idle" && item.id !== lieutenant.role).map((post) => (
                  <button key={post.id} className="ghost-button" disabled={!unlocked || assignment === post.id} onClick={() => onAssign(lieutenant, post.id)}>
                    {post.name}
                  </button>
                ))}
              </div>
            </ArtCard>
          );
        })}
      </div>
    </div>
  );
}

function ContactsSummaryCard({ stats, contacts, game, onOpen }) {
  const readyFavors = contacts.filter((contact) => getContactLevel(game, contact.id) > 0 && getContactFavorStatus(game, contact.id).ready).length;

  return (
    <section className="contacts-summary">
      <div>
        <p className="kicker">Underworld Contacts</p>
        <h3>{stats.unlockedCount}/{contacts.length} Contacts</h3>
        <p>Trusted contacts now give permanent bonuses and timed favors for cash, Heat, tribute, healing, and vault work.</p>
      </div>
      <div className="contact-mini-stats">
        <span>Trust <strong>{stats.totalLevels}</strong></span>
        <span>Favors Ready <strong>{readyFavors}</strong></span>
        <span>Moves <strong>{game.contactMoves || 0}</strong></span>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>Open Contacts</button>
    </section>
  );
}

function ContactsPanel({ game, contacts, stats, onUpgrade, onFavor }) {
  return (
    <div className="contacts-panel">
      <section className="contact-hero">
        <img src="/art/pages/city-wire.jpg" alt="Underworld contacts" />
        <div>
          <p className="kicker">Relationships Matter</p>
          <h3>Build the network behind the empire</h3>
          <p>Contacts are permanent progression. Upgrade trust levels to improve core systems, then call favors when the streets get tight.</p>
        </div>
        <div className="contact-score-card">
          <span>Contacts</span>
          <strong>{stats.unlockedCount}/{contacts.length}</strong>
          <small>{stats.totalLevels} total trust levels</small>
        </div>
      </section>

      <div className="contact-status-grid">
        <Stat label="Job Cash" value={`${Math.round((stats.jobIncomeMultiplier - 1) * 100)}%`} helper="contact bonus" />
        <Stat label="Front Income" value={`${Math.round((stats.frontIncomeMultiplier - 1) * 100)}%`} helper="contact bonus" />
        <Stat label="Tribute" value={`${Math.round((stats.tributeMultiplier - 1) * 100)}%`} helper="contact bonus" />
        <Stat label="Heat Buffer" value={`-${stats.heatReduction}`} helper="per noisy move" />
        <Stat label="Clinic Discount" value={`${Math.round(Math.min(0.35, stats.clinicDiscount) * 100)}%`} helper="street doctor" />
        <Stat label="Launder Bonus" value={`+${Math.round(stats.launderBonus * 100)}%`} helper="bookkeeper" />
      </div>

      <div className="contact-grid">
        {contacts.map((contact) => {
          const level = getContactLevel(game, contact.id);
          const upgradeLabel = getContactUpgradeLabel(contact, level);
          const favorStatus = getContactFavorStatus(game, contact.id);
          const unlocked = level > 0;

          return (
            <ArtCard key={contact.id} title={contact.name} image={contact.image} tag={contact.tag} desc={contact.desc}>
              <Info label="Trust" value={unlocked ? `Level ${level}/${contact.max || 5}` : "Locked"} />
              <Info label="Upgrade Cost" value={upgradeLabel} />
              <Info label="Permanent Effect" value={contact.effect} />
              <Info label="Favor" value={contact.favor?.title || "No favor"} />
              <Info label="Favor Cost" value={getContactFavorCost(contact.favor || {})} />
              <Info label="Favor Reward" value={getContactFavorReward(contact.favor || {})} />
              <Info label="Favor Status" value={unlocked ? favorStatus.label : "Unlock first"} />
              <div className="button-row compact-row contact-action-row">
                <button className="primary" disabled={level >= (contact.max || 5)} onClick={() => onUpgrade(contact)}>
                  {level <= 0 ? "Unlock Contact" : "Build Trust"}
                </button>
                <button className="secondary" disabled={!unlocked || !favorStatus.ready} onClick={() => onFavor(contact)}>
                  Call Favor
                </button>
              </div>
            </ArtCard>
          );
        })}
      </div>
    </div>
  );
}

function VaultSummaryCard({ stats, onOpen, onDeposit, onLaunder }) {
  return (
    <section className="vault-summary">
      <div>
        <p className="kicker">Vault Network</p>
        <h3>Level {stats.level}/5 Security</h3>
        <p>Protect exposed cash, clean money through fronts, and reduce the damage when rivals hit back.</p>
      </div>
      <div className="vault-mini-stats">
        <span>Protected <strong>{money(stats.protectedCash)}</strong></span>
        <span>Capacity <strong>{money(stats.capacity)}</strong></span>
        <span>Rival Cut <strong>-{stats.rivalProtectionPct}%</strong></span>
        <span>Launder Rate <strong>{stats.launderRatePct}%</strong></span>
      </div>
      <div className="vault-summary-actions">
        <button className="secondary" type="button" onClick={onOpen}>Open Vault</button>
        <button className="primary" type="button" onClick={onDeposit}>Vault 50%</button>
        <button className="secondary" type="button" onClick={onLaunder}>Launder</button>
      </div>
    </section>
  );
}

function VaultPanel({ game, stats, onDepositHalf, onDepositAll, onWithdraw, onUpgrade, onLaunder, onBurnTrail }) {
  const upgradeCost = getVaultUpgradeCost(stats.level);
  const burnCost = getVaultBurnTrailCost(game);
  const launderAmount = getVaultLaunderAmount(game);
  const launderedReturn = Math.round(launderAmount * stats.launderRate);

  return (
    <section className="vault-panel">
      <div className="vault-hero">
        <img src="/art/pages/vault.jpg" alt="Vault Network" />
        <div>
          <p className="kicker">Protected Money</p>
          <h3>Turn loose cash into protected power.</h3>
          <p>
            The vault is no longer just a storage box. It now has capacity, security levels, laundering operations, and paper-trail cleanup so money management becomes part of the strategy.
          </p>
        </div>
        <div className="vault-score-card">
          <span>Vault Level</span>
          <strong>{stats.level}/5</strong>
          <small>{stats.operations} vault operations completed</small>
        </div>
      </div>

      <div className="vault-status-grid">
        <div className="vault-status-card">
          <span>Vault Cash</span>
          <strong>{money(stats.current)}</strong>
          <small>{stats.capacityUsedPct}% of protected capacity used</small>
        </div>
        <div className="vault-status-card">
          <span>Capacity</span>
          <strong>{money(stats.capacity)}</strong>
          <small>Upgrade vault security to store more</small>
        </div>
        <div className="vault-status-card">
          <span>Rival Protection</span>
          <strong>-{stats.rivalProtectionPct}%</strong>
          <small>Reduces cash loss during retaliation</small>
        </div>
        <div className="vault-status-card">
          <span>Launder Rate</span>
          <strong>{stats.launderRatePct}%</strong>
          <small>Returned as usable cash</small>
        </div>
        <div className="vault-status-card">
          <span>Laundered Total</span>
          <strong>{money(stats.launderedCash)}</strong>
          <small>Career cleaned cash</small>
        </div>
        <div className="vault-status-card">
          <span>Overflow</span>
          <strong>{money(stats.overflow)}</strong>
          <small>{stats.overflow > 0 ? "Upgrade security soon" : "All stored cash protected"}</small>
        </div>
      </div>

      <Progress label="Protected Capacity" value={stats.protectedCash} max={stats.capacity} />

      <div className="vault-action-grid">
        <Card title="Stash Cash" tag="Protection" desc="Move exposed cash into protected storage before rivals hit back.">
          <Info label="Available Cash" value={money(game.cash)} />
          <Info label="Capacity Left" value={money(Math.max(0, stats.capacity - stats.current))} />
          <div className="button-row compact-row">
            <button className="primary" onClick={onDepositHalf}>Vault 50%</button>
            <button className="primary" onClick={onDepositAll}>Vault All</button>
            <button className="secondary" onClick={onWithdraw}>Withdraw All</button>
          </div>
        </Card>

        <Card title="Upgrade Vault Security" tag="Level 1-5" desc="Increase capacity, improve rival protection, and slightly clean up Heat at higher levels.">
          <Info label="Current Level" value={`${stats.level}/5`} />
          <Info label="Next Upgrade" value={stats.level >= 5 ? "Maxed" : `${money(upgradeCost.cash)} / ${upgradeCost.tribute} Tribute / ${upgradeCost.energy} Energy`} />
          <Info label="Next Capacity" value={stats.level >= 5 ? money(stats.capacity) : money(getVaultStats({ ...game, vaultLevel: stats.level + 1 }).capacity)} />
          <button className="primary" disabled={stats.level >= 5} onClick={onUpgrade}>
            {stats.level >= 5 ? "Vault Maxed" : "Upgrade Security"}
          </button>
        </Card>

        <Card title="Launder Vault Cash" tag="Fronts" desc="Move vault money back into usable cash through fronts. You lose a small cut and gain boss growth.">
          <Info label="Amount Moved" value={stats.current >= 250 ? money(launderAmount) : "Need $250 vault"} />
          <Info label="Returned Cash" value={stats.current >= 250 ? money(launderedReturn) : "Not ready"} />
          <Info label="Cost" value="6 Energy / small Heat" />
          <button className="primary" onClick={onLaunder}>Launder Cash</button>
        </Card>

        <Card title="Burn Paper Trail" tag="Control" desc="Spend protected cash to cool Heat and reduce rival pressure citywide.">
          <Info label="Cost" value={`${money(burnCost.vaultCash)} vault / ${burnCost.tribute} Tribute / ${burnCost.energy} Energy`} />
          <Info label="Effect" value={`-${10 + stats.level * 3} Heat / -${8 + stats.level * 2} Rival Pressure`} />
          <button className="danger" onClick={onBurnTrail}>Burn Trail</button>
        </Card>
      </div>
    </section>
  );
}

function SafehouseSummaryCard({ stats, safehouseMoves, onOpen }) {
  return (
    <section className="safehouse-summary">
      <div>
        <p className="kicker">Safehouse</p>
        <h3>{stats.totalLevels}/20 Room Levels</h3>
        <p>Your base now matters. Upgrade rooms to improve income, tribute, energy, combat power, loyalty, and Heat control.</p>
      </div>
      <div className="safehouse-mini-stats">
        <span>Income <strong>+{Math.round((stats.incomeMultiplier - 1) * 100)}%</strong></span>
        <span>Tribute <strong>+{Math.round((stats.tributeMultiplier - 1) * 100)}%</strong></span>
        <span>Energy <strong>+{stats.maxEnergyBonus}</strong></span>
        <span>Power <strong>+{stats.attackBonus}/{stats.defenseBonus}</strong></span>
        <span>Moves <strong>{safehouseMoves}</strong></span>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>
        Upgrade Base
      </button>
    </section>
  );
}

function SafehousePanel({ game, rooms, stats, onUpgrade }) {
  return (
    <section className="safehouse-panel">
      <div className="safehouse-hero">
        <img src="/art/gear/war-room.png" alt="Safehouse headquarters" />
        <div>
          <p className="kicker">Base of Operations</p>
          <h3>Build the room behind the empire.</h3>
          <p>
            The safehouse is your permanent headquarters. It gives small but useful bonuses that stack with fronts, gear, skills, and crew loyalty.
          </p>
        </div>
        <div className="safehouse-score-card">
          <span>Total Levels</span>
          <strong>{stats.totalLevels}/20</strong>
          <small>{game.safehouseMoves || 0} upgrades completed</small>
        </div>
      </div>

      <div className="safehouse-status-grid">
        <div className="safehouse-status-card">
          <span>Front Income</span>
          <strong>+{Math.round((stats.incomeMultiplier - 1) * 100)}%</strong>
          <small>Back Office bonus</small>
        </div>
        <div className="safehouse-status-card">
          <span>Tribute</span>
          <strong>+{Math.round((stats.tributeMultiplier - 1) * 100)}%</strong>
          <small>Back Office bonus</small>
        </div>
        <div className="safehouse-status-card">
          <span>Energy / Stamina</span>
          <strong>+{stats.maxEnergyBonus} / +{stats.maxStaminaBonus}</strong>
          <small>Garage bonus</small>
        </div>
        <div className="safehouse-status-card">
          <span>Attack / Defense</span>
          <strong>+{stats.attackBonus} / +{stats.defenseBonus}</strong>
          <small>Armory bonus</small>
        </div>
        <div className="safehouse-status-card">
          <span>Heat Control</span>
          <strong>-{stats.heatReduction}</strong>
          <small>Crew Lounge reduction</small>
        </div>
        <div className="safehouse-status-card">
          <span>Loyalty Boost</span>
          <strong>+{stats.loyaltyBonus}</strong>
          <small>Earned from lounge upgrades</small>
        </div>
      </div>

      <div className="safehouse-room-grid">
        {rooms.map((room) => {
          const level = getSafehouseRoomLevel(game, room.id);
          const maxed = level >= (room.max || 5);
          const progress = Math.round((level / (room.max || 5)) * 100);

          return (
            <ArtCard key={room.id} title={room.name} image={room.image} tag={room.tag} desc={room.desc}>
              <Info label="Room Level" value={`${level}/${room.max || 5}`} />
              <Info label="Effect" value={room.effect} />
              <Info label="Next Upgrade" value={getSafehouseUpgradeLabel(room, level)} />
              <Progress label="Room Progress" value={progress} max={100} />
              <button className="primary" disabled={maxed} onClick={() => onUpgrade(room)}>
                {maxed ? "Room Maxed" : "Upgrade Room"}
              </button>
            </ArtCard>
          );
        })}
      </div>
    </section>
  );
}

function TurfSummaryCard({ cityControl, controlledDistricts, strongholdDistricts, target, targetControl, onOpen }) {
  const tier = getControlTier(targetControl);

  return (
    <section className={`turf-summary turf-${tier.tone}`}>
      <div>
        <p className="kicker">Turf Control</p>
        <h3>{cityControl}% City Control</h3>
        <p>Next target: {target.name} is at {targetControl}% control. Current status: {tier.label}.</p>
      </div>
      <div className="turf-mini-stats">
        <span>Strongholds <strong>{strongholdDistricts}</strong></span>
        <span>Owned <strong>{controlledDistricts}</strong></span>
        <span>Target <strong>{target.name}</strong></span>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>
        Work Turf
      </button>
    </section>
  );
}

function TurfOperationsPanel({ cityControl, controlledDistricts, strongholdDistricts, nextTarget, nextTargetControl }) {
  const tier = getControlTier(nextTargetControl);

  return (
    <section className={`turf-ops turf-${tier.tone}`}>
      <div>
        <p className="kicker">Turf Operations</p>
        <h3>{cityControl}% City Control</h3>
        <p>Control now matters. Higher control improves property income and unlocks tribute collections from each district.</p>
      </div>
      <div className="turf-ops-grid">
        <div>
          <span>Next Target</span>
          <strong>{nextTarget.name}</strong>
          <small>{nextTargetControl}% • {tier.label}</small>
        </div>
        <div>
          <span>Strongholds</span>
          <strong>{strongholdDistricts}</strong>
          <small>districts at 75%+</small>
        </div>
        <div>
          <span>Owned</span>
          <strong>{controlledDistricts}</strong>
          <small>districts at 100%</small>
        </div>
      </div>
    </section>
  );
}

function CrewSummaryCard({ crew, loyalty, standing, respect, attackBonus, defenseBonus, onOpen }) {
  return (
    <section className={`crew-summary crew-${standing.tone}`}>
      <div>
        <p className="kicker">Street Crew</p>
        <h3>{crew} Members • {standing.label}</h3>
        <p>{standing.desc}</p>
      </div>
      <div className="crew-mini-stats">
        <span>Respect <strong>{respect}</strong></span>
        <span>Loyalty <strong>{loyalty}/100</strong></span>
        <span>Bonus <strong>+{attackBonus}/+{defenseBonus}</strong></span>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>
        Manage Crew
      </button>
    </section>
  );
}

function CrewOperationsPanel({
  crew,
  loyalty,
  standing,
  respect,
  recruitCost,
  trainingCost,
  payrollCost,
  attackBonus,
  defenseBonus,
  onRecruit,
  onTrainMuscle,
  onTrainLookouts,
  onPayCrew,
}) {
  return (
    <section className={`crew-ops crew-${standing.tone}`}>
      <div className="crew-ops-head">
        <div>
          <p className="kicker">Crew Operations</p>
          <h3>{crew} Crew • {standing.label}</h3>
          <p>{standing.desc}</p>
        </div>
        <div className="crew-loyalty-meter">
          <span>Loyalty</span>
          <strong>{loyalty}/100</strong>
          <div className="bar">
            <i style={{ width: `${loyalty}%` }} />
          </div>
        </div>
      </div>

      <div className="crew-ops-grid">
        <Card title="Recruit Crew" tag="Growth" desc="Bring in another street-level member. More crew means more power, but it creates noise.">
          <Info label="Cost" value={money(recruitCost)} />
          <Info label="Effect" value="＋1 Crew / +2 Heat" />
          <button className="primary" onClick={onRecruit}>Recruit</button>
        </Card>

        <Card title="Train Muscle" tag="Attack" desc="Put the crew through rough work that makes hits easier to win.">
          <Info label="Cost" value={`${money(trainingCost)} / 6 Energy`} />
          <Info label="Current Bonus" value={`+${attackBonus}`} />
          <button className="primary" onClick={onTrainMuscle}>Train Muscle</button>
        </Card>

        <Card title="Train Lookouts" tag="Defense" desc="Teach the crew to spot threats, watch corners, and keep your boss covered.">
          <Info label="Cost" value={`${money(trainingCost)} / 6 Energy`} />
          <Info label="Current Bonus" value={`+${defenseBonus}`} />
          <button className="primary" onClick={onTrainLookouts}>Train Lookouts</button>
        </Card>

        <Card title="Pay Crew" tag="Loyalty" desc="Keep your people loyal. A loyal crew performs better when pressure rises.">
          <Info label="Cost" value={money(payrollCost)} />
          <Info label="Respect" value={respect} />
          <button className="secondary" onClick={onPayCrew}>Pay Crew</button>
        </Card>
      </div>
    </section>
  );
}

function BlackMarketSummaryCard({ marketRep, boughtToday, totalDeals, gearStats, onOpen }) {
  return (
    <section className="black-market-summary">
      <div>
        <p className="kicker">Black Market</p>
        <h3>{marketRep} Market Rep</h3>
        <p>Daily favors, quiet gear, and upgrades give the player another reason to spend cash and tribute.</p>
      </div>
      <div className="market-mini-stats">
        <span>Deals Today <strong>{boughtToday}/{totalDeals}</strong></span>
        <span>Gear Owned <strong>{gearStats.ownedCount}</strong></span>
        <span>Avg Level <strong>{gearStats.averageLevel || 0}</strong></span>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>Open Market</button>
    </section>
  );
}

function BlackMarketPanel({ game, deals, gearItems, gearStats, onBuyDeal, onBuyGear, onUpgradeGear }) {
  const boughtCount = Object.values(game.blackMarketDeals || {}).filter(Boolean).length;

  return (
    <div className="black-market-panel">
      <section className="black-market-hero">
        <img src="/art/gear/war-room.png" alt="Black market war room" />
        <div>
          <p className="kicker">Off-Book Network</p>
          <h3>Deals reset daily</h3>
          <p>
            This gives the player a controlled place to spend cash and tribute. Deals are useful, but they are limited so the market does not break the economy.
          </p>
        </div>
        <div className="market-score-card">
          <span>Market Rep</span>
          <strong>{game.marketRep || 0}</strong>
          <small>{boughtCount}/{deals.length} deals used today</small>
        </div>
      </section>

      <div className="market-status-grid">
        <Stat label="Owned Gear" value={gearStats.ownedCount} helper={`${gearStats.upgradedCount} upgraded`} />
        <Stat label="Gear Attack" value={`+${gearStats.attack}`} helper="equipped assets" />
        <Stat label="Gear Defense" value={`+${gearStats.defense}`} helper="equipped assets" />
        <Stat label="Average Level" value={gearStats.averageLevel || 0} helper="gear growth" />
      </div>

      <section className="market-section-head">
        <div>
          <p className="kicker">Daily Favors</p>
          <h3>Choose today&apos;s underworld deals</h3>
          <p>Each deal can only be used once per day. This keeps the market useful without turning it into an unlimited cheat button.</p>
        </div>
      </section>

      <div className="market-deal-grid">
        {deals.map((deal) => {
          const bought = isMarketDealBought(game, deal.id);
          return (
            <ArtCard key={deal.id} title={deal.title} image={deal.image} tag={deal.tag} desc={deal.desc}>
              <Info label="Cost" value={getMarketDealCost(deal)} />
              <Info label="Reward" value={getMarketDealReward(deal)} />
              <button className="primary" disabled={bought} onClick={() => onBuyDeal(deal)}>
                {bought ? "Used Today" : "Take Deal"}
              </button>
            </ArtCard>
          );
        })}
      </div>

      <section className="market-section-head">
        <div>
          <p className="kicker">Gear Upgrades</p>
          <h3>Turn owned gear into real power</h3>
          <p>Gear now levels from 1 to 5. Upgrades cost cash, tribute, and energy, then increase the attack and defense value of that asset.</p>
        </div>
      </section>

      <div className="market-gear-grid">
        {gearItems.map((item) => {
          const owned = Boolean(game.gear?.[item.id]);
          const level = getGearLevel(game, item.id);
          const cost = getGearUpgradeCost(item, Math.max(1, level));

          return (
            <ArtCard key={item.id} title={item.name} image={item.image} tag={item.type}>
              <Info label="Status" value={owned ? `Owned • Level ${level}/5` : "Not owned"} />
              <Info label="Attack" value={`+${owned ? getGearAttackValue(item, game) : item.attack}`} />
              <Info label="Defense" value={`+${owned ? getGearDefenseValue(item, game) : item.defense}`} />
              <Info label="Upgrade Cost" value={owned && level < 5 ? `${money(cost.cash)} / ${cost.tribute} Tribute / ${cost.energy} Energy` : owned ? "Maxed" : money(item.cost)} />
              <div className="button-row compact-row">
                <button className="primary" disabled={owned} onClick={() => onBuyGear(item)}>{owned ? "Owned" : "Buy Gear"}</button>
                <button className="secondary" disabled={!owned || level >= 5} onClick={() => onUpgradeGear(item)}>Upgrade</button>
              </div>
            </ArtCard>
          );
        })}
      </div>
    </div>
  );
}

function HeatSummaryCard({ heat, tier, payoutMultiplier, onOpen }) {
  return (
    <section className={`heat-summary heat-${tier.tone}`}>
      <div>
        <p className="kicker">Street Heat</p>
        <h3>{tier.label}</h3>
        <p>{tier.advice}</p>
      </div>
      <div className="heat-mini-meter" aria-label="Current heat level">
        <strong>{heat}/100</strong>
        <div className="bar">
          <i style={{ width: `${heat}%` }} />
        </div>
        <small>Job payout: {Math.round(payoutMultiplier * 100)}%</small>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>
        Manage Heat
      </button>
    </section>
  );
}

function HeatPanel({ heat, tier, payoutMultiplier, cash, energy, crew, level, onLayLow, onBribe, onDecoy }) {
  const layLowCost = 150 + level * 50;
  const bribeCost = 650 + level * 125;

  return (
    <div className={`heat-panel heat-${tier.tone}`}>
      <PageHero
        image="/art/pages/city-wire.jpg"
        title={`Heat Status: ${tier.label}`}
        desc={tier.desc}
      />

      <div className="heat-meter-card">
        <div className="heat-meter-head">
          <div>
            <p className="kicker">Current Attention</p>
            <h3>{heat}/100 Heat</h3>
            <p>{tier.advice}</p>
          </div>
          <div className="heat-effect-pill">
            <span>Job Payout</span>
            <strong>{Math.round(payoutMultiplier * 100)}%</strong>
          </div>
        </div>
        <div className="bar heat-bar">
          <i style={{ width: `${heat}%` }} />
        </div>
      </div>

      <div className="heat-action-grid">
        <Card title="Lay Low" tag="Safe" desc="Spend cash and energy to let the streets cool off.">
          <Info label="Cost" value={`${money(layLowCost)} / 8 Energy`} />
          <Info label="Available" value={cash >= layLowCost && energy >= 8 ? "Ready" : "Need resources"} />
          <button className="primary" onClick={onLayLow}>Lay Low</button>
        </Card>

        <Card title="Clean Favor" tag="Fast" desc="Pay someone useful to make a problem disappear.">
          <Info label="Cost" value={money(bribeCost)} />
          <Info label="Available" value={cash >= bribeCost ? "Ready" : "Need cash"} />
          <button className="primary" onClick={onBribe}>Pay Favor</button>
        </Card>

        <Card title="Send Decoy Crew" tag="Risky" desc="Sacrifice one crew member to pull attention away from you.">
          <Info label="Cost" value="1 Crew" />
          <Info label="Available" value={crew > 1 ? "Ready" : "Need crew"} />
          <button className="danger" onClick={onDecoy}>Send Decoy</button>
        </Card>
      </div>
    </div>
  );
}

function FirstMovesPanel({ moves, complete, claimed, onClaim, onNavigate }) {
  const nextMove = moves.find((item) => !item.done);

  function goToMove(move) {
    const map = {
      Jobs: "jobs",
      Rivals: "rivals",
      Territory: "territory",
      Properties: "properties",
    };

    onNavigate(map[move.action] || "command");
  }

  return (
    <section className="first-moves-card">
      <div className="first-moves-top">
        <div>
          <p className="kicker">Chapter 1</p>
          <h3>First Moves</h3>
          <p>Get your first foothold in the city. Finish these steps to claim a starter reward.</p>
        </div>
        <div className="reward-box">
          <span>Reward</span>
          <strong>$1,000</strong>
          <small>+50 Energy • +3 Crew</small>
        </div>
      </div>

      <div className="first-moves-list">
        {moves.map((move) => (
          <button
            key={move.id}
            type="button"
            className={`first-move ${move.done ? "done" : "open"}`}
            onClick={() => goToMove(move)}
          >
            <span>{move.done ? "Done" : "Next"}</span>
            <strong>{move.label}</strong>
            <small>Go to {move.action}</small>
          </button>
        ))}
      </div>

      <div className="first-moves-actions">
        <p>
          {claimed
            ? "Reward claimed. Chapter 1 is underway."
            : complete
              ? "All first moves are complete. Claim your reward."
              : `Next recommended move: ${nextMove?.label || "keep building"}.`}
        </p>
        <button className="primary" onClick={onClaim} disabled={!complete || claimed}>
          {claimed ? "Reward Claimed" : "Claim Starter Reward"}
        </button>
      </div>
    </section>
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
