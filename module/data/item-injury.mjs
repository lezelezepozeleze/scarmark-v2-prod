/**
 * Data model of the "injury" item type (one wound). Owns the stored fields and the derived severityKey / mendLabel; the actor's applyDerivedCombat sums the Wound Levels.
 */
import { MEND_RATE_MAX, VITAL_STATES } from "../config/index.mjs";
import { severityKey, mendLabel } from "../rules/index.mjs";
import { actionsField } from "./shared-fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for the "injury" Item type: a single wound. Kept lean: the wound's
 * location and type live in its (auto-generated) name
 * (e.g. "Right Calf Stab"), and Severity is DERIVED from Wound Level rather than
 * stored, so there is only one number to fill in.
 *
 * Wound Level feeds the actor's WL total, which lowers Condition (Endurance - WL).
 * Heavy Bleeding makes the wound worse by +1 WL every 5th combat round until a
 * bandage stops it (the flag is cleared). `vital` marks a Dire / Mortal wound
 * to a vital location (config VITAL_WOUNDS): "out" knocks the victim out,
 * "dying" leaves them dying - either forces Condition to 0 until the GM clears it.
 * Mend Rate is set by hand after the Treatment Roll (0 = MRN, narrative).
 */
export default class ScarmarkInjuryData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      // Wound Level. Severity is derived, one name per level (SEVERITY_BY_LEVEL).
      woundLevel: new fields.NumberField({ required: true, integer: true, initial: 1, min: 0 }),

      // Mend Rate (Healing Rate) - set by hand after the Treatment Roll.
      // 1 to MEND_RATE_MAX = H1..H6; 0 = MRN (narrative, no mechanical Healing Roll).
      mend: new fields.NumberField({ required: true, integer: true, initial: 0, min: 0, max: MEND_RATE_MAX }),

      // Only Heavy Bleeding is tracked mechanically (light bleeding = a bandage
      // after combat, handled narratively).
      heavyBleeding: new fields.BooleanField({ required: true, initial: false }),

      // Vital wound (set by combat automation, cleared by the GM once stabilised).
      vital: new fields.StringField({ required: true, initial: "", blank: true, choices: ["", ...Object.keys(VITAL_STATES)] }),

      notes: new fields.StringField({ required: true, initial: "", blank: true }),

      // The actions of the item, edited on its Actions tab (data/shared-fields.mjs actionsField).
      actions: actionsField()
    };
  }

  /** @override */
  prepareDerivedData() {
    this.severityKey = severityKey(this.woundLevel);
    this.mendLabel = mendLabel(this.mend);
  }
}
