// Dialog fields are read through helpers/form-fields.mjs, never as form.elements.<name>: a field named like a member of the elements collection (item, namedItem, length) is hidden by that member, and the read quietly gives a function instead of the field (the alter picker lost its answer this way). Source checks, no DOM.
import { test } from "node:test";
import assert from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { hasField, fieldValue, fieldNumber } from "../module/helpers/form-fields.mjs";

const MODULE_DIR = fileURLToPath(new URL("../module/", import.meta.url));
const HELPER = join("helpers", "form-fields.mjs");
const files = readdirSync(MODULE_DIR, { recursive: true }).filter(file => file.endsWith(".mjs"));
const withSource = (matches) => files.filter(file => matches(readFileSync(join(MODULE_DIR, file), "utf8"), file));

test("no dialog names a field item, namedItem or length", () => {
  assert.deepStrictEqual(withSource(source => /\bname="(item|namedItem|length)"/.test(source)), []);
});

test("only helpers/form-fields.mjs touches form.elements", () => {
  assert.deepStrictEqual(withSource((source, file) => file !== HELPER && /\.elements\b/.test(source)), []);
});

test("form fields: value, number with fallback, presence; a field called item is readable", () => {
  const fields = { item: { value: "k1" }, mult: { value: "" }, count: { value: "3" } };
  const form = { elements: { namedItem: (name) => fields[name] ?? null } };
  assert.strictEqual(fieldValue(form, "item"), "k1");
  assert.strictEqual(fieldValue(form, "missing"), undefined);
  assert.strictEqual(fieldValue(form, "missing", "x"), "x");
  assert.strictEqual(fieldNumber(form, "count"), 3);
  assert.strictEqual(fieldNumber(form, "mult", 7), 7, "empty gives the fallback");
  assert.strictEqual(fieldNumber(form, "missing"), 0);
  assert.strictEqual(hasField(form, "item"), true);
  assert.strictEqual(hasField(form, "missing"), false);
});

test("form fields: a plain elements map (a test double) works too", () => {
  const form = { elements: { modifier: { value: "15" } } };
  assert.strictEqual(fieldNumber(form, "modifier"), 15);
  assert.strictEqual(hasField(form, "modifier"), true);
  assert.strictEqual(hasField({}, "modifier"), false);
});
