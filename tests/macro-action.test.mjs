// The "run macro" action (helpers/actions/macros.mjs): which triggers offer it, what the macro gets, and what is said when it cannot run. Also the list of macros the roll-down offers (helpers/macros.mjs). Fake macros and documents only.
import { resetStubState } from "./support/foundry-stub.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert";
import { ACTION_TRIGGERS, ACTION_KIND_MACRO } from "../module/config/index.mjs";
import { runActions } from "../module/helpers/actions/run.mjs";
import { rememberEntryNames } from "../module/helpers/actions/entries.mjs";
import { listMacros } from "../module/helpers/macros.mjs";
import { prepareActionsPanel } from "../module/sheets/actions/action-panel.mjs";

const warnings = [];
const executed = [];
beforeEach(() => {
  resetStubState();
  warnings.length = 0;
  executed.length = 0;
  globalThis.ui.notifications.warn = (text) => warnings.push(text);
  globalThis.game.user = { isGM: false };
  globalThis.game.macros = [];
  globalThis.game.packs = [];
});

const mara = { documentName: "Actor", id: "mara", uuid: "Actor.mara", name: "Mara" };
const macroDoc = (extra = {}) => ({ uuid: "Macro.m1", name: "Light the torch", canUserExecute: () => true, execute: async (scope) => { executed.push(scope); }, ...extra });
const itemWith = (actions, flags = {}) => ({ name: "Torch", uuid: "Item.t", parent: mara, system: { actions }, effects: { get: () => undefined }, getFlag: (scope, key) => flags[key], setFlag: async () => {} });
const action = (fields = {}) => ({ id: "a1", kind: "macro", when: "used", macro: "Macro.m1", ...fields });
const live = (...docs) => { globalThis.fromUuid = async (uuid) => docs.find(doc => doc.uuid === uuid) ?? null; };

test("the macro runs as the character that uses the item, with the item", async () => {
  const torch = itemWith([action()]);
  live(macroDoc());
  assert.strictEqual(await runActions(torch, "used"), 1);
  assert.strictEqual(executed.length, 1);
  assert.strictEqual(executed[0].actor, mara);
  assert.strictEqual(executed[0].item, torch);
  assert.deepStrictEqual(warnings, []);
});

test("a macro the user may not run is refused with a warning, and nothing runs", async () => {
  live(macroDoc({ canUserExecute: () => false }));
  assert.strictEqual(await runActions(itemWith([action()]), "used"), 0);
  assert.deepStrictEqual(executed, []);
  assert.match(warnings.join(" "), /macroNotAllowed/);
});

test("a macro that is gone is reported", async () => {
  live();
  assert.strictEqual(await runActions(itemWith([action()]), "used"), 0);
  assert.match(warnings.join(" "), /macroMissing/);
});

test("a macro that was made again is found by the name the item remembers", async () => {
  const again = macroDoc({ uuid: "Macro.new" });
  live(again);
  globalThis.game.macros = [{ uuid: "Macro.new", name: "Light the TORCH" }];
  assert.strictEqual(await runActions(itemWith([action({ macro: "Macro.old" })], { entryNames: { a1: "Light the torch" } }), "used"), 1);
  assert.strictEqual(executed.length, 1);
});

test("an item remembers the name of a macro it runs, whether the macro is in the world or in a compendium", async () => {
  const written = [];
  live(macroDoc(), macroDoc({ uuid: "Compendium.x.macros.Macro.c1", name: "Chime" }));
  const torch = itemWith([action(), action({ id: "a2", macro: "Compendium.x.macros.Macro.c1" })]);
  torch.setFlag = async (scope, key, value) => { written.push(value); };
  assert.strictEqual(await rememberEntryNames(torch), 2);
  assert.deepStrictEqual(written, [{ a1: "Light the torch" }, { a2: "Chime" }]);
});

test("the macro action is offered by used, consumed and inspected, and not by owned, hit or the region", () => {
  const offering = Object.entries(ACTION_TRIGGERS).filter(([, trigger]) => !trigger.kinds || trigger.kinds.includes(ACTION_KIND_MACRO)).map(([name]) => name);
  assert.deepStrictEqual(offering.sort(), ["consumed", "inspected", "used"]);
});

test("listMacros: the world's macros and those of each compendium of macros, sorted, empty groups left out", async () => {
  globalThis.game.macros = [{ uuid: "Macro.b", name: "Bell" }, { uuid: "Macro.a", name: "Alarm" }];
  const pack = (collection, label, documentName, names, visible = true) => ({ collection, documentName, visible, metadata: { label }, getIndex: async () => names.map(([id, name]) => ({ _id: id, name })) });
  globalThis.game.packs = { filter: (test) => [pack("x.macros", "System macros", "Macro", [["z", "Zap"], ["y", "Yell"]]), pack("x.empty", "Empty", "Macro", []), pack("x.items", "Items", "Item", [["i", "Rope"]]), pack("x.secret", "Secret", "Macro", [["s", "Hush"]], false)].filter(test) };
  const groups = await listMacros();
  assert.deepStrictEqual(groups.map(group => group.label), ["SCARMARK.Action.macrosWorld", "System macros"]);
  assert.deepStrictEqual(groups[0].entries.map(entry => entry.name), ["Alarm", "Bell"]);
  assert.deepStrictEqual(groups[1].entries.map(entry => [entry.name, entry.uuid]), [["Yell", "Compendium.x.macros.Macro.y"], ["Zap", "Compendium.x.macros.Macro.z"]]);
});

test("the Actions panel offers the macros in a roll-down for a macro row, and keeps a macro that is gone as missing", () => {
  const macros = [{ label: "World macros", entries: [{ uuid: "Macro.m1", name: "Light the torch" }] }];
  const rowOf = (fields) => prepareActionsPanel({ documentName: "Item", type: "gear", _source: { system: { usable: true, actions: [action(fields)] } } }, "system.actions", { macros }).rows[0];
  const row = rowOf({});
  assert.strictEqual(row.isMacro, true);
  assert.strictEqual(row.isEffect, false);
  assert.deepStrictEqual(row.macro.groups.map(group => group.options.map(option => [option.value, option.selected])), [[["Macro.m1", true]]]);
  const gone = rowOf({ macro: "Macro.old" });
  assert.deepStrictEqual(gone.macro.groups.map(group => group.label), ["World macros", "SCARMARK.Action.entryMissingGroup"]);
});
