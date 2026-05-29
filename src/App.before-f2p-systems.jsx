import React, { useEffect, useMemo, useState } from "react";

const SAVE_KEY = "shadow_syndicate_live_source_save_v1";

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

const districts = [
  { id: "southside", name: "Southside", level: 1, control: 12, cost: 175, energy: 5, risk: "Low" },
  { id: "docks", name: "Docks", level: 1, control: 15, cost: 150, energy: 5, risk: "Low" },
  { id: "warehouse", name: "Warehouse District", level: 1, control: 0, cost: 375, energy: 7, risk: "Medium" },
  { id: "riverside", name: "Riverside", level: 2, control: 0, cost: 550, energy: 8, risk: "Medium" },
  { id: "nightlife", name: "Nightlife District", level: 2, control: 0, cost: 700, energy: 9, risk: "Medium" },
  { id: "financial", name: "Financial Core", level: 3, control: 0, cost: 1300, energy: 12, risk: "High" },
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
];

const campaign = [
  {
    id: "c1",
    title: "Chapter 1: First Blood in Southside",
    image: "/art/chapters/first-blood-southside.jpg",
    desc: "Start small, build respect, and take your first piece of the city.",
    missions: [
      {
        id: "c1_jobs",
        title: "Make Your First Moves",
        desc: "Run 3 jobs anywhere in the city.",
        type: "stats",
        key: "jobsRun",
        target: 3,
        reward: { cash: 500, xp: 25 },
      },
      {
        id: "c1_first_win",
        title: "Send a Message",
        desc: "Win your first fight against any rival.",
        type: "wins",
        target: 1,
        reward: { cash: 750, xp: 50, skillPoints: 1 },
      },
      {
        id: "c1_southside",
        title: "Claim Southside",
        desc: "Reach 25% control in Southside.",
        type: "district",
        district: "southside",
        target: 25,
        reward: { cash: 1000, xp: 60, control: { southside: 5 } },
      },
      {
        id: "c1_property",
        title: "Buy Your First Front",
        desc: "Buy any property.",
        type: "properties",
        target: 1,
        reward: { cash: 500, energy: 50 },
      },
      {
        id: "c1_level",
        title: "Earn Your Name",
        desc: "Reach Level 2.",
        type: "level",
        target: 2,
        reward: { tribute: 5, skillPoints: 1 },
      },
    ],
  },
  {
    id: "c2",
    title: "Chapter 2: Harbor Money",
    image: "/art/chapters/harbor-money.jpg",
    desc: "The docks are where the real cash starts moving.",
    missions: [
      {
        id: "c2_docks",
        title: "Control the Harbor",
        desc: "Reach 35% control in the Docks.",
        type: "district",
        district: "docks",
        target: 35,
        reward: { cash: 1200, xp: 75 },
      },
      {
        id: "c2_dockside_lot",
        title: "Buy Into the Harbor",
        desc: "Own the Dockside Lot.",
        type: "property",
        property: "dockside_lot",
        target: 1,
        reward: { cash: 900, energy: 75 },
      },
      {
        id: "c2_dockside_outfit",
        title: "Break the Dockside Outfit",
        desc: "Defeat the Dockside Outfit.",
        type: "rival",
        rival: "dockside_outfit",
        target: 1,
        reward: { cash: 1500, xp: 100, skillPoints: 1 },
      },
      {
        id: "c2_city_control",
        title: "Become a Rising Crew",
        desc: "Reach 20% overall city control.",
        type: "city",
        target: 20,
        reward: { cash: 2000, tribute: 5, xp: 125 },
      },
    ],
  },
];

const pageCards = [
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
    tab: "vault",
    title: "Vault",
    image: "/art/pages/vault.jpg",
    desc: "Protect cash from rival attacks.",
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

const defaultTerritory = Object.fromEntries(districts.map((d) => [d.id, d.control]));

const startGame = {
  started: false,
  bossName: "Rookie",
  classId: "boss",
  cash: 750,
  vault: 0,
  tribute: 100,
  influence: 0,
  claimedMissions: {},
  level: 1,
  xp: 0,
  health: 100,
  maxHealth: 100,
  energy: 300,
  maxEnergy: 100,
  stamina: 25,
  maxStamina: 25,
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
    return properties.reduce((sum, item) => {
      const owned = game.properties[item.id] || 0;
      return sum + Math.round(item.income * owned * bossClass.income);
    }, 0);
  }, [game.properties, bossClass]);

  const cityControl = useMemo(() => {
    const total = districts.reduce((sum, d) => sum + (game.territory[d.id] || 0), 0);
    return Math.round(total / districts.length);
  }, [game.territory]);

  const attack = Math.round((10 + game.crew * 2 + gearAttack + game.attackSkill * 5) * bossClass.attack);
  const defense = Math.round((10 + game.crew * 2 + gearDefense + game.defenseSkill * 5) * bossClass.defense);

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
          next = addLog(next, `Properties generated ${money(earned)}.`);
        }

        return next;
      });
    }, 10000);

    return () => clearInterval(timer);
  }, [income]);

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
      energy: 300,
      log: [
        `Daily login bonus: +200 Energy.`,
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

      const payout = Math.round(rand(job.cash[0], job.cash[1]) * bossClass.income);
      const controlGain = Math.max(1, Math.round(job.control * bossClass.control));

      let next = {
        ...old,
        energy: old.energy - job.energy,
        cash: old.cash + payout,
        jobsRun: old.jobsRun + 1,
        territory: {
          ...old.territory,
          [job.district]: clamp((old.territory[job.district] || 0) + controlGain, 0, 100),
        },
      };

      next = addXp(next, job.xp);

      return addLog(
        next,
        `${job.name}: earned ${money(payout)}, ${job.xp} XP, and +${controlGain}% ${districtName(job.district)} control.`
      );
    });
  }

  function expandDistrict(district) {
    setGame((old) => {
      if (old.level < district.level) return addLog(old, `${district.name} unlocks at Level ${district.level}.`);
      if (old.cash < district.cost) return addLog(old, `You need ${money(district.cost)} to expand into ${district.name}.`);
      if (old.energy < district.energy) return addLog(old, `Not enough energy to expand into ${district.name}.`);

      const gain = Math.max(2, Math.round(rand(4, 8) * bossClass.control));

      return addLog(
        {
          ...old,
          cash: old.cash - district.cost,
          energy: old.energy - district.energy,
          territory: {
            ...old.territory,
            [district.id]: clamp((old.territory[district.id] || 0) + gain, 0, 100),
          },
        },
        `${district.name} control increased by ${gain}%.`
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
          properties: {
            ...old.properties,
            [property.id]: (old.properties[property.id] || 0) + 1,
          },
        },
        `Purchased ${property.name}.`
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
        },
        `Purchased ${item.name}. Attack +${item.attack}, Defense +${item.defense}.`
      );
    });
  }

  function fightRival(rival) {
    setGame((old) => {
      if (old.stamina < 1) return addLog(old, `Not enough stamina to attack ${rival.name}.`);
      if (old.health <= 0) return addLog(old, "You are out of health. Visit the clinic.");

      const roll = attack + rand(1, 20);
      const rivalRoll = rival.power + rand(1, 20);
      const won = roll >= rivalRoll;

      let next = {
        ...old,
        stamina: old.stamina - 1,
      };

      if (won) {
        const payout = rand(rival.reward[0], rival.reward[1]);

        next = {
          ...next,
          cash: next.cash + payout,
          wins: next.wins + 1,
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

        return addLog(next, `Victory over ${rival.name}. Earned ${money(payout)} and ${rival.xp} XP.`);
      }

      const loss = Math.min(next.cash, rand(75, 240));
      const damage = rand(6, 18);

      return addLog(
        {
          ...next,
          cash: next.cash - loss,
          health: Math.max(0, next.health - damage),
          losses: next.losses + 1,
        },
        `Lost to ${rival.name}. Dropped ${money(loss)} and took ${damage} damage.`
      );
    });
  }

  function spendSkill(type) {
    setGame((old) => {
      if (old.skillPoints <= 0) return addLog(old, "You do not have any skill points to spend.");

      if (type === "attack") {
        return addLog(
          { ...old, skillPoints: old.skillPoints - 1, attackSkill: old.attackSkill + 1 },
          "Spent 1 skill point on Attack."
        );
      }

      if (type === "defense") {
        return addLog(
          { ...old, skillPoints: old.skillPoints - 1, defenseSkill: old.defenseSkill + 1 },
          "Spent 1 skill point on Defense."
        );
      }

      if (type === "energy") {
        return addLog(
          {
            ...old,
            skillPoints: old.skillPoints - 1,
            maxEnergy: old.maxEnergy + 10,
            energy: old.energy + 10,
          },
          "Spent 1 skill point on Energy."
        );
      }

      return old;
    });
  }

  function depositVault(percent) {
    setGame((old) => {
      const amount = Math.floor(old.cash * percent);
      if (amount <= 0) return addLog(old, "No cash available to vault.");

      return addLog(
        {
          ...old,
          cash: old.cash - amount,
          vault: old.vault + amount,
        },
        `Moved ${money(amount)} into the vault.`
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

  function healBoss() {
    setGame((old) => {
      if (old.health >= old.maxHealth) return addLog(old, "You are already at full health.");

      const cost = Math.max(250, old.maxHealth * 2);
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

  function missionProgress(mission, state = game) {
    if (mission.type === "stats") return state[mission.key] || 0;
    if (mission.type === "wins") return state.wins || 0;
    if (mission.type === "district") return state.territory?.[mission.district] || 0;
    if (mission.type === "property") return state.properties?.[mission.property] || 0;
    if (mission.type === "properties") {
      return Object.values(state.properties || {}).reduce((sum, count) => sum + count, 0);
    }
    if (mission.type === "rival") return state.beaten?.[mission.rival] ? 1 : 0;
    if (mission.type === "level") return state.level || 1;
    if (mission.type === "city") {
      const total = districts.reduce((sum, district) => sum + (state.territory?.[district.id] || 0), 0);
      return Math.round(total / districts.length);
    }

    return 0;
  }

  function missionDone(mission, state = game) {
    return missionProgress(mission, state) >= (mission.target || 1);
  }

  function chapterStatus(chapter, state = game) {
    const total = chapter.missions.length;
    const claimed = chapter.missions.filter((mission) => state.claimedMissions?.[mission.id]).length;
    const ready = chapter.missions.filter(
      (mission) => missionDone(mission, state) && !state.claimedMissions?.[mission.id]
    ).length;

    return {
      total,
      claimed,
      ready,
      complete: claimed >= total,
    };
  }

  function rewardText(reward = {}) {
    const parts = [];

    if (reward.cash) parts.push(money(reward.cash));
    if (reward.xp) parts.push(`${reward.xp} XP`);
    if (reward.energy) parts.push(`+${reward.energy} Energy`);
    if (reward.tribute) parts.push(`+${reward.tribute} Tribute`);
    if (reward.skillPoints) parts.push(`+${reward.skillPoints} Skill Point${reward.skillPoints === 1 ? "" : "s"}`);
    if (reward.influence) parts.push(`+${reward.influence} Influence`);

    if (reward.control) {
      Object.entries(reward.control).forEach(([districtId, amount]) => {
        parts.push(`+${amount}% ${districtName(districtId)} control`);
      });
    }

    return parts.join(" / ") || "No reward";
  }

  function claimMission(mission) {
    setGame((old) => {
      if (old.claimedMissions?.[mission.id]) {
        return addLog(old, `${mission.title} has already been claimed.`);
      }

      if (!missionDone(mission, old)) {
        return addLog(old, `${mission.title} is not complete yet.`);
      }

      const reward = mission.reward || {};

      let next = {
        ...old,
        cash: old.cash + (reward.cash || 0),
        energy: old.energy + (reward.energy || 0),
        tribute: old.tribute + (reward.tribute || 0),
        skillPoints: old.skillPoints + (reward.skillPoints || 0),
        influence: (old.influence || 0) + (reward.influence || 0),
        claimedMissions: {
          ...(old.claimedMissions || {}),
          [mission.id]: true,
        },
      };

      if (reward.control) {
        const updatedTerritory = { ...next.territory };

        Object.entries(reward.control).forEach(([districtId, amount]) => {
          updatedTerritory[districtId] = clamp((updatedTerritory[districtId] || 0) + amount, 0, 100);
        });

        next = {
          ...next,
          territory: updatedTerritory,
        };
      }

      if (reward.xp) {
        next = addXp(next, reward.xp);
      }

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

  function districtName(id) {
    return districts.find((d) => d.id === id)?.name || id;
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
              <p>
                Recruit your crew, run jobs, buy fronts, hit rivals, and grow your shadow across the city.
              </p>
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

            <button className="primary big" onClick={startNewGame}>
              New Game
            </button>
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
        <Stat label="Tribute" value={game.tribute} helper="premium" />
        <Stat label="Health" value={`${game.health}/${game.maxHealth}`} helper="combat" />
        <Stat label="Energy" value={`${game.energy}/${game.maxEnergy}`} helper="jobs" />
        <Stat label="Stamina" value={`${game.stamina}/${game.maxStamina}`} helper="attacks" />
        <Stat label="Power" value={`${attack}/${defense}`} helper="atk / def" />
      </section>

      <nav className="main-nav">
        {[
          ["command", "Command"],
          ["campaign", "Campaign"],
          ["jobs", "Jobs"],
          ["territory", "Territory"],
          ["crew", "Crew"],
          ["properties", "Properties"],
          ["rivals", "Rivals"],
          ["vault", "Vault"],
          ["clinic", "Clinic"],
          ["wire", "City Wire"],
          ["log", "Log"],
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
                            <button
                              type="button"
                              className="secondary chapter-toggle"
                              onClick={() =>
                                setOpenCompletedChapters((old) => ({
                                  ...old,
                                  [chapter.id]: !old[chapter.id],
                                }))
                              }
                            >
                              {isOpen ? "Collapse Chapter" : "View Chapter"}
                            </button>
                          )}
                        </div>
                      </div>

                      {!isOpen && isComplete && (
                        <div className="collapsed-note">
                          Chapter complete. Missions are collapsed to keep the campaign screen shorter.
                        </div>
                      )}

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

                                  <span className="mission-badge">
                                    {claimed ? "Claimed" : done ? "Ready" : "Open"}
                                  </span>
                                </div>

                                <Progress label="Progress" value={Math.min(progress, target)} max={target} />

                                <Info label="Reward" value={rewardText(mission.reward)} />

                                <button
                                  type="button"
                                  className="primary"
                                  disabled={!done || claimed}
                                  onClick={() => claimMission(mission)}
                                >
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
            <Panel title="Territory Map" sub="Expand district control to unlock opportunities and increase influence.">
              <div className="card-grid">
                {districts.map((district) => (
                  <Card key={district.id} title={district.name} tag={district.risk}>
                    <Progress label="Control" value={game.territory[district.id] || 0} max={100} />
                    <Info label="Unlock Level" value={district.level} />
                    <Info label="Cost" value={`${money(district.cost)} / ${district.energy} Energy`} />
                    <button className="primary" onClick={() => expandDistrict(district)}>
                      Expand
                    </button>
                  </Card>
                ))}
              </div>
            </Panel>
          )}

          {tab === "crew" && (
            <Panel title="Crew & Gear" sub="Build your crew, spend skill points, and buy permanent upgrades.">
              <div className="mini-grid">
                <Stat label="Crew" value={game.crew} helper="members" />
                <Stat label="Skill Points" value={game.skillPoints} helper="unspent" />
                <Stat label="Attack Skill" value={game.attackSkill} helper="+5 each" />
                <Stat label="Defense Skill" value={game.defenseSkill} helper="+5 each" />
              </div>

              <div className="button-row">
                <button className="primary" onClick={() => spendSkill("attack")}>Add Attack</button>
                <button className="primary" onClick={() => spendSkill("defense")}>Add Defense</button>
                <button className="primary" onClick={() => spendSkill("energy")}>Add Energy</button>
              </div>

              <div className="card-grid">
                {gear.map((item) => (
                  <ArtCard key={item.id} title={item.name} image={item.image} tag={item.type}>
                    <Info label="Cost" value={money(item.cost)} />
                    <Info label="Attack" value={`+${item.attack}`} />
                    <Info label="Defense" value={`+${item.defense}`} />
                    <button className="primary" disabled={game.gear[item.id]} onClick={() => buyGear(item)}>
                      {game.gear[item.id] ? "Owned" : "Buy Gear"}
                    </button>
                  </ArtCard>
                ))}
              </div>
            </Panel>
          )}

          {tab === "properties" && (
            <Panel title="Properties" sub="Buy fronts and businesses that generate automatic cash.">
              <div className="card-grid">
                {properties.map((property) => (
                  <ArtCard key={property.id} title={property.name} image={property.image} tag={districtName(property.district)} desc={property.desc}>
                    <Info label="Owned" value={game.properties[property.id] || 0} />
                    <Info label="Cost" value={money(property.cost)} />
                    <Info label="Income" value={`${money(Math.round(property.income * bossClass.income))}/min`} />
                    <button className="primary" onClick={() => buyProperty(property)}>
                      Buy Property
                    </button>
                  </ArtCard>
                ))}
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
                    <button className="danger" onClick={() => fightRival(rival)}>
                      Attack Rival
                    </button>
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
              <button className="danger" onClick={healBoss}>
                Heal Boss
              </button>
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
                {game.log.map((line, index) => (
                  <div key={`${line}-${index}`} className="log-item">
                    {line}
                  </div>
                ))}
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
            <Info label="Wins" value={game.wins} />
            <Info label="Losses" value={game.losses} />
            <Info label="Attack" value={attack} />
            <Info label="Defense" value={defense} />
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
          ["jobs", "Jobs"],
          ["rivals", "Fight"],
          ["vault", "Vault"],
          ["crew", "Crew"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>
            {label}
          </button>
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
