// containerTransfer and runLocked against small in-memory actors: the move, the checks, the undo when a step fails.
import { test } from "node:test";
import assert from "node:assert";

const warnings = [];
let counter = 0;
globalThis.game = { i18n: { localize: (k) => k, format: (k, d) => `${k} ${JSON.stringify(d)}` } };
globalThis.ui = { notifications: { info() {}, warn: (m) => warnings.push(m), error() {} } };
globalThis.foundry = { utils: { randomID: () => `new${++counter}` } };

const { containerTransfer, runLocked, getContainer, clearStaleContainer } = await import("../module/helpers/inventory.mjs");

class Items extends Map {
  get contents() { return [...this.values()]; }
  map(fn) { return this.contents.map(fn); }
}

class FakeItem {
  constructor(data, parent) { this.data = structuredClone(data); this.parent = parent; }
  get id() { return this.data._id; }
  get type() { return this.data.type; }
  get name() { return this.data.name; }
  get system() { return this.data.system; }
  toObject() { return structuredClone(this.data); }
  async update(changes) {
    for (const [path, value] of Object.entries(changes)) {
      const keys = path.split(".");
      const last = keys.pop();
      keys.reduce((o, k) => o[k], this.data)[last] = value;
    }
  }
}

class FakeActor {
  constructor(uuid, items = []) {
    this.uuid = uuid;
    this.isOwner = true;
    this.items = new Items();
    this.failCreate = false;
    this.failDelete = false;
    for (const data of items) this.items.set(data._id, new FakeItem(data, this));
  }
  async createEmbeddedDocuments(_type, datas) {
    if (this.failCreate) throw new Error("create failed");
    for (const data of datas) this.items.set(data._id, new FakeItem(data, this));
    return datas;
  }
  async deleteEmbeddedDocuments(_type, ids) {
    if (this.failDelete) throw new Error("delete failed");
    for (const id of ids) this.items.delete(id);
  }
}

const doc = (id, type, name, system = {}) => ({ _id: id, type, name, system: { quantity: 1, container: "", carried: false, ...system } });
const bagWithCoin = () => [doc("bag", "container", "Bag"), doc("coin", "gear", "Coin", { container: "bag", quantity: 4 }), doc("rope", "gear", "Rope")];

test("a container moves with its contents: new ids, references remapped, carried, source emptied", async () => {
  const source = new FakeActor("Actor.a", bagWithCoin());
  const target = new FakeActor("Actor.b", [doc("x", "container", "Sack")]);
  await containerTransfer(source, target, "bag", "x");
  assert.deepStrictEqual([...source.items.keys()], ["rope"]);
  const moved = target.items.contents.filter(i => i.id !== "x");
  assert.deepStrictEqual(moved.map(i => [i.name, i.system.carried]), [["Bag", true], ["Coin", true]]);
  const bag = moved.find(i => i.name === "Bag");
  const coin = moved.find(i => i.name === "Coin");
  assert.strictEqual(bag.system.container, "", "a container never goes into another container");
  assert.strictEqual(coin.system.container, bag.id);
  assert.strictEqual(coin.system.quantity, 4);
});

test("an item goes into a container of the target", async () => {
  const source = new FakeActor("Actor.a", bagWithCoin());
  const target = new FakeActor("Actor.b", [doc("x", "container", "Sack")]);
  await containerTransfer(source, target, "rope", "x");
  assert.ok(!source.items.has("rope"));
  const rope = target.items.contents.find(i => i.name === "Rope");
  assert.strictEqual(rope.system.container, "x");
});

test("within one actor the item only changes container and is carried", async () => {
  const actor = new FakeActor("Actor.a", [...bagWithCoin(), doc("sack", "container", "Sack")]);
  await containerTransfer(actor, actor, "rope", "sack");
  assert.deepStrictEqual([actor.items.get("rope").system.container, actor.items.get("rope").system.carried], ["sack", true]);
  await containerTransfer(actor, actor, "coin", "");
  assert.strictEqual(actor.items.get("coin").system.container, "");
});

test("a missing item or target container throws and changes nothing", async () => {
  const source = new FakeActor("Actor.a", bagWithCoin());
  const target = new FakeActor("Actor.b");
  await assert.rejects(containerTransfer(source, target, "nope"), /missingItem/);
  await assert.rejects(containerTransfer(source, target, "rope", "ghost"), /noTargetContainer/);
  assert.strictEqual(source.items.size, 3);
  assert.strictEqual(target.items.size, 0);
});

test("if creating the copies fails the source is untouched", async () => {
  const source = new FakeActor("Actor.a", bagWithCoin());
  const target = new FakeActor("Actor.b");
  target.failCreate = true;
  await assert.rejects(containerTransfer(source, target, "bag"), /create failed/);
  assert.strictEqual(source.items.size, 3);
  assert.strictEqual(target.items.size, 0);
});

test("if deleting the source fails the copies are removed again", async () => {
  const source = new FakeActor("Actor.a", bagWithCoin());
  const target = new FakeActor("Actor.b");
  source.failDelete = true;
  await assert.rejects(containerTransfer(source, target, "bag"), /delete failed/);
  assert.strictEqual(source.items.size, 3);
  assert.strictEqual(target.items.size, 0);
});

test("runLocked: one change at a time per actor, owner only, errors are reported not thrown", async () => {
  const actor = new FakeActor("Actor.lock");
  let release;
  const first = runLocked([actor], () => new Promise(resolve => { release = resolve; }));
  warnings.length = 0;
  assert.strictEqual(await runLocked([actor], async () => "second"), undefined);
  assert.deepStrictEqual(warnings, ["SCARMARK.Inventory.busy"]);
  release("done");
  assert.strictEqual(await first, "done");
  assert.strictEqual(await runLocked([actor], async () => "third"), "third");
  actor.isOwner = false;
  assert.strictEqual(await runLocked([actor], async () => "no"), undefined);
});

test("getContainer and clearStaleContainer", () => {
  const actor = new FakeActor("Actor.a", bagWithCoin());
  assert.strictEqual(getContainer(actor, "bag").name, "Bag");
  assert.strictEqual(getContainer(actor, "coin"), null);
  const stale = { system: { container: "gone" }, parent: { documentName: "Actor", items: actor.items }, updateSource(changes) { this.system.container = changes["system.container"]; } };
  clearStaleContainer(stale, {}, {});
  assert.strictEqual(stale.system.container, "");
  const kept = { system: { container: "bag" }, parent: { documentName: "Actor", items: actor.items }, updateSource() { throw new Error("must not change"); } };
  clearStaleContainer(kept, {}, {});
  const keepId = { system: { container: "gone" }, parent: { documentName: "Actor", items: actor.items }, updateSource() { throw new Error("must not change"); } };
  clearStaleContainer(keepId, {}, { keepId: true });
});
