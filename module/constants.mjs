/**
 * The string ids Scarmark stores or looks up by name: flags, settings, compendium
 * packs and user queries. They are saved in worlds (flags, settings) or called by
 * world macros (scripts/macros), so change a value only together with a migration.
 */

export const SYSTEM_ID = "scarmark";

/** Where the system's Handlebars templates are served from (Foundry paths start at `systems/<id>/`). */
export const TEMPLATE_DIR = `systems/${SYSTEM_ID}/templates/`;

/** Document flags, all under the `scarmark` scope (macro request-roll.js uses its own world-scope flags). */
export const FLAGS = {
  scope: SYSTEM_ID,
  /** Actor: id of the combat in which the actor rolled a critical Shock Roll (Grit). */
  shockGrit: "shockGrit",
  /** ChatMessage: the maneuver card payload ({maneuver, actorUuid, targetUuid}); older cards used flags.world.smManeuver. */
  maneuver: "maneuver",
  /** ActiveEffect on an item: true when an "owned" action made the effect transfer to the owner (helpers/actions/effects.mjs syncOwnedEffects). */
  ownedByAction: "ownedByAction",
  /** ActiveEffect on an item: the uuid of the library effect it was copied from when an action picked it (helpers/actions/effects.mjs materializeActionEffects). */
  librarySource: "librarySource",
  /** ActiveEffect on an item: set when an alter action put the effect there; the value is the source it came from (the alteration compendium entry), so one source cannot alter an item twice (helpers/actions/alter.mjs). */
  improvedBy: "improvedBy",
  /** Item: { <action id>: <name> }, the name of the compendium entry that an alter or remove action of the item names by uuid. It lets the action find the entry again by name when the uuid no longer resolves (a compendium rebuilt, a world compendium replaced) (helpers/actions/entries.mjs). */
  entryNames: "entryNames",
  /** ActiveEffect in an alteration compendium: "repair" marks the entry that repairs the item instead of modifying it (config/actions.mjs ALTERATION_REPAIR). */
  alteration: "alteration",
  /** ActiveEffect: true when no second copy of the same effect may exist on the same item or actor (rules/effect-unique.mjs, foundry/effect-unique.mjs). */
  unique: "unique",
  /** ActiveEffect: true for an immediate effect: when applied it rewrites the stored values once (the sheet of the character, weapon or armor) and nothing stays in Effects. False or missing: ongoing, the effect is put in Effects. */
  immediate: "immediate",
  /** ActiveEffect: what the effect is about, "character", "weapon" or "armor" (config/actions.mjs EFFECT_TARGET_TYPES); the effect sheet remembers the choice. */
  effectType: "effectType",
  /** ActiveEffect on a weapon: true when the effect fires when the weapon wounds (a poisoned blade). The strike card then offers the target a test (rules/poison.mjs). */
  onHit: "onHit",
  /** ActiveEffect with onHit: the test the target rolls, "skill:<name>" or "attribute:<key>" (rules/actions.mjs parseActionTest). */
  onHitTest: "onHitTest",
  /** ActiveEffect with onHit: the uuid of the library effect the target gets when the test fails. */
  onHitEffect: "onHitEffect",
  /** ActiveEffect with onHit: how many wounding hits the effect has left; empty means no limit. Each wound that gets through armor spends one, and the effect goes at none. */
  charges: "charges",
  /** Combat: last round for which combat Fatigue and bleeding were applied. */
  lastFatigueRound: "lastFatigueRound",
  /** ActiveEffect: world time at which a consumed item's effect expires (see foundry/effect-expiry.mjs). */
  expireWorldTime: "expireWorldTime"
};

/** World settings registered in the init hook. */
export const SETTINGS = {
  /** Hidden: true once convert-to-metric.js has converted weights and distances. */
  metricUnits: "metricUnits",
  /** Client, hidden: true while the macro toggle-hidden-description.js has the Description editor of a gear item shown under its Note. Off by default. */
  showHiddenDescription: "showHiddenDescription"
};

/** Compendium pack ids (`scarmark.<name>`, as declared in system.json). */
export const PACKS = {
  skills: `${SYSTEM_ID}.skills`,
  actions: `${SYSTEM_ID}.actions`
};

/** The compendia of the alterations of an item: the Active Effects an alter action offers for an item of that type (config/actions.mjs ALTERABLE_ITEM_TYPES). They are not part of the effect library. */
export const ALTERATION_PACKS = {
  armor: `${SYSTEM_ID}.armor-alterations`,
  weapon: `${SYSTEM_ID}.weapon-alterations`
};


/** User queries run on the active GM's client. */
export const QUERIES = {
  updateCombatItem: `${SYSTEM_ID}.updateCombatItem`,
  spendOnHitCharge: `${SYSTEM_ID}.spendOnHitCharge`,
  removeEffects: `${SYSTEM_ID}.removeEffects`,
  spendRegionBehavior: `${SYSTEM_ID}.spendRegionBehavior`,
  pauseGame: `${SYSTEM_ID}.pauseGame`
};
