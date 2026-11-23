/**
 * View models of the actor sheet's Profile, Skills and Gear tabs: attribute rows, skill groups, inventory lists and container blocks. Pure: no Foundry globals; items are read as plain data and the text comes in as a parameter.
 */
import { ATTRIBUTES } from "../config/index.mjs";
import { containerLoad } from "../rules/index.mjs";
import { durabilityText } from "./format.mjs";

/**
 * The Skills tab categories in display order (the keys are those of SCARMARK.skillCategories). Labels stay written out: tests/lang.test.mjs finds the lang keys by their literal text.
 */
export const SKILL_TABS = [
  { key: "skill", label: "SCARMARK.Skill.categorySkill", fullLabel: "SCARMARK.Skills.categorySkill" },
  { key: "combat", label: "SCARMARK.Skill.categoryCombat", fullLabel: "SCARMARK.Skills.categoryCombat" },
  { key: "esoterics", label: "SCARMARK.Skill.categoryEsoterics", fullLabel: "SCARMARK.Skills.categoryEsoterics", piety: true }
];

/**
 * The attribute grid: the displayed attributes in their two rows.
 *
 * @param {string[]} keys the attribute keys the actor type shows
 * @param {object} system the prepared system data (effective values)
 * @param {object} source the stored system data (editable inputs show the stored base, never the one an Active Effect raised)
 * @returns {{1: object[], 2: object[]}}
 */
export function attributeRows(keys, system, source) {
  const rows = { 1: [], 2: [] };
  for (const key of keys) {
    const cfg = ATTRIBUTES[key];
    rows[cfg.row].push({
      key,
      label: cfg.label,
      base: source.attributes?.[key]?.base ?? system.attributes[key].base,
      effective: system.attributes[key].effective
    });
  }
  return rows;
}

/** The skill categories of a sheet, each with the skills in it; `show` hides single skills (a creature hides the Religion skills). */
export function skillGroups(categories, items, show = () => true) {
  const skills = items.filter(i => i.type === "skill");
  return categories.map(cat => ({ ...cat, skills: skills.filter(s => s.system.category === cat.key && show(s)) }));
}

/**
 * The flat inventory lists: only top-level items (not those stored in a container, which appear nested under the Containers tab); rune-flagged gear lists in its own Runes section, not general Gear.
 */
export function inventoryLists(items) {
  const topLevel = (i) => !i.system.container;
  return {
    gearItems: items.filter(i => i.type === "gear" && !i.system.rune && topLevel(i)),
    runeItems: items.filter(i => i.type === "gear" && i.system.rune && topLevel(i)),
    weaponItems: items.filter(i => i.type === "weapon" && topLevel(i)),
    missileItems: items.filter(i => i.type === "missile" && topLevel(i)),
    armorItems: items.filter(i => i.type === "armor" && topLevel(i))
  };
}

/** Armor DUR column: current over original durability ("5/10"; "5/-" when the original is not set), by item id. `current` and `original` feed the editable cell of the Gear tab. */
export function armorDurability(armorItems, hint) {
  return Object.fromEntries(armorItems.map(item => [item.id, { text: durabilityText(item.system.quality, item.system.originalQuality), current: item.system.quality, original: item.system.originalQuality > 0 ? item.system.originalQuality : "-", title: hint }]));
}

/** The container items of an actor with what is stored in each and how full it is (the Containers tab). */
export function containerBlocks(items) {
  return items.filter(i => i.type === "container").map(c => {
    const contents = items.filter(i => i.system.container === c.id);
    const { contentWeight, overCapacity } = containerLoad(contents, c.system.maxCapacity);
    return {
      id: c.id,
      name: c.name,
      img: c.img,
      quantity: c.system.quantity,
      carried: c.system.carried,
      maxCapacity: c.system.maxCapacity,
      contentWeight,
      overCapacity,
      contents
    };
  });
}

/**
 * The width of the Condition bar in the sheet header: the Condition percentage held to 0-100 (the percentage itself can be above 100 or, with a broken value, not a number).
 *
 * @param {number} pct system.condition.pct
 * @returns {number}
 */
export function conditionBarPct(pct) {
  return Math.min(100, Math.max(0, Number(pct) || 0));
}
