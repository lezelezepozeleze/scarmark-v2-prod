// lang/en.json against the code: no key is used that does not exist, no key is left over, and cs.json only translates keys that exist.
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function* walk(dir, ext) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path, ext);
    else if (ext.some(e => name.endsWith(e))) yield path;
  }
}

function flatten(object, prefix = "") {
  const out = {};
  for (const [key, value] of Object.entries(object)) {
    if (value && typeof value === "object") Object.assign(out, flatten(value, `${prefix}${key}.`));
    else out[`${prefix}${key}`] = value;
  }
  return out;
}

const en = flatten(JSON.parse(readFileSync(join(ROOT, "lang/en.json"), "utf8")));
const cs = flatten(JSON.parse(readFileSync(join(ROOT, "lang/cs.json"), "utf8")));

const used = new Set();
const prefixes = new Set();

for (const file of [...walk(join(ROOT, "module"), [".mjs"]), ...walk(join(ROOT, "templates"), [".hbs"])]) {
  const text = readFileSync(file, "utf8");

  // Full keys written out: "SCARMARK.Group.key".
  for (const match of text.matchAll(/["'`](SCARMARK\.[A-Z][A-Za-z0-9]*(?:\.[A-Za-z0-9_]+)*)["'`]/g)) {
    // SCARMARK.ESL_CAP is a config constant, not a key; SCARMARK.WL is a key.
    if (!/^SCARMARK\.[A-Z0-9_]+$/.test(match[1]) || match[1] in en) used.add(match[1]);
  }
  // Keys built at runtime: "SCARMARK.Group." + something, or `SCARMARK.Group.${something}`.
  for (const match of text.matchAll(/["'`](SCARMARK\.[A-Za-z0-9_.]*\.)(?:\$\{|["'`])/g)) prefixes.add(match[1]);

  // Helpers that add a prefix: const T = localizer("SCARMARK.Group"); T("key") or T(`group.${x}`).
  const localizer = text.match(/localizer\(\s*["'](SCARMARK\.[A-Za-z0-9_.]+)["']\s*\)/);
  if (localizer) {
    for (const match of text.matchAll(/\bT\(\s*["']([A-Za-z0-9_.]+)["']/g)) used.add(`${localizer[1]}.${match[1]}`);
    for (const match of text.matchAll(/\bT\(\s*`([A-Za-z0-9_.]*)\$\{/g)) prefixes.add(`${localizer[1]}.${match[1]}`);
  }
  // The item tooltip view model names its lines with SCARMARK.Tooltip keys: add("weightEach", ...), t("yes").
  if (file.replaceAll("\\", "/").endsWith("view/item-tooltip.mjs")) {
    for (const match of text.matchAll(/\b(?:add|t)\(\s*"(\w+)"/g)) used.add(`SCARMARK.Tooltip.${match[1]}`);
  }
  // L("key") in the combat modules is SCARMARK.CombatAuto.key.
  for (const match of text.matchAll(/\bL\(\s*["']([A-Za-z0-9_.]+)["']/g)) used.add(`SCARMARK.CombatAuto.${match[1]}`);
  for (const match of text.matchAll(/\bL\(\s*`([A-Za-z0-9_.]*)\$\{/g)) prefixes.add(`SCARMARK.CombatAuto.${match[1]}`);
}

// Strings that only look like keys: properties of the SCARMARK config object (SCARMARK.armorLocations ...) start in lower case and are excluded above.
const underPrefix = (key) => [...prefixes].some(prefix => key.startsWith(prefix));

test("lang: every key the code uses exists in en.json", () => {
  const missing = [...used].filter(key => !(key in en) && !underPrefix(key) && !Object.keys(en).some(k => k.startsWith(`${key}.`)));
  assert.deepStrictEqual(missing.sort(), []);
});

test("lang: no key in en.json is left over (Foundry's TYPES labels are used by Foundry itself)", () => {
  const leftover = Object.keys(en).filter(key => !key.startsWith("TYPES.") && !used.has(key) && !underPrefix(key));
  assert.deepStrictEqual(leftover.sort(), []);
});

test("lang: cs.json only translates keys that exist in en.json, and does not repeat the English text", () => {
  assert.deepStrictEqual(Object.keys(cs).filter(key => !(key in en)), []);
  assert.deepStrictEqual(Object.keys(cs).filter(key => cs[key] === en[key]), []);
});

test("lang: placeholders of a Czech text are the same as in the English text", () => {
  const holes = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(",");
  const different = Object.keys(cs).filter(key => holes(cs[key]) !== holes(en[key]));
  assert.deepStrictEqual(different, []);
});
