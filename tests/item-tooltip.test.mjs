// The item tooltip: header, badges and sections of each kind of item, what is left out, and the plain text of a description.
import { test } from "node:test";
import assert from "node:assert";
import { itemTooltip, plainText } from "../module/view/item-tooltip.mjs";

const t = (key, data) => (data ? `${key}(${data.name})` : key);
const context = { t, typeLabel: (type) => `<${type}>`, label: (group, key) => `${group}:${key}` };
const item = (id, type, system = {}, name = id) => ({ id, type, name, img: `${id}.png`, system });
const facts = (model) => Object.fromEntries(model.sections.filter(s => s.type === "facts").flatMap(s => s.items.map(i => [i.label, i.value])));
const badges = (model) => model.badges.map(b => b.text);

test("plainText: tags removed, block ends become line breaks, entities decoded", () => {
  assert.strictEqual(plainText("<p>One &amp; two</p><p>Three<br>four &lt;5&gt;</p>"), "One & two\nThree\nfour <5>");
  assert.strictEqual(plainText(null), "");
  assert.strictEqual(plainText("<p></p><p></p><p></p><p>x</p>"), "x");
});

test("the header: name, icon, type, and the quantity only when it is not 1", () => {
  const rope = itemTooltip(item("g", "gear", { quantity: 3, weight: 0.5, totalWeight: 1.5 }, "Rope"), [], context);
  assert.deepStrictEqual([rope.title, rope.img, rope.subtitle, rope.quantity], ["Rope", "g.png", "<gear>", "×3"]);
  assert.strictEqual(itemTooltip(item("g", "gear", { quantity: 1 }), [], context).quantity, "");
});

test("weight and value: the total follows in brackets only when it differs; nothing is shown for a value of 0", () => {
  const many = facts(itemTooltip(item("g", "gear", { quantity: 3, weight: 0.5, totalWeight: 1.5, value: 2, totalValue: 6 }), [], context));
  assert.deepStrictEqual([many.weight, many.value], ["0.5 kg (= 1.5 kg)", "2 (= 6)"]);
  const one = facts(itemTooltip(item("g", "gear", { quantity: 1, weight: 0.5, totalWeight: 0.5, value: 0, totalValue: 0 }), [], context));
  assert.deepStrictEqual([one.weight, one.value], ["0.5 kg", undefined]);
});

test("badges show only the unusual: a flag that is off, a carried item and an item on the person show nothing", () => {
  assert.deepStrictEqual(badges(itemTooltip(item("g", "gear", { carried: true, container: "" }), [], context)), []);
  const bag = item("bag", "container", {}, "Bag");
  const odd = itemTooltip(item("x", "gear", { carried: false, container: "bag", consumable: true, usable: true, rune: true, artifact: { attuned: true, class: 3 } }), [bag], context);
  assert.deepStrictEqual(badges(odd), ["rune", "attuned", "consumable", "usable", "notCarried", "storedIn(Bag)"]);
  assert.deepStrictEqual(badges(itemTooltip(item("y", "gear", { container: "gone" }), [bag], context)), ["storedIn(unknown)"]);
  assert.strictEqual(odd.subtitle, "rune");
  assert.strictEqual(facts(odd).class, "3");
});

test("an artifact is a badge with its class; toxicity shows only for a consumable that has some", () => {
  const artifact = itemTooltip(item("a", "gear", { artifact: { active: true, attuned: false, class: 2 } }), [], context);
  assert.deepStrictEqual([badges(artifact), facts(artifact).class], [["artifact"], "2"]);
  assert.strictEqual(facts(itemTooltip(item("p", "gear", { consumable: true, toxicity: 4 }), [], context)).toxicity, "4");
  assert.strictEqual(facts(itemTooltip(item("p", "gear", { consumable: true, toxicity: 0 }), [], context)).toxicity, undefined);
});

test("a weapon: durability, attack, defense and the skill with its specialization; impact as a table; -1 is a dash; shield and broken are badges", () => {
  const sword = itemTooltip(item("w", "weapon", { quality: 12, attack: 2, defense: 1, impact: { blunt: 0, edged: 6, piercing: -1, fire: 2 }, associatedSkill: "close", specialization: 2, isShield: true, broken: true }), [], context);
  assert.deepStrictEqual([facts(sword).durability, facts(sword).attack, facts(sword).defense, facts(sword).skill], ["12", "2", "1", "skill:close +2"]);
  assert.deepStrictEqual(badges(sword), ["shield", "broken"]);
  const table = sword.sections.find(s => s.type === "table");
  assert.deepStrictEqual(table.head, ["aspect:blunt", "aspect:edged", "aspect:piercing", "aspect:fire"]);
  assert.deepStrictEqual(table.rows, [{ label: "impact", cells: ["0", "6", "-", "2"] }]);
  const plain = itemTooltip(item("w", "weapon", { quality: 5, associatedSkill: "close", specialization: 0, impact: {} }), [], context);
  assert.strictEqual(facts(plain).skill, "skill:close");
  assert.deepStrictEqual(badges(plain), []);
});

test("armor: layer, protection table, locations, and a durability bar that changes colour", () => {
  const armor = (quality) => itemTooltip(item("a", "armor", { quality, originalQuality: 10, layer: 4, protection: { blunt: 2, edged: 3, piercing: 1, fire: 0 }, coverage: [{ type: "head", side: "" }, { type: "arm", side: "left" }] }), [], { ...context, coverageLabel: (e) => `${e.side || "both"} ${e.type}` });
  const worn = armor(5);
  assert.strictEqual(facts(worn).layer, "4");
  assert.deepStrictEqual(worn.sections.find(s => s.type === "bar"), { type: "bar", label: "durability", text: "5/10", ratio: 0.5, tone: "warn" });
  assert.deepStrictEqual([armor(9).sections.find(s => s.type === "bar").tone, armor(2).sections.find(s => s.type === "bar").tone], ["ok", "danger"]);
  assert.deepStrictEqual(worn.sections.find(s => s.type === "table").rows, [{ label: "protection", cells: ["2", "3", "1", "0"] }]);
  assert.deepStrictEqual(worn.sections.find(s => s.type === "text"), { type: "text", label: "locations", value: "both head, left arm" });
  // Without an original durability there is nothing to compare with: a plain fact.
  assert.strictEqual(facts(itemTooltip(item("b", "armor", { quality: 5 }), [], context)).durability, "5/-");
});

test("a missile: velocity, aspect, skill, magic class, and range and impact per band", () => {
  const bow = itemTooltip(item("m", "missile", { quality: 3, velocity: "high", aspect: "piercing", associatedSkill: "missile", range: { short: 10, medium: 20, long: 40, extreme: 80 }, impact: { short: 5, medium: 4, long: 3, extreme: -1 }, magic: true, spellClass: 2 }), [], context);
  assert.deepStrictEqual([facts(bow).velocity, facts(bow).aspect, facts(bow).skill, facts(bow).class], ["velocity:high", "aspect:piercing", "skill:missile", "2"]);
  assert.deepStrictEqual(badges(bow), ["magic"]);
  const table = bow.sections.find(s => s.type === "table");
  assert.deepStrictEqual(table.head, ["band:short", "band:medium", "band:long", "band:extreme"]);
  assert.deepStrictEqual(table.rows, [{ label: "range", cells: ["10", "20", "40", "80"] }, { label: "impact", cells: ["5", "4", "3", "-"] }]);
});

test("a container: total weight includes the contents, a fill bar, and the items stored in it one per row", () => {
  const bag = item("bag", "container", { quantity: 1, weight: 1, totalWeight: 1, maxCapacity: 10 }, "Bag");
  const items = [bag, item("c1", "gear", { container: "bag", quantity: 2, weight: 1.5 }, "Coin"), item("c2", "gear", { container: "bag", weight: 0.5 }, "Gem")];
  const model = itemTooltip(bag, items, context);
  assert.strictEqual(facts(model).weight, "1 kg (= 4.5 kg)");
  assert.deepStrictEqual(model.sections.find(s => s.type === "bar"), { type: "bar", label: "contents", text: "3.5 / 10 kg", ratio: 0.35, tone: "ok" });
  assert.deepStrictEqual(model.sections.find(s => s.type === "list").rows, [{ name: "Coin", value: "×2" }, { name: "Gem", value: "×1" }]);
  assert.deepStrictEqual(itemTooltip(item("e", "container", { maxCapacity: 5 }), [], context).sections.find(s => s.type === "text"), { type: "text", label: "", value: "empty" });
  const full = itemTooltip(item("f", "container", { maxCapacity: 1 }), [item("f", "container", { maxCapacity: 1 }), item("h", "gear", { container: "f", weight: 3 })], context);
  assert.strictEqual(full.sections.find(s => s.type === "bar").tone, "danger");
});

test("the notes: the description is added only when asked for, and the text is cut at 400 characters", () => {
  const gear = item("x", "gear", { notes: "red", description: "<p>Long</p>" });
  assert.strictEqual(itemTooltip(gear, [], context).notes, "red");
  assert.strictEqual(itemTooltip(gear, [], { ...context, showDescription: true }).notes, "red\n\nLong");
  const long = itemTooltip(item("z", "gear", { notes: "n".repeat(500) }), [], context);
  assert.strictEqual(long.notes.length, 401);
  assert.ok(long.notes.endsWith("…"));
});
