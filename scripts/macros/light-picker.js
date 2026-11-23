/**
 * Scarmark — Light Picker (Script macro)
 * --------------------------------------
 * Opens a small dialog and lights / extinguishes a portable light source on the
 * selected token(s). Works on the token's actor (handles unlinked NPC tokens).
 *
 *   Light a candle  — needs a "Candle" item; consumes 1; token Light dim 2 m / bright 1 m.
 *   Light a torch   — needs a "Torch" item AND the "Torch (Lit)" weapon in a compendium;
 *                     consumes 1 Torch, adds the "Torch (Lit)" weapon; token Light dim 4 m / bright 2 m.
 *   Light a lantern — needs a "Lantern" (kept) AND "Lamp Oil"; consumes 1 Lamp Oil;
 *                     token Light dim 6 m / bright 3 m.
 *   Extinguish      — clears the token Light and removes any "Torch (Lit)" weapon.
 *   Cancel          — closes the dialog.
 *
 * Distances in metres (scene units; one grid square = 1 m, formerly 5 ft).
 * All lights: color #deac3f, Color Intensity (alpha) 0.25, animation intensity 2
 * (candle = Flickering Light, torch & lantern = Torch). Consumables are deleted at qty 0.
 *
 * HOW TO USE: create a Script macro, paste this in, select a token, execute.
 */
(async () => {
  const tokens = canvas.tokens?.controlled ?? [];
  if ( !tokens.length ) return ui.notifications.warn("Light Picker: select a token first.");

  // Resolve a light-animation type key from its (localized) label, with a fallback.
  const animType = (label, fallback) => {
    const anims = CONFIG.Canvas?.lightAnimations ?? {};
    for ( const [key, cfg] of Object.entries(anims) ) {
      const l = cfg?.label ? game.i18n.localize(cfg.label) : "";
      if ( key.toLowerCase() === label.toLowerCase() ) return key;
      if ( l && l.toLowerCase() === label.toLowerCase() ) return key;
    }
    return fallback;
  };
  const TORCH_ANIM = animType("Torch", "torch");
  const FLICKER_ANIM = animType("Flickering Light", TORCH_ANIM);

  const COLOR = "#deac3f", ALPHA = 0.25, SPEED = 5;
  const PROFILES = {
    candle:  { dim: 2,  bright: 1,  color: COLOR, alpha: ALPHA, animation: { type: FLICKER_ANIM, speed: SPEED, intensity: 2 } },
    torch:   { dim: 4,  bright: 2,  color: COLOR, alpha: ALPHA, animation: { type: TORCH_ANIM,   speed: SPEED, intensity: 2 } },
    lantern: { dim: 6,  bright: 3,  color: COLOR, alpha: ALPHA, animation: { type: TORCH_ANIM,   speed: SPEED, intensity: 2 } }
  };
  const OFF = { dim: 0, bright: 0, alpha: 0.5, color: null, animation: { type: null } };

  const findItem = (actor, name) => actor.items.find(i => i.name?.trim().toLowerCase() === name.toLowerCase());
  const consumeOne = async (item) => {
    const q = (item.system.quantity ?? 1) - 1;
    if ( q <= 0 ) await item.delete();
    else await item.update({ "system.quantity": q });
  };
  const findCompendiumItem = async (name) => {
    for ( const pack of game.packs.filter(p => p.documentName === "Item") ) {
      const index = await pack.getIndex();
      const entry = index.find(e => e.name?.trim().toLowerCase() === name.toLowerCase());
      if ( entry ) return pack.getDocument(entry._id);
    }
    return null;
  };

  const DialogV2 = foundry.applications.api.DialogV2;
  const choice = await DialogV2.wait({
    window: { title: "Light Picker" },
    content: `<p style="margin:.25rem 0 .5rem;">Choose a light source for the selected token(s):</p>`,
    buttons: [
      { action: "candle",     label: "Light a candle" },
      { action: "torch",      label: "Light a torch" },
      { action: "lantern",    label: "Light a lantern" },
      { action: "extinguish", label: "Extinguish" },
      { action: "cancel",     label: "Cancel", default: true }
    ],
    rejectClose: false
  });
  if ( !choice || choice === "cancel" ) return;

  let done = 0;
  for ( const token of tokens ) {
    const actor = token.actor;
    if ( !actor ) { ui.notifications.warn(`${token.name}: no actor.`); continue; }
    try {
      if ( choice === "candle" ) {
        const candle = findItem(actor, "Candle");
        if ( !candle || (candle.system.quantity ?? 0) < 1 ) { ui.notifications.warn(`${token.name}: no Candle.`); continue; }
        await consumeOne(candle);
        await token.document.update({ light: PROFILES.candle });
        done++;
      }
      else if ( choice === "torch" ) {
        const torch = findItem(actor, "Torch");
        if ( !torch || (torch.system.quantity ?? 0) < 1 ) { ui.notifications.warn(`${token.name}: no Torch.`); continue; }
        const lit = await findCompendiumItem("Torch (Lit)");
        if ( !lit ) { ui.notifications.error(`"Torch (Lit)" weapon not found in any compendium — Torch not consumed.`); continue; }
        await consumeOne(torch);
        await actor.createEmbeddedDocuments("Item", [lit.toObject()]);
        await token.document.update({ light: PROFILES.torch });
        done++;
      }
      else if ( choice === "lantern" ) {
        const lantern = findItem(actor, "Lantern");
        if ( !lantern ) { ui.notifications.warn(`${token.name}: no Lantern.`); continue; }
        const oil = findItem(actor, "Lamp Oil");
        if ( !oil || (oil.system.quantity ?? 0) < 1 ) { ui.notifications.warn(`${token.name}: no Lamp Oil.`); continue; }
        await consumeOne(oil);
        await token.document.update({ light: PROFILES.lantern });
        done++;
      }
      else if ( choice === "extinguish" ) {
        await token.document.update({ light: OFF });
        const lits = actor.items.filter(i => i.name?.trim().toLowerCase() === "torch (lit)");
        if ( lits.length ) await actor.deleteEmbeddedDocuments("Item", lits.map(i => i.id));
        done++;
      }
    } catch (err) {
      console.error("Scarmark | Light Picker error", token.name, err);
      ui.notifications.error(`${token.name}: ${err.message}`);
    }
  }

  if ( done ) {
    const verb = choice === "extinguish" ? "Extinguished" : `Lit (${choice})`;
    ui.notifications.info(`Light Picker: ${verb} on ${done} token(s).`);
  }
})();
