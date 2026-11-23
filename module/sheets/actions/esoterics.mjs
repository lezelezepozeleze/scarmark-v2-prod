/** Sheet actions of the Esoterics tab: adding and rolling spells, invocations and psionic talents. Called by ApplicationV2 with the sheet as `this`. */
import { rollInvocation, rollSpell, rollPsionic } from "../../helpers/dice.mjs";
import { postEsotericCard } from "../../helpers/esoteric-card.mjs";
import { rowItemId } from "./item-rows.mjs";

/** Add a blank spell. */
export function onAddSpell() {
  this.document.createEmbeddedDocuments("Item", [{ name: game.i18n.localize("SCARMARK.Spell.new"), type: "spell" }]);
}

/** Add a blank invocation. */
export function onAddInvocation() {
  this.document.createEmbeddedDocuments("Item", [{ name: game.i18n.localize("SCARMARK.Invocation.new"), type: "invocation" }]);
}

/** Add a blank psionic talent. */
export function onAddPsionic() {
  this.document.createEmbeddedDocuments("Item", [{ name: game.i18n.localize("SCARMARK.Psionic.new"), type: "psionic" }]);
}

/** Roll the spell of this row. */
export function onCastSpell(event, target) {
  const itemId = rowItemId(target);
  if (itemId) rollSpell(this.document, itemId);
}

/** Roll the invocation of this row. */
export function onInvokeInvocation(event, target) {
  const itemId = rowItemId(target);
  if (itemId) rollInvocation(this.document, itemId);
}

/** Roll the psionic talent of this row. */
export function onUsePsionic(event, target) {
  const itemId = rowItemId(target);
  if (itemId) rollPsionic(this.document, itemId);
}

/** Share the Description of the esoteric item of this row in chat, whispered to the GMs and the actor's owners (the chat-bubble button of the Esoterics tab). */
export async function onPostEsoteric(event, target) {
  const item = this.document.items.get(rowItemId(target));
  if (item) await postEsotericCard(this.document, item);
}

/** The data-action handlers of the Esoterics tab, by action name. */
export const ESOTERICS_ACTIONS = {
  addSpell: onAddSpell,
  addInvocation: onAddInvocation,
  addPsionic: onAddPsionic,
  castSpell: onCastSpell,
  invokeInvocation: onInvokeInvocation,
  usePsionic: onUsePsionic,
  postEsoteric: onPostEsoteric
};
