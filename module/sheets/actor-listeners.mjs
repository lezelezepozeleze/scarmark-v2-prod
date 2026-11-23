/** The listeners an actor sheet wires onto its rendered HTML after every render: skill fields, gear filter, consume and effect links, draggable item rows. */
import { startDrag } from "./inventory-drop.mjs";
import { effectIdOf, toggleEffect, deleteEffectConfirmed } from "./actions/effects.mjs";
import { saveEffectToCompendium } from "../helpers/save-to-compendium.mjs";

/** Whether the pointer is in the lower half of a row (drop after it, not before). */
export function isDropBelow(event, row) {
  const rect = row.getBoundingClientRect();
  return event.clientY > rect.top + rect.height / 2;
}

/**
 * Wire every listener of a freshly rendered actor sheet.
 *
 * @param {ApplicationV2} sheet the actor sheet (offers `element`, `document`, `_findEffect(id)` and `_consumeItem(id)`)
 */
export function wireActorListeners(sheet) {
  wireSkillFields(sheet);
  wireGearFilter(sheet);
  wireItemButton(sheet, ".gear-consume", "_consumeItem");
  wireItemButton(sheet, ".gear-use", "_useItem");
  wireEffectLinks(sheet);
  wireItemRows(sheet);
  wireItemFields(sheet);
}

/** Embedded Item fields can't use the Actor form's submitOnChange (that only targets the Actor document), so ML/Piety on the Skills tab get their own listeners. */
function wireSkillFields(sheet) {
  for (const input of sheet.element.querySelectorAll("[data-skill-field]")) {
    input.addEventListener("change", (event) => {
      const itemId = event.target.closest("[data-item-id]")?.dataset.itemId;
      const field = event.target.dataset.skillField;
      const item = sheet.document.items.get(itemId);
      if (item) item.update({ [`system.${field}`]: Number(event.target.value) || 0 });
    });
  }
}

/** The Armor Durability cell of the Gear tab: type the current durability right in the row (an embedded Item field, so the Actor form does not save it). Natural armor is -1. */
function wireItemFields(sheet) {
  for (const input of sheet.element.querySelectorAll("[data-item-field]")) {
    input.addEventListener("change", (event) => {
      const item = sheet.document.items.get(event.target.closest("[data-item-id]")?.dataset.itemId);
      const value = Math.trunc(Number(event.target.value));
      if (item && Number.isFinite(value)) item.update({ [`system.${event.target.dataset.itemField}`]: Math.max(-1, value) });
    });
  }
}

/** Live client-side filter for the Gear tab (and the chest list) - no need to touch the server for this. */
function wireGearFilter(sheet) {
  const filterInput = sheet.element.querySelector("[data-gear-filter]");
  if (!filterInput) return;
  filterInput.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    for (const row of sheet.element.querySelectorAll(".gear-entry")) {
      const name = row.dataset.itemName?.toLowerCase() ?? "";
      row.style.display = name.includes(query) ? "" : "none";
    }
    filterChest(sheet.element, query);
  });
}

/**
 * Filter the chest list of a Container actor: a row stays if it or its container matches the text (name or notes); a group with no visible row is hidden.
 * @param {HTMLElement} root the sheet's root element
 * @param {string} query lower-case search text
 */
function filterChest(root, query) {
  for (const group of root.querySelectorAll(".sm-chest-group")) {
    const heading = group.querySelector(".sm-chest-box > .sm-chest-row");
    const matchesHeading = !!heading?.dataset.search.includes(query);
    const rows = [...group.querySelectorAll("[data-search]")];
    for (const el of rows) {
      const visible = !query || matchesHeading || el.dataset.search.includes(query);
      el.hidden = !visible;
      if (el.parentElement.tagName === "LI") el.parentElement.hidden = !visible;
    }
    group.hidden = !rows.some(el => !el.hidden);
    if (!group.hidden && heading) heading.hidden = false;
  }
}

/** Click listener of the item buttons of a row (Consume, Use): calls the sheet method with the id of the item of the row. Explicit listeners, not data-action: errors surface instead of a silent no-op. */
function wireItemButton(sheet, selector, method) {
  for (const el of sheet.element.querySelectorAll(selector)) {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      const id = event.currentTarget.closest("[data-item-id]")?.dataset.itemId;
      if (id) sheet[method](id);
    });
  }
}

/**
 * Effect toggle / delete via explicit listeners (robust against any data-action quirks on the disabled/inactive rows). Effects may be the actor's own OR transferred from an owned item, so look them up across both.
 */
function wireEffectLinks(sheet) {
  for (const el of sheet.element.querySelectorAll(".effect-toggle")) {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      toggleEffect(sheet._findEffect(effectIdOf(event.currentTarget)));
    });
  }
  for (const el of sheet.element.querySelectorAll(".effect-save")) {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      saveEffectToCompendium(sheet._findEffect(effectIdOf(event.currentTarget)));
    });
  }
  for (const el of sheet.element.querySelectorAll(".effect-delete")) {
    el.addEventListener("click", async (event) => {
      event.preventDefault();
      const effect = sheet._findEffect(effectIdOf(event.currentTarget));
      if (effect) await deleteEffectConfirmed(effect);
    });
  }
}

/**
 * Make embedded-item rows draggable so they can be dropped into the Items directory, chat, or another actor. Foundry reads the standard Item drag data. Drags that begin on an editable control are left alone. Dropping a row onto another row of the same list re-orders it (the sheet's _onSortItem); a line above/below the hovered row shows where it will land.
 */
function wireItemRows(sheet) {
  for (const row of sheet.element.querySelectorAll("[data-item-id]")) {
    row.setAttribute("draggable", "true");
    row.addEventListener("dragstart", (event) => {
      // Rows nest (items inside a container block): only the innermost row drags.
      event.stopPropagation();
      if (event.target.closest("input, select, textarea")) { event.preventDefault(); return; }
      const item = sheet.document.items.get(row.dataset.itemId);
      if (!item) return;
      startDrag(item);
      event.dataTransfer.setData("text/plain", JSON.stringify(item.toDragData()));
    });
    row.addEventListener("dragover", (event) => {
      if (event.target.closest("[data-item-id]") !== row) return;
      const below = isDropBelow(event, row);
      row.classList.toggle("sort-drop-before", !below);
      row.classList.toggle("sort-drop-after", below);
    });
    row.addEventListener("dragleave", () => row.classList.remove("sort-drop-before", "sort-drop-after"));
  }
}
