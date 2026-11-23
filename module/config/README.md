# module/config

Authoritative game-rule VALUES: pure data, no Foundry globals (no game, CONFIG, Hooks, ui, canvas, foundry), no imports from data/, helpers/, sheets/ or foundry/. A game rule number is not written as a literal anywhere else; the few that still are (dice names, a percent factor, effect priorities) are listed in docs/RULES_INDEX.md, last section. Import from `config/index.mjs`, never from a single file.

| File | Holds |
|---|---|
| index.mjs | the barrel: re-exports every file below (and nothing else) |
| attributes.mjs | the 9 attributes, the attribute key lists per actor family, character-only attributes, legacy attribute map |
| penalties.mjs | fatigue, load and condition steps, ESL cap, endurance and capacity attributes, skill base delta, the percent factor |
| vocab.mjs | choice lists (aspects and their letters, combat skills, categories, sunsigns, months ...), SKILL_MOD_KEY_PREFIX, effect keys and the effect picker groups |
| wounds.mjs | wound level range, vital wounds, mend rates, injury catalog, stun test |
| locations.mjs | the 19 canonical armor locations, injury thresholds, legacy location map, fumble and stumble test locations, LOCATION_SIDES (left, right), SIDED_TYPES (the 9 types that have a left and a right side) and LEGACY_SIDED_KEYS (the old "leftArm" style keys, read only by the armor coverage migration) |
| combat.mjs | outnumbered steps, strike dice, shock factor, armor wear and piercing, AIM (aim zones and the called parts with their penalties), range penalties, clash and round values |
| esoterics.mjs | spell level and invocation circle steps, outcome tables |
| tests.mjs | d100 critical step, test multipliers, shock fallback |
| statuses.mjs | status effect penalties |
| items.mjs | data model limits and defaults (QUALITY_INITIAL, QUALITY_MAX, ARMOR_LAYER_MAX, the Artifact class, Spell level, Spell class and Invocation circle limits, CONTAINER_CAPACITY_INITIAL, SUNSIGN_BONUS_INITIAL, ATTRIBUTE_BASE_INITIAL), the inventory and stack types, FORM_LIMITS (the min and max the templates put on number inputs, built from the limits above), TOXICITY_SKILL (the skill a consumable's toxicity lowers) |
| actions.mjs | the roll-downs of the Actions panel (targets, triggers, kinds) and their keys, the effect types and the keys of item modifiers |
| regions.mjs | the region behavior of the system: when it is set off, who sets it off, how often, and the events it listens to |
| time.mjs | seconds per effect duration unit |
| actors.mjs | the default hit locations and base skills of a new actor, the Dodge and Initiative skill names |
| maneuvers.mjs | the maneuvers and tactics offered by the combat helper dialog (lang keys and action descriptors): UI values, not game rules |
| ui.mjs | click, delay and size constants of the interface: UI values, not game rules |

CONFIG.SCARMARK / game.scarmark.config (module/config.mjs) only assembles these values and the functions of module/rules/ for macros, sheets and templates. Its keys and results are pinned by tests/config.test.mjs; do not regenerate tests/config/scarmark.snapshot.json to make it pass.

Some values are read only by macros through CONFIG.SCARMARK (weaponSkills, injuryTypes, traitCategories, characterOnlyAttributes, effectKeys, woundLevels, SHOCK_THRESHOLD ...). They are part of the persisted contract in docs/AGENTS.md: keep them even where no module code reads them.

Values that follow from each other are derived, not repeated (LOAD_MAX_STEPS from LOAD_MAX_FACTOR and LOAD_STEP, SHOCK_THRESHOLD from CONDITION_BANDS, WOUND_LEVELS and MEND_RATES from MAX_WOUND_LEVEL and MEND_RATE_MAX, FORM_LIMITS from the limits in items.mjs); tests/rules-safety.test.mjs pins the results.

The lint guard in eslint.config.mjs applies to module/config/**, module/rules/** and module/view/**. See docs/AGENTS.md for folder ownership.
