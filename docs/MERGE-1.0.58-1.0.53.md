# Merge record: 1.0.58-beta (architecture) + 1.0.53-beta (game content) = 1.0.59-beta

Branch `merge-1.0.58`, 2026-11-21. Nothing is committed on `main`; the owner's backups (`Scarmark_backup_*`) and the co-author's folder `scarmark-test-main` are untouched.

## Rule of the merge

- 1.0.58-beta (co-author's test fork) is the foundation: file layout, modularity, tests, docs, integrations, technical architecture.
- 1.0.53-beta (owner) is the source of truth for game rules, mechanics, data, compendiums, items, actors, settings, terminology and artwork.
- Conflict in game behavior: 1.0.53 wins. Conflict in implementation structure: 1.0.58 wins. Everything that only one side did is kept.

## Common ancestor

Commit `96d6322` (1.0.49-beta, 2026-11-03). Both lines then used the numbers 1.0.50 to 1.0.53 for different work (see CHANGELOG.md, where the owner's entries are marked "owner line").

## What each side changed since the ancestor

Owner (1.0.50 to 1.0.53), 29 files outside the packs: Specialization box on Character and NPC; three skill categories (Skill, Combat, Esoterics with a Kind Arcane or Religion); category Active Effect keys; status penalties only on Combat, Esoterics and psionic; reduced default skills of new actors; the fixed skill penalty (5 ESL per fatigue, load and wound point) replacing the Base-delta; missile specialization; four one-shot macros (`reduce-skills.js`, `migrate-skill-categories.js`, `remove-boots.js`, `reweigh-plate-arms.js`); the reworked compendiums.

Co-author (1.0.50 to 1.0.58), about 110 files changed and 35 added: the whole refactor into `config/`, `rules/`, `view/`, `foundry/`, `helpers/dice/`, sheet actions and partials; the patch macros moved into the system; the test suite, lint and cycle check; docs; Czech fallback; item tooltip; accessibility; bug fixes; called shots; armor sides and per-location condition; toxicity; effect library.

## Decisions

| # | Element | Decision | Why |
|---|---|---|---|
| 1 | Folder layout, all modules, sheets, templates, CSS, tests, docs | 1.0.58 as it is | architecture rule |
| 2 | System id | `scarmark` (the test fork used `scarmark-test`) | worlds, flags, pack ids and macros of the owner use `scarmark`; `SYSTEM_ID` in `module/constants.mjs` drives every derived id, so one constant plus the literal strings in `system.json`, templates, the migration macros and the test snapshots changed |
| 3 | `system.json` | 1.0.58 manifest, id `scarmark`, title "Scarmark", url/manifest/download of `Ermine09/Scarmark`, Czech language kept, version 1.0.59-beta | owner's repository identity, co-author's manifest content (identical pack list) |
| 4 | Skill categories (Skill / Combat / Esoterics + `esotericKind`) | ported into the new files: `config/vocab.mjs` (`SKILL_CATEGORIES`, `ESOTERIC_KINDS`, `LEGACY_SKILL_CATEGORIES`), `data/item-skill.mjs`, `data/migrations.mjs` (`migrateSkillCategory`), `view/actor-view.mjs`, `sheets/actor-sheet-base.mjs` and `actor-creature-sheet.mjs` (`showSkill`), `sheets/actions/profile.mjs`, `sheets/item-esoteric-sheet.mjs` (`skillKind`), `helpers/dice/esoterics.mjs`, `view/esoterics-stats.mjs`, templates, lang | game content of 1.0.53 |
| 5 | Fixed skill penalty replacing the Base-delta | `config/penalties.mjs` `SKILL_PENALTY_PER_POINT`, `rules/derived.mjs` `skillPenaltyOf` and `skillEslOf`, applied in `data/base-actor-schema.mjs`; `system.skillPenalty` kept; `SCARMARK.SKILL_PENALTY_PER_POINT` exposed. `skillBaseDeltaBonus`, `skillDeltaBonusOf` and `SB_DELTA_ESL_PER_POINT` removed | game behavior of 1.0.53 |
| 6 | Legacy category effect keys | still honoured: `skillCategoryMod` takes the largest legacy key once, `buildMods` keeps the old buckets | old Active Effects keep working until `migrate-skill-categories.js` runs |
| 7 | Effect key picker | the two key lists in `config/vocab.mjs` and the lang keys `EffectPicker.skillsSkill`, `skillsEsoterics` (the old five keys are gone from the picker) | the picker is config driven in 1.0.58 |
| 8 | Status penalties | `STATUS_SKILL_CATEGORIES` = combat, esoterics, psionic | owner's 1.0.51 decision, expressed in the co-author's config |
| 9 | New actor default skills | `config/actors.mjs` `BASE_SKILLS` reduced as in 1.0.52 | game content |
| 10 | Specialization (Character, NPC) | schema, template (`unless showSpecialAbilities`, so not on Creature and Animal), CSS, lang | game content; the co-author's tests and render snapshots were extended |
| 11 | Missile specialization | already in 1.0.58 (the co-author took it over from the common base) | nothing to do |
| 12 | Compendiums (`packs/`), artwork, icons | the owner's, byte for byte | 1.0.53 holds the game data |
| 13 | Armor stored the old way (`system.locations`) | 1.0.58 converts it in memory. Merge change: a location with no positive stored condition starts at the piece's durability (`data/item-armor.mjs`, `rules/locations.mjs legacyCoverage` third argument) | as written by the co-author the converted armor had condition 0 and protected nothing until `migrate-armor-conditions.js` ran; in 1.0.53 armor protected fully (location conditions were only a note), so 1.0.53 behavior wins. The macro still writes the data and the original durability |
| 14 | Co-author features that 1.0.53 never had (armor sides and conditions, toxicity, called shots, effect library, item tooltip, Czech, accessibility, bug fixes) | kept as they are | "preserve all existing functionality" |
| 15 | Owner's one-shot macros | `scripts/imports/`: `reduce-skills.js`, `migrate-skill-categories.js`, `remove-boots.js`, `reweigh-plate-arms.js` | they are part of 1.0.53 content and may not have run on every world |
| 16 | The ~20 finished import macros the co-author deleted (`import-*`, `rename-*`, `migrate-hit-locations`, `convert-to-metric` ...) | restored to `scripts/imports/legacy/` | 1.0.53 content: not silently discarded. They predate the rework, are not maintained and may not run on the current data models (for example the Alchemy and race imports build skills and effects that `reduce-skills.js` removed) |
| 17 | Root `AGENTS.md`, `CLAUDE.md`, `.claude/` | the owner's, kept | publishing and project instructions of the owner; the co-author's agent rules live in `docs/AGENTS.md` |
| 18 | `.gitignore` | the co-author's, plus `/e.log` and `/err.log`; the pack runtime files `LOG`, `LOG.old`, `LOCK` are no longer tracked (co-author's rule) | they are rewritten by Foundry on every start |
| 19 | Items the co-author removed because the new architecture replaced them: `helpers/effects.mjs`, `helpers/esoterics-stats.mjs` (now `view/`), `helpers/combat/outcome.mjs`, `creature-profile.hbs`, `placeholder.hbs`, `trait-sheet.hbs`, `item/trait/details.hbs` | stay removed; the owner's edits to `effects.mjs` and `esoterics-stats.mjs` were ported to `config/vocab.mjs` and `view/esoterics-stats.mjs` | architecture rule; nothing of the owner's behavior is lost |
| 20 | Tests | see below | |

## Tests and snapshots

The co-author's rule is never to regenerate the golden, schema or render snapshots to make a comparison pass. Here they changed on purpose, because the merged game rules differ from the ones the snapshots were captured with. Every diff was read and limited to the intended paths before it was written:

- `tests/golden/actor-derived.json`, `compendium-actors-sample.json`, `compendium-items-sample.json`: only `skills[].esl` (no Base-delta, fixed penalty), the new `mods.skills.skill` and `esoterics` buckets, and `derived.category` / `derived.esotericKind`. Recomputed from the stored inputs with the existing adapters (the inputs and case ids are unchanged; the case ids that say "sb-delta" now show that effects on attributes do not move skills). `tests/golden/adapters.mjs` maps the old category names of the hand-written inputs through `migrateSkillCategory`.
- `tests/schema/schemas.json`: `specialization` on Character and NPC; `category` (skill, combat, esoterics) and `esotericKind` on skills.
- `tests/config/scarmark.snapshot.json`: `skillCategories`, the five category effect keys replaced by `skill` and `esoterics`, and `SKILL_PENALTY_PER_POINT`.
- `tests/render/snapshots/*`: the Specialization box, the Esoterics tab label and add button, the skill sheet category select. `tests/render/fixtures.mjs` uses the new category.
- Hand-written tests updated: `derived-rules`, `rules`, `rules-safety`, `statuses`, `location-sides` (armor conversion, decision 13). New: `tests/skill-categories.test.mjs`.
- `tests/lang.test.mjs`: the check for the tooltip keys compared a path with `/`, so it failed on Windows; it now normalizes the separators.

## Missing, conflicting or incompatible, and what is left for the owner

1. **Not run in Foundry.** `npm test` (216 tests: 215 pass, 1 skipped by design), `npm run golden`, `npm run lint` and `npm run check:cycles` pass, templates render in the test harness, and every file named in `system.json` exists. A live check of the world is still to do: follow `docs/SMOKE_TEST.md` and check the Skills tab, the skill sheet (Kind select), the Profile Specialization box, spell and invocation rolls (they find the skill by kind), a creature (no Religion skills), the Effects tab picker and a status toggled from the token HUD.
2. **Skill items of the world.** Old skill items are converted when they load, so nothing breaks before the macros run. Run `scripts/imports/migrate-skill-categories.js` (Report only, then Apply) once to store the new categories, then reload (F5). Run `reduce-skills.js` only if it has not been run on that world yet.
3. **Co-author migrations.** `migrate-armor-conditions.js` and `migrate-toxicity.js` (Report only, then Apply) still need to be run on the world; the armor now works without the first one, see decision 13.
4. **Open findings of the co-author** stay in `docs/OPEN-FINDINGS.md` (container fill, creature vital wounds, GM query trust and the rest); they are not caused by the merge.
5. **Esoterics kind of spells and invocations.** A skill that was Religion or Magic is converted with its kind. A new Esoterics skill starts as Religion; set Arcane on the skill sheet.
6. **Legacy import macros** (decision 16) will not necessarily run against the current data; they are history, not tools.
7. **Czech.** `lang/cs.json` is the co-author's partial fallback (about 33 keys); new owner terms (Specialization, the categories) exist in English only.
8. **Packs were not touched**, so the data of the owner's compendiums is as in 1.0.53, including the effects deleted by `reduce-skills.js` that "will be redone".
9. **Version.** 1.0.59-beta is a new number above both lines; the co-author's separate test version should be rebased on this one.
