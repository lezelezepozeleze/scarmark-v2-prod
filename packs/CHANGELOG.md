# Changelog

All notable changes to the Scarmark system.

## 1.1.0-beta - 2026-11-23

Item actions, effect types, action chat cards and region behaviors, brought over from the 1.1.x line. Armor keeps this version's single Durability per piece (no per-location condition).

- Item actions: the Actions tab lists the actions by name, with the on/off switch and the red delete bin on the right; a click on the name opens the window with "when:" and one roll-down per line. A switched-off action stays in the list and does not fire (an owned action stops transferring its effect). Every action has a name and an on/off switch. Every weapon, missile, armor, gear, container, injury item and container actor has an Actions tab. An action is "when <trigger> do <something>": the triggers are used, consumed, inspected, owned and hit; the kinds are add an effect, remove an effect, roll a test, alter an item (repair it, rewrite its values once, or put a modifier on it), send a message and run a macro. Gear has Usable and One-use only toggles (Gear Details: Usable under Consumable, One-use only under Toxicity), and a usable item gets a Use button on the sheet. The code is in `module/helpers/item-actions.mjs` and `module/helpers/actions/`, the panel in `module/sheets/actions/action-panel.mjs`.
- Actions listed like effects: the Actions tab (items, chests, region behaviors) lists each action by its name only, with the on/off switch and the bin; clicking the name opens a small window with the name and the lines of the action (`module/sheets/actions/action-editor.mjs`). An action row can be dragged onto another Actions tab, and an Action entry dragged from a compendium or the Items directory onto an Actions tab adds its action (`module/sheets/actions/action-drag.mjs`). The Add menu stays. New text: `SCARMARK.Action.unnamed`.
- Action entry sheet: opening a new entry shows its icon and name, then "when:" and the roll-downs of its one action (it is created with the entry). The Actions tab, the Add link, the name field of the action, the switch and the bin are gone from it, and the entry no longer lists itself in an Add menu; the name of the entry is the name of the action copied onto an item. The lines of an action moved into a shared partial (`templates/common/action-fields.hbs`).
- Action compendium: a new item type "Action" and a compendium "Actions" (`packs/actions`, created empty when the world loads). An entry is a named list of actions, edited with the same Actions panel. The Add link of the Actions panel opens a menu with a blank action and every entry of the system compendium and of a world compendium named `actions` (the world one wins a name clash); picking an entry copies its actions, with new ids, into the item. With an empty compendium Add still adds a blank action at once. An entry is not put on characters, and an entry's actions should name library effects, tests and macros (an effect that lives on one item cannot travel with it).
- Action chat cards: using, consuming or inspecting an item posts "<actor> used <item> on <target>. <result>", with the dice of the tests inside the card (`module/view/action-card.mjs`, `module/helpers/actions/cards.mjs`). Every chat card is built from the shared card parts of `helpers/chat.mjs` (`cardHtml`, `cardLine`, `testBlock`, `cardBlock`, `cardButtons`, `cardPrompt`, `cardSep`, `speak`): the combat cards (attack, result, clash, strike, round) were moved onto them too, with the same markup, so all cards look and behave alike. `docs/AGENTS.md` now starts with where to look first, which helper to reuse, how to keep the docs alive and how to work like a careful senior engineer; the root `CLAUDE.md` and `AGENTS.md` (publishing instructions) point to it, so an AI that is asked to change the code reads it first.
- Effect types: an effect is about a character, a weapon, an armor piece or a missile, and is ongoing or immediate (it rewrites the stored values once). An effect can be unique (the same effect cannot be added twice to the same item or actor), can carry a Poison on-hit test with charges, and has its own sheet (`module/sheets/effect-sheet.mjs`). Weapon and armor modifiers go in `system.effective`, which combat reads; for armor the modifiers change protection and the one Durability.
- World compendiums: a world compendium with the same name as a system one adds to it, and the effect library lists the effect compendiums of the world (`module/helpers/packs.mjs`). The alter actions offer the effects of the new compendiums `armor-alterations` and `weapon-alterations` (created empty when the world loads; the macro `scripts/macros/create-alterations.js` adds starter alterations). Repair puts an armor piece back to its original durability and clears the broken flag of a weapon (a natural weapon, quality 0, and a weapon that is not broken are refused). The macro `scripts/macros/create-freshly-shaved.js` adds a starter effect, and `scripts/imports/migrate-consumable-actions.js` (report only, then apply) turns the old consumable effects into "consumed" actions.
- Block with a body location: a melee block without a weapon can name one of the defender's body locations; a blow the block turned aside lands there as an ordinary strike, so armor protection and wear are the ones of this version (one Durability per piece).
- Region behaviors: a new Region behavior "Watch your step" makes a token that crosses or stops in a Region set off actions as its own actor, for everyone or players only (`module/foundry/region-behaviors.mjs`).
- Docs: the old audits in `docs/archive/` are removed; `docs/RULES_INDEX.md`, `docs/SMOKE_TEST.md`, `docs/OPEN-FINDINGS.md` and `docs/AGENTS.md` cover the new code, and statements about a per-location armor condition were corrected (there is none). The open finding that `testBlock` put its title into HTML unescaped is gone (it escapes it). The comments and docs that named the removed key picker, a wrong number of effect keys or the old audits were corrected.
- Data: new field `actions` (each action: id, name, disabled, kind, test, alteration, message, effect, macro, on, targetItem, when) on the weapon, missile, armor, gear, container and injury items and on the container actor; new fields `usable` and `usedUp` on gear; new item type `action` (field `actions`) and compendium `actions`; new document type RegionBehavior `step`. The schema snapshot and the render snapshots were extended for exactly these.
- If the world still runs the old patch macros for the same things (SM_PATCHES), switch them off first, otherwise they act twice.

## 1.0.62-beta — 2026-11-22

- Gear tab, Armor table: the DUR column is an input. Type the current Armor Durability right in the row (the original durability follows it as "/10"); no need to open each armor item. -1 stays Natural armor. Render snapshots changed only for this cell.
- New macro `scripts/macros/sync-armor-durability.js` (GM, report then Apply): finds every armor piece in world Items, world Actors and unlinked-token Actors and makes Durability and Original durability consistent. A missing Original durability comes from the compendium source, else from the current Durability (Wyvern Gloves 4/0 becomes 4/4); Durability never stays above the Original; the "Repair to full" box sets Durability to the Original on every piece. Natural armor (-1) and compendia are untouched.

## 1.0.61-beta — 2026-11-22

Armor wear is back to one Armor Durability per piece (the original rule); the per-location Condition of 1.0.58 is removed.

- Armor Durability (`system.quality`) is a stored, editable field again. A hit lowers the durability of the highest-layer covering piece by 1 (50/50 wear roll as before); at 0 the piece no longer protects; Natural armor (-1) never wears.
- The coverage entries keep only `type` and `side` (the sides stay); the `condition` field is dropped from the data model and old values are ignored on load. The armor sheet no longer shows Condition per location.
- Removed `holdsAt`, `wearIndexAt`, `averageCondition`, `startingCondition`, `entryIndexesAt`, the coverage branch of the GM relay `updateCombatItem` and the obsolete macro `migrate-armor-conditions.js`.
- Tests: armor-condition and location-sides tests rewritten, golden strike expected values (wear lines) and schema and render snapshots updated for this change only.
- Armor that was edited under 1.0.58 may still hold an old stored `quality`; check the Armor Durability of such pieces once.

## 1.0.60-beta — 2026-11-21

New magic skills (New Attributes and Skills.xlsx). Magic needs two skills only: Arcane Combat (battle spells, Combat, unchanged) and Arcane (all other magic, Esoterics of the kind Arcane). No code change: casting already uses the actor's only Arcane skill when the spell's Magic Type does not name one.

- New one-shot macro `scripts/imports/new-arcane-skills.js` (Report only, then Apply): renames Arcane Magic to Arcane, merges the six school skills (Creation, Elemental, Fey, Blood, Entropic, Illusion Magic) into it (an actor keeps the highest SL), deletes Runecraft and Arcane Lore, sets every spell's Magic Type to Arcane (the school stays as the folder in the Arcane compendium), renames Active Effect keys `system.mods.skill.<school>` to `...Arcane`, and adds Handicraft (Skill, DEX DEX WIL; teachable, Alchemy stays separate) to the Skills compendium.
- Run it once on the world, then reload (F5). Until then the compendia still hold the old skills.

## 1.0.59-beta — 2026-11-21

Merge of the co-author's 1.0.58-beta (architecture) and the owner's 1.0.53-beta (game rules and content). Full decision record: `docs/MERGE-1.0.58-1.0.53.md`. The version numbers 1.0.50 to 1.0.53 were used by both lines for different work; the two histories are kept below, the owner's marked "owner line".

- Architecture: everything of 1.0.58 is kept (`module/config/`, `rules/`, `view/`, `foundry/`, `helpers/dice/`, sheet actions and partials, the 35 test files, lint, docs). The system id is `scarmark` again (the test fork used `scarmark-test`); templates, flags, packs, settings and the migration macros follow `SYSTEM_ID`.
- Game rules and content of 1.0.53 are restored inside that architecture: three skill categories (Skill, Combat, Esoterics with a Kind, Arcane or Religion), the free-text Specialization of Character and NPC, the reduced default skills of new actors, the category Active Effect keys (`system.mods.skills.skill`, `.combat`, `.esoterics`, `.psionic`; the pre-1.0.51 keys still work), the status penalties on Combat, Esoterics and psionic only, and the fixed skill penalty (5 ESL per point of fatigue, load and wounds) in place of the Base-delta (`rules/derived.mjs skillPenaltyOf`, `SCARMARK.SKILL_PENALTY_PER_POINT`, `system.skillPenalty`).
- The compendiums (`packs/`), the artwork and icons are the owner's. The owner's migration macros (`reduce-skills.js`, `migrate-skill-categories.js`, `remove-boots.js`, `reweigh-plate-arms.js`) are in `scripts/imports/`; the finished one-shot import macros the co-author had removed are kept in `scripts/imports/legacy/` (not deleted, history only).
- Tests: the golden `expected` values that changed on purpose (skill ESL without the Base-delta, new category and kind fields), the schema, config-contract and render snapshots were updated for the merged rules (each diff checked to be only the intended one); new `tests/skill-categories.test.mjs`; `tests/lang.test.mjs` now also finds the tooltip keys on Windows paths.
- Both lines' armor work (sides, per-location condition), toxicity, called shots, Czech, item tooltip, accessibility fixes and the rest of 1.0.50 to 1.0.58 stay as the co-author wrote them. Run `migrate-armor-conditions.js` and `migrate-toxicity.js` (Report only, then Apply) on the world once, and the skill macros if they have not been run yet; reload (F5).

## 1.0.58-beta - 2026-11-20

- Armor condition per location: each coverage entry's `condition` is now the condition of the piece at that location. A new entry starts at the piece's original durability (`originalQuality`; a piece without one starts at its current durability, else 10). A hit that wears the armor (still 50/50) lowers the condition at the struck location by 1 on the highest-layer piece that still holds there; at 0 that location no longer protects, while the rest of the piece keeps working. Natural armor (durability -1) keeps covering and never wears.
- Armor durability is derived: the rounded average of the conditions of the locations the piece covers (a piece with no coverage and Natural armor keep their stored value). The field is read-only on the armor sheet; the per-location conditions are what you edit, between 0 and the original durability.
- The wear card names the location ("Armor wear: Helm at Head, condition 3 -> 2").
- The GM relay for combat items (`updateCombatItem`) also accepts the coverage conditions of armor.
- Armor stored before this change has condition 0 at every location and so protects nothing until it is migrated (docs/OPEN-FINDINGS.md). The golden adapters give old inputs (no conditions) their piece's durability at every location, so the golden numbers did not change; only the five `wear-*` strike cases changed on purpose (the update is now `system.coverage`, not `system.quality`). The armor render snapshots changed for the read-only durability field. No schema change.
- New migration macro `scripts/imports/migrate-armor-conditions.js` (Report only / Apply): sets the conditions of old armor from its durability and fills in the original durability (from the compendium item the piece was copied from). Natural armor, pieces that already have a condition and destroyed pieces are left as they are.

## 1.0.57-beta — 2026-11-20

- Cleanup pass, no behaviour change (golden and schema snapshots unchanged; the render snapshots changed only for the markup items below): dead code, dead CSS and the one-shot import scripts that are finished were removed from the tree, see git history; `scripts/imports/` is meant to keep only `migrate-armor-coverage.js` and `migrate-toxicity.js`.
- Rules files merged: `rules/gear.mjs` into `rules/inventory.mjs` (`itemTotals`, `containerLoad`), `rules/skill.mjs` into `rules/derived.mjs` (`skillBase`), `rules/stun.mjs` and `rules/shock.mjs` into `rules/wounds.mjs` (`stunProtectionBonus`, `shockTarget`), `rules/outnumbered.mjs` and `rules/armor.mjs` into `rules/combat.mjs` (`outnumberedPenaltyFor`, `protectionSum`), `data/legacy-skill-attributes.mjs` into `data/migrations.mjs`. Everything is still exported from `rules/index.mjs` under the same names. `shockTarget` takes only the percent now (a second argument is ignored). Other moves: `helpers/effects.mjs` to `view/effects-view.mjs`, `helpers/esoterics-stats.mjs` to `view/esoterics-stats.mjs`, `helpers/combat-columns.mjs` into `helpers/combat-helper.mjs`, `helpers/combat/outcome.mjs` renamed `helpers/combat/result-lines.mjs` (card lines only).
- New modules: `sheets/actor-context.mjs`, `sheets/actor-listeners.mjs`, `sheets/effect-menu.mjs` (split out of the actor sheet), `sheets/item-layout.mjs` and `sheets/item-esoteric-sheet.mjs` (shared item sheet tabs, parts and the spell and invocation base), `sheets/actions/effects.mjs`, `view/actor-view.mjs`, `view/effects-view.mjs`, `foundry/chat-hooks.mjs`, `helpers/modifier-prompt.mjs` (the shared Modifier field), `helpers/esoteric-card.mjs`, `rules/strike-helpers.mjs` (`locationWeights`, `strikeLocationIndex`, `fumbleStumbleKind`, `impactBonusFor`), `rules/roll-targets.mjs` (`mendTarget`, `psionicTarget`) and `data/migrations.mjs` (`migrateLegacyAttributes`, `migrateSkillAttributeKeys`). New tests: `tests/helper-rules.test.mjs`, `tests/modifier-prompt.test.mjs`, `tests/rules-safety.test.mjs`.
- Item sheets share partials in `templates/item/partials/` (portrait, name input, effects table, quantity-weight-value, artifact fields, skill attributes, sunsign bonuses, esoteric body); the rendered HTML is unchanged.
- `SCARMARK.skillNames` is removed from the config object: it was never declared there, and the effect key picker keeps its own cache (`cacheSkillNames` in `foundry/effect-key-picker.mjs`).
- The data constants (`QUALITY_INITIAL`, `FORM_LIMITS`, `CONTAINER_CAPACITY_INITIAL` and others in `config/items.mjs`, `LOCATION_SIDES` and `LEGACY_SIDED_KEYS` in `config/locations.mjs`, `PERCENT` and `CONDITION_MAX_FLOOR` in `config/penalties.mjs`) replace literals in the data models and sheets; the values are the same.
- CSS: duplicate field and fieldset rules merged, hardcoded values moved to `--sm-*` tokens, and rules moved into the stylesheet of the area they style; `system.json` `styles` order is unchanged.
- Documentation: `docs/RULES_INDEX.md` rewritten against the current code (every path and function name checked, rows added for the called-shot aim parts, `rangeBand`, `isBlockResult`, the armor coverage helpers, the data defaults and the remaining literals); `docs/AUDIT-1.0.55.md` replaced by the short `docs/OPEN-FINDINGS.md`, fixed findings are not listed (fixed in 1.0.56: see this changelog); `docs/AGENTS.md` gained a glossary, release steps, notes on the packs, the fork and the Czech fallback, how to run one test file and which tools are maintainer-only. The repo has no CI workflow yet (the 1.0.52 entry below mentions one that is not in the repo).
- Sheet markup (the render snapshots were updated on purpose): icon-only delete links have a "Delete" title, decorative icons have an empty `alt`, the five header labels that wrapped no field are spans, the Mend link on the injury sheet sits outside its label, skill, faith point, spell, invocation and psionic inputs have an `aria-label` ("level - name", new key `FieldOf`), long item names get an ellipsis (a `name-text` span; `text-overflow` does nothing on a flex container), and the condition bar width is clamped to 0-100 by `conditionBarPct` in `view/actor-view.mjs`.
- Text composed in templates moved to lang format keys (`ConditionLine`, `Gear.capacityLine`, `Container.loadedLine`, `Container.fillLine`, `ArmorLocation.thresholdFrom`, `ArmorLocation.woundLevelOption`); the empty-state text of combat tables and gear lists uses the new `None` key instead of `Effect.none`; the weapon sheet uses the `WeightKg` label like the other item sheets, and the weight in a container's stored list is rounded like the gear lists.

## 1.0.56-beta — 2026-11-20

- Called shots: the attack dialogs have an Aim part select next to Aim. Mid offers torso, left and right arm and hand (-15); High offers head, neck, left and right shoulder (-15); Disarm offers the right or left hand (-20). A part's penalty is the total for that call, not added to the zone penalty, and a read-only field shows it. Only the aims and parts the target has a location for are offered, the struck location is narrowed to the called part, and the card says "High: Neck -15". The parts are in `AIM` (`config/combat.mjs`); the rules are `aimKey`, `aimPartKeys`, `aimPartKey`, `aimPenalty` and `matchesAimPart` in `rules/combat.mjs`.
- Bug fix: a combat card button (defense, wound, fumble, stun, shock) is disabled while it runs, so a double click no longer resolves the same attack twice, and a failure is shown as an error instead of being lost.
- Bug fix: the magic missile card shows the real Spirit cost (it printed "undefined" when the spell had no class) and is posted before the attack card.
- Bug fix: the mend roll dialog title shows names with `&` or an apostrophe correctly; the damage roll accepts a negative impact; a skill test whose skill was deleted while the dialog was open does nothing instead of throwing.
- Bug fix: new armor starts at durability 10 (like weapons and missiles) instead of 0, which counted as destroyed.
- Bug fix: the sheet and dialog templates are loaded from `systems/<system id>/` built from one constant (`TEMPLATE_DIR`), not from 14 hardcoded copies.
- Bug fix (CSS): the tab styling now matches Foundry v14 tabs; checkbox rows on item sheets keep their layout; the armor editor reacts to the sheet width instead of the browser width; the combat table shows a scrollbar when it is wider than the sheet; the combat helper dialog has a visible keyboard focus ring; dead scrollbar rules and a few no-op declarations are removed.
- Accessibility: the portrait is a keyboard-reachable button named "Change image", icon-only delete links are named "Delete", the effect toggle reports its state (`aria-pressed`), fields without a label are named after their row, and the store-item dialog label is linked to its select.
- Closing an actor sheet cancels its pending click timers and any drag in progress.
- Bug fix: the random hit location (`pickWeighted`) now uses half-open buckets, so a roll exactly on a boundary goes to the next location and a location with weight 0 is never picked.
- Bug fix: with two GMs online only the active GM sweeps expired effects (both used to delete the same ones and one got an error); the sweep now also covers unlinked tokens on other scenes.
- Bug fix: the drop and drag-end listeners of the actor sheet are added once, not once per render.
- The derived actor stats are computed in `rules/derived.mjs` (`fatiguePenaltyOf`, `loadKgOf`, `woundLevelOf`, `worstVital`, `conditionOf`, `effectiveAttribute`, `skillEslOf`); `applyDerivedCombat` only reads the actor and calls them. `resolveOutcome`, `isBlockResult` and `rangeBand` moved from `helpers/combat/` to `rules/`. No rule changed (the golden fixtures are unchanged).
- Sheets are keyboard and screen-reader friendly: labels are linked to their fields and the action links (add, edit, delete, toggle, consume) are focusable buttons that Enter and Space activate (`sheets/a11y.mjs`, applied after every render).
- New tests for the derived rules, the outcome rules, effect expiry, and a real smoke test (the old one was `1 + 1 === 2`).
- Readability pass, no behaviour change: Consume moved out of the actor sheet into `helpers/consume.mjs` (with tests for the toxicity penalty); the add, open and delete item actions of the gear, trait and skill lists share `sheets/actions/item-rows.mjs`; the Add menu listeners are removed by one `AbortController`; duplicate imports merged; aim keys and legacy attribute keys are looked up with `Object.hasOwn`; a skill's sunsign bonus delete ignores a missing index; one-line doc comments on the sheet files that had none.
- Documentation: the two old audits moved to `docs/archive/` (the 1.0.49 and 1.0.51 snapshots, history only), `docs/AGENTS.md` starts with a repository map and lists every doc, the README has a documentation index and the development commands, `docs/SMOKE_TEST.md` has checks for toxicity, the Add menu and keyboard access.

## 1.0.55-beta — 2026-11-20

- The Add button on the actor Effects tab is a drop-down: a blank effect, then the effect library, which is every standalone Active Effect compendium of the system (Effects, Alcohol, Hangovers, Potion sickness, Combat poisonings), grouped by compendium. Picking one puts a copy on the actor, enabled, with its countdown started and its expiry stamped, exactly like Consume does. Consume and the menu share one helper, `module/helpers/effect-library.mjs` (`stampEffectData`). The Add button on item sheets is unchanged.
- Consumables have a Toxicity number (`system.toxicity`, whole number from 0, default 0), shown next to the Consumable checkbox on the gear Details tab. Consuming an item lowers Vitality by its toxicity for as long as its longest-lasting effect (the penalty is added to that effect; an item with no effect gets a permanent one). This replaces the Vitality penalty that was typed into each item's own Active Effect.
- New migration macro `scripts/imports/migrate-toxicity.js` (Report only / Apply, compendia, world items and actors, unlinked tokens): a consumable whose name ends in a number in brackets, for example Beer (5), gets that number as toxicity, and the matching `Vitality -N` is removed from its effects so the penalty is not applied twice. Consumables with no number in the name are left alone. Run it once after updating, then reload the world (F5).

## 1.0.54-beta — 2026-11-20

- Armor that covers both sides of a location that has sides (Shoulder, Arm, Hand, Hip, Thigh, Shin, Wing, creature Fore and Hind Legs) is converted to a Left and a Right entry with the same condition, in memory when it loads (`splitBothSides`) and in the database by `scripts/imports/migrate-armor-coverage.js`. The protection is the same: a hit on either side, or on a location with no known side, is still covered when both sides are.
- Armor coverage is stored as entries instead of a set of keys: `system.coverage`, a list of `{ type, side, condition }` (side "" covers both sides). It replaces `system.locations` and `system.locationConditions`; the 18 left and right keys are gone, the picker simply offers a type with its side. The condition of each location starts at 0 and is informational. Old armor is converted in memory when it loads, so nothing breaks before you migrate; `scripts/imports/migrate-armor-coverage.js` (Report only, then Apply) writes the new data to the world and the compendiums, deletes the old fields and gives hit locations a side from their name.
- Armor has an Original durability field (`system.originalQuality`), edited next to the Durability field and shown on the Gear tab and in the tooltip as current/original (5/10; 5/- when it is not set). It no longer reads the original from the compendium; the migration macro fills it from the compendium item the piece was copied from.
- Left and right names are composed ("Left Arm") instead of 18 separate lang entries; for the creature legs this gives "Left Creature Fore Leg".

## 1.0.53-beta — 2026-11-20

- Armor can cover one side: Shoulder, Arm, Hand, Hip, Thigh, Shin, Wing and the creature Fore and Hind Legs are offered as Left and Right (Head, Neck, Chest, Belly, Tentacle, Tail and the other creature locations stay as they were). A hit location now has a Side (`system.side`, set automatically for the default locations; a location without one takes it from the word Left or Right in its name), and armor that covers only the left arm does not protect the right arm. Armor that already covers a plain "Arm" keeps covering both sides.
- The armor sheet's location picker offers only the locations the wearer has: the hit locations of the actor the armor is on (a humanoid, a creature or an animal), and only the sides that actor has. Armor that is not on an actor (in the Items directory or a compendium) still offers every location.
- Armor sheet, Properties tab: the covered locations are rows (name, Condition, remove button) instead of tags, with a picker that offers only the locations not covered yet. New field: a Condition per covered location (`system.locationConditions`). It starts empty and is informational: nothing fills it in and no rule reads it yet. Layer is a number field, Notes a text area, and the fields are laid out in a grid. Existing armor needs no migration.

## 1.0.52-beta — 2026-11-20

- Item tooltip: hover an item row (Gear tab, Containers tab, chest list) for a quarter of a second to see every detail of the item (type, quantity, weights, value, carried, container, durability, weapon, armor, missile and container lines, artifact class and attunement, notes and description). It is the native version of the old tooltip macro; switch that macro off.
- Czech is available as a language (Settings, Configure Settings). It translates the rule texts of the maneuvers and tactics and part of the sheet labels; everything else falls back to English. The English maneuver and tactic texts are a translation of the Czech originals and need a review.
- The text that was written into the code is in `lang/en.json` now: the Artifact/Rune Use and Recharge dialogs and messages (their forms are templates under `templates/dialogs`), the Active Effect key picker, the maneuvers and tactics, and several card lines (bleeding, mend result, load, picker options). The numbers in the Grapple and Pin descriptions come from the status penalties in config.
- The combat helper passes the artifact to the Artifact/Rune Use dialog directly, instead of waiting for a dialog with the title "Artifact/Rune Use". Damage letters in the combat helper follow the order B E P F when strengths tie.
- Code refactor, no change for players: more rule values moved to `module/config/` (time units, severity levels, aspect letters, status skill categories, default skills and hit locations, form limits, UI timings); the Foundry setup is in `module/foundry/` and `scarmark.mjs` only calls it; `dice.mjs` is split into `helpers/dice/`; the sheet actions are in `sheets/actions/`; the repeated item template blocks are partials; the pure view code is in `module/view/`.
- Dev: lint fails on a name that is not defined or imported and has no warnings left; CI (`.github/workflows/test.yml`) runs lint, the tests, golden and the cycle check; the render snapshots cover the 12 item sheets; `tests/lang.test.mjs` and `tests/sheet-actions.test.mjs` check lang and template actions against the code. The LevelDB `LOCK`, `LOG` and `LOG.old` files of the packs are no longer tracked.

## 1.0.51-beta — 2026-11-20

- Code refactor, no change to the rendered sheets: the actor templates share partials (`templates/actor/partials/`): one `gear-section` for the five Gear tab sections, `table`, `combat-section` and `esoteric-section` for the Combat and Esoterics tables, `attribute-rows` and `trait-column` for the Profile tab and `header-identity` for the sheet headers. `creature-profile.hbs` is gone (the Creature and Animal sheets use `profile.hbs` with `showSpecialAbilities`), and the sheet classes build their tabs and parts from `module/sheets/sheet-layout.mjs`. The actor templates went from about 930 to 690 lines. `tests/render.test.mjs` checks that the HTML of every sheet part is unchanged.
- The sheet behaviors of the old patch macros are now part of the system. If the world still runs them (SM_PATCHES START), switch them off first (`SM_PATCHES.stop()` and remove the autostart), otherwise they act twice.
- The empty Macro tab is gone from the Character, NPC and Creature (and Animal) sheets.
- Gear and Containers tabs: item weights show up to 3 decimals ("0.125" instead of "0.1"), "-" when missing.
- Gear tab, Armor: the DUR column shows current/original DUR ("5/10"), the original read from the armor's compendium source; "5/-" when the item has no compendium source (hover for details).
- Click a row (item or effect) on an actor sheet to open its sheet. Clicks on buttons, links and fields, drags and double clicks are ignored.
- Actor sheets keep their scroll position across re-renders and tab changes.
- The inventory and combat patch macros are part of the system too (switch the old macros off first, see above):
  - Gear tab (not on Container actors): a Containers section lists every container with its weight and how full it is ("used / capacity"). A Container actor shows a chest list instead: each container with the items stored in it and the items whose container is gone, searchable with the Gear filter. Unpack takes an item out of its container, or empties a container.
  - Double click a stackable item row (Gear, Weapon, Missile, Armor) to split the stack in two, triple click to merge all identical stacks in the same container. The sheet of a stackable item now opens 350 ms after the click.
  - Drag an item onto a container block (Containers tab) to store it. Containers move to another actor with their contents, items taken out of a container arrive at the top level, and every drop on or from a Container actor is a move. The valid drop target is outlined. The copies are checked before the originals are deleted, and undone if a step fails.
  - Combat helper: press T over a targeted token, or double click a token you do not own, to open a dialog with the attacker's unarmed, close, throwable, missile, artifact and rune attacks. Artifacts and runes preselect the item in the Artifact/Rune Use dialog. Tokens with their own double click (Item Piles, containers) are left alone.
  - Combat helper, Maneuvers column: Grapple, Pin, Push, Ram, Trip and Entangle post a chat card with buttons for the target's answers and roll the maneuver. Show tactics (button in the dialog header) lists the tactics. Cards made by the old macro keep working.
  - Dialogs: the arrow keys move between buttons and items, the focus follows the mouse, and a destructive dialog focuses Cancel first.

## 1.0.50-beta — 2026-11-20

- Bug fix: actor, item, skill and injury names are now HTML-escaped wherever they are placed into chat cards and dialog content (attack, defense result, strike, wound, clash, stun, fumble/stumble, shock, mend, esoteric roll, artifact use, effect delete confirmation). A name containing `<` or `&` no longer breaks or injects markup. Stored names (for example an injury item's name) are not changed. One shared helper, `module/helpers/escape.mjs` (`esc`, `escAttr`), replaces the four private escape helpers. Card markup for normal names is unchanged.

- Code refactor, no intended behaviour change: the rule values (attributes, penalties, wound tables, hit locations, combat constants, status penalties, data model limits) moved from `module/config.mjs` into `module/config/`, and the pure calculations (d100 cap and outcome level, spell and invocation targets, outcome tables, injury thresholds, armor wear and piercing, derived stats, location keys) into `module/rules/`. `CONFIG.SCARMARK` / `game.scarmark.config` keeps every key, value and function; `tests/config.test.mjs` compares it with a snapshot of the old object. The Outnumbered steps, strike dice and Shock factor are config values now.

## 1.0.53-beta (owner line, merged in 1.0.59) — 2026-11-20

- **The Base-delta is gone.** Before, any change to an attribute's effective value (Active Effects, fatigue, load, wounds) moved every skill built on it by 5 ESL per point of Base. Now an Active Effect on an attribute changes attribute rolls, Endurance, carrying capacity and Move only, and skills no longer follow. A skill is changed by an effect on its own key (`system.mods.skill.<Name>`) or on its category (`system.mods.skills.<category>`), or by an Override.
- **Fixed skill penalty.** Fatigue, load and wounds still lower attributes (as before), and now also lower the ESL of EVERY skill and psionic talent by a fixed amount: **5 ESL per penalty point**, the same for every skill whatever its attributes. Penalty points = fatigue steps (1 per 2 Fatigue) + load steps (1 per started 20 % over capacity, at most 5) + wound band points (1 at 50 % Condition or less, 2 at 25 % or less). The value is `SCARMARK.SKILL_PENALTY_PER_POINT` in `module/config.mjs`; the total is `system.skillPenalty`. Example: Fatigue 4 and Condition at 46 % give −10 −5 = −15 ESL on every skill. An Override effect still replaces the whole ESL.
- Existing Active Effects on attributes (alcohol, diseases, drinks and so on) no longer change skills. Any effect that should change a skill needs a skill or category key; this is part of the planned review of all effects. Reload Foundry (F5) after updating.

## 1.0.52-beta (owner line, merged in 1.0.59) — 2026-11-20

- Skill reduction, step 1: new Script macro `scripts/imports/reduce-skills.js` (Report only / Apply). It deletes 30 skills that are now an attribute roll with a multiplier (Acrobatics, Dancing, Swimming, Acting, Charm, Intrigue, Rhetoric, Singing, Musician, Mental Conflict, Courtwise, Streetwise, Villagewise, Divination, Folklore, Lore, Law, Literacy, Mathematics, Engineering, Astrology, Drawing, Handicraft, Sailing, Survival, Tracking, Bargaming, Herblore, Cat Senses, Elven Empathy), merges Herblore into Alchemy (the higher level wins), renames Sleight of Hand to Pickpocketing, and deletes ALL Active Effects of the potions (Alchemy compendium) and the racial traits, which will be redone. The potion and trait items stay with their descriptions. Magic schools, Arcane Lore, Runecraft, Arcane Combat and the religions are not touched. Back up the world first; the SL of deleted skills is lost.
- New actors now start with fewer default skills: Character and NPC get Vitality, Stealth, Close Combat, Dodge, Initiative, Ranged Combat, Unarmed Combat and Physician; Creature the same without Physician; Animal also without Close Combat. Reload Foundry (F5) after updating.

## 1.0.51-beta (owner line, merged in 1.0.59) — 2026-11-20

- Skill categories are now three: **Skill** (what was Physical, Communication and Craft), **Combat** and **Esoterics** (what was Religion and Magic). The Skills tab on Character, NPC, Creature and Animal lists the skills in these three sections. Old items are converted when they load, so nothing breaks before the migration is run.
- New skill field **Kind** (Esoterics only): *Arcane* or *Religion*. Spells still roll against an Arcane skill, invocations against a Religion skill, and Faith Points (FP) stay on Religion skills. A new Esoterics skill added from the sheet starts as Religion. Creatures and animals do not list Religion skills.
- Active Effect keys for a whole category are now `system.mods.skills.skill`, `.combat` and `.esoterics` (`.psionic` unchanged). The old keys (physical, communication, craft, religion, magic) still work, and the effect key picker offers only the new ones.
- Status penalties (Prone, Stunned and so on) now lower Combat, Esoterics and psionic skills only, for now. They no longer touch the general Skill category (Stealth, Vitality, Language …); before, they also hit Physical, which no longer exists.
- Old category effect keys no longer stack: an effect that lists the same value on several old keys (Hangover III and IV, Black Death, Sepsis: physical, communication and craft all fold into Skill) counts once, not three times. Until the data is migrated, the old key with the largest absolute value is used for each new category.
- Optional macro `scripts/imports/migrate-skill-categories.js` (Report only / Apply) stores the new categories in compendia, world items, actors and unlinked tokens, renames the category effect keys and merges the duplicate changes that the rename creates (one change per effect, largest value). Reload Foundry (F5) after updating.

## 1.0.50-beta (owner line, merged in 1.0.59) — 2026-11-20

- Character and NPC Profile tab: new free-text **Specialization** box under the Physical and Psyche Traits (`system.specialization`). It is a plain note for background and specializations (Townsman, Craftsman, Trapper …), left to roleplay and GM ruling; it has no mechanics. No migration; existing actors start with an empty box. Reload Foundry (F5) after updating.

## 1.0.49-beta — 2026-11-03

- Code refactor, no intended behaviour change: the Combat tab now takes melee ASL/DSL and missile ASL from the same functions as the attack rolls (`weaponAsl`, `weaponDsl` and the new `missileAsl` in `combat/lookup.mjs`), so the sheet and the roll cannot drift apart.
- Code refactor: flag, setting, pack and query ids live in one file, `module/constants.mjs` (`FLAGS`, `SETTINGS`, `PACKS`, `QUERIES`). The stored values are unchanged.
- Code refactor: the Add Wound, Fumble/Stumble, Stun and Shock buttons on combat chat cards are built by `cardButton()` and wired from one table (`combat/card-buttons.mjs`, `chat-wiring.mjs`). The attribute names are unchanged, so old chat messages keep working. Payloads with an apostrophe are now escaped.

## 1.0.48-beta — 2026-11-03

- Code refactor, no behaviour change: `module/helpers/combat.mjs` is split into 15 modules under `module/helpers/combat/` (constants, util, lookup, armor, gm-update, dialogs, outcome, strike, wounds, clash, forced-tests, resolve, attack, chat-wiring, round, combatant). `combat.mjs` stays as a re-export barrel with the same 17 exports, so `game.scarmark.*`, the chat card markup and the `scarmark.updateCombatItem` query are unchanged. Reload Foundry (F5) after updating.

## 1.0.47-beta — 2026-11-03

- The sheet fixes that lived in the world's patch macros are now part of the system stylesheets, with no `!important` and no override file: aligned Gear and Containers columns (Class before Notes), the grid Containers header, the Gear tab containers section, the Container sheet chest list, aligned action icons in the Combat and Esoterics tables (muted icons, delete in the accent colour), dark effect icons on the light theme, hidden scrollbars on actor and item sheets, item and injury tooltips, and the combat helper and delete-confirmation dialogs. New files: `css/actor/container-sheet.css`, `css/base/tooltips.css`, `css/dialogs/dialogs.css`. The patch macros keep working; remove their CSS once their scripts move into the system. Reload Foundry (F5) after updating.

## 1.0.46-beta — 2026-11-03

- Stylesheet refactor, no visual change: `css/scarmark.css` is split into 19 files under `css/base`, `css/actor`, `css/item`, `css/chat` and `css/foundry`, registered in `system.json` in an explicit order (that order is the cascade precedence, see `css/README.md`). Duplicate and redundant rules are merged or removed, and repeated values (fonts, radius, type sizes, gaps, field padding, border lines) are now `--sm-*` tokens. No class names changed. Reload Foundry (F5) after updating.

## 1.0.45-beta — 2026-10-30

- Verified on Foundry 14.369 (world migration and pack loading checked in the server logs; no system errors).

## 1.0.44-beta — 2026-10-02

- Missile items gain a Specialization field (same meaning as on weapons). It is added to the ASL of a range attack and shown, with the sum, on the Combat tab's Missile table (new Spec column). The launcher (bow, crossbow) is still not checked, so enter the specialization on the missile item.

## 1.0.43-beta — 2026-10-02

- Containers tab: stored items now show their Notes column (the row grid had one cell too few, so Actions sat in the Notes column).
- Attack dialogs gain a Target choice: Mid (random, no penalty), High (-10), Low (-10) and, for melee only, Disarm (-20, strikes only a Hand, Left or Right at random). High and Low use the High/Low hit weights; the penalty is folded into the ASL and shown on the attack card.
- Casting a spell now spends its Class from Spirit Capacity (win or lose). If the pool is short, you are asked whether to cast anyway (the pool drops to 0). The cast card shows the pool before and after.
- Missile items gain Magic Missile and Class. A Magic Missile spends its Class from Spirit Capacity per shot instead of ammo; the Qty column on the Combat tab shows the shots left (Spirit Capacity / Class). Macro `scripts/imports/set-magic-missiles.js` flags the Arcane Combat missiles and takes Class from the spell of the same name.
- New Script macro `scripts/macros/rest.js` (Rest): sets Fatigue to 0 on every selected owned token.

## 1.0.42-beta — 2026-09-30

- Combat Statistics adds editable Will Capacity beside Endurance, with effective Will beneath it. Spirit and Will pools are stored separately; spending does not reduce attributes.
- Gear and weapons show Artifact, Rune, Attuned and editable Class (1–5) on one row. Charges and Ego controls are removed, including the Gear tab's charge editors (now Class). Existing attunement is preserved; Class defaults to 1, so set each item's intended cost before use.
- Artifact/Rune Use lists attuned items carried by the actor (including items in carried containers), then spends Class from Will Capacity for artifacts or Spirit Capacity for runes. Rune takes precedence when both flags are set. Insufficient capacity prevents use. The macro records use; it does not roll attacks or apply item effects.
- Recharge restores Will, Spirit or both to their current effective attributes. It is a manual command: eight hours of rest must be established at the table; no elapsed-time check or Charge action is added.
- Two Script macro sources in scripts/macros call the new system API. Reload the world after updating, then paste each source into a Script macro. No database editing or world migration is required.

## 1.0.41-beta — 2026-09-29

Sheet changes (D.): **Combat Statistics** loses Initiative (roll it from the Skills tab, as before), and the **Esoterics tab gets an "Esoterics Statistics" block**. No data migration; nothing to run.

- **Combat tab:** Fatigue, Dodge, Load and Endurance share the row, so the cells spread over the full width (the row is no longer a fixed five columns).
- **Esoterics Statistics** (top of the Esoterics tab):
  - **Spirit Capacity:** a plain number field (`system.resources.spiritCapacity`, all actor types) with the effective Spirit shown beside it as a reminder. Arcane casting capacity is set by Spirit; **nothing computes or spends it yet** — that comes with the Arcane rework (cost by Class, the new Charge).
  - **Faith Points:** one field per Religion skill (labelled with the religion when there are several). It is not a copy: the field *is* that skill's own Faith Points, so overwriting it writes the skill (the FP column on the Skills tab shows the same number). Faith Points are still spent automatically when you roll an Invocation (S and CF: minus its Class, from that skill; never below 0; with too few points you are asked first). An actor without a Religion skill shows a dash.

## 1.0.40-beta — 2026-09-29

Quadrupeds keep their nine locations and every rule; only two names change (D.): **Creature Thorax → Creature Chest** and **Creature Abdomen → Creature Belly**, to match the humanoid Chest and Belly. Weights and wound scale are unchanged. Old records keep working (the code reads the old keys `creatureThorax` and `creatureAbdomen` as the new ones), and **`scripts/imports/migrate-hit-locations.js` (the 1.0.39 macro, now extended) renames them**: **reload the world (F5) first** (the macro refuses to run on a page that still has the older system loaded), then run it again (Report only, then Apply); it is safe to repeat and, after the 1.0.39 run, only does this step.

- Renames the location items of animals and creatures (also of unlinked tokens and the Armor Locations compendium) in place, keeping their weights, and maps the coverage of armor pieces that cover them (barding, peytral, natural hides).
- Tried in a mock Foundry against a copy of every system compendium: 8 animal templates (16 items) and 2 compendium items renamed, 19 armor pieces mapped, nothing left with the old keys, a second run changes nothing; also tried from the state after the 1.0.39 run (humanoid part done): only the creature step runs.

## 1.0.39-beta — 2026-09-29

Humanoid hit locations reworked (D.): ten location types instead of sixteen, two wound scales, new Fumble, Stumble and Stun Test rules, and lower protection for armor that covered only part of a merged location. **Run `scripts/imports/migrate-hit-locations.js` (Report only, then Apply) before uploading to Molten**, then reload the world. Until then old records keep working, but their hit chances are the old ones. **Play-test the balance.**

### Hit locations
- **Ten types, sixteen items** for characters, NPCs and creatures: Head (was Skull and Face), Neck, Shoulder, Arm (Upper Arm, Elbow, Forearm), Hand, Chest (Thorax), Belly (Abdomen and Groin), Hip, Thigh, Shin (Knee, Calf, Foot). Mid hit chances: Head 10 %, Neck 4, Shoulder 10, Arm 12, Hand 6, Chest 16, Belly 12, Hip 6, Thigh 12, Shin 12. Animals keep their nine quadruped locations.
- **Two wound scales.** A location stores the **Wound Level as a number** (the letter codes M1 to K5 are gone). Core (Head, Neck, Shoulder, Chest, Belly, Hip, creature body): Effective Impact 1+ / 5+ / 9+ / 13+ / 17+ gives WL 1 / 2 / 3 / 4 / 5. Limb (Arm, Hand, Thigh, Shin, wing, tentacle, tail, creature legs): WL 1 / 1 / 2 / 3 / 4; a limb reaches WL 5 only by being severed (Edge, Effective Impact 17+). Thigh is a Limb (D.: it is harder to sever than an arm, so they are level).
- **Fatal wounds:** Head, Neck, Chest and Belly: WL 4 knocks out, WL 5 leaves dying (the whole Head now dies at WL 5; before, only the Skull did). The fatal share of hits stays at 42 %.
- **Fumble Test** (DEX × 5): a wound to the Hand, any level, or to the Arm from Severe (WL 3). **Stumble Test** (AGL × 5): a wound to the Thigh or Shin, any level.
- Old location keys (Skull, Forearm, Foot ...) are read as the new types until the migration has run.

### Stun Test
- A **Heavy or Severe wound to the Head (WL 2 or 3)** puts a **Stun Test** button on the strike card. Roll d100 against **50 + head protection + your modifier** (cap 95): the best worn, undestroyed piece covering the Head gives +20 at layer 5 (Lamellar, Brigandine, Plate) or +10 at layers 2 to 4 (Padded and up). CS: you act first next round; S: you withstood it; F: **Stunned for one round** (all defenses −30, the effect expires at the start of your turn in the next round; losing the action is by hand); CF: Unconscious.
- The **Stun Test macro** is now a thin wrapper of `game.scarmark.stunTest` for an electric shock or a hand-made test (the head protection is added for a blow only; the old advice "−5 to −25 for no helmet", which contradicted the rules, is gone).

### Armor
- A piece that covered only part of a merged location gets lower B/E/P/F: each value × the share of hits it used to cover (Head = Skull 5 + Face 5, Arm = Upper Arm 6 + Elbow 2 + Forearm 4, Shin = Knee 2 + Calf 6 + Foot 4), up to 60 %, at least 1. A piece that also covers other locations and only 25 % or less of a merged one (Short Legs cover just the knee of the Shin) loses that location. Everything else keeps its numbers (hoods, Short Arms, hauberks; the Mail Hood covers Head, Neck and Shoulder in full). An open helmet and a visor together come to about a full helmet.

### Migration (one-shot GM macro)
- **`scripts/imports/migrate-hit-locations.js`** (Report only / Apply; system and world compendia, world items and actors, unlinked tokens; safe to repeat):
  - replaces the 26 old location items of every character, NPC and creature (templates included) with the 16 new ones and lists custom hit weights it overwrites;
  - maps the coverage of armor pieces to the new types and lowers the protection as above (17 pieces in the system compendia, among them Plate Bracers 6/9/6/2 → 2/3/2/1 and Plate Helmet 6/9/6/2 → 3/5/3/1);
  - rebuilds the Armor Locations compendium (42 → 32 items) and refreshes the Stun Test macro in the Scarmark Macro compendium.
- Tried in a mock Foundry against a copy of every system compendium and a test world (23 actors, 96 armor pieces, an unlinked token): no old location key is left, the second run changes nothing. Not yet run in the real Foundry.
- Internal identifiers keep their spelling (`risk.fumble` and `risk.stumble` now mark the arm and leg chains, `locationType` values), so nothing stored breaks.

## 1.0.38-beta — 2026-09-29

Second terminology pass (D.). Game mechanics do not change. **Run `scripts/imports/rename-entropic-and-base.js` (Report only, then Apply) before uploading to Molten**, then reload the world.

### Names
- **Skill Base (SB) is called Base.** The Skills tab column and the skill and psionic sheets say Base (the per-attribute `base` input on the Profile tab is a different thing: the stored value before effects).
- **Class is used for spells too** (was Level; the data key stays `level`), so Class is the number of a spell as well as of an invocation. The Spell Misfire card says "−5 per Class above 1".
- **Enthropic Magic → Entropic Magic.**
- **Attacker's / Defender's Opportunity** is an opening for one extra Long Action of any kind (attack, maneuver, retreat …). The card says so; its button starts an attack, the other actions are played by hand.
- New message when nothing can block a missile: "You can't block a high velocity projectile with a weapon; you are not a ninja." (It replaces the old line that named a character from a novel.)

### Cleanup
- The README, the `system.json` description, this CHANGELOG and the comments in the code no longer refer to the tabletop game the system started from.

### Migration (one-shot GM macro)
- **`scripts/imports/rename-entropic-and-base.js`** (Report only / Apply; system and world compendia, world items and actors, unlinked tokens; safe to repeat):
  - renames the skill Enthropic Magic, moves every spell to the new school name and rewrites the Active Effect keys `system.mods.skill.Enthropic Magic` (Dark Elf and Red Elf traits included);
  - renames folders called Enthropic Magic (if Foundry refuses to rename a compendium folder, the macro says which one to rename by hand);
  - texts: Enthropic → Entropic, "Skill Base" and "SB" → "Base";
  - removes the remark about the old game from the Stun Test macro code (system compendium and world macros).
- Tried in a mock Foundry against a copy of every system compendium, not yet in the real Foundry: 3 skills, 29 spells, 4 effect keys, 10 texts, 2 folders, 2 macros; nothing left over, a second run changes nothing.

## 1.0.37-beta — 2026-09-29

Terminology pass (D.): names that were too close to the traditional tabletop wording are replaced, and skills lose their ALL CAPS names. Game mechanics do not change. **Run `scripts/imports/rename-skills-and-terms.js` (Report only, then Apply) before uploading to Molten**, then reload the world.

### Names
- **Injury severity** has one name per Wound Level: **1 Light, 2 Heavy, 3 Severe, 4 Dire, 5 Mortal** (was Minor, Serious for 2-3, Grievous, Mortal). The wound catalog follows: Light / Heavy / Severe / Dire / Mortal + Cut, Stab or Burn; blunt names (Bruise, Contusion, Fracture, Crush, Mortal Crush) stay. The internal hit-location codes (M1 … K5) are untouched until the location rework.
- **Skills:** the automatic skills are written in normal capitals (Vitality, Stealth, Swimming, Dancing, Rhetoric, Intrigue, Singing, Close Combat, Dodge, Initiative, Ranged Combat, Unarmed Combat, Folklore, Physician, Survival); default skills of new actors follow. The code already compared names case-insensitively, so nothing depends on the capitals. **Renamed:** Lovecraft (INTRIGUE) → **Charm (Intrigue)**, Tarotry → **Divination**, Legerdemain → **Sleight of Hand**, Lockcraft → **Lockpicking**, Animalcraft → **Animal Handling**; the parent tags of Courtwise, Streetwise and Villagewise are Title Case too.
- **Counterstrike → Counterattack**, **Shock Roll → Grit Roll** (the Combat-tab button says Grit), **WQ and AQ → DUR** ("Weapon Durability" and "Armor Durability"; each stays its own field on its own item type, so a sword's DUR and a cuirass's DUR never mix), **Circle → Class** for invocations (the data field is still `circle`).
- Internal identifiers keep their old spelling (`data-defense="counterstrike"`, `shockGrit`, `quality`, `circle`, `SHOCK_THRESHOLD`), so nothing stored breaks.

### Migration (one-shot GM macro)
- **`scripts/imports/rename-skills-and-terms.js`** (Report only / Apply; system and world compendia, world items and actors, unlinked tokens; safe to repeat):
  - renames the skills (also every other skill written in all capitals) on skill items everywhere;
  - rewrites **every Active Effect change on `system.mods.skill.<Skill Name>`** to the new exact name (compendium effects, item effects, actor and token effects), which also ends the old case mismatch (bug F0), so `fix-skill-key-case.js` is superseded;
  - fixes texts in item descriptions, notes, psionic Misfire, effect descriptions and roll-table results: old skill names, Shock Roll, Counterstrike, WQ / AQ, Circle in invocations, and wound-scale words in prose ("a Serious wound" → "a Heavy wound", "Serious 3 burns" → "Severe 3 burns");
  - renames wounds already on actors and tokens (Minor / Serious / Grievous + Cut / Stab / Burn; Serious becomes Severe from Wound Level 3);
  - lists (does not edit) macros that still use an old name. Poison grades such as "Animal Poisoning (Grievous)" are left alone on purpose.
- Tried in a mock Foundry against a copy of every system compendium, not yet in the real Foundry (342 skill items, 157 effect keys in 118 effects, 102 texts, wounds on a test actor and an unlinked token): no capitals left in any skill name, every key matches a skill, a second run changes nothing.

## 1.0.36-beta — 2026-09-28

Attributes and penalties reworked (D.). Old records are converted on the fly when loaded (see below); **run the migration macro before uploading to Molten**.

### Migration (one-shot GM macro)
- **`scripts/imports/migrate-attributes-penalties.js`** (Report only / Apply; system and world compendia, world items and actors, unlinked tokens; safe to repeat):
  - saves actors with the 9 attributes (8 for creatures and animals);
  - **races go into the attribute values** (Water Elf PER +1, Forest Elf PER +3, Leonid and Tavaxi PER +4 including their old Awareness bonuses, High Elf PRE +2, Red Elf PRE −2); race traits keep only their skill bonuses;
  - saves skills and psionic talents with the new Skill Base attributes and **deletes AWARENESS and AWARENESS - PASSIVE**;
  - converts effects: EYE / HRG / SML → PER as their average (Cat Senses PER +6), VOI or COM → PRE at full value (perfumes, Unpleasant rash, Hangover IV PRE −3), AUR → SPI (Arcane Draught, alcohol), MOR dropped; effects on the Awareness skills → PER at a fifth (Cup of Coffee +2, Drunk −3, Hangover III −4, Opium −4);
  - **helmets** (Plate Helmet, Plate Full Helmet, Plate Great Helmet, Lamellar Helmet) get "Helmet: Perception −1"; the old notes "Penalty to EYE and SML" / "Penalty to HRG" are removed;
  - texts: Aural Shock → Spirit Shock, AUR → SPI, Aura / aura → Spirit / spirit, Sunsign → Zodiac Sign;
  - adds the Awareness and Passive Awareness macros to the Scarmark Macro compendium;
  - lists for a hand check: creatures or animals with a skill on Presence, unlinked tokens with their own old attribute values (folded into the new ones), override changes on old attributes.

### Attributes
- **9 attributes instead of 13:** Strength, Stamina, Dexterity, Agility, Will (row 1) and Perception, Presence, Intelligence, Spirit (row 2). Creatures and animals have 8 (no Presence). Eyesight, Hearing and Smell fold into **Perception**, Voice and Comeliness into **Presence**, Aura becomes **Spirit**; Morality is gone.
- Old records are converted when loaded (`migrateData`): PER = average of EYE, HRG, SML; PRE = average of VOI, COM; SPI = AUR. Skill and psionic Skill Base attributes map the same way (psionic talents default to SPI, SPI, WIL).
- Player characters get **Personality** (Law-abiding, Practical, Opportunistic, Corruptible, Vicious) after Birthplace. **Sunsign is now called Zodiac Sign** in every label (the data key stays `sunsign`).
- **Skills follow attributes:** ESL moves by round(change of the three attributes / 3 × 5) between the effective and the stored values. A hand-made (permanent) change of an attribute never moves ESL; effects and penalties do.

### Penalties (Burden and the mental penalty are gone)
- **Fatigue:** −1 to every attribute per 2 points (so −5 on every skill), Endurance included.
- **Load:** carrying capacity = STR + STA in kg (with effects, without penalties). −1 AGL per started 20 % above it (at most −5); above twice the capacity nothing can be carried (shown in orange). The header's **Burden** now shows these overload points; the Combat tab shows "kg / capacity (%)".
- **Condition = Endurance − WL** (every injury item: wounds, diseases, poisons; plus `mods.injury`). At 50 % or less DEX and AGL −1, at 25 % or less −2. At 0 a player character falls unconscious, any other actor dies (Dead, defeated in the Combat tracker). The header shows Condition as "value / Endurance (%)", coloured by band.
- **Vital wounds:** a Grievous (WL 4) or Mortal (WL 5) wound to Skull, Neck, Thorax or Abdomen knocks the victim out or leaves them dying; to the Face it knocks them out. Shown on the strike card, stored on the injury ("Vital wound", editable by the GM) and forcing Condition to 0.
- **Heavy Bleeding** no longer counts at once: every 5th combat round each bleeding wound gets +1 WL (with the combat Fatigue tick). Untick Heavy Bleeding when the wound is bandaged.
- **Shock Roll** = d100 vs 2 × Condition % (25 % = 50 / 50). After a new wound at 25 % Condition or less the chat asks for it. CS: no more Shock Rolls this combat; S: fights on; F: out of the fight (Prone, conscious); CF: unconscious.
- **Move (m) = effective Agility**, one derived number (no longer typed in).
- Effect keys `system.mods.up`, `system.mods.pp` and `system.mods.encumbrance` are removed (no compendium effect used them).

### Skills and macros
- New characters, NPCs, creatures and animals no longer get **AWARENESS** or **AWARENESS - PASSIVE**. New macros `scripts/macros/awareness.js` (Perception × 5) and `scripts/macros/passive-awareness.js` (Perception × 3, whispered to the GM by default).
- Spell Critical Failure text: Spirit Shock and Spirit test (was Aural Shock and Aura test).

## 1.0.35-beta — 2026-09-28

### Skills
- **MOBILITY is removed** (D.). Movement per round is **AGL in metres** (the old Move of AGL × 5 ft, now that one square is 1 m); what used to be a Mobility roll is an **AGL × 3** attribute test. New characters, NPCs, creatures and animals no longer get the skill (`actor-setup.mjs`).
- One-shot GM macro **`scripts/imports/remove-mobility.js`** deletes MOBILITY from the system and world compendia (Skills, the NPC templates), world items, every actor and the own copies of unlinked tokens; renames **Acrobatics (MOBILITY)** to **Acrobatics** (its description no longer mentions MOBILITY) and its effect keys `system.mods.skill.Acrobatics (MOBILITY)`; fixes the Water Elf text "(Swimming = Mobility)" to "(AGL metres per round)". Effects that still target MOBILITY are only listed. "Report only" first; safe to repeat.
- The Move field on the sheet is still entered by hand (set it to AGL).

## 1.0.34-beta — 2026-09-28

### Metric units (D.: kg and metres, miles to km)
- **One-shot GM macro `scripts/imports/convert-to-metric.js`** converts the data: item weights and container Max Capacity from "ounces" (0.5 kg) to **kg** (× 0.5); missile ranges, Move, token vision / light / detection / elevation, ambient light and sound radii, wall thresholds and level / region / tile elevations from feet to **metres** (÷ 5: one grid square stays one square, 5 ft = 1 m; whole metres, rounded **up**, since the grid squares are 1 m: a 1.6 m reach still reaches into the second square); overland scenes from miles to **km** (× 1.6, a 5-mile square becomes 8 km); the light and vision macros ("Vision (Darkvision 20 fts)" becomes "Vision (Darkvision 4 m)"). It covers the system and world compendia, world items, actors, scenes, macros and unlinked tokens. "Report only" lists every change first; each converted document is flagged, so an interrupted run can be repeated. Scenes in other units (Tarot Table, Notice Board) are left alone.
- **Hidden world setting `scarmark.metricUnits`**, switched on by the macro. Until then the system reads item weights as the old ounces, afterwards as kg, so **Encumbrance and the shown capacity stay exactly the same** before and after the conversion (the interim Load rule keeps the old scale: floor(weight in ounces / Endurance), capacity Endurance × 5 kg). The new Load rule (STR + STA kg) is still being designed.
- New scenes default to a **1 m** grid (`system.json` grid).
- Missile ranges and Move stay whole metres (Trident 8 / 14 / 22 / 35 ft becomes 2 / 3 / 5 / 7 m). The range-attack card shows the measured distance with the scene unit ("4 m").
- Labels: Weight (kg), Capacity (kg), Max Capacity (kg), Contents (kg), Range (m), Move (m). The Light Picker source now uses metres (candle 2 / 1 m, torch 4 / 2 m, lantern 6 / 3 m).
- The old import scripts in `scripts/imports/` still hold the old units; do not re-run them after the conversion.

### Fixes
- Container weights on the Containers tab and the container sheet are rounded ("0.8049999999999999 / 1" showed floating-point noise).

## 1.0.33-beta — 2026-09-28

### Combat
- **New melee reaction: Riposte** (for playtesting; Counterstrike stays for now). A fifth button on the melee attack card, next to Counterstrike; not offered against missiles. The dialog takes a weapon, its aspect and a modifier; the target is the weapon's ASL plus the usual defense situationals (Stunned, Outnumbered), capped at 95.
  - **Only a real weapon ripostes:** no shields (by the isShield flag or by name) and no natural weapons or body parts (WQ 0: Fist, Bite, Claws, Horns …). A bite or claw cannot parry a blade. Anyone can still riposte an ordinary animal's attack with their own weapon.
  - **Resolution:** the better success level strikes (2d6 on S, 3d6 on CS) and the other side's blow is turned aside. On the same success level (S/S, CS/CS) the **higher roll** wins; the card says so ("Riposte wins the tie: 68 vs 42"). An identical roll is parried with no answer. Both failing: nothing. Attacker's / Defender's Opportunity from criticals as before; **no weapon clash**.
  - Riposte is the weapon of the better fighter: against a weaker foe it pays, against a stronger one Block is safer. The same restrictions as Counterstrike apply (Prone, Grappled, Defensive Stance …); the GM enforces them.
- **Tactical Advantage is now called Attacker's Opportunity / Defender's Opportunity** (formerly ATA / DTA) on the exchange card, its "Initiate …" button and the weapon-destroyed line, which now names the right side. Wording only; the mechanics are unchanged. The polearm reach attack will be called **Opportunity Attack** in the rules.

### Fixes
- The Counterstrike dialog preselected aspects from the actor's first weapon, even a broken one that is not in the list. It now uses the weapon the dropdown shows first (`promptDefense`, `combat.mjs`).

## 1.0.32-beta — 2026-09-28

### Rules
- **Invocations no longer cost Fatigue.** The god works the miracle; the invoker pays only Faith Points (CS 0, S −Circle, F 0, CF −Circle), as in Religion 3.1. Before, an invocation also added Fatigue (S +1, F +1, CF +2). Spells and psionic talents keep their Fatigue costs, since they are the caster's own mental effort (`rollInvocation`, `dice.mjs`).

## 1.0.31-beta — 2026-09-28

Fixes from the System setup review (`Scarmark_System setup.md`, findings F1, K14, F0, K5).

### Combat
- **Armor packed in a container no longer protects.** Only armor that is carried and *not* stored in one of the actor's containers counts as worn: it is summed on the Combat tab's Armor Locations table, subtracted from strikes and worn down by the AQ wear roll (`isWornArmor`, `combat.mjs`). A spare helmet in a backpack still weighs, but no longer protects. Missiles and weapons are unaffected, so arrows in a quiver still show on the Combat tab and can be shot.

### Active Effects
- **Override on a skill now sets its ESL.** An Active Effect change `system.mods.skill.<Skill Name>` of type **Override** now sets that skill's (or psionic talent's) ESL to the value outright, e.g. Antidote I = VITALITY 50, instead of adding the value on top of SL. Type **Add** stays a bonus. With several overrides on one skill the highest priority wins (`collectSkillOverrides`, `base-actor-schema.mjs`). The key picker's skill group now says "Add = bonus, Override = set ESL".

### Data maintenance (one-shot GM macros)
- `scripts/imports/fix-skill-key-case.js` rewrites every `system.mods.skill.<name>` effect key to the exact skill name (basal skills in ALL CAPS) in the system and world compendia, world items and actors, and unlinked tokens. Keys that differ only in case (VITALITY/Vitality, STEALTH/Stealth, AWARENESS/Awareness) did not add up; only one of them applied. "Report only" mode lists the changes first.
- `scripts/imports/fill-psionic-misfire.js` copies each psionic talent's "Misfire (CF)" paragraph from its Description into the empty Misfire field, so a Critical Failure posts the backlash to chat.
- `scripts/imports/rename-psionic-fatigue.js` puts each psionic talent's Fatigue cost in front of its name ("F3 Negation"), like spells carry their Level and invocations their Circle, and renames the results of the D100 Psionic Talents roll table to match.

## 1.0.30-beta — 2026-09-27

### Interface
- **Compendium sidebar without banner pictures.** Core shows every compendium as a 70px picture banner with white text on top, which was hard to read. The Compendium tab now lists compendia as compact rows like Journal entries: type icon + name on the left, lock / ownership icons and the source package on the right. Applies to all compendia (system, world and module). Colours come from core's sidebar theme variables, so the rows follow the light and dark interface theme. CSS only (`scarmark.css`); a page reload is enough.

## 1.0.29-beta — 2026-09-27

### Compendia
- **Renamed:** *Poisonings - Severe* → **Poisonings (Severe)**, *Poisonings - Combat* → **Poisonings (Combat)** (labels only; compendium IDs `poisonings` / `poisonings-combat` and all UUIDs are unchanged).
- **New empty Item compendium: Racial Traits** (`packs/racial-traits`), for the playable-race trait items. Foundry creates its database on the next start.
- Needs a Foundry server restart to pick up the manifest change.

## 1.0.28-beta — 2026-09-27

### Compendia
- **The Effects compendium is split into dedicated compendia.** Four of its folders are now their own ActiveEffect compendia at the top level: **Alcohol Effects** (6, was *Toxicity - Alcohol*), **Alcohol Hangover** (4, was *Toxicity - Alcohol Hangover*), **Poisonings - Combat** (7, was *Toxicity - Combat Poisons*) and **Potion Sickness** (2, was *Toxicity - Potions*). Every effect keeps its ID and content; only its compendium changed. Nothing in the system or in other compendia linked to them (alcohol and potion items carry their own copies of the effects). **Effects** keeps the two *Outnumbered* effects.
- **Poisonings** is renamed **Poisonings - Severe** (label only; the compendium ID `poisonings` and all UUIDs are unchanged).
- The unused, empty `packs/poisonings` folder is removed (the compendium has read `packs/poisons` since 1.0.25).
- Needs a Foundry server restart to pick up the new compendia.

## 1.0.27-beta — 2026-09-27

### Documentation
- **A time-keeping module is now strongly recommended.** Many Scarmark Active Effects (consumables, alcohol, poisons, diseases…) are timed and only expire when in-game world time moves forward, which Foundry cannot do on its own. The README explains this and lists the tested modules, Simple Calendar Reborn and SmallTime. Both are also declared under `relationships.recommends` in `system.json`, so the manifest carries the recommendation too. No rules or data changed.

## 1.0.26-beta — 2026-09-27

### System
- **`template.json` removed; document types are declared in `system.json`.** Foundry v14 deprecated `template.json` (package warning on every start, support ends in V16). The same 5 Actor and 12 Item types now live under `documentTypes` in the manifest. The old file only listed the types with empty bodies; all fields already come from the data models in `module/data/`, so existing actors, items and compendia are unchanged. Needs a Foundry server restart to pick up the new manifest.

## 1.0.25-beta — 2026-09-27

Fixes from the pre-play system audit.

### Fixes
- **Active Effects no longer bake into Fatigue.** The 5-round combat Fatigue tick and every Invocation / Spell / Psionic roll added onto the *prepared* Fatigue, which already contains Active Effects (hangover, disease, poison +N; a stimulant's override 0). The effect was written into the stored base and stayed after it expired (or real Fatigue was wiped under a stimulant). All four now add onto the stored value via a shared `addFatigue` (`dice.mjs`, `combat.mjs`).
- **Weapon Clash / armor wear across owners.** An exchange resolves on the client that clicked the defense; a player blocking an NPC's attack could not mark the NPC's weapon broken (or wear an NPC shield) and the clash card never posted, and a player's Counterstrike silently skipped the NPC's armor wear. Such updates are now relayed to the active GM through a user query (`scarmark.updateCombatItem`, limited to `system.broken` / `system.quality` on weapon/armor items). Needs a GM online; otherwise a warning.
- **Invocations and Spells find their skill.** Matching is case-insensitive, and when the stored Religion / Magic Type doesn't match (common invocations set to "All", an empty field, an old spelling) the actor's only Religion / Magic skill is used; with several, a dialog asks which. The Esoterics tab shows the resolved skill and its ESL (`findEsotericSkill`, `dice.mjs`).
- **Not enough Faith Points:** invoking with fewer FP than the Circle now asks for confirmation instead of silently flooring FP at 0 (Pious Acts can still be performed at 0 FP).
- **Mend Roll target capped at 95** like every other d100 test (Endurance × Mend ≥ 100 could not fail).
- **Poisonings compendium was empty.** Its content (8 lingering poisons) lived in the unregistered `packs/poisons`; the compendium now points there (`system.json`). The empty `packs/poisonings` folder is unused and can be deleted.
- Missing label `SCARMARK.ArmorLocation.new` (a new Armor Location was named after the i18n key).

### Rules
- **Spells follow the Arcane Rules.** Level penalty is −5 per Level **above 1** (L1 −0 … L6 −25, was Level × 5), shared by the cast roll and the Esoterics tab (`SCARMARK.spellLevelPenalty`). Fatigue: **CS / S 0, F +1, CF +2** (was MS +1 / MF +2 / CF +3). The card reminds of the −1 rune charge on F/CF and of Misfire + Aura test on CF.
- **Outnumbered is fixed:** Outnumbered by 2 = **−20**, by 3 (or more) = **−30** on all defenses (was −10 per extra attacker).
- **Stunned = defense −30.** New generic mod `system.mods.defense` lowers every defense roll (Block, Dodge, Counterstrike; melee and missile), also offered in the effect-key picker. Stunned now uses only this; before it lowered Block but not Dodge (DODGE is a Combat skill) or Counterstrike, and wrongly took −30 off all Physical skills. Tokens already Stunned keep the old values until the status is toggled off and on.

## 1.0.24-beta — 2026-09-26

### Sheets
- **Item Description editors now fill the whole sheet and grow/shrink with it.** On Gear, Skill, Psionic, Trait, Spell and Invocation sheets the Description editor (and the Psionic Misfire) takes all the height left in the window, instead of staying a fixed 150px box with empty space below. Two editors on one page (Psionic) split the space evenly. The editor keeps a 150px minimum, so a very short window scrolls instead of crushing it. One generic flex rule covers every item sheet, replacing the old Spell/Invocation-only one (`scarmark.css`); all other spacing is unchanged.
- **Default sheet heights raised so the editor fits on open:** Gear 460 → 660, Psionic 680 → 760, Spell and Invocation 480 → 520.

## 1.0.23-beta — 2026-09-26

### Sheets
- **Prototype Token button in the actor sheet header.** The (Prototype) Token control is now a one-click icon next to the ⋮ menu on every actor sheet (`_renderFrame`, `actor-sheet-base.mjs`). It reuses core's own header control, so it opens Prototype Token on a world actor and Configure Token on an unlinked token's actor; owners only. The ⋮ menu entry stays.

## 1.0.22-beta — 2026-09-26

### Fixes
- **Actor sheets (Character / NPC / Creature) failed to open since 1.0.20: the real cause.** `#prepareCombat` read the stored Fatigue through `src`, a local variable of `_prepareContext` that is out of scope there, so every actor with a combat block threw a `ReferenceError` while rendering (Container actors skip that block and still opened). It now reads `this.document._source` directly (`actor-sheet-base.mjs`). The 1.0.21 rename stays as a harmless cleanup.

## 1.0.21-beta — 2026-09-26

### Fixes
- **Actor sheets failed to open after 1.0.20.** The stored-value context was published as `context.source`, overwriting the key core DocumentSheetV2 sets to the full `_source` and relies on. Renamed to `context.sourceSystem` (`actor-sheet-base.mjs`, `header.hbs`).

## 1.0.20-beta — 2026-09-26

### Fixes
- **Active Effects no longer stack onto attributes every time any sheet field is edited.** The attribute base inputs (and Fatigue, Move) rendered the *prepared* value, i.e. already raised by Active Effects (race traits, potions...). Because the sheet submits the whole form on any change, editing one field (e.g. Comeliness) wrote every effect-boosted value back as the new stored base, so the effect was applied again on top: +1/+2 creep on all affected attributes with each edit. Editable inputs now show the stored `_source` value; effective totals are unchanged on display (`actor-sheet-base.mjs`, `header.hbs`, `combat.hbs`; covers Character, NPC and Creature sheets).
- **Existing actors are not auto-repaired:** actors edited before this fix may already carry inflated attribute bases. The base input now shows the real stored value next to the effective one, so correct it by hand.

## 1.0.19-beta — 2026-09-26

### Sheets
- **Every effect on the actor Effects tab now has a delete button**, including effects transferred from an owned item (race traits, gear). Those ask for confirmation first, since deleting strips the effect from that item on this actor (the compendium original is untouched). The source column now shows the item's name instead of "None" for item-transferred effects (`effects.hbs`, `actor-sheet-base.mjs`).

## 1.0.18-beta — 2026-09-25

### Sheets
- **Impact is now in the Active Effect key picker** (Combat group, `effects.mjs`), so `system.mods.impact` no longer has to be typed by hand. The key already existed in `SCARMARK.effectKeys` but was missing from the dropdown list.

## 1.0.17-beta — 2026-09-25

### Fixes
- **Impact modifier (`system.mods.impact`) now applies only to Close Combat and Unarmed Combat strikes.** It was added to every damage strike the actor dealt, including Ranged Combat missiles (bows, crossbows). The bonus now follows the striking weapon's `associatedSkill` (`IMPACT_SKILLS`, `combat.mjs`): melee attacks, counterstrikes and thrown missiles that roll Close Combat keep it; Ranged and Arcane Combat get none. The automatic limb strike after a body-part clash follows the striker's weapon (none when a missile was blocked). Range attack cards posted before this update carry no skill and resolve without the bonus.

## 1.0.16-beta — 2026-09-25

### Sheets
- **Drag-to-sort items.** Every item list on the actor sheets (Gear, Weapons, Missiles, Armor, Runes, container contents, Skills per category, Spells, Invocations, Psionics, Traits, Combat tables) can be re-ordered by dragging a row with the left mouse button onto another row of the same list; a red line shows whether it lands above or below. The order is stored in the item's `sort` and all lists now render by it (`_onSortItem`, `actor-sheet-base.mjs`). Dragging an item inside a container no longer drags the whole container.
- **Journal fills the whole tab** and grows/shrinks with the resized sheet (`scarmark.css`).

### Fixes
- **Effects tab: clicking an effect transferred from an item (e.g. a racial trait) now opens it.** The edit action only looked at the actor's own effects; it now uses the same lookup as toggle/delete (actor + owned items).

## 1.0.15-beta — 2026-09-25

### Fixes
- **Weapon Clash no longer fires on an attack that never landed.** The WQ check ran on *any* successful block, even when the attacker had failed (e.g. a Critical Failure / Missile Gone Wild still made the defender's shield test and could break it). It now runs only on a true **Block result**: a successful attack stopped by a block of the **same** success level (MS/MS or CS/CS) (`isBlockResult`, `combat.mjs`). A failed attack never reaches the guard, an attack that beats the block goes through, and a CS block against an MS attack is a clean parry. Applies to melee and to missiles blocked by a shield (the impact ≥ 5 gate stays). This also removes the contradictory double Tactical Advantage (defender's DTA + attacker's "opponent's weapon broke" TA) on one card pair.

### Rules
- **Weapon Clash rebalanced.** The 3d6 WQ test now destroys only on **3d6 ≥ WQ + 4** (`WQ_BREAK_MARGIN`, was 3d6 > WQ). Weapons still take no partial damage (D.'s 2026-08-11 rule); a **shield** now wears (**WQ −1**, never below 1) only when the roll **exceeds its WQ**, instead of on every block it survives. Lower-WQ item still tests first; a destruction still stops the cascade and grants the opponent a TA. Per-clash destruction chance: WQ 9 26 % · 10 16 % · 11 9 % · 12 5 % · 13 2 % · 14 0.5 % · 15+ never. Simulated exchanges until the first destruction (ASL/DSL 50/50 · 70/60 · 85/75), before → after: Sword II 12 vs Round Shield 10 **3 → 20 · 2.5 → 12 · 2 → 8**; Sword II vs Sword II **4.5 → 63 · 3.7 → 38 · 2.9 → 25**; Club 9 vs Sword I **2.6 → 17 · 2.2 → 11 · 1.7 → 7**; Longsword III 14 vs Kite Shield 12 **4.6 → 48 · 3.8 → 29 · 3 → 19**. Clashes also happen on only 17–44 % of attacks (was 50–75 %). Shields are the sacrificial part, cheap weapons still break noticeably sooner.
- **Counterstrike trades blows on a tie.** On an equal success level (MS/MS, CS/CS) **both** sides now strike; before, only the defender did, which made Counterstrike strictly better than Block for almost every weapon (Attack ≥ Defense).

## 1.0.14-beta — 2026-09-24

### Fixes
- **SmallTime date now matches Simple Calendar Reborn.** SmallTime reads the core `game.time.calendar`, whose default Simplified Gregorian config (`leapStart: 8`) decomposes world time with leap cycles starting at year 7, so 1408 came out as a non-leap year and the date ran 2 days ahead of Simple Calendar (leap years 0, 4, 8 …). The system now sets `CONFIG.time.worldCalendarConfig.years.leapYear.leapStart = 0` at init (`scarmark.mjs`), which is self-consistent in core and identical to SC's leap rule. Keep Simple Calendar's Leap Year rule at Custom / every 4 / Starting Year 0.

## 1.0.13-beta — 2026-09-22

### Rules
- **Burden is now halved at source and no longer touches the senses.** The attribute/skill penalty model was reworked so armour and load stop crippling raw physique, while the shown Burden stays a clean, 1:1 number (`config.mjs`, `base-actor-schema.mjs`, `dice.mjs`):
  - **Burden is halved at source**: the full physical strain (Fatigue + Heavy Bleeding + WL + Encumbrance + up + pp) is divided by **2** (`floor`, `SCARMARK.BURDEN_DIVISOR`) before it becomes the stored `system.burden`. **The number shown on the sheet IS the penalty**, applied **1:1** to both attributes and skills — no more "shows 4, subtracts 2" split. A knight in basic kit (raw load **4**) now shows **Burden 2** and loses **-2 STR / -2 skill**, not 4.
  - **Only STR / STA / DEX / AGL** are burden-attributes (`SCARMARK.burdenAttributes`). **EYE / HRG / SML / VOI** were removed from the Burden line and fall through to the **MENTAL** penalty (Fatigue + Heavy Bleeding) — a heavy pack or a wound no longer lowers eyesight, hearing, smell or voice; only exhaustion/bleeding still dulls them.
  - **Shock Roll is unchanged.** It no longer derives from `Burden − Encumbrance` (which the halving would have broken); it reads a new `system.shockStrain` = Fatigue + Heavy Bleeding + WL + up + pp (full value, no load, no halving) — identical dice to before.
  - No data migration needed (all derived at prepare time). Tune with `SCARMARK.BURDEN_DIVISOR` (2 = half, 1 = old full-Burden behaviour, 3 = a third).

## 1.0.12-beta — 2026-09-22

### Rules
- **Combat Fatigue now ticks every 5 rounds instead of every 3.** The auto-Fatigue sweep (`applyCombatRoundFatigue`, wired to `updateCombat`) gives each non-defeated combatant +1 Fatigue when the tracker advances into a round that is a multiple of `FATIGUE_ROUND_INTERVAL` — raised from **3** to **5** (`combat.mjs`), so prolonged fights wear combatants down more slowly (+1 at rounds 5, 10, 15 …). No data migration needed.

## 1.0.11-beta — 2026-09-22

### Content
- **New "Scarmark Journal" compendium** (`packs/journal`, type `JournalEntry`) — a home for the system's lore, rules and reference journal entries. Registered in `system.json`; Foundry initialises the empty LevelDB pack on the next world load (reload with F5 after updating), then journal entries can be dropped into it.

## 1.0.10-beta — 2026-09-21

### Content
- **New "Scarmark Merchants" compendium** (`packs/merchants`, type `Actor`) — a home for merchant / lootable container actors (trade & loot). Registered in `system.json`; Foundry initialises the empty LevelDB pack on the next world load (reload with F5 after updating), then merchant actors can be dropped into it.

## 1.0.9-beta — 2026-09-21

### Content
- **New "Scarmark Actors" compendium** (`packs/actors`, type `Actor`) — a home for the system's prebuilt actors (NPCs, creatures, animals, and future imports). Registered in `system.json`; Foundry initialises the empty LevelDB pack on the next world load (reload with F5 after updating), then actors can be dropped into it.

## 1.0.8-beta — 2026-09-18

### Rules
- **Mastery cap: ESL ≥ 100 rolls as 95.** Every d100 success test now caps its target (ESL/EML, after all modifiers) at **95** (`SCARMARK.ESL_CAP`), so even a master with an effective level of 100+ keeps a **5% failure chance** (rolls 96–00), of which **1% is a Critical Failure** (a rolled 00). Previously such a character could not fail at all — a rolled 00 even read as a Critical *Success*. Applied at each target's computation (new `capTarget` helper in `chat.mjs`) so the same capped value drives both the outcome and the chat card ("Target: 95"). Covers **skill, attribute, invocation, spell and psionic tests** (`dice.mjs`) and **melee/missile attack, defense (dodge/block/counterstrike) and Fumble/Stumble** (`combat.mjs`). Non-d100 tests are untouched: the **Shock Roll** (Nd6 vs Endurance) never caps. The **Mend Rate Roll** (d100 vs Endurance × Mend) is deliberately left uncapped for now — pending a call on whether healing should also keep a guaranteed-failure margin.

## 1.0.7-beta — 2026-09-18

### UI / Theming
- **Spell & Invocation sheets grow their Description editor.** These single-page esoteric sheets now lay out as a full-height flex column, so the **Description** (ProseMirror) editor expands to fill the window when you enlarge/stretch the sheet instead of staying a fixed, cramped size — and shrinks back with its own internal scroll on a small sheet. The Note/text inputs also take the full sheet width. Scoped to `.invocation-body` (worn by both the spell and invocation bodies) in `css/scarmark.css`; the editor's internals stay core-Foundry styled (only its flex height is set, avoiding the visibility/editing breakage past direct height styling caused). Reload Foundry (F5) after updating.

## 1.0.6-beta — 2026-09-17

### Content
- **New "Arcane" compendium** (`packs/arcane`, type `Item`) — the magic-school counterpart to **Invocations**, holding `spell` items whose **Magic Type** is the Arcane convocation. Registered in `system.json`; Foundry initialises the empty pack on the next world load (reload with F5 after updating), then Arcane spells can be added to it.

## 1.0.5-beta — 2026-09-17

### Combat
- **Armor Piercing (Bodkin) by name.** A weapon or missile whose name matches `SCARMARK.armorPiercingNames` (`/bodkin/i`) now **halves the struck location's Point (piercing) armor** on a piercing strike — no per-item flag, so "Bodkin Arrow", "Bodkin Bolt" and any future Bodkin item work automatically. Threaded from attack declaration through `postStrike` (melee, missile, and counterstrike); the strike card marks it "− N (AP)". Extend the regex to add more AP keywords.
- **"Missile Gone Wild" on a ranged critical failure.** A CF on a ranged attack now posts a flavour line on the result card. Placeholder for now — a mechanical consequence (RollTable) is still to be designed.

## 1.0.4-beta — 2026-09-17

### Combat
- **Armor durability (AQ) wear, with a 50/50 gate.** A strike that lands on an armored location now runs a **50 % system roll** to decide whether the armor takes wear; on a hit, the **highest-layer covering piece with AQ ≥ 1 loses 1 AQ** (down to 0 = destroyed). The coin-flip means not every blow ruins gear, so players aren't perpetually repairing. Natural armor (AQ −1) and already-destroyed pieces (AQ 0) never wear, and a **destroyed piece (AQ 0) no longer provides protection** — both in combat resolution and on the Combat-tab Armor Locations table. Wear applies wherever a blow lands on armor (weapon strike, counterstrike, creature paw, and the Injury Roll), and the outcome is shown on the strike card ("Armor wear: … AQ 12 → 11" / "Armor holds (no wear)"). Implemented in the shared `wearArmor` + `armorProtection` (combat.mjs); only the owner/GM client applies the wear.

## 1.0.3-beta — 2026-09-17

### Combat
- **Injury Roll (non-combat damage).** The Combat tab's **Injury** entry is now a live button (was a dead placeholder). It opens a dialog for **Aspect + Total Damage + Location zone (High / Mid / Low)**, rolls a struck Armor Location weighted for that zone, subtracts the location's armor for the aspect, and resolves the wound through the same pipeline as a weapon strike — a strike card with **Add Wound** (and any forced Fumble/Stumble). Use it for traps, falls, or any damage a GM rules outside the attack flow. `rollStrikeLocation` gained a zone argument; the shared wound/card logic was factored into `resolveWound` (used by both `postStrike` and the new `rollInjury`).

## 1.0.2-beta — 2026-09-17

### Combat / Statuses
- **Custom status effects with real mechanics.** Five Scarmark conditions are now registered as toggleable token statuses that carry Active-Effect `changes` into the `system.mods.*` pipeline (`module/helpers/statuses.mjs`): **Prone** (skills −20; melee-vs-you +20; missile-vs-you −20), **Grappled** (skills −20), **Pinned Down** (skills −30; melee-vs-you +30; missile-vs-you −30), **Entangled** (skills −30), **Stunned** (defense −30, i.e. Block + Dodge). "Skills" = Combat + Physical + the three Esoteric categories; lowering Combat skills covers both ASL and DSL. Prone/Stun reuse (override) core Foundry's `prone`/`stun` ids; Grappled/Pinned Down/Entangled are new. Movement-halving (Prone/Entangled) and "lose your action" (Stunned) stay table rulings — Foundry can't gate token movement/turns on an effect. Blinded/Burning/Unconscious/Restrained/In Cover remain core / case-by-case.
- **"Attacks against a prone/pinned target" is automated.** Two new mod keys, `system.mods.incomingMelee` / `system.mods.incomingMissile`, are read at attack-declaration time and folded into the attacker's ASL (shown as "vs status ±N" on the attack card). Added to `buildMods()` and the effect-key picker.
- **Fumble / Stumble tests fire from the hit location.** When a strike **wounds** (WL > 0) a weapon-arm joint (Hand / Forearm / Elbow) the strike card offers a **Fumble Test** (DEX ×5); a wound to a leg joint (Foot / Calf / Knee / Thigh) offers a **Stumble Test** (AGL ×5). The victim's owner rolls from the card: a failed **Stumble** auto-applies **Prone**; a failed **Fumble** flags a possible weapon-drop (left to player + GM, per the rules — no auto-disarm). Trigger locations are `SCARMARK.fumbleTestLocations` / `stumbleTestLocations` (deliberately narrower than the existing `risk.fumble/stumble` targeting-bias flags). Fully-armour-stopped hits (WL 0) do not trigger a test.

## 1.0.1-beta — 2026-09-17

### UI / Theming
- **Light theme support for all Scarmark sheets and cards.** Previously every colour in `css/scarmark.css` was a hard-coded dark value, so switching Foundry's UI **Color Scheme** to *Light* left sheets unreadable (dark text on the still-dark sheet background, mismatched native controls). The whole stylesheet was refactored onto a set of semantic `--sm-*` CSS variables with two palettes: the original **dark** palette (unchanged values, now the default/fallback) and a new **light** parchment palette (warm off-white surfaces, near-black text, deepened red/amber/green/blue accents so they stay legible on light). The palette follows Foundry's theme automatically — it keys off the `theme-light` / `theme-dark` classes Foundry v13+ puts on `<html>` and each application window, so Scarmark now tracks whatever you pick in **Settings → Color Scheme** (interface *and* per-window), and a window explicitly kept dark while the interface is light stays dark. No markup or template changes; reload Foundry (F5) after updating.

## 1.0.0-beta — 2026-09-16 — First Beta

First public **Beta**, promoted from the local build for live playtesting with players. It bundles the complete local system as one release (everything through 0.5.20 below) plus the pre-Beta polish listed here. The game server (Molten) receives builds by **manual upload from the development PC** after local testing; the PC install stays the development playground.

### Combat
- **Actionable ATA / DTA (Tactical Advantage).** A Tactical Advantage now posts an **Initiate Attacker's / Defender's Tactical Advantage** button on the result card; the winning side selects its token, targets the foe, and clicks to launch a classic attack. New rule: a **Critical** creates a TA (Critical Success for its own side, Critical Failure for the opponent); **matching** criticals on both sides cancel (CS vs CS and CF vs CF yield nothing), while a **CS vs CF** still awards the TA to the favoured side. TA is now also evaluated when the defender chose **Ignore**.

## 0.5.20 — 2026-09-13

### Combat
- **Auto Fatigue over time (`applyCombatRoundFatigue`).** Every 3rd combat round (round 3, 6, 9 …), each non-defeated combatant that has a Fatigue resource automatically gains **+1 Fatigue** — the "Cena boje" rule (1 round ≈ 1 minute → +1 Fatigue per 3 rounds). Wired to the `updateCombat` hook; runs only on the single active GM (fires once, not once per client), guards with a per-combat `lastFatigueRound` flag so stepping a round back and forth never double-applies, resolves each combatant via `combatant.actor` (so **unlinked NPC tokens** work) and dedupes a linked actor shared by two combatants. Stat-less actors (Container) and defeated combatants are skipped. Posts a public chat note listing who tired. Cadence is the constant `FATIGUE_ROUND_INTERVAL` in `module/helpers/combat.mjs`.

## 0.5.19 — 2026-09-08

### Gear / Artifacts (Runes)
- **New "Rune" flag on gear** (`system.rune`) — a checkbox next to Artifact on the Gear item sheet. When checked, the item lists in a dedicated **Runes** section on the Character/Creature Gear tab (between Missiles and Armor) instead of general Gear. Runes stay `gear` items, usually also artifacts carrying charges. The Runes section's **+Add** (`addRune`) creates a rune-flagged, artifact-active gear item pre-set to 3 charges.
- **Quick-edit Charges on the Gear tab.** Artifact items (Gear, Runes, Weapons) show an editable **Charges** field inline that writes straight to `system.artifact.charges`. Charge spend stays **manual** (no auto-decrement); which rune binds to which spell is tracked by hand (rename the rune / use Notes).
- **Gear item sheet tidy:** Description moved to the bottom (after the artifact fields); the artifact **Ego/Will** field relabelled **Ego**.

## 0.5.18 — 2026-08-29

### Effects / Combat
- **New "Impact" effect key** (`system.mods.impact`). An Active Effect can now add (or subtract) flat damage **Impact** to all of an actor's strikes — used by racial Traits (e.g. Red Elf Blood Frenzy +1, Halfling −1), potions that boost Impact, and later Invocations/Magic. `buildMods()` gains an `impact` accumulator; the melee/missile auto-combat `postStrike` adds the attacker's `mods.impact` into effImpact (shown on the strike card, e.g. `Edge 5+1 + 4 − 3`), and the manual "Other Weapon Damage" dialog pre-fills its additional-impact field with it. Added to the effect change-key picker and `SCARMARK.effectKeys`.

## 0.5.17 — 2026-08-28

### Content
- **Removed the Documents and Food and Drinks compendia** (`packs/documents`, `packs/food-and-drinks`) — their content was folded into the Gear compendium. Unregistered from `system.json` and the pack folders deleted. Reload Foundry after updating.

## 0.5.16 — 2026-08-28

### Content
- **Four new empty compendia:** **Gear** (`packs/gear`, Item), **Gear (Funny & Useless)** (`packs/gear-funny`, Item) for the goblin junk, **Services** (`packs/services`, Item), and **Scarmark Scenes** (`packs/scenes`, **Scene**). They ship empty; populated by hand from world content (gear/goblin items via `import_gear_equipment_macro.js`, services via `import_gear_services_macro.js`; scenes built in Foundry). Reload Foundry after updating so the new packs register.

## 0.5.15 — 2026-08-27

### Content
- **New empty Item compendium: Alchemy** (`packs/alchemy`). Populated by hand from world Items created by `import_gear_herbs_macro.js`, a one-shot importer generated from the Gear.xlsx "Herbs" tab (40 items: crafting reagents, signature/poison herbs, exotic spices, tea/coffee/cocoa raw goods, Herbalist Kit, and the recreational smokeables). Reagents import as plain `gear`; **Tabacco (common/luxury) and Weed** are consumable gear with an embedded Active Effect (Apply-to-Actor OFF); their Effect strings parse to the full mods key set (attributes, `system.mods.skills.<category>`, `system.mods.injury`, `system.mods.skill.<Name>` — so Weed's "Arcane +10" targets the Arcane skill). Narrative-only effects (Magic Mushrooms) keep their text in the description with no Active Effect. All items land in one "Alchemy" folder to sub-folder inside the compendium. Reload Foundry after updating so the new pack registers.

## 0.5.14 — 2026-08-27

### Content
- **New empty Item compendium: Food and Drinks** (`packs/food-and-drinks`). Populated by hand from world Items created by `import_gear_food_macro.js`, a one-shot importer generated from the Gear.xlsx "Food and Drinks" tab (25 items: alcohol, wine, coffee/tea/chocolate, food, rations, fodder). Rows with an Effect become **consumable `gear` items with an embedded Active Effect** (Apply-to-Actor OFF, so it only triggers on Consume); the effect's changes are parsed from the sheet's Effect/Duration columns using the alcohol-macro key conventions (attributes, `system.mods.skill.<Name>`, `system.resources.fatigue`). All items land in one "Food and Drinks" folder for you to sub-folder inside the compendium. Reload Foundry after updating so the new pack registers.

## 0.5.13 — 2026-08-27

### Content
- **Three new empty Item compendia: Currencies, Documents, Valuables** (`packs/currencies`, `packs/documents`, `packs/valuables`). They ship empty; content is imported by hand from world Items. The world Items are created by `import_gear_currency_macro.js`, a one-shot importer generated from the Gear.xlsx "Currency and Valuables" tab (coins, gems, metals, documents, timekeeping/navigation, holy items). Container-noted rows (Scroll Case, Map Case, Reliquary) are created as `container` items; the rest as `gear`. Reload Foundry after updating so the new packs register.

## 0.5.12 — 2026-08-23

### Injuries
- **Mend Rate Roll.** The Mend value is now clickable — on the actor Combat-tab injuries list and on the injury item sheet (a d20 icon next to Mend Rate). It rolls d100 vs a **fixed target = Endurance × current Mend Rate**, with a dialog offering only a situational **Modifier**. Outcome adjusts Wound Level: **CS −2, MS −1, MF 0, CF +1**; when WL reaches 0 the wound is **healed** (item removed) and a chat card reports the result. MRN (Mend 0) is narrative and does not roll. `rollMendRate` in dice.mjs; wired as the `rollMend` action on both sheets.

## 0.5.11 — 2026-08-23

### Content
- **New system compendium: Poisonings** (`packs/poisonings`, Item type) for the lingering (Injury-type) poisons. Combat poisons ship as short round-duration Active Effects in the existing Effects compendium. Populated from `Scarmark_Vitality Skill.xlsx` (Poisons sheet) via `import_poisons_macro.js`. Reload Foundry after updating so the new pack registers.

## 0.5.10 — 2026-08-23

### Content
- **New system compendium: Diseases** (`packs/diseases`, Item type). Holds the disease afflictions as classic Injury items (Wound Level + Mend Rate) carrying an embedded symptom Active Effect. Populated from `Scarmark_Vitality Skill.xlsx` (Diseases sheet) via `import_diseases_macro.js`, which now writes straight into the compendium. Reload Foundry after updating so the new pack registers.

## 0.5.9 — 2026-08-22

### Penalty system (reworked)
- **Replaced UP/PP with a Fatigue / WL / Burden model** that is easier for players to read and splits penalties by source. The sheet header now shows three auto-filled fields — **Fatigue**, **WL** (total Wound Level) and **Burden** (Fatigue + WL + Encumbrance + Heavy Bleeding) — instead of Strain/Burden (UP/PP).
- **New penalty semantics:** Fatigue affects both physical and psychical; **WL** (injury) and **Encumbrance** affect only physical; **Heavy Bleeding** now behaves like Fatigue (hits both mind and body). This lets some injuries (e.g. poisonings) also carry Fatigue to add a mental component.
  - **Physical attributes** (STR, STA, DEX, AGL, EYE, HRG, SML, **VOI**) → reduced by Burden.
  - **Psychical attributes** (INT, AUR, WIL) → reduced by the mental penalty (Fatigue + Heavy Bleeding).
  - **COM and MOR are now exempt** from all injury/fatigue penalties (attractiveness and morality don't degrade with wounds).
  - **Physical & Combat skills** → Burden; all other skill classes (incl. psionic) → mental penalty. Applied at ×1 (`SCARMARK.PENALTY_PER_LEVEL`; the traditional ×5 kept out to preserve combat balance). This also removes the old double-count bug (skills previously subtracted UP+PP).
- **Shock Roll** now rolls (Fatigue + Heavy Bleeding + WL)d6 vs Endurance (Burden minus Encumbrance — load never causes shock).
- Effect keys relabelled: `system.mods.injury` = Injury Level/WL (physical only), `system.mods.up` = Strain (mental + physical), `system.mods.pp` = Burden (physical only).

## 0.5.8 — 2026-08-22

### Effects
- **New "Injury Level" effect key** (`system.mods.injury`). An Active Effect can now add simulated Injury Levels that feed the Injury total and Universal Penalty exactly like a real wound — but, being an effect, they clear when the effect expires and take **no Mend Roll**. Intended for wound-like conditions that resolve on their own (e.g. self-clearing poisons). Added to the effect change-key picker (Penalties / Resources group) and to `SCARMARK.effectKeys`; `buildMods()` gains an `injury` accumulator and `applyDerivedCombat` folds it into the Injury total.

## 0.5.7 — 2026-08-22

### Injuries
- **Mend Rate is now a dropdown (1–6 or MRN).** The injury Details tab replaces the free-number Mend Rate input with a select: **1–6** = Healing Rate H1..H6 (a Healing Roll every 5 days reduces Injury Levels), and **MRN** ("Mend Rate: Narrative", stored as 0) = no mechanical Healing Roll, recovery adjudicated by the GM (fresh untreated wounds, trivial scratches, instant potion/miracle heals). Added `SCARMARK.mendRates` / `SCARMARK.mendLabel` and a derived `mendLabel`; `system.mend` is now capped at 6.

## 0.5.6 — 2026-08-17

### Injuries
- **Injury items gained an Effects tab.** The injury sheet is now a two-tab sheet (Details + Effects) instead of a single panel, so poisons, infections and diseases can ride an injury as Active Effects (e.g. a poison wound carrying a VITALITY penalty, a disease carrying attribute penalties). The Details tab keeps the lean Wound Level / Severity / Mend Rate / Heavy Bleeding / Note layout.

## 0.5.5 — 2026-08-17

### Skills
- **Attribute → Skill ESL propagation**: a change to an attribute from an Active Effect (attribute potion, injury, buff/debuff) now shifts every dependent skill's ESL by **+5 per point of Skill-Base change**, regardless of trained SL. Computed as `round(SBdelta × 5)` where SBdelta is the current (AE-applied) Skill Base minus the stored/source Skill Base, so only effect-driven attribute changes propagate (permanent attributes cancel out). Applies to skills and psionic talents; weapon ASL/DSL inherit it via their associated combat skill. Makes attribute-boosting potions actually improve the skills they should.

## 0.5.4 — 2026-08-16

### Content
- Adds an empty **Invocations** compendium (Item) for the invocation library.

## 0.5.3 — 2026-08-16

### Esoterics
- **Psionic Misfire**: psionic talents gained a **Misfire** field (edited on the item sheet); on a **Critical Failure** the talent's misfire backlash is posted to the roll's chat card.

### Content
- Registers three more compendia: **Psionic Talents** (Item), **Scarmark Macro** (Macro), **Scarmark Tables** (RollTable).

## 0.5.2 — 2026-08-16

### Esoterics
- **Post-to-chat button** (chat bubble) on the Esoterics tab for Spells, Invocations, and Psionic Talents — whispers the item's Description privately to the GM and the character's owner. Sits after Notes, before Edit/Delete.
- **Editable values on the sheet**: Spell Level, Invocation Circle, and Psionic SL are now inline-editable inputs. Psionic table reordered to **SB · SL · ESL · Fatigue** (Fatigue now follows ESL as the cost).
- New macro **Initiate Psionic Talent** (`game.scarmark.initiatePsionicTalent()`): pick a talent from a dropdown, add a Modifier, and roll it.

## 0.5.1 — 2026-08-16

### Compatibility
- Verified against **Foundry v14 Stable (Build 366)**; no breaking changes required.
- Migrated the last deprecated v13 globals off the shim: `TextEditor.enrichHTML` → `foundry.applications.ux.TextEditor.implementation.enrichHTML` (5 sheets), and `FilePicker` → `foundry.applications.apps.FilePicker.implementation` (portrait picker on actor + item sheets).

## 0.5.0 — 2026-08-15

### Actors
- New **NPC** actor type — a simplified Character (13 attributes + Race, no Journal / Sunsign / date of birth / Birthplace).
- New **Animal** actor type — a Creature variant for four-legged beings (own type for future quadruped Armor Locations).
- New **Container** actor sheet — a stat-less loot chest / stash with a single Contents tab (Gear-tab layout) and an editable Max Capacity.
- **Auto-setup on creation**: new Characters/NPCs/Creatures get the humanoid Armor Location set (26); Animals get the quadruped set (9). Base skills are copied from the Skills compendium per actor type.
- Dragging an item from one actor onto another (or a Container) now **moves** it instead of copying; drops from the world/compendia still copy.

### Combat
- **WQ-check-on-block** (weapon breakage): on a successful block the weapons meet — a body part triggers a #2 blunt self-strike (clean parry on a CS), real weapons test 3d6 vs WQ (lower first), a surviving shield wears down, a broken weapon hands its opponent a Tactical Advantage.
- Weapons gained an **Is Shield** flag and a **Broken** state (broken weapons are filtered from combat choices).

### Active Effects
- **Effect modifier engine** (`system.mods.*`): effects can now drive derived stats — Melee/Missile Attack, Melee Defense, per-category and per-skill EML, UP/PP, Encumbrance, Endurance, Outnumbered — plus Fatigue and Attributes on their base fields.
- A **key picker** dropdown in the Active Effect config (mod keys / attributes / skills), so keys need not be typed.
- **Consumables**: gear can be flagged consumable and gets a Consume button (Gear + Containers tabs) that applies its effects to the actor and spends one unit; timed effects expire and are removed automatically.
- Item effects transferred to an actor now show on the actor's Effects tab; a new **Effects** compendium (v14 ActiveEffect pack) provides a GM reserve of pre-made effects.

### Content & System
- Ships **Weapons**, **Armor**, and **Armor Locations** compendia with the system.
- Standardised sheet checkbox styling.
- Minimum Foundry compatibility raised to **v14**.
