/** Region behaviors (a Region is an area of the scene, drawn with Foundry's region tool): the behavior type of the system and the choices of its sheet. Pure data. */

/** The one behavior type of the system: a token sets it off, and its actions run as that token's actor. */
export const REGION_BEHAVIOR_STEP = "step";

/**
 * When the behavior is set off. `event` is the Foundry region event it reacts to (CONST.REGION_EVENTS, spelled out here because config has no Foundry globals): "tokenMoveIn" when the move of a token goes into the region, also when it only passes through; "tokenEnter" when a token ends up inside.
 */
export const REGION_WHEN = {
  crossed: { label: "SCARMARK.Region.crossed", hint: "SCARMARK.Region.crossedHint", event: "tokenMoveIn" },
  stopped: { label: "SCARMARK.Region.stopped", hint: "SCARMARK.Region.stoppedHint", event: "tokenEnter" }
};

/** The Foundry events a behavior listens to: both, and its `when` says which one counts. */
export const REGION_EVENTS = Object.values(REGION_WHEN).map(entry => entry.event);

/**
 * Who sets a behavior off, by the actor of the token: `owner` "player" (a player owns it) or "none" (nobody does, the GM's), and/or the actor `types` it has (all when missing).
 */
export const REGION_WHO = {
  everyone: { label: "SCARMARK.Region.who.everyone" },
  players: { label: "SCARMARK.Region.who.players", owner: "player" },
  npcs: { label: "SCARMARK.Region.who.npcs", owner: "none" },
  humanoids: { label: "SCARMARK.Region.who.humanoids", types: ["character", "npc"] },
  creatures: { label: "SCARMARK.Region.who.creatures", types: ["creature"] },
  animals: { label: "SCARMARK.Region.who.animals", types: ["animal"] },
  beasts: { label: "SCARMARK.Region.who.beasts", types: ["creature", "animal"] }
};

/** How often a behavior is set off: every time, or once (then it is marked as spent until the GM unticks it). */
export const REGION_ONCE = "once";
export const REGION_FREQUENCY = {
  always: { label: "SCARMARK.Region.frequency.always" },
  [REGION_ONCE]: { label: "SCARMARK.Region.frequency.once" }
};
