// The cards of a maneuver: the attempt (the sentence, the attacker's roll, a button per answer) and the result card of an answer that rolled (both rolls side by side, as in combat).
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { attemptCardHtml, answerCardHtml } from "../module/helpers/maneuvers.mjs";

const attempt = { name: "Mara", title: "Unarmed Combat Test", target: 62, roll: 41, level: "ms" };
const answer = { name: "Orc", title: "Dodge", target: 35, roll: 92, level: "mf" };
const buttons = `<button type="button" data-sm-maneuver="0">Dodge</button>`;

test("attemptCardHtml: the sentence, the attacker's roll with its outcome, then the buttons of the target", () => {
  const html = attemptCardHtml("Mara attempted to Grapple Orc", attempt, buttons);
  assert.ok(html.includes("Mara attempted to Grapple Orc"));
  assert.ok(html.indexOf("Unarmed Combat Test") > html.indexOf("Mara attempted") && html.indexOf("outcome-ms") > html.indexOf("Unarmed Combat Test"));
  assert.ok(html.indexOf('<div class="card-buttons">') > html.indexOf("outcome-ms"), "the answers come after the roll");
  assert.ok(html.includes("Target") && html.includes(">62<") === false && html.includes("62") && html.includes("41"));
});

test("attemptCardHtml: a maneuver that does not roll has no block, one without answers no buttons; the sentence is escaped", () => {
  const plain = attemptCardHtml("Mara <b>attempted</b>", null, "");
  assert.ok(!plain.includes("test-block") && !plain.includes("card-buttons"));
  assert.ok(plain.includes("&lt;b&gt;attempted&lt;/b&gt;"));
});

test("answerCardHtml: the attacker's roll, a separator, then the target's roll with its outcome", () => {
  const html = answerCardHtml(attempt, answer);
  assert.ok(html.startsWith('<div class="scarmark-card result-card">'));
  const separators = (text) => text.split('class="card-sep"').length - 1;
  assert.strictEqual(separators(html), 3, "one inside each block, one between the two");
  assert.ok(html.indexOf("Mara - Unarmed Combat Test") > 0 && html.indexOf("Orc - Dodge") > html.indexOf("Mara - Unarmed Combat Test"), "each block says whose roll it is");
  assert.ok(html.includes("outcome-ms") && html.includes("outcome-mf") && html.includes("92"));
  assert.ok(answerCardHtml({ ...attempt, name: "Mara <b>" }, answer).includes("Mara &lt;b&gt; - Unarmed Combat Test"), "the name is escaped");
});

test("answerCardHtml: an older attempt card that kept no roll gives only the answer", () => {
  const html = answerCardHtml(null, answer);
  assert.strictEqual(html.split('class="card-sep"').length - 1, 1, "only the one inside the answer's own block");
  assert.ok(html.includes("Orc - Dodge") && html.includes("outcome-mf") && !html.includes("Unarmed"));
  assert.ok(answerCardHtml({ ...attempt, name: undefined }, answer).includes("Unarmed Combat Test") && !answerCardHtml({ ...attempt, name: undefined }, answer).includes("- Unarmed"), "a roll with no name keeps its plain title");
});
