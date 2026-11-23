/** Sheet actions of the Combat tab: rolls, injuries and attack declarations. Called by ApplicationV2 with the sheet as `this`. */
import { rollAttributeTest, rollSkillTest, rollShock, rollMendRate, rollOtherDamage } from "../../helpers/dice.mjs";
import { declareMeleeAttack, declareRangeAttack, rollInjury } from "../../helpers/combat.mjs";

/** Roll a combat skill (Initiative/Dodge) by its skill id from data-skill-id. */
export function onRollCombatSkill(event, target) {
  const skillId = target.dataset.skillId;
  if (skillId) rollSkillTest(this.document, skillId);
}

/** Roll a shock test for the actor. */
export function onRollShock() {
  rollShock(this.document);
}

/** Roll a located wound for non-combat damage (trap, fall, extra damage). */
export function onRollInjury() {
  rollInjury(this.document); // non-combat damage (trap / fall / extra dmg) -> located wound
}

/** Roll the mend rate of the injury of this row. */
export function onRollMend(event, target) {
  const itemId = target.closest("[data-item-id]")?.dataset.itemId;
  const injury = this.document.items.get(itemId);
  if (injury) rollMendRate(this.document, injury);
}

/** Roll a stumble test (an Agility test). */
export function onRollStumble() {
  rollAttributeTest(this.document, "agl"); // Stumble = Agility test
}

/** Roll a fumble test (a Dexterity test). */
export function onRollFumble() {
  rollAttributeTest(this.document, "dex"); // Fumble = Dexterity test
}

/** Roll damage from another source. */
export function onRollDamage() {
  rollOtherDamage(this.document);
}

/** Add a blank armor location. */
export function onAddArmorLocation() {
  this.document.createEmbeddedDocuments("Item", [{
    name: game.i18n.localize("SCARMARK.ArmorLocation.new"),
    type: "armorLocation"
  }]);
}

/** Add a blank injury. */
export function onAddInjury() {
  this.document.createEmbeddedDocuments("Item", [{
    name: game.i18n.localize("SCARMARK.Injury.new"),
    type: "injury"
  }]);
}

/** Declare a melee attack with the weapon of this row. */
export function onDeclareAttack(event, target) {
  const itemId = target.closest("[data-item-id]")?.dataset.itemId;
  if (itemId) declareMeleeAttack(this.document, itemId);
}

/** Declare a ranged attack with the missile weapon of this row. */
export function onDeclareRangeAttack(event, target) {
  const itemId = target.closest("[data-item-id]")?.dataset.itemId;
  if (itemId) declareRangeAttack(this.document, itemId);
}

/** The data-action handlers of the Combat tab, by action name. */
export const COMBAT_ACTIONS = {
  rollCombatSkill: onRollCombatSkill,
  rollShock: onRollShock,
  rollInjury: onRollInjury,
  rollMend: onRollMend,
  rollStumble: onRollStumble,
  rollFumble: onRollFumble,
  rollDamage: onRollDamage,
  addArmorLocation: onAddArmorLocation,
  addInjury: onAddInjury,
  declareAttack: onDeclareAttack,
  declareRangeAttack: onDeclareRangeAttack
};
