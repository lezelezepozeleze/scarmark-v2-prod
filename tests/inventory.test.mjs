// Pure inventory rules: weights, container fill, chest layout, stack split and merge, transfer copies.
import { test } from "node:test";
import assert from "node:assert";
import { ownWeight, itemWeight, containerCapacity, directChildren, contentsWeight, containerFill, chestLayout, splitQuantity, stackSignature, mergeCandidates, buildTransferCopies } from "../module/rules/index.mjs";

const it = (id, type, system = {}, extra = {}) => ({ id, type, name: id, sort: 0, system, ...extra });

test("ownWeight: per-unit weight x quantity, never negative, 0 when not numbers", () => {
  assert.deepStrictEqual([it("a", "gear", { weight: 2, quantity: 3 }), it("b", "gear", { weight: 2 }), it("c", "gear", { weight: -1, quantity: 5 }), it("d", "gear", { weight: "x", quantity: 2 }), null].map(ownWeight), [6, 2, 0, 0, 0]);
});

test("itemWeight: totalWeight when it is a number, else the own stack weight", () => {
  assert.deepStrictEqual([
    it("a", "gear", { totalWeight: 7, weight: 1, quantity: 1 }),
    it("b", "gear", { totalWeight: "", weight: 2, quantity: 2 }),
    it("c", "gear", { weight: 2, quantity: 2 }),
    it("d", "gear", { totalWeight: 0, weight: 2, quantity: 2 })
  ].map(itemWeight), [7, 4, 4, 0]);
  assert.strictEqual(itemWeight(null), 0);
});

test("containerCapacity: null when missing, empty, negative or not a number", () => {
  assert.deepStrictEqual([{ maxCapacity: 20 }, { maxCapacity: 0 }, { maxCapacity: "" }, { maxCapacity: -1 }, { maxCapacity: "x" }, {}].map(system => containerCapacity({ system })), [20, 0, null, null, null, null]);
});

test("containerFill and contentsWeight: only direct children count, over only above the capacity", () => {
  const box = it("box", "container", { maxCapacity: 5 });
  const items = [box, it("a", "gear", { container: "box", weight: 2, quantity: 2 }), it("b", "gear", { container: "box", weight: 1, quantity: 1 }), it("c", "gear", { container: "other", weight: 9, quantity: 1 }), it("d", "gear", { weight: 9, quantity: 1 })];
  assert.deepStrictEqual(directChildren(items, "box").map(i => i.id), ["a", "b"]);
  assert.strictEqual(contentsWeight(items, "box"), 5);
  assert.deepStrictEqual(containerFill(items, box), { used: 5, capacity: 5, over: false });
  assert.strictEqual(containerFill([...items, it("e", "gear", { container: "box", weight: 0.5, quantity: 1 })], box).over, true);
  assert.deepStrictEqual(containerFill(items, it("box2", "container", {})), { used: 0, capacity: null, over: false });
});

test("chestLayout: containers in sort order with their items, a container stored in another one is a box of its own, items of a missing container are orphans", () => {
  const items = [
    it("b2", "container", {}, { sort: 20 }), it("b1", "container", {}, { sort: 10 }),
    it("x", "gear", { container: "b1" }), it("y", "weapon", { container: "b2" }), it("z", "gear", { container: "gone" }), it("loose", "gear", {}),
    it("nested", "container", { container: "b1" }, { sort: 30 })
  ];
  const layout = chestLayout(items);
  assert.deepStrictEqual(layout.boxes.map(b => [b.box.id, b.children.map(c => c.id)]), [["b1", ["x"]], ["b2", ["y"]], ["nested", []]]);
  assert.deepStrictEqual(layout.orphans.map(o => o.id), ["z"]);
});

test("splitQuantity: half stays (rounded up), needs a whole number of at least 2", () => {
  assert.deepStrictEqual([5, 2, 10].map(splitQuantity), [{ keep: 3, moved: 2 }, { keep: 1, moved: 1 }, { keep: 5, moved: 5 }]);
  assert.deepStrictEqual([1, 0, -3, 2.5, NaN, "4"].map(splitQuantity), [null, null, null, null, null, null]);
});

test("stackSignature: equal except quantity, totals, sort, id and origin; different otherwise", () => {
  const base = { _id: "1", sort: 1, name: "Arrow", type: "missile", img: "a.svg", effects: [], flags: {}, system: { quantity: 5, totalWeight: 1, totalValue: 2, weight: 0.1, notes: "" } };
  const same = { ...base, _id: "2", sort: 99, system: { notes: "", weight: 0.1, totalValue: 9, totalWeight: 9, quantity: 20 } };
  assert.strictEqual(stackSignature(base), stackSignature(same));
  assert.notStrictEqual(stackSignature(base), stackSignature({ ...base, system: { ...base.system, notes: "bodkin" } }));
  assert.notStrictEqual(stackSignature(base), stackSignature({ ...base, img: "b.svg" }));
});

test("mergeCandidates: same name and container, whole positive quantity; matches are identical apart from quantity", () => {
  const sig = (i) => `${i.name}|${i.system.notes ?? ""}`;
  const a = it("a", "gear", { quantity: 2, container: "", notes: "" }, { name: "Rope" });
  const b = it("b", "gear", { quantity: 3, notes: "" }, { name: "Rope" });
  const c = it("c", "gear", { quantity: 1, notes: "knotted" }, { name: "Rope" });
  const d = it("d", "gear", { quantity: 1, container: "box", notes: "" }, { name: "Rope" });
  const e = it("e", "gear", { quantity: 0, notes: "" }, { name: "Rope" });
  const f = it("f", "container", { quantity: 1 }, { name: "Rope" });
  const { peers, matches } = mergeCandidates([a, b, c, d, e, f], a, sig);
  assert.deepStrictEqual(peers.map(i => i.id), ["a", "b", "c"]);
  assert.deepStrictEqual(matches.map(i => i.id), ["a", "b"]);
});

test("buildTransferCopies: fresh ids, container references remapped, root goes into the place, carried, no folder or stats", () => {
  const originals = [
    { _id: "box", name: "Bag", type: "container", folder: "f", ownership: { x: 1 }, _stats: { s: 1 }, system: { container: "", carried: false } },
    { _id: "i1", name: "Coin", type: "gear", system: { container: "box", carried: false } },
    { _id: "i2", name: "Gem", type: "gear", system: { container: "unknown", carried: true } }
  ];
  const queue = ["t1", "n1", "n2", "n3"];
  const { copies, ids } = buildTransferCopies(originals, "box", "", new Set(["t1"]), () => queue.shift());
  assert.deepStrictEqual([...ids], [["box", "n1"], ["i1", "n2"], ["i2", "n3"]]);
  assert.deepStrictEqual(copies.map(c => [c._id, c.system.container, c.system.carried]), [["n1", "", true], ["n2", "n1", true], ["n3", "", true]]);
  assert.ok(copies.every(c => !("folder" in c) && !("ownership" in c) && !("_stats" in c)));
  assert.strictEqual(originals[0].folder, "f", "the originals are not changed");
  const moved = buildTransferCopies([originals[1]], "i1", "target-box", new Set(), () => "z");
  assert.strictEqual(moved.copies[0].system.container, "target-box");
});
