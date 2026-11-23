// Where compendium content is read from (helpers/packs.mjs): a world compendium of the same name as a system one adds to it and wins on a name clash. Fake packs only.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { PACKS } from "../module/constants.mjs";
import { normalizeName, shortName, mergedEntries } from "../module/helpers/packs.mjs";
import { listEffectLibrary } from "../module/helpers/effect-library.mjs";

const fakePack = (collection, documentName, entries, extra = {}) => ({
  collection,
  documentName,
  metadata: { label: extra.label ?? collection, packageName: collection.split(".")[0] },
  getIndex: async () => entries.map(([_id, name]) => ({ _id, name })),
  ...("visible" in extra ? { visible: extra.visible } : {})
});

/** Run `fn` with game.packs holding exactly these fake packs, then put the stub back. */
async function withPacks(list, fn) {
  const saved = globalThis.game.packs;
  globalThis.game.packs = { get: id => list.find(p => p.collection === id), filter: test => list.filter(test) };
  try { return await fn(); } finally { globalThis.game.packs = saved; }
}

test("normalizeName: case, spacing and dash kind do not matter", () => {
  assert.strictEqual(normalizeName("  Hand  To–Hand "), "hand to-hand");
  assert.strictEqual(normalizeName("Hand to-hand"), normalizeName("HAND TO—HAND"));
});

/** A pack with one entry, so it shows in the merge. */
const withOne = (collection, documentName, extra) => fakePack(collection, documentName, [["1", collection]], extra);

/** The packs the entries of a system pack id come from, in the order they are read. */
const packsUsed = async (id, kind) => (await mergedEntries(id, kind)).map(entry => entry.pack);

test("the world pack of the same short name is read first, then the system pack", async () => {
  const system = withOne(PACKS.skills, "Item");
  const world = withOne("world.skills", "Item");
  assert.deepStrictEqual(await withPacks([system, world], () => packsUsed(PACKS.skills)), [world, system]);
  assert.deepStrictEqual(await withPacks([system], () => packsUsed(PACKS.skills)), [system]);
  assert.deepStrictEqual(await withPacks([world], () => packsUsed(PACKS.skills)), [world]);
  assert.deepStrictEqual(await withPacks([], () => packsUsed(PACKS.skills)), []);
});

test("a world pack of another document type is ignored", async () => {
  const system = withOne(PACKS.skills, "Item");
  const world = withOne("world.skills", "Actor");
  assert.deepStrictEqual(await withPacks([system, world], () => packsUsed(PACKS.skills)), [system]);
});

test("mergedEntries: the world entry wins on a name clash, the system entry fills the gaps, a world-only entry is included", async () => {
  const system = fakePack(PACKS.skills, "Item", [["s1", "Dodge"], ["s2", "Hand-to-Hand"], ["s3", "Swimming"]]);
  const world = fakePack("world.skills", "Item", [["w1", "dodge"], ["w2", "Hand–to–Hand"], ["w3", "Brewing"]]);
  const entries = await withPacks([system, world], () => mergedEntries(PACKS.skills));
  const byName = Object.fromEntries(entries.map(entry => [normalizeName(entry.name), entry]));
  assert.deepStrictEqual(Object.keys(byName).sort(), ["brewing", "dodge", "hand-to-hand", "swimming"]);
  assert.strictEqual(byName.dodge.id, "w1");
  assert.strictEqual(byName.dodge.pack, world);
  assert.strictEqual(byName["hand-to-hand"].id, "w2");
  assert.strictEqual(byName.brewing.pack, world);
  assert.strictEqual(byName.swimming.id, "s3");
  assert.strictEqual(byName.swimming.pack, system);
});

test("mergedEntries: the uuid names the pack the entry came from", async () => {
  const system = fakePack(PACKS.skills, "Item", [["s1", "Dodge"]]);
  const world = fakePack("world.skills", "Item", [["w1", "Brewing"]]);
  const entries = await withPacks([system, world], () => mergedEntries(PACKS.skills));
  assert.strictEqual(entries.find(entry => entry.name === "Dodge").uuid, `Compendium.${PACKS.skills}.Item.s1`);
  assert.strictEqual(entries.find(entry => entry.name === "Brewing").uuid, "Compendium.world.skills.Item.w1");
});

test("mergedEntries: without a world pack it is the system pack, without any pack it is empty", async () => {
  const system = fakePack(PACKS.skills, "Item", [["s1", "Dodge"], ["s2", ""]]);
  assert.deepStrictEqual((await withPacks([system], () => mergedEntries(PACKS.skills))).map(entry => entry.name), ["Dodge"]);
  assert.deepStrictEqual(await withPacks([], () => mergedEntries(PACKS.skills)), []);
});

test("shortName: the part of a pack id after the package", () => {
  assert.strictEqual(shortName("scarmark.skills"), "skills");
  assert.strictEqual(shortName("world.weapon-alterations"), "weapon-alterations");
});

test("a pack this user may not see is left out", async () => {
  const system = withOne(PACKS.skills, "Item");
  const world = withOne("world.skills", "Item", { visible: false });
  assert.deepStrictEqual(await withPacks([system, world], () => packsUsed(PACKS.skills)), [system]);
});

test("a document type narrows the packs to that kind", async () => {
  const system = withOne("scarmark.armor", "Item");
  const world = withOne("world.armor", "ActiveEffect");
  await withPacks([system, world], async () => {
    assert.deepStrictEqual(await packsUsed("scarmark.armor", "ActiveEffect"), [world]);
    assert.deepStrictEqual(await packsUsed("scarmark.armor"), [system]);
  });
});

test("listEffectLibrary: a world pack of a system name adds to its group, a world-only pack is a group, alteration and hidden packs are not listed", async () => {
  const packs = [
    fakePack("scarmark.alcohol-effects", "ActiveEffect", [["a1", "Tipsy"], ["a2", "Drunk"]], { label: "Alcohol" }),
    fakePack("world.alcohol-effects", "ActiveEffect", [["w1", "tipsy"], ["w2", "Hangover cure"]], { label: "World alcohol" }),
    fakePack("world.homebrew", "ActiveEffect", [["h1", "Cursed"]], { label: "Homebrew" }),
    fakePack("scarmark.weapon-alterations", "ActiveEffect", [["x1", "Sharpened"]], { label: "Weapon alterations" }),
    fakePack("world.weapon-alterations", "ActiveEffect", [["x2", "Break"]], { label: "World weapon alterations" }),
    fakePack("scarmark.armor", "Item", [["i1", "Helmet"]], { label: "Armor" }),
    fakePack("world.armor", "ActiveEffect", [["r1", "Rune"]], { label: "World armor" }),
    fakePack("world.skills", "Item", [["k1", "Brewing"]], { label: "World skills" }),
    fakePack("world.secret", "ActiveEffect", [["z1", "Hidden"]], { label: "Secret", visible: false })
  ];
  const groups = await withPacks(packs, () => listEffectLibrary());
  assert.deepStrictEqual(groups.map(group => group.label), ["Alcohol", "Homebrew", "World armor"]);
  const alcohol = groups[0].entries;
  assert.deepStrictEqual(alcohol.map(entry => entry.name), ["Drunk", "Hangover cure", "tipsy"]);
  assert.strictEqual(alcohol.find(entry => entry.name === "tipsy").uuid, "Compendium.world.alcohol-effects.ActiveEffect.w1");
  assert.strictEqual(alcohol.find(entry => entry.name === "Drunk").uuid, "Compendium.scarmark.alcohol-effects.ActiveEffect.a2");
  assert.deepStrictEqual(groups[2].entries.map(entry => entry.name), ["Rune"]);
});
