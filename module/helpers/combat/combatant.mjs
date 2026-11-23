/** Combatant class whose initiative roll is the actor's Initiative skill ESL. */

import { findSkillByName } from "./lookup.mjs";
import { INITIATIVE_SKILL } from "../../config/index.mjs";

/**
 * Register a Combatant whose "roll" is just the actor's Initiative skill ESL, so
 * clicking Roll Initiative fills the tracker with the character's Initiative.
 * Defined at init time (CONFIG is ready then).
 */
export function registerScarmarkCombatant() {
  const Base = CONFIG.Combatant.documentClass;
  class ScarmarkCombatant extends Base {
    getInitiativeRoll() {
      const esl = (this.actor ? findSkillByName(this.actor, INITIATIVE_SKILL) : null)?.system?.esl ?? 0;
      return new Roll(String(esl));
    }
  }
  CONFIG.Combatant.documentClass = ScarmarkCombatant;
}
