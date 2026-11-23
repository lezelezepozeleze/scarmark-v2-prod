// Every actor and item data model must still build the same schema as the captured fixture (tests/schema/schemas.json): same fields, same options, same order. See tests/tools/schema-snapshot.mjs.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { describeAllModels } from "./tools/schema-snapshot.mjs";

const expected = JSON.parse(readFileSync(new URL("./schema/schemas.json", import.meta.url), "utf8"));

test("schema: every data model matches the captured schema", async () => {
  const actual = await describeAllModels();
  assert.deepStrictEqual(Object.keys(actual), Object.keys(expected));
  for (const name of Object.keys(expected)) {
    // JSON strings so a changed field ORDER fails too (deepStrictEqual ignores key order).
    assert.strictEqual(JSON.stringify(actual[name], null, 1), JSON.stringify(expected[name], null, 1), `schema of ${name} changed`);
  }
});
