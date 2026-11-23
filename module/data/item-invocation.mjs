/**
 * Data model of the "invocation" item type (a Religion esoteric). Owns the stored fields; the targets and costs come from rules/esoterics.mjs.
 */
import { INVOCATION_CIRCLE_MAX, ESOTERIC_MIN } from "../config/index.mjs";
const fields = foundry.data.fields;

/**
 * Data model for the "invocation" Item type (Religion esoteric).
 * Rolls against the actor's chosen Religion skill's ESL. Circle is the FP Cost
 * spent from that skill's Faith Points; the roll outcome decides FP + Fatigue
 * (see rollInvocation in helpers/dice/esoterics.mjs).
 */
export default class ScarmarkInvocationData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      // Name of the Religion-category skill this invocation draws on.
      religion: new fields.StringField({ required: true, initial: "", blank: true }),
      // Circle = FP Cost (ESOTERIC_MIN to INVOCATION_CIRCLE_MAX).
      circle: new fields.NumberField({ required: true, integer: true, initial: ESOTERIC_MIN, min: ESOTERIC_MIN, max: INVOCATION_CIRCLE_MAX }),
      notes: new fields.StringField({ required: true, initial: "", blank: true }),
      description: new fields.HTMLField({ required: true, initial: "", blank: true })
    };
  }
}
