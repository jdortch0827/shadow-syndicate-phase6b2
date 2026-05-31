export function getDynamicStreetChatFeed(game = {}, context = {}) {
  const heat = Number(context.heat ?? game.heat ?? 0);
  const bossName = game.bossName || "the new boss";
  const cityControl = Number(context.cityControl || 0);
  const topRivalThreat = context.topRivalThreat;
  const activeLead = context.activeStreetOpportunity;
  const recommendedMove = context.recommendedMove;
  const logLine = String((game.log || [])[0] || "");
  const loyalty = Number(game.crewLoyalty ?? 75);
  const health = Number(game.health || 0);
  const maxHealth = Number(game.maxHealth || 100);
  const ownedFronts = Object.values(game.properties || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const campaignClaimed = Object.values(game.chapterRewards || {}).filter(Boolean).length;
  const pvpLog = Array.isArray(context.pvpLog) ? context.pvpLog : (game.pvpAttackLog || []);
  const lastPvp = pvpLog[0];
  const grudgeMap = context.grudgeMap || game.pvpGrudges || {};
  const topGrudge = Object.entries(grudgeMap).sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0];

  const feed = [
    { speaker: "Corner Lookout", tag: "Next Move", line: `Word is ${bossName} should ${recommendedMove?.title ? recommendedMove.title.toLowerCase() : "keep building"}.` },
  ];

  if (heat >= 70) feed.push({ speaker: "Radio Scanner", tag: "Heat", line: "Cops are riding heavy tonight. Everybody is keeping their heads down." });
  else if (heat <= 20) feed.push({ speaker: "Back Alley Clerk", tag: "Quiet", line: "Streets are quiet enough to make a clean move if you do it fast." });
  else feed.push({ speaker: "Corner Store Owner", tag: "Street", line: "People are watching, but nobody is brave enough to say much yet." });

  if (topRivalThreat && Number(topRivalThreat.pressure || 0) >= 55) {
    feed.push({ speaker: "Nervous Runner", tag: "Rivals", line: `${topRivalThreat.rival?.name || "A rival crew"} has been asking questions about your people.` });
  }

  if (logLine.toLowerCase().includes("earned") || logLine.toLowerCase().includes("job")) {
    feed.push({ speaker: "Dock Worker", tag: "Job", line: "Somebody got paid tonight. Everybody on the block heard about it." });
  }
  if (logLine.toLowerCase().includes("property") || logLine.toLowerCase().includes("front")) {
    feed.push({ speaker: "Old Bookkeeper", tag: "Front", line: "That little business on the corner has new money behind it." });
  }
  if (logLine.toLowerCase().includes("healed") || logLine.toLowerCase().includes("clinic")) {
    feed.push({ speaker: "Street Doctor", tag: "Clinic", line: "Boss got patched up. That means trouble is probably not finished." });
  }

  if (health > 0 && health <= Math.round(maxHealth * 0.35)) {
    feed.push({ speaker: "Backroom Nurse", tag: "Health", line: "Word is the boss looked rough after that last move." });
  }
  if (cityControl >= 45) feed.push({ speaker: "Taxi Driver", tag: "Turf", line: "People are starting to act like this city already belongs to you." });
  if (loyalty < 55) feed.push({ speaker: "Crew Whisper", tag: "Loyalty", line: "Some of your people are wondering if the money is worth the risk." });
  if (ownedFronts > 0) feed.push({ speaker: "Night Clerk", tag: "Income", line: "Your fronts are starting to look less like stores and more like territory markers." });
  if (campaignClaimed > 0) feed.push({ speaker: "Street Historian", tag: "Campaign", line: "That name is showing up in more stories every night." });
  if (game.dailyRewardClaimedDate) feed.push({ speaker: "Pay Window", tag: "Daily", line: "Daily money got collected. That is how habits become empires." });
  if (Number(game.liveEventInfluence || 0) > 0) feed.push({ speaker: "Southside Mixer", tag: "Event", line: "Concrete Pour work is moving. Southside is paying attention." });
  if (lastPvp?.targetId) {
    feed.push({ speaker: "Street Bookie", tag: "PvP", line: lastPvp.outcome?.toLowerCase?.().includes("win") || lastPvp.title?.includes("Successful") ? "Word is you embarrassed a rival crew. People are starting to pick sides." : "Your last street hit is getting talked about, and not all of it sounds good." });
  }
  if (topGrudge && Number(topGrudge[1] || 0) >= 75) {
    feed.push({ speaker: "Back Booth Informant", tag: "Nemesis", line: "One of your rivalries is not business anymore. That one has gone personal." });
  }
  if (Object.values(game.pvpNemesisMap || {}).some(Boolean)) {
    feed.push({ speaker: "Street Bookie", tag: "Nemesis", line: "People are choosing sides now. A real enemy makes every win louder and every loss uglier." });
  }
  if (Object.values(game.frontDamage || {}).some((value) => Number(value || 0) > 0)) {
    feed.push({ speaker: "Old Bookkeeper", tag: "Front Damage", line: "A damaged front bleeds money until somebody pays to fix it." });
  }
  if (activeLead) feed.push({ speaker: "City Wire", tag: "Lead", line: `${activeLead.title || "A street lead"} is still warm, but it will not stay that way forever.` });

  return feed.slice(0, 9);
}
