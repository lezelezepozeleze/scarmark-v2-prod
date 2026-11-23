/**
 * CONFIG.SCARMARK / game.scarmark.config: the Foundry-facing object that macros, sheets and
 * templates read. It is only an ASSEMBLER. The rule VALUES live in module/config/ and the
 * calculations in module/rules/ (docs/AGENTS.md, folder ownership); every key below is part
 * of the persisted contract, so keys and results must not change.
 */
import { weightUnitsPerKg } from "./foundry/settings.mjs";
import * as C from "./config/index.mjs";
import { locationKey, covers, vitalWoundFor, severityKey, injuryFor, mendLabel, stunProtectionBonus, spellLevelPenalty, rangedBlockShields } from "./rules/index.mjs";

export const SCARMARK = {
  // attributes
  attributes: C.ATTRIBUTES,
  characterOnlyAttributes: C.CHARACTER_ONLY_ATTRIBUTES,
  characterAttributeKeys: C.CHARACTER_ATTRIBUTE_KEYS,
  creatureAttributeKeys: C.CREATURE_ATTRIBUTE_KEYS,
  legacyAttributeMap: C.LEGACY_ATTRIBUTE_MAP,

  weightUnitsPerKg,

  // penalties
  SKILL_PENALTY_PER_POINT: C.SKILL_PENALTY_PER_POINT,
  FATIGUE_STEP: C.FATIGUE_STEP,
  LOAD_STEP: C.LOAD_STEP,
  LOAD_MAX_STEPS: C.LOAD_MAX_STEPS,
  LOAD_MAX_FACTOR: C.LOAD_MAX_FACTOR,
  WOUND_ATTRIBUTES: C.WOUND_ATTRIBUTES,
  CONDITION_BANDS: C.CONDITION_BANDS,
  SHOCK_THRESHOLD: C.SHOCK_THRESHOLD,
  ESL_CAP: C.ESL_CAP,

  // vocabularies
  personalities: C.PERSONALITIES,
  sunsigns: C.SUNSIGNS,
  months: C.MONTHS,
  traitCategories: C.TRAIT_CATEGORIES,
  skillCategories: C.SKILL_CATEGORIES,
  damageAspects: C.DAMAGE_ASPECTS,
  combatSkills: C.COMBAT_SKILLS,
  weaponSkills: C.WEAPON_SKILLS,
  missileSkills: C.COMBAT_SKILLS,
  effectKeys: C.EFFECT_KEYS,
  missileVelocities: C.MISSILE_VELOCITIES,

  // wounds
  vitalWounds: C.VITAL_WOUNDS,
  vitalStates: C.VITAL_STATES,
  woundLevels: C.WOUND_LEVELS,
  mendRateMax: C.MEND_RATE_MAX,
  mendRates: C.MEND_RATES,
  injurySeverities: C.INJURY_SEVERITIES,
  injuryTypes: C.INJURY_TYPES,
  STUN_WOUND_LEVELS: C.STUN_WOUND_LEVELS,
  STUN_TARGET: C.STUN_TARGET,
  STUNNED_DURATION: C.STUNNED_DURATION,

  // locations
  armorLocations: C.ARMOR_LOCATIONS,
  legacyLocationMap: C.LEGACY_LOCATION_MAP,
  fumbleTestLocations: C.FUMBLE_TEST_LOCATIONS,
  stumbleTestLocations: C.STUMBLE_TEST_LOCATIONS,

  // combat
  armorPiercingNames: C.ARMOR_PIERCING_NAMES,

  // calculations (module/rules/), kept here because macros and sheets call them through the config object
  vitalWoundFor,
  severityKey,
  injuryFor,
  mendLabel,
  locationKey,
  covers,
  stunProtectionBonus,
  spellLevelPenalty,
  rangedBlockShields
};
