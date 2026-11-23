/** Choice lists and vocabularies (keys to lang strings). Pure data. */

/** Personality (player characters only; replaces the old Morality attribute). */
export const PERSONALITIES = {
  lawAbiding: "SCARMARK.Personality.lawAbiding",
  practical: "SCARMARK.Personality.practical",
  opportunistic: "SCARMARK.Personality.opportunistic",
  corruptible: "SCARMARK.Personality.corruptible",
  vicious: "SCARMARK.Personality.vicious"
};

/** Zodiac signs use the Latin names (the data key stays `sunsign`). */
export const SUNSIGNS = {
  capricornus: "SCARMARK.Sunsign.capricornus",
  aquarius: "SCARMARK.Sunsign.aquarius",
  pisces: "SCARMARK.Sunsign.pisces",
  aries: "SCARMARK.Sunsign.aries",
  taurus: "SCARMARK.Sunsign.taurus",
  gemini: "SCARMARK.Sunsign.gemini",
  cancer: "SCARMARK.Sunsign.cancer",
  leo: "SCARMARK.Sunsign.leo",
  virgo: "SCARMARK.Sunsign.virgo",
  libra: "SCARMARK.Sunsign.libra",
  scorpius: "SCARMARK.Sunsign.scorpius",
  sagittarius: "SCARMARK.Sunsign.sagittarius"
};

/**
 * Months, in calendar order. Each month maps 1:1 to a Sunsign (simplified,
 * no split date ranges) so picking a Month auto-derives the Sunsign.
 */
export const MONTHS = {
  jan: { label: "SCARMARK.Month.jan", sunsign: "capricornus" },
  feb: { label: "SCARMARK.Month.feb", sunsign: "aquarius" },
  mar: { label: "SCARMARK.Month.mar", sunsign: "pisces" },
  apr: { label: "SCARMARK.Month.apr", sunsign: "aries" },
  may: { label: "SCARMARK.Month.may", sunsign: "taurus" },
  jun: { label: "SCARMARK.Month.jun", sunsign: "gemini" },
  jul: { label: "SCARMARK.Month.jul", sunsign: "cancer" },
  aug: { label: "SCARMARK.Month.aug", sunsign: "leo" },
  sep: { label: "SCARMARK.Month.sep", sunsign: "virgo" },
  oct: { label: "SCARMARK.Month.oct", sunsign: "libra" },
  nov: { label: "SCARMARK.Month.nov", sunsign: "scorpius" },
  dec: { label: "SCARMARK.Month.dec", sunsign: "sagittarius" }
};

/** Trait categories (a trait is physical or psyche). Macros may read it as SCARMARK.traitCategories. */
export const TRAIT_CATEGORIES = {
  physical: "SCARMARK.Trait.physical",
  psyche: "SCARMARK.Trait.psyche"
};

/**
 * Skill categories of the "skill" Item type, in display order. Psionic talents are
 * a separate item type with their own mod bucket (system.mods.skills.psionic) and
 * are not a skill category.
 */
export const SKILL_CATEGORIES = ["skill", "combat", "esoterics"];

/** The kinds of an Esoterics skill: spells roll against an "arcane" skill, invocations against a "religion" skill (Faith Points). */
export const ESOTERIC_KINDS = ["arcane", "religion"];

/**
 * Pre-1.0.51 category keys, folded into the current ones. Old skill items are converted when they load
 * (data/migrations.mjs) and an old Active Effect on a legacy mods.skills key keeps working
 * (rules/derived.mjs skillCategoryMod).
 */
export const LEGACY_SKILL_CATEGORIES = { physical: "skill", communication: "skill", craft: "skill", religion: "esoterics", magic: "esoterics" };

/**
 * Damage aspects (B/E/P/F) - the system-wide vocabulary shared by weapons,
 * missiles, and armor protection. Squeeze/Tear are NOT aspects; they resolve as
 * Blunt/Edge on the creature-attack side.
 */
export const DAMAGE_ASPECTS = {
  blunt: "SCARMARK.Aspect.blunt",
  edged: "SCARMARK.Aspect.edged",
  piercing: "SCARMARK.Aspect.piercing",
  fire: "SCARMARK.Aspect.fire"
};

/** Combat skills a weapon/missile can roll against. */
export const COMBAT_SKILLS = {
  close: "SCARMARK.CombatSkill.close",
  ranged: "SCARMARK.CombatSkill.ranged",
  unarmed: "SCARMARK.CombatSkill.unarmed",
  arcane: "SCARMARK.CombatSkill.arcane"
};

/** The letter each damage aspect is written with (combat tables, the combat helper), in the order Blunt, Edged, Piercing, Fire. */
export const ASPECT_LETTERS = { blunt: "B", edged: "E", piercing: "P", fire: "F" };

/** Melee weapons roll against Close or Unarmed Combat. Not used by the schema (a weapon accepts all COMBAT_SKILLS); macros may read it as SCARMARK.weaponSkills. */
export const WEAPON_SKILLS = {
  close: COMBAT_SKILLS.close,
  unarmed: COMBAT_SKILLS.unarmed
};

/** Missile velocity class (Low- vs High-Velocity Missiles). */
export const MISSILE_VELOCITIES = {
  low: "SCARMARK.Missile.velocityLow",
  high: "SCARMARK.Missile.velocityHigh"
};

/** Prefix of the per-skill Active Effect keys: `system.mods.skill.<Skill Name>` (Add = bonus to the ESL, Override = sets the ESL; matched by lower-cased name). */
export const SKILL_MOD_KEY_PREFIX = "system.mods.skill.";

/**
 * Active Effect target keys. When building an Active Effect change, use one of
 * these keys with mode "Add" (2) and a numeric value. The `system.mods.*` paths
 * are consumed by applyDerivedCombat / the combat rolls (data/base-actor-schema.mjs). Macros may read it as SCARMARK.effectKeys.
 * Fatigue and Attributes are modified on their BASE fields directly.
 *
 * Dynamic keys (not listed): per-skill mods use `system.mods.skill.<Skill Name>`
 * (EXACT skill name incl. case). Mode Add = bonus to ESL, mode Override = sets the
 * skill's ESL; attribute mods use `system.attributes.<key>.base`.
 */
export const EFFECT_KEYS = {
  "system.mods.meleeAttack": "Melee Attack (all melee ASL)",
  "system.mods.meleeDefense": "Melee Defense (all melee DSL)",
  "system.mods.missileAttack": "Missile Attack (all missile ASL)",
  "system.mods.incomingMelee": "Melee attacks AGAINST this actor (attacker ASL; Prone +20 / Pinned +30)",
  "system.mods.incomingMissile": "Missile attacks AGAINST this actor (attacker ASL; Prone/Pinned −)",
  "system.mods.skills.skill": "Skills (general category) EML",
  "system.mods.skills.combat": "Combat skills EML",
  "system.mods.skills.esoterics": "Esoterics skills (Arcane, Religion) EML",
  "system.mods.skills.psionic": "Psionic talents EML",
  "system.mods.injury": "Wound Level / WL (simulated wound; lowers Condition)",
  "system.mods.endurance": "Endurance",
  "system.mods.outnumbered": "Outnumbered (# of attackers; 2 = defense −20, 3+ = −30)",
  "system.mods.defense": "Defense (all Block / Dodge / Riposte / Counterattack rolls; Stunned −30)",
  "system.mods.impact": "Impact (+N to Close / Unarmed Combat damage strikes)",
  "system.resources.fatigue": "Fatigue (base)"
};

/**
 * The static groups of the Active Effect key picker (helpers/effects.mjs): [key, lang key of the label] pairs.
 * They must hold exactly the keys of EFFECT_KEYS (tests/config.test.mjs checks it).
 */
export const EFFECT_PICKER_GROUPS = [
  { label: "SCARMARK.EffectPicker.groupCombat", options: [
    ["system.mods.meleeAttack", "SCARMARK.EffectPicker.meleeAttack"],
    ["system.mods.meleeDefense", "SCARMARK.EffectPicker.meleeDefense"],
    ["system.mods.missileAttack", "SCARMARK.EffectPicker.missileAttack"],
    ["system.mods.incomingMelee", "SCARMARK.EffectPicker.incomingMelee"],
    ["system.mods.incomingMissile", "SCARMARK.EffectPicker.incomingMissile"],
    ["system.mods.outnumbered", "SCARMARK.EffectPicker.outnumbered"],
    ["system.mods.defense", "SCARMARK.EffectPicker.defense"],
    ["system.mods.impact", "SCARMARK.EffectPicker.impact"]
  ]},
  { label: "SCARMARK.EffectPicker.groupSkills", options: [
    ["system.mods.skills.skill", "SCARMARK.EffectPicker.skillsSkill"],
    ["system.mods.skills.combat", "SCARMARK.EffectPicker.skillsCombat"],
    ["system.mods.skills.esoterics", "SCARMARK.EffectPicker.skillsEsoterics"],
    ["system.mods.skills.psionic", "SCARMARK.EffectPicker.skillsPsionic"]
  ]},
  { label: "SCARMARK.EffectPicker.groupPenalties", options: [
    ["system.mods.injury", "SCARMARK.EffectPicker.injury"],
    ["system.mods.endurance", "SCARMARK.EffectPicker.endurance"],
    ["system.resources.fatigue", "SCARMARK.EffectPicker.fatigue"]
  ]}
];
