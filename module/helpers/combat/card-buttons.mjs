/**
 * The buttons on combat chat cards: how they are written (here) and what they do
 * (chat-wiring.mjs). The attribute names are stored in chat messages already in
 * a world, so never rename them.
 *
 * Buttons carrying a JSON payload are built with cardButton(kind, payload, label):
 *   addWound       data-addwound       payload = wound data of the strike card
 *   fumbleStumble  data-fumblestumble  { victim: uuid, kind: "fumble" | "stumble" }
 *   stun           data-stun           { victim: uuid }
 *   shock          data-shock          { actor: uuid }
 *   poison         data-poison         { victim: uuid, name, test, effect: uuid of the effect a failed test puts on the victim }
 * Written by hand in the card HTML (read in chat-wiring.mjs):
 *   data-combat    JSON of the declared attack, on the .attack-card (attack.mjs)
 *   data-defense   ignore | block | dodge | riposte | counterstrike (attack.mjs)
 *   data-ta        ata | dta, the Attacker's / Defender's Opportunity (outcome.mjs)
 */

import { escAttr } from "../escape.mjs";

export const CARD_BUTTONS = {
  addWound: "addwound",
  fumbleStumble: "fumblestumble",
  stun: "stun",
  shock: "shock",
  poison: "poison"
};

/** HTML of a card button that carries `payload` as JSON. */
export function cardButton(kind, payload, label) {
  return `<button data-${CARD_BUTTONS[kind]}='${escAttr(JSON.stringify(payload))}'>${label}</button>`;
}
