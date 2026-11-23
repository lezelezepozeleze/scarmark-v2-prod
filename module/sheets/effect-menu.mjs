/** The Add menus of the sheets: a drop-down with a blank entry and the entries of compendiums, grouped by compendium. The Effects tab uses it for the effect library (openEffectMenu), the Actions panel for the action compendium (sheets/actions/action-menu.mjs). */
import { listEffectLibrary, applyLibraryEffect } from "../helpers/effect-library.mjs";
import { warn } from "../helpers/notify.mjs";
import { esc } from "../helpers/escape.mjs";
import { EFFECT_DEFAULT_IMG } from "../config/index.mjs";
import { blankEffectData } from "./actions/effects.mjs";

/**
 * Open a menu under the Add button, or close it when it is open already. A pick calls `onPick` with the uuid of the picked entry, or null for the blank one.
 *
 * @param {ApplicationV2} sheet the sheet that holds the button
 * @param {HTMLElement} target the Add button
 * @param {object} menu
 * @param {string} menu.blankLabel the text of the blank entry (already localized)
 * @param {{label: string, entries: {uuid: string, name: string, img?: string}[]}[]} menu.groups the entries, grouped
 * @param {(uuid: string|null) => Promise<void>|void} menu.onPick
 * @param {string} [menu.cls] an extra class of the menu, which also tells two menus of one sheet apart
 */
export function openAddMenu(sheet, target, { blankLabel, groups, onPick, cls = "" }) {
  const open = sheet.element.querySelector(`.effect-add-menu${cls ? `.${cls}` : ""}`);
  if (open) return open.remove();

  const menu = document.createElement("div");
  menu.className = `effect-add-menu${cls ? ` ${cls}` : ""}`;
  menu.innerHTML = `<a class="effect-add-item" role="button" tabindex="0" data-blank="true"><i class="fa-solid fa-file"></i> ${esc(blankLabel)}</a>`
    + groups.map(g => `<div class="effect-add-group">${esc(g.label)}</div>`
      + g.entries.map(e => `<a class="effect-add-item" role="button" tabindex="0" data-uuid="${esc(e.uuid)}"><img src="${esc(e.img ?? EFFECT_DEFAULT_IMG)}" alt="" /> ${esc(e.name)}</a>`).join("")).join("");
  // On the sheet root, not inside the tab: the tab scrolls and clips, so a menu inside it was cut off and dragged the tab along. It is fixed to the window and placed under the button (or above it when there is no room below).
  sheet.element.append(menu);
  placeMenu(menu, target);

  // One controller removes all three document listeners, however the menu closes (also when the sheet is closed under it).
  const listeners = new AbortController();
  const close = () => { menu.remove(); listeners.abort(); };
  const on = (type, handler) => document.addEventListener(type, handler, { capture: true, signal: listeners.signal });
  on("pointerdown", (ev) => { if ( !menu.contains(ev.target) && !target.contains(ev.target) ) close(); });
  on("keydown", (ev) => { if ( ev.key === "Escape" ) { ev.stopPropagation(); close(); } });
  on("scroll", (ev) => { if ( !menu.contains(ev.target) ) close(); });   // the button moved away from the menu

  menu.addEventListener("click", (ev) => {
    const entry = ev.target.closest(".effect-add-item");
    if ( !entry ) return;
    close();
    onPick(entry.dataset.blank ? null : entry.dataset.uuid);
  });
}

/** The Add menu of the actor Effects tab: a blank effect and the effect library (the effect compendiums). A pick creates a blank effect or puts a library effect on the sheet's actor. */
export async function openEffectMenu(sheet, target) {
  openAddMenu(sheet, target, {
    blankLabel: game.i18n.localize("SCARMARK.Effect.blank"),
    groups: await listEffectLibrary(),
    onPick: async (uuid) => {
      if ( !uuid ) sheet.document.createEmbeddedDocuments("ActiveEffect", [blankEffectData()]);
      else if ( await applyLibraryEffect(sheet.document, uuid) === null ) warn("SCARMARK.Effect.libraryMissing");
    }
  });
}
/** Place a fixed menu under the button, right-aligned to it, with a height that fits the window; above the button when there is more room there. */
export function placeMenu(menu, button) {
  const margin = 8;
  const rect = button.getBoundingClientRect();
  const below = window.innerHeight - rect.bottom - margin;
  const above = rect.top - margin;
  const up = below < 200 && above > below;
  menu.style.maxHeight = `${Math.max(120, Math.min(up ? above : below, 420))}px`;
  // A transformed ancestor would shift "fixed" coordinates: measure where 0,0 really lands and correct for it.
  menu.style.left = "0px";
  menu.style.top = "0px";
  const origin = menu.getBoundingClientRect();
  const left = Math.max(margin, Math.min(rect.right, window.innerWidth - margin) - menu.offsetWidth);
  const top = up ? rect.top - 4 - menu.offsetHeight : rect.bottom + 4;
  menu.style.left = `${left - origin.left}px`;
  menu.style.top = `${top - origin.top}px`;
}
