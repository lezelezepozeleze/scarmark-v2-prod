/** Hooks on actors: the prototype token name, what a brand-new actor starts with, and the container of an item dropped onto an actor. */
import { defaultArmorLocationItems, addDefaultSkills } from "../helpers/actor-setup.mjs";
import { clearStaleContainer } from "../helpers/inventory.mjs";

/** Register the actor hooks (called when the module loads). */
export function registerActorHooks() {
  // Keep the Prototype Token's name in sync with the Actor's name. By default Foundry does NOT do this after creation - renaming the Actor leaves prototypeToken.name (and therefore every future token dragged from it) stuck on the old name. This does not retroactively fix tokens already placed on a scene while unlinked - those need a one-time manual rename.
  Hooks.on("preUpdateActor", (actor, changes) => {
    if (changes.name && !foundry.utils.hasProperty(changes, "prototypeToken.name")) {
      foundry.utils.setProperty(changes, "prototypeToken.name", changes.name);
    }
  });

  // Give a brand-new Actor its default Armor Locations (humanoid body plan for character/npc/creature, quadruped for animal). Only fires for a genuinely new blank actor - if the creation data already carries items (duplicate, import, or drag from a compendium) we leave it untouched so nothing is doubled.
  Hooks.on("preCreateActor", (actor, data) => {
    if (data.items?.length) return;
    const items = defaultArmorLocationItems(actor.type);
    if (items.length) actor.updateSource({ items });
  });

  // Give a brand-new Actor its default (base) skills, copied from the Skills compendium so they keep their SB attributes / Sunsign bonuses. Runs after creation (needs async pack access) and only on the creating client; a no-op if the actor already has skills.
  Hooks.on("createActor", async (actor, options, userId) => {
    if (userId !== game.user.id) return;
    await addDefaultSkills(actor);
  });

  // An item dropped onto an actor from a container of another actor must not keep pointing at that container.
  Hooks.on("preCreateItem", clearStaleContainer);
}
