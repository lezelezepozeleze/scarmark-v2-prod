/** The "Show tactics" button in the header of the combat helper dialog and the window it opens: the tactics by name, each expanding to its description. */
import { TACTICS } from "../config/index.mjs";
import { esc } from "./escape.mjs";
import { localizer, collator } from "./i18n.mjs";

const T = localizer("SCARMARK.CombatHelper");

let win = null;
let registered = false;

/** Open the tactics window (or bring the open one to the front). */
function openTactics() {
  if (win?.rendered) {
    win.bringToFront();
    return;
  }
  const list = [...TACTICS].sort((a, b) => collator().compare(game.i18n.localize(a.name), game.i18n.localize(b.name))).map(tactic => `
    <details>
      <summary>${esc(game.i18n.localize(tactic.name))}</summary>
      <p>${esc(game.i18n.localize(tactic.description))}</p>
    </details>`).join("");

  win = new foundry.applications.api.DialogV2({
    window: { title: T("tacticsTitle") },
    position: { width: 420 },
    content: `<div class="sm-tactics">${list}</div>`,
    buttons: [{ action: "close", label: T("close"), default: true }]
  });
  void win.render({ force: true });
}

/** Add the button to a rendered combat helper dialog (the one that contains the .smch grid). */
function addTacticsButton(app, element) {
  if (!element?.querySelector?.(".smch") || element.querySelector(".sm-tactics-open")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sm-tactics-open";
  button.textContent = T("showTactics");
  button.addEventListener("click", openTactics);
  (app.window?.title ?? element.querySelector(".window-title"))?.after(button);
}

/** Add the "Show tactics" button to every combat helper dialog (call once, at ready). */
export function registerTactics() {
  if (registered) return;
  registered = true;
  Hooks.on("closeApplicationV2", (app) => { if (app === win) win = null; });
  Hooks.on("renderDialogV2", addTacticsButton);
}
