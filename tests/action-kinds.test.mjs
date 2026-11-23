// The kinds of action (config/actions.mjs ACTION_KINDS) are the one list every part reads: each kind names the stored field that says what it does, and the rules of actions follow from that. The tests walk the list, so a new kind is covered the moment it is added.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { ACTION_KINDS, ACTION_KIND_EFFECT, ACTION_TRIGGER_USED } from "../module/config/index.mjs";
import { actionsFor, unfinishedActions, kindOf, targetOf, isEffectAction, isTestAction, isAlterAction, isMessageAction, isRemoveAction, isMacroAction } from "../module/rules/index.mjs";

const PREDICATES = [isEffectAction, isTestAction, isAlterAction, isMessageAction, isRemoveAction, isMacroAction];

test("every kind has a label and the field that says what it does", () => {
  for (const [kind, definition] of Object.entries(ACTION_KINDS)) {
    assert.match(definition.label, /^SCARMARK\.Action\./, kind);
    assert.ok(definition.field, `${kind} has no field`);
  }
});

test("an action is finished when its kind's field is filled, and unfinished when it is empty", () => {
  for (const [kind, { field }] of Object.entries(ACTION_KINDS)) {
    const filled = { kind, when: ACTION_TRIGGER_USED, [field]: "something" };
    const empty = { kind, when: ACTION_TRIGGER_USED, [field]: "" };
    assert.deepStrictEqual(actionsFor([filled], ACTION_TRIGGER_USED), [filled], `${kind}: filled is run`);
    assert.deepStrictEqual(unfinishedActions([filled], ACTION_TRIGGER_USED), [], `${kind}: filled is finished`);
    assert.deepStrictEqual(actionsFor([empty], ACTION_TRIGGER_USED), [], `${kind}: empty is not run`);
    assert.deepStrictEqual(unfinishedActions([empty], ACTION_TRIGGER_USED), [empty], `${kind}: empty is unfinished`);
  }
});

test("a message of only spaces is unfinished (the text is trimmed)", () => {
  const blank = { kind: "message", when: ACTION_TRIGGER_USED, message: "   " };
  assert.deepStrictEqual(unfinishedActions([blank], ACTION_TRIGGER_USED), [blank]);
});

test("every kind is recognised by exactly one of the isXAction rules", () => {
  for (const kind of Object.keys(ACTION_KINDS)) {
    assert.strictEqual(PREDICATES.filter(is => is({ kind })).length, 1, kind);
  }
});

test("an action with no kind, or one nobody knows, is an add-effect action", () => {
  for (const action of [{}, { kind: "" }, { kind: "mystery" }]) {
    assert.strictEqual(isEffectAction(action), true, JSON.stringify(action));
  }
  assert.strictEqual(kindOf({}), ACTION_KIND_EFFECT);
  const old = { when: ACTION_TRIGGER_USED, effect: "e1" };
  assert.deepStrictEqual(actionsFor([old], ACTION_TRIGGER_USED), [old]);
});

test("inspected: add effect, remove effect, roll and message, all to the one who inspects (alter is not for it)", () => {
  const when = "inspected";
  const runs = (action) => actionsFor([{ when, ...action }], "inspected").length === 1;
  assert.deepStrictEqual([runs({ kind: "effect", effect: "e1" }), runs({ kind: "remove", effect: "Compendium.x.y" }), runs({ kind: "test", test: "skill:Vitality" }), runs({ kind: "message", message: "Hi" })], [true, true, true, true]);
  assert.strictEqual(runs({ kind: "alter", alteration: "Compendium.x.y" }), false);
  for (const kind of ["effect", "remove"]) assert.strictEqual(targetOf("inspected", { kind, on: "selectedToken" }), "self", `${kind} ignores a chosen target`);
});
