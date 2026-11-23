/**
 * Scarmark — Drop a Lantern (Script macro)
 * ----------------------------------------
 * Drops a lit lantern from the selected token(s): spawns the compendium actor
 * "Dropped Lantern" at the token's position, turns the token's Light off, and
 * removes the "Lantern" item from the inventory.
 *
 * The dropped object is a real Actor/Token, so creating it (and importing the
 * "Dropped Lantern" actor into the world the first time) needs Actor/Token create
 * permission — run as GM, or have the GM grant players "Create New Tokens" and
 * pre-import the "Dropped …" actors once.
 *
 * HOW TO USE: create a Script macro, paste this in, select a token, execute.
 */
(async () => {
  const DROP_NAME = "Dropped Lantern";
  const REMOVE_ITEM = "Lantern";

  const tokens = canvas.tokens?.controlled ?? [];
  if ( !tokens.length ) return ui.notifications.warn("Drop a Lantern: select a token first.");

  const OFF = { dim: 0, bright: 0, alpha: 0.5, color: null, animation: { type: null } };

  const ensureWorldActor = async (name) => {
    let a = game.actors.getName(name);
    if ( a ) return a;
    for ( const pack of game.packs.filter(p => p.documentName === "Actor") ) {
      const idx = await pack.getIndex();
      const e = idx.find(x => x.name?.trim().toLowerCase() === name.toLowerCase());
      if ( e ) return game.actors.importFromCompendium(pack, e._id);
    }
    return null;
  };
  const dropAt = async (token) => {
    const world = await ensureWorldActor(DROP_NAME);
    if ( !world ) { ui.notifications.error(`"${DROP_NAME}" not found in the world or any compendium.`); return false; }
    const grid = canvas.grid.size;
    const w = (world.prototypeToken?.width ?? 1) * grid;
    const h = (world.prototypeToken?.height ?? 1) * grid;
    const x = Math.round(token.center.x - w / 2);
    const y = Math.round(token.center.y - h / 2);
    const td = await world.getTokenDocument({ x, y });
    await canvas.scene.createEmbeddedDocuments("Token", [td.toObject()]);
    return true;
  };

  let done = 0;
  for ( const token of tokens ) {
    try {
      if ( !(await dropAt(token)) ) continue;          // spawn first — don't lose the item on failure
      await token.document.update({ light: OFF });     // then extinguish the carrier's light
      if ( REMOVE_ITEM && token.actor ) {
        const items = token.actor.items.filter(i => i.name?.trim().toLowerCase() === REMOVE_ITEM.toLowerCase());
        if ( items.length ) await token.actor.deleteEmbeddedDocuments("Item", items.map(i => i.id));
      }
      done++;
    } catch (err) {
      console.error("Scarmark | Drop a Lantern error", token.name, err);
      ui.notifications.error(`${token.name}: ${err.message}`);
    }
  }
  if ( done ) ui.notifications.info(`Dropped a lantern from ${done} token(s).`);
})();
