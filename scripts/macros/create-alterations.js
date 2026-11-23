/**
 * Scarmark - Create alterations (maintenance macro)
 * HOW TO USE (GM): paste this entire file into a Script macro and Execute. It adds a few starter alterations to the "Armor alterations" and "Weapon alterations" compendia, the lists an "alter" action offers for an armor piece or a weapon. Edit, rename or delete them as you like, and add your own: an alteration is an Active Effect (a modifier of the item stats, see the key picker of an effect in these compendia) or the entry flagged as the repair. Entries that already exist (same name) are left alone.
 * The compendia must exist (reload the world once after updating the system) and be unlocked: right-click one in the Compendiums sidebar and choose Toggle Edit Lock, or let the macro unlock and lock them again.
 */
(async () => {
  if ( game.system.id !== "scarmark" ) return ui.notifications.error("Create alterations: this world does not run the scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Create alterations: run this as the GM.");

  const KEY = "system.itemMods.";
  const add = (stat, value) => ({ key: `${KEY}${stat}`, type: "add", value, priority: 20, phase: "initial" });
  const effect = (name, changes, flags = {}, extra = {}) => ({ name, img: "icons/svg/upgrade.svg", disabled: false, transfer: false, system: { changes }, flags: { "scarmark": flags }, ...extra });
  const repair = () => effect("Repair", [], { alteration: "repair" }, { img: "icons/svg/regen.svg" });
  const ASPECTS = ["blunt", "edged", "piercing", "fire"];

  const STARTERS = {
    "scarmark.armor-alterations": [
      repair(),
      effect("Reinforced", ASPECTS.map(aspect => add(`protection.${aspect}`, 1))),
      effect("Padded lining", [add("protection.blunt", 1)])
    ],
    "scarmark.weapon-alterations": [
      repair(),
      effect("Sharpened", [add("impact.edged", 1), add("impact.piercing", 1)]),
      effect("Balanced", [add("attack", 1), add("defense", 1)]),
      effect("Weighted", [add("impact.blunt", 1), add("attack", -1)])
    ]
  };

  let created = 0;
  for ( const [collection, entries] of Object.entries(STARTERS) ) {
    const pack = game.packs.get(collection);
    if ( !pack ) {
      ui.notifications.error(`Create alterations: the compendium ${collection} was not found. Reload the world (F5) once after updating the system.`);
      continue;
    }
    const wasLocked = pack.locked;
    if ( wasLocked ) await pack.configure({ locked: false });
    try {
      const names = new Set((await pack.getIndex()).map(entry => entry.name));
      for ( const data of entries ) {
        if ( names.has(data.name) ) continue;
        await ActiveEffect.implementation.create(data, { pack: collection });
        created++;
      }
    } finally {
      if ( wasLocked ) await pack.configure({ locked: true });
    }
  }
  ui.notifications.info(`Create alterations: ${created} alteration(s) added.`);
})();
