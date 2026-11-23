// The Actions panel is not tied to items: it edits the list at any data path of any document, and the partial renders from the view model alone. Also: which actions a trigger sets off, and which effects an "owned" action makes passive.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { createRenderer } from "./support/render.mjs";
import { prepareActionsPanel, blankAction, ACTIONS_PANEL_TEMPLATE } from "../module/sheets/actions/action-panel.mjs";
import { ACTION_EDITOR_TEMPLATE } from "../module/sheets/actions/action-templates.mjs";
import { actionsFor, isTestAction, isAlterAction, isMessageAction, isEffectAction, parseActionTest, ownedEffectChanges } from "../module/rules/index.mjs";

const { render } = createRenderer();
/** The window that edits the first action of a panel. */
const editorHtml = (panel) => render(ACTION_EDITOR_TEMPLATE, { row: panel.rows[0] });
const effects = [{ id: "e1", name: "Bless" }, { id: "e2", name: "Curse <x>" }];
const action = (fields) => ({ id: "a", effect: "", on: "", targetItem: "", when: "", ...fields });
const values = (rollDown) => rollDown.options.map(o => o.value);
const panelOf = (fields, system = {}, extra = {}) => prepareActionsPanel({ documentName: "Item", _source: { system: { actions: [action(fields)], ...system } }, ...extra }).rows[0];

test("prepareActionsPanel: one row per action, roll-downs named by the data path, the stored effect selected", () => {
  const document = { documentName: "Item", effects, _source: { system: { actions: [action({ effect: "e2" }), action({ id: "b" })] } } };
  const panel = prepareActionsPanel(document);
  assert.strictEqual(panel.path, "system.actions");
  assert.deepStrictEqual(panel.rows.map(row => row.effect.name), ["system.actions.0.effect", "system.actions.1.effect"]);
  assert.deepStrictEqual(panel.rows[0].effect.groups.map(g => g.options.map(o => [o.value, o.label, o.selected])), [[["e1", "Bless", false], ["e2", "Curse <x>", true]]]);
  assert.deepStrictEqual([panel.rows[0].effect.blankSelected, panel.rows[1].effect.blankSelected], [false, true]);
});

test("prepareActionsPanel: the when roll-down follows the Usable and Consumable flags; a stored trigger stays", () => {
  assert.deepStrictEqual(values(panelOf({}).when), ["", "owned", "inspected"]);
  assert.deepStrictEqual(values(panelOf({}, { usable: true }).when), ["", "owned", "inspected", "used"]);
  assert.deepStrictEqual(values(panelOf({}, { consumable: true }).when), ["", "owned", "inspected", "consumed"]);
  assert.deepStrictEqual(values(panelOf({}, { usable: true, consumable: true }).when), ["", "owned", "inspected", "used", "consumed"]);
  assert.deepStrictEqual(panelOf({ when: "consumed" }).when.options.map(o => [o.value, o.selected]), [["", false], ["owned", false], ["inspected", false], ["consumed", true]]);
});

test("prepareActionsPanel: the on roll-down (self, selected token) shows only for an add-effect action of a trigger that asks for a target", () => {
  assert.strictEqual(panelOf({ when: "" }).showOn, false);
  assert.strictEqual(panelOf({ when: "owned" }).showOn, false);
  assert.strictEqual(panelOf({ when: "consumed" }).showOn, false);
  assert.strictEqual(panelOf({ when: "inspected" }).showOn, false, "everything inspected does is to the one who inspects");
  assert.strictEqual(panelOf({ when: "used", kind: "test", test: "skill:Vitality" }, { usable: true }).showOn, false);
  const used = panelOf({ when: "used", on: "self" }, { usable: true });
  assert.strictEqual(used.showOn, true);
  assert.deepStrictEqual(used.on.options.map(o => [o.value, o.selected]), [["", false], ["self", true], ["selectedToken", false]]);
});

test("prepareActionsPanel: the do roll-down has six kinds and defaults to add effect", () => {
  const row = panelOf({ effect: "e1" }, {}, { effects });
  assert.deepStrictEqual(row.kind.options.map(o => [o.value, o.selected]), [["effect", true], ["test", false], ["alter", false], ["message", false], ["remove", false], ["macro", false]]);
  assert.deepStrictEqual([row.isEffect, row.isTest, row.isAlter, row.isMessage], [true, false, false, false]);
  const message = panelOf({ kind: "message", message: "It smells of lavender." });
  assert.deepStrictEqual([message.isMessage, message.isEffect, message.showOn], [true, false, false]);
  assert.deepStrictEqual(message.message, { name: "system.actions.0.message", value: "It smells of lavender." });
});

test("prepareActionsPanel: a test action lists the tests instead of the effects", () => {
  const tests = [{ label: "Attributes", options: [{ value: "attribute:str", label: "Strength" }] }, { label: "Skills", options: [{ value: "skill:Vitality", label: "Vitality" }] }];
  const row = prepareActionsPanel({ documentName: "Item", effects, _source: { system: { consumable: true, actions: [action({ kind: "test", test: "skill:Vitality", when: "consumed" })] } } }, "system.actions", { tests }).rows[0];
  assert.deepStrictEqual([row.isTest, row.isEffect], [true, false]);
  assert.deepStrictEqual(row.test.groups.map(g => [g.label, g.options.map(o => [o.value, o.selected])]), [["Attributes", [["attribute:str", false]]], ["Skills", [["skill:Vitality", true]]]]);
  assert.strictEqual(row.test.blankSelected, false);
});

test("prepareActionsPanel: an alter row offers weapon and armor, then the alterations of the kind chosen, whatever the item sits on", () => {
  const alterations = { armor: [{ uuid: "Compendium.x.armor.ActiveEffect.r", name: "Repair" }, { uuid: "Compendium.x.armor.ActiveEffect.p", name: "Reinforced" }], weapon: [{ uuid: "Compendium.x.weapon.ActiveEffect.s", name: "Sharpened" }] };
  // A loose item (no character, no parent): the kinds and their alterations still show.
  const make = (fields) => prepareActionsPanel({ documentName: "Item", _source: { system: { usable: true, actions: [action({ kind: "alter", when: "used", ...fields })] } } }, "system.actions", { alterations }).rows[0];
  const none = make({});
  assert.deepStrictEqual([none.isAlter, none.showOn, none.isEffect], [true, false, false]);
  assert.deepStrictEqual(values(none.targetItem), ["", "armor", "weapon"]);
  assert.deepStrictEqual(values(none.alteration), [""], "no kind chosen yet: no alterations");
  const armor = make({ targetItem: "armor", alteration: "Compendium.x.armor.ActiveEffect.p" });
  assert.deepStrictEqual(armor.alteration.options.map(o => [o.label, o.selected]), [["", false], ["Repair", false], ["Reinforced", true]]);
  assert.deepStrictEqual(armor.targetItem.options.map(o => [o.value, o.selected]), [["", false], ["armor", true], ["weapon", false]]);
  assert.deepStrictEqual(values(make({ targetItem: "weapon" }).alteration), ["", "Compendium.x.weapon.ActiveEffect.s"]);
  assert.deepStrictEqual(values(make({ targetItem: "a2" }).alteration), [""], "an item id from the older version of the action offers nothing");
});

test("prepareActionsPanel: works at any path of any document (here a flag, no effects)", () => {
  const panel = prepareActionsPanel({ documentName: "Item", _source: { flags: { mod: { acts: [action({ id: "x" })] } } } }, "flags.mod.acts");
  assert.strictEqual(panel.path, "flags.mod.acts");
  assert.strictEqual(panel.rows[0].when.name, "flags.mod.acts.0.when");
  assert.deepStrictEqual(panel.rows[0].effect.groups, []);
});

test("prepareActionsPanel: the effect roll-down also offers the effect library, the stored library uuid selected", () => {
  const library = [{ label: "Effects", entries: [{ uuid: "Compendium.scarmark.effects.ActiveEffect.shaved", name: "Freshly shaved" }] }];
  const row = prepareActionsPanel({ documentName: "Item", effects, _source: { system: { actions: [action({ effect: "Compendium.scarmark.effects.ActiveEffect.shaved" })] } } }, "system.actions", { library }).rows[0];
  assert.deepStrictEqual(row.effect.groups.map(g => [g.label, g.options.map(o => [o.label, o.selected])]), [["SCARMARK.Action.thisItem", [["Bless", false], ["Curse <x>", false]]], ["Effects", [["Freshly shaved", true]]]]);
  const html = render(ACTION_EDITOR_TEMPLATE, { row });
  assert.ok(html.includes('<optgroup label="Effects">') && html.includes('<optgroup label="SCARMARK.Action.thisItem">'));
  assert.ok(html.includes('<option value="Compendium.scarmark.effects.ActiveEffect.shaved" selected>Freshly shaved</option>'));
});

test("parseActionTest: skill and attribute tests, an older bare skill name, no test", () => {
  assert.deepStrictEqual(parseActionTest("skill:Close Combat"), { type: "skill", name: "Close Combat" });
  assert.deepStrictEqual(parseActionTest("attribute:str"), { type: "attribute", name: "str" });
  assert.deepStrictEqual(parseActionTest("vitality"), { type: "skill", name: "vitality" });
  assert.strictEqual(parseActionTest(""), null);
  assert.strictEqual(parseActionTest(undefined), null);
});

test("actions-panel partial: when / do / effect / on, hidden id, escaped effect names, delete and add links, the empty line", () => {
  const document = { documentName: "Item", effects, _source: { system: { usable: true, actions: [action({ id: "a1", when: "used", effect: "e2", on: "selectedToken" })] } } };
  const panel = prepareActionsPanel(document);
  const html = editorHtml(panel);
  const panelHtml = render(ACTIONS_PANEL_TEMPLATE, { panel });
  assert.ok(panelHtml.includes('data-actions-path="system.actions"'));
  assert.ok(html.includes('name="system.actions.0.id" value="a1"'));
  assert.ok(html.includes('<option value="e2" selected>Curse &lt;x&gt;</option>'));
  for (const field of ["when", "kind", "effect", "on"]) assert.ok(html.includes(`name="system.actions.0.${field}"`), field);
  assert.ok(html.indexOf('name="system.actions.0.when"') < html.indexOf('name="system.actions.0.kind"') && html.indexOf('name="system.actions.0.kind"') < html.indexOf('name="system.actions.0.effect"'));
  for (const field of ["test", "alteration", "message", "targetItem"]) assert.ok(!html.includes(`name="system.actions.0.${field}"`), field);
  assert.ok(panelHtml.includes('data-action="deleteAction"') && panelHtml.includes('data-action="createAction"') && panelHtml.includes('data-action="editAction"'));
  assert.ok(!panelHtml.includes("<select") && !panelHtml.includes("<input"), "the panel lists names only");
  assert.ok(render(ACTIONS_PANEL_TEMPLATE, { panel: { path: "system.actions", rows: [] } }).includes("{SCARMARK.Action.none}"));
});

test("actions-panel partial: a test row shows the test roll-down only", () => {
  const html = editorHtml(prepareActionsPanel({ documentName: "Item", effects, _source: { system: { consumable: true, actions: [action({ when: "consumed", kind: "test", test: "skill:Vitality" })] } } }));
  assert.ok(html.includes('name="system.actions.0.test"'));
  for (const field of ["effect", "on", "alteration", "message", "targetItem"]) assert.ok(!html.includes(`name="system.actions.0.${field}"`), field);
});

test("actions-panel partial: an alter row shows the kind of item and its alteration; a message row shows the text", () => {
  const alterations = { armor: [{ uuid: "Compendium.x.armor.ActiveEffect.r", name: "Repair" }] };
  const alter = editorHtml(prepareActionsPanel({ documentName: "Item", effects, _source: { system: { usable: true, actions: [action({ kind: "alter", when: "used", targetItem: "armor", alteration: "Compendium.x.armor.ActiveEffect.r" })] } } }, "system.actions", { alterations }));
  for (const field of ["targetItem", "alteration"]) assert.ok(alter.includes(`name="system.actions.0.${field}"`), field);
  assert.ok(alter.includes('<option value="armor" selected>') && alter.includes('<option value="Compendium.x.armor.ActiveEffect.r" selected>Repair</option>'));
  assert.ok(alter.indexOf('name="system.actions.0.targetItem"') < alter.indexOf('name="system.actions.0.alteration"'));
  for (const field of ["effect", "on", "test", "message"]) assert.ok(!alter.includes(`name="system.actions.0.${field}"`), field);
  const message = editorHtml(prepareActionsPanel({ documentName: "Item", _source: { system: { actions: [action({ kind: "message", when: "inspected", message: 'It "glows" <b>' })] } } }));
  assert.ok(message.includes('name="system.actions.0.message" value="It &quot;glows&quot; &lt;b&gt;"'));
  for (const field of ["effect", "on", "targetItem", "alteration"]) assert.ok(!message.includes(`name="system.actions.0.${field}"`), field);
});

test("actionsFor: only the actions of that trigger that name what they do", () => {
  const list = [action({ effect: "u1", when: "used" }), action({ effect: "", when: "used" }), action({ effect: "u2", when: "" }), action({ effect: "u3", when: "used", on: "selectedToken" })];
  assert.deepStrictEqual(actionsFor(list, "used").map(a => a.effect), ["u1", "u3"]);
  assert.deepStrictEqual(actionsFor(undefined, "used"), []);
  const mixed = [action({ kind: "test", test: "skill:Vitality", when: "consumed" }), action({ kind: "test", test: "", when: "consumed" }), action({ kind: "effect", effect: "e1", when: "consumed" }), action({ kind: "test", effect: "e9", when: "consumed" })];
  assert.deepStrictEqual(actionsFor(mixed, "consumed").map(a => a.test || a.effect), ["skill:Vitality", "e1"]);
  assert.deepStrictEqual(mixed.map(isTestAction), [true, true, false, true]);
  const altered = [action({ kind: "alter", alteration: "repair", when: "used" }), action({ kind: "alter", alteration: "", when: "used", effect: "e1" })];
  assert.deepStrictEqual(actionsFor(altered, "used").map(a => a.alteration), ["repair"]);
  assert.deepStrictEqual(altered.map(isAlterAction), [true, true]);
  const messages = [action({ kind: "message", message: "Hello", when: "used" }), action({ kind: "message", message: "   ", when: "used" }), action({ kind: "message", message: "", when: "used" })];
  assert.deepStrictEqual(actionsFor(messages, "used").map(a => a.message), ["Hello"]);
  assert.deepStrictEqual(messages.map(isMessageAction), [true, true, true]);
});

test("isEffectAction: an older action with no kind adds an effect", () => {
  assert.strictEqual(isEffectAction(action({})), true);
  assert.deepStrictEqual([action({ kind: "test" }), action({ kind: "alter" }), action({ kind: "message" })].map(isEffectAction), [false, false, false]);
});

test("ownedEffectChanges: an owned action makes its effect transfer; removing it undoes only what it did", () => {
  const list = [{ id: "e1", transfer: false, managed: false }, { id: "e2", transfer: true, managed: true }, { id: "e3", transfer: true, managed: false }, { id: "e4", transfer: false, managed: false }];
  const owned = (effect) => action({ when: "owned", effect });
  assert.deepStrictEqual(ownedEffectChanges(list, [owned("e1"), owned("e2"), action({ when: "used", effect: "e4" })]), [{ id: "e1", transfer: true, managed: true }]);
  assert.deepStrictEqual(ownedEffectChanges(list, []), [{ id: "e2", transfer: false, managed: false }]);
  assert.deepStrictEqual(ownedEffectChanges(list, undefined), [{ id: "e2", transfer: false, managed: false }]);
  assert.deepStrictEqual(ownedEffectChanges(list, [action({ when: "owned", kind: "test", test: "skill:Vitality", effect: "e1" })]), [{ id: "e2", transfer: false, managed: false }]);
});

// ---- remove effect: the kind, the "wounds" trigger of a weapon, and who it acts on

import { isRemoveAction, asksTarget, targetOf, effectsMatching, unfinishedActions } from "../module/rules/index.mjs";

test("isRemoveAction: only the remove kind, and it is not an add-effect action", () => {
  assert.strictEqual(isRemoveAction({ kind: "remove" }), true);
  assert.strictEqual(isEffectAction({ kind: "remove" }), false);
  assert.deepStrictEqual([{}, { kind: "effect" }, { kind: "test" }].map(isRemoveAction), [false, false, false]);
});

test("actionsFor: a trigger runs only the kinds it allows; wounds runs removals, owned does not", () => {
  const actions = [{ kind: "remove", effect: "Compendium.x.y.A", when: "hit" }, { kind: "effect", effect: "e1", when: "hit" }, { kind: "message", message: "hi", when: "hit" }, { kind: "remove", effect: "Compendium.x.y.A", when: "owned" }, { kind: "remove", effect: "Compendium.x.y.A", when: "used" }];
  assert.deepStrictEqual(actionsFor(actions, "hit").map(a => a.kind), ["remove"]);
  assert.deepStrictEqual(actionsFor(actions, "owned"), []);
  assert.deepStrictEqual(actionsFor(actions, "used").map(a => a.kind), ["remove"]);
  assert.deepStrictEqual(actionsFor([{ kind: "remove", effect: "", when: "used" }], "used"), [], "a removal that names no effect does nothing");
});

test("asksTarget and targetOf: a removal asks on used and consumed; inspected is always the one who inspects; an add-effect keeps self on consumed; wounds acts on the one hit", () => {
  const remove = (on) => ({ kind: "remove", on });
  const add = (on) => ({ kind: "effect", on });
  assert.deepStrictEqual(["used", "inspected", "consumed"].map(when => asksTarget(when, remove())), [true, false, true]);
  assert.deepStrictEqual(["used", "inspected", "consumed"].map(when => asksTarget(when, add())), [true, false, false]);
  assert.strictEqual(asksTarget("hit", remove()), false);
  assert.strictEqual(asksTarget("used", { kind: "test" }), false);
  assert.strictEqual(targetOf("consumed", remove("selectedToken")), "selectedToken");
  assert.strictEqual(targetOf("consumed", add("selectedToken")), "self");
  assert.strictEqual(targetOf("used", add("selectedToken")), "selectedToken");
  assert.strictEqual(targetOf("hit", remove("selectedToken")), "hit", "the one hit, whatever was stored");
  assert.strictEqual(targetOf("consumed", remove("")), "", "never chosen: nobody to act on");
});

test("effectsMatching: the effects put there from the library entry and the ones with its name, ignoring case and spaces", () => {
  const effects = [{ id: "a", name: "Stillhand Poisoning (Combat)", origin: "" }, { id: "b", name: " stillhand poisoning (combat) " }, { id: "c", name: "Renamed", origin: "Compendium.x.p.1" }, { id: "d", name: "Other", origin: "Compendium.x.p.2" }];
  assert.deepStrictEqual(effectsMatching(effects, { uuid: "Compendium.x.p.1", name: "Stillhand Poisoning (Combat)" }), ["a", "b", "c"]);
  assert.deepStrictEqual(effectsMatching(effects, { uuid: "", name: "" }), []);
  assert.deepStrictEqual(effectsMatching(undefined, { uuid: "u", name: "n" }), []);
});

test("prepareActionsPanel: wounds is offered on weapons only; its kind roll-down holds only the removal; a stored kind stays", () => {
  const weapon = (fields) => prepareActionsPanel({ documentName: "Item", type: "weapon", _source: { system: { actions: [action(fields)] } } }).rows[0];
  const gear = prepareActionsPanel({ documentName: "Item", type: "gear", _source: { system: { actions: [action({})] } } }).rows[0];
  assert.deepStrictEqual(values(weapon({}).when), ["", "owned", "inspected", "hit"]);
  assert.deepStrictEqual(values(gear.when), ["", "owned", "inspected"]);
  assert.deepStrictEqual(values(weapon({ when: "hit", kind: "remove" }).kind), ["remove"]);
  assert.deepStrictEqual(values(weapon({ when: "hit" }).kind), ["effect", "remove"], "a fresh row is add effect, which stays on offer so nothing is silently lost (it never fires on wounds)");
  assert.deepStrictEqual(values(weapon({ when: "owned" }).kind), ["effect", "test", "alter", "message"]);
  assert.strictEqual(weapon({ when: "hit", kind: "remove" }).showOn, false);
});

test("prepareActionsPanel: a removal row lists the library effects, and asks self or selected token on consumed", () => {
  const library = [{ label: "Poisonings", entries: [{ uuid: "Compendium.x.p.1", name: "Stillhand Poisoning (Combat)" }] }];
  const row = prepareActionsPanel({ documentName: "Item", effects, type: "gear", _source: { system: { consumable: true, actions: [action({ kind: "remove", when: "consumed", effect: "Compendium.x.p.1", on: "selectedToken" })] } } }, undefined, { library }).rows[0];
  assert.deepStrictEqual([row.isRemove, row.isEffect, row.showOn], [true, false, true]);
  assert.deepStrictEqual(row.removal.groups.map(g => g.options.map(o => [o.value, o.label, o.selected])), [[["Compendium.x.p.1", "Stillhand Poisoning (Combat)", true]]], "only the library, not the item's own effects");
  assert.strictEqual(row.removal.name, "system.actions.0.effect");
  assert.deepStrictEqual(row.on.options.map(o => [o.value, o.selected]), [["", false], ["self", false], ["selectedToken", true]]);
  const html = render(ACTION_EDITOR_TEMPLATE, { row });
  assert.ok(html.includes('name="system.actions.0.effect"') && html.includes('name="system.actions.0.on"') && html.includes('name="system.actions.0.kind"'));
  assert.ok(!html.includes('name="system.actions.0.message"') && !html.includes('name="system.actions.0.test"'));
});

test("unfinishedActions: the actions of a trigger that name nothing yet, of any kind the trigger runs", () => {
  const actions = [
    { kind: "alter", when: "used", targetItem: "weapon", alteration: "" },
    { kind: "alter", when: "used", targetItem: "weapon", alteration: "Compendium.x.w.sharp" },
    { kind: "effect", when: "used", effect: "" },
    { kind: "test", when: "used", test: "" },
    { kind: "message", when: "used", message: "  " },
    { kind: "remove", when: "consumed", effect: "" },
    { kind: "effect", when: "hit", effect: "" }
  ];
  assert.deepStrictEqual(unfinishedActions(actions, "used").map(a => a.kind), ["alter", "effect", "test", "message"]);
  assert.deepStrictEqual(unfinishedActions(actions, "consumed").map(a => a.kind), ["remove"]);
  assert.deepStrictEqual(unfinishedActions(actions, "hit"), [], "wounds only runs removals, so an add-effect row there is not a half-set action");
  assert.deepStrictEqual(unfinishedActions(undefined, "used"), []);
});

test("every action has a name the user can change; a new action starts with an empty one", () => {
  const row = panelOf({ name: "Drink the tonic" });
  assert.deepStrictEqual(row.name, { name: "system.actions.0.name", value: "Drink the tonic" });
  assert.strictEqual(panelOf({}).name.value, "", "an action stored before names existed shows an empty name");
  assert.strictEqual(blankAction({ documentName: "Item", _source: {} }, "x").name, "");
});

test("an action entry body shows the lines of its action and none of the panel controls", () => {
  const actionsPanel = prepareActionsPanel({ documentName: "Item", type: "action", effects, _source: { system: { actions: [action({ id: "z", when: "used", kind: "effect", effect: "e1" }), action({ id: "y" })] } } });
  const html = render("systems/scarmark/templates/item/parts/action-entry.hbs", { actionsPanel });
  assert.ok(html.includes('data-actions-path="system.actions"'));
  assert.ok(html.includes('name="system.actions.0.when"') && html.includes('name="system.actions.0.kind"') && html.includes('name="system.actions.0.effect"'));
  assert.ok(html.includes('name="system.actions.0.id" value="z"') && html.includes('name="system.actions.1.id"'), "a stored entry with more than one action shows each one");
  for (const gone of ["add-action", "action-name", "action-delete", "action-toggle", "actions-header", "action-empty"]) assert.ok(!html.includes(gone), `${gone} is not in an entry body`);
});

test("an action can be switched off: it stays in the list, shows the off switch, and no trigger sets it off", () => {
  const off = panelOf({ disabled: true, name: "Sip", effect: "e1", when: "used" });
  assert.strictEqual(off.disabled, true);
  assert.strictEqual(panelOf({}).disabled, false, "an action stored before the switch existed is on");
  const html = render(ACTIONS_PANEL_TEMPLATE, { panel: { path: "system.actions", rows: [off, panelOf({ effect: "e1" })] } });
  assert.ok(html.includes("fa-toggle-off") && html.includes("fa-toggle-on"));
  assert.ok(html.includes("action-entry action-off"));
  const actions = [{ id: "a", kind: "effect", effect: "e1", when: "used", disabled: true }, { id: "b", kind: "effect", effect: "e2", when: "used" }];
  assert.deepStrictEqual(actionsFor(actions, "used").map(a => a.id), ["b"]);
  assert.deepStrictEqual(unfinishedActions([{ id: "c", kind: "effect", when: "used", disabled: true }], "used"), [], "a switched-off unfinished action is not warned about");
  assert.deepStrictEqual(ownedEffectChanges([{ id: "x", transfer: true, managed: true }], [{ kind: "effect", effect: "x", when: "owned", disabled: true }]).map(c => [c.id, c.transfer]), [["x", false]], "a switched-off owned action stops transferring its effect");
});

test("the panel lists each action by its name only; an action without one shows the unnamed label", () => {
  const panel = prepareActionsPanel({ documentName: "Item", effects, _source: { system: { actions: [action({ id: "n", name: "Drink <it>" }), action({ id: "u" })] } } });
  assert.deepStrictEqual(panel.rows.map(row => row.label), ["Drink <it>", "SCARMARK.Action.unnamed"]);
  const html = render(ACTIONS_PANEL_TEMPLATE, { panel });
  assert.ok(html.includes("Drink &lt;it&gt;"));
  assert.strictEqual(html.match(/data-action="editAction"/g).length, 2);
  assert.ok(html.includes('data-index="0"') && html.includes('data-index="1"'), "the rows are what drags and what the click handlers find");
});

test("the action editor window: the name and the lines of the action, nothing when the action is gone", () => {
  const html = editorHtml(prepareActionsPanel({ documentName: "Item", effects, _source: { system: { actions: [action({ id: "a1", name: "Sip", when: "used", effect: "e1" })] } } }));
  assert.ok(html.includes('name="system.actions.0.name" value="Sip"') && html.includes('name="system.actions.0.id" value="a1"') && html.includes('name="system.actions.0.when"'));
  for (const gone of ["add-action", "action-delete", "action-toggle"]) assert.ok(!html.includes(gone), gone);
  assert.strictEqual(render(ACTION_EDITOR_TEMPLATE, { row: null }).trim(), "");
});
