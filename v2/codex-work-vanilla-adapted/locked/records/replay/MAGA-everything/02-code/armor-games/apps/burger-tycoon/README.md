# Burger Tycoon

Four animated departments share one fragile economy. Crops feed cattle; processing consumes cattle; restaurant sales fund every department; board dividends, wages, debt, disease and public backlash can end the company. There is no clean victory.

The app preserves the checkpoint economy and flat authored scenes, extending it with pasture investment, processing upgrades, veterinary visits, staff hiring and training, woodland restoration, bridge loans and repayment. Normal pace makes one quarter last four minutes. The 2×/4× button speeds all departments equally. Actions have explicit costs, capacities, cooldowns and ON/OFF labels.

Desktop monitors all four operations. Phones have bottom tabs and native touch buttons. Keys 1–4 select panes; Escape pauses. Volume, mute, animation reduction and a field guide are available in Settings. Every active company saves periodically and after actions; reloading starts paused. Hiding or unfocusing the page pauses the operation.

## Intentional original tuning

These values are designed and tested for this rendition, not claimed as measurements of the source game. Base crop/herd/processing/sales rates remain 1.2/0.3/0.9/1 per simulation second; real normal pace is one quarter of simulation speed. Dirty crop/feed/margin multipliers remain 2.2/1.8/1.6. Disease 20 causes a cull and 12 reputation loss. Backlash 60 starts reputation loss; 85 accelerates it. Pasture adds 0.18 crops and 0.06 herd per second (max 5 fields); processing adds 0.3 per line (max 4); extra staff adds 0.16 sales and 0.3 wages (max 6). Morale below 40 reduces service 35%. Loans supply 350 cash with 450 debt, max 3, and debt adds 0.35 overhead. Quarter dividends cost 20+5×quarter. Sow produces 15 crops with 6 simulation-second cooldown. The early economy remains recoverable with reserves; escalating dividends make passive perfection impossible.

## Verification

From root: `node --test MAGA-everything/02-code/armor-games/apps/burger-tycoon/tests/economy.test.mjs` and `node MAGA-everything/02-code/armor-games/apps/burger-tycoon/tests/player.mjs` (set SITE_ROOT to the copied release).

Player verification uses actual browser buttons, pointer/touch and keyboard with native wall-clock animation in independent desktop and touch browsers. Chromium focus emulation keeps the independent headless pages active. It never overrides the clock, writes company state or invokes game helpers. Evidence covers five-minute managed desktop/mobile runs, pause, settings, reload, disease/backlash collapse, retry, and nested paths. See ship-records/burger-tycoon.md for final observed results and physical-device limitations.
