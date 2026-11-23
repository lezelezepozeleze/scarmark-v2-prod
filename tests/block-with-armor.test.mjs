// Blocking with a body location: when does the block turn the blow onto the chosen location (rules/outcome.mjs blowBlocked)?
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { blowBlocked, resolveOutcome, isBlockResult } from "../module/rules/index.mjs";

const LEVELS = ["cs", "ms", "mf", "cf"];
const pairs = LEVELS.flatMap(a => LEVELS.map(d => [a, d]));
const success = (level) => level === "cs" || level === "ms";

test("blowBlocked: only when the attack succeeded and the block succeeded at least as well", () => {
  assert.deepStrictEqual(pairs.filter(([a, d]) => blowBlocked(a, d)).map(pair => pair.join("/")), ["cs/cs", "ms/cs", "ms/ms"]);
});

test("blowBlocked agrees with resolveOutcome: a successful attack the attacker does not strike with is exactly a blocked blow", () => {
  for (const [a, d] of pairs) {
    const outcome = resolveOutcome(a, "block", d);
    assert.strictEqual(blowBlocked(a, d), success(a) && !outcome.attackerStrikes, `${a}/${d}`);
  }
});

test("blowBlocked: a block result (the weapons meet) is always a blocked blow, a clean parry too, a failed attack never", () => {
  for (const [a, d] of pairs) {
    if (isBlockResult(a, d)) assert.strictEqual(blowBlocked(a, d), true, `${a}/${d}`);
    if (!success(a)) assert.strictEqual(blowBlocked(a, d), false, `${a}/${d}`);
  }
  assert.strictEqual(blowBlocked("ms", "cs"), true);
  assert.strictEqual(isBlockResult("ms", "cs"), false);
});
