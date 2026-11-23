// The shared pieces of a chat card (helpers/chat.mjs): the frame, a line, a test block with lines around it, and posting as an actor.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { cardHtml, cardLine, cardButtons, cardPrompt, cardBlock, cardSep, testBlock, testCard, speak } from "../module/helpers/chat.mjs";

test("cardLine: a line of the card, with an optional class", () => {
  assert.strictEqual(cardLine("Hello"), '<div class="card-line">Hello</div>');
  assert.strictEqual(cardLine("Worn", "armor-wear"), '<div class="card-line armor-wear">Worn</div>');
});

test("cardHtml: the scarmark-card frame, with a marker class, a title, a body and buttons only when given", () => {
  assert.strictEqual(cardHtml(), '<div class="scarmark-card"></div>');
  assert.strictEqual(cardHtml({ body: cardLine("x") }), '<div class="scarmark-card"><div class="card-line">x</div></div>');
  assert.strictEqual(
    cardHtml({ cls: "strike-card", title: "A &rarr; B", body: cardLine("hit"), buttons: "<button>Go</button>" }),
    '<div class="scarmark-card strike-card"><div class="card-title">A &rarr; B</div><div class="card-line">hit</div><div class="card-buttons"><button>Go</button></div></div>'
  );
});

test("testBlock: lines can go between the title and the target and after the outcome; without them it is as before", () => {
  const plain = testBlock({ title: "Test", target: 50, roll: 42, level: "ms" });
  assert.ok(!plain.includes("undefined"));
  const full = testBlock({ title: "Stun", target: "50 (+10)", roll: 12, level: "mf", before: cardLine("a blow"), after: `<hr class="card-sep">${cardLine("Stunned")}` });
  const at = (text) => full.indexOf(text);
  assert.ok(at("Stun</div>") < at("a blow") && at("a blow") < at("50 (+10)") && at("50 (+10)") < at("outcome-mf") && at("outcome-mf") < at("Stunned"), "title, cause, target, outcome, result");
  assert.ok(testCard({ title: "T", target: 1, roll: 1, level: "cs", before: cardLine("x") }).startsWith('<div class="scarmark-card test-card">'));
});

test("testBlock: the title is plain text and the block escapes it; a title that is already text is shown as it is", () => {
  const html = testBlock({ title: "Mara <b> & Co - Dodge", target: 50, roll: 12, level: "ms" });
  assert.ok(html.includes('<div class="card-title">Mara &lt;b&gt; &amp; Co - Dodge</div>'));
  assert.ok(!html.includes("&amp;amp;") && !html.includes("<b>"));
});

test("speak: posts the card as the actor, with its dice and its flags only when there are some", async () => {
  const posted = [];
  globalThis.ChatMessage = { getSpeaker: ({ actor }) => ({ alias: actor.name }), create: async (data) => { posted.push(data); return data; } };
  const roll = { total: 7 };
  await speak({ name: "Mara" }, "<div>card</div>");
  await speak({ name: "Mara" }, "<div>card</div>", { rolls: [roll], flags: { x: { y: 1 } } });
  assert.deepStrictEqual(posted[0], { speaker: { alias: "Mara" }, content: "<div>card</div>", rolls: [] });
  assert.deepStrictEqual(posted[1], { speaker: { alias: "Mara" }, content: "<div>card</div>", rolls: [roll], flags: { x: { y: 1 } } });
  await speak({ name: "Mara" }, "<div>secret</div>", { whisper: ["gm1", "owner1"] });
  assert.deepStrictEqual(posted[2].whisper, ["gm1", "owner1"]);
  assert.strictEqual("whisper" in posted[0], false, "everybody reads a card that was not whispered");
});

test("cardButtons, cardPrompt, cardBlock and cardSep: the small parts every card is made of; the block title is escaped", () => {
  assert.strictEqual(cardButtons("<button>Go</button>"), '<div class="card-buttons"><button>Go</button></div>');
  assert.strictEqual(cardPrompt("Choose:"), '<div class="card-prompt">Choose:</div>');
  assert.strictEqual(cardSep, '<hr class="card-sep">');
  assert.strictEqual(cardBlock("A <b>", cardLine("x")), '<div class="test-block"><div class="card-title">A &lt;b&gt;</div><div class="card-line">x</div></div>');
});

test("cardHtml: extra attributes go on the frame, and its buttons are a row of buttons", () => {
  assert.strictEqual(cardHtml({ cls: "attack-card", attrs: "data-combat='{}'", body: "B", buttons: "<button>x</button>" }), '<div class="scarmark-card attack-card" data-combat=\'{}\'>B' + cardButtons("<button>x</button>") + "</div>");
});

test("speak: spoken by an actor, or by an alias when nobody speaks", async () => {
  const saved = globalThis.ChatMessage;
  const posted = [];
  globalThis.ChatMessage = { getSpeaker: ({ actor }) => ({ actor: actor.id }), create: async (data) => { posted.push(data); } };
  try {
    await speak({ id: "a1" }, "hi");
    await speak(null, "tick", { alias: "Fatigue" });
    assert.deepStrictEqual(posted.map(p => p.speaker), [{ actor: "a1" }, { alias: "Fatigue" }]);
  } finally { globalThis.ChatMessage = saved; }
});
