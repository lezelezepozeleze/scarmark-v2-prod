// The entry module only wires hooks; this checks that every file it imports loads and that the system id the rest of the code derives from is the one in system.json.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { SYSTEM_ID } from "../module/constants.mjs";

test("smoke: SYSTEM_ID matches system.json", () => {
  const manifest = JSON.parse(readFileSync(new URL("../system.json", import.meta.url), "utf8"));
  assert.strictEqual(SYSTEM_ID, manifest.id);
});

test("smoke: every style and esmodule that system.json lists exists", () => {
  const manifest = JSON.parse(readFileSync(new URL("../system.json", import.meta.url), "utf8"));
  for (const path of [...manifest.styles, ...manifest.esmodules]) {
    assert.doesNotThrow(() => readFileSync(new URL(`../${path}`, import.meta.url)), path);
  }
});
