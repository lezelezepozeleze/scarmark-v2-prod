/** Modifiers on the stats of a weapon or armor piece: an Active Effect on the item (not transferring to the owner) with changes on ITEM_MOD_KEY_PREFIX keys adds to a stat or sets it. The stored fields are never touched; the item exposes the result as system.effective and combat reads that. Pure. */
import { ITEM_MOD_KEY_PREFIX, ITEM_MOD_DEFAULT_PRIORITY, DAMAGE_ASPECTS } from "../config/index.mjs";
import { getPath } from "./path.mjs";

/** The kind of a change, "add" or "override" (shown as "set"); null for any other, which items and rewrites ignore. A V14 `type`, or the older numeric `mode` (2 add, 5 override); neither stated means add. */
function changeType(change) {
  if (change.type) return change.type in ITEM_MOD_DEFAULT_PRIORITY ? change.type : null;
  if (change.mode === undefined || change.mode === 2) return "add";
  return change.mode === 5 ? "override" : null;
}

/** The priority of a change: the one it states, else the default of its type (add before set, so a set wins). */
const priorityOf = (change, type) => (change.priority === null || change.priority === undefined || change.priority === "" || !Number.isFinite(Number(change.priority)) ? ITEM_MOD_DEFAULT_PRIORITY[type] : Number(change.priority));

/**
 * A change as the rules read it: { key, type: "add"|"override", value: number, priority }, or null when it is another kind of change or has no number.
 *
 * @param {{key?: string, type?: string, mode?: number, value?: *, priority?: *}} change one change of an effect
 */
export function changeOf(change) {
  const type = changeType(change);
  const value = Number(change.value);
  return type && Number.isFinite(value) && change.value !== "" && change.value !== null ? { key: String(change.key ?? ""), type, value, priority: priorityOf(change, type) } : null;
}

/** A change of an effect that is a stat of an item (its key starts with the item-mod prefix), as the rules read it; null for any other. */
const itemChangeOf = (change) => (String(change.key ?? "").startsWith(ITEM_MOD_KEY_PREFIX) ? changeOf(change) : null);

/**
 * The item-stat changes of the effects of an item, per stat.
 *
 * @param {Array<{disabled?: boolean, transfer?: boolean, system?: {changes?: object[]}, changes?: object[]}>} effects the item's effects (those that are disabled or that transfer to the owner count for nothing)
 * @returns {Object<string, {type: "add"|"override", value: number, priority: number}[]>} stat -> changes, e.g. { "impact.edged": [{ type: "add", value: 2, priority: 20 }] }
 */
export function itemModsOf(effects) {
  const mods = {};
  for (const effect of effects ?? []) {
    if (effect.disabled || effect.transfer) continue;
    for (const change of effect.system?.changes ?? effect.changes ?? []) {
      const read = itemChangeOf(change);
      if (read) (mods[read.key.slice(ITEM_MOD_KEY_PREFIX.length)] ??= []).push({ type: read.type, value: read.value, priority: read.priority });
    }
  }
  return mods;
}

/** A stat with its changes applied in priority order (equal priorities in the order the effects are on the item): an add adds, a set replaces the value so far. */
export function applyItemMods(base, changes = []) {
  return [...changes].sort((a, b) => a.priority - b.priority).reduce((value, change) => (change.type === "override" ? change.value : value + change.value), base);
}

/** The weapon stats with the modifiers applied. An impact of -1 ("this weapon lacks the aspect") and a durability of 0 ("not a breakable weapon", natural weapons) stay as they are. */
export function weaponEffective(weapon, mods) {
  const impact = {};
  for (const aspect of Object.keys(DAMAGE_ASPECTS)) {
    const base = weapon.impact?.[aspect] ?? 0;
    impact[aspect] = base < 0 ? base : applyItemMods(base, mods[`impact.${aspect}`]);
  }
  const quality = weapon.quality ?? 0;
  return {
    quality: quality > 0 ? applyItemMods(quality, mods.quality) : quality,
    attack: applyItemMods(weapon.attack ?? 0, mods.attack),
    defense: applyItemMods(weapon.defense ?? 0, mods.defense),
    specialization: applyItemMods(weapon.specialization ?? 0, mods.specialization),
    impact
  };
}

/** The armor protection with the modifiers applied, and its durability with the durability modifiers applied (never below 0; a worn-out piece, 0, and Natural Armor, -1, stay as they are). The stored durability is what wear lowers. */
export function armorEffective(armor, mods) {
  const protection = {};
  for (const aspect of Object.keys(DAMAGE_ASPECTS)) protection[aspect] = applyItemMods(armor.protection?.[aspect] ?? 0, mods[`protection.${aspect}`]);
  const quality = armor.quality ?? 0;
  return { protection, quality: quality > 0 ? Math.max(0, applyItemMods(quality, mods.quality)) : quality };
}

/**
 * A stat of a weapon or armor piece as combat sees it: the effective value (modifiers applied) when the item has one, else the stored one.
 *
 * @param {object} system the item's system data
 * @param {string} path e.g. "attack", "impact.edged", "protection.blunt", "quality"
 */
export function effectiveStat(system, path) {
  return getPath(system?.effective, path) ?? getPath(system, path);
}
