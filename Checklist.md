\# Shadow Syndicate Phase 6B-2 QA Checklist



\*\*Build:\*\* Shadow Syndicate React + Vite Local Prototype

\*\*QA Date:\*\* \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\*\*Tester:\*\* \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\*\*Browser:\*\* \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\*\*Result Key:\*\* PASS / FAIL / NOT RUN



\---



\## Pre-Test Setup



Before testing, confirm the app runs:



```powershell

npm.cmd run dev

```



Confirm the app also builds:



```powershell

npm.cmd run build

```



If either command fails, stop testing and paste the terminal error below.



\*\*Dev Server Result:\*\* PASS / FAIL / NOT RUN

\*\*Build Result:\*\* PASS / FAIL / NOT RUN



\*\*Error Notes:\*\*



```text

```



\---



\## How to Capture Current Game State



Use this in the browser console when a test fails:



```js

const gameState = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

console.log(JSON.stringify(gameState, null, 2));

copy(JSON.stringify(gameState, null, 2));

```



Use this for Concrete Pour event state:



```js

const eventState = JSON.parse(localStorage.getItem("shadow\_syndicate\_concrete\_pour\_event\_v3"));

console.log(JSON.stringify(eventState, null, 2));

copy(JSON.stringify(eventState, null, 2));

```



\---



\# 1. ENERGY / OVERCHARGE / BURNOUT



\## Test 1A — Burnout Can Trigger When Overcharged



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.energy = 1650;

g.overchargeMode = true;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Jobs.

2\. Run jobs repeatedly.

3\. Watch the Activity Log.



\*\*Expected Result:\*\*



\* Burnout can trigger.

\* Energy drops by 50 when Burnout triggers.

\* XP from that job is doubled.

\* Activity Log mentions Burnout.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\*\*Failing gameState JSON:\*\*



```json

```



\---



\## Test 1B — Burnout Cannot Trigger When Overcharge Mode Is Off



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.energy = 1650;

g.overchargeMode = false;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Jobs.

2\. Run several jobs.



\*\*Expected Result:\*\*



\* Burnout does not trigger.

\* No Burnout message appears in the Activity Log.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\# 2. HEAT / LOOKOUTS / CONTRACT LOCKOUT



\## Test 2A — Heat Above 50 Reduces Job Cash by 20%



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.heat = 51;

g.lookouts = 0;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Jobs.

2\. Review payout range.

3\. Run a job.



\*\*Expected Result:\*\*



\* Job payout is reduced by the Heat penalty.

\* Heat status shows Hot.

\* Activity Log shows job completion.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\## Test 2B — Heat 81 Disables Contracts



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.heat = 81;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Contracts.

2\. Try to start a contract.



\*\*Expected Result:\*\*



\* Contracts are disabled.

\* Button shows Too Hot or cannot be clicked.

\* Warning says to assign Lookouts or wait.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\## Test 2C — Three Lookouts Burn 12 Heat Per Job



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.heat = 60;

g.lookouts = 3;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Heat.

2\. Confirm Heat Burn shows 12 per job.

3\. Go to Jobs.

4\. Run a job.



\*\*Expected Result:\*\*



\* Heat burn is 12.

\* Job Heat Gain is reduced by Lookouts.

\* Heat after job reflects job heat added minus 12.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\# 3. CREW LOCKOUT / EXPEDITE CREW / REFRESH SAVE



\## Test 3A — Contract Locks Crew



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.crew = 5;

g.heat = 0;

g.energy = 100;

g.contractCrewLocks = \[];

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Contracts.

2\. Issue one contract with 1 crew.

3\. Check Empire Status / Contract Crew.



\*\*Expected Result:\*\*



\* Available contract crew drops from 5 to 4.

\* Contract lockout is created.

\* Lockout timer persists in localStorage.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\## Test 3B — Expedite Crew Unlocks One Crew For 2 Tribute



\*\*Setup:\*\*



Confirm one crew member is already locked from Test 3A.



\*\*Steps:\*\*



1\. Go to Tribute Store.

2\. Buy Expedite Crew.

3\. Check Contract Crew count.



\*\*Expected Result:\*\*



\* Tribute decreases by 2.

\* One locked crew returns.

\* Available contract crew goes from 4 to 5.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\## Test 3C — Lockout Persists After Refresh



\*\*Steps:\*\*



1\. Issue a contract.

2\. Refresh the browser.

3\. Check Contract Crew count.



\*\*Expected Result:\*\*



\* Crew lock remains after refresh.

\* Lock only expires when unlock time passes or Expedite Crew is purchased.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\# 4. TERRITORY / SUPPLY CHAIN / PROPERTY PAYOUT



\## Test 4A — Dockside Lot Improves Southside Collections



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.properties = { ...(g.properties || {}), dockside\_lot: 1 };

g.tutorialStep = 3;

g.heat = 0;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Jobs.

2\. Review Southside Collections payout.



\*\*Expected Result:\*\*



\* Southside Collections pays closer to full value.

\* Expected lesson: without Docks around $140, with Docks around $225.

\* Territory/supply chain logic is visible.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\## Test 4B — Removing Dockside Lot Drops Payout



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

delete g.properties.dockside\_lot;

g.tutorialStep = 0;

g.tutorialCompleted = true;

g.heat = 0;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Jobs.

2\. Review Southside Collections payout.



\*\*Expected Result:\*\*



\* Southside Collections payout drops back down when under 25% Southside control.

\* Low control penalty is active.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\# 5. HARBOR COMEBACK



\## Test 5A — Comeback Modal Appears



\*\*Setup:\*\*



```js

localStorage.removeItem("shadow\_syndicate\_harbor\_comeback\_used\_v1");



let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.started = true;

g.level = 3;

g.jobsRun = 10;

g.territory = { ...(g.territory || {}), southside: 10 };

g.lastLoginAt = Date.now() - (25 \* 60 \* 60 \* 1000);

g.comebackActive = false;

g.comebackStartedAt = null;

g.comebackActiveUntil = null;

g.comebackStep = 0;

g.comebackDockJobs = 0;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Reload app.

2\. Watch for Harbor Comeback modal.



\*\*Expected Result:\*\*



\* Modal appears.

\* Modal text says Southside is locked down and Foreman at the Docks has work.

\* Work the Docks button sends player to Jobs.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\## Test 5B — Dock Shift Gives 3x XP During Comeback



\*\*Steps:\*\*



1\. Start Harbor Comeback.

2\. Run Work the Docks.

3\. Check XP gained.



\*\*Expected Result:\*\*



\* Work the Docks gives 3x XP.

\* Work the Docks gives 2x Cash.

\* Work the Docks gives +0 Heat.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\# 6. TRIBUTE STORE



\## Test 6A — Heat Bribe Reduces Heat By 20



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.tribute = 100;

g.heat = 60;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Tribute Store.

2\. Buy Heat Bribe.



\*\*Expected Result:\*\*



\* Tribute decreases by 3.

\* Heat decreases from 60 to 40.

\* Attack and Defense do not increase.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\## Test 6B — Golden Suit Adds ContractCard Border But No Attack Increase



\*\*Steps:\*\*



1\. Record Attack and Defense values.

2\. Buy Golden Suit.

3\. Go to Contracts.

4\. Check ContractCard visual border.

5\. Recheck Attack and Defense.



\*\*Expected Result:\*\*



\* Tribute decreases by 50.

\* Golden border appears.

\* Attack does not increase.

\* Defense does not increase.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\# 7. CONTRACT PROPERTY BONUS



\## Test 7A — No Dockside Lot Means No +15% Docks Bonus



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.properties = { ...(g.properties || {}) };

delete g.properties.dockside\_lot;

g.energy = 100;

g.heat = 0;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Contracts.

2\. View Docks target.

3\. Check Property Bonus text.



\*\*Expected Result:\*\*



\* No +15% Docks power bonus appears.

\* Bonus text says no property attack bonus active.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\## Test 7B — Buying Dockside Lot Shows +15% Docks Bonus



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.properties = { ...(g.properties || {}), dockside\_lot: 1 };

g.energy = 100;

g.heat = 0;

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Contracts.

2\. View Docks target.

3\. Check Property Bonus text.



\*\*Expected Result:\*\*



\* Property Bonus shows +15% Power if attacking Docks.

\* Contract result uses the Docks property multiplier.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\# 8. RETALIATION CONTRACTS



\## Test 8A — Losing A Contract Creates RetaliationBanner



\*\*Setup:\*\*



```js

let g = JSON.parse(localStorage.getItem("shadow\_syndicate\_f2p\_phase6b2"));

g.energy = 100;

g.heat = 0;

g.power = 1;

g.retaliationContracts = \[];

localStorage.setItem("shadow\_syndicate\_f2p\_phase6b2", JSON.stringify(g));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Contracts.

2\. Issue a contract likely to lose.

3\. Check for RetaliationBanner.



\*\*Expected Result:\*\*



\* Losing a contract creates a retaliation contract.

\* RetaliationBanner appears.

\* Banner says 0 Energy contract is available.

\* Still requires 1 crew lock.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\## Test 8B — Retaliation Costs 0 Energy But Locks Crew



\*\*Steps:\*\*



1\. Record Energy.

2\. Record Available Contract Crew.

3\. Use RetaliationBanner.

4\. Recheck Energy and Available Contract Crew.



\*\*Expected Result:\*\*



\* Energy does not decrease.

\* One crew member locks for 10 minutes.

\* Retaliation contract disappears after use.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\# 9. MARKED / CALL OUTS



\## Test 9A — Three Call Outs Mark Target



\*\*Setup:\*\*



```js

let e = JSON.parse(localStorage.getItem("shadow\_syndicate\_concrete\_pour\_event\_v3"));

e.callOutsByTarget = {};

e.markedBosses = {};

localStorage.setItem("shadow\_syndicate\_concrete\_pour\_event\_v3", JSON.stringify(e));

```



\*\*Manual Steps:\*\*



Because this is local-only, simulate three different callers in console:



```js

import("/src/events/concretePourEventConfig.js").then(m => {

&#x20; m.callOutBoss({ callerBossName: "Boss One", targetBossId: "demo\_kickwhere", targetBossName: "KickWhere" });

&#x20; m.callOutBoss({ callerBossName: "Boss Two", targetBossId: "demo\_kickwhere", targetBossName: "KickWhere" });

&#x20; m.callOutBoss({ callerBossName: "Boss Three", targetBossId: "demo\_kickwhere", targetBossName: "KickWhere" });

&#x20; console.log(m.getBossMarkedStatus("demo\_kickwhere", "KickWhere"));

});

```



\*\*Expected Result:\*\*



\* KickWhere becomes Marked.

\* Marked timer is 24 hours.

\* Marked status is visible on Event / Reputation Call Out UI.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\## Test 9B — Marked Debuff Expires After 24 Hours



\*\*Setup:\*\*



```js

let e = JSON.parse(localStorage.getItem("shadow\_syndicate\_concrete\_pour\_event\_v3"));

e.markedBosses.demo\_kickwhere.markedUntil = Date.now() - 1000;

localStorage.setItem("shadow\_syndicate\_concrete\_pour\_event\_v3", JSON.stringify(e));

location.reload();

```



\*\*Steps:\*\*



1\. Go to Event.

2\. Check Reputation Call Out status.



\*\*Expected Result:\*\*



\* Target no longer shows Marked.

\* Defense modifier no longer applies.

\* UI shows Not Marked.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\---



\# 10. SAVE / REFRESH PERSISTENCE



\## Test 10A — Save Survives Close And Reopen



\*\*Setup:\*\*



Perform several actions:



\* Lock crew with a contract.

\* Raise Heat.

\* Create a Marked target.

\* Buy a Tribute cosmetic.

\* Buy a property.

\* Add a Street Chat message.



\*\*Steps:\*\*



1\. Close browser tab.

2\. Reopen app.

3\. Confirm saved state remains.



\*\*Expected Result:\*\*



\* Crew lockouts persist.

\* Heat persists.

\* Marked timers persist.

\* Tribute purchases persist.

\* Properties persist.

\* Street Chat local messages persist.



\*\*Result:\*\* PASS / FAIL / NOT RUN



\*\*Error / Notes:\*\*



```text

```



\*\*Failing gameState JSON:\*\*



```json

```



\*\*Failing eventState JSON:\*\*



```json

```



\---



\# Final QA Summary



| System                        | Result                |

| ----------------------------- | --------------------- |

| Energy / Burnout              | PASS / FAIL / NOT RUN |

| Heat / Lookouts               | PASS / FAIL / NOT RUN |

| Crew Lockout / Expedite       | PASS / FAIL / NOT RUN |

| Territory / Property Strategy | PASS / FAIL / NOT RUN |

| Harbor Comeback               | PASS / FAIL / NOT RUN |

| Tribute Store                 | PASS / FAIL / NOT RUN |

| Contracts                     | PASS / FAIL / NOT RUN |

| Retaliation                   | PASS / FAIL / NOT RUN |

| Marked / Call Outs            | PASS / FAIL / NOT RUN |

| Save / Persistence            | PASS / FAIL / NOT RUN |



\---



\# Launch Decision



\*\*Soft Launch Ready:\*\* YES / NO



\*\*Blockers:\*\*



```text

```



\*\*Fix Before Launch:\*\*



```text

```



\*\*Nice To Have Later:\*\*



```text

```



