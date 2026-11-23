// Armor durability is one number per piece (`quality`); effects and the block with a body location must not add a per-location condition.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { QUALITY_PERMANENT } from "../module/config/index.mjs";
import { coveringArmor } from "../module/helpers/combat/armor.mjs";
import { armorEffective, repairedArmor, rewrittenItem, itemModsOf } from "../module/rules/index.mjs";

const piece = (id, quality, effective) => ({ id, type: "armor", system: { carried: true, quality, container: "", coverage: [{ type: "head", side: "" }], protection: { blunt: 3 }, ...(effective && { effective }) } });
const actorOf = (...items) => Object.assign({ items }, { items: Object.assign(items, { get: (id) => items.find(i => i.id === id) }) });
const mods = (changes) => itemModsOf([{ system: { changes } }]);

test("a durability modifier decides whether a piece still protects, and never touches the stored durability", () => {
  const worn = piece("worn", 2, { protection: { blunt: 3 }, quality: 0 });
  const sound = piece("sound", 2, { protection: { blunt: 3 }, quality: 4 });
  assert.deepStrictEqual(coveringArmor(actorOf(worn, sound), "head").map(a => a.id), ["sound"]);
  assert.strictEqual(worn.system.quality, 2);
  const armor = { protection: { blunt: 1, edged: 0, piercing: 0, fire: 0 }, quality: 2 };
  const copy = structuredClone(armor);
  armorEffective(armor, mods([{ key: "system.itemMods.quality", type: "add", value: -5, priority: 20 }]));
  assert.deepStrictEqual(armor, copy);
});

test("Natural armor and a worn-out piece are not changed by a durability modifier or a rewrite", () => {
  const add = { key: "system.itemMods.quality", type: "add", value: 3, priority: 20 };
  assert.strictEqual(armorEffective({ protection: {}, quality: QUALITY_PERMANENT }, mods([add])).quality, QUALITY_PERMANENT);
  assert.strictEqual(armorEffective({ protection: {}, quality: 0 }, mods([add])).quality, 0);
  assert.deepStrictEqual(rewrittenItem("armor", { protection: {}, quality: QUALITY_PERMANENT }, mods([add])), {});
  assert.deepStrictEqual(rewrittenItem("armor", { protection: {}, quality: 0 }, mods([add])), {});
});

test("a repair writes only the durability", () => {
  assert.deepStrictEqual(Object.keys(repairedArmor({ originalQuality: 6, quality: 1 })), ["quality"]);
});

test("the code has no per-location armor condition (1.0.58 model): those names live only in the migration of old data", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "module");
  const allowed = new Set(["data/item-armor.mjs", "rules/locations.mjs"]);
  const forbidden = /averageCondition|startingCondition|entryIndexesAt|holdsAt|wearIndexAt|modifiedCoverage|armorCondition/;
  const walk = (dir) => readdirSync(dir).flatMap(name => (statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)]));
  const hits = walk(root).filter(file => file.endsWith(".mjs") && !allowed.has(relative(root, file).replaceAll("\\", "/")) && forbidden.test(readFileSync(file, "utf8")));
  assert.deepStrictEqual(hits, []);
});
