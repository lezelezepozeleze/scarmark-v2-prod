/**
 * View models of Active Effects for the sheets: the Effects tab groups and the types and stats of the effect picker. Pure: no Foundry globals; the text comes through `localize`.
 */
import { ATTRIBUTES, EFFECT_PICKER_GROUPS, ITEM_MOD_STATS, ITEM_MOD_KEY_PREFIX, SKILL_MOD_KEY_PREFIX, EFFECT_TARGET_TYPES, EFFECT_TARGET_CHARACTER } from "../config/index.mjs";

/**
 * Split a Document's effects into Temporary / Passive / Inactive groups.
 * Standard Foundry convention: has a duration -> Temporary, disabled -> Inactive, else Passive.
 */
export function categorizeEffects(effects) {
  const categories = { temporary: [], passive: [], inactive: [] };
  for (const effect of effects) {
    if (effect.disabled) categories.inactive.push(effect);
    else if (effect.isTemporary) categories.temporary.push(effect);
    else categories.passive.push(effect);
  }
  return categories;
}

/**
 * Grouped [key, label] options for the change-key picker of a character effect. Combines the static mod keys (EFFECT_PICKER_GROUPS, the same 15 keys as SCARMARK.effectKeys), one entry per Attribute base, and - if the effect belongs to an Actor - one entry per skill on that Actor (so the exact name is offered and no case guessing is needed).
 *
 * @param {object} effectDoc the ActiveEffect being edited (read: parent, parent.parent)
 * @param {{skillNames?: string[], localize: (key: string) => string}} context the canonical skill names (from the Skills compendium) and the translator
 */
function characterKeyGroups(effectDoc, { skillNames = [], localize: t }) {
  // Static groups come from module/config/vocab.mjs EFFECT_PICKER_GROUPS (cloned: groups are extended below).
  const groups = EFFECT_PICKER_GROUPS.map(g => ({ label: t(g.label), options: g.options.map(([key, label]) => [key, t(label)]) }));

  // Per-attribute base.
  groups.push({
    label: t("SCARMARK.EffectPicker.groupAttributes"),
    options: Object.keys(ATTRIBUTES).map(k => [`system.attributes.${k}.base`, t(ATTRIBUTES[k].label)])
  });

  // Individual skills: the canonical Skills compendium (cached at ready) unioned with any skills already on the owning Actor. Offering the compendium list means item effects (a potion with no actor yet) still get the full menu; the key `system.mods.skill.<Name>` pairs by name once the effect lands on an actor.
  const parent = effectDoc?.parent;
  const actor = parent?.documentName === "Actor" ? parent
    : (parent?.parent?.documentName === "Actor" ? parent.parent : null);
  const names = new Set(skillNames);
  for (const i of actor?.items ?? []) {
    if (i.type === "skill" || i.type === "psionic") names.add(i.name);
  }
  if (names.size) {
    groups.push({
      label: t("SCARMARK.EffectPicker.groupIndividual"),
      options: [...names].sort((a, b) => a.localeCompare(b)).map(n => [`${SKILL_MOD_KEY_PREFIX}${n}`, n])
    });
  }

  return groups;
}

/** The labels of the stat parts: the first part of a key ("quality", "impact", "protection", ...) and the second (a damage aspect). */
const statLabel = (stat, t) => stat.split(".").map((part, i) => (i === 0 ? t(`SCARMARK.EffectPicker.item.${part}`) : t(`SCARMARK.EffectPicker.part.${part}`))).join(": ");

/** The group of the stats an effect can change on one kind of item (weapon, armor): [key, label] options with the item-mod key prefix. */
function itemStatGroup(type, t) {
  return { label: t(`SCARMARK.EffectPicker.groupItem.${type}`), options: ITEM_MOD_STATS[type].map(stat => [`${ITEM_MOD_KEY_PREFIX}${stat}`, statLabel(stat, t)]) };
}

/**
 * The first step of the effect picker: what the effect is about (the character, a weapon or an armor piece) and, per choice, the stats it can change. The type to start on is the kind of item the effect sits on (unless it transfers to the owner), else the character.
 *
 * @param {object} effectDoc the ActiveEffect being edited
 * @param {{skillNames?: string[], localize: (key: string) => string}} context the canonical skill names (from the Skills compendium) and the translator
 * @returns {{start: string, types: {type: string, label: string, groups: {label: string, options: [string, string][]}[]}[]}}
 */
export function buildEffectTypes(effectDoc, context) {
  const t = context.localize;
  const character = characterKeyGroups(effectDoc, context);
  const parent = effectDoc?.parent;
  // An effect that transfers to the owner is about the character, whatever item it sits on.
  const start = parent?.documentName === "Item" && ITEM_MOD_STATS[parent.type] && !effectDoc.transfer ? parent.type : EFFECT_TARGET_CHARACTER;
  const types = EFFECT_TARGET_TYPES.map(type => ({
    type,
    label: t(`SCARMARK.EffectPicker.type.${type}`),
    groups: type === EFFECT_TARGET_CHARACTER ? character : [itemStatGroup(type, t)]
  }));
  return { start, types };
}

/**
 * The change rows to keep when the form is saved: all of them, except right after the user picked another type, when the rows whose stat that type does not offer are dropped (a blank row stays).
 *
 * @param {{key?: string}[]} rows the change rows of the form
 * @param {{types: {type: string, groups: {options: [string, string][]}[]}[]}} picker see buildEffectTypes
 * @param {string} type the type now chosen
 * @param {boolean} changed whether the user just picked it
 */
export function rowsForType(rows, picker, type, changed) {
  if (!changed) return rows;
  const offered = new Set(picker.types.find(entry => entry.type === type)?.groups.flatMap(group => group.options.map(([key]) => key)));
  return rows.filter(row => !row.key || offered.has(row.key));
}

/** Short sentence-case names of the static effect keys, for the Changes column of the Effects tab (the picker's own labels carry long explanations). */
const SHORT_KEY_LABELS = {
  "system.mods.meleeAttack": "SCARMARK.EffectShort.meleeAttack",
  "system.mods.meleeDefense": "SCARMARK.EffectShort.meleeDefense",
  "system.mods.missileAttack": "SCARMARK.EffectShort.missileAttack",
  "system.mods.incomingMelee": "SCARMARK.EffectShort.incomingMelee",
  "system.mods.incomingMissile": "SCARMARK.EffectShort.incomingMissile",
  "system.mods.outnumbered": "SCARMARK.EffectShort.outnumbered",
  "system.mods.defense": "SCARMARK.EffectShort.defense",
  "system.mods.impact": "SCARMARK.EffectShort.impact",
  "system.mods.skills.skill": "SCARMARK.EffectShort.skillsSkill",
  "system.mods.skills.combat": "SCARMARK.EffectShort.skillsCombat",
  "system.mods.skills.esoterics": "SCARMARK.EffectShort.skillsEsoterics",
  "system.mods.skills.psionic": "SCARMARK.EffectShort.skillsPsionic",
  "system.mods.injury": "SCARMARK.EffectShort.injury",
  "system.mods.endurance": "SCARMARK.EffectShort.endurance",
  "system.resources.fatigue": "SCARMARK.EffectShort.fatigue"
};

/**
 * The readable name of the stat an effect change targets ("system.mods.meleeDefense" -> "Melee defense"). A key nobody knows stays as it is.
 *
 * @param {string} key the change key
 * @param {(key: string) => string} t the translator
 */
export function effectKeyLabel(key, t) {
  if (SHORT_KEY_LABELS[key]) return t(SHORT_KEY_LABELS[key]);
  if (key.startsWith(SKILL_MOD_KEY_PREFIX)) return key.slice(SKILL_MOD_KEY_PREFIX.length);
  if (key.startsWith(ITEM_MOD_KEY_PREFIX)) return statLabel(key.slice(ITEM_MOD_KEY_PREFIX.length), t);
  const attribute = /^system\.attributes\.([^.]+)\.base$/.exec(key)?.[1];
  if (attribute && ATTRIBUTES[attribute]) return t(ATTRIBUTES[attribute].label);
  return key;
}

/** The Changes column of one effect: the readable names of its stats, joined by commas. */
export const effectChangesLabel = (effect, t) => Array.from(effect.changes ?? [], change => effectKeyLabel(change.key, t)).join(", ");
