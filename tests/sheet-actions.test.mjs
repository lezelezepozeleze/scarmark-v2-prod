// Every data-action in the sheet templates has a handler on the sheets, and every handler is a function.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ScarmarkActorSheetBase from "../module/sheets/actor-sheet-base.mjs";
import ScarmarkCharacterSheet from "../module/sheets/actor-character-sheet.mjs";
import ScarmarkContainerActorSheet from "../module/sheets/actor-container-sheet.mjs";
import ScarmarkItemSheetBase from "../module/sheets/item-sheet-base.mjs";
import ScarmarkArmorSheet from "../module/sheets/item-armor-sheet.mjs";
import ScarmarkInjurySheet from "../module/sheets/item-injury-sheet.mjs";
import ScarmarkSkillSheet from "../module/sheets/item-skill-sheet.mjs";
import ScarmarkContainerSheet from "../module/sheets/item-container-sheet.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (name.endsWith(".hbs")) yield path;
  }
}

const actionsIn = (dir) => new Set([...walk(join(ROOT, dir))].flatMap(file => [...readFileSync(file, "utf8").matchAll(/data-action="(\w+)"/g)].map(m => m[1])));
const handlers = (...sheets) => new Set(sheets.flatMap(sheet => Object.keys(sheet.DEFAULT_OPTIONS.actions ?? {})));

test("actor sheets: every handler is a function", () => {
  for (const [name, handler] of Object.entries(ScarmarkActorSheetBase.DEFAULT_OPTIONS.actions)) assert.strictEqual(typeof handler, "function", name);
  assert.strictEqual(Object.keys(ScarmarkActorSheetBase.DEFAULT_OPTIONS.actions).length, 41);
});

test("actor templates: every data-action has a handler on the actor sheets", () => {
  const known = handlers(ScarmarkActorSheetBase, ScarmarkCharacterSheet, ScarmarkContainerActorSheet);
  // The portrait (editImage) and the header controls are ApplicationV2 built-ins or handled above; item rows inside chest and gear lists use the same names.
  assert.deepStrictEqual([...actionsIn("templates/actor")].filter(name => !known.has(name)).sort(), []);
});

test("item templates: every data-action has a handler on the item sheets", () => {
  const known = handlers(ScarmarkItemSheetBase, ScarmarkArmorSheet, ScarmarkInjurySheet, ScarmarkSkillSheet, ScarmarkContainerSheet);
  assert.deepStrictEqual([...actionsIn("templates/item")].filter(name => !known.has(name)).sort(), []);
});
