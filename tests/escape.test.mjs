// Names from documents must be escaped wherever Scarmark builds chat or dialog HTML (the escaping rule in docs/AGENTS.md).
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { esc, escAttr } from "../module/helpers/escape.mjs";
import { taLines } from "../module/helpers/combat/result-lines.mjs";
import { cardButton } from "../module/helpers/combat/card-buttons.mjs";

const EVIL = `<img src=x onerror="alert(1)"> & 'q'`;

test("esc: escapes markup and quotes, null and undefined become empty", () => {
  const out = esc(EVIL);
  assert.ok(!out.includes("<") && !out.includes(">") && !out.includes('"') && !out.includes("'"));
  assert.strictEqual(esc(null), "");
  assert.strictEqual(esc(undefined), "");
  assert.strictEqual(esc(5), "5");
});

test("escAttr: only & and ' (single-quoted attribute), same markup as before", () => {
  assert.strictEqual(escAttr(`{"a":"it's & more"}`), `{"a":"it&#39;s &amp; more"}`);
  assert.strictEqual(escAttr(null), "");
});

test("taLines: opportunity lines escape the actor name", () => {
  const html = taLines({ ata: true }, { name: EVIL }, { name: "t" }).join("");
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img"));
  const html2 = taLines({ dta: true }, { name: "a" }, { name: EVIL }).join("");
  assert.ok(!html2.includes("<img"));
});

test("cardButton: payload with an apostrophe stays inside its attribute", () => {
  const html = cardButton("addWound", { name: "O'Brien" }, "Add");
  assert.ok(html.includes("O&#39;Brien"));
  assert.strictEqual((html.match(/'/g) || []).length, 2);
});
