/**
 * Scarmark - Create "Freshly shaved" (maintenance macro, 1.1.0-beta or later)
 * HOW TO USE (GM): paste this entire file into a Script macro and Execute. It adds the Active Effect "Freshly shaved" (Presence +1) to the Effects compendium so an item's action can use it ("add Freshly shaved on Selected token when: Used"). Running it again does nothing if the effect is already there.
 * Comeliness is not an attribute any more (it was folded into Presence in 1.0.36), so the effect raises Presence by 1. To raise something else change CHANGE below (key `system.attributes.<attribute>.base`, or a skill: `system.mods.skill.<Skill Name>`).
 * The compendium must be unlocked: right-click it in the Compendiums sidebar and choose Toggle Edit Lock.
 */
(async () => {
  if ( game.system.id !== "scarmark" ) return ui.notifications.error("Create Freshly shaved: this world does not run the scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Create Freshly shaved: run this as the GM.");

  const PACK = "scarmark.effects";
  const NAME = "Freshly shaved";
  const CHANGE = { key: "system.attributes.pre.base", type: "add", value: 1, priority: 20, phase: "initial" };

  const pack = game.packs.get(PACK);
  if ( !pack ) return ui.notifications.error(`Create Freshly shaved: the compendium ${PACK} was not found.`);
  if ( pack.locked ) return ui.notifications.warn("Create Freshly shaved: the Effects compendium is locked. Right-click it in the sidebar and choose Toggle Edit Lock, then run the macro again.");

  const index = await pack.getIndex();
  if ( index.some(entry => entry.name === NAME) ) return ui.notifications.info(`Create Freshly shaved: "${NAME}" is already in the Effects compendium.`);

  await ActiveEffect.implementation.create({
    name: NAME,
    img: "icons/svg/aura.svg",
    disabled: false,
    transfer: false,
    system: { changes: [CHANGE] }
  }, { pack: PACK });
  ui.notifications.info(`Create Freshly shaved: "${NAME}" added to the Effects compendium.`);
})();
