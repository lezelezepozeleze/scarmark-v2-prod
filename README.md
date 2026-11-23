# Scarmark

A custom TTRPG system for Foundry Virtual Tabletop. A low-magic, mechanically lean game where roleplay comes before calculation, with rolls, combat, wounds and effects automated inside Foundry.

## Documentation

- `docs/AGENTS.md` - start here when changing code (human or AI): where to look first, which shared helper to reuse, how to keep the docs alive, folder rules, the repository map, what must never be renamed, how to verify.
- `docs/RULES_INDEX.md` - where each game mechanic lives in the code.
- `docs/SMOKE_TEST.md` - the manual check in Foundry.
- `docs/MERGE-1.0.58-1.0.53.md` - how the two lines were merged and every decision. `docs/OPEN-FINDINGS.md` - what is still open (risks, decisions, missing tests).
- `tests/golden/README.md` - the golden fixtures: committed, local, capture, sample selection.
- `CHANGELOG.md` - what changed in each version. `css/README.md`, `module/config/README.md` - the stylesheet order and the rule values.

## Status

**Work in progress.** This repository is the merge of the co-author's refactored test fork (1.0.58-beta architecture) and the owner's 1.0.53-beta game content (system id "scarmark"); see `docs/MERGE-1.0.58-1.0.53.md`. Since 1.1.0-beta items have actions (use, consume, inspect, own, hit), effects have types and can be unique, Regions can set off actions, and the cards of the actions share the card parts of the combat cards; see `CHANGELOG.md`. Verified against Foundry VTT v14 (Stable Build 369). See `CHANGELOG.md` for the release history.

## Requirements

- Foundry VTT v14
- A time-keeping module is **strongly recommended**, see below.

## Strongly recommended: a time-keeping module

Scarmark ships with many ready-made Active Effects that take bookkeeping off the GM's and the players' hands: potions and other consumables, alcohol and hangovers, poisons, diseases and similar conditions. Most of them are **timed**. They last a set number of minutes, hours or days of in-game time, and the system removes them automatically once that time has passed.

This only works if in-game time actually moves forward. Foundry itself has no control for advancing in-game time, so **without a time-keeping module, timed effects never expire** and have to be removed by hand. (Short combat effects measured in rounds follow the combat tracker instead.)

Scarmark is developed and tested with these two modules, used together:

| Module | Package ID | What it does |
|---|---|---|
| [Simple Calendar Reborn](https://github.com/Fireblight-Studios/foundryvtt-simple-calendar) | `foundryvtt-simple-calendar-reborn` | Full in-game calendar with date and time controls |
| [SmallTime](https://github.com/unsoluble/smalltime) | `smalltime` | Compact clock for quickly moving time forward |

Any other module that advances Foundry's world time works as well. Scarmark listens to Foundry's core world-time changes and also to Simple Calendar Reborn's own date-change hook.

> **Tip for using both together:** in Simple Calendar Reborn, set Leap Year to *Custom*, every 4 years, starting year 0. Scarmark aligns Foundry's core calendar with that setting, so SmallTime and Simple Calendar Reborn always show the same date.

## Development

Local setup: a symbolic link from this repository into Foundry's `Data/systems/scarmark` folder, so changes are visible after a reload (F5), with no copying.

```
npm ci              # once
npm test            # unit, schema, render snapshots and golden fixtures
npm run lint        # module/ and tests/ only (scripts/ is not linted); also enforces the pure folders (rules, config, view)
npm run check:cycles
npm run golden      # the golden fixtures alone
```

Run one test file with `node --import ./tests/support/foundry-stub.mjs --test tests/helper-rules.test.mjs`. Never regenerate the schema, render or golden snapshots to make a failing test pass; see `docs/AGENTS.md`, which also covers releases, the compendium packs and the abbreviations used in the code. `scripts/imports/` holds the migration macros that are still needed (paste into a Script macro; they have a Report only mode first); finished import macros live in git history. The repo has no CI workflow yet.

## Credits

### Icons

Icons are from [Game-Icons.net](https://game-icons.net/), used under the [Creative Commons Attribution 3.0 (CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/) license. Artists whose work appears in this system:

- [Delapouite](https://delapouite.com/)
- [Lorc](https://lorcblog.blogspot.com/)
- Skoll
- Willdabeast
- Sbed
- DarkZaitzev
- Lucas
- Carl Olsen
- Caro Asercion
- Irongamer

Icon files that have been recoloured, cropped or otherwise modified remain under CC BY 3.0 with attribution to their original authors above.
