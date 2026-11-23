// Items that are used up when used (honing oil): which uses spend a unit. Pure rule, rules/actions.mjs spendsOnUse.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { spendsOnUse } from "../module/rules/index.mjs";

test("spendsOnUse: a used-up item is spent when its use did something, or when it has no actions at all", () => {
  const oil = { usedUp: true };
  assert.strictEqual(spendsOnUse(oil, 1, 1), true, "its action altered the knife");
  assert.strictEqual(spendsOnUse(oil, 2, 3), true);
  assert.strictEqual(spendsOnUse(oil, 0, 0), true, "no actions: using it is the point");
});

test("spendsOnUse: a refused or cancelled use leaves the item unspent, and an item that is not used up is never spent", () => {
  assert.strictEqual(spendsOnUse({ usedUp: true }, 1, 0), false, "the dialog was closed, or the alteration was refused");
  assert.strictEqual(spendsOnUse({ usedUp: false }, 1, 1), false, "a whetstone lasts");
  assert.strictEqual(spendsOnUse({}, 0, 0), false);
  assert.strictEqual(spendsOnUse(undefined, 0, 0), false);
});
