/** The Handlebars helpers the templates call (eq, concat, round1, num, percent). Their names are part of the persisted contract (docs/AGENTS.md). */
import { formatNumber } from "../view/format.mjs";

/**
 * Register the Handlebars helpers the Scarmark templates use. Takes the Handlebars object as a parameter so the template snapshot test (tests/render) registers the very same helpers on its own Handlebars instance.
 *
 * @param {typeof Handlebars} [hb] defaults to Foundry's global Handlebars
 */
export function registerHandlebarsHelpers(hb = globalThis.Handlebars) {
  hb.registerHelper("eq", (a, b) => a === b);
  hb.registerHelper("concat", (...args) => args.slice(0, -1).join(""));
  // Round a number to 1 decimal place for display (kills float artifacts).
  hb.registerHelper("round1", (v) => Math.round((Number(v) || 0) * 10) / 10);
  // A number as shown on the sheets: at most 3 decimals, "-" when missing (view/format.mjs).
  hb.registerHelper("num", (v) => formatNumber(v));
  hb.registerHelper("percent", (value, max) => {
    if (!max) return 0;
    return Math.round((value / max) * 100);
  });
}
