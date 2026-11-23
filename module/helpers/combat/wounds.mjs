/** Adding a wound and what the victim's Condition means afterwards. */

import { FLAGS } from "../../constants.mjs";
import { shockTarget } from "../../rules/index.mjs";
import { SHOCK_THRESHOLD, ESL_CAP } from "../../config/index.mjs";
import { cardButton } from "./card-buttons.mjs";
import { speak, cardHtml, cardLine } from "../chat.mjs";
import { esc } from "../escape.mjs";

/**
 * Add an Injury item to the struck target (the Add Wound button of a strike card) and check what its Condition means afterwards.
 * @param {{target: string, name: string, woundLevel: number, heavyBleeding: boolean, vital?: string, notes: string}} woundData  payload built by strike.mjs describeWound
 */
export async function addWound(woundData) {
  const target = fromUuidSync(woundData.target);
  if (!target) return;
  await target.createEmbeddedDocuments("Item", [{
    name: woundData.name,
    type: "injury",
    system: { woundLevel: woundData.woundLevel, heavyBleeding: woundData.heavyBleeding, vital: woundData.vital ?? "", notes: woundData.notes }
  }]);
  ui.notifications.info(`${woundData.name} → ${target.name}`);
  await conditionAftermath(target, { newWound: true });
}

/** Is this actor's Shock Roll waived for the running combat (a CS on an earlier one)? */
const hasShockGrit = (actor) => !!game.combat && (actor.getFlag(FLAGS.scope, FLAGS.shockGrit) === game.combat.id);

/**
 * What the victim's Condition means after a wound (or a bleeding tick):
 *  - Condition 0 (or a vital wound): a player character falls unconscious, any
 *    other actor dies (Dead status, defeated in the Combat tracker). A card says
 *    so; whether a PC dies is the GM's call.
 *  - Condition at or below 25 % after a NEW wound: a card asks for a Shock Roll
 *    (unless a CS on an earlier Shock Roll waived them for this combat).
 * Runs on the client that added the wound (it owns the victim).
 * @param {Actor} actor
 * @param {{newWound?: boolean}} [options]
 */
export async function conditionAftermath(actor, { newWound = false } = {}) {
  const cond = actor?.system?.condition;
  if (!cond) return;

  if (cond.value <= 0) {
    const pc = actor.type === "character";
    const statusId = pc ? "unconscious" : (CONFIG.specialStatusEffects?.DEFEATED ?? "dead");
    try {
      if (!actor.statuses?.has(statusId)) await actor.toggleStatusEffect(statusId, { active: true, overlay: !pc });
      if (!pc) {
        for (const c of game.combat?.combatants ?? []) {
          if ((c.actor === actor) && !c.defeated && c.canUserModify(game.user, "update")) await c.update({ defeated: true });
        }
      }
    } catch (err) {
      console.warn("Scarmark | could not apply the Condition 0 status", err);
    }
    const key = cond.vital === "dying" ? "conditionDying" : (pc ? "conditionOutPc" : "conditionOutNpc");
    return speak(actor, cardHtml({ title: esc(actor.name), body: cardLine(`<b>${game.i18n.localize(`SCARMARK.CombatAuto.${key}`)}</b>`, "broken") }));
  }

  if (newWound && (cond.pct <= SHOCK_THRESHOLD * 100) && !hasShockGrit(actor)) {
    return speak(actor, cardHtml({
      title: esc(actor.name),
      body: cardLine(game.i18n.format("SCARMARK.CombatAuto.shockRequest", { pct: cond.pct, target: shockTarget(cond.pct, ESL_CAP) })),
      buttons: cardButton("shock", { actor: actor.uuid }, game.i18n.localize("SCARMARK.Combat.shockTitle"))
    }));
  }
}
