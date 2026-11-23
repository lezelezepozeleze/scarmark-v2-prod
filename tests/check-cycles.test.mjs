// Runs tests/tools/check-cycles.mjs under "npm test": the parser on known import forms, the cycle finder on a small graph, and the real module/ graph.
import { test } from "node:test";
import assert from "node:assert";
import { importSpecifiers, buildGraph, findCycles } from "./tools/check-cycles.mjs";

test("check-cycles: parses every relative import form", () => {
  const src = [
    "import a from \"./a.mjs\";",
    "import { b1, b2 } from './b.mjs';",
    "import {",
    "  c1,",
    "  c2",
    "} from \"../c.mjs\";",
    "import * as d from \"./d.mjs\";",
    "import \"./e.mjs\";",
    "export { f } from \"./f.mjs\";",
    "export * from \"./g.mjs\";",
    "export {",
    "  h",
    "} from \"./h.mjs\";",
    "const i = await import(\"./i.mjs\");",
    "import bare from \"node:fs\";",
    "// import x from \"./commented.mjs\";",
    "/* import y from \"./blocked.mjs\"; */",
    "const s = Array.from(list);"
  ].join("\n");
  assert.deepStrictEqual(importSpecifiers(src).sort(), ["../c.mjs", "./a.mjs", "./b.mjs", "./d.mjs", "./e.mjs", "./f.mjs", "./g.mjs", "./h.mjs", "./i.mjs"]);
});

test("check-cycles: finds a cycle and accepts a DAG", () => {
  const dag = new Map([["a", new Set(["b", "c"])], ["b", new Set(["c"])], ["c", new Set()]]);
  assert.deepStrictEqual(findCycles(dag), []);
  const cyclic = new Map([["a", new Set(["b"])], ["b", new Set(["c"])], ["c", new Set(["a"])]]);
  assert.deepStrictEqual(findCycles(cyclic), [["a", "b", "c", "a"]]);
});

test("check-cycles: module/ has no import cycles", async () => {
  const { graph, missing } = await buildGraph();
  assert.ok(graph.size > 0, "no module/**/*.mjs files found");
  assert.deepStrictEqual(missing, [], "imports of missing files in module/");
  const cycles = findCycles(graph);
  assert.deepStrictEqual(cycles, [], `import cycles:\n${cycles.map(c => c.join(" -> ")).join("\n")}`);
});
