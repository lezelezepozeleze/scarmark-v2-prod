/** Spell sheet: a single Properties panel (mirrors Invocation). Casting is done from the actor's Esoterics tab (see rollSpell in dice.mjs), not from here. */
import ScarmarkEsotericSheet from "./item-esoteric-sheet.mjs";
import { bodyParts } from "./item-layout.mjs";

/** Magic Type is chosen from the owning actor's Arcane Esoterics skills. */
export default class ScarmarkSpellSheet extends ScarmarkEsotericSheet {

  static DEFAULT_OPTIONS = {
    classes: ["spell"]
  };

  static PARTS = bodyParts("spell/body", ["esoteric-body", "esoteric-header", "notes-field", "portrait", "name-input"]);

  /** @override */
  get skillKind() {
    return "arcane";
  }
}
