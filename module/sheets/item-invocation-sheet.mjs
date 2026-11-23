/** Invocation sheet: a single Properties panel. Invoking is done from the actor's Esoterics tab (see rollInvocation in dice.mjs), not from here. */
import ScarmarkEsotericSheet from "./item-esoteric-sheet.mjs";
import { bodyParts } from "./item-layout.mjs";

/** Religion is chosen from the owning actor's Religion-category skills. */
export default class ScarmarkInvocationSheet extends ScarmarkEsotericSheet {

  static DEFAULT_OPTIONS = {
    classes: ["invocation"]
  };

  static PARTS = bodyParts("invocation/body", ["esoteric-body", "esoteric-header", "notes-field", "portrait", "name-input"]);

  /** @override */
  get skillKind() {
    return "religion";
  }
}
