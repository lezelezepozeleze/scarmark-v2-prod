/**
 * The combat helper: a dialog with every attack, artifact and rune of the attacking character.
 *
 * It opens with the T key over a targeted token, or with a double click on a token the user does not own (when the user controls a character or has one assigned). It remembers the attacker, leaves tokens that have their own double-click action (merchants, chests, item piles) alone, and shows the extra columns other parts of the system register with registerCombatColumn (the maneuvers).
 */
import { combatBuckets, damageLetters, isCarried, HELPER_GROUP, HELPER_GROUPS } from "../rules/index.mjs";
import { declareMeleeAttack, declareRangeAttack } from "./combat.mjs";
import { artifactRuneUse, usableArtifact } from "./artifact-use.mjs";
import { esc } from "./escape.mjs";
import { HELPER_COLUMN_WIDTH } from "../config/index.mjs";
import { localizer, collator } from "./i18n.mjs";

const T = localizer("SCARMARK.CombatHelper");

/** The open dialog (true while it is being built) and the last attacker. */
let dialog = null;
let lastActor = null;
let registered = false;

// ---------- Extra columns ----------

/**
 * Extra columns of the dialog: another part of the system (the maneuvers) registers one and the dialog lists them after its own groups.
 * A column is { title, order?, entries(actor, target) -> [{id, name, img?, tooltip?, stored?}], run(actor, target, entryId) }.
 */
const columns = new Map();

/**
 * Add a column to the combat helper dialog.
 * @param {string} id
 * @param {object} column  see above
 * @returns {() => void} removes the column again (only if it is still the registered one)
 */
export function registerCombatColumn(id, column) {
  columns.set(id, column);
  return () => { if (columns.get(id) === column) columns.delete(id); };
}

/** The registered columns as [id, column], sorted by order and then title. */
const combatColumns = (compare) => [...columns]
  .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0) || compare(a.title ?? "", b.title ?? ""));

/** The registered column with this id (or undefined). */
const getCombatColumn = (id) => columns.get(id);

/** Log an error and show its message (or the fallback text) to the user. */
const report = (error, fallback) => {
  console.error("Scarmark | combat helper", error);
  ui.notifications.error(error.message || fallback);
};

/** The character that attacks `target`: a controlled token's actor, else the last one used, else the user's character; never the target itself. */
function attackerFor(target) {
  return [
    ...(canvas.tokens?.controlled ?? []).filter(t => t !== target).map(t => t.actor),
    lastActor,
    game.user.character
  ].find(a => a?.isOwner && a.uuid !== target.actor?.uuid) ?? null;
}

// ---------- The dialog ----------

/** HTML of one item or column button of the dialog. */
const button = ({ data, img, name, title, chip = "", stored }) => `
  <button type="button" ${data} class="smch-item ${stored ? "smch-stored" : ""}" title="${esc(title)}">
    <img src="${esc(img)}" alt="">
    <span class="smch-name">${esc(name)}</span>${chip}
  </button>`;

/** HTML of one column (a titled group of buttons). */
const section = ({ title, buttons }) => `
  <section class="smch-group">
    <h3>${esc(title)}</h3>
    ${buttons.join("")}
  </section>`;

/** The button for one of the actor's items; artifacts and runes that are not ready are shown as stored. */
function itemButton(actor, item, group) {
  const magic = group >= HELPER_GROUP.ARTIFACTS;
  const usable = magic ? usableArtifact(actor, item) : isCarried(item, id => actor.items.get(id));
  const note = magic && !usable ? T("notReady") : "";
  return button({
    data: `data-id="${esc(item.id)}" data-group="${group}"`,
    img: item.img || "icons/svg/item-bag.svg",
    name: item.name,
    title: item.name + note,
    chip: `<span class="smch-aspects">${esc(damageLetters(item))}</span>`,
    stored: !usable
  });
}

/** The registered columns as dialog sections; a column whose entries() throws is shown empty (and logged). */
function extraSections(actor, target) {
  return combatColumns((a, b) => collator().compare(a, b)).map(([id, column]) => {
    let entries = [];
    try {
      entries = column.entries?.(actor, target) ?? [];
    } catch (error) {
      console.error(`Scarmark | combat helper column ${id}`, error);
    }
    return {
      title: column.title ?? id,
      buttons: entries.map(entry => button({
        data: `data-col="${esc(id)}" data-entry="${esc(entry.id)}"`,
        img: entry.img || "icons/svg/combat.svg",
        name: entry.name,
        title: entry.tooltip ?? entry.name,
        stored: entry.stored
      }))
    };
  });
}

// ---------- Starting an attack or using an artifact ----------

/** Start what a clicked item does: a melee or range attack declaration, or the use of an artifact or rune (it must be ready and have a token on the scene). */
async function start(actor, item, group) {
  if (group <= HELPER_GROUP.CLOSE) return declareMeleeAttack(actor, item.id);
  if (group <= HELPER_GROUP.MISSILES) return declareRangeAttack(actor, item.id);

  if (!usableArtifact(actor, item)) return ui.notifications.warn(T("mustBeReady", { name: item.name }));
  const token = canvas.tokens?.placeables.find(t => t.actor?.uuid === actor.uuid && t.actor.isOwner);
  if (!token) return ui.notifications.warn(T("noToken", { name: actor.name }));
  if (!token.controlled) token.control({ releaseOthers: true });

  return artifactRuneUse({ preselect: item.id });
}

/** The sections of the dialog: the actor's items in their groups, then the registered columns; empty ones are left out. */
function dialogSections(actor, target) {
  return [
    ...combatBuckets(actor.items.contents, (a, b) => collator().compare(a, b)).map((items, group) => ({
      title: T(`group.${HELPER_GROUPS[group]}`),
      buttons: items.map(item => itemButton(actor, item, group))
    })),
    ...extraSections(actor, target)
  ].filter(s => s.buttons.length);
}

/** What a click on an item or column button does: check it is still there, close the dialog, then start the attack or run the column. */
async function runClicked(app, element, actor, target) {
  const { id, group, col, entry } = element.dataset;
  const column = col ? getCombatColumn(col) : null;
  const item = id ? actor.items.get(id) : null;
  if (col && typeof column?.run !== "function") throw new Error(T("columnGone"));
  if (id && !item) throw new Error(T("itemGone"));
  await app.close();
  await (column ? column.run(actor, target, entry) : start(actor, item, Number(group)));
}

/** Listen for clicks on the dialog's buttons, one at a time (a second click while one runs is ignored). */
function wireDialogClicks(app, actor, target) {
  let busy = false;
  app.element.querySelector(".smch").addEventListener("click", async (event) => {
    const element = event.target.closest("[data-id], [data-col]");
    if (!element || busy) return;
    busy = true;
    try {
      await runClicked(app, element, actor, target);
    } catch (error) {
      report(error, T("actionFailed"));
    } finally {
      busy = false;
    }
  });
}

/** Open the dialog and wait until it closes (only one at a time). */
async function show(target, actor) {
  if (dialog) return;
  dialog = true;
  try {
    const sections = dialogSections(actor, target);
    const grid = `grid-template-columns: repeat(${sections.length}, minmax(0, 1fr))`;
    await foundry.applications.api.DialogV2.wait({
      window: { title: `${actor.name} → ${target.name}` },
      position: { width: Math.min(HELPER_COLUMN_WIDTH * Math.max(sections.length, 1), innerWidth - 24) },
      content: `<div class="smch" style="${grid}">${sections.map(section).join("")}</div>`,
      buttons: [{ action: "close", label: T("close"), default: true }],
      rejectClose: false,
      render: (_event, app) => {
        dialog = app;
        wireDialogClicks(app, actor, target);
      }
    });
  } finally {
    dialog = null;
  }
}

/** Open the dialog for a target; nothing happens without an attacker (see attackerFor) or when the dialog is already open. */
function launchCombatHelper(target) {
  const actor = attackerFor(target);
  if (!actor || dialog) return;
  void show(target, actor).catch(error => report(error, T("helperFailed")));
}

// ---------- T key and the attacker memory ----------

/** T over a targeted token opens the dialog (not while typing, with a modifier key, or when it is already open). */
function onKeyUp(event) {
  if (
    event.key?.toLowerCase() !== "t" || event.repeat || dialog
    || event.ctrlKey || event.altKey || event.metaKey
    || document.activeElement?.closest?.("input,textarea,select,[contenteditable]")
  ) return;
  const target = canvas.tokens?.hover;
  if (target && game.user.targets.has(target)) launchCombatHelper(target);
}

// ---------- Double click on a token the user does not own ----------

/** Tokens with their own double-click action (Item Piles, container actors) keep it. */
function hasOwnDoubleClick(token) {
  const doc = token.document;
  const actor = token.actor;
  try {
    if (game.itempiles?.API?.isValidItemPile?.(doc)) return true;
  } catch (error) {
    console.warn("Scarmark | combat helper: Item Piles API", error);
  }
  return !!(doc?.flags?.["item-piles"]?.data?.enabled || actor?.flags?.["item-piles"]?.data?.enabled || actor?.type === "container");
}

/** Take over the double click on tokens the user does not own: Foundry's own handling stays for everything else. */
function patchTokenDoubleClick() {
  const manager = foundry.canvas.interaction?.MouseInteractionManager?.prototype;
  const Token = CONFIG.Token?.objectClass;
  const oldCan = manager?.can;
  const oldCallback = manager?.callback;
  // A Foundry update may rename or remove these methods; without them the double click is simply not taken over (the T key still works).
  if (typeof oldCan !== "function" || typeof oldCallback !== "function" || !Token) {
    console.warn("Scarmark | combat helper: token double click not available in this Foundry version");
    return;
  }

  const eligible = (token) => !game.user.isGM
    && token instanceof Token
    && !hasOwnDoubleClick(token)
    && (canvas.tokens?.placeables ?? []).includes(token)
    && !!token.actor
    && !token.actor.isOwner
    && !!attackerFor(token);
  const takesOver = (action, token) => action === "clickLeft2" && !dialog && eligible(token);

  manager.can = function (action, event) {
    return takesOver(action, this.target) || oldCan.call(this, action, event);
  };
  manager.callback = function (action, event, ...args) {
    const token = this.target;
    if (takesOver(action, token)) {
      token.setTarget(true, { releaseOthers: true });
      launchCombatHelper(token);
      return true;
    }
    return oldCallback.call(this, action, event, ...args);
  };
}

/** Set up the combat helper once (the ready hook): the T key, the attacker memory and the token double click. */
export function registerCombatHelper() {
  if (registered) return;
  registered = true;
  lastActor = canvas.tokens?.controlled[0]?.actor ?? game.user.character;
  window.addEventListener("keyup", onKeyUp, true);
  Hooks.on("controlToken", (token, controlled) => {
    if (controlled && token.actor?.isOwner) lastActor = token.actor;
  });
  patchTokenDoubleClick();
}
