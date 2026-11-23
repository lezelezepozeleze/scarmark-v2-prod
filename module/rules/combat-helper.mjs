/**
 * What the combat helper dialog offers: which items can attack, how their damage aspects are written, and which group each belongs to.
 *
 * Pure: no Foundry globals. Items are plain objects shaped like the Foundry items ({id, name, type, system}).
 */
import { RANGE_PENALTY, ASPECT_LETTERS } from "../config/index.mjs";

/** Groups of the dialog, in column order. Their titles are SCARMARK.CombatHelper.group.<key>. */
export const HELPER_GROUPS = ["unarmed", "close", "throwable", "missiles", "artifacts", "runes"];
/** The index of each group in HELPER_GROUPS (keep both in step; tests/combat-helper.test.mjs checks it). */
export const HELPER_GROUP = Object.freeze({ UNARMED: 0, CLOSE: 1, THROWABLE: 2, MISSILES: 3, ARTIFACTS: 4, RUNES: 5 });

/** Damage aspects as the dialog writes them: [letter, key], in the order B E P F (config/vocab.mjs ASPECT_LETTERS). */
const LETTERS = Object.entries(ASPECT_LETTERS).map(([key, letter]) => [letter, key]);
const RANGES = Object.keys(RANGE_PENALTY);

const norm = (value) => String(value ?? "").trim().toLocaleLowerCase();
const hasNonNegativeValue = (value) => value != null && value !== "" && Number.isFinite(+value) && +value >= 0;

/** Is the item carried, and is the container it is in (if any) carried? */
export function isCarried(item, getContainer) {
  return item.system?.carried !== false && getContainer(item.system?.container)?.system?.carried !== false;
}

/** Can this weapon or missile attack at all (a damage aspect with an impact, a missile with an aspect and a range, not a broken weapon)? */
export function attackable(item) {
  const sys = item.system ?? {};
  if (item.type === "missile") {
    return LETTERS.some(([, key]) => key === norm(sys.aspect)) && RANGES.some(key => hasNonNegativeValue(sys.impact?.[key]));
  }
  if (item.type === "weapon" && sys.broken) return false;
  return LETTERS.some(([, key]) => hasNonNegativeValue(sys.impact?.[key]));
}

/** The damage aspect letters of an item: a missile's own aspect, or a weapon's aspects with impact, strongest first ("E B"). Empty when it has none. */
export function damageLetters(item) {
  const sys = item.system ?? {};
  if (item.type === "missile") return LETTERS.find(([, key]) => key === norm(sys.aspect))?.[0] ?? "";
  return LETTERS
    .map(([letter, key], order) => ({ letter, order, value: sys.impact?.[key] }))
    .filter(aspect => hasNonNegativeValue(aspect.value))
    .sort((a, b) => b.value - a.value || a.order - b.order)
    .map(aspect => aspect.letter)
    .join(" ");
}

/**
 * Sort the actor's items into the dialog's groups, each by name. An item with an active artifact flag also lands in Artifacts, one with the rune flag also in Runes; weapons go to Unarmed or Close by their skill, missiles to Throwable (Close skill) or Missiles.
 *
 * @param {object[]} items
 * @param {(a: string, b: string) => number} compare name comparison
 * @returns {object[][]} one list per HELPER_GROUPS entry
 */
export function combatBuckets(items, compare) {
  const buckets = HELPER_GROUPS.map(() => []);
  for (const item of items) {
    const sys = item.system ?? {};
    if (!damageLetters(item)) continue;
    if (sys.artifact?.active === true) buckets[HELPER_GROUP.ARTIFACTS].push(item);
    if (sys.rune === true) buckets[HELPER_GROUP.RUNES].push(item);
    if (!attackable(item)) continue;
    const skill = norm(sys.associatedSkill);
    if (item.type === "weapon") buckets[skill === "unarmed" ? HELPER_GROUP.UNARMED : HELPER_GROUP.CLOSE].push(item);
    else if (item.type === "missile") buckets[skill === "close" ? HELPER_GROUP.THROWABLE : HELPER_GROUP.MISSILES].push(item);
  }
  return buckets.map(list => list.sort((a, b) => compare(a.name, b.name)));
}
