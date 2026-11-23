/** Limits and defaults of the data models. Pure data. Templates still repeat some of them as min/max attributes. */

/** Weapon and missile Durability (WQ): default and highest. */
export const QUALITY_INITIAL = 10;
export const QUALITY_MAX = 16;

/** Armor Durability that never decays (Natural Armor): such a piece always protects the locations it covers and never wears. */
export const QUALITY_PERMANENT = -1;

/** Armor layer, 0 (natural) to 5 (rigid). */
export const ARMOR_LAYER_MAX = 5;

/** Artifact and rune Class: spent from Will or Spirit Capacity. */
export const ARTIFACT_CLASS_MIN = 1;
export const ARTIFACT_CLASS_MAX = 5;

/** Spell Level, Magic Missile Class (spell class) and Invocation Circle: they start at this value. */
export const ESOTERIC_MIN = 1;
export const SPELL_LEVEL_MAX = 6;
export const SPELL_CLASS_MAX = 6;
export const INVOCATION_CIRCLE_MAX = 5;

/** A new container (item or actor) starts with this Max Capacity, in the stored weight unit. */
export const CONTAINER_CAPACITY_INITIAL = 1;

/** A new Zodiac Sign bonus of a skill or psionic talent starts at this value. */
export const SUNSIGN_BONUS_INITIAL = 1;

/** The skill a consumable's toxicity lowers: consuming applies -toxicity to this skill's mod (helpers/consume.mjs). Macros may read the same name. */
export const TOXICITY_SKILL = "Vitality";

/** A new attribute starts at this base value. */
export const ATTRIBUTE_BASE_INITIAL = 8;

/** Item types that live in an actor's inventory (weighable, can be carried or stored). */
export const INVENTORY_TYPES = ["gear", "weapon", "missile", "armor", "container"];

/** Inventory types that can be stacked (a quantity of identical items): split with a double click, merged with a triple click. */
export const STACK_TYPES = ["gear", "weapon", "missile", "armor"];

/**
 * The limits the sheet templates put on number inputs (min and max attributes), so the forms and the data models above share one source. Sheets pass it to their templates as `limits`.
 */
export const FORM_LIMITS = {
  qualityMax: QUALITY_MAX,
  armorLayerMax: ARMOR_LAYER_MAX,
  spellLevelMax: SPELL_LEVEL_MAX,
  spellClassMax: SPELL_CLASS_MAX,
  invocationCircleMax: INVOCATION_CIRCLE_MAX,
  esotericMin: ESOTERIC_MIN,
  artifactClassMin: ARTIFACT_CLASS_MIN,
  artifactClassMax: ARTIFACT_CLASS_MAX
};
