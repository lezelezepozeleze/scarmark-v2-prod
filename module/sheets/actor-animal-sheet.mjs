/** The animal sheet: the creature sheet under its own class. */
import ScarmarkCreatureSheet from "./actor-creature-sheet.mjs";

/**
 * Sheet for the "animal" Actor type. Identical to the Creature sheet for now;
 * kept as its own class so quadruped-specific behaviour (default Armor
 * Locations, etc.) can be added later without touching Creature.
 */
export default class ScarmarkAnimalSheet extends ScarmarkCreatureSheet {

  static DEFAULT_OPTIONS = {
    classes: ["animal"]
  };
}
