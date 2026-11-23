/**
 * Data model of the "animal" actor type: the creature model under its own type name (see below).
 */
import ScarmarkCreatureData from "./actor-creature.mjs";

/**
 * Data model for the "animal" Actor type - a four-legged creature. Mechanically
 * identical to "creature" for now (same attributes/resources/species/special
 * abilities); it exists as its own type so it can diverge later, chiefly in its
 * default Armor Locations (quadruped body plan).
 */
export default class ScarmarkAnimalData extends ScarmarkCreatureData {}
