// Runs the golden-master comparison (tests/golden/run.mjs) under "npm test": the committed fixtures, plus the local real-data fixtures (tests/golden/local/, gitignored) when that folder exists. The stub import must stay first.
import "./support/foundry-stub.mjs";
import { test } from "node:test";
import assert from "node:assert";
import { basename } from "node:path";
import { fixtureFiles, localFixtureFiles, checkFixture, formatResult } from "./golden/run.mjs";

const files = await fixtureFiles();
const localFiles = await localFixtureFiles();

test("golden fixtures exist", () => {
  assert.ok(files.length > 0, "no tests/golden/*.json fixtures found");
});

for (const file of files) {
  test(`golden: ${basename(file, ".json")}`, async () => {
    const result = await checkFixture(file);
    assert.strictEqual(result.mismatches.length, 0, formatResult(result));
  });
}

if (localFiles) {
  for (const file of localFiles) {
    test(`golden local: ${basename(file, ".json")}`, async () => {
      const result = await checkFixture(file);
      assert.strictEqual(result.mismatches.length, 0, formatResult(result));
    });
  }
} else {
  test("golden local: not present (skipped)", { skip: "tests/golden/local/ not present" }, () => {});
}
