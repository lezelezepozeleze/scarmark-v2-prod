// Shared by tests/render.test.mjs and tests/tools/render-snapshot.mjs: renders every part of every actor sheet and returns the normalized HTML per snapshot file.
import "../support/foundry-stub.mjs";
import { createRenderer, normalizeHtml } from "../support/render.mjs";
import { buildContext } from "./fixtures.mjs";
import { loadItemSheets, buildItemContext } from "./items.mjs";
import ScarmarkCharacterSheet from "../../module/sheets/actor-character-sheet.mjs";
import ScarmarkNpcSheet from "../../module/sheets/actor-npc-sheet.mjs";
import ScarmarkCreatureSheet from "../../module/sheets/actor-creature-sheet.mjs";
import ScarmarkContainerActorSheet from "../../module/sheets/actor-container-sheet.mjs";

export const SHEETS = { character: ScarmarkCharacterSheet, npc: ScarmarkNpcSheet, creature: ScarmarkCreatureSheet, container: ScarmarkContainerActorSheet };

/** @returns {Promise<Map<string, string>>} file name ("character-full.html", "item-weapon-empty.html") -> the parts of that sheet, rendered and normalized */
export async function renderAll() {
  const renderer = createRenderer();
  const out = new Map();
  for (const [kind, Sheet] of Object.entries(SHEETS)) {
    for (const variant of ["full", "empty"]) {
      let text = "";
      for (const [partId, part] of Object.entries(Sheet.PARTS)) {
        if (!part.template.startsWith("systems/scarmark/")) continue; // core templates (tab navigation)
        text += `<!-- part: ${partId} -->\n${normalizeHtml(renderer.render(part.template, buildContext(Sheet, variant, partId)))}`;
      }
      out.set(`${kind}-${variant}.html`, text);
    }
  }
  for (const [type, { Data, Sheet }] of Object.entries(await loadItemSheets())) {
    for (const variant of ["full", "empty"]) {
      let text = "";
      for (const [partId, part] of Object.entries(Sheet.PARTS)) {
        if (!part.template.startsWith("systems/scarmark/")) continue;
        text += `<!-- part: ${partId} -->\n${normalizeHtml(renderer.render(part.template, await buildItemContext(Data, Sheet, type, variant, partId)))}`;
      }
      out.set(`item-${type}-${variant}.html`, text);
    }
  }
  return out;
}
