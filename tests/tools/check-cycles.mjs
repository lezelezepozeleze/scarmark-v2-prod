/**
 * Import cycle check for module/**\/*.mjs (no dependencies).
 *
 *   npm run check:cycles        exit 0 when the relative import graph has no cycle, exit 1 and list every cycle found otherwise
 *
 * Handles: `import x from "./a.mjs"`, `import { a, b } from "./a.mjs"` (also spread over several lines), side-effect `import "./a.mjs"`, `export { a } from "./a.mjs"`, `export * from "./a.mjs"` and static `import("./a.mjs")` with a string literal. Only relative specifiers ("./" or "../") are followed; bare specifiers are ignored. Comments are stripped before parsing.
 */

import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MODULE_DIR = join(ROOT, "module");

/** Every .mjs file below a directory, absolute paths, sorted. */
async function listModules(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listModules(path));
    else if (entry.isFile() && entry.name.endsWith(".mjs")) out.push(path);
  }
  return out.sort();
}

/** Source with block and line comments blanked out (string literals kept, so "//" inside a string survives). */
function stripComments(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += src.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop;
    } else if (c === "/" && next === "/") {
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? src.length : end;
      out += " ".repeat(stop - i);
      i = stop;
    } else if (c === "\"" || c === "'" || c === "`") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j += src[j] === "\\" ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j + 1;
    } else {
      out += c;
      i += 1;
    }
  }
  return out;
}

const SPECIFIER_PATTERNS = [
  // import ... from "x" / export ... from "x" (the clause may span lines; [^;"'`]* stops at the statement end)
  /\b(?:import|export)\s+(?:type\s+)?[^;"'`]*?\bfrom\s*(["'])([^"']+)\1/g,
  // side-effect import "x"
  /\bimport\s*(["'])([^"']+)\1/g,
  // import("x") with a literal
  /\bimport\s*\(\s*(["'])([^"']+)\1\s*\)/g
];

/** Relative import specifiers of one source text. */
export function importSpecifiers(src) {
  const code = stripComments(src);
  const found = new Set();
  for (const pattern of SPECIFIER_PATTERNS) {
    for (const m of code.matchAll(pattern)) found.add(m[2]);
  }
  return [...found].filter(s => s.startsWith("./") || s.startsWith("../"));
}

/** Map file -> Set of imported files (inside module/, existing files only). Missing targets are reported. */
export async function buildGraph(dir = MODULE_DIR) {
  const files = await listModules(dir);
  const known = new Set(files);
  const graph = new Map();
  const missing = [];
  for (const file of files) {
    const deps = new Set();
    for (const spec of importSpecifiers(await readFile(file, "utf8"))) {
      const target = resolve(dirname(file), spec);
      if (known.has(target)) deps.add(target);
      else if (target.startsWith(dir + sep)) missing.push({ file, spec });
    }
    graph.set(file, deps);
  }
  return { graph, missing };
}

/** One cycle per DFS back edge (enough to prove the graph acyclic or not; not every elementary cycle), each as a list of files starting and ending with the same file, deduplicated by rotation. */
export function findCycles(graph) {
  const cycles = [];
  const seen = new Set();
  const state = new Map(); // undefined = unvisited, 1 = on stack, 2 = done
  const stack = [];
  const visit = (node) => {
    state.set(node, 1);
    stack.push(node);
    for (const dep of graph.get(node) ?? []) {
      if (state.get(dep) === 1) {
        const cycle = stack.slice(stack.indexOf(dep));
        const start = cycle.indexOf([...cycle].sort()[0]);
        const key = [...cycle.slice(start), ...cycle.slice(0, start)].join("\n");
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push([...cycle, dep]);
        }
      } else if (!state.get(dep)) {
        visit(dep);
      }
    }
    stack.pop();
    state.set(node, 2);
  };
  for (const node of graph.keys()) if (!state.get(node)) visit(node);
  return cycles;
}

async function main() {
  const { graph, missing } = await buildGraph();
  const rel = (f) => relative(ROOT, f).split(sep).join("/");
  const edges = [...graph.values()].reduce((n, s) => n + s.size, 0);
  for (const { file, spec } of missing) console.warn(`warning: ${rel(file)} imports "${spec}", which does not exist`);
  const cycles = findCycles(graph);
  if (cycles.length) {
    console.error(`check-cycles: ${cycles.length} import cycle(s) in module/ (${graph.size} files, ${edges} relative imports):`);
    for (const cycle of cycles) console.error(`  ${cycle.map(rel).join(" -> ")}`);
    process.exitCode = 1;
    return;
  }
  console.log(`check-cycles: no import cycles in module/ (${graph.size} files, ${edges} relative imports)`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
