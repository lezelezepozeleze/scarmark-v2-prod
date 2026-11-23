/**
 * Derived actor stats: Skill Base, Endurance, Load, Condition band, the Skill Base delta and the skill ESL.
 *
 * Pure: no Foundry globals. data/base-actor-schema.mjs applyDerivedCombat reads the actor and calls these; the numbers (steps, factors, bands) come from module/config/.
 */
import { LOAD_STEP, LOAD_MAX_STEPS, LOAD_MAX_FACTOR, LOAD_PCT_OVERLOADED, PERCENT, CONDITION_BANDS, CONDITION_MAX_FLOOR, SKILL_PENALTY_PER_POINT, LEGACY_SKILL_CATEGORIES, SKILL_MOD_KEY_PREFIX, FATIGUE_STEP, WOUND_ATTRIBUTES, LOAD_PENALTY_ATTRIBUTE, VITAL_RANK } from "../config/index.mjs";

/**
 * Skill Base (SB): the rounded average of the base values of the three attributes a skill or psionic talent is built on.
 *
 * `attributes` is the actor's system.attributes object (each entry has a `base`), or undefined when the item is not embedded on an actor (compendium), which gives 0. A key missing from `attributes` counts as 0.
 *
 * @param {Object<string, {base?: number}>|undefined} attributes
 * @param {string[]} keys the three attribute keys (attribute1, attribute2, attribute3)
 * @returns {number}
 */
export function skillBase(attributes, keys) {
  if (!attributes) return 0;
  const values = keys.map(key => attributes[key]?.base ?? 0);
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/**
 * Endurance = round(average of the (tired) endurance attributes) + the Endurance mod, never below 0.
 *
 * @param {number[]} scores the endurance attributes after the Fatigue penalty
 * @param {number} [modEndurance] mods.endurance
 * @returns {number}
 */
export function enduranceOf(scores, modEndurance = 0) {
  const sum = scores.reduce((s, v) => s + v, 0);
  return Math.max(0, Math.round(sum / scores.length) + modEndurance);
}

/**
 * Load against capacity: share (Infinity when capacity is 0 and something is carried), the AGL steps lost (1 per started LOAD_STEP above capacity, at most LOAD_MAX_STEPS), the shown percent and whether the actor carries more than LOAD_MAX_FACTOR x capacity.
 *
 * @param {number} loadKg carried weight in kg
 * @param {number} capacityKg carrying capacity in kg
 * @returns {{share: number, steps: number, pct: number, max: number, overMax: boolean}} `pct` is LOAD_PCT_OVERLOADED when the share is infinite; `max` is the most the actor can carry in kg
 */
export function loadState(loadKg, capacityKg) {
  const share = capacityKg > 0 ? loadKg / capacityKg : (loadKg > 0 ? Infinity : 0);
  const over = Math.round((share - 1) * 1000) / 1000;   // drop float noise (36 / 30 - 1 = 0.2)
  const steps = over > 0 ? Math.min(LOAD_MAX_STEPS, Math.ceil(over / LOAD_STEP - 1e-9)) : 0;
  return {
    share,
    steps,
    pct: Number.isFinite(share) ? Math.round(share * PERCENT) : LOAD_PCT_OVERLOADED,
    max: capacityKg * LOAD_MAX_FACTOR,
    overMax: loadKg > capacityKg * LOAD_MAX_FACTOR
  };
}

/**
 * Condition band from the current Condition and Endurance. At 0 or below the band is "out" (or "dying" for a dying vital wound) with the first (heaviest) band's penalty; above 0 the first CONDITION_BANDS entry whose share the Condition is at or below applies, else "ok".
 *
 * @param {number} condition
 * @param {number} endurance
 * @param {""|"out"|"dying"} vital
 * @returns {{share: number, band: string, penalty: number}}
 */
export function conditionState(condition, endurance, vital) {
  const share = endurance > 0 ? condition / endurance : 0;
  if (condition <= 0) return { share, band: vital === "dying" ? "dying" : "out", penalty: CONDITION_BANDS[0].penalty };
  const hit = CONDITION_BANDS.find(b => share <= b.max);
  return hit ? { share, band: hit.key, penalty: hit.penalty } : { share, band: "ok", penalty: 0 };
}

/**
 * The Condition percent shown on the sheet: the share of Endurance x PERCENT, rounded.
 *
 * @param {number} share Condition / Endurance, see conditionState
 * @returns {number}
 */
export const conditionPctOf = (share) => Math.round(share * PERCENT);

/**
 * The Condition resource (token bar) for the derived Condition: its maximum is Endurance but never below CONDITION_MAX_FLOOR.
 *
 * @param {number} condition current Condition
 * @param {number} endurance
 * @returns {{value: number, max: number}}
 */
export const conditionResourceOf = (condition, endurance) => ({ value: condition, max: Math.max(CONDITION_MAX_FLOOR, endurance) });

/**
 * The Move resource (token bar): value and maximum are both the Move in metres.
 *
 * @param {number} move
 * @returns {{value: number, max: number}}
 */
export const moveResourceOf = (move) => ({ value: move, max: move });

/**
 * The fixed ESL penalty of EVERY skill and psionic talent: (fatigue steps + load steps + wound band points) x SKILL_PENALTY_PER_POINT, the same for every skill whatever its attributes. It replaces the old Skill Base delta (1.0.53): an Active Effect on an attribute no longer moves skills.
 *
 * @param {{fatiguePenalty: number, loadSteps: number, woundPenalty: number}} penalties the same points that lower the attributes
 * @returns {number} ESL points lost (0 or more)
 */
export const skillPenaltyOf = ({ fatiguePenalty, loadSteps, woundPenalty }) => (fatiguePenalty + loadSteps + woundPenalty) * SKILL_PENALTY_PER_POINT;

/**
 * Per-skill ESL OVERRIDES from the actor's applied Active Effects. A change `system.mods.skill.<Skill Name>` of type override SETS that skill's ESL to the value outright (e.g. Antidote: Vitality = 50); type add stays a plain bonus and is not collected here. When several overrides hit one skill, the highest priority wins (Foundry's own override order, default priority 50). A non-numeric value is ignored.
 *
 * @param {Array<{system?: {changes?: Array<{key?: string, type?: string, value?: *, priority?: number}>}}>} effects the actor's applied effects
 * @returns {Object<string, number>} lower-cased skill name -> ESL
 */
export function skillOverridesOf(effects) {
  const found = [];
  for (const effect of effects) {
    for (const change of effect.system?.changes ?? []) {
      if (change.type !== "override" || !change.key?.startsWith(SKILL_MOD_KEY_PREFIX)) continue;
      const value = Number(change.value);
      if (!Number.isFinite(value)) continue;
      found.push({ name: change.key.slice(SKILL_MOD_KEY_PREFIX.length).toLowerCase(), value, priority: change.priority ?? 50 });
    }
  }
  found.sort((a, b) => a.priority - b.priority);
  const byName = {};
  for (const o of found) byName[o.name] = o.value;
  return byName;
}

/**
 * The Zodiac Sign bonus of a skill or psionic talent for an actor's sunsign (0 when none matches or the actor has no sunsign).
 *
 * @param {Array<{sunsign?: string, bonus?: number}>|undefined} bonuses the item's sunsignBonuses
 * @param {string|undefined} sunsign the actor's sunsign
 * @returns {number}
 */
export const sunsignBonusOf = (bonuses, sunsign) => bonuses?.find(entry => entry.sunsign && entry.sunsign === sunsign)?.bonus ?? 0;

/**
 * The category mod that applies to a skill or psionic talent: a talent takes the psionic mod, a skill the mod of its category plus its legacy keys. Transitional: an old effect (Hangover III) lists the same value on every pre-1.0.51 key (physical, communication, craft ...), which now fold into ONE category, so the legacy keys are not summed; the one with the largest absolute value counts once. The migration macro scripts/imports/migrate-skill-categories.js merges such keys in the data, after which this is moot.
 *
 * @param {string} itemType "skill" or "psionic"
 * @param {string} category the skill's category
 * @param {Object<string, number>} categoryMods the actor's mods.skills
 * @returns {number}
 */
export function skillCategoryMod(itemType, category, categoryMods) {
  if (itemType === "psionic") return categoryMods.psionic;
  const legacy = Object.entries(LEGACY_SKILL_CATEGORIES)
    .filter(([, current]) => current === category)
    .map(([old]) => categoryMods[old] ?? 0)
    .reduce((best, v) => (Math.abs(v) > Math.abs(best) ? v : best), 0);
  return (categoryMods[category] ?? 0) + legacy;
}

/**
 * The Fatigue penalty: 1 point per FATIGUE_STEP of Fatigue (a negative Fatigue counts as 0).
 *
 * @param {number|undefined} fatigue
 * @returns {number}
 */
export const fatiguePenaltyOf = (fatigue) => Math.floor(Math.max(0, fatigue ?? 0) / FATIGUE_STEP);

/**
 * Carried weight in kg from the stored weight units, to a gram.
 *
 * @param {number} storedTotal carried weight in the stored unit
 * @param {number} unitsPerKg stored units per kg (SCARMARK.weightUnitsPerKg())
 * @returns {number}
 */
export const loadKgOf = (storedTotal, unitsPerKg) => Math.round(storedTotal / unitsPerKg * 1000) / 1000;

/**
 * Total Wound Level: the injuries' levels plus the Injury mod, never below 0.
 *
 * @param {Array<number|undefined>} levels the injuries' woundLevel
 * @param {number} [modInjury] mods.injury
 * @returns {number}
 */
export const woundLevelOf = (levels, modInjury = 0) => Math.max(0, levels.reduce((sum, l) => sum + (l ?? 0), 0) + (modInjury ?? 0));

/**
 * The worst vital state of a list.
 *
 * @param {Array<""|"out"|"dying"|undefined>} vitals
 * @returns {""|"out"|"dying"} "" when none is vital
 */
export const worstVital = (vitals) => vitals.reduce((worst, v) => ((VITAL_RANK[v ?? ""] ?? 0) > (VITAL_RANK[worst] ?? 0) ? (v ?? "") : worst), "");

/**
 * Current Condition: 0 with a vital wound, else Endurance minus the Wound Level, never below 0.
 *
 * @param {number} endurance
 * @param {number} wl total Wound Level
 * @param {""|"out"|"dying"} vital
 * @returns {number}
 */
export const conditionOf = (endurance, wl, vital) => (vital ? 0 : Math.max(0, endurance - wl));

/**
 * An attribute after the penalties: Fatigue hits all of them, Load steps one attribute (AGL), the Condition band's wound penalty the WOUND_ATTRIBUTES (DEX, AGL). Never below 0.
 *
 * @param {string} key
 * @param {number} base
 * @param {{fatiguePenalty: number, loadSteps: number, woundPenalty: number}} penalties
 * @returns {number}
 */
export function effectiveAttribute(key, base, { fatiguePenalty, loadSteps, woundPenalty }) {
  let penalty = fatiguePenalty;
  if (key === LOAD_PENALTY_ATTRIBUTE) penalty += loadSteps;
  if (WOUND_ATTRIBUTES.includes(key)) penalty += woundPenalty;
  return Math.max(0, base - penalty);
}

/**
 * Skill ESL: an Override replaces the result; otherwise level + sunsign bonus + category mod + skill mod - the fixed skill penalty, never below 0.
 *
 * @param {{level?: number, sunsignBonus: number, categoryMod: number, skillMod: number, penalty: number, override?: number}} parts
 * @returns {number}
 */
export const skillEslOf = ({ level, sunsignBonus, categoryMod, skillMod, penalty, override }) =>
  Math.max(0, override ?? ((level ?? 0) + sunsignBonus + categoryMod + skillMod - penalty));

/**
 * ESL of a skill or psionic talent that is not (yet) prepared by an actor, e.g. one in a compendium: its level, never below 0. The actor's applyDerivedCombat replaces it with skillEslOf. A missing level gives NaN (pinned by the golden skill-base cases).
 *
 * @param {number} level
 * @returns {number}
 */
export const standaloneEslOf = (level) => Math.max(0, level);
