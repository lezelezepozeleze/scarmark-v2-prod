# Open findings

What is still open after the 1.0.57-beta and 1.1.0-beta work, each re-checked against the code. Everything else from the 1.0.55 audit is fixed in 1.0.56: see CHANGELOG.md. The history stays in git. Remove an entry when it is fixed and say so in the CHANGELOG.

## Decisions waiting for the owner

- Container fill: the Containers tab (rules/inventory.mjs containerLoad, sums `totalWeight`, strict `>`) and the Gear tab, chest view and tooltip (containerFill, sums `ownWeight`, `> capacity + 1e-9`) compute "how full" differently, so the two can show different numbers. Unifying them can change displayed numbers, so it needs a decision first. Both functions say so in their comments.
- Quadruped hit locations (creatureHead, creatureNeck, creatureChest, creatureBelly) have no entry in config/wounds.mjs VITAL_WOUNDS, so a creature never gets a vital wound from them.

## Risks

- helpers/combat/gm-update.mjs handleUpdateCombatItem (the GM query) checks only the item type, not who asked or whether they own the item, so any connected player can set `system.broken` or `system.quality` on any weapon or armor; `system.quality` is truncated to an integer but not clamped. Deliberately deferred by the owner.
- system.json `download` points to the branch archive `archive/refs/heads/main.zip`. It is not tied to `version`, and GitHub's branch zip has a nested top-level folder, which Foundry's installer does not accept. Publish a release zip with `system.json` at its root and point `download` at it. Installing through a symlink is not affected.
- Combat card payloads are read from `data-*` attributes and trusted; a client can edit them in devtools before clicking.
- helpers/statuses.mjs builds its effect changes with the numeric `mode: 2` (`ADD`), the consume code (helpers/consume.mjs) with `type: "add"`. Use one builder.
- foundry/settings.mjs weightUnitsPerKg returns 2 on any error (a bare `catch`), so a real error on a converted world would silently halve the load numbers.
- scarmark.mjs: the ready hook has no error handling, so one failing register call skips the rest, including `startEffectExpiry()`.
- helpers/combat/strike.mjs uses `Math.random()` directly for the strike location and armor wear, so neither shows in chat (the rules take the random number as a parameter).
- rules/locations.mjs entryFromValue uses `type in ARMOR_LOCATIONS`, which also matches prototype keys such as "constructor"; use `Object.hasOwn`.
- Schema ranges: data/item-armor.mjs `quality` and `originalQuality` have no min or max (an armor durability modifier is clamped at 0 in rules/item-mods.mjs armorEffective); `locationType` and the coverage `type` accept any string; data/actor-character.mjs `dob.day` and `dob.year` are free strings and `dob.month` choices lack "".
- foundry/calendar.mjs overrides `leapStart` with no guard or smoke check.
- system.json: the pack named "poisonings" has path `packs/poisons`; there is no `primaryTokenAttribute` or `secondaryTokenAttribute`.

## Not verified in Foundry (1.1.0)

- The Actions tabs, the Use button, the effect sheet, the alter dialog, the Region behavior and the chat card buttons were written against the Foundry v14 API and tested only through the Node stub: try them in a world (docs/SMOKE_TEST.md 5b).
- The `actions` compendium ships empty (a pack cannot be written outside Foundry); entries are made in the world. An entry whose actions name an effect that lives on one item (the "This item" group) does not carry that effect to another item.
- The compendiums `armor-alterations` and `weapon-alterations` ship empty (a pack cannot be written outside Foundry): run `scripts/macros/create-alterations.js` once to add the starter alterations, or make your own with the effect sheet. A weapon has no original durability, so Repair on a weapon only clears the broken flag (the wear of a shield is not given back).
- The Actions panel stores uuids of compendium entries; a rebuilt compendium is found again by the remembered name (flag `entryNames`), but only for alter and remove actions.

## Tests and tooling

- No tests for: migrateLegacyAttributes and migrateSkillAttributeKeys (only run on real data by the compendium golden samples), chestGroups, maneuverTextValues, artifact-use (only its dialog template is rendered), splitStack and mergeStacks, helpers/combat/round.mjs, clash.mjs, forced-tests.mjs, gm-update.mjs, chat-wiring.mjs, helpers/maneuvers.mjs (only its data and card builders), helpers/dice/ (only the pure targets in rules/), sheets/row-clicks.mjs, inventory-drop.mjs, scroll-keeper.mjs, effect-menu.mjs and the effect library menu code (only stampEffectData is tested). Nothing tests the CSS (file list, tokens, dead selectors). The scripts have no parse test.
- tests/tools/mutation-check.mjs: its MUTATIONS were written against the code before the derived-stats move; snippets such as the `this.sb = Math.round(...)` line of data/item-skill.mjs and the endurance line of data/base-actor-schema.mjs no longer occur, so those mutations cannot apply. Review the list before relying on the tool (it also needs tests/golden/local/).
- `npm run lint` covers only `module` and `tests`, not scripts/.
- eslint.config.mjs sets `no-unused-vars` to "warn"; lint has zero warnings now, so "error" would cost nothing.
- The repo has no CI workflow (the 1.0.52 changelog entry mentions one that does not exist).
- scripts/imports/ is meant to hold only the migrations that are still needed (migrate-armor-coverage.js, migrate-toxicity.js, migrate-consumable-actions.js); the finished import macros are being removed by the owner and live in git history.

## Text and data

- lang/cs.json has 33 keys against 831 in lang/en.json; Czech is a partial fallback (Foundry falls back to English).
- Values that are still literals or hand-copied lists are marked "hardcoded" or "DUPLICATED" in docs/RULES_INDEX.md.
