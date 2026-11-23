/** Hooks on chat messages and combat: the buttons on the combat and maneuver cards, and the fatigue every 5 combat rounds. */
import { wireCombatCard, applyCombatRoundFatigue } from "../helpers/combat.mjs";
import { wireManeuverCard } from "../helpers/maneuvers.mjs";

/** Register the chat and combat hooks (called when the module loads). */
export function registerChatHooks() {
  // Wire up the interactive buttons on Scarmark combat and maneuver chat cards.
  Hooks.on("renderChatMessageHTML", (message, html) => {
    wireCombatCard(message, html);
    wireManeuverCard(message, html);
  });

  // Every 5 combat rounds, each combatant automatically gains +1 Fatigue.
  Hooks.on("updateCombat", applyCombatRoundFatigue);
}
