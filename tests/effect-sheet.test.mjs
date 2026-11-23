// The effect sheet: its view model (view/effect-sheet-view.mjs), its template (templates/effect/sheet.hbs) and the rules an immediate effect rewrites by (rules/rewrite.mjs). All run without Foundry.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { SYSTEM_ID } from "../module/constants.mjs";
import { changeOf, rewriteTarget, rewrittenValues, rewrittenItem, itemModsOf, isImmediateEffect } from "../module/rules/index.mjs";
import { buildEffectTypes, rowsForType } from "../module/view/effects-view.mjs";
import { buildEffectSheet } from "../module/view/effect-sheet-view.mjs";
import { createRenderer } from "./support/render.mjs";

const t = (key) => key;
const actor = { parent: { documentName: "Actor", items: [] } };
const sheet = (effect, onItem = false, parent = actor) => buildEffectSheet(effect, { picker: buildEffectTypes({ parent, transfer: effect.transfer }, { localize: t, skillNames: ["Vitality"] }), localize: t, onItem });
const effect = (scope = {}, extra = {}) => ({ name: "Tonic", flags: { [SYSTEM_ID]: scope }, system: { changes: [{ key: "system.attributes.str.base", type: "add", value: 2, priority: null, phase: "initial" }] }, ...extra });
const selected = (options) => options.filter(entry => entry.selected).map(entry => entry.value);

test("changeOf: add and set with a number, the default priority of the type, nothing else", () => {
  assert.deepStrictEqual(changeOf({ key: "a", type: "add", value: "3" }), { key: "a", type: "add", value: 3, priority: 20 });
  assert.deepStrictEqual(changeOf({ key: "a", type: "override", value: 1, priority: 7 }), { key: "a", type: "override", value: 1, priority: 7 });
  assert.deepStrictEqual(changeOf({ key: "a", mode: 5, value: 1 }), { key: "a", type: "override", value: 1, priority: 50 });
  for (const change of [{ key: "a", type: "multiply", value: 2 }, { key: "a", type: "add", value: "" }, { key: "a", type: "add", value: null }, { key: "a", type: "add", value: "x" }]) assert.strictEqual(changeOf(change), null);
});

test("rewriteTarget: attribute bases, fatigue and skill levels can be rewritten, the mods of an effect cannot", () => {
  assert.deepStrictEqual(rewriteTarget("system.attributes.str.base"), { kind: "actor", path: "system.attributes.str.base" });
  assert.deepStrictEqual(rewriteTarget("system.resources.fatigue"), { kind: "actor", path: "system.resources.fatigue" });
  assert.deepStrictEqual(rewriteTarget("system.mods.skill.Vitality"), { kind: "skill", name: "Vitality" });
  for (const key of ["system.mods.meleeAttack", "system.mods.skills.combat", "system.mods.skill.", "system.attributes.str.effective", ""]) assert.strictEqual(rewriteTarget(key), null);
});

test("rewrittenValues: the changes of a key apply in priority order to its stored value, never below 0", () => {
  const add = (key, value, priority = 20) => ({ key, type: "add", value, priority });
  const set = (key, value, priority = 50) => ({ key, type: "override", value, priority });
  assert.deepStrictEqual(rewrittenValues({ a: 5, b: 2 }, [add("a", 2), add("b", -9), add("c", 1)]), { a: 7, b: 0 });
  assert.deepStrictEqual(rewrittenValues({ a: 5 }, [set("a", 9), add("a", 2)]), { a: 9 });
  assert.deepStrictEqual(rewrittenValues({ a: 5 }, []), {});
});

test("rewrittenItem: a weapon's stats and durability, an armor piece's protection and durability, nothing the item lacks", () => {
  const mods = (changes) => itemModsOf([{ system: { changes } }]);
  const add = (stat, value) => ({ key: `system.itemMods.${stat}`, type: "add", value });
  const weapon = { quality: 15, attack: 3, defense: 1, specialization: 0, impact: { blunt: 2, edged: 4, piercing: -1, fire: 0 } };
  assert.deepStrictEqual(rewrittenItem("weapon", weapon, mods([add("attack", 2), add("quality", 4), add("impact.edged", -9), add("impact.piercing", 3), add("protection.blunt", 1)])), { "system.attack": 5, "system.quality": 16, "system.impact.edged": 0 });
  assert.deepStrictEqual(rewrittenItem("weapon", { ...weapon, quality: 0 }, mods([add("quality", 3)])), {});
  const armor = { protection: { blunt: 1, edged: 2, piercing: 0, fire: 0 }, quality: 3 };
  const update = rewrittenItem("armor", armor, mods([add("quality", 2), add("protection.edged", 1)]));
  assert.strictEqual(update["system.quality"], 5);
  assert.strictEqual(update["system.protection.edged"], 3);
  assert.strictEqual(armor.quality, 3);
  assert.deepStrictEqual(rewrittenItem("armor", { ...armor, quality: 0 }, mods([add("quality", 2)])), {});
});

test("isImmediateEffect: only an effect flagged immediate", () => {
  assert.strictEqual(isImmediateEffect(effect({ immediate: true })), true);
  assert.strictEqual(isImmediateEffect(effect({ immediate: false })), false);
  assert.strictEqual(isImmediateEffect(effect()), false);
});

test("effect sheet: a character effect lists the character stats and every change type, with the priority of each row", () => {
  const view = sheet(effect());
  assert.deepStrictEqual(selected(view.typeOptions), ["character"]);
  assert.deepStrictEqual(selected(view.kindOptions), ["ongoing"]);
  assert.deepStrictEqual(view.rows[0].typeOptions.map(entry => entry.value), ["add", "multiply", "upgrade", "downgrade", "override"]);
  assert.deepStrictEqual(selected(view.rows[0].keyGroups.flatMap(group => group.options)), ["system.attributes.str.base"]);
  assert.strictEqual(view.rows[0].priorityHint, "20");
  assert.ok(view.showDuration && view.showUnique);
  assert.ok(!view.showOnHit && !view.showRepair);
});

test("effect sheet: an immediate character effect offers only stored values and only add or set, and lasts nothing", () => {
  const view = sheet(effect({ immediate: true }));
  assert.deepStrictEqual(selected(view.kindOptions), ["immediate"]);
  assert.deepStrictEqual(view.rows[0].typeOptions.map(entry => entry.value), ["add", "override"]);
  const keys = view.rows[0].keyGroups.flatMap(group => group.options.map(entry => entry.value));
  assert.ok(keys.includes("system.attributes.str.base") && keys.includes("system.resources.fatigue") && keys.includes("system.mods.skill.Vitality"));
  assert.ok(keys.every(key => !key.startsWith("system.mods.") || key.startsWith("system.mods.skill.")));
  assert.ok(!view.showDuration && !view.showUnique);
});

test("effect sheet: a weapon effect lists weapon stats and add or set; on hit only on a weapon that is ongoing; repair only on immediate armor", () => {
  const weapon = sheet(effect({ effectType: "weapon" }));
  assert.ok(weapon.showOnHit);
  assert.deepStrictEqual(weapon.rows[0].typeOptions.map(entry => entry.value), ["add", "override"]);
  assert.ok(weapon.rows[0].keyGroups.some(group => group.options.some(entry => entry.value === "system.itemMods.attack")));
  assert.ok(!sheet(effect({ effectType: "weapon", immediate: true })).showOnHit);
  assert.ok(!sheet(effect({ effectType: "armor" })).showRepair);
  assert.ok(sheet(effect({ effectType: "armor", immediate: true, alteration: "repair" })).repair);
});

test("effect sheet: a key no stat list offers is kept in a group of its own; an effect on a weapon starts as a weapon effect unless it transfers", () => {
  const odd = effect();
  odd.system.changes[0].key = "system.custom.thing";
  assert.deepStrictEqual(sheet(odd).rows[0].keyGroups.at(-1).options.map(entry => entry.value), ["system.custom.thing"]);
  const onWeapon = { documentName: "Item", type: "weapon", parent: { documentName: "Actor", items: [] } };
  assert.deepStrictEqual(selected(sheet(effect(), true, onWeapon).typeOptions), ["weapon"]);
  assert.deepStrictEqual(selected(sheet(effect({}, { transfer: true }), true, onWeapon).typeOptions), ["character"]);
  assert.ok(sheet(effect({}, { transfer: true }), true, onWeapon).showTransfer);
  assert.ok(!sheet(effect()).showTransfer);
});

test("effect sheet template: renders the rows, the kind choice and the sections the view model switches on", () => {
  const renderer = createRenderer();
  const html = renderer.render("systems/scarmark/templates/effect/sheet.hbs", sheet(effect({ effectType: "weapon" })));
  const names = [
    "name", "disabled", "flags.scarmark.effectType", "flags.scarmark.kind", "system.changes.0.key", "system.changes.0.type",
    "system.changes.0.value", "system.changes.0.priority", "system.changes.0.phase", "duration.value", "duration.units",
    "flags.scarmark.unique", "flags.scarmark.onHit", "flags.scarmark.onHitTest", "flags.scarmark.onHitEffect",
    "flags.scarmark.charges"
  ];
  for (const name of names) assert.ok(html.includes(`name="${name}"`), name);
  for (const action of ["editImage", "addChange", "deleteChange"]) assert.ok(html.includes(`data-action="${action}"`), action);
  assert.ok(!html.includes("prose-mirror"), "an effect has no description on this sheet");
  const immediate = renderer.render("systems/scarmark/templates/effect/sheet.hbs", sheet(effect({ effectType: "armor", immediate: true })));
  assert.ok(immediate.includes('name="repair"') && !immediate.includes('name="duration.value"') && !immediate.includes("onHitTest"));
});

test("rowsForType: kept as they are, unless the type was just changed: then the stats the new type does not offer go, a blank row stays", () => {
  const picker = buildEffectTypes(actor, { localize: t });
  const rows = [{ key: "system.attributes.str.base" }, { key: "" }, { key: "system.itemMods.attack" }];
  assert.deepStrictEqual(rowsForType(rows, picker, "weapon", false), rows);
  assert.deepStrictEqual(rowsForType(rows, picker, "weapon", true), [{ key: "" }, { key: "system.itemMods.attack" }]);
  assert.deepStrictEqual(rowsForType(rows, picker, "character", true), [{ key: "system.attributes.str.base" }, { key: "" }]);
  assert.deepStrictEqual(rowsForType(rows, picker, "unknown", true), [{ key: "" }]);
});
