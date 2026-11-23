// The dialog and chat card templates (templates/dialogs): what they show and that names are escaped.
import { test } from "node:test";
import assert from "node:assert";
import { createRenderer } from "./support/render.mjs";

const { render } = createRenderer();
const PATH = (name) => `systems/scarmark/templates/dialogs/${name}.hbs`;

test("artifact-use dialog: lists the options, preselects one, escapes the actor name", () => {
  const html = render(PATH("artifact-use"), {
    actor: "Aldric <b>",
    summary: "Will Capacity: 7; Spirit Capacity: 3",
    options: [{ id: "a1", label: "Torc - Class 2", selected: false }, { id: "a2", label: "Rune <x>", selected: true }]
  });
  assert.ok(html.includes("<strong>Aldric &lt;b&gt;</strong>"));
  assert.ok(html.includes("Will Capacity: 7; Spirit Capacity: 3"));
  assert.ok(html.includes('<option value="a1">Torc - Class 2</option>'));
  assert.ok(html.includes('<option value="a2" selected>Rune &lt;x&gt;</option>'));
  assert.ok(html.includes('name="itemId"'));
});

test("recharge dialog: Will, Spirit and Both, with the actor name", () => {
  const html = render(PATH("recharge"), { actor: "Mira" });
  assert.deepStrictEqual([...html.matchAll(/<option value="(\w+)"/g)].map(m => m[1]), ["will", "spirit", "both"]);
  assert.ok(html.includes("<strong>Mira</strong>"));
  assert.ok(html.includes('name="pool"'));
});

test("capacity card: the card title and one card line per line, escaped", () => {
  const html = render(PATH("capacity-card"), { title: "Recharge <i>", lines: ["Will Capacity: 3 → 9", "Spirit & more"] });
  assert.ok(html.includes('<div class="card-title">Recharge &lt;i&gt;</div>'));
  assert.strictEqual([...html.matchAll(/class="card-line"/g)].length, 2);
  assert.ok(html.includes("Spirit &amp; more"));
});
