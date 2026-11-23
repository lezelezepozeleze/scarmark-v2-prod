// Doing something to a document that may belong to somebody else (helpers/gm-relay.mjs): the owner does it, anybody else asks the active GM, and the user is told when that cannot be done. Fake documents and users only.
import { test, beforeEach } from "node:test";
import assert from "node:assert";
import "./support/foundry-stub.mjs";
import { doOrAskGM } from "../module/helpers/gm-relay.mjs";

const warnings = [];
const done = [];
beforeEach(() => {
  warnings.length = 0;
  done.length = 0;
  globalThis.ui.notifications.warn = (text) => warnings.push(text);
  globalThis.game.users = { activeGM: null };
});

const direct = async () => { done.push("direct"); };
const gmThat = (behaviour) => ({ query: async (query, payload) => behaviour(query, payload) });

test("the owner does it directly and the GM is not asked", async () => {
  globalThis.game.users.activeGM = gmThat(() => assert.fail("the GM must not be asked"));
  assert.strictEqual(await doOrAskGM({ isOwner: true }, direct, "q", {}), true);
  assert.deepStrictEqual(done, ["direct"]);
  assert.deepStrictEqual(warnings, []);
});

test("anybody else asks the active GM, with the query and its payload", async () => {
  const asked = [];
  globalThis.game.users.activeGM = gmThat((query, payload) => asked.push([query, payload]));
  assert.strictEqual(await doOrAskGM({ isOwner: false }, direct, "scarmark.removeEffects", { uuid: "u" }), true);
  assert.deepStrictEqual(asked, [["scarmark.removeEffects", { uuid: "u" }]]);
  assert.deepStrictEqual(done, []);
});

test("without a GM connected nothing is done and the user is told", async () => {
  assert.strictEqual(await doOrAskGM({ isOwner: false }, direct, "q", {}), false);
  assert.match(warnings.join(" "), /needGM/);
});

test("a GM that refuses or fails is reported the same way, and logged", async () => {
  globalThis.game.users.activeGM = gmThat(() => { throw new Error("refused"); });
  const logged = [];
  const saved = console.warn;
  console.warn = (...args) => logged.push(args);
  try {
    assert.strictEqual(await doOrAskGM({ isOwner: false }, direct, "q", {}), false);
  } finally {
    console.warn = saved;
  }
  assert.match(warnings.join(" "), /needGM/);
  assert.strictEqual(logged.length, 1);
});
