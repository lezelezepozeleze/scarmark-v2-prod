/**
 * The region behavior of the system: a token sets it off, and the actions of the behavior run as that token's actor (helpers/region-triggers.mjs). The behavior itself says when (the move of a token goes into the Region, also when it only passes through, or a token ends up inside), for whom and how often.
 */
import { SYSTEM_ID } from "../constants.mjs";
import { REGION_BEHAVIOR_STEP, REGION_WHEN, REGION_WHO, REGION_FREQUENCY, REGION_EVENTS } from "../config/index.mjs";
import { actionsField } from "../data/shared-fields.mjs";
import { handleRegionEvent } from "../helpers/region-triggers.mjs";
import ScarmarkRegionBehaviorSheet from "../sheets/region-behavior-sheet.mjs";

const { RegionBehaviorType } = foundry.data.regionBehaviors;
const fields = foundry.data.fields;

/** Stored data of the "step" behavior: `events` (the two region events it listens to), `when` (REGION_WHEN: crossed or stopped), `who` (REGION_WHO: everyone or players), `frequency` (REGION_FREQUENCY: always or once), `pause` (pause the game), `spent` (a once behavior has been set off) and `actions` (what it does). */
class ScarmarkStepData extends RegionBehaviorType {
  static defineSchema() {
    return {
      // Both events reach the behavior; its `when` says which one counts (helpers/region-triggers.mjs).
      events: this._createEventsField({ events: REGION_EVENTS, initial: REGION_EVENTS }),
      when: new fields.StringField({ required: true, initial: "crossed", choices: Object.keys(REGION_WHEN) }),
      who: new fields.StringField({ required: true, initial: "everyone", choices: Object.keys(REGION_WHO) }),
      frequency: new fields.StringField({ required: true, initial: "always", choices: Object.keys(REGION_FREQUENCY) }),
      // Whether setting it off pauses the game.
      pause: new fields.BooleanField({ required: true, initial: false }),
      // Whether a "once" behavior has been set off (the GM can untick it on the sheet).
      spent: new fields.BooleanField({ required: true, initial: false }),
      // What it does, edited with the Actions panel of its sheet (data/shared-fields.mjs actionsField).
      actions: actionsField()
    };
  }

  /** @override */
  async _handleRegionEvent(event) {
    await handleRegionEvent(this.behavior, event);
  }
}

/** Register the behavior type and its sheet (the init hook, with the other document types). */
export function registerRegionBehaviors() {
  CONFIG.RegionBehavior.dataModels[REGION_BEHAVIOR_STEP] = ScarmarkStepData;
  if (CONFIG.RegionBehavior.typeIcons) CONFIG.RegionBehavior.typeIcons[REGION_BEHAVIOR_STEP] = "fa-solid fa-shoe-prints";
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.RegionBehavior, SYSTEM_ID, ScarmarkRegionBehaviorSheet, { types: [REGION_BEHAVIOR_STEP], makeDefault: true, label: "SCARMARK.SheetLabels.regionBehavior" });
}
