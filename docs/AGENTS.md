# Instructions for AI coding assistants

Read this file before changing anything. Follow it exactly, starting with "Before you start: look first, keep the docs alive" and "How to work". Other docs: README.md (overview, documentation index, development commands), docs/RULES_INDEX.md (where each mechanic lives), docs/SMOKE_TEST.md (manual checks in Foundry), docs/MERGE-1.0.58-1.0.53.md (the merge decisions), docs/OPEN-FINDINGS.md (what is still open), tests/golden/README.md (the golden fixtures: committed, local, capture, import), CHANGELOG.md (what changed per version).

## Before you start: look first, keep the docs alive

Nobody holds the whole code in their head, so read before you write and write down what you changed.

1. **Find where it is.** Read the repository map below, then docs/RULES_INDEX.md (where each game mechanic lives), then search the code (`grep -rn name module tests`). Look at the files that already do something close to what you need before you write anything.
2. **Reuse, do not copy.** If the same thing is written in two places, one of them is wrong the day somebody changes the other. The shared pieces:

   | You need | Use | Where |
   |---|---|---|
   | A chat card (frame, line, test block, buttons, prompt, rule, titled block) | `cardHtml`, `cardLine`, `testBlock`, `testCard`, `cardButtons`, `cardPrompt`, `cardBlock`, `cardSep`; post it with `speak`, `sayText` or `say` | module/helpers/chat.mjs |
   | Escape text for HTML | `esc`, `escAttr` | module/helpers/escape.mjs |
   | Tell the user something (a toast) | `warn`, `fail` | module/helpers/notify.mjs |
   | Read a field of a dialog | `fieldValue`, `fieldNumber`, `hasField` | module/helpers/form-fields.mjs |
   | Read a compendium (the world one adds to the system one) | `mergedEntries`, `packEntryUuid`, `isCompendiumUuid` | module/helpers/packs.mjs |
   | Change something that belongs to somebody else | `doOrAskGM`, `documentFor` | module/helpers/gm-relay.mjs |
   | Read a value by its dotted path | `getPath` | module/rules/path.mjs |
   | Read or set a flag of this system on an effect | `effectFlags`, `withEffectFlag` | module/rules/effect-flags.mjs |
   | Which actions a trigger sets off, and who they act on | `actionsFor`, `actionTargets` | module/rules/actions.mjs, module/helpers/actions/shared.mjs |
   | An Add menu on a sheet | `openAddMenu` | module/sheets/effect-menu.mjs |
| Save an action or an effect to a compendium (the dialog asks which, the default follows the item) | `saveActionToCompendium`, `saveEffectToCompendium`, `defaultEffectPack` | module/helpers/save-to-compendium.mjs |
| A part of an item sheet's Details tab | the item partials: `item-basics` (In container, Quantity, Weight, Value; a container: Quantity, Weight, Value, Capacity), `aspect-grid` (four aspect numbers in one row: armor Protection, weapon Impact), `skill-row` and `weapon-durability` (weapon and missile), `notes-field`, `artifact-fields`; every item type's Details tab is a `sm-item-form` that starts with `item-basics` and ends with the notes | templates/item/partials/ |
   | A rule value (a number, a list, a key prefix) | the constant in module/config/ | module/config/README.md |

   If nothing fits, add the new piece next to the ones above and add it to this table.
3. **Keep the docs alive, in the same change.** A change is not finished until the docs say what the code now does. Update whatever applies: the repository map (a new or moved file), docs/RULES_INDEX.md (a new or moved mechanic), the persisted contract at the end of this file (a new stored field, flag, query or pack: these are never renamed or removed), docs/SMOKE_TEST.md (what to try in Foundry), docs/OPEN-FINDINGS.md (what is still open, and remove the entry you fixed), CHANGELOG.md (a line under the version) and the comments of the code you touched. Text that a player reads goes in lang/en.json.
4. **Fix a stale statement when you see it**, even when it is not yours: a doc that is wrong is worse than no doc. Delete what is obsolete instead of leaving it behind (the old audits were removed for this reason).
5. **Check before you finish**: `npm test`, `npm run lint`, `npm run check:cycles`, `npm run golden`, and look for code you wrote twice and for exports nothing uses. What cannot run outside Foundry (sheets, dialogs, hooks, chat buttons) is said so in the report, and the manual check is in docs/SMOKE_TEST.md.

## How to work

Work the way a careful senior engineer would on a project that other people keep running for years.

1. **Understand, then change.** Read the code and the docs around the change first. Know what already does the job (see "Before you start") and which files call it. Say in a sentence what you will change and what you will reuse before you start.
2. **Smallest change that solves the real problem.** Fix the cause, not the symptom. Do not refactor, rename or "improve" what the task does not need; leave the rest of the file as you found it. A change that touches fewer files and lines is easier to check, revert and trust.
3. **Never break what is stored.** Saved worlds depend on the persisted contract at the end of this file: never rename or remove a stored field, flag, id, query or pack, and add a field only when the task says so. The same inputs must give the same numbers, chat output and sheet display.
4. **Ask when a rule can be read two ways.** Do not build the bigger reading first. Put the two readings in front of the owner, with your recommendation, and wait. Do not guess a game rule.
5. **Write as little code as the job needs.** No second copy of anything, no dead code, no commented-out code, no speculative options or helpers nobody calls, no new dependency. A comment says why, not what; keep a doc comment true when you change the code under it.
6. **Prove it.** Add or adjust a test with every behavior change and run the checks in "Before you start". Never regenerate a snapshot or edit a golden fixture to make a failure go away; a failing check is information, read it. Test the odd inputs (empty, missing, old data), not only the happy path.
7. **Review your own change before you hand it over.** Read the whole diff as a reviewer: is something written twice, is something unused, is a comment or a doc now wrong, does a lang key exist for each new text, is anything escaped.
8. **Report the truth.** Say what changed, where, which checks you ran and what they said, and what you could not verify (anything that needs Foundry itself: sheets, dialogs, hooks, chat buttons). Do not say it works when you only know it compiles.
9. **Be careful with what cannot be undone.** Do not delete, overwrite, commit, push or publish without being asked; look at what you are about to replace first.

**Language.** The owner and the players may write to you in Czech: answer in the language you are written to. Everything that stays in the repository is English: code, identifiers, comments, docs and commit messages. What a player reads in the game goes in lang/en.json (the Czech original, where there is one, in lang/cs.json). Text style: a hyphen "-" only (no en or em dash), straight quotes, sentence case in headings and labels, and no hard wrapping (one paragraph or list item per line).

## Repository map

| Path | What |
|---|---|
| system.json | manifest: version, packs, languages, the `styles` list (its order is the CSS cascade) |
| module/scarmark.mjs | entry: calls the register functions of foundry/ and helpers/ in order |
| module/config/, rules/, view/ | pure: rule values, calculations, view models (lint-enforced, see below); view/ holds actor-view.mjs, effects-view.mjs, inventory-view.mjs, esoterics-stats.mjs, armor-coverage.mjs, item-tooltip.mjs, action-card.mjs, effect-sheet-view.mjs, region-behavior-view.mjs, options.mjs, format.mjs; rules/ also holds the pure rules of the actions and effects: actions.mjs, armor-care.mjs, combat-update.mjs, effect-flags.mjs, effect-unique.mjs, item-mods.mjs, path.mjs, poison.mjs, region-actions.mjs, rewrite.mjs |
| module/data/ | data models (schemas, shared-fields.mjs, migrations.mjs, item-action.mjs for the entries of the action compendium, derived stats via rules/) |
| module/helpers/ | workflows: rolls (dice/: shared.mjs, tests.mjs, esoterics.mjs, wounds.mjs), combat (combat/), modifier-prompt.mjs (the Modifier field of the roll dialogs), esoteric-card.mjs, consume.mjs, effect-library.mjs, inventory.mjs, chat.mjs (the parts of a chat card: cardHtml, cardLine, testBlock, testCard, cardBlock, cardButtons, cardPrompt, cardSep, speak, say, sayText), item-actions.mjs (the way in to the actions of items) with actions/ (one file per kind of action; run.mjs runs them, cards.mjs posts the chat cards, entries.mjs finds the compendium entries the actions name), action-tests.mjs, alterations.mjs and rewrite.mjs (the alter action and immediate effects), gm-relay.mjs (the owner does it, anybody else asks the active GM), action-library.mjs (the action compendium: its entries and copying their actions), packs.mjs (a world compendium of the same name adds to the system one), form-fields.mjs (how dialogs read their fields), notify.mjs, remove-effects.mjs, macros.mjs, region-triggers.mjs; combat/poison.mjs (the on-hit effects of a weapon) |
| module/sheets/ | ApplicationV2 sheets: actor-sheet-base.mjs with actor-context.mjs (template context), actor-listeners.mjs (DOM listeners) and effect-menu.mjs (the effect Add menu), effect-sheet.mjs (the sheet of every Active Effect, with view/effect-sheet-view.mjs) and region-behavior-sheet.mjs; item-sheet-base.mjs with item-layout.mjs (tabs and parts) and item-esoteric-sheet.mjs; actions/ holds the data-action handlers and action-panel.mjs (the reusable Actions panel: a list of "when <trigger> do <something>" stored at any data path of a document, listed by name) with action-menu.mjs (its Add menu), action-editor.mjs (the window of one action), action-drag.mjs (dragging a row out and dropping an action or an Action entry in) and action-templates.mjs (the template paths); item-action-sheet.mjs is the sheet of an action compendium entry (icon, name and the lines of its one action, no tab or panel controls; templates/common/action-fields.hbs is shared with the panel); a11y.mjs makes labels and action links accessible |
| module/foundry/ | lifecycle: settings, document registration, effect expiry, unique effects (effect-unique.mjs), the hooks of the actions (action-hooks.mjs), region behaviors (region-behaviors.mjs), hooks |
| templates/, css/, lang/ | Handlebars (templates/actor/parts and partials, templates/item/<type> and partials, templates/dialogs), stylesheets (see css/README.md), en.json and cs.json (a partial fallback, see below) |
| packs/ | compendiums (LevelDB; read them with a LevelDB reader, not as text; see Packs below) |
| scripts/imports/, scripts/macros/ | scripts/imports/ holds the migration macros that are still needed (migrate-armor-coverage.js, migrate-toxicity.js, migrate-consumable-actions.js, and the owner's reduce-skills.js, migrate-skill-categories.js, remove-boots.js, reweigh-plate-arms.js; Report only / Apply); scripts/imports/legacy/ keeps the finished one-shot import macros (history only, they predate 1.0.53 and are not maintained). scripts/macros/ holds the world macros. scripts/ is not linted scripts/macros/create-freshly-shaved.js adds the starter effect "Freshly shaved" for an item action to use. |
| tests/ | `npm test` (unit, schema, render, golden), `npm run golden`, `npm run lint`, `npm run check:cycles`; tests/tools/ holds the snapshot capture and maintainer tools, tests/support/ the Foundry stub |

## Folder ownership

- module/config/ - authoritative game-rule VALUES. Pure data. No Foundry globals.
- module/rules/ - authoritative CALCULATIONS. Pure functions: inputs in, result out. No Foundry globals, no Math.random (random numbers are parameters), no document reads or writes.
- module/data/ - Foundry data models: schemas and preparation. Call rules for calculations.
- module/helpers/ - workflows: rolls, dialogs, document updates, chat. Call rules for calculations.
- module/sheets/ and templates/ - display only. Never compute a game value. Get values from data models or rules. Markup that repeats goes into a partial in templates/actor/partials/, listed for its part in module/sheets/sheet-layout.mjs (PART_PARTIALS) so Foundry loads it before the part renders; sheets build their TABS and PARTS with tabsConfig and partsConfig from the same file. Item sheets do the same with templates/item/partials/ through module/sheets/item-layout.mjs (itemPartials, itemSheetParts).
- module/foundry/ - Foundry lifecycle: init, hooks, settings.
- module/view/ - pure view models and formatting for the sheets (no Foundry globals); the sheets and templates read what it builds.
- module/constants.mjs - persisted identifiers only.

Current state: module/config/ holds the rule values (see module/config/README.md), module/rules/ the pure calculations (see module/rules/index.mjs), module/view/ the pure view models and number formatting, and module/foundry/ the lifecycle (settings, document registration, effect expiry, the effect key picker, actor hooks); module/scarmark.mjs only calls them in order and module/config.mjs only assembles CONFIG.SCARMARK. Rule numbers that are still literals outside module/config/ (rules/ and data/ hold none) are marked "hardcoded" in their row of docs/RULES_INDEX.md and listed in its last section, "Literals outside config"; when you move one into config/, remove it there. docs/RULES_INDEX.md says where each mechanic lives now.

Lint (eslint.config.mjs) enforces the module/rules/**, module/config/** and module/view/** boundaries: no Foundry globals (game, foundry, ui, canvas, CONFIG, Hooks, Roll, ChatMessage, Actor, Item, ActiveEffect, fromUuid, fromUuidSync, Handlebars), no Math.random, no imports from ../data/, ../helpers/, ../sheets/, ../foundry/. Do not weaken or disable these rules. `npm run lint` covers only module/ and tests/; scripts/ is not linted.

## Before any mechanic change

1. Read docs/RULES_INDEX.md.
2. Find the authoritative function for the mechanic.
3. Check all consumers, including sheets and templates.
4. Preserve behavior unless the task explicitly asks to change it. Same inputs must give the same numbers, chat output and sheet display.

## Rules

- Never duplicate a formula or a rule value. Search for an existing implementation and reuse it.
- Never hardcode a rule number outside module/config/.
- Never rename or remove anything in the persisted contract below. Adding new keys is allowed only when the task says so.
- Update docs/RULES_INDEX.md in the same change as any move or new mechanic.
- Update the persisted contract below in the same change as any addition to it.
- Text that a player reads goes in lang/en.json (the Czech original, where there is one, in lang/cs.json); tests/lang.test.mjs fails on a key that is used and missing, or present and unused. Stored data (the names and notes written onto injury items by a strike) stays as it is.
- Lint treats an undefined name as an error, so a forgotten import fails npm run lint and not Foundry.
- Escape every document or user string (names, notes) with `esc()` from module/helpers/escape.mjs before it goes into HTML (chat cards, dialog content). Never add another local escape helper. Do not escape text that is stored in a document.
- Do not add runtime dependencies.
- Do not create an import cycle (npm run check:cycles).

## Tests

- "npm test" (includes tests/schema.test.mjs: every data model must build the same schema as tests/schema/schemas.json), "npm run lint" and "npm run golden" must pass before you finish. Never regenerate tests/schema/schemas.json (npm run schema:capture) to make a failing comparison pass; only a deliberate, approved schema addition may change it. Lint warnings that already exist are fine; errors are not.
- tests/render.test.mjs renders every part of the actor sheets and compares the HTML with tests/render/snapshots. A change to a template or partial must leave that HTML the same. Never regenerate the snapshots (npm run render:capture) to make a failing comparison pass; only a deliberate, approved markup change may.
- Never edit the "expected" or "input" values in tests/golden/*.json. If a golden comparison fails, stop and report the mismatch. Only tests/golden/adapters.mjs may change, to point at moved code.
- docs/SMOKE_TEST.md is the manual check in Foundry for what Node tests cannot cover.
- Run one test file: `node --import ./tests/support/foundry-stub.mjs --test tests/helper-rules.test.mjs` (the stub provides the Foundry globals the modules need; the same flag runs any tests/*.test.mjs). `npm run golden` runs the golden fixtures alone; see tests/golden/README.md for capture, the local real-data sets and the sample selection.
- tests/tools/mutation-check.mjs, select-compendium-sample.mjs and import-compendium-fixtures.mjs are maintainer-only tools. They need the gitignored tests/golden/local/ (the full real-data set from a Foundry compendium export) and are not part of npm test. The mutation list is partly stale (docs/OPEN-FINDINGS.md).

## Glossary

Abbreviations used in code, comments and docs:

- WQ, DUR, AQ: the same thing, the Durability of a weapon, missile or armor piece (Weapon Quality, Durability, formerly Armor Quality). The stored field is always `quality`. Armor also has `originalQuality` (the durability it started with) and a `condition` per coverage entry (the condition of the piece at that location); the armor `quality` is derived from the conditions (their rounded average), not edited. Use "Durability" in new text.
- SL: the stored skill level. ESL: Effective Skill Level, the SL plus the Zodiac Sign bonus and mods, minus the fixed skill penalty of fatigue, load and wounds (rules/derived.mjs skillEslOf, skillPenaltyOf; 5 ESL per point, SKILL_PENALTY_PER_POINT). ASL and DSL: Attack and Defense Skill Level of a weapon (helpers/combat/lookup.mjs weaponAsl, weaponDsl, missileAsl).
- SB: Skill Base, the rounded average of the three attribute bases a skill is built on (rules/derived.mjs skillBase); the SB delta is the change of those attributes caused by effects and penalties.
- WL: Wound Level, per injury and as a total (system.wl).
- cs, ms, mf, cf: the four d100 outcome levels from rules/d100.mjs outcomeLevel: critical success, (ordinary) success, (ordinary) failure, critical failure; a roll that is a multiple of 5 is critical. The sheet labels say "Success" and "Failure" for ms and mf.
- Opportunity: the opening a good result gives one side for an extra Long Action (the result card lines in helpers/combat/result-lines.mjs).

## Release

1. Pick the version `X.Y.Z` and bump it in system.json `version` (`X.Y.Z-beta` while it is a pre-release), package.json `version` and both `version` fields at the top of package-lock.json (those two carry `X.Y.Z` without the suffix). docs/SMOKE_TEST.md has no version to change.
2. Add a CHANGELOG.md section `## X.Y.Z-beta - YYYY-MM-DD` at the top (older headings use an em dash; leave them).
3. Run npm test, npm run lint and npm run check:cycles.
4. The `-beta` suffix means a pre-release for testing; drop it only when the owner says the version is stable.
5. system.json `download` points to the branch zip of main, not to a release zip, so Foundry cannot install the system from the manifest alone (docs/OPEN-FINDINGS.md). Until a release zip is published there, install through a symlink or a manual copy. The repo has no CI workflow.

## Packs

packs/ holds LevelDB compendiums, stored byte-for-byte (.gitattributes marks the data files binary). Edit them in Foundry: unlock the compendium, change the documents, lock it again, then close the world so Foundry writes the files, and commit the changed files of packs/<name>/ (the .log, .ldb, CURRENT and MANIFEST-* files hold the data and stay tracked; LOCK, LOG and LOG.old are gitignored and rewritten whenever Foundry opens the world). Never edit the files as text. To read a pack in a script use a LevelDB reader or a Foundry compendium export (tests/golden/README.md describes the export used for the local fixtures). The pack ids are declared in system.json; the pack "poisonings" lives in packs/poisons.

## Fork identity, compatibility, translations

- This repository is the merge of the co-author's test fork (architecture, 1.0.58-beta) and the owner's 1.0.53-beta (game content and rules). The system id is "scarmark" again (the test fork used "scarmark-test"); everything derived from SYSTEM_ID follows it (see the persisted contract). docs/MERGE-1.0.58-1.0.53.md records every merge decision.
- Foundry compatibility: minimum 14, verified 14.369 (system.json `compatibility`).
- lang/cs.json is a partial fallback with about 33 keys against about 670 in lang/en.json; Foundry shows English for a missing Czech key. Add every new text to en.json first.

## Report format

End every change with: what changed, where (files, commits), how it was verified (commands run and their results).

## Persisted contract (never rename or remove)

This is the single maintained copy of this list. Saved worlds, modules and macros depend on every entry.

Templates: templates/ and packs/ are in the repo. Templates only display values, but they read context keys, field paths and helper names from this contract. Check templates/ before touching anything a template could read.

### game.scarmark members

module/scarmark.mjs (init hook): config (the SCARMARK object), artifactRuneUse, rechargeCapacity, initiateAttack, declareMeleeAttack, initiateRangeAttack, declareRangeAttack, initiatePsionicTalent, skillTest, attributeTest, stunTest (rollStunTest), defaultArmorLocationItems.

### CONFIG.SCARMARK / SCARMARK keys

CONFIG.SCARMARK and game.scarmark.config are the same object. Keys, values and function results must stay the same:

- attributes (str, sta, dex, agl, wil, per, pre, int, spi with label and row), characterOnlyAttributes (["pre"]), characterAttributeKeys, creatureAttributeKeys, legacyAttributeMap (eye/hrg/sml -> per, voi/com -> pre, aur -> spi)
- weightUnitsPerKg() (1 when metricUnits is true, else 2)
- FATIGUE_STEP (2), LOAD_STEP (0.2), LOAD_MAX_STEPS (5), LOAD_MAX_FACTOR (2), WOUND_ATTRIBUTES (["dex", "agl"]), CONDITION_BANDS, SHOCK_THRESHOLD (0.25)
- vitalWounds (head/neck/chest/belly: {4: "out", 5: "dying"}), vitalWoundFor(), vitalStates
- personalities (lawAbiding, practical, opportunistic, corruptible, vicious)
- skillCategories (skill, combat, esoterics since 1.0.51; the old physical, communication, craft, religion, magic are folded in by migrateSkillCategory and the legacy keys of mods.skills), SKILL_PENALTY_PER_POINT (5, exposed since 1.0.53)
- ESL_CAP (95), spellLevelPenalty() ((level - 1) * 5)
- sunsigns (12), months (12, with sunsign), traitCategories (physical, psyche)
- damageAspects (blunt, edged, piercing, fire), combatSkills (close, ranged, unarmed, arcane), weaponSkills (close, unarmed), missileSkills (= combatSkills)
- effectKeys, missileVelocities (low, high), rangedBlockShields()
- woundLevels ([0..5]), mendRateMax (6), mendRates ([0..6]), mendLabel() ("MRN" for 0)
- injurySeverities (light, heavy, severe, dire, mortal), severityKey(), injuryTypes (aspect x Wound Level 1-5: name, heavyBleeding, amputation), injuryFor()
- armorLocations (19 canonical types: aim weights, injury thresholds, risk flags), legacyLocationMap, locationKey(), covers()
- fumbleTestLocations ({hand: 1, arm: 3}), stumbleTestLocations ({thigh: 1, shin: 1})
- STUN_WOUND_LEVELS ([2, 3]), STUN_TARGET (50), stunProtectionBonus() (layer >= 5: 20, >= 2: 10, else 0), STUNNED_DURATION ({value: 1, units: "rounds", expiry: "turnStart"})
- armorPiercingNames (/bodkin/i)

### Identifiers (module/constants.mjs)

- SYSTEM_ID: "scarmark" (the merged repository keeps the system id "scarmark" of the owner's worlds; the test fork's "scarmark-test" is gone. Everything below that is derived from SYSTEM_ID follows it: flags scope, pack ids, query id, settings scope, sheet registration scope, template paths systems/scarmark/...)
- FLAGS: scope "scarmark"; shockGrit "shockGrit" (actor), lastFatigueRound "lastFatigueRound" (combat), expireWorldTime "expireWorldTime", maneuver "maneuver" (chat message: {maneuver, actorUuid, targetUuid}; cards of the old world macro carry flags.world.smManeuver and still work)
- SETTINGS: metricUnits "metricUnits" (world, config false, Boolean, default false)
- SETTINGS: showHiddenDescription "showHiddenDescription" (client, config false, Boolean, default false; the macro scripts/macros/toggle-hidden-description.js flips it)
- PACKS: skills "scarmark.skills"
- QUERIES: updateCombatItem "scarmark.updateCombatItem" (CONFIG.queries handler in helpers/combat/gm-update.mjs; GM relay that updates system.broken and system.quality only; the other GM queries are spendOnHitCharge, removeEffects, spendRegionBehavior and pauseGame, see "Added in 1.1.0" below)
- Sockets: none.

### Hooks registered

init (once, scarmark.mjs), ready (once, scarmark.mjs), and registered when the module loads: preUpdateActor, preCreateActor, createActor, preCreateItem (clearStaleContainer) in foundry/actor-hooks.mjs; renderChatMessageHTML and updateCombat in foundry/chat-hooks.mjs; preCreateActiveEffect in foundry/effect-unique.mjs; updateItem, updateActor and updateRegionBehavior (the actions changed) and preCreateItem (an action entry is not carried) in foundry/action-hooks.mjs; updateWorldTime in foundry/effect-expiry.mjs, plus Simple Calendar's DateTimeChange added by startEffectExpiry in the ready hook when Simple Calendar is active. From the ready hook on: controlToken (helpers/combat-helper.mjs), renderApplicationV2 (maneuver dialog prefill in helpers/maneuvers.mjs, dialog keyboard in helpers/dialog-keyboard.mjs, hiding the item tooltip in helpers/item-tooltip.mjs), renderDialogV2 and closeApplicationV2 (helpers/tactics.mjs, the tactics window). Document listeners: helpers/combat-helper.mjs adds a keyup (T) listener on the window and wraps MouseInteractionManager.prototype.can and .callback (token double click); helpers/dialog-keyboard.mjs adds keydown and pointermove listeners and helpers/item-tooltip.mjs a pointermove listener on the document.

### Stored data paths (system.*)

Never rename or remove a stored field, change its type, or narrow its choices. Derived values (prepared each load, not stored) are listed too because sheets, templates and macros read them.

Actor types: character, creature, npc, animal, container.

- character: attributes.<str|sta|dex|agl|wil|per|pre|int|spi>.base; resources.fatigue, resources.condition.value, resources.condition.max, resources.move.value, resources.move.max, resources.spiritCapacity, resources.willCapacity; race; dob.month, dob.day, dob.year; birthplace; personality; journal
- creature: as character without pre and without race/dob/birthplace/personality/journal; plus species, specialAbilities
- npc: attributes (all 9, with pre), resources (as character), race
- animal: identical to creature (extends it)
- container (actor): maxCapacity, description
- Derived on character/creature/npc/animal: attributes.<key>.effective, sunsign (character), mods.* (meleeAttack, meleeDefense, missileAttack, incomingMelee, incomingMissile, injury, endurance, outnumbered, defense, impact, skills.<skill|combat|esoterics|psionic>, plus the pre-1.0.51 keys physical, communication, craft, religion, magic that still count, skill.<name>), fatiguePenalty, skillPenalty, endurance, wl, heavyBleed, condition {value, max, pct, band, vital, penalty}, load {kg, capacity, max, pct, steps, overMax}, burden, move, gearSummary {weapon, missile, armor, miscGear, total, capacity, endurance}
- Derived on container actor: gearSummary {weapon, missile, armor, miscGear, total, capacity}

Item types: trait, skill, gear, weapon, missile, armorLocation, armor, container, injury, invocation, spell, psionic.

- trait: category ("physical" | "psyche"), description, notes
- skill: category (skill, combat, esoterics), esotericKind ("", arcane, religion; only for esoterics), attribute1, attribute2, attribute3, sunsignBonuses[].sunsign, sunsignBonuses[].bonus, level, faithPoints, notes, description; derived sb, sunsignBonus, esl
- gear: weight, value, quantity, description, notes, carried, container, consumable, toxicity, rune, artifact.active, artifact.attuned, artifact.class; derived totalWeight, totalValue
- weapon: quantity, weight, value, carried, container, quality (0 = not breakable), isShield, broken, attack, defense, specialization, impact.<blunt|edged|piercing|fire> (-1 = aspect not available), associatedSkill (close, unarmed, ranged, arcane), notes, rune, artifact.active, artifact.attuned, artifact.class; derived totalWeight, totalValue
- missile: quantity, weight, value, carried, container, quality, velocity (low, high), aspect (blunt, edged, piercing, fire), associatedSkill (close, ranged, unarmed, arcane), specialization, range.<short|medium|long|extreme>, impact.<short|medium|long|extreme>, magic, spellClass, notes; derived totalWeight, totalValue
- armorLocation: locationType, side ("", "left" or "right"), aim.<high|medium|low>, injury.<t1|t5|t9|t13|t17>, risk.<fumble|stumble|amputate>, notes
- armor: quantity, weight, value, carried, container, quality (-1 = permanent, 0 = destroyed), originalQuality (the durability it started with, shown as 5/10; 0 = not set), layer (0-5), protection.<blunt|edged|piercing|fire>, coverage (list of { type, side }: type is a location type key, side "" for both sides or "left" or "right"; the wear is not per location, the whole piece shares `quality`), notes, actions; derived totalWeight, totalValue
- container (item): quantity, weight, value, maxCapacity, carried, notes; derived totalWeight, totalValue
- injury: woundLevel, mend (0 = MRN, 1-6), heavyBleeding, vital ("", "out", "dying"), notes; derived severityKey, mendLabel
- invocation: religion, circle, notes, description
- spell: magicType, level, notes, description
- psionic: attribute1, attribute2, attribute3, sunsignBonuses[].sunsign, sunsignBonuses[].bonus, level, fatigue, notes, description, misfire; derived sb, esl

### Migrations (keep working for old data)

- armor: system.locations (set of keys, "arm" for both sides, "leftArm" for one) and system.locationConditions -> system.coverage (migrateData in data/item-armor.mjs, in memory on load; a both-sides entry of a type with sides, such as "arm" with side "", is split into a left and a right entry by splitBothSides in rules/locations.mjs; scripts/imports/migrate-armor-coverage.js writes it to the world and the compendiums and deletes the old fields)
- character, npc: migrateLegacyAttributes (data/migrations.mjs; pre-1.0.36 EYE/HRG/SML -> PER average, VOI/COM -> PRE average, AUR -> SPI; only fills missing keys)
- creature, animal: same, without PRE
- skill, psionic: migrateSkillAttributeKeys (data/migrations.mjs): attribute1-3 through legacyAttributeMap, "mor" -> "wil"
- armorLocation: pre-1.0.39 letter codes in injury.t1-t17 (e.g. "K4") -> numbers, empty -> 0 (migrateData in data/item-armor-location.mjs)
- Location type keys: legacyLocationMap / locationKey() (pre-1.0.39/1.0.40 keys)

### Also persisted (not in the old audit's sections 2-3, found while writing this file)

- Active Effect change keys: the 15 keys of SCARMARK.effectKeys (14 system.mods.* and system.resources.fatigue), plus system.attributes.<key>.base and system.mods.skill.<Skill Name> (Add = bonus, Override = sets ESL; matched by lower-cased name).
- Status effect ids (helpers/statuses.mjs): prone, grappled, pinnedDown, entangled, stun.
- Handlebars helper names (module/helpers/handlebars.mjs): eq, concat, round1, num, percent. Templates call them.

## Added in 1.1.0 (actions, effects, regions)

New code: `module/helpers/item-actions.mjs` (the way in) with `module/helpers/actions/` (one file per kind of action, `run.mjs` runs them, `cards.mjs` posts the chat cards), `module/rules/actions.mjs` and `module/config/actions.mjs` (pure), `module/sheets/actions/action-panel.mjs` (the reusable Actions panel), `module/foundry/action-hooks.mjs`, `module/helpers/alterations.mjs` and `rewrite.mjs` with `module/rules/{rewrite,item-mods,armor-care,effect-flags,effect-unique,poison,path}.mjs` (alterations and immediate effects), `module/sheets/effect-sheet.mjs` (the effect sheet), `module/foundry/effect-unique.mjs`, `module/foundry/region-behaviors.mjs` with `module/helpers/region-triggers.mjs`, `module/rules/region-actions.mjs`, `module/config/regions.mjs` and `module/sheets/region-behavior-sheet.mjs`, `module/helpers/gm-relay.mjs`, `packs.mjs`, `form-fields.mjs`, `notify.mjs`, `remove-effects.mjs`, `macros.mjs` and `save-to-compendium.mjs` (the Save button of an action row and of an effect row).

Armor durability is the one number per piece of this version (`system.quality`, the original in `system.originalQuality`; -1 is Natural armor, 0 is worn out). A hit wears the highest-layer covering piece by 1 (helpers/combat/strike.mjs, unchanged), a repair action puts `quality` back to the original, a durability modifier on an armor piece changes `system.effective.quality` (what combat reads to decide whether the piece still protects) and an immediate durability effect rewrites `system.quality`. There is no per-location condition and none must be added.

A block without a weapon (melee only) can name one of the defender's body locations (an armorLocation item): a blow the block turned aside then lands there as an ordinary strike, so the worn armor on that location protects and wears as always.

An entry of the action compendium (item type `action`) lives only in a compendium or the Items directory (foundry/action-hooks.mjs refuses to put one on a character); the Add link of the Actions panel copies its actions into the document (helpers/action-library.mjs). The pack `actions` is declared in system.json without files: Foundry creates it empty when the world loads.

The alter action offers the Active Effects of the compendiums `armor-alterations` and `weapon-alterations` (constants.mjs ALTERATION_PACKS; a world compendium of the same name adds to them). They are declared in system.json without files: Foundry creates them empty when the world loads, and `scripts/macros/create-alterations.js` fills them with starter alterations. An alteration is an effect of type weapon or armor: it changes the stats of its kind (config/actions.mjs ITEM_MOD_STATS) as a modifier or, when immediate, once. Repair is an entry flagged repair (FLAGS.alteration): an armor piece goes back to `originalQuality`, a weapon is no longer broken (rules/armor-care.mjs).

The Save button (floppy disk, between the switch and the bin) sits on every action row (sheets/actions/action-panel.mjs, click action `saveAction`) and every effect row (item sheets: click action `saveEffect`; the character sheet: the `.effect-save` listener in sheets/actor-listeners.mjs). It opens a dialog (helpers/save-to-compendium.mjs) that lists the unlocked world compendiums of the right kind: an action goes to `actions` by default, an effect to `weapon-alterations` when it sits on a weapon, `armor-alterations` on an armor piece and `effects` anywhere else (a missile counts as anywhere else: an alter action cannot target one). When the usual compendium does not exist in the world yet the dialog offers to make it. A saved action is an Action item with a copy of the action (fresh id, switched on); an action that names this item's copy of a library effect is pointed back at the library effect, one that names an effect that lives only on this item is saved with a warning. A saved effect leaves out its origin and its `librarySource` and `ownedByAction` flags.

The Details tab of every storable item type (gear, armor, weapon, missile, container) is built from the same item partials, in the same order: `item-basics` first, the fields of the type, then the notes (the description editor of gear is not shown). The first row and the aspect numbers are always one row of four columns, never wrapped (the old container query that made them two columns is gone). The gear tab of an actor gives the armor DUR column its own width (css/actor/gear.css `.gear-section--armor`) so "current /original" stays on one line.

`actionsField()` (data/shared-fields.mjs) gives the list its default as a function (`initial: () => []`), so two documents of one type never share the same default array.

Persisted additions (never rename or remove): item and container-actor field `system.actions` (per action: `id`, `name`, `disabled`, `kind`, `test`, `alteration`, `message`, `effect`, `macro`, `on`, `targetItem`, `when`); gear fields `system.usable` and `system.usedUp`; item type `action` (an entry of the action compendium, field `system.actions`) and the system pack `actions` (PACKS.actions); effect flags `ownedByAction`, `librarySource`, `improvedBy`, `alteration`, `unique`, `immediate`, `effectType`, `onHit`, `onHitTest`, `onHitEffect`, `charges` and the item flag `entryNames` (all under the system id, constants.mjs FLAGS); user queries `spendOnHitCharge`, `removeEffects`, `spendRegionBehavior`, `pauseGame` (QUERIES); region behavior type `step`.
