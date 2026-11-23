// Renders the actor sheet templates in Node, with the same Handlebars helpers as the system (module/helpers/handlebars.mjs).
// Foundry's own helpers and the template loader are stood in for: localize returns the key, partials are every .hbs file registered under its Foundry path.
import Handlebars from "handlebars";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { registerHandlebarsHelpers } from "../../module/helpers/handlebars.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SYSTEM_PREFIX = "systems/scarmark/";

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (name.endsWith(".hbs")) yield path;
  }
}

/** A Handlebars instance with the system helpers and every template of the system registered as a partial. */
export function createRenderer() {
  const hb = Handlebars.create();
  registerHandlebarsHelpers(hb);
  hb.registerHelper("localize", (key) => `{${key}}`);
  const templates = new Map();
  for (const file of walk(join(ROOT, "templates"))) {
    const path = SYSTEM_PREFIX + relative(ROOT, file).split(sep).join("/");
    templates.set(path, readFileSync(file, "utf8"));
    hb.registerPartial(path, templates.get(path));
  }
  return {
    /** Render the template at a Foundry path ("systems/scarmark/templates/...") with a context. */
    render(path, context) {
      if (!templates.has(path)) throw new Error(`No template file for ${path}`);
      return hb.compile(templates.get(path))(context);
    }
  };
}

/** Whitespace-insensitive, diff-friendly form of rendered HTML: runs of whitespace collapsed, none between tags, one tag per line. */
export function normalizeHtml(html) {
  return html.replace(/\s+/g, " ").replace(/> </g, "><").trim().replace(/></g, ">\n<") + "\n";
}
