/**
 * What every actor type with attributes shares: the attribute and resource schema builders, the modifier accumulators (buildMods), the derived-stats chain (applyDerivedCombat) and the base data model class the character, creature, npc and animal models extend.
 *
 * This file only reads the actor and writes its derived fields. Every calculation lives in rules/ (derived.mjs, inventory.mjs, combat.mjs); the numbers in config/.
 */
import { SCARMARK } from "../config.mjs";
import {
  outnumberedPenaltyFor, enduranceOf, loadState, conditionState, conditionPctOf, conditionResourceOf, moveResourceOf, skillPenaltyOf, skillOverridesOf, sunsignBonusOf, skillCategoryMod,
  fatiguePenaltyOf, loadKgOf, woundLevelOf, worstVital, conditionOf, effectiveAttribute, skillEslOf, gearSummary, gearIsCarried
} from "../rules/index.mjs";
import { ATTRIBUTES, SKILL_CATEGORIES, LEGACY_SKILL_CATEGORIES, ENDURANCE_ATTRIBUTES, LOAD_CAPACITY_ATTRIBUTES, CONDITION_INITIAL, CONDITION_MAX_FLOOR, ATTRIBUTE_BASE_INITIAL } from "../config/index.mjs";
import { migrateLegacyAttributes } from "./migrations.mjs";

const fields = foundry.data.fields;

/**
 * Build the {base} SchemaField for a given list of attribute keys.
 * Character and NPC use all 9; Creature and Animal omit Presence.
 */
export function buildAttributeFields(keys) {
  const attributeFields = {};
  for (const key of keys) {
    attributeFields[key] = new fields.SchemaField({
      base: new fields.NumberField({ required: true, integer: true, initial: ATTRIBUTE_BASE_INITIAL, min: 0 })
    });
  }
  return attributeFields;
}

/**
 * Shared resource block. Fatigue is the only manual penalty input. Spirit and Will
 * Capacity are plain stored pools. Condition and Move are DERIVED (applyDerivedCombat
 * overwrites them on every preparation); the fields stay in the schema so token bars
 * can show them.
 */
export function buildResourceField() {
  return new fields.SchemaField({
    fatigue: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
    condition: new fields.SchemaField({
      value: new fields.NumberField({ required: true, integer: true, initial: CONDITION_INITIAL, min: 0 }),
      max: new fields.NumberField({ required: true, integer: true, initial: CONDITION_INITIAL, min: CONDITION_MAX_FLOOR })
    }),
    // Move in whole metres (grid squares) = effective AGL.
    move: new fields.SchemaField({
      value: new fields.NumberField({ required: true, integer: true, initial: 0 }),
      max: new fields.NumberField({ required: true, integer: true, initial: 0 })
    }),
    // Arcane casting capacity, set by Spirit: a plain stored pool (Esoterics tab),
    // spent by Artifact/Rune Use and restored by Recharge. willCapacity is the same for Will.
    spiritCapacity: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 }),
    willCapacity: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0 })
  });
}

/**
 * Base of the character, creature, npc and animal data models. A subclass sets
 * `attributeKeys` (its attribute list) and builds its own schema; migration, the
 * modifier accumulators and the derived chain are shared here.
 */
export class ScarmarkActorData extends foundry.abstract.TypeDataModel {

  /** The attribute keys of this actor type (SCARMARK.characterAttributeKeys or creatureAttributeKeys). */
  static attributeKeys = [];

  /** @override - fold the pre-1.0.36 attributes (EYE/HRG/SML, VOI/COM, AUR) into PER/PRE/SPI (no PRE when the type has none). */
  static migrateData(source) {
    migrateLegacyAttributes(source.attributes, this.attributeKeys);
    return super.migrateData(source);
  }

  /** @override - init the effect modifier accumulators before Active Effects apply. */
  prepareBaseData() {
    this.mods = buildMods();
  }

  /** @override */
  prepareDerivedData() {
    applyDerivedCombat(this, this.parent);
  }
}

/**
 * Carried weight by category of an actor's items (see rules/inventory.mjs gearSummary and gearIsCarried).
 * Used by the derived chain and by the container actor.
 */
export function computeGearSummary(actor) {
  return gearSummary(actor.items, gearIsCarried(id => actor.items.get(id)));
}

/**
 * Zeroed modifier accumulators, initialised in each Actor model's
 * prepareBaseData (which runs BEFORE Active Effects apply). Effects ADD into
 * these `system.mods.*` paths; applyDerivedCombat + the combat rolls then READ
 * them. This is what lets an Active Effect touch a DERIVED stat (skill ESL, UP,
 * PP, ASL/DSL, ...) even though those are computed after effects are applied.
 *
 *  - meleeAttack/meleeDefense/missileAttack : flat mods to weapon ASL / DSL / missile ASL
 *  - incomingMelee/incomingMissile          : flat mod added to an ATTACKER's ASL when
 *                                             THIS actor is the target (Prone/Pinned Down);
 *                                             read at attack-declaration time, not here
 *  - endurance                              : flat mod to Endurance (and so Condition)
 *  - injury                                 : simulated Wound Levels from an effect (lowers
 *                                             Condition like a real wound, but expires with
 *                                             the effect, no Mend Roll; e.g. a self-clearing
 *                                             poison; negative = pain relief)
 *  - outnumbered                            : number of attackers (GM-set); defense-only
 *                                             penalty, see OUTNUMBERED_STEPS in config/combat.mjs
 *  - defense                                : flat mod to EVERY defense roll (Block, Dodge,
 *                                             Riposte, Counterattack; melee + missile), e.g. Stunned
 *  - impact                                 : flat mod to the Impact of Close / Unarmed strikes
 *  - skills.{category|psionic}              : flat mod to every skill's ESL in that category
 *  - skill[<Skill Name>]                    : flat mod to one named skill's ESL
 * (Fatigue and Attributes are modified on their BASE fields directly, so they
 *  need no accumulator here.)
 */
export function buildMods() {
  return {
    meleeAttack: 0,
    meleeDefense: 0,
    missileAttack: 0,
    incomingMelee: 0,
    incomingMissile: 0,
    injury: 0,
    endurance: 0,
    outnumbered: 0,
    defense: 0,
    impact: 0,
    // The current categories plus the pre-1.0.51 keys, still honoured so old Active Effects keep working.
    skills: Object.fromEntries([...SKILL_CATEGORIES, "psionic", ...Object.keys(LEGACY_SKILL_CATEGORIES)].map(key => [key, 0])),
    skill: {}
  };
}

/**
 * Defense-only Outnumbered penalty of an actor (positive size; callers subtract
 * it). Kept here because helpers/combat/lookup.mjs imports it from this file; the
 * calculation is the pure rules/combat.mjs outnumberedPenaltyFor, this only reads
 * the actor's mods.outnumbered. A later pass may move the actor read to the helper.
 */
export function outnumberedPenalty(actor) {
  return outnumberedPenaltyFor(actor?.system?.mods?.outnumbered ?? 0);
}

/**
 * The full derived chain, shared by every actor type with attributes. Runs in the
 * Actor's prepareDerivedData, after the items are prepared (weights final) and the
 * Active Effects applied, so each `system.attributes[k].base` already holds the
 * stored value plus effects. The numbers are in config/penalties.mjs; the
 * calculations in rules/derived.mjs.
 *
 *  1. Fatigue  -> -1 to every attribute per FATIGUE_STEP points.
 *  2. Endurance = round(average of ENDURANCE_ATTRIBUTES) with effects and the
 *     fatigue penalty (an exhausted fighter goes down sooner) + mods.endurance.
 *  3. Load: capacity in kg = the sum of LOAD_CAPACITY_ATTRIBUTES (with effects,
 *     WITHOUT penalties, so a wound never shrinks what you carry); -1 AGL per
 *     started LOAD_STEP above it. The number of those steps is shown as "Burden"
 *     in the sheet header.
 *  4. Condition = Endurance - WL (all injury items: wounds, diseases, poisons,
 *     plus mods.injury); a vital wound (VITAL_WOUNDS) forces it to 0. Its band
 *     takes the WOUND_ATTRIBUTES points (CONDITION_BANDS).
 *  5. Effective attributes = base - the penalties above (min 0); Move = AGL.
 *  6. Skills: ESL = SL + Zodiac Sign bonus + category mod + skill mod - skill penalty,
 *     where the skill penalty = (fatigue steps + load steps + wound band points) x
 *     SKILL_PENALTY_PER_POINT (rules/derived.mjs skillPenaltyOf), the same for every
 *     skill. Active Effects on attributes do NOT move skills (since 1.0.53; the old
 *     Base-delta is gone): a skill is changed by an effect on its own key
 *     (system.mods.skill.<Name>) or on its category. An Override effect on the skill
 *     replaces the whole result.
 *
 * Several derived values are read by macros and templates (persisted contract in
 * docs/AGENTS.md), so they stay even where the code itself does not read them:
 * heavyBleed, condition.penalty, load.max, sunsignBonus.
 *
 * @param {object} system  The Actor system data model (this).
 * @param {Actor}  actor   The owning Actor (this.parent).
 */
export function applyDerivedCombat(system, actor) {
  const mods = system.mods ?? buildMods();
  const attributes = system.attributes ?? {};
  // Only the configured keys: an old effect on a vanished attribute (e.g.
  // system.attributes.eye.base) may have left a stray entry behind.
  const keys = Object.keys(ATTRIBUTES).filter(k => attributes[k]);
  const base = (k) => attributes[k]?.base ?? 0;

  // 1. Fatigue (stored value + effects: hangover, disease, stimulants ...).
  const fatiguePenalty = fatiguePenaltyOf(system.resources?.fatigue);

  // 2. Endurance.
  const tired = (k) => Math.max(0, base(k) - fatiguePenalty);
  const endurance = enduranceOf(ENDURANCE_ATTRIBUTES.map(tired), mods.endurance ?? 0);

  // 3. Load. Stored weights are kg (legacy 0.5 kg ounces before the metric switch).
  const gear = computeGearSummary(actor);
  const unitsPerKg = SCARMARK.weightUnitsPerKg();
  const loadKg = loadKgOf(gear.total, unitsPerKg);
  const capacityKg = Math.max(0, LOAD_CAPACITY_ATTRIBUTES.reduce((sum, k) => sum + base(k), 0));
  const load = loadState(loadKg, capacityKg);
  const loadSteps = load.steps;

  // 4. Condition.
  const injuries = actor.items.filter(i => i.type === "injury");
  const wl = woundLevelOf(injuries.map(i => i.system.woundLevel), mods.injury);
  const vital = worstVital(injuries.map(i => i.system.vital));
  const condition = conditionOf(endurance, wl, vital);
  const { share: conditionShare, band, penalty: woundPenalty } = conditionState(condition, endurance, vital);

  // 5. Effective attributes.
  for (const k of keys) attributes[k].effective = effectiveAttribute(k, base(k), { fatiguePenalty, loadSteps, woundPenalty });
  const move = attributes.agl?.effective ?? 0;

  system.fatiguePenalty = fatiguePenalty;
  system.endurance = endurance;
  system.wl = wl;
  system.heavyBleed = injuries.filter(i => i.system.heavyBleeding).length;
  system.condition = { value: condition, max: endurance, pct: conditionPctOf(conditionShare), band, vital, penalty: woundPenalty };
  system.load = {
    kg: loadKg,
    capacity: capacityKg,
    max: load.max,
    pct: load.pct,
    steps: loadSteps,
    overMax: load.overMax
  };
  // The sheet header keeps its "Burden" label for the overload steps (1 = -1 AGL).
  system.burden = loadSteps;
  system.move = move;
  // Token bars read the resource fields: keep them in step with the derived values.
  if (system.resources?.condition) Object.assign(system.resources.condition, conditionResourceOf(condition, endurance));
  if (system.resources?.move) Object.assign(system.resources.move, moveResourceOf(move));
  // Shown capacity, in the stored weight unit.
  system.gearSummary = { ...gear, capacity: capacityKg * unitsPerKg, endurance };

  // 6. Skills. Per-skill mods are matched case-insensitively (skill names are Title
  // Case since 1.0.37; an old world may still hold ALL CAPS names or keys).
  const skillModByLower = {};
  for (const [name, val] of Object.entries(mods.skill)) skillModByLower[name.toLowerCase()] = val;

  // Fixed penalty on every skill from fatigue, load and wounds (the same points that lower attributes).
  const skillPenalty = skillPenaltyOf({ fatiguePenalty, loadSteps, woundPenalty });
  system.skillPenalty = skillPenalty;
  const skillOverrides = skillOverridesOf(actor.appliedEffects ?? []);
  for (const item of actor.items) {
    if ((item.type !== "skill") && (item.type !== "psionic")) continue;
    const lowerName = item.name.toLowerCase();
    const sunsignBonus = sunsignBonusOf(item.system.sunsignBonuses, system.sunsign);
    item.system.sunsignBonus = sunsignBonus;
    item.system.esl = skillEslOf({
      level: item.system.level,
      sunsignBonus,
      categoryMod: skillCategoryMod(item.type, item.system.category, mods.skills),
      skillMod: skillModByLower[lowerName] ?? 0,
      penalty: skillPenalty,
      override: skillOverrides[lowerName]
    });
  }
}
