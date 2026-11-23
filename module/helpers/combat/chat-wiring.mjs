/** Click handlers for the buttons on combat chat cards. */

import { rollShock } from "../dice.mjs";
import { L } from "./util.mjs";
import { promptDefense } from "./dialogs.mjs";
import { resolveRange, resolveMelee } from "./resolve.mjs";
import { addWound } from "./wounds.mjs";
import { rollFumbleStumble, rollStunTest } from "./forced-tests.mjs";
import { initiateAttack } from "./attack.mjs";
import { rollOnHit } from "./poison.mjs";
import { CARD_BUTTONS } from "./card-buttons.mjs";

/**
 * What each JSON-payload button does. `who` = the payload field holding the uuid of
 * the actor (or token actor) whose controller may click it.
 * addWound: the Injury is added to the struck target. fumbleStumble: forced test on
 * a Hand/Arm/leg wound. stun: Stun Test after a Heavy or Severe Head wound. shock:
 * Shock Roll requested by the Condition aftermath.
 */
const JSON_BUTTONS = {
  addWound: { who: "target", run: (data) => addWound(data) },
  fumbleStumble: { who: "victim", run: (data, victim) => rollFumbleStumble(victim, data.kind) },
  stun: { who: "victim", run: (data, victim) => rollStunTest(victim) },
  shock: { who: "actor", run: (data, victim) => rollShock(victim) },
  poison: { who: "victim", once: true, run: (data, victim) => rollOnHit(victim, data) }
};

/**
 * Run a card button's resolution once at a time: the button is disabled while it runs (a double click
 * would otherwise resolve the same attack twice) and a failure is reported instead of lost as an
 * unhandled promise rejection. The button is re-enabled afterwards so a cancelled prompt can be retried, except a `once` button (a roll) whose resolution returned something: that roll was made, so the button stays off.
 * @param {HTMLButtonElement} btn  The clicked button.
 * @param {() => Promise<*>|*} fn  The resolution to run.
 * @param {boolean} [once]  Whether a roll made keeps the button disabled.
 */
async function runOnce(btn, fn, once = false) {
  if (btn.disabled) return;
  btn.disabled = true;
  let done = false;
  try {
    done = Boolean(await fn());
  } catch (err) {
    console.error("Scarmark | combat card button failed", err);
    ui.notifications.error(err.message);
  } finally {
    btn.disabled = once && done;
  }
}

/**
 * Wire the buttons of a combat chat card (call from renderChatMessageHTML): the defense buttons of an attack card, the JSON-payload buttons (Add Wound, Fumble/Stumble, Stun, Shock) and the Opportunity button.
 * @param {ChatMessage} message
 * @param {HTMLElement} element  the rendered message
 */
export function wireCombatCard(message, element) {
  const canAct = (actor) => game.user.isGM || actor?.isOwner;

  for (const btn of element.querySelectorAll(".attack-card button[data-defense]")) {
    btn.addEventListener("click", () => runOnce(btn, async () => {
      const data = JSON.parse(btn.closest(".attack-card").dataset.combat);
      const target = fromUuidSync(data.target);
      if (!canAct(target)) return ui.notifications.warn(L("notYours"));
      const defense = btn.dataset.defense;
      const defParams = await promptDefense(defense, target, data);
      if (defParams === null) return;
      await (data.mode === "range" ? resolveRange : resolveMelee)(data, defense, defParams);
    }));
  }

  // JSON-payload buttons (see card-buttons.mjs): rolled by whoever controls the document `who` names.
  for (const [kind, { who, run, once }] of Object.entries(JSON_BUTTONS)) {
    for (const btn of element.querySelectorAll(`button[data-${CARD_BUTTONS[kind]}]`)) {
      btn.addEventListener("click", () => runOnce(btn, async () => {
        const data = JSON.parse(btn.dataset[CARD_BUTTONS[kind]]);
        const subject = fromUuidSync(data[who]);
        if (!canAct(subject)) {
          ui.notifications.warn(L("notYours"));
          return false;
        }
        return run(data, subject);
      }, once));
    }
  }

  // Attacker's / Defender's Opportunity: launch a classic attack from the winner's controlled token.
  for (const btn of element.querySelectorAll("button[data-ta]")) {
    btn.addEventListener("click", () => initiateAttack());
  }
}
