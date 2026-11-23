// Armor coverage entries ({ type, side }): the side of a hit location, what armor covers, what the picker offers a wearer, and the conversion of old armor.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert";
import { locationSide, hasSides, coversLocation, splitBothSides, legacyCoverage, entryValue, entryFromValue, pickerEntries, armorLocationLabel } from "../module/rules/index.mjs";
import { SIDED_TYPES, ARMOR_LOCATIONS, LEGACY_SIDED_KEYS } from "../module/config/index.mjs";
import { armorProtection, coveringArmor } from "../module/helpers/combat/armor.mjs";
import { defaultArmorLocationItems } from "../module/helpers/actor-setup.mjs";
import { coverageLabel } from "../module/view/armor-coverage.mjs";
import ScarmarkArmorData from "../module/data/item-armor.mjs";

const loc = (name, locationType, side) => ({ name, system: { locationType, ...(side === undefined ? {} : { side }) } });
const entry = (type, side = "") => ({ type, side });

test("locationSide: the side field, else the word Left or Right in the name, else none", () => {
  assert.deepStrictEqual([
    loc("Anything", "arm", "left"), loc("Right Arm", "arm", ""), loc("Left Shoulder", "shoulder"), loc("Creature Right Fore Leg", "creatureForeLeg"), loc("Head", "head"), loc("Copyright", "head")
  ].map(locationSide), ["left", "right", "left", "right", "", ""]);
  assert.strictEqual(locationSide(null), "");
});

test("the types with sides: 9 of the 19, all known, and old keys count as their current type", () => {
  assert.strictEqual(SIDED_TYPES.length, 9);
  for (const type of SIDED_TYPES) assert.ok(type in ARMOR_LOCATIONS, type);
  assert.deepStrictEqual(["arm", "head", "creatureHindLeg", "upperArm", "tentacle"].map(hasSides), [true, false, true, true, false]);
});

test("coversLocation: an entry without a side covers both sides, one with a side only that side, an unknown side only the first", () => {
  const both = [entry("arm"), entry("head")];
  const left = [entry("arm", "left")];
  assert.deepStrictEqual([["arm", "left"], ["arm", "right"], ["arm", ""], ["head", ""], ["hand", "left"]].map(([t, s]) => coversLocation(both, t, s)), [true, true, true, true, false]);
  assert.deepStrictEqual([["arm", "left"], ["arm", "right"], ["arm", ""], ["head", "left"]].map(([t, s]) => coversLocation(left, t, s)), [true, false, false, false]);
  assert.strictEqual(coversLocation([entry("upperArm")], "arm", "right"), true, "an old type key is read as the type it became");
  assert.strictEqual(coversLocation([entry("arm")], "elbow", "left"), true, "so is an old struck type");
  assert.strictEqual(coversLocation(undefined, "arm", "left"), false);
  assert.strictEqual(coversLocation([], "head"), false);
});

test("splitBothSides: both-sides entries of a type with sides become a left and a right entry, nothing else changes", () => {
  assert.deepStrictEqual(splitBothSides([entry("head"), entry("arm"), entry("shin", "left"), entry("shin"), entry("upperArm")]), [
    entry("head"), entry("arm", "left"), entry("arm", "right"), entry("shin", "left"), entry("shin", "right")
  ]);
  assert.deepStrictEqual(splitBothSides([entry("creatureHindLeg"), entry("tail")]), [entry("creatureHindLeg", "left"), entry("creatureHindLeg", "right"), entry("tail")]);
  assert.deepStrictEqual(splitBothSides(splitBothSides([entry("arm")])), [entry("arm", "left"), entry("arm", "right")], "a second run changes nothing");
  assert.deepStrictEqual(splitBothSides(undefined), []);
  for (const type of SIDED_TYPES) assert.strictEqual(splitBothSides([entry(type)]).length, 2, type);
});

test("split armor protects what the both-sides entry did, a hit with no known side included", () => {
  const split = splitBothSides([entry("arm"), entry("head")]);
  assert.deepStrictEqual([["arm", "left"], ["arm", "right"], ["arm", ""], ["head", ""]].map(([t, s]) => coversLocation(split, t, s)), [true, true, true, true]);
  assert.strictEqual(coversLocation([entry("arm", "left")], "arm", ""), false, "one side alone does not cover a hit with no known side");
});

test("legacyCoverage: plain keys cover both sides, sided keys one, old keys become current, duplicates go", () => {
  assert.deepStrictEqual(legacyCoverage(["head", "arm", "leftShin", "rightShin", "creatureLeftForeLeg"]), [
    entry("head"), entry("arm"), entry("shin", "left"), entry("shin", "right"), entry("creatureForeLeg", "left")
  ]);
  assert.deepStrictEqual(legacyCoverage(new Set(["skull", "face", "head"])), [entry("head")], "three keys that are all the head");
  assert.deepStrictEqual(legacyCoverage(undefined), []);
  for (const [key, { type, side }] of Object.entries(LEGACY_SIDED_KEYS)) assert.deepStrictEqual(legacyCoverage([key]), [entry(type, side)], key);
});

test("old armor is converted when its data loads, and the old fields are gone", () => {
  const source = { locations: ["head", "leftArm"], locationConditions: { leftArm: 2 }, quality: 4 };
  const migrated = ScarmarkArmorData.migrateData(source);
  assert.deepStrictEqual(migrated.coverage, [entry("head"), entry("arm", "left")], "the old per-location conditions are not kept");
  assert.deepStrictEqual(ScarmarkArmorData.migrateData({ locations: ["arm", "leftHand"] }).coverage, [entry("arm", "left"), entry("arm", "right"), entry("hand", "left")], "a plain key for a type with sides covers left and right");
  assert.deepStrictEqual(ScarmarkArmorData.migrateData({ coverage: [entry("arm")] }).coverage, [entry("arm", "left"), entry("arm", "right")], "so does a both-sides entry");
  assert.ok(!("locations" in migrated) && !("locationConditions" in migrated));
  assert.strictEqual(migrated.quality, 4);
  const current = { coverage: [entry("neck")] };
  assert.deepStrictEqual(ScarmarkArmorData.migrateData(current).coverage, [entry("neck")], "armor that already has coverage is left alone");
});

test("picker value of an entry and back", () => {
  assert.strictEqual(entryValue(entry("arm", "left")), "arm:left");
  assert.strictEqual(entryValue({ type: "head" }), "head:");
  assert.deepStrictEqual(entryFromValue("arm:left"), { type: "arm", side: "left" });
  assert.deepStrictEqual(entryFromValue("head:"), { type: "head", side: "" });
  assert.deepStrictEqual([entryFromValue("nope:"), entryFromValue("arm:up"), entryFromValue(""), entryFromValue(null)], [null, null, null, null]);
});

test("pickerEntries: every location without a wearer, else only what the wearer has", () => {
  const all = pickerEntries(null);
  assert.strictEqual(all.length, 28, "10 types without sides and 9 with two sides");
  assert.deepStrictEqual(all.slice(0, 6).map(entryValue), ["head:", "neck:", "shoulder:left", "shoulder:right", "arm:left", "arm:right"]);
  assert.deepStrictEqual(pickerEntries([]), all);
  const humanoid = pickerEntries(defaultArmorLocationItems("character"));
  assert.strictEqual(humanoid.length, 16, "4 plain types and 6 types with two sides");
  assert.ok(!humanoid.some(e => /creature|wing|tentacle|tail/i.test(e.type)));
  assert.deepStrictEqual(pickerEntries(defaultArmorLocationItems("animal")).map(entryValue), [
    "tail:", "creatureHead:", "creatureNeck:", "creatureForeLeg:left", "creatureForeLeg:right", "creatureHindLeg:left", "creatureHindLeg:right", "creatureChest:", "creatureBelly:"
  ]);
  assert.deepStrictEqual(pickerEntries([loc("Arm", "arm", "")]).map(entryValue), ["arm:left", "arm:right"]);
  assert.deepStrictEqual(pickerEntries([loc("Right Arm", "arm")]).map(entryValue), ["arm:right"]);
});

test("coverageLabel: the name, the side in front, or the name with (both sides)", () => {
  const i18n = { localize: (key) => key.replace(/^SCARMARK\./, ""), format: (key, data) => `${data.side}|${data.location}` };
  assert.strictEqual(coverageLabel(entry("head"), i18n), "ArmorLocation.type.head");
  assert.strictEqual(coverageLabel(entry("arm", "left"), i18n), "ArmorLocation.sides.left|ArmorLocation.type.arm");
  assert.strictEqual(coverageLabel(entry("arm"), i18n), "ArmorLocation.type.arm (Armor.bothSides)");
  assert.strictEqual(armorLocationLabel("skull"), "SCARMARK.ArmorLocation.type.head");
});

test("a new actor's hit locations carry their side", () => {
  const items = defaultArmorLocationItems("character");
  assert.strictEqual(items.length, 16);
  assert.strictEqual(items.filter(i => i.system.side === "left").length, 6);
  assert.strictEqual(items.filter(i => i.system.side === "right").length, 6);
  assert.deepStrictEqual(items.filter(i => i.system.side === "").map(i => i.name), ["Head", "Neck", "Chest", "Belly"]);
  assert.deepStrictEqual(defaultArmorLocationItems("animal").filter(i => i.system.side).map(i => `${i.system.side}:${i.system.locationType}`), ["right:creatureForeLeg", "left:creatureForeLeg", "right:creatureHindLeg", "left:creatureHindLeg"]);
});

test("worn armor protects the side it covers: both sides, or one", () => {
  const piece = (id, coverage, blunt) => ({ id, type: "armor", system: { carried: true, quality: 5, container: "", coverage, protection: { blunt } } });
  const actor = { items: [piece("both", [entry("arm", "", 5)], 1), piece("left", [entry("arm", "left", 5)], 3), piece("head", [entry("head", "", 5)], 9)] };
  actor.items.get = (id) => actor.items.find(i => i.id === id);
  assert.strictEqual(armorProtection(actor, "arm", "blunt", "left"), 4);
  assert.strictEqual(armorProtection(actor, "arm", "blunt", "right"), 1);
  assert.strictEqual(armorProtection(actor, "arm", "blunt"), 1, "a hit with no known side only meets the entry with no side");
  assert.deepStrictEqual(coveringArmor(actor, "arm", "left").map(a => a.id), ["both", "left"]);
});

test("the migration macro writes out the same old keys as the system knows", () => {
  const macro = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "scripts/imports/migrate-armor-coverage.js"), "utf8");
  const table = new Function(`return ${/const SIDED = (\{[\s\S]*?\n {2}\});/.exec(macro)[1]}`)();
  assert.deepStrictEqual(/const SIDED_TYPES = \[\.\.\.new Set\(Object\.values\(SIDED\)/.test(macro), true, "the macro derives its sided types from that table");
  assert.deepStrictEqual([...new Set(Object.values(table).map(([type]) => type))].sort(), [...SIDED_TYPES].sort());
  assert.deepStrictEqual(Object.fromEntries(Object.entries(table).map(([key, [type, side]]) => [key, { type, side }])), LEGACY_SIDED_KEYS);
});
