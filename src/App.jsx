import React, { useEffect, useMemo, useState } from "react";
import { APP_PHASE, APP_BUILD_NAME, APP_BUILD_LABEL, APP_FULL_PHASE_LABEL } from "./data/phase";
import { systemUnlocks } from "./data/unlocks";
import { getFirstSessionRecommendedMove } from "./logic/firstSession";
import { getFirstNightProgress } from "./data/firstNightChecklist";
import { getClinicOptions } from "./logic/clinic";
import { getDynamicStreetChatFeed } from "./logic/streetChat";
import { getBalanceSnapshot } from "./logic/balance";
import SafeImage from "./components/SafeImage";
import ErrorBoundary from "./components/ErrorBoundary";
import RewardToast from "./components/RewardToast";
import FirstNightChecklist from "./components/FirstNightChecklist";
import ClinicOptions from "./components/ClinicOptions";
import ActionResultCard from "./components/ActionResultCard";
import PvpHub from "./pages/PvpHub";
import { mockPlayers } from "./data/mockPlayers";
import { pvpBounties } from "./data/pvpBounties";
import { calculatePowerScore, getPublicProfileSummary } from "./logic/powerScore";
import { defensePostures, simulatePvpAttack, makeAttackLogLine, makeStreetChatLine } from "./logic/pvp";
import { getNemesisState, updateNemesisMap, getRetaliationRisk } from "./logic/nemesis";
import { getFrontDamage, getFrontDamageIncomeMultiplier, getFrontRepairCost, damageRandomFront, repairFront as repairFrontLogic } from "./logic/frontDamage";
import { supportedLanguages } from "./i18n";
import { makeTranslator, getDirectionForLanguage } from "./logic/language";
import DisabledReason from "./components/DisabledReason";
import EmptyState from "./components/EmptyState";
import RequirementList from "./components/RequirementList";
import WhileYouWereGoneCard from "./components/WhileYouWereGoneCard";
import { shouldRunOfflineEvent, simulateOfflineEvent } from "./logic/offlineEvents";
import { chooseJobOutcome } from "./logic/jobOutcomes";
import { mockStoreItems } from "./data/storeItems";
import { mainNavItems, moreMenuGroups } from "./data/navConfig";
import { jobChoices } from "./data/jobChoices";
import { getStorePrompt, applyMockStorePurchase } from "./logic/store";
import { getOneRecommendedMove } from "./logic/recommendations";
import { updateActionStreaks, getStreakCards } from "./logic/streaks";
import SimplifiedStats from "./components/SimplifiedStats";
import EmpireDetails from "./components/EmpireDetails";
import RevengeAlert from "./components/RevengeAlert";
import MockStoreItemCard from "./components/MockStoreItemCard";
import StorePrompt from "./components/StorePrompt";
import BeginnerLayoutToggle from "./components/BeginnerLayoutToggle";
import StreakCard from "./components/StreakCard";
import JobChoicePanel from "./components/JobChoicePanel";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import FightPage from "./pages/FightPage";
import EmpirePage from "./pages/EmpirePage";
import MorePage from "./pages/MorePage";
import StorePage from "./pages/StorePage";
import SettingsPage from "./pages/SettingsPage";

const SAVE_KEY = "shadow_syndicate_live_source_save_v1";
const AUTH_USERS_KEY = "shadow_syndicate_auth_users_v1";
const AUTH_SESSION_KEY = "shadow_syndicate_auth_session_v1";
const INSTALL_PROMPT_DISMISSED_KEY = "shadow_syndicate_install_prompt_dismissed_v1";
const INSTALL_PROMPT_ACCEPTED_KEY = "shadow_syndicate_install_prompt_accepted_v1";
const SETTINGS_KEY = "shadow_syndicate_settings_v1";
const ADMIN_USERNAME = "admin";
const ADMIN_DEFAULT_PASSWORD = "admin123";
const ADMIN_DEFAULT_PIN = "0000";
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
    tab: "missions",
    title: "Mission Board",
    image: "/art/pages/city-wire.jpg",
    desc: "See the best next move, daily orders, campaign goals, City Wire leads, and event objectives in one place.",
  },
  {
    tab: "rewards",
    title: "Rewards",
    image: "/icon-192.png",
    desc: "Review recent gains, rank progress, daily rewards, and what actions are paying off.",
  },
  {
    tab: "achievements",
    title: "Achievements",
    image: "/icon-512.png",
    desc: "Track boss milestones, unlocked badges, and long-term progress across the city.",
  },
  {
    tab: "intel",
    title: "Intel Feed",
    image: "/art/pages/city-wire.jpg",
    desc: "A cleaner street feed showing warnings, opportunities, rewards, and your best next move.",
  },
  {
    tab: "contracts",
    title: "Contracts",
    image: "/art/pages/revenge-log.jpg",
    desc: "Pick from short underworld contracts that point players toward jobs, turf, rivals, fronts, and heat control.",
  },
  {
    tab: "timeline",
    title: "City Timeline",
    image: "/art/pages/city-wire.jpg",
    desc: "See cooldowns, live timers, daily reset pressure, and what is coming due next.",
  },
  {
    tab: "brief",
    title: "Operations Brief",
    image: "/art/gear/war-room.png",
    desc: "A cleaner boss briefing that summarizes danger, money, people, and the next three priorities.",
  },
  {
    tab: "balance",
    title: "Balance Panel",
    image: "/art/gear/war-room.png",
    desc: "Developer view for cash, income, heat, rivals, unlocks, and first-session balance checks.",
  },
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
    tab: "pvp",
    title: "Fight",
    image: "/icon-192.png",
    desc: "Find targets, build grudges, set defense, track revenge, and test multiplayer-style hits locally.",
  },
  {
    tab: "store",
    title: "Tribute Store",
    image: "/icon-192.png",
    desc: "Mock premium store using fake Tribute only. Real purchases are not active.",
  },
  {
    tab: "empire",
    title: "Empire Hub",
    image: "/art/gear/war-room.png",
    desc: "Turf, fronts, vault, safehouse, gear, contacts, and income in one place.",
  },
  {
    tab: "wire",
    title: "City Wire",
    image: "/art/pages/city-wire.jpg",
    desc: "Track city updates and underworld movement.",
  },
  {
    tab: "settings",
    title: "Settings",
    image: "/icon-192.png",
    desc: "Tune your game, app install behavior, and quality-of-life preferences.",
  },
  {
    tab: "account",
    title: "Account",
    image: "/icon-192.png",
    desc: "Manage sign-in, password, admin tools, profile image, and save controls.",
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
  saveVersion: 6,
  playerId: "local-player",
  crewName: "Rookie Crew",
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
  loginRewardClaimedDate: "",
  loginRewardStreak: 0,
  introSeen: false,
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
  lastActionResult: null,
  devPanelVisible: false,
  pvpDefensePosture: "balanced",
  pvpAttackLog: [],
  pvpRevengeList: [],
  pvpGrudges: {},
  pvpBountyProgress: {},
  pvpBountiesClaimed: {},
  pvpCashStolen: 0,
  pvpRevengeWins: 0,
  pvpDefenseWins: 0,
  pvpRivalHistory: {},
  pvpNemesisMap: {},
  pvpRevengeBonuses: {},
  pvpRetaliationTimers: {},
  frontDamage: {},
  offlineEventRecords: [],

  beginnerLayout: true,
  simplifiedNav: true,
  showAdvancedStatsOnHome: false,
  empireDetailsOpen: false,
  hideFirstNightGuidance: false,
  mockStorePurchases: {},
  storePromptsSeen: {},
  tributePurchases: 0,
  energyRefillsUsed: 0,
  staminaRefillsUsed: 0,
  activeShieldUntil: 0,
  vaultCapacityBonus: 0,
  vaultExpansionLevel: 0,
  respectBoostActions: 0,
  streaks: {},
  translationVersion: 1,
  lastSeenAt: 0,
  lastOfflineEventAt: 0,
  lastJobOutcome: "",
  language: "en",
  pvpStrongerWins: 0,
  log: ["Welcome to Shadow Syndicate. Build your crew. Claim your city. Rule the underworld."],
};


function getBossRank(game, cityControl = 0) {
  const level = Number(game.level || 1);
  const respect = Number(game.respect || 0);
  const wins = Number(game.wins || 0);
  const fronts = Object.values(game.properties || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const score = level * 12 + respect + wins * 4 + cityControl * 2 + fronts * 8;

  if (score >= 500) return { title: "Underworld Legend", tier: 7, next: "The city already knows your name. Keep expanding.", progress: 100 };
  if (score >= 360) return { title: "City Power", tier: 6, next: "Push toward full city ownership.", progress: Math.round(((score - 360) / 140) * 100) };
  if (score >= 250) return { title: "District Kingpin", tier: 5, next: "Turn strongholds into owned districts.", progress: Math.round(((score - 250) / 110) * 100) };
  if (score >= 160) return { title: "Neighborhood Shot Caller", tier: 4, next: "Build fronts and beat rival pressure.", progress: Math.round(((score - 160) / 90) * 100) };
  if (score >= 90) return { title: "Crew Boss", tier: 3, next: "Recruit, train, and win your first fights.", progress: Math.round(((score - 90) / 70) * 100) };
  if (score >= 35) return { title: "Street Runner", tier: 2, next: "Run jobs and start taking turf.", progress: Math.round(((score - 35) / 55) * 100) };
  return { title: "Nobody", tier: 1, next: "Run your first job and make the city notice.", progress: Math.round((score / 35) * 100) };
}

function getRecommendedMove(game, dailyOrders, activeStreetOpportunity, nextCampaignChapter, heat, topRivalThreat) {
  if (!game.started) return { title: "Create your boss", tab: "command", detail: "Finish your identity and enter the city." };
  if (game.jobsRun < 1) return { title: "Run your first job", tab: "jobs", detail: "Jobs build cash, XP, and control." };
  if (!isLoginRewardClaimed(game)) return { title: "Claim login reward", tab: "command", detail: "Free daily cash, energy, and respect are waiting." };
  const openDaily = dailyOrders.find((order) => !order.done);
  if (openDaily) return { title: openDaily.label, tab: openDaily.action || "daily", detail: "This daily order keeps your streak moving." };
  if (activeStreetOpportunity) return { title: "Resolve City Wire lead", tab: "wire", detail: "Temporary street leads go cold if ignored." };
  if (heat >= 70) return { title: "Cool Street Heat", tab: "heat", detail: "Heat is high enough to hurt payouts and trigger problems." };
  if (topRivalThreat?.pressure >= 65) return { title: "Lower rival pressure", tab: "revenge", detail: "A rival hit is getting too close." };
  if (nextCampaignChapter && !nextCampaignChapter.claimed) return { title: nextCampaignChapter.title, tab: "campaign", detail: "Push the story forward and claim bigger rewards." };
  return { title: "Expand turf", tab: "territory", detail: "Control more districts and unlock stronger income." };
}


function getAchievementBadges(game, cityControl = 0, bossRank = { title: "Nobody" }) {
  const ownedFronts = Object.values(game.properties || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const upgradedFronts = Object.values(game.propertyUpgrades || {}).filter((level) => Number(level || 0) > 1).length;
  const unlockedContacts = Object.values(game.contacts || {}).filter((level) => Number(level || 0) > 0).length;
  const unlockedLieutenants = Object.values(game.lieutenants || {}).filter(Boolean).length;
  const achievementList = [
    { id: "first_job", title: "First Score", desc: "Run your first job.", done: Number(game.jobsRun || 0) >= 1, reward: "+100 Respect memory" },
    { id: "ten_jobs", title: "Street Routine", desc: "Run 10 total jobs.", done: Number(game.jobsRun || 0) >= 10, reward: "Better rhythm" },
    { id: "first_win", title: "Made an Example", desc: "Win your first rival fight.", done: Number(game.wins || 0) >= 1, reward: "Rivals notice you" },
    { id: "crew_ten", title: "Crew Has a Name", desc: "Build a crew of 10 or more.", done: Number(game.crew || 0) >= 10, reward: "More muscle" },
    { id: "front_owner", title: "Front Owner", desc: "Own your first property front.", done: ownedFronts >= 1, reward: "Empire income" },
    { id: "front_builder", title: "Upgraded Front", desc: "Upgrade any front past Level 1.", done: upgradedFronts >= 1, reward: "Cleaner money" },
    { id: "district_hold", title: "Street Grip", desc: "Reach 50% city control.", done: cityControl >= 50, reward: "City influence" },
    { id: "rank_climb", title: "Name in the City", desc: "Reach Crew Boss rank or higher.", done: bossRank.tier >= 3, reward: bossRank.title },
    { id: "contact", title: "Friend in the Shadows", desc: "Unlock an underworld contact.", done: unlockedContacts >= 1, reward: "Favors opened" },
    { id: "lieutenant", title: "Trusted Second", desc: "Recruit a lieutenant.", done: unlockedLieutenants >= 1, reward: "Assignments opened" },
  ];

  const completed = achievementList.filter((badge) => badge.done).length;
  return { badges: achievementList, completed, total: achievementList.length };
}

function getIntelFeed(game, heat, topRivalThreat, cityControl, bossRank, recommendedMove) {
  const feed = [
    { type: "Next Move", title: recommendedMove.title, detail: recommendedMove.detail, tab: recommendedMove.tab },
    { type: "Boss Rank", title: bossRank.title, detail: bossRank.next, tab: "rewards" },
    { type: "Street Heat", title: heat >= 70 ? "Heat is dangerous" : heat >= 40 ? "Heat is building" : "Heat is manageable", detail: `${heat}/100 Heat. ${heat >= 70 ? "Cool it down before payouts and pressure get worse." : "Keep it controlled while you make moves."}`, tab: "heat" },
    { type: "Turf", title: `${cityControl}% city control`, detail: cityControl >= 50 ? "You are starting to look like a real city power." : "Push districts until the city map starts turning yours.", tab: "territory" },
  ];

  if (topRivalThreat) {
    feed.push({ type: "Rivals", title: topRivalThreat.rival.name, detail: `${topRivalThreat.pressure}/100 pressure. ${topRivalThreat.pressure >= 65 ? "Payback is getting close." : "Still manageable."}`, tab: "revenge" });
  }

  if (!isDailyRewardClaimed(game)) {
    feed.push({ type: "Reward", title: "Daily login reward ready", detail: "Claim today’s login reward to keep the streak moving.", tab: "rewards" });
  }

  return feed;
}

function getStreetChatFeed(game, heat, topRivalThreat, cityControl, activeStreetOpportunity, recommendedMove) {
  const bossName = game?.bossName || "Rookie";
  const crewMood = Number(game?.crewLoyalty ?? 75) >= 70 ? "steady" : Number(game?.crewLoyalty ?? 75) >= 45 ? "restless" : "shaky";
  const leadLine = activeStreetOpportunity
    ? `City Wire says ${activeStreetOpportunity.title} is still live. Somebody needs to make a call before it goes cold.`
    : "No fresh City Wire lead yet. A quick scout could shake something loose.";

  return [
    { speaker: "Corner Lookout", tag: "Street", line: `Word is ${bossName} is making noise. Next smart move: ${recommendedMove?.title || "keep building"}.` },
    { speaker: "Backroom Clerk", tag: "Intel", line: leadLine },
    { speaker: "Old Driver", tag: "Heat", line: heat >= 70 ? "Too many eyes on the corners. Cool the heat before somebody starts knocking." : heat >= 40 ? "Heat is warm, not boiling. Move clean and keep it that way." : "Streets feel quiet. Good time to make money." },
    { speaker: "Crew Whisper", tag: "Crew", line: `Crew morale feels ${crewMood}. Keep them paid, trained, and useful.` },
    { speaker: "Numbers Guy", tag: "City", line: cityControl >= 50 ? `You control ${cityControl}% of the city. People are starting to use your name carefully.` : `Only ${cityControl}% of the city is yours. Turf is still the main road to power.` },
    topRivalThreat
      ? { speaker: "Sidewalk Runner", tag: "Rivals", line: `${topRivalThreat.rival.name} is sitting at ${topRivalThreat.pressure}/100 pressure. Ignore that too long and they may hit back.` }
      : { speaker: "Sidewalk Runner", tag: "Rivals", line: "No one crew is screaming for payback right now. That can change fast." },
  ];
}

function getContractBoard(game, heat, cityControl, topRivalThreat, nextTurfTarget, activeStreetOpportunity) {
  const ownedFronts = Object.values(game.properties || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const contracts = [
    {
      id: "street_cash",
      title: "Street Cash Run",
      type: "Starter Contract",
      tab: "jobs",
      ready: Number(game.energy || 0) >= 4,
      reward: "Cash, XP, and district control",
      risk: heat >= 65 ? "High Heat" : "Manageable",
      detail: "Run a job to keep money moving and build your name without adding another system to learn.",
    },
    {
      id: "turf_push",
      title: `Push ${nextTurfTarget?.name || "Turf"}`,
      type: "Turf Contract",
      tab: "territory",
      ready: Number(game.energy || 0) >= Number(nextTurfTarget?.energy || 5),
      reward: "District control and future tribute",
      risk: "Rival attention",
      detail: `Recommended target: ${nextTurfTarget?.name || "the next district"}. Push control until tribute and fronts start paying better.`,
    },
    {
      id: "front_money",
      title: ownedFronts > 0 ? "Upgrade a Front" : "Buy a First Front",
      type: "Empire Contract",
      tab: "properties",
      ready: ownedFronts > 0 ? Number(game.cash || 0) >= 600 : Number(game.cash || 0) >= 900,
      reward: "Better income and rank progress",
      risk: "+Heat",
      detail: ownedFronts > 0 ? "Upgrade a property front so your empire earns more while you play." : "Buy your first property front to start building passive income.",
    },
    {
      id: "quiet_city",
      title: heat >= 45 ? "Quiet the Streets" : "Keep Heat Low",
      type: "Risk Contract",
      tab: "heat",
      ready: Number(game.energy || 0) >= 8 || Number(game.cash || 0) >= 500,
      reward: "Lower pressure and safer payouts",
      risk: "Costs cash, crew, or energy",
      detail: heat >= 45 ? "Heat is getting loud. Cool it before the city starts pushing back." : "Heat is under control. Keep it that way while you grow.",
    },
    {
      id: "payback_check",
      title: topRivalThreat?.pressure >= 40 ? "Handle Rival Pressure" : "Scout Rival Noise",
      type: "Rival Contract",
      tab: topRivalThreat?.pressure >= 40 ? "revenge" : "rivals",
      ready: true,
      reward: "Safer streets and fight progress",
      risk: topRivalThreat?.pressure >= 65 ? "Payback close" : "Street risk",
      detail: topRivalThreat ? `${topRivalThreat.rival.name} is at ${topRivalThreat.pressure}/100 pressure.` : "No major rival threat is leading the board yet.",
    },
  ];

  if (activeStreetOpportunity) {
    contracts.unshift({
      id: "wire_lead",
      title: "Resolve Hot City Wire Lead",
      type: "Timed Contract",
      tab: "wire",
      ready: true,
      reward: "Choice reward before the lead goes cold",
      risk: "Timer expires",
      detail: "A temporary City Wire lead is active. Handle it before the street moves on.",
    });
  }

  const readyCount = contracts.filter((contract) => contract.ready).length;
  return { contracts, readyCount, total: contracts.length };
}

function getCityTimeline(game, liveEventPhase, activeStreetOpportunity, cityWireExpired, dailyClaimed, loginRewardClaimed) {
  const now = Date.now();
  const activeLeadMs = activeStreetOpportunity ? Math.max(0, Number(game.cityEventExpiresAt || 0) - now) : 0;
  const eventMs = liveEventPhase?.eventIsActive ? Math.max(0, Number(liveEventPhase.eventEndsAt || 0) - now) : 0;
  const timeline = [
    {
      title: loginRewardClaimed ? "Login reward claimed" : "Login reward ready",
      status: loginRewardClaimed ? "Complete" : "Ready",
      detail: loginRewardClaimed ? "Come back tomorrow to keep the streak alive." : "Claim the free login reward before making your first move.",
      tab: "rewards",
    },
    {
      title: dailyClaimed ? "Daily orders complete" : "Daily orders open",
      status: dailyClaimed ? "Complete" : "Open",
      detail: dailyClaimed ? `Current daily streak: ${game.dailyStreak || 0}.` : "Finish the daily orders to claim the daily payout.",
      tab: "daily",
    },
    {
      title: activeStreetOpportunity ? "City Wire lead active" : cityWireExpired ? "City Wire lead expired" : "City Wire scout available",
      status: activeStreetOpportunity ? formatEventTime(activeLeadMs) : cityWireExpired ? "Expired" : "Ready",
      detail: activeStreetOpportunity ? "Resolve the lead before it goes cold." : "Scout the City Wire when you want a temporary opportunity.",
      tab: "wire",
    },
    {
      title: liveEventPhase?.eventIsActive ? `${liveEvent.shortName} event active` : `${liveEvent.shortName} event ended`,
      status: liveEventPhase?.eventIsActive ? formatEventTime(eventMs) : "Ended",
      detail: liveEventPhase?.eventIsActive ? `${liveEventPhase.name} phase is active.` : "Keep the event structure ready for the next live operation.",
      tab: "event",
    },
    {
      title: "Front income tick",
      status: "Every minute",
      detail: "Owned fronts keep producing income while the app is open.",
      tab: "properties",
    },
  ];
  return timeline;
}

function getOperationsBrief(game, heat, cityControl, income, bossRank, recommendedMove, topRivalThreat, contractBoard) {
  const ownedFronts = Object.values(game.properties || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const danger = heat >= 70 || topRivalThreat?.pressure >= 70 ? "Critical" : heat >= 45 || topRivalThreat?.pressure >= 45 ? "Watch" : "Stable";
  const priorities = [
    recommendedMove,
    contractBoard.contracts.find((contract) => contract.ready),
    heat >= 50 ? { title: "Lower Heat", detail: "Pressure is starting to hurt your operation.", tab: "heat" } : { title: "Grow Income", detail: "Buy or upgrade fronts to make each minute worth more.", tab: "properties" },
  ].filter(Boolean);

  return {
    danger,
    economy: `${money(game.cash)} cash • ${money(income)}/min • ${ownedFronts} fronts`,
    city: `${cityControl}% control • ${bossRank.title}`,
    people: `${game.crew || 0} crew • ${game.respect || 0} respect • ${game.skillPoints || 0} skill pts`,
    rival: topRivalThreat ? `${topRivalThreat.rival.name} ${topRivalThreat.pressure}/100` : "No major rival pressure",
    priorities,
  };
}


function money(value) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

function getMissingRequirementMessage(resources = {}, costs = {}, labels = {}) {
  const missing = [];
  if (Number(resources.cash || 0) < Number(costs.cash || 0)) missing.push(`Need ${money(Number(costs.cash || 0) - Number(resources.cash || 0))} more cash`);
  if (Number(resources.tribute || 0) < Number(costs.tribute || 0)) missing.push(`Need ${Number(costs.tribute || 0) - Number(resources.tribute || 0)} more tribute`);
  if (Number(resources.energy || 0) < Number(costs.energy || 0)) missing.push(`Need ${Number(costs.energy || 0) - Number(resources.energy || 0)} more energy`);
  if (Number(resources.respect || 0) < Number(costs.respect || 0)) missing.push(`Need ${Number(costs.respect || 0) - Number(resources.respect || 0)} more respect`);
  return missing[0] || labels.ready || "Ready";
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

const defaultSettings = {
  musicOn: true,
  sfxOn: true,
  notificationsOn: true,
  reducedMotion: false,
  language: "en",
  beginnerLayout: true,
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    return { ...defaultSettings, ...(saved && typeof saved === "object" ? saved : {}) };
  } catch {
    return { ...defaultSettings };
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

function isLoginRewardClaimed(game) {
  return game.loginRewardClaimedDate === getTodayKey();
}

function getLoginReward(game) {
  const streak = Number(game.loginRewardStreak || 0);
  const milestone = streak > 0 && (streak + 1) % 5 === 0;

  return {
    cash: 900 + streak * 125,
    energy: 60,
    respect: 3 + Math.min(7, Math.floor(streak / 2)),
    skillPoints: milestone ? 1 : 0,
  };
}

function getRewardText(reward) {
  const parts = [];
  if (reward.cash) parts.push(money(reward.cash));
  if (reward.energy) parts.push(`+${reward.energy} Energy`);
  if (reward.respect) parts.push(`+${reward.respect} Respect`);
  if (reward.skillPoints) parts.push(`+${reward.skillPoints} Skill Point${reward.skillPoints === 1 ? "" : "s"}`);
  return parts.join(" • ");
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
  const damageMultiplier = getFrontDamageIncomeMultiplier(game, property.id);
  return Math.round(property.income * owned * bossIncome * districtMultiplier * getPropertyLevelMultiplier(level) * damageMultiplier);
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
    pvpAttackLog: Array.isArray((game || {}).pvpAttackLog) ? (game || {}).pvpAttackLog : [],
    pvpRevengeList: Array.isArray((game || {}).pvpRevengeList) ? (game || {}).pvpRevengeList : [],
    pvpGrudges: { ...startGame.pvpGrudges, ...((game || {}).pvpGrudges || {}) },
    pvpBountyProgress: { ...startGame.pvpBountyProgress, ...((game || {}).pvpBountyProgress || {}) },
    pvpBountiesClaimed: { ...startGame.pvpBountiesClaimed, ...((game || {}).pvpBountiesClaimed || {}) },
    pvpRivalHistory: { ...startGame.pvpRivalHistory, ...((game || {}).pvpRivalHistory || {}) },
    pvpNemesisMap: { ...startGame.pvpNemesisMap, ...((game || {}).pvpNemesisMap || {}) },
    pvpRevengeBonuses: { ...startGame.pvpRevengeBonuses, ...((game || {}).pvpRevengeBonuses || {}) },
    pvpRetaliationTimers: { ...startGame.pvpRetaliationTimers, ...((game || {}).pvpRetaliationTimers || {}) },
    frontDamage: { ...startGame.frontDamage, ...((game || {}).frontDamage || {}) },
    offlineEventRecords: Array.isArray((game || {}).offlineEventRecords) ? (game || {}).offlineEventRecords : [],
    mockStorePurchases: { ...startGame.mockStorePurchases, ...((game || {}).mockStorePurchases || {}) },
    storePromptsSeen: { ...startGame.storePromptsSeen, ...((game || {}).storePromptsSeen || {}) },
    streaks: { ...startGame.streaks, ...((game || {}).streaks || {}) },
  };

  merged.saveVersion = Math.max(6, Number(merged.saveVersion || 1));
  merged.beginnerLayout = typeof merged.beginnerLayout === "boolean" ? merged.beginnerLayout : true;
  merged.simplifiedNav = typeof merged.simplifiedNav === "boolean" ? merged.simplifiedNav : true;
  merged.showAdvancedStatsOnHome = typeof merged.showAdvancedStatsOnHome === "boolean" ? merged.showAdvancedStatsOnHome : false;
  merged.empireDetailsOpen = typeof merged.empireDetailsOpen === "boolean" ? merged.empireDetailsOpen : false;
  merged.hideFirstNightGuidance = Boolean(merged.hideFirstNightGuidance);
  merged.activeShieldUntil = Number(merged.activeShieldUntil || 0);
  merged.vaultCapacityBonus = Number(merged.vaultCapacityBonus || 0);
  merged.vaultExpansionLevel = Number(merged.vaultExpansionLevel || 0);
  merged.respectBoostActions = Number(merged.respectBoostActions || 0);
  merged.language = ["en","nl","es","de","ar"].includes(merged.language) ? merged.language : "en";
  merged.translationVersion = Number(merged.translationVersion || 1);
  merged.lastSeenAt = Number(merged.lastSeenAt || 0);
  merged.lastOfflineEventAt = Number(merged.lastOfflineEventAt || 0);
  if (!merged.playerId) merged.playerId = `local-${Date.now()}`;
  if (!merged.crewName) merged.crewName = `${merged.bossName || "Rookie"} Crew`;

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
    lastActionResult: { title: "Move Complete", detail: message, createdAt: Date.now() },
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
  const [selectedJobChoice, setSelectedJobChoice] = useState("standard");
  const [dismissedStorePrompt, setDismissedStorePrompt] = useState(false);
  const [rewardToast, setRewardToast] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPromptMode, setInstallPromptMode] = useState("native");
  const [installPromptDismissed, setInstallPromptDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "1" || window.localStorage.getItem(INSTALL_PROMPT_ACCEPTED_KEY) === "1";
  });

  const [settings, setSettings] = useState(loadSettings);
  const [offlineEvent, setOfflineEvent] = useState(null);
  const t = useMemo(() => makeTranslator(settings), [settings]);

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
  const playerPowerScore = calculatePowerScore(game, { attack, defense });
  const publicProfile = useMemo(() => getPublicProfileSummary(game, bossClass, { attack, defense }), [game, bossClass, attack, defense]);
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
  const loginReward = getLoginReward(game);
  const loginRewardClaimed = isLoginRewardClaimed(game);
  const bossRank = getBossRank(game, cityControl);
  const recentRewards = (game.log || []).slice(0, 6);
  const activeStreetOpportunity = getActiveStreetOpportunity(game);
  const cityWireLeadLabel = getStreetOpportunityLabel(game);
  const cityWireExpired = Boolean(game.cityEventId) && !activeStreetOpportunity;
  const liveEventPhase = getLiveEventPhase(game);
  const liveEventLeaderboard = useMemo(() => getLiveEventLeaderboard(game), [game.liveEventInfluence, game.bossName]);
  const liveEventRank = liveEventLeaderboard.find((row) => row.isPlayer)?.rank || liveEventLeaderboard.length;
  const liveEventMilestoneReady = Number(game.liveEventInfluence || 0) >= liveEvent.milestoneInfluence;
  const liveEventMilestoneClaimed = Boolean(game.liveEventRewards?.concretePourMilestone);
  const recommendedMove = getRecommendedMove(game, dailyOrders, activeStreetOpportunity, nextCampaignChapter, heat, topRivalThreat);
  const firstSessionMove = getFirstSessionRecommendedMove(game, { heat, topRivalThreat, fallback: recommendedMove, dailyComplete, dailyClaimed, loginReward, loginRewardClaimed });
  const firstNightProgress = useMemo(() => getFirstNightProgress(game), [game]);
  const oneRecommendedMove = useMemo(() => getOneRecommendedMove(game, { dailyOrders, heat, topRivalThreat }), [game, dailyOrders, heat, topRivalThreat]);
  const activeRevengeAlert = useMemo(() => (game.pvpRevengeList || []).find((item) => !item.completed), [game.pvpRevengeList]);
  const activeNemesisCount = useMemo(() => Object.values(game.pvpNemesisMap || {}).filter(Boolean).length, [game.pvpNemesisMap]);
  const activeStorePrompt = useMemo(() => dismissedStorePrompt ? null : getStorePrompt(game), [game, dismissedStorePrompt]);
  const activeStreakCards = useMemo(() => getStreakCards(game), [game.streaks]);
  const beginnerLayoutOn = Boolean(game.beginnerLayout ?? settings.beginnerLayout ?? true);
  const showAdvancedStatsOnHome = !beginnerLayoutOn || Boolean(game.showAdvancedStatsOnHome);
  const coreStats = useMemo(() => [
    { id: "cash", label: "Cash", value: money(game.cash), helper: "Used for upgrades and empire growth.", core: true },
    { id: "energy", label: "Energy", value: `${game.energy}/${game.maxEnergy}`, helper: "Spent to run jobs. Recovers over time.", core: true, warning: Number(game.energy || 0) <= 0 },
    { id: "heat", label: "Heat", value: `${heat}/100`, helper: "Higher heat means more risk.", core: true, warning: heat >= 70 },
    { id: "crew", label: "Crew", value: game.crew || 0, helper: "Helps jobs, fights, and bonuses.", core: true },
  ], [game.cash, game.energy, game.maxEnergy, game.crew, heat, income]);

  const empireDetailStats = useMemo(() => [
    { id: "level", label: "Level / XP", value: `${game.level || 1}`, helper: `${game.xp || 0} XP toward the next boss level` },
    { id: "respect", label: "Respect", value: game.respect || 0, helper: "Street reputation for fights and rivalries" },
    { id: "power", label: "PvP Power", value: `${attack}/${defense}`, helper: "Attack / defense shown mainly on Fight" },
    { id: "vault", label: "Protected Cash", value: money(game.vault), helper: `${money(vaultStats.capacity + Number(game.vaultCapacityBonus || 0))} capacity` },
    { id: "tribute", label: "Tribute", value: game.tribute, helper: "mock store" },
    { id: "event", label: "Event Rank", value: `#${liveEventRank}`, helper: `${game.liveEventInfluence || 0} influence` },
    { id: "fronts", label: "Fronts", value: ownedPropertyCount, helper: `${supplyStats.activeCount} routes` },
    { id: "base", label: "Safehouse", value: safehouseStats.totalLevels, helper: "room levels" },
    { id: "contacts", label: "Contacts", value: `${contactStats.unlockedCount}/${underworldContacts.length}`, helper: `${contactStats.totalLevels} trust` },
    { id: "lieutenants", label: "Lieutenants", value: `${lieutenantStats.unlockedCount}/${lieutenants.length}`, helper: `${lieutenantStats.assignedCount} assigned` },
    { id: "skill", label: "Boss Skills", value: game.skillPoints || 0, helper: `${skillStats.totalRanks} ranks` },
    { id: "stamina", label: "Stamina", value: `${game.stamina}/${game.maxStamina}`, helper: "attacks" },
    { id: "bounties", label: "Bounties", value: Object.keys(game.pvpBountiesClaimed || {}).length, helper: "claimed" },
    { id: "campaign", label: "Campaign", value: `${campaignClaimedCount}/${campaignChapters.length}`, helper: "chapters" },
    { id: "daily", label: "Daily", value: dailyClaimed ? "Claimed" : `${dailyOrders.filter((order) => order.done).length}/${dailyOrders.length}`, helper: `${game.dailyStreak || 0} streak` },
  ], [game, vaultStats, liveEventRank, ownedPropertyCount, supplyStats.activeCount, safehouseStats.totalLevels, contactStats, lieutenantStats, skillStats.totalRanks, attack, defense, campaignClaimedCount, campaignChapters.length, dailyClaimed, dailyOrders]);
  const clinicOptions = useMemo(() => getClinicOptions(game, getContactStats(game).clinicDiscount), [game]);
  const lockedSystemCards = systemUnlocks.map((system) => {
    const level = Number(game.level || 1);
    const ownedFronts = Object.values(game.properties || {}).reduce((sum, value) => sum + Number(value || 0), 0);
    const unlocked = system.id === "lieutenants"
      ? level >= Number(system.level || 1) || Number(game.crew || 0) >= 15
      : system.id === "event"
        ? Number(game.jobsRun || 0) > 0
        : system.id === "supplyRoutes"
          ? ownedFronts >= 2
          : level >= Number(system.level || 1);
    return { ...system, unlocked };
  });
  const balanceSnapshot = getBalanceSnapshot(game, {
    income,
    heat,
    crewLoyalty,
    topRivalThreat,
    nextLevelXp: xpNeeded(game.level || 1),
    estimatedJobCash: jobs[0] ? `${money(jobs[0].cash[0])}-${money(jobs[0].cash[1])}` : "No jobs",
    firstFrontCost: properties[0]?.cost || 900,
    averageJobCash: jobs[0] ? Math.round((Number(jobs[0].cash?.[0] || 0) + Number(jobs[0].cash?.[1] || 0)) / 2) : 145,
    averageJobXp: jobs[0]?.xp || 8,
    lockedSystems: lockedSystemCards,
  });
  const achievements = useMemo(() => getAchievementBadges(game, cityControl, bossRank), [game, cityControl, bossRank]);
  const intelFeed = useMemo(() => getIntelFeed(game, heat, topRivalThreat, cityControl, bossRank, recommendedMove), [game, heat, topRivalThreat, cityControl, bossRank, recommendedMove]);
  const streetChatFeed = useMemo(() => getDynamicStreetChatFeed(game, { heat, topRivalThreat, cityControl, activeStreetOpportunity, recommendedMove, pvpLog: game.pvpAttackLog, grudgeMap: game.pvpGrudges }), [game, heat, topRivalThreat, cityControl, activeStreetOpportunity, recommendedMove]);
  const contractBoard = useMemo(() => getContractBoard(game, heat, cityControl, topRivalThreat, nextTurfTarget, activeStreetOpportunity), [game, heat, cityControl, topRivalThreat, nextTurfTarget, activeStreetOpportunity]);
  const cityTimeline = useMemo(() => getCityTimeline(game, liveEventPhase, activeStreetOpportunity, cityWireExpired, dailyClaimed, loginRewardClaimed), [game, liveEventPhase, activeStreetOpportunity, cityWireExpired, dailyClaimed, loginRewardClaimed]);
  const operationsBrief = useMemo(() => getOperationsBrief(game, heat, cityControl, income, bossRank, recommendedMove, topRivalThreat, contractBoard), [game, heat, cityControl, income, bossRank, recommendedMove, topRivalThreat, contractBoard]);

  useEffect(() => {
    if (!session?.username) return;
    localStorage.setItem(getUserSaveKey(session.username), JSON.stringify(game));
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game, session]);

  useEffect(() => {
    if (!game.lastActionResult) return;
    setRewardToast(game.lastActionResult);
  }, [game.lastActionResult]);

  useEffect(() => {
    if (!game.started) return;
    setGame((old) => ensureDailyState(old));
  }, [game.started]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (typeof document !== "undefined") {
      const lang = settings.language || "en";
      const dir = getDirectionForLanguage(lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
      document.documentElement.classList.toggle("app-rtl", dir === "rtl");
      document.documentElement.classList.toggle("reduce-motion", Boolean(settings.reducedMotion));
    }
  }, [settings]);


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
      const baseControlGain = Math.max(1, Math.round(job.control * bossClass.control + jobLieutenantStats.jobControlBonus));
      const xpAward = job.xp + jobLieutenantStats.jobXpBonus;
      const crackdown = currentHeat >= 85 && rand(1, 100) <= 35;
      const outcome = chooseJobOutcome(old, job);
      const choice = jobChoices.find((item) => item.id === selectedJobChoice) || jobChoices[1];
      const finalPayout = Math.max(25, Math.round(payout * Number(outcome.cashMod || 1) * Number(choice.cashMod || 1)));
      const finalXpAward = Math.max(1, Math.round(xpAward * Number(outcome.xpMod || 1)));
      const finalHeatGain = Math.max(0, heatGain + Number(outcome.heatMod || 0) + Number(choice.heatMod || 0));
      const controlGain = Math.max(1, Math.round(baseControlGain * Number(choice.controlMod || 1)));
      const healthShift = Number(outcome.healthMod || 0);
      const loyaltyShift = Number(outcome.loyaltyMod || 0);

      let next = {
        ...old,
        heat: clamp(currentHeat + finalHeatGain, 0, 100),
        energy: old.energy - job.energy,
        cash: old.cash + finalPayout,
        jobsRun: old.jobsRun + 1,
        respect: Number(old.respect || 0) + 1,
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) + 1 + loyaltyShift, 0, 100),
        territory: {
          ...old.territory,
          [job.district]: clamp((old.territory[job.district] || 0) + controlGain, 0, 100),
        },
      };

      next = addDailyProgress(next, "jobs", 1);
      next = addDailyProgress(next, "turf", controlGain);
      next = addXp(next, finalXpAward);
      next = updateActionStreaks(next, "job");
      if (healthShift) next = { ...next, health: clamp(Number(next.health || 0) + healthShift, 0, Number(next.maxHealth || 100)) };
      if (outcome.rivalPressure || choice.rivalNotice) next = addDistrictRivalPressure(next, job.district, Number(outcome.rivalPressure || 0) + Number(choice.rivalNotice || 0), `${outcome.title} / ${choice.label} during ${job.name}`);
      next = { ...next, lastJobOutcome: outcome.id };
      next = addDistrictRivalPressure(next, job.district, 3 + job.level, `running ${job.name}`);
      const eventInfluence = getLiveEventJobInfluence(job, finalPayout, controlGain, old);
      if (eventInfluence > 0) {
        next = addLiveEventInfluence(next, eventInfluence);
      }
      next = maybeRivalRetaliation(next, job.district, currentHeat >= 85 ? 28 : currentHeat >= 60 ? 16 : 6);
      const eventLine = eventInfluence > 0 ? ` Concrete Pour +${eventInfluence} Influence.` : "";

      if (crackdown) {
        const fine = Math.min(next.cash, rand(175, 425));
        const damage = rand(4, 12);
        next = {
          ...next,
          cash: next.cash - fine,
          health: Math.max(0, next.health - damage),
        };
        next = applyDroppedConsequence(next, "a crackdown");
        showResult({
          type: "Job Result",
          title: `${job.name} Complete`,
          flavor: "The money came in, but the city pushed back.",
          details: [`${choice.label}`, `${outcome.title}`, `+${money(finalPayout)} Cash`, `+${finalXpAward} XP`, `+${controlGain}% ${districtName(job.district)} Turf`, `+${finalHeatGain} Heat`, healthShift ? `${healthShift} Health` : null, loyaltyShift ? `${loyaltyShift > 0 ? "+" : ""}${loyaltyShift} Crew Loyalty` : null, `-${money(fine)} Fine`, `-${damage} Health`].filter(Boolean),
        });

        return addLog(
          next,
          `${job.name}: ${outcome.title}. Earned ${money(finalPayout)}, ${finalXpAward} XP, +${controlGain}% ${districtName(job.district)} control, and Heat +${finalHeatGain}.${eventLine} Crackdown cost ${money(fine)}.`
        );
      }

      showResult({
        type: "Job Result",
        title: `${job.name}: ${outcome.title}`,
        flavor: outcome.flavor || "The streets are starting to know your name.",
        details: [`${choice.label}`, `+${money(finalPayout)} Cash`, `+${finalXpAward} XP`, `+${controlGain}% ${districtName(job.district)} Turf`, `+${finalHeatGain} Heat`, healthShift ? `${healthShift} Health` : null, loyaltyShift ? `${loyaltyShift > 0 ? "+" : ""}${loyaltyShift} Crew Loyalty` : null, outcome.rivalPressure ? `+${outcome.rivalPressure} Rival Pressure` : null, eventInfluence > 0 ? `+${eventInfluence} Event Influence` : null].filter(Boolean),
      });

      return addLog(
        next,
        `${job.name}: ${choice.label} / ${outcome.title}. Earned ${money(finalPayout)}, ${finalXpAward} XP, +${controlGain}% ${districtName(job.district)} control, and Heat +${finalHeatGain}.${eventLine}`
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

      showResult({
        type: "Front Purchased",
        title: property.name,
        flavor: "That little business now has your money behind it.",
        details: [`-${money(property.cost)} Cash`, `+1 Front`, `+1 Respect`, `+${heatGain} Heat`],
      });

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


  function repairPropertyFront(property) {
    setGame((old) => {
      const outcome = repairFrontLogic(old, property);
      if (outcome.blocked) {
        showResult({ title: "Repair Blocked", flavor: outcome.reason, details: ["Damaged fronts earn less until repaired."] });
        return old;
      }
      showResult(outcome.result);
      return addLog(outcome.nextGame, `${property.name} repaired. Income penalty removed.`);
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
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) + 1 + loyaltyShift, 0, 100),
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

        showResult({
          type: "Rival Result",
          title: `Victory over ${rival.name}`,
          flavor: "Your name just got heavier in the streets.",
          details: [`+${money(payout)} Cash`, `+${rival.xp} XP`, `+${rival.control}% ${districtName(rival.district)} Turf`, `+${heatGain} Heat`, `+3 Respect`],
        });

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
      next = applyDroppedConsequence(next, rival.name);
      showResult({
        type: "Rival Result",
        title: `Lost to ${rival.name}`,
        flavor: "The city does not forgive weakness, but you can recover.",
        details: [`-${money(loss)} Cash`, `-${damage} Health`, `+${heatGain} Heat`, `-4 Crew Loyalty`],
      });

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
      if (amount <= 0 && Number(old.cash || 0) <= 0) { showResult({ title: "Vault Blocked", flavor: "No available cash to deposit.", details: ["Run jobs or collect income first."] }); return addLog(old, "No cash available to vault."); }
      if (amount <= 0) { showResult({ title: "Vault Full", flavor: "Vault is full. Upgrade capacity to store more cash.", details: ["Upgrade Vault Security"] }); return addLog(old, "The vault is full. Upgrade vault security before stashing more cash."); }

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
      if (old.vault <= 0) { showResult({ title: "Vault Empty", flavor: "Vault is empty. Deposit cash first.", details: ["Vault Cash: $0", `Capacity: ${money(getVaultStats(old).capacity)}`] }); return addLog(old, "The vault is empty."); }

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
      if (level >= 5) { showResult({ title: "Vault Maxed", flavor: "Vault security is already maxed out.", details: ["Level 5/5"] }); return addLog(old, "Vault security is already maxed out."); }

      const cost = getVaultUpgradeCost(level);
      if (Number(old.cash || 0) < cost.cash) { const msg = `Need ${money(cost.cash - Number(old.cash || 0))} more cash.`; showResult({ title: "Vault Upgrade Blocked", flavor: msg, details: [msg] }); return addLog(old, `You need ${money(cost.cash)} to upgrade vault security.`); }
      if (Number(old.tribute || 0) < cost.tribute) { const msg = `Need ${cost.tribute - Number(old.tribute || 0)} more tribute.`; showResult({ title: "Vault Upgrade Blocked", flavor: msg, details: [msg] }); return addLog(old, `You need ${cost.tribute} Tribute to upgrade vault security.`); }
      if (Number(old.energy || 0) < cost.energy) { const msg = `Need ${cost.energy - Number(old.energy || 0)} more energy.`; showResult({ title: "Vault Upgrade Blocked", flavor: msg, details: [msg] }); return addLog(old, `You need ${cost.energy} Energy to upgrade vault security.`); }

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
    const fullOption = getClinicOptions(game, getContactStats(game).clinicDiscount).find((option) => option.id === "full");
    if (fullOption && !fullOption.disabled) return useClinicTreatment("full");
    return useClinicTreatment("patch");
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
      if (level >= (room.max || 5)) { showResult({ title: `${room.name} Maxed`, flavor: `${room.name} is already fully upgraded.`, details: [`Level ${level}/${room.max || 5}`] }); return addLog(old, `${room.name} is already fully upgraded.`); }

      const cost = getSafehouseUpgradeCost(room, level);
      if (Number(old.cash || 0) < cost.cash) { const msg = `Need ${money(cost.cash - Number(old.cash || 0))} more cash.`; showResult({ title: "Safehouse Upgrade Blocked", flavor: msg, details: [room.name, msg] }); return addLog(old, `You need ${money(cost.cash)} to upgrade ${room.name}.`); }
      if (Number(old.tribute || 0) < cost.tribute) { const msg = `Need ${cost.tribute - Number(old.tribute || 0)} more tribute.`; showResult({ title: "Safehouse Upgrade Blocked", flavor: msg, details: [room.name, msg] }); return addLog(old, `You need ${cost.tribute} Tribute to upgrade ${room.name}.`); }
      if (Number(old.energy || 0) < cost.energy) { const msg = `Need ${cost.energy - Number(old.energy || 0)} more energy.`; showResult({ title: "Safehouse Upgrade Blocked", flavor: msg, details: [room.name, msg] }); return addLog(old, `You need ${cost.energy} Energy to upgrade ${room.name}.`); }

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

      showResult({ title: `${room.name} Upgraded`, flavor: room.effect, details: [`Level ${nextLevel}/${room.max || 5}`, `-${money(cost.cash)} Cash`, `-${cost.tribute} Tribute`, `-${cost.energy} Energy`, "+1 Respect"] });

      return addLog(next, `${room.name} upgraded to Level ${nextLevel}/${room.max || 5}. ${room.effect}.`);
    });
  }


  function upgradeContact(contact) {
    setGame((old) => {
      const level = getContactLevel(old, contact.id);
      if (level >= (contact.max || 5)) { showResult({ title: "Contact Maxed", flavor: `${contact.name} is already fully connected.`, details: [`Level ${level}/${contact.max || 5}`] }); return addLog(old, `${contact.name} is already fully connected.`); }

      const cost = getContactUpgradeCost(contact, level);
      if (Number(old.cash || 0) < cost.cash) { const msg = `Need ${money(cost.cash - Number(old.cash || 0))} more cash.`; showResult({ title: "Contact Locked", flavor: msg, details: [contact.name, msg] }); return addLog(old, `You need ${money(cost.cash)} to build trust with ${contact.name}.`); }
      if (Number(old.respect || 0) < cost.respect) { const msg = `Need ${cost.respect - Number(old.respect || 0)} more respect.`; showResult({ title: "Contact Locked", flavor: msg, details: [contact.name, msg] }); return addLog(old, `You need ${cost.respect} Respect to build trust with ${contact.name}.`); }
      if (Number(old.tribute || 0) < cost.tribute) { const msg = `Need ${cost.tribute - Number(old.tribute || 0)} more tribute.`; showResult({ title: "Contact Locked", flavor: msg, details: [contact.name, msg] }); return addLog(old, `You need ${cost.tribute} Tribute to build trust with ${contact.name}.`); }
      if (Number(old.energy || 0) < cost.energy) { const msg = `Need ${cost.energy - Number(old.energy || 0)} more energy.`; showResult({ title: "Contact Locked", flavor: msg, details: [contact.name, msg] }); return addLog(old, `You need ${cost.energy} Energy to build trust with ${contact.name}.`); }

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

      showResult({ title: `${contact.name} Connected`, flavor: contact.effect, details: [`Trust Level ${nextLevel}/${contact.max || 5}`, `-${money(cost.cash)} Cash`, `-${cost.respect} Respect cost`, `-${cost.tribute} Tribute`, `-${cost.energy} Energy`] });

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

  function claimLoginReward() {
    setGame((old) => {
      const today = getTodayKey();
      if (old.loginRewardClaimedDate === today) return addLog(old, "Daily login reward has already been claimed today.");

      const reward = getLoginReward(old);
      const yesterday = getYesterdayKey();
      const streak = old.loginRewardClaimedDate === yesterday ? Number(old.loginRewardStreak || 0) + 1 : 1;

      showResult({
        type: "Reward Claimed",
        title: "Daily Login Reward",
        flavor: "Daily habits turn into street power.",
        details: [getRewardText(reward), `Streak ${streak}`],
      });

      return addLog({
        ...old,
        cash: Number(old.cash || 0) + reward.cash,
        energy: Math.min(Number(old.maxEnergy || 100) + 200, Number(old.energy || 0) + reward.energy),
        respect: Number(old.respect || 0) + reward.respect,
        skillPoints: Number(old.skillPoints || 0) + reward.skillPoints,
        loginRewardClaimedDate: today,
        loginRewardStreak: streak,
      }, `Login reward claimed. ${getRewardText(reward)}.`);
    });
  }

  function districtName(id) {
    return getDistrictName(id);
  }

  function showResult(result) {
    setActionResult(result);
    if (result?.title) setRewardToast({ title: result.title, detail: result.flavor || result.detail || "The city changed because of your move." });
  }

  function getPvpGrudgeLabel(value) {
    const score = Number(value || 0);
    if (score >= 100) return "War";
    if (score >= 75) return "Personal";
    if (score >= 50) return "Heated";
    if (score >= 25) return "Watching";
    return "Cold";
  }

  function addPvpLogEntry(old, entry) {
    const pvpAttackLog = [
      { id: `pvp-${Date.now()}-${Math.random().toString(16).slice(2)}`, time: Date.now(), timeText: "just now", ...entry },
      ...((old.pvpAttackLog || []).slice(0, 39)),
    ];
    return { ...old, pvpAttackLog };
  }

  function attackMockPlayer(target) {
    setGame((old) => {
      if (Number(old.activeShieldUntil || 0) > Date.now()) {
        showResult({ title: "Shield Active", flavor: "Lay Low Shield protects what is yours, but you cannot attack while hiding.", details: ["Wait for the shield to expire or keep building your empire."] });
        return old;
      }
      if (Number(old.health || 0) <= 0) {
        showResult({ title: "You Got Dropped", flavor: "Use the Clinic before making another risky move.", details: ["Health is too low for a hit."] });
        return old;
      }
      if (Number(old.stamina || 0) < 5) {
        showResult({ title: "Not Enough Stamina", flavor: "Your crew needs a minute before another hit.", details: ["Need 5 Stamina"] });
        return old;
      }

      const result = simulatePvpAttack({ game: old, target, playerAttack: attack, playerDefense: defense, powerScore: playerPowerScore });
      const oldDistrictControl = Number(old.territory?.[target.favoriteDistrict] || 0);
      const cash = Math.max(0, Number(old.cash || 0) + result.cashDelta);
      const grudgeMap = { ...(old.pvpGrudges || {}), [target.id]: clamp(Number(old.pvpGrudges?.[target.id] || 0) + result.grudgeGain, 0, 125) };
      const bountyProgress = { ...(old.pvpBountyProgress || {}) };
      if (result.win && target.powerScore > playerPowerScore) bountyProgress.stronger_crews = Number(bountyProgress.stronger_crews || 0) + 1;
      if (result.cashDelta > 0) bountyProgress.rival_cash = Number(bountyProgress.rival_cash || 0) + result.cashDelta;
      if (Object.values(grudgeMap).some((value) => Number(value || 0) >= 100)) bountyProgress.war_grudge = 1;

      const revengeItem = result.win ? null : {
        id: `rev-${target.id}-${Date.now()}`,
        targetId: target.id,
        bossName: target.bossName,
        crewName: target.crewName,
        reason: `${target.bossName} turned your hit around and took cash.`,
        cashTaken: Math.abs(result.cashDelta),
        powerScore: target.powerScore,
        reward: `+${Math.max(10, Math.round(target.powerScore / 12))} Respect`,
        risk: result.outcome,
      };
      const previousHistory = old.pvpRivalHistory?.[target.id] || {};
      const rivalHistory = {
        ...(old.pvpRivalHistory || {}),
        [target.id]: {
          ...previousHistory,
          playerAttacks: Number(previousHistory.playerAttacks || 0) + 1,
          rivalAttacks: Number(previousHistory.rivalAttacks || 0) + (result.win ? 0 : 1),
          cashStolenFromThem: Number(previousHistory.cashStolenFromThem || 0) + Math.max(0, result.cashDelta),
          cashStolenFromYou: Number(previousHistory.cashStolenFromYou || 0) + Math.max(0, -result.cashDelta),
          lastEvent: result.win ? `You hit them for $${Math.max(0, result.cashDelta).toLocaleString()}` : `They turned the hit around for $${Math.max(0, -result.cashDelta).toLocaleString()}`,
        },
      };

      let next = {
        ...old,
        cash,
        respect: Math.max(0, Number(old.respect || 0) + result.respectDelta),
        health: clamp(Number(old.health || 0) - result.healthLoss, 0, Number(old.maxHealth || 100)),
        heat: clamp(Number(old.heat || 0) + result.heatGain, 0, 100),
        stamina: Math.max(0, Number(old.stamina || 0) - 5),
        pvpGrudges: grudgeMap,
        pvpRivalHistory: rivalHistory,
        pvpBountyProgress: bountyProgress,
        pvpCashStolen: Number(old.pvpCashStolen || 0) + Math.max(0, result.cashDelta),
        territory: result.turfGain > 0 ? { ...old.territory, [target.favoriteDistrict]: clamp(oldDistrictControl + result.turfGain, 0, 100) } : old.territory,
        pvpRevengeList: revengeItem ? [revengeItem, ...((old.pvpRevengeList || []).slice(0, 14))] : (old.pvpRevengeList || []),
      };

      const risk = getRetaliationRisk(next, target.id, result.revengeRisk);
      next = {
        ...next,
        pvpRetaliationTimers: { ...(next.pvpRetaliationTimers || {}), [target.id]: { risk: risk.label, score: risk.score, createdAt: Date.now(), dueAfterActions: result.win ? 4 : 2 } },
        pvpRevengeBonuses: result.win ? (next.pvpRevengeBonuses || {}) : { ...(next.pvpRevengeBonuses || {}), [target.id]: { cashMultiplier: 1.15, respectMultiplier: 1.25, expiresAt: Date.now() + 1000 * 60 * 60 * 24 } },
      };
      const wasNemesis = Boolean(old.pvpNemesisMap?.[target.id]);
      next = updateNemesisMap(next, target.id);
      const becameNemesis = !wasNemesis && Boolean(next.pvpNemesisMap?.[target.id]);
      if (!result.win && Math.random() > 0.45) {
        const damaged = damageRandomFront(next, properties, result.outcome === "Rival Trap" ? 32 : 20);
        next = damaged.nextGame;
        if (damaged.damagedFront) next = addLog(next, `${target.bossName} damaged ${damaged.damagedFront.name}. Income reduced until repaired.`);
      }
      const logLine = makeAttackLogLine(target, result);
      next = addPvpLogEntry(next, { title: result.win ? "Hit Successful" : "Hit Went Bad", text: logLine, targetId: target.id, outcome: result.outcome });
      next = addLog(next, logLine);
      next = applyDroppedConsequence(next, target.crewName);

      showResult({
        title: result.win ? "Hit Successful" : "Hit Failed",
        flavor: makeStreetChatLine(target, result),
        details: [
          result.cashDelta >= 0 ? `+$${result.cashDelta.toLocaleString()} Cash` : `-$${Math.abs(result.cashDelta).toLocaleString()} Cash`,
          `${result.respectDelta >= 0 ? "+" : ""}${result.respectDelta} Respect`,
          `+${result.heatGain} Heat`,
          `-${result.healthLoss} Health`,
          result.turfGain ? `+${result.turfGain}% ${getDistrictName(target.favoriteDistrict)} Turf` : `Revenge risk ${result.revengeRisk}%`,
          `Grudge Level: ${getPvpGrudgeLabel(grudgeMap[target.id])}`,
          `Retaliation Risk: ${risk.label}`,
          becameNemesis ? `${target.bossName} has become your Nemesis.` : `${target.crewName} ${result.win ? "noticed" : "is talking about it"}.`,
        ],
      });

      return next;
    });
  }

  function retaliateAgainst(item) {
    const target = mockPlayers.find((player) => player.id === item.targetId) || mockPlayers[0];
    setGame((old) => {
      if (Number(old.activeShieldUntil || 0) > Date.now()) {
        showResult({ title: "Shield Active", flavor: "You cannot retaliate while Lay Low Shield is active.", details: ["Protection has a cost."] });
        return old;
      }
      if (Number(old.stamina || 0) < 5) {
        showResult({ title: "Not Enough Stamina", flavor: "Revenge takes energy from the crew.", details: ["Need 5 Stamina", "Try the mock Stamina Refill or wait."] });
        return old;
      }
      const bonus = old.pvpRevengeBonuses?.[target.id];
      const bonusActive = bonus && Number(bonus.expiresAt || 0) > Date.now();
      const respectGain = Math.round(Math.max(10, Number(target.powerScore || 100) / 12) * (bonusActive ? 1.25 : 1));
      const cashGain = Math.round(Math.max(500, Number(target.powerScore || 100) * 3.5) * (bonusActive ? 1.15 : 1));
      const bountyProgress = { ...(old.pvpBountyProgress || {}), revenge_hits: Number(old.pvpBountyProgress?.revenge_hits || 0) + 1 };
      const previousHistory = old.pvpRivalHistory?.[target.id] || {};
      const rivalHistory = {
        ...(old.pvpRivalHistory || {}),
        [target.id]: {
          ...previousHistory,
          revengeWins: Number(previousHistory.revengeWins || 0) + 1,
          cashStolenFromThem: Number(previousHistory.cashStolenFromThem || 0) + cashGain,
          lastEvent: `You completed revenge for $${cashGain.toLocaleString()}`,
        },
      };
      let next = {
        ...old,
        cash: Number(old.cash || 0) + cashGain,
        respect: Number(old.respect || 0) + respectGain,
        heat: clamp(Number(old.heat || 0) + 4, 0, 100),
        stamina: Math.max(0, Number(old.stamina || 0) - 5),
        pvpRevengeWins: Number(old.pvpRevengeWins || 0) + 1,
        pvpBountyProgress: bountyProgress,
        pvpRivalHistory: rivalHistory,
        pvpRevengeList: (old.pvpRevengeList || []).filter((row) => row.id !== item.id),
        pvpGrudges: { ...(old.pvpGrudges || {}), [target.id]: Math.max(0, Number(old.pvpGrudges?.[target.id] || 0) - 12) },
        pvpRevengeBonuses: { ...(old.pvpRevengeBonuses || {}), [target.id]: null },
      };
      next = updateActionStreaks(next, "revenge");
      const line = `You settled the score with ${target.bossName}. The ${target.crewName} will remember it.`;
      next = addPvpLogEntry(next, { title: "Revenge Completed", text: line, targetId: target.id, outcome: "Retaliation" });
      next = addLog(next, line);
      showResult({ title: "Revenge Completed", flavor: target.revengeLine, details: [`+$${cashGain.toLocaleString()} Cash`, `+${respectGain} Respect`, "+4 Heat"] });
      return next;
    });
  }

  function updateDefensePosture(posture) {
    setGame((old) => {
      const cost = Number(posture.cost || 0);
      if (Number(old.cash || 0) < cost) {
        showResult({ title: "Not Enough Cash", flavor: `${posture.name} costs ${money(cost)} to set up.`, details: ["Run jobs or collect income first."] });
        return old;
      }
      let next = {
        ...old,
        cash: Number(old.cash || 0) - cost,
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) - Number(posture.loyaltyCost || 0), 0, 100),
        heat: clamp(Number(old.heat || 0) + Number(posture.heatMod || 0), 0, 100),
        pvpDefensePosture: posture.id,
      };
      next = addPvpLogEntry(next, { title: "Defense Updated", text: `Your crew switched to ${posture.name}.`, outcome: posture.id });
      showResult({ title: "Defense Updated", flavor: posture.desc, details: [cost ? `-${money(cost)} Cash` : "No cash cost", `Heat ${posture.heatMod >= 0 ? "+" : ""}${posture.heatMod || 0}`] });
      return next;
    });
  }

  function claimPvpBounty(bounty) {
    setGame((old) => {
      if (old.pvpBountiesClaimed?.[bounty.id]) return old;
      if (Number(old.pvpBountyProgress?.[bounty.id] || 0) < Number(bounty.target || 1)) return old;
      const next = addLog({
        ...old,
        cash: Number(old.cash || 0) + Number(bounty.reward.cash || 0),
        respect: Number(old.respect || 0) + Number(bounty.reward.respect || 0),
        pvpBountiesClaimed: { ...(old.pvpBountiesClaimed || {}), [bounty.id]: true },
      }, `Bounty claimed: ${bounty.title}.`);
      showResult({ title: "Bounty Claimed", flavor: bounty.desc, details: [`+$${Number(bounty.reward.cash || 0).toLocaleString()} Cash`, `+${bounty.reward.respect} Respect`] });
      return next;
    });
  }

  function exportCurrentSave() {
    const payload = { exportedAt: new Date().toISOString(), app: "Shadow Syndicate", game: normalizeGame(game), users };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shadow-syndicate-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showResult({ title: "Save Exported", flavor: "Your local save backup downloaded as JSON.", details: ["Keep it somewhere safe before big updates."] });
  }

  function importCurrentSave(file) {
    if (!file) return "Choose a save file first.";
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const importedGame = parsed.game || parsed;
        if (!importedGame || typeof importedGame !== "object") throw new Error("Bad save");
        const nextGame = normalizeGame(importedGame);
        setGame(nextGame);
        if (session?.username) localStorage.setItem(getUserSaveKey(session.username), JSON.stringify(nextGame));
        showResult({ title: "Save Imported", flavor: "Your local save was loaded safely.", details: [`Boss: ${nextGame.bossName || "Unknown"}`, `Level ${nextGame.level || 1}`] });
      } catch {
        showResult({ title: "Import Failed", flavor: "That file did not look like a valid Shadow Syndicate save.", details: ["Nothing was replaced."] });
      }
    };
    reader.readAsText(file);
    return "Import started.";
  }

  function applyDroppedConsequence(next, source = "the streets") {
    if (Number(next.health || 0) > 0) return next;
    const cashLoss = Math.min(Number(next.cash || 0), Math.max(75, Math.round(Number(next.cash || 0) * 0.08)));
    return addLog({
      ...next,
      cash: Number(next.cash || 0) - cashLoss,
      crewLoyalty: clamp(Number(next.crewLoyalty ?? 75) - 3, 0, 100),
      heat: clamp(Number(next.heat || 0) + 3, 0, 100),
    }, `You got dropped by ${source}. Lost ${money(cashLoss)}, crew loyalty slipped, and Heat rose +3. Use Emergency Recovery at the Clinic.`);
  }

  function useClinicTreatment(optionId) {
    setGame((old) => {
      const options = getClinicOptions(old, getContactStats(old).clinicDiscount);
      const option = options.find((item) => item.id === optionId);
      if (!option) return old;
      if (option.disabled) return addLog(old, `${option.title} is not available right now.`);

      const maxHealth = Number(old.maxHealth || 100);
      const currentHealth = Number(old.health || 0);
      const newHealth = option.full ? maxHealth : clamp(currentHealth + Number(option.healAmount || 0), 0, maxHealth);
      const heatReduction = Number(option.heatReduction || 0);
      const loyaltyLoss = Number(option.loyaltyLoss || 0);
      const next = {
        ...old,
        cash: Number(old.cash || 0) - Number(option.cost || 0),
        health: newHealth,
        heat: Math.max(0, Number(old.heat || 0) - heatReduction),
        crewLoyalty: clamp(Number(old.crewLoyalty ?? 75) - loyaltyLoss, 0, 100),
      };

      showResult({
        type: "Clinic Result",
        title: option.title,
        flavor: option.emergency ? "You are back on your feet, but the crew noticed." : "The boss is patched up and ready for the next move.",
        details: [
          `-${money(option.cost)} Cash`,
          `Health ${newHealth}/${maxHealth}`,
          heatReduction > 0 ? `-${heatReduction} Heat` : null,
          loyaltyLoss > 0 ? `-${loyaltyLoss} Crew Loyalty` : null,
        ].filter(Boolean),
      });

      return addLog(next, `${option.title} complete. Health ${newHealth}/${maxHealth}${heatReduction ? `, Heat -${heatReduction}` : ""}${loyaltyLoss ? `, Crew Loyalty -${loyaltyLoss}` : ""}.`);
    });
  }

  function goToTab(nextTab) {
    setTab(nextTab);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  }

  function toggleBeginnerLayout() {
    setSettings((old) => ({ ...old, beginnerLayout: !old.beginnerLayout }));
    setGame((old) => ({ ...old, beginnerLayout: !Boolean(old.beginnerLayout) }));
  }

  function purchaseMockStoreItem(item) {
    const action = applyMockStorePurchase(game, item, { clamp });
    if (action.result) showResult(action.result);
    if (action.blocked) return;
    let next = action.nextGame;
    if (action.logMessage) next = addLog(next, action.logMessage);
    if (action.streetChatMessage) next = { ...next, lastStreetChatMessage: action.streetChatMessage };
    setGame(next);
  }

  function updateSetting(key) {
    setSettings((old) => ({ ...old, [key]: !old[key] }));
  }

  function reopenInstallPrompt() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(INSTALL_PROMPT_DISMISSED_KEY);
    setInstallPromptDismissed(false);

    const isStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
    if (isStandalone) return;

    const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent || "") && /safari/i.test(window.navigator.userAgent || "");
    if (isiOS) {
      setInstallPromptMode("ios");
      setShowInstallPrompt(true);
      return;
    }

    if (deferredInstallPrompt) {
      setInstallPromptMode("native");
      setShowInstallPrompt(true);
    }
  }

  function resetInstallPromptMemory() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(INSTALL_PROMPT_DISMISSED_KEY);
    window.localStorage.removeItem(INSTALL_PROMPT_ACCEPTED_KEY);
    setInstallPromptDismissed(false);
  }

  const isInstalled = typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true);
  const installReady = Boolean(deferredInstallPrompt) || installPromptMode === "ios";

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

  useEffect(() => {
    if (!session?.username || !game?.started || offlineEvent) return;
    if (!shouldRunOfflineEvent(game)) {
      setGame((old) => ({ ...old, lastSeenAt: Date.now() }));
      return;
    }
    const simulated = simulateOfflineEvent(game, mockPlayers, defensePostures);
    if (simulated?.event) {
      setOfflineEvent(simulated.event);
      setGame(normalizeGame({ ...simulated.nextGame, lastSeenAt: Date.now() }));
    }
  }, [session?.username, game?.started]);

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
      <RewardToast message={rewardToast} onClose={() => setRewardToast(null)} />
      <ActionResultCard result={actionResult} onClose={() => setActionResult(null)} />
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
                <button type="button" className="secondary compact-button" onClick={() => goToTab("account")}>
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

      <div className="home-alert-strip">
        <WhileYouWereGoneCard event={offlineEvent} onClose={() => setOfflineEvent(null)} onOpenPvp={() => goToTab("pvp")} />
      </div>

      <SimplifiedStats stats={coreStats} beginner={beginnerLayoutOn}>
        <HealthStat current={game.health} max={game.maxHealth} cash={game.cash} onHeal={healBoss} />
      </SimplifiedStats>
      <EmpireDetails stats={empireDetailStats} defaultOpen={showAdvancedStatsOnHome} showToggle homeMode onToggle={() => setGame((old) => ({ ...old, showAdvancedStatsOnHome: !Boolean(old.showAdvancedStatsOnHome) }))} />

      <nav className="main-nav simplified-main-nav" aria-label="Game sections">
        {mainNavItems.map((item) => (
          <button key={item.tab} type="button" onClick={() => goToTab(item.tab)} className={tab === item.tab || (item.tab === "pvp" && tab === "fight") ? "active" : ""}>
            {item.label}
          </button>
        ))}
      </nav>

      <main className="layout">
        <section className="main-panel">
          <ErrorBoundary>
          {tab === "command" && (
            <HomePage>
            <Panel title="Command Center" sub="Choose your next move and keep the city moving in your direction.">
              <NewPlayerIntroCard
                bossName={game.bossName}
                bossClass={bossClass}
                district={districtName(game.startingDistrictId || "docks")}
                firstMoves={firstMoves}
                onNavigate={goToTab}
              />

              <RevengeAlert revenge={activeRevengeAlert} nemesisCount={activeNemesisCount} onRetaliate={retaliateAgainst} onOpen={() => goToTab("pvp")} />

              <StorePrompt prompt={activeStorePrompt} onOpen={() => goToTab("store")} onDismiss={() => setDismissedStorePrompt(true)} />

              <HomeGuideCard
                cash={game.cash}
                energy={game.energy}
                heat={heat}
                ownedFronts={ownedPropertyCount}
                onNavigate={goToTab}
              />

              <RecommendedNextMoveCard move={oneRecommendedMove} onNavigate={goToTab} />

              {!game.hideFirstNightGuidance && (
                <FirstNightChecklist progress={firstNightProgress} onNavigate={goToTab} />
              )}

              <LockedContentPreview
                game={game}
                ownedFronts={ownedPropertyCount}
                onNavigate={goToTab}
              />

              <details className="home-secondary-systems">
                <summary>More City Systems</summary>
                <p className="soft-text">Daily orders, campaign, skills, vault, contacts, and other advanced systems are here when you want more detail.</p>

              <StreakCard streaks={activeStreakCards} />

              <MissionBoardSummaryCard
                recommended={recommendedMove}
                dailyOrders={dailyOrders}
                activeLead={activeStreetOpportunity}
                nextChapter={nextCampaignChapter}
                liveEventPhase={liveEventPhase}
                onNavigate={goToTab}
              />

              <BossRankSummaryCard rank={bossRank} game={game} cityControl={cityControl} onOpen={() => goToTab("rewards")} />

              <AchievementSummaryCard achievements={achievements} onOpen={() => goToTab("achievements")} />

              <IntelFeedSummaryCard feed={intelFeed} onOpen={() => goToTab("intel")} />

              <ContractsSummaryCard board={contractBoard} onOpen={() => goToTab("contracts")} />

              <TimelineSummaryCard timeline={cityTimeline} onOpen={() => goToTab("timeline")} />

              <OperationsBriefSummaryCard brief={operationsBrief} onOpen={() => goToTab("brief")} />

              <BalanceSummaryCard snapshot={balanceSnapshot} visible={game.devPanelVisible} onToggle={() => setGame((old) => ({ ...old, devPanelVisible: !old.devPanelVisible }))} onOpen={() => goToTab("balance")} />

              <LockedSystemsPanel systems={lockedSystemCards} onNavigate={goToTab} compact />

              </details>

              <FirstMovesPanel
                moves={firstMoves}
                complete={firstMovesComplete}
                claimed={firstMovesRewardClaimed}
                onClaim={claimFirstMovesReward}
                onNavigate={goToTab}
              />

              <LoginRewardSummaryCard
                reward={loginReward}
                claimed={loginRewardClaimed}
                streak={game.loginRewardStreak || 0}
                onClaim={claimLoginReward}
              />

              <DailyOrdersSummaryCard
                orders={dailyOrders}
                complete={dailyComplete}
                claimed={dailyClaimed}
                streak={game.dailyStreak || 0}
                reward={dailyReward}
                onOpen={() => goToTab("daily")}
                onClaim={claimDailyOrdersReward}
              />

              <LiveEventSummaryCard
                game={game}
                phase={liveEventPhase}
                rank={liveEventRank}
                milestoneReady={liveEventMilestoneReady}
                milestoneClaimed={liveEventMilestoneClaimed}
                onOpen={() => goToTab("event")}
                onClaim={claimLiveEventMilestone}
              />

              <CampaignSummaryCard
                chapter={nextCampaignChapter}
                completeCount={campaignClaimedCount}
                totalCount={campaignChapters.length}
                onOpen={() => goToTab("campaign")}
              />

              <SkillSummaryCard
                skillPoints={game.skillPoints || 0}
                stats={skillStats}
                onOpen={() => goToTab("skills")}
              />

              <BlackMarketSummaryCard
                marketRep={game.marketRep || 0}
                boughtToday={Object.values(ensureBlackMarketState(game).blackMarketDeals || {}).filter(Boolean).length}
                totalDeals={blackMarketDeals.length}
                gearStats={gearStats}
                onOpen={() => goToTab("market")}
              />

              <SafehouseSummaryCard
                stats={safehouseStats}
                safehouseMoves={game.safehouseMoves || 0}
                onOpen={() => goToTab("safehouse")}
              />

              <ContactsSummaryCard
                stats={contactStats}
                contacts={underworldContacts}
                game={game}
                onOpen={() => goToTab("contacts")}
              />

              <LieutenantsSummaryCard
                stats={lieutenantStats}
                game={game}
                onOpen={() => goToTab("lieutenants")}
              />

              <VaultSummaryCard
                stats={vaultStats}
                onOpen={() => goToTab("vault")}
                onDeposit={() => depositVault(0.5)}
                onLaunder={launderVaultCash}
              />


              <HeatSummaryCard heat={heat} tier={heatTier} payoutMultiplier={payoutMultiplier} onOpen={() => goToTab("heat")} />

              <CityWireSummaryCard
                activeEvent={activeStreetOpportunity}
                leadLabel={cityWireLeadLabel}
                expired={cityWireExpired}
                resolved={game.cityWireResolved || 0}
                onOpen={() => goToTab("wire")}
                onScout={scoutStreetOpportunity}
              />

              <CrewSummaryCard
                crew={game.crew}
                loyalty={crewLoyalty}
                standing={crewStanding}
                respect={game.respect || 0}
                attackBonus={crewAttackBonus}
                defenseBonus={crewDefenseBonus}
                onOpen={() => goToTab("crew")}
              />

              <TurfSummaryCard
                cityControl={cityControl}
                controlledDistricts={controlledDistricts}
                strongholdDistricts={strongholdDistricts}
                target={nextTurfTarget}
                targetControl={game.territory?.[nextTurfTarget.id] || 0}
                onOpen={() => goToTab("territory")}
              />

              <FrontNetworkSummaryCard
                income={income}
                ownedPropertyCount={ownedPropertyCount}
                upgradedFrontCount={upgradedFrontCount}
                activeRoutes={supplyStats.activeCount}
                incomeBonus={supplyStats.incomeBonus}
                heatBuffer={supplyStats.heatBuffer}
                onOpen={() => goToTab("properties")}
              />

              <RivalPressureSummaryCard
                topThreat={topRivalThreat}
                totalPressure={totalRivalPressure}
                onOpen={() => goToTab("revenge")}
              />

              <div className="command-grid">
                {pageCards.map((card) => (
                  <button key={card.tab} className="command-card" onClick={() => goToTab(card.tab)}>
                    <img src={card.image} alt={card.title} />
                    <div>
                      <h3>{card.title}</h3>
                      <p>{card.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
            </HomePage>
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
                onNavigate={goToTab}
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
                onNavigate={goToTab}
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
                t={t}
                onClaim={claimCampaignReward}
                onNavigate={goToTab}
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
                t={t}
                onBlocked={(message) => showResult({ title: "Action Blocked", flavor: message, details: [message] })}
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
                t={t}
                onNavigate={goToTab}
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
            <JobsPage>
            <Panel title="Jobs" sub="Earn money, build turf, and choose how loud your crew wants to move.">
              <PageHelperCard title="Jobs build your cash flow" text="Jobs spend Energy, pay Cash and XP, and raise Heat. Quiet jobs are safer. Aggressive jobs pay more but draw attention." />
              <JobChoicePanel choices={jobChoices} selected={selectedJobChoice} onSelect={setSelectedJobChoice} />
              <div className="card-grid">
                {jobs.map((job) => {
                  const choice = jobChoices.find((item) => item.id === selectedJobChoice) || jobChoices[1];
                  const lowCash = Math.round(job.cash[0] * Number(choice.cashMod || 1));
                  const highCash = Math.round(job.cash[1] * Number(choice.cashMod || 1));
                  return (
                    <ArtCard key={job.id} title={job.name} image={job.image} tag={districtName(job.district)} desc={job.desc}>
                      <Info label="Choice" value={choice.label} />
                      <Info label="Energy" value={job.energy} />
                      <Info label="Expected Payout" value={`${money(lowCash)} - ${money(highCash)}`} />
                      <Info label="Heat Risk" value={`${Math.max(0, job.level + Number(choice.heatMod || 0))}+`} />
                      <Info label="XP" value={job.xp} />
                      <button className="primary" onClick={() => runJob(job)}>
                        {game.jobsRun < 1 ? "Run First Job" : "Run Job"}
                      </button>
                    </ArtCard>
                  );
                })}
              </div>
            </Panel>
            </JobsPage>
          )}

          {tab === "empire" && (
            <EmpirePage>
            <Panel title="Empire" sub="Turf, fronts, vault, safehouse, contacts, gear, and income in one cleaner section.">
              <PageHelperCard title="Empire protects what you earn" text="Fronts create income. Vaults protect cash. Safehouse, contacts, and lieutenants make your crew harder to push around." />
              {ownedPropertyCount < 1 && (
                <section className="empty-state-card action-empty-state">
                  <p className="kicker">First Property Path</p>
                  <h3>You do not own any fronts yet.</h3>
                  <p>Run starter jobs, earn cash, then buy your first front so the empire starts producing money.</p>
                  <button className="primary" type="button" onClick={() => goToTab(game.cash >= 300 ? "properties" : "jobs")}>{game.cash >= 300 ? "Buy First Front" : "Earn Quick Cash"}</button>
                </section>
              )}
              <EmpireHubPanel
                stats={empireDetailStats}
                damagedFronts={Object.entries(game.frontDamage || {}).filter(([, value]) => value?.damaged)}
                shieldActive={Number(game.activeShieldUntil || 0) > Date.now()}
                onNavigate={goToTab}
              />
            </Panel>
            </EmpirePage>
          )}

          {tab === "store" && (
            <StorePage>
            <Panel title="Tribute Store" sub="Mock store for testing only. Real purchases are not active.">
              <MockStorePanel
                items={mockStoreItems}
                tribute={game.tribute || 0}
                purchases={game.mockStorePurchases || {}}
                shieldActive={Number(game.activeShieldUntil || 0) > Date.now()}
                onPurchase={purchaseMockStoreItem}
              />
            </Panel>
            </StorePage>
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

              <DistrictVisualOverview
                districts={districts}
                game={game}
                bossClass={bossClass}
                crewLoyalty={crewLoyalty}
                skillStats={skillStats}
                onNavigate={goToTab}
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
                onOpen={() => goToTab("skills")}
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
                      {getFrontDamage(game, property.id) > 0 && <Info label="Damage" value={`${getFrontDamage(game, property.id)}% damaged • Repair ${money(getFrontRepairCost(property, game))}`} />}
                      <div className="button-row compact-row">
                        <button className="primary" onClick={() => buyProperty(property)}>
                          Buy Property
                        </button>
                        <button className="secondary" disabled={level <= 0 || level >= 5} onClick={() => upgradeProperty(property)}>
                          Upgrade Front
                        </button>
                        {getFrontDamage(game, property.id) > 0 && <button className="secondary" onClick={() => repairPropertyFront(property)}>Repair Front</button>}
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
                t={t}
                onBlocked={(message) => showResult({ title: "Vault Blocked", flavor: message, details: [message] })}
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
            <Panel title="Clinic" sub="Patch yourself up, recover from being dropped, or lay low while the street cools off.">
              <PageHero image="/art/pages/clinic.jpg" title="Backroom Clinic" desc="Health matters. A broke boss cannot hold the city." />
              <ClinicOptions options={clinicOptions} health={game.health} maxHealth={game.maxHealth} onUse={useClinicTreatment} />
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

          {tab === "pvp" && (
            <FightPage>
            <Panel title="PvP Hub" sub="Local simulated player-vs-player foundation. Find targets, start grudges, set defense, and test future multiplayer flow without a backend yet.">
              <PageHelperCard title="Fight creates grudges" text="Fight uses Health, Crew, PvP Power, Respect, and Revenge. Pick targets carefully and hit back when someone takes from you." />
              <PvpHub
                game={game}
                playerProfile={publicProfile}
                onAttack={attackMockPlayer}
                onRetaliate={retaliateAgainst}
                onDefenseChange={updateDefensePosture}
                onClaimBounty={claimPvpBounty}
              />
            </Panel>
            </FightPage>
          )}

          {tab === "chat" && (
            <Panel title="Street Chat" sub="Local prototype chatter that makes the city feel alive. This can connect to Supabase later without changing the player-facing idea.">
              <StreetChatPanel feed={streetChatFeed} onNavigate={goToTab} />
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


          {tab === "missions" && (
            <Panel title="Mission Board" sub="One board for the next best move, daily orders, campaign progress, city leads, and event pressure.">
              <MissionBoardPanel
                recommended={firstSessionMove}
                dailyOrders={dailyOrders}
                activeLead={activeStreetOpportunity}
                leadLabel={cityWireLeadLabel}
                nextChapter={nextCampaignChapter}
                liveEventPhase={liveEventPhase}
                firstMoves={firstMoves}
                onNavigate={goToTab}
              />
            </Panel>
          )}

          {tab === "rewards" && (
            <Panel title="Rewards & Rank" sub="Clearer feedback for what your actions are earning and how your boss is growing.">
              <RewardFeedbackPanel
                rank={bossRank}
                recentRewards={recentRewards}
                loginReward={loginReward}
                loginRewardClaimed={loginRewardClaimed}
                loginStreak={game.loginRewardStreak || 0}
                cash={game.cash}
                xp={game.xp}
                level={game.level}
                respect={game.respect || 0}
                cityControl={cityControl}
                onClaimLogin={claimLoginReward}
              />
            </Panel>
          )}

          {tab === "achievements" && (
            <Panel title="Achievements" sub="Track milestones that make the boss feel like he is actually building a name in the city.">
              <AchievementsPanel achievements={achievements} onNavigate={goToTab} />
            </Panel>
          )}

          {tab === "intel" && (
            <Panel title="Intel Feed" sub="Street warnings, opportunities, and next moves pulled into one readable feed.">
              <IntelFeedPanel feed={intelFeed} onNavigate={goToTab} />
            </Panel>
          )}


          {tab === "contracts" && (
            <Panel title="Contracts" sub="Short, clear underworld contracts that point players toward valuable next actions.">
              <ContractsPanel board={contractBoard} onNavigate={goToTab} />
            </Panel>
          )}

          {tab === "timeline" && (
            <Panel title="City Timeline" sub="A simple view of timers, resets, live events, and what is coming due next.">
              <CityTimelinePanel timeline={cityTimeline} onNavigate={goToTab} />
            </Panel>
          )}

          {tab === "brief" && (
            <Panel title="Operations Brief" sub="A boss-level snapshot of danger, economy, people, rivals, and the next priorities.">
              <OperationsBriefPanel brief={operationsBrief} onNavigate={goToTab} />
            </Panel>
          )}

          {tab === "balance" && (
            <Panel title="Balance / Debug Panel" sub="Staff-only testing view for economy, pressure, unlock pacing, and first-session flow.">
              <BalanceDebugPanel
                snapshot={balanceSnapshot}
                systems={lockedSystemCards}
                visible={game.devPanelVisible}
                onToggle={() => setGame((old) => ({ ...old, devPanelVisible: !old.devPanelVisible }))}
                onNavigate={goToTab}
              />
            </Panel>
          )}

          {tab === "more" && (
            <MorePage>
            <Panel title="More" sub="All city systems in one cleaner mobile menu.">
              <PageHelperCard title="Extra tools live here" text="Settings, profile, language, save tools, campaign, events, daily orders, and full stats stay here so Home stays clean." />
              <MoreMenuPanel cards={pageCards} onNavigate={goToTab} />
            </Panel>
            </MorePage>
          )}

          {tab === "settings" && (
            <SettingsPage>
            <Panel title="Settings & Install" sub="Tune your local game experience, install behavior, and quick quality-of-life options.">
              <SettingsPanel
                settings={settings}
                onToggle={updateSetting}
                installReady={installReady}
                isInstalled={isInstalled}
                buildLabel={APP_BUILD_LABEL}
                onOpenInstall={reopenInstallPrompt}
                onResetInstallPrompt={resetInstallPromptMemory}
                onExportSave={exportCurrentSave}
                onImportSave={importCurrentSave}
                language={settings.language}
                onLanguageChange={updateLanguage}
                beginnerLayout={beginnerLayoutOn}
                onToggleBeginnerLayout={toggleBeginnerLayout}
                showAdvancedStats={showAdvancedStatsOnHome}
                onToggleAdvancedStats={() => setGame((old) => ({ ...old, showAdvancedStatsOnHome: !Boolean(old.showAdvancedStatsOnHome) }))}
              />
            </Panel>
            </SettingsPage>
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
          </ErrorBoundary>
        </section>

        <aside className="sidebar">
          <Panel title="Empire Status">
            <Info label="Build" value={APP_BUILD_LABEL} />
            <Info label="Boss Rank" value={bossRank.title} />
            <Info label="PvP Power" value={publicProfile.powerScore} />
            <Info label="Defense Setup" value={game.pvpDefensePosture || "balanced"} />
            <Info label="PvP Grudges" value={Object.keys(game.pvpGrudges || {}).length} />
            <Info label="Achievements" value={`${achievements.completed}/${achievements.total}`} />
            <Info label="Intel Items" value={intelFeed.length} />
            <Info label="Street Chat" value={`${streetChatFeed.length} active whispers`} />
            <Info label="Contracts" value={`${contractBoard.readyCount}/${contractBoard.total} ready`} />
            <Info label="Brief" value={operationsBrief.danger} />
            <Info label="Recommended Move" value={recommendedMove.title} />
            <Info label="Active Shield" value={Number(game.activeShieldUntil || 0) > Date.now() ? "Active" : "None"} />
            <Info label="Nemesis Count" value={activeNemesisCount} />
            <Info label="Daily Reward" value={loginRewardClaimed ? `Claimed • ${game.loginRewardStreak || 0} streak` : getRewardText(loginReward)} />
            <details className="full-empire-details"><summary>Full Empire Details</summary>
            <Info label="App Install" value={isInstalled ? "Installed" : installReady ? "Ready" : "Browser only"} />
            <Info label="Settings" value={`${settings.musicOn ? "Music On" : "Music Off"} • ${settings.sfxOn ? "SFX On" : "SFX Off"}`} />
            <Info label="Boss Class" value={bossClass.name} />
            <Info label="Campaign" value={`${campaignClaimedCount}/${campaignChapters.length} chapters`} />
            <Info label="Daily Orders" value={dailyClaimed ? `Claimed • ${game.dailyStreak || 0} streak` : `${dailyOrders.filter((order) => order.done).length}/${dailyOrders.length} complete`} />
            <Info label="Login Reward" value={loginRewardClaimed ? `Claimed • ${game.loginRewardStreak || 0} streak` : getRewardText(loginReward)} />
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
            </details>
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
        {mainNavItems.map((item) => (
          <button key={item.tab} onClick={() => goToTab(item.tab)} className={tab === item.tab ? "active" : ""}>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
    </>
  );
}

function NavGroup({ label, items, activeTab, onNavigate }) {
  const active = items.some(([id]) => id === activeTab);
  return (
    <details className={`nav-group ${active ? "active" : ""}`}>
      <summary>{label}</summary>
      <div className="nav-group-menu">
        {items.map(([id, itemLabel]) => (
          <button key={id} type="button" onClick={() => onNavigate(id)} className={activeTab === id ? "active" : ""}>
            {itemLabel}
          </button>
        ))}
      </div>
    </details>
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
            <strong>Build check:</strong> You should see {APP_PHASE} on this screen. If not, the wrong folder is running.
          </div>
        </section>
      </div>
    </div>
  );
}


function PageHelperCard({ title, text }) {
  return (
    <section className="page-helper-card">
      <p className="kicker">Why this matters</p>
      <h3>{title}</h3>
      <p>{text}</p>
    </section>
  );
}

function HomeGuideCard({ cash = 0, energy = 0, heat = 0, ownedFronts = 0, onNavigate }) {
  let title = "Start with a job";
  let text = "Run starter jobs to earn cash and XP. Use cash to buy your first front, then protect it when rivals come looking.";
  let button = "Run Starter Job";
  let tab = "jobs";

  if (energy <= 0) {
    title = "Out of energy";
    text = "Build your empire, check fights, or wait for Energy to recover before running more jobs.";
    button = "View Empire";
    tab = "empire";
  } else if (heat >= 70) {
    title = "Heat is high";
    text = "Let the streets cool down before pushing more loud jobs.";
    button = "Manage Heat";
    tab = "heat";
  } else if (ownedFronts < 1 && cash >= 300) {
    title = "Buy your first front";
    text = "A front gives your empire something to own, collect from, and protect.";
    button = "Buy First Front";
    tab = "properties";
  }

  return (
    <section className="home-guide-card">
      <div>
        <p className="kicker">First 15 Minutes</p>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <button className="primary" type="button" onClick={() => onNavigate(tab)}>{button}</button>
    </section>
  );
}

function LockedContentPreview({ game = {}, ownedFronts = 0, onNavigate }) {
  const cards = [
    { title: "Bigger Jobs", unlock: "Unlocks at Level 3", reason: "Higher payouts and more heat once your boss has momentum.", ready: Number(game.level || 1) >= 3, tab: "jobs" },
    { title: "District Control", unlock: "Unlocks after buying your first front", reason: "Take blocks and make the city feel like it belongs to you.", ready: ownedFronts > 0, tab: "territory" },
    { title: "Rival List", unlock: "Unlocks after your first fight", reason: "Find enemies, build grudges, and get revenge.", ready: Number(game.pvpAttacks || 0) > 0 || Number(game.wins || 0) > 0, tab: "pvp" },
    { title: "Crew Bonuses", unlock: "Unlocks at 5 Crew", reason: "More crew makes jobs and fights safer.", ready: Number(game.crew || 0) >= 5, tab: "crew" },
  ];

  return (
    <section className="locked-preview-card">
      <div className="locked-preview-heading">
        <div>
          <p className="kicker">Coming Up</p>
          <h3>Locked but worth chasing</h3>
        </div>
      </div>
      <div className="locked-preview-grid">
        {cards.map((card) => (
          <button key={card.title} className={`locked-preview-item ${card.ready ? "ready" : "locked"}`} type="button" onClick={() => onNavigate(card.tab)}>
            <strong>{card.title}</strong>
            <span>{card.ready ? "Available now" : card.unlock}</span>
            <small>{card.reason}</small>
          </button>
        ))}
      </div>
    </section>
  );
}


function RecommendedNextMoveCard({ move, onNavigate }) {
  const safeMove = move || { title: "Open Mission Board", detail: "Use the Mission Board to find your next useful move.", tab: "missions" };
  return (
    <section className="recommended-next-move-card">
      <div>
        <p className="kicker">Recommended Next Move</p>
        <h3>{safeMove.title}</h3>
        <p>{safeMove.detail}</p>
      </div>
      <button className="primary" type="button" onClick={() => onNavigate(safeMove.tab || "missions")}>{safeMove.cta || "View Next Move"}</button>
    </section>
  );
}

function BalanceSummaryCard({ snapshot, visible, onToggle, onOpen }) {
  if (!visible) {
    return (
      <section className="balance-summary-card muted">
        <div>
          <p className="kicker">Dev Balance Panel</p>
          <h3>Hidden from normal play</h3>
          <p>Turn it on when testing economy, heat, rival pressure, unlock pacing, and first-session flow.</p>
        </div>
        <div className="button-row compact-row">
          <button className="secondary" type="button" onClick={onToggle}>Show Panel</button>
          <button className="secondary" type="button" onClick={onOpen}>Open</button>
        </div>
      </section>
    );
  }

  return (
    <section className="balance-summary-card">
      <div>
        <p className="kicker">Dev Balance Panel</p>
        <h3>{snapshot.heatRisk} Heat Risk • {snapshot.crewLoyaltyStatus} Loyalty</h3>
        <p>Income: {money(snapshot.estimatedIncome)}/min • Rival: {snapshot.rivalThreat} • Next: {snapshot.nextMajorUpgrade}</p>
      </div>
      <div className="button-row compact-row">
        <button className="secondary" type="button" onClick={onToggle}>Hide Panel</button>
        <button className="primary" type="button" onClick={onOpen}>Open Details</button>
      </div>
    </section>
  );
}

function LockedSystemsPanel({ systems = [], onNavigate, compact = false }) {
  const locked = systems.filter((system) => !system.unlocked);
  const unlocked = systems.filter((system) => system.unlocked);
  const list = compact ? locked.slice(0, 4) : systems;

  if (!list.length) return null;

  return (
    <section className={`locked-systems-panel ${compact ? "compact" : ""}`}>
      <div className="section-heading-row">
        <div>
          <p className="kicker">System Unlocks</p>
          <h3>{locked.length ? `${locked.length} systems still locked` : "All tracked systems unlocked"}</h3>
          <p className="soft-text">Advanced systems stay visible so players know why they matter before they unlock.</p>
        </div>
        {!compact && <span>{unlocked.length}/{systems.length} unlocked</span>}
      </div>
      <div className="locked-system-grid">
        {list.map((system) => (
          <article key={system.id} className={`locked-system-card ${system.unlocked ? "unlocked" : "locked"}`}>
            <div>
              <span>{system.unlocked ? "Unlocked" : system.requirement}</span>
              <strong>{system.name}</strong>
              <p>{system.reason}</p>
            </div>
            <button className="secondary compact-button" type="button" disabled={!system.unlocked} onClick={() => onNavigate(system.tab || "more")}>
              {system.unlocked ? "Open" : "Locked"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function BalanceDebugPanel({ snapshot, systems, visible, onToggle, onNavigate }) {
  return (
    <div className="balance-debug-panel">
      <section className={`mission-hero ${visible ? "" : "muted"}`}>
        <div>
          <p className="kicker">Staff / Developer View</p>
          <h3>{visible ? "Balance panel visible" : "Balance panel hidden"}</h3>
          <p>This panel is for testing pacing. It should not be treated as the main player experience.</p>
        </div>
        <button className="primary" type="button" onClick={onToggle}>{visible ? "Hide Dev Panel" : "Show Dev Panel"}</button>
      </section>

      {visible && (
        <>
          <div className="brief-grid">
            <div className="account-box"><h3>Cash Per Action</h3><p>{snapshot.cashPerAction}</p></div>
            <div className="account-box"><h3>Income</h3><p>{money(snapshot.estimatedIncome)}/min estimated collection value.</p></div>
            <div className="account-box"><h3>Heat Risk</h3><p>{snapshot.heatRisk}</p></div>
            <div className="account-box"><h3>Rival Threat</h3><p>{snapshot.rivalThreat}</p></div>
            <div className="account-box"><h3>Next Upgrade</h3><p>{snapshot.nextMajorUpgrade}</p></div>
            <div className="account-box"><h3>Crew Loyalty</h3><p>{snapshot.crewLoyaltyStatus}</p></div>
            <div className="account-box"><h3>Level Progress</h3><p>{snapshot.levelProgress}</p></div>
            <div className="account-box"><h3>Unlocked Systems</h3><p>{snapshot.unlockedSystems.length ? snapshot.unlockedSystems.join(", ") : "Only base systems"}</p></div>
          </div>
          <LockedSystemsPanel systems={systems} onNavigate={onNavigate} />
        </>
      )}
    </div>
  );
}

function NewPlayerIntroCard({ bossName, bossClass, district, firstMoves, onNavigate }) {
  const nextMove = firstMoves.find((move) => !move.done) || firstMoves[0];
  return (
    <section className="new-player-intro-card">
      <div className="intro-copy">
        <p className="kicker">First Night in the City</p>
        <h3>{bossName || "Boss"}, the city just learned your name.</h3>
        <p>Class: <strong>{bossClass.name}</strong> • Starting turf: <strong>{district}</strong></p>
        <p className="soft-text">Your first goal is simple: make a move, earn money, and let the streets know this is not just another crew.</p>
      </div>
      <div className="intro-action-card">
        <span>Next Move</span>
        <strong>{nextMove?.label || "Run your first job"}</strong>
        <button type="button" className="primary" onClick={() => onNavigate(nextMove?.action || "jobs")}>Start Move</button>
      </div>
    </section>
  );
}

function LoginRewardSummaryCard({ reward, claimed, streak, onClaim }) {
  return (
    <section className={`login-reward-card ${claimed ? "claimed" : "ready"}`}>
      <div>
        <p className="kicker">Daily Login Reward</p>
        <h3>{claimed ? "Reward claimed for today" : "Claim today&apos;s street payout"}</h3>
        <p className="soft-text">Current login streak: {streak || 0} day{Number(streak || 0) === 1 ? "" : "s"}</p>
        <p>{getRewardText(reward)}</p>
      </div>
      <button className="primary" type="button" disabled={claimed} onClick={onClaim}>
        {claimed ? "Claimed" : "Claim Reward"}
      </button>
    </section>
  );
}


function MissionBoardSummaryCard({ recommended, dailyOrders, activeLead, nextChapter, liveEventPhase, onNavigate }) {
  const doneDaily = dailyOrders.filter((order) => order.done).length;
  return (
    <section className="mission-board-summary">
      <div>
        <p className="kicker">Mission Board</p>
        <h3>{recommended.title}</h3>
        <p>{recommended.detail}</p>
      </div>
      <div className="mission-mini-grid">
        <span>Daily <strong>{doneDaily}/{dailyOrders.length}</strong></span>
        <span>Lead <strong>{activeLead ? "Open" : "None"}</strong></span>
        <span>Story <strong>{nextChapter?.claimed ? "Claimed" : "Open"}</strong></span>
        <span>Event <strong>{liveEventPhase.eventIsActive ? liveEventPhase.name : "Ended"}</strong></span>
      </div>
      <button className="primary" type="button" onClick={() => onNavigate(recommended.tab)}>Go Now</button>
    </section>
  );
}

function BossRankSummaryCard({ rank, game, cityControl, onOpen }) {
  return (
    <section className="boss-rank-card">
      <div>
        <p className="kicker">Boss Rank</p>
        <h3>{rank.title}</h3>
        <p>{rank.next}</p>
      </div>
      <div className="boss-rank-stats">
        <Info label="Level" value={game.level} />
        <Info label="Respect" value={game.respect || 0} />
        <Info label="City Control" value={`${cityControl}%`} />
      </div>
      <Progress label="Next Rank" value={rank.progress} max={100} />
      <button className="secondary" type="button" onClick={onOpen}>Open Rewards</button>
    </section>
  );
}

function MissionBoardPanel({ recommended, dailyOrders, activeLead, leadLabel, nextChapter, liveEventPhase, firstMoves, onNavigate }) {
  return (
    <div className="mission-board-panel">
      <section className="mission-hero">
        <div>
          <p className="kicker">Recommended Next Move</p>
          <h3>{recommended.title}</h3>
          <p>{recommended.detail}</p>
        </div>
        <button className="primary" type="button" onClick={() => onNavigate(recommended.tab)}>Go to Move</button>
      </section>

      <div className="mission-board-grid">
        <section className="account-box">
          <h3>First Moves</h3>
          {firstMoves.map((move) => (
            <button key={move.id} className={`mission-row ${move.done ? "done" : ""}`} onClick={() => onNavigate(move.action || "command")}>
              <span>{move.label}</span>
              <strong>{move.done ? "Done" : "Open"}</strong>
            </button>
          ))}
        </section>

        <section className="account-box">
          <h3>Daily Orders</h3>
          {dailyOrders.map((order) => (
            <button key={order.id} className={`mission-row ${order.done ? "done" : ""}`} onClick={() => onNavigate(order.action || "daily")}>
              <span>{order.label}</span>
              <strong>{order.done ? "Done" : "Open"}</strong>
            </button>
          ))}
        </section>

        <section className="account-box">
          <h3>Campaign</h3>
          <p className="soft-text">{nextChapter?.title || "Campaign ready"}</p>
          <p>{nextChapter?.claimed ? "Current chapter reward has been claimed." : "Finish chapter goals to claim the next story reward."}</p>
          <button className="secondary" type="button" onClick={() => onNavigate("campaign")}>Open Campaign</button>
        </section>

        <section className="account-box">
          <h3>City Wire / Event</h3>
          <p className="soft-text">{activeLead ? leadLabel : "No active street lead."}</p>
          <p>{liveEventPhase.eventIsActive ? `Concrete Pour: ${liveEventPhase.name}` : "Current live event has ended."}</p>
          <div className="button-row compact-row">
            <button className="secondary" type="button" onClick={() => onNavigate("wire")}>City Wire</button>
            <button className="secondary" type="button" onClick={() => onNavigate("event")}>Event</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function RewardFeedbackPanel({ rank, recentRewards, loginReward, loginRewardClaimed, loginStreak, cash, xp, level, respect, cityControl, onClaimLogin }) {
  return (
    <div className="reward-feedback-panel">
      <section className="mission-hero reward-hero">
        <div>
          <p className="kicker">Boss Rank</p>
          <h3>{rank.title}</h3>
          <p>{rank.next}</p>
        </div>
        <div className="reward-stat-stack">
          <Info label="Level" value={level} />
          <Info label="Cash" value={money(cash)} />
          <Info label="XP" value={xp} />
          <Info label="Respect" value={respect} />
          <Info label="City Control" value={`${cityControl}%`} />
        </div>
      </section>

      <section className="account-box">
        <h3>Daily Login Reward</h3>
        <p className="soft-text">Streak: {loginStreak} day{Number(loginStreak) === 1 ? "" : "s"}</p>
        <p>{getRewardText(loginReward)}</p>
        <button className="primary" type="button" disabled={loginRewardClaimed} onClick={onClaimLogin}>
          {loginRewardClaimed ? "Claimed Today" : "Claim Login Reward"}
        </button>
      </section>

      <section className="account-box full-span">
        <h3>Recent Reward Feedback</h3>
        <div className="reward-log-list">
          {recentRewards.map((line, index) => (
            <div key={`${line}-${index}`} className="reward-log-row">
              <strong>{index === 0 ? "Latest" : `Move ${index + 1}`}</strong>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DistrictVisualOverview({ districts, game, bossClass, crewLoyalty, skillStats, onNavigate }) {
  return (
    <section className="district-visual-overview">
      <div className="section-heading-row">
        <div>
          <p className="kicker">City Map</p>
          <h3>District Visual Control</h3>
        </div>
        <button className="secondary compact-button" type="button" onClick={() => onNavigate("properties")}>Open Fronts</button>
      </div>
      <div className="district-visual-grid">
        {districts.map((district) => {
          const control = game.territory[district.id] || 0;
          const tier = getControlTier(control);
          const tribute = getDistrictTribute(district, control, bossClass.income, crewLoyalty, skillStats.tributeMultiplier);
          const ownedFronts = properties.filter((property) => property.district === district.id).reduce((sum, property) => sum + Number(game.properties?.[property.id] || 0), 0);
          const pressure = rivals.filter((rival) => rival.district === district.id).reduce((sum, rival) => sum + Number(game.rivalPressure?.[rival.id] || 0), 0);
          return (
            <article key={district.id} className="district-visual-card">
              <div className="district-visual-top">
                <strong>{district.name}</strong>
                <span>{tier.label}</span>
              </div>
              <Progress label="Control" value={control} max={100} />
              <div className="district-visual-stats">
                <span>Tribute <strong>{control >= 25 ? money(tribute) : "Locked"}</strong></span>
                <span>Fronts <strong>{ownedFronts}</strong></span>
                <span>Rival Heat <strong>{pressure}/100</strong></span>
                <span>Risk <strong>{district.risk}</strong></span>
              </div>
              <p className="soft-text">{control < 25 ? "Recommended: expand control until tribute unlocks." : control < 75 ? "Recommended: push toward stronghold status." : "Recommended: hold the district and collect tribute."}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}




function AchievementSummaryCard({ achievements, onOpen }) {
  const percent = Math.round((achievements.completed / Math.max(1, achievements.total)) * 100);
  return (
    <section className="achievement-summary-card">
      <div>
        <p className="kicker">Achievements</p>
        <h3>{achievements.completed}/{achievements.total} Badges Unlocked</h3>
        <p>Long-term milestones now show the player they are building something permanent.</p>
      </div>
      <div className="achievement-meter">
        <span>{percent}%</span>
        <div className="bar"><i style={{ width: `${percent}%` }} /></div>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>Open Achievements</button>
    </section>
  );
}

function IntelFeedSummaryCard({ feed, onOpen }) {
  const top = feed[0] || { title: "No intel", detail: "The streets are quiet." };
  return (
    <section className="intel-summary-card">
      <div>
        <p className="kicker">Street Intel</p>
        <h3>{top.title}</h3>
        <p>{top.detail}</p>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>Open Intel</button>
    </section>
  );
}

function AchievementsPanel({ achievements, onNavigate }) {
  return (
    <div className="achievements-panel">
      <section className="mission-hero achievement-hero">
        <div>
          <p className="kicker">Achievements</p>
          <h3>Every move should leave a mark.</h3>
          <p>{achievements.completed} of {achievements.total} achievement badges are unlocked. These are local-save prototype badges, but they set up a future account-wide achievement system.</p>
        </div>
        <div className="achievement-score-card">
          <strong>{achievements.completed}/{achievements.total}</strong>
          <span>Unlocked</span>
        </div>
      </section>

      <div className="achievement-grid">
        {achievements.badges.map((badge) => (
          <button key={badge.id} type="button" className={`achievement-badge ${badge.done ? "done" : "locked"}`} onClick={() => onNavigate(badge.done ? "rewards" : "missions")}>
            <span>{badge.done ? "Unlocked" : "Locked"}</span>
            <strong>{badge.title}</strong>
            <p>{badge.desc}</p>
            <small>{badge.reward}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function IntelFeedPanel({ feed, onNavigate }) {
  return (
    <div className="intel-feed-panel">
      <section className="mission-hero intel-hero">
        <div>
          <p className="kicker">Intel Feed</p>
          <h3>The city should talk back.</h3>
          <p>The Intel Feed pulls warnings, rewards, turf status, rival pressure, and next moves into one street-readable feed.</p>
        </div>
      </section>

      <div className="intel-feed-list">
        {feed.map((item, index) => (
          <button key={`${item.type}-${index}`} type="button" className="intel-feed-row" onClick={() => onNavigate(item.tab || "command")}>
            <span>{item.type}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <small>Open</small>
          </button>
        ))}
      </div>
    </div>
  );
}


function ContractsSummaryCard({ board, onOpen }) {
  const next = board.contracts.find((contract) => contract.ready) || board.contracts[0];
  return (
    <section className="intel-summary-card">
      <div>
        <p className="kicker">Contract Board</p>
        <h3>{next?.title || "No contracts"}</h3>
        <p>{board.readyCount}/{board.total} contracts ready. {next?.detail}</p>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>Open Contracts</button>
    </section>
  );
}

function TimelineSummaryCard({ timeline, onOpen }) {
  const next = timeline.find((item) => item.status === "Ready" || item.status === "Open") || timeline[0];
  return (
    <section className="intel-summary-card">
      <div>
        <p className="kicker">City Timeline</p>
        <h3>{next?.title || "Timeline"}</h3>
        <p>{next?.detail || "Track resets, events, and timed opportunities."}</p>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>Open Timeline</button>
    </section>
  );
}

function OperationsBriefSummaryCard({ brief, onOpen }) {
  return (
    <section className={`intel-summary-card ${brief.danger === "Critical" ? "danger-brief" : ""}`}>
      <div>
        <p className="kicker">Operations Brief</p>
        <h3>{brief.danger} Situation</h3>
        <p>{brief.economy} • {brief.rival}</p>
      </div>
      <button className="secondary" type="button" onClick={onOpen}>Open Brief</button>
    </section>
  );
}

function ContractsPanel({ board, onNavigate }) {
  return (
    <div className="mission-board-panel">
      <section className="mission-hero">
        <div>
          <p className="kicker">Contract Board</p>
          <h3>Contract Board</h3>
          <p>{board.readyCount}/{board.total} contracts are ready right now. Contracts are not a new grind. They are a cleaner way to point players toward useful actions.</p>
        </div>
      </section>
      <div className="mission-list">
        {board.contracts.map((contract) => (
          <button key={contract.id} type="button" className={`mission-row ${contract.ready ? "ready" : "locked"}`} onClick={() => onNavigate(contract.tab)}>
            <div>
              <span>{contract.type}</span>
              <strong>{contract.title}</strong>
              <p>{contract.detail}</p>
            </div>
            <small>{contract.ready ? "Ready" : "Not Ready"} • {contract.reward} • {contract.risk}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function CityTimelinePanel({ timeline, onNavigate }) {
  return (
    <div className="mission-board-panel">
      <section className="mission-hero">
        <div>
          <p className="kicker">City Timeline</p>
          <h3>City Timeline</h3>
          <p>Timers, resets, and live operations are now easier to understand from one screen.</p>
        </div>
      </section>
      <div className="intel-feed-list">
        {timeline.map((item, index) => (
          <button key={`${item.title}-${index}`} type="button" className="intel-feed-row" onClick={() => onNavigate(item.tab || "command")}>
            <div>
              <span>{item.status}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <small>Open</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function OperationsBriefPanel({ brief, onNavigate }) {
  return (
    <div className="mission-board-panel">
      <section className={`mission-hero ${brief.danger === "Critical" ? "danger-brief" : ""}`}>
        <div>
          <p className="kicker">Operations Brief</p>
          <h3>{brief.danger} Operations Brief</h3>
          <p>The boss now gets a cleaner readout of the operation before making the next move.</p>
        </div>
      </section>
      <div className="brief-grid">
        <div className="account-box"><h3>Economy</h3><p>{brief.economy}</p></div>
        <div className="account-box"><h3>City</h3><p>{brief.city}</p></div>
        <div className="account-box"><h3>People</h3><p>{brief.people}</p></div>
        <div className="account-box"><h3>Rivals</h3><p>{brief.rival}</p></div>
      </div>
      <div className="mission-list">
        {brief.priorities.map((priority, index) => (
          <button key={`${priority.title}-${index}`} type="button" className="mission-row ready" onClick={() => onNavigate(priority.tab || "command")}>
            <div>
              <span>Priority {index + 1}</span>
              <strong>{priority.title}</strong>
              <p>{priority.detail}</p>
            </div>
            <small>Go</small>
          </button>
        ))}
      </div>
    </div>
  );
}


function StreetChatPanel({ feed, onNavigate }) {
  const safeFeed = Array.isArray(feed) ? feed : [];
  return (
    <div className="street-chat-panel">
      <section className="street-chat-hero">
        <div>
          <p className="kicker">Street Chat</p>
          <h3>The city talks before it moves.</h3>
          <p className="soft-text">This is a local prototype feed for city chatter. Later, this can be wired into Supabase for real player chat or alliance messages.</p>
        </div>
        <button type="button" className="secondary" onClick={() => onNavigate("wire")}>Open City Wire</button>
      </section>
      <div className="street-chat-list">
        {safeFeed.map((item, index) => (
          <article key={`${item.speaker}-${index}`} className="street-chat-message">
            <div className="street-chat-avatar">{String(item.speaker || "?").slice(0, 1)}</div>
            <div>
              <div className="street-chat-meta">
                <strong>{item.speaker}</strong>
                <span>{item.tag}</span>
              </div>
              <p>{item.line}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}


function MoreMenuPanel({ cards, onNavigate }) {
  const byTab = Object.fromEntries(cards.map((card) => [card.tab, card]));

  return (
    <div className="more-menu-panel">
      {moreMenuGroups.map(({ group, tabs }) => (
        <section key={group} className="more-menu-group">
          <h3>{group}</h3>
          <div className="more-menu-grid">
            {tabs.map((tab) => {
              const card = byTab[tab] || { tab, title: tab, desc: "Open section" };
              return (
                <button key={tab} type="button" className="more-menu-button" onClick={() => onNavigate(tab)}>
                  <strong>{card.title}</strong>
                  <span>{card.desc}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function EmpireHubPanel({ stats = [], damagedFronts = [], shieldActive = false, onNavigate }) {
  const quickLinks = [
    ["territory", "Turf", "Take districts and build control."],
    ["properties", "Fronts", "Buy, repair, and upgrade income fronts."],
    ["safehouse", "Safehouse", "Permanent base upgrades."],
    ["vault", "Vault", "Protect cash and launder money."],
    ["store", "Tribute Store", "Mock boosts and repair tools."],
    ["contacts", "Contacts", "Underworld help and favors."],
    ["lieutenants", "Lieutenants", "Assign trusted crew leaders."],
    ["market", "Black Market", "Daily deals and gear upgrades."],
  ];
  return (
    <div className="empire-hub-panel">
      <section className="revenge-alert empire-summary-alert">
        <div>
          <p className="kicker">Empire Status</p>
          <h3>{shieldActive ? "Lay Low Shield Active" : damagedFronts.length ? "Front Damage Needs Attention" : "Build What Is Yours"}</h3>
          <p>{shieldActive ? "Your fronts and vault are protected, but attacking is limited for balance." : damagedFronts.length ? `${damagedFronts.length} front${damagedFronts.length === 1 ? " is" : "s are"} damaged. Repair or retaliate.` : "Your money, turf, and fronts are the reason rivals will come after you."}</p>
        </div>
      </section>
      <EmpireDetails stats={stats} defaultOpen />
      <div className="more-menu-grid">
        {quickLinks.map(([tab, title, desc]) => (
          <button key={tab} className="more-menu-button" type="button" onClick={() => onNavigate(tab)}>
            <strong>{title}</strong>
            <span>{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MockStorePanel({ items = [], tribute = 0, purchases = {}, shieldActive = false, onPurchase }) {
  return (
    <div className="mock-store-panel">
      <section className="store-warning-card">
        <div>
          <p className="kicker">Testing Only</p>
          <h3>Mock Store. No Real Purchases.</h3>
          <p>This uses fake Tribute only so we can test what players might want without adding Stripe, subscriptions, or pay-to-win systems.</p>
          {shieldActive && <p className="soft-text">Lay Low Shield is active. For balance, attacking while shielded should remain limited in future backend PvP.</p>}
        </div>
        <strong>{tribute} Tribute</strong>
      </section>
      <div className="mock-store-grid">
        {items.map((item) => (
          <MockStoreItemCard key={item.id} item={item} tribute={tribute} owned={purchases[item.id] || 0} onPurchase={onPurchase} />
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onToggle, installReady, isInstalled, buildLabel, onOpenInstall, onResetInstallPrompt, onExportSave, onImportSave, language, onLanguageChange, beginnerLayout, onToggleBeginnerLayout, showAdvancedStats, onToggleAdvancedStats }) {
  const [importMessage, setImportMessage] = useState("");
  const rows = [
    ["musicOn", "Music", "Keep the underworld soundtrack enabled when the audio layer is added."],
    ["sfxOn", "Sound Effects", "Keep action sounds enabled for taps, jobs, fights, and rewards."],
    ["notificationsOn", "Install Reminders", "Allow the game to keep showing install reminders and related prompts."],
    ["reducedMotion", "Reduced Motion", "Cut down on motion and transitions for a calmer screen."],
  ];

  return (
    <div className="settings-panel">
      <section className="settings-hero-card">
        <img src="/icon-192.png" alt="Shadow Syndicate app icon" />
        <div>
          <p className="kicker">Game Setup</p>
          <h3>Shadow Syndicate App Hub</h3>
          <p className="soft-text">This build now uses the new app icon art and gives the player a simple place to manage install prompts and basic experience settings.</p>
          <p className="soft-text">Running: {buildLabel}</p>
        </div>
      </section>

      <BeginnerLayoutToggle enabled={beginnerLayout} onToggle={onToggleBeginnerLayout} />

      <section className="account-box settings-box">
        <h3>Home Screen Detail</h3>
        <p className="soft-text">Keep advanced stats collapsed for new players, or show the full Empire Details block when testing balance.</p>
        <button className="secondary" type="button" onClick={onToggleAdvancedStats}>
          {showAdvancedStats ? "Hide Advanced Stats on Home" : "Show Advanced Stats on Home"}
        </button>
      </section>

      <div className="account-grid">
        <section className="account-box settings-box">
          <h3>Install Status</h3>
          <p className="soft-text">Current status: <strong>{isInstalled ? "Installed to device" : installReady ? "Install prompt available" : "Browser mode"}</strong></p>
          <div className="button-row compact-row">
            <button className="primary" type="button" onClick={onOpenInstall} disabled={isInstalled || !installReady}>
              {isInstalled ? "Already Installed" : "Open Install Prompt"}
            </button>
            <button className="secondary" type="button" onClick={onResetInstallPrompt}>
              Reset Install Prompt
            </button>
          </div>
          <p className="soft-text">If the install prompt was dismissed before, reset it here so you can test it again.</p>
        </section>

        <section className="account-box settings-box">
          <h3>Language</h3>
          <p className="soft-text">{makeTranslator({ language })("settings.languageNote", "Browser translation may reset during gameplay because React redraws text. Use this in-game language setting for more stable translation.")}</p>
          <label>
            Game Language
            <select value={language || "en"} onChange={(e) => onLanguageChange?.(e.target.value)}>
              {supportedLanguages.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          {language === "ar" && <p className="soft-text">{makeTranslator({ language })("settings.arabicNote", "Arabic layout support is experimental while right-to-left screens are being tested.")}</p>}
        </section>

        <section className="account-box settings-box">
          <h3>App Icon Preview</h3>
          <div className="settings-icon-preview">
            <img src="/icon-512.png" alt="Shadow Syndicate icon preview" />
            <div>
              <p className="soft-text">The new icon is now tied into the favicon, manifest, Apple touch icon, and installable app icon set.</p>
              <p className="soft-text">This is the art players should see when they install the game to their phone or desktop.</p>
            </div>
          </div>
        </section>

        <section className="account-box settings-box full-span">
          <h3>Save Backup Tools</h3>
          <p className="soft-text">Export your local save before major updates, or import a previous Shadow Syndicate save backup.</p>
          <div className="button-row compact-row">
            <button className="secondary" type="button" onClick={onExportSave}>Export Save</button>
            <label className="import-save-button">
              Import Save
              <input type="file" accept="application/json,.json" onChange={(e) => setImportMessage(onImportSave(e.target.files?.[0]) || "")} />
            </label>
          </div>
          {importMessage && <p className="setup-success">{importMessage}</p>}
        </section>

        <section className="account-box settings-box full-span tester-notes-box">
          <h3>Tester Notes</h3>
          <p className="soft-text">Current phase: {buildLabel}. Multiplayer is still local/simulated only. Campaign content is limited right now. Export your save before testing big updates. Report bugs with what page you were on, what you clicked, and what happened.</p>
        </section>

        <section className="account-box settings-box full-span">
          <h3>Game Preferences</h3>
          <div className="settings-toggle-list">
            {rows.map(([key, label, desc]) => (
              <button key={key} type="button" className={`settings-toggle ${settings[key] ? "on" : "off"}`} onClick={() => onToggle(key)}>
                <div>
                  <strong>{label}</strong>
                  <span>{desc}</span>
                </div>
                <span className="settings-toggle-pill">{settings[key] ? "On" : "Off"}</span>
              </button>
            ))}
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

function CampaignProgressPanel({ chapters = [], onClaim, onNavigate, t = (k, f) => f || k }) {
  const claimed = chapters.filter((chapter) => chapter.claimed).length;
  const allClaimed = chapters.length > 0 && claimed >= chapters.length;

  return (
    <div className="campaign-panel">
      <div className="campaign-panel-head">
        <div>
          <h3>Story Chapters</h3>
          <p>These chapters are the current story content. Finish goals, claim rewards, then keep building power while the next chapter is being built.</p>
        </div>
        <div className="campaign-score">
          <span>Progress</span>
          <strong>{claimed}/{chapters.length}</strong>
          <small>chapters claimed</small>
        </div>
      </div>

      {allClaimed && (
        <section className="campaign-coming-soon">
          <p className="kicker">{t("moreChapters", "More Campaign Chapters Coming Soon")}</p>
          <h3>You have completed the current story content.</h3>
          <p>Keep building turf, fighting rivals, collecting income, completing bounties, and settling grudges while the next chapter is being built.</p>
        </section>
      )}

      <div className="chapter-grid">
        {chapters.map((chapter, index) => {
          const requirements = Array.isArray(chapter.requirements) ? chapter.requirements : [];
          const doneCount = requirements.filter((item) => item.done).length;
          const total = requirements.length;
          const statusText = chapter.claimed ? "Reward Claimed" : chapter.unlocked ? chapter.complete ? "Ready to Claim" : `${doneCount}/${total} Goals` : "Locked";

          return (
            <div key={chapter.id} className={`chapter-card ${chapter.claimed ? "claimed" : chapter.unlocked ? "open" : "locked"}`}>
              <SafeImage src={chapter.image} alt={chapter.title} />
              <div className="chapter-body">
                <div className="chapter-title-row">
                  <div><p className="kicker">Chapter {index + 1}</p><h3>{chapter.title}</h3></div>
                  <span>{statusText}</span>
                </div>
                <p>{chapter.desc}</p>
                <div className="chapter-reward"><small>Reward</small><strong>{chapter.rewardText}</strong></div>
                <div className="chapter-goals">
                  {requirements.map((requirement) => (
                    <button key={requirement.label} type="button" className={requirement.done ? "done" : "open"} disabled={!chapter.unlocked} onClick={() => onNavigate(requirement.action)}>
                      <span>{requirement.done ? "Done" : "Goal"}</span><strong>{requirement.label}</strong>
                    </button>
                  ))}
                </div>
                {!chapter.unlocked && <DisabledReason reason="Complete the previous chapter to unlock this." />}
                {chapter.claimed && index === chapters.length - 1 && <DisabledReason reason="Current campaign content complete. More chapters are coming soon." />}
                <button className="primary" disabled={!chapter.unlocked || !chapter.complete || chapter.claimed} onClick={() => onClaim(chapter.id)}>
                  {chapter.claimed ? "Reward Claimed" : chapter.unlocked ? chapter.complete ? "Claim Chapter Reward" : "Finish Goals First" : "Locked"}
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

function ContactsPanel({ game, contacts = [], stats = {}, onUpgrade, onFavor, onNavigate, t = (k, f) => f || k }) {
  const unlockedCount = Number(stats.unlockedCount || 0);

  return (
    <div className="contacts-panel readable-panel">
      <section className="contact-hero">
        <SafeImage src="/art/pages/city-wire.jpg" alt="Underworld contacts" />
        <div>
          <p className="kicker">Underworld Contacts</p>
          <h3>Build the network behind the empire</h3>
          <p>Contacts unlock special benefits as your respect and level grow. They improve jobs, heat control, tribute, healing, and vault work.</p>
        </div>
        <div className="contact-score-card"><span>Contacts</span><strong>{unlockedCount}/{contacts.length}</strong><small>{stats.totalLevels || 0} total trust levels</small></div>
      </section>

      {unlockedCount <= 0 && (
        <EmptyState title="No contacts unlocked yet" actionLabel="Run Jobs" onAction={() => onNavigate?.("jobs")}>
          <p>Run jobs, gain respect, and reach Level 2 to start building underworld relationships.</p>
          <p>Contacts matter because they unlock favors and permanent bonuses later.</p>
        </EmptyState>
      )}

      <div className="contact-status-grid">
        <Stat label="Job Cash" value={`${Math.round(((stats.jobIncomeMultiplier || 1) - 1) * 100)}%`} helper="contact bonus" />
        <Stat label="Front Income" value={`${Math.round(((stats.frontIncomeMultiplier || 1) - 1) * 100)}%`} helper="contact bonus" />
        <Stat label="Tribute" value={`${Math.round(((stats.tributeMultiplier || 1) - 1) * 100)}%`} helper="contact bonus" />
        <Stat label="Heat Buffer" value={`-${stats.heatReduction || 0}`} helper="per noisy move" />
        <Stat label="Clinic Discount" value={`${Math.round(Math.min(0.35, stats.clinicDiscount || 0) * 100)}%`} helper="street doctor" />
        <Stat label="Launder Bonus" value={`+${Math.round((stats.launderBonus || 0) * 100)}%`} helper="bookkeeper" />
      </div>

      <div className="contact-grid">
        {contacts.map((contact) => {
          const level = getContactLevel(game, contact.id);
          const cost = getContactUpgradeCost(contact, level);
          const reason = level >= (contact.max || 5) ? "Contact is fully connected." : getMissingRequirementMessage({ cash: game.cash, respect: game.respect, tribute: game.tribute, energy: game.energy }, cost, { ready: level <= 0 ? "Ready to unlock" : "Ready to build trust" });
          const favorStatus = getContactFavorStatus(game, contact.id);
          const unlocked = level > 0;
          const upgradeDisabled = level >= (contact.max || 5) || reason !== (level <= 0 ? "Ready to unlock" : "Ready to build trust");
          return (
            <ArtCard key={contact.id} title={contact.name} image={contact.image} tag={contact.tag} desc={contact.desc}>
              <Info label="Trust" value={unlocked ? `Level ${level}/${contact.max || 5}` : "Locked"} />
              <Info label="Unlock / Upgrade" value={getContactUpgradeLabel(contact, level)} />
              <Info label="Permanent Effect" value={contact.effect} />
              <Info label="Favor" value={contact.favor?.title || "No favor"} />
              <Info label="Status" value={unlocked ? favorStatus.label : "Unlock first"} />
              <DisabledReason reason={upgradeDisabled ? reason : null} />
              <div className="button-row compact-row contact-action-row">
                <button className="primary" disabled={level >= (contact.max || 5)} onClick={() => onUpgrade(contact)}>{level <= 0 ? "Unlock Contact" : "Build Trust"}</button>
                <button className="secondary" disabled={!unlocked || !favorStatus.ready} onClick={() => onFavor(contact)}>{!unlocked ? "Unlock First" : favorStatus.ready ? "Call Favor" : favorStatus.label}</button>
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

function VaultPanel({ game, stats, onDepositHalf, onDepositAll, onWithdraw, onUpgrade, onLaunder, onBurnTrail, onBlocked, t = (k, f) => f || k }) {
  const upgradeCost = getVaultUpgradeCost(stats.level);
  const burnCost = getVaultBurnTrailCost(game);
  const launderAmount = getVaultLaunderAmount(game);
  const launderedReturn = Math.round(launderAmount * stats.launderRate);
  const capacityLeft = Math.max(0, Number(stats.capacity || 0) - Number(stats.current || 0));
  const depositable = Math.min(Number(game.cash || 0), capacityLeft);
  const vaultEmpty = Number(stats.current || 0) <= 0;
  const depositReason = Number(game.cash || 0) <= 0 ? "No available cash to deposit." : capacityLeft <= 0 ? "Vault is full. Upgrade capacity to store more cash." : null;
  const withdrawReason = vaultEmpty ? t("vaultEmpty", "Vault is empty. Deposit cash first.") : null;
  const upgradeReason = stats.level >= 5 ? "Vault is already maxed." : getMissingRequirementMessage({ cash: game.cash, tribute: game.tribute, energy: game.energy }, upgradeCost, { ready: "Ready to upgrade" });

  return (
    <section className="vault-panel readable-panel">
      <div className="vault-hero">
        <SafeImage src="/art/pages/vault.jpg" alt="Vault Network" />
        <div>
          <p className="kicker">Vault Network</p>
          <h3>Protected cash is not the same as capacity.</h3>
          <p>Vault cash is money you have actually deposited. Vault capacity is only the maximum amount the vault can hold.</p>
          <p className="soft-text">The vault can hold up to {money(stats.capacity)}, but you currently have {money(stats.current)} deposited.</p>
        </div>
        <div className="vault-score-card"><span>Vault Level</span><strong>{stats.level}/5</strong><small>{stats.operations} vault operations completed</small></div>
      </div>

      <div className="vault-status-grid clarity-grid">
        <Stat label="Vault Cash" value={money(stats.current)} helper="protected money deposited" />
        <Stat label="Vault Capacity" value={money(stats.capacity)} helper="maximum storage" />
        <Stat label="Available Cash" value={money(game.cash)} helper="cash in hand" />
        <Stat label="Depositable" value={money(depositable)} helper="can move now" />
        <Stat label="Withdrawable" value={money(stats.current)} helper="can take out now" />
        <Stat label="Capacity Left" value={money(capacityLeft)} helper="space remaining" />
      </div>

      {vaultEmpty && <DisabledReason reason="Vault is empty. Deposit cash first before trying to withdraw or launder money." />}
      <Progress label="Protected Capacity" value={stats.protectedCash} max={stats.capacity} />

      <div className="vault-action-grid">
        <Card title="Deposit Cash" tag="Protection" desc="Move exposed cash into protected storage before rivals hit back.">
          <Info label="Available Cash" value={money(game.cash)} />
          <Info label="Capacity Left" value={money(capacityLeft)} />
          <DisabledReason reason={depositReason} />
          <div className="button-row compact-row">
            <button className="primary" disabled={Boolean(depositReason)} onClick={() => depositReason ? onBlocked?.(depositReason) : onDepositHalf()}>{depositReason || "Deposit 50%"}</button>
            <button className="primary" disabled={Boolean(depositReason)} onClick={() => depositReason ? onBlocked?.(depositReason) : onDepositAll()}>Deposit All</button>
            <button className="secondary" disabled={Boolean(withdrawReason)} onClick={() => withdrawReason ? onBlocked?.(withdrawReason) : onWithdraw()}>{withdrawReason ? "Vault Empty" : t("withdrawAll", "Withdraw All")}</button>
          </div>
        </Card>

        <Card title="Upgrade Vault" tag="Capacity" desc="Increase capacity and improve protection against rival retaliation.">
          <Info label="Current Level" value={`${stats.level}/5`} />
          <Info label="Next Upgrade" value={stats.level >= 5 ? "Maxed" : `${money(upgradeCost.cash)} / ${upgradeCost.tribute} Tribute / ${upgradeCost.energy} Energy`} />
          <Info label="Status" value={upgradeReason} />
          <button className="primary" disabled={stats.level >= 5} onClick={() => upgradeReason !== "Ready to upgrade" ? onBlocked?.(upgradeReason) : onUpgrade()}>{stats.level >= 5 ? "Vault Maxed" : upgradeReason === "Ready to upgrade" ? "Upgrade Vault" : upgradeReason}</button>
        </Card>

        <Card title="Launder Cash" tag="Fronts" desc="Move vault money back into usable cash through fronts. You lose a small cut and gain boss growth.">
          <Info label="Amount Moved" value={stats.current >= 250 ? money(launderAmount) : "Need $250 vault"} />
          <Info label="Returned Cash" value={stats.current >= 250 ? money(launderedReturn) : "Not ready"} />
          <Info label="Cost" value="6 Energy / small Heat" />
          <button className="primary" disabled={stats.current < 250} onClick={() => stats.current < 250 ? onBlocked?.("Need at least $250 in vault cash before laundering.") : onLaunder()}>Launder Cash</button>
        </Card>

        <Card title="Burn Trail" tag="Control" desc="Spend protected cash to cool Heat and reduce rival pressure citywide.">
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

function SafehousePanel({ game, rooms = [], stats = {}, onUpgrade, onBlocked, t = (k, f) => f || k }) {
  return (
    <section className="safehouse-panel readable-panel">
      <div className="safehouse-hero">
        <SafeImage src="/art/gear/war-room.png" alt="Safehouse headquarters" />
        <div>
          <p className="kicker">Safehouse</p>
          <h3>Your base gives permanent bonuses.</h3>
          <p>Your safehouse gives permanent bonuses. Upgrade rooms with cash, tribute, and energy. Every room shows what it does and why an upgrade may be blocked.</p>
        </div>
        <div className="safehouse-score-card"><span>Total Levels</span><strong>{stats.totalLevels}/20</strong><small>{game.safehouseMoves || 0} upgrades completed</small></div>
      </div>

      <div className="safehouse-status-grid">
        <Stat label="Front Income" value={`+${Math.round(((stats.incomeMultiplier || 1) - 1) * 100)}%`} helper="Back Office" />
        <Stat label="Tribute" value={`+${Math.round(((stats.tributeMultiplier || 1) - 1) * 100)}%`} helper="Back Office" />
        <Stat label="Energy / Stamina" value={`+${stats.maxEnergyBonus || 0} / +${stats.maxStaminaBonus || 0}`} helper="Garage" />
        <Stat label="Attack / Defense" value={`+${stats.attackBonus || 0} / +${stats.defenseBonus || 0}`} helper="Armory" />
        <Stat label="Heat Control" value={`-${stats.heatReduction || 0}`} helper="Crew Lounge" />
        <Stat label="Loyalty Boost" value={`+${stats.loyaltyBonus || 0}`} helper="Crew Lounge" />
      </div>

      <div className="safehouse-room-grid">
        {rooms.map((room) => {
          const level = getSafehouseRoomLevel(game, room.id);
          const max = room.max || 5;
          const maxed = level >= max;
          const cost = getSafehouseUpgradeCost(room, level);
          const ready = !maxed && getMissingRequirementMessage({ cash: game.cash, tribute: game.tribute, energy: game.energy }, cost, { ready: "Ready to upgrade" }) === "Ready to upgrade";
          const reason = maxed ? "Room is fully upgraded." : getMissingRequirementMessage({ cash: game.cash, tribute: game.tribute, energy: game.energy }, cost, { ready: "Ready to upgrade" });
          const currentBonus = level <= 0 ? "No bonus yet." : room.effect;
          return (
            <ArtCard key={room.id} title={room.name} image={room.image} tag={room.tag} desc={room.desc}>
              <Info label="Room Level" value={`${level}/${max}`} />
              <Info label="Current Bonus" value={currentBonus} />
              <Info label="What It Does" value={room.effect} />
              <Info label="Next Upgrade" value={maxed ? "Maxed" : `${money(cost.cash)} cash / ${cost.tribute} tribute / ${cost.energy} energy`} />
              <Info label="You Have" value={`${money(game.cash)} cash / ${game.tribute || 0} tribute / ${game.energy || 0} energy`} />
              <Info label="Status" value={reason} />
              <Progress label="Room Progress" value={Math.round((level / max) * 100)} max={100} />
              <DisabledReason reason={!ready ? reason : null} />
              <button className="primary" disabled={maxed} onClick={() => ready ? onUpgrade(room) : onBlocked?.(reason)}>{maxed ? t("roomMaxed", "Room Maxed") : ready ? t("upgradeRoom", "Upgrade Room") : reason}</button>
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

function HealthStat({ current, max, cash, onHeal }) {
  const full = Number(current || 0) >= Number(max || 100);
  const cost = Math.max(150, Math.round(Number(max || 100) * 2));
  return (
    <div className={`stat health-stat ${full ? "full" : "hurt"}`}>
      <span>Health</span>
      <strong>{current}/{max}</strong>
      <small>{full ? "full" : `heal ${money(cost)}`}</small>
      <button type="button" className="mini-heal-button" onClick={onHeal} disabled={full || Number(cash || 0) < cost}>
        Heal
      </button>
    </div>
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
      <SafeImage src={image} alt={title} />
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
      <SafeImage src={image} alt={title} />
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
