/** Immediate effects: what applying one writes into the stored values of a character, weapon or armor piece (it rewrites the value in the sheet once, and nothing stays in Effects). Pure. */
import { applyItemMods } from "./item-mods.mjs";
import { getPath } from "./path.mjs";
import { QUALITY_MAX, SKILL_MOD_KEY_PREFIX } from "../config/index.mjs";

const ATTRIBUTE_BASE = /^system\.attributes\.[a-z]+\.base$/;

/**
 * The stored value a character effect key rewrites, or null when the key is not a stored value (the mods of `system.mods.*` only exist while an effect is on).
 *
 * @param {string} key the change key
 * @returns {{kind: "actor", path: string}|{kind: "skill", name: string}|null} an attribute base or fatigue of the actor, or the level of the character's skill of that name
 */
export function rewriteTarget(key) {
  if (ATTRIBUTE_BASE.test(key) || key === "system.resources.fatigue") return { kind: "actor", path: key };
  return key.startsWith(SKILL_MOD_KEY_PREFIX) && key.length > SKILL_MOD_KEY_PREFIX.length ? { kind: "skill", name: key.slice(SKILL_MOD_KEY_PREFIX.length) } : null;
}

/**
 * The new stored values after the changes: per key, the changes applied in priority order to its current value, never below 0.
 *
 * @param {Object<string, number>} current key -> the stored value now
 * @param {{key: string, type: "add"|"override", value: number, priority: number}[]} changes see item-mods.mjs changeOf
 * @returns {Object<string, number>} key -> new value, for the keys that have a current value
 */
export function rewrittenValues(current, changes) {
  const result = {};
  for (const key of Object.keys(current)) {
    const own = changes.filter(change => change.key === key);
    if (own.length) result[key] = Math.max(0, applyItemMods(current[key], own));
  }
  return result;
}

/**
 * The fields of a weapon or armor piece an immediate effect rewrites, as an update ({ "system.attack": 7, ... }). A weapon's impact of -1 ("lacks the aspect") and durability of 0 (natural weapon) are left alone; weapon durability stops at the schema maximum. Stats the item does not have are ignored.
 *
 * @param {"weapon"|"armor"} type the item type
 * @param {object} system the item's stored system data
 * @param {Object<string, {type: string, value: number, priority: number}[]>} mods the changes per stat, see item-mods.mjs itemModsOf
 */
export function rewrittenItem(type, system, mods) {
  const update = {};
  for (const [stat, changes] of Object.entries(mods)) {
    const current = getPath(system, stat);
    if (!Number.isFinite(current) || (stat.startsWith("impact.") && current < 0) || (stat === "quality" && current <= 0)) continue;
    const value = Math.max(stat.startsWith("impact.") ? 0 : -Infinity, applyItemMods(current, changes));
    update[`system.${stat}`] = stat === "quality" ? Math.min(type === "weapon" ? QUALITY_MAX : Infinity, Math.max(1, value)) : value;
  }
  return update;
}
