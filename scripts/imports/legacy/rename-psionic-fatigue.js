/**
 * Scarmark — Psionic Fatigue in Names (one-shot maintenance macro)
 * -----------------------------------------------------------------
 * Puts each psionic talent's Fatigue cost in front of its name, the same way
 * spells carry their Level ("1 Arcane Bolt I") and invocations their Circle
 * ("2 Awe"):  Negation (Fatigue 3)  ->  "F3 Negation".
 *
 * Renames psionic talents in this system's and the world's compendia (Item and
 * Actor packs; locked packs are unlocked for the update and re-locked), world
 * Items, world Actors and the own copies of unlinked tokens. Each item uses its
 * own Fatigue value. Re-running is safe: an existing "F<n> " prefix is replaced.
 *
 * Also renames the text results of every "D100 Psionic Talents" roll table
 * (system/world compendia and world tables) to the new compendium names.
 * (No Active Effect targeted a psionic talent by name when this was written,
 * so effect keys are not touched.)
 *
 * HOW TO USE (GM): new Script macro -> paste this file -> Execute.
 */
(async () => {
  if ( !game.user.isGM ) return ui.notifications.warn("Psionic Fatigue in Names: run this as the GM.");

  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const PREFIX = /^F\d+\s+/;
  const baseName = (name) => String(name ?? "").trim().replace(PREFIX, "");
  const fatigueName = (item) => `F${Number(item.system?.fatigue) || 0} ${baseName(item.name)}`;
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === game.system.id;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");

  // --- New names of the canonical talents (system compendia), for the roll tables ---
  const canonical = new Map(); // lower-case base name -> "F<n> Name"
  for ( const pack of packs.filter(p => isSystemPack(p) && p.documentName === "Item") ) {
    for ( const item of await pack.getDocuments({ type: "psionic" }) ) {
      canonical.set(baseName(item.name).toLowerCase(), fatigueName(item));
    }
  }
  if ( !canonical.size ) return ui.notifications.error("Psionic Fatigue in Names: no psionic talents found in the system compendia.");

  const preview = [...canonical.values()].sort((a, b) => a.localeCompare(b)).map(esc).join(", ");
  const ok = await foundry.applications.api.DialogV2.confirm({
    window: { title: "Psionic Fatigue in Names" },
    content: `<p>Rename all psionic talents to <b>F&lt;Fatigue&gt; Name</b> and update the D100 Psionic Talents table:</p><p>${preview}</p>`,
    rejectClose: false
  });
  if ( !ok ) return;

  const renamed = [];
  const tableRows = [];

  /** Rename payload for one psionic item, or null when already correct. */
  function renameUpdate(item, where) {
    if ( item.type !== "psionic" ) return null;
    const name = fatigueName(item);
    if ( name === item.name ) return null;
    renamed.push(`${where}: ${item.name} → ${name}`);
    return { _id: item.id, name };
  }

  async function processActor(actor, where, onlyItems = null) {
    const updates = [];
    for ( const item of actor.items ) {
      if ( onlyItems && !onlyItems.has(item.id) ) continue;
      const u = renameUpdate(item, where);
      if ( u ) updates.push(u);
    }
    if ( updates.length ) await actor.updateEmbeddedDocuments("Item", updates);
  }

  async function processTable(table, where) {
    if ( !/psionic talents/i.test(table.name) ) return;
    const updates = [];
    for ( const result of table.results ) {
      const current = result.name || result.description || "";
      const target = canonical.get(baseName(current).toLowerCase());
      if ( !target || target === current ) continue;
      tableRows.push(`${where}: ${current} → ${target}`);
      updates.push({ _id: result.id, name: target, description: target });
    }
    if ( updates.length ) await table.updateEmbeddedDocuments("TableResult", updates);
  }

  // --- Compendia ---
  for ( const pack of packs ) {
    if ( !["Item", "Actor", "RollTable"].includes(pack.documentName) ) continue;
    const docs = await pack.getDocuments();
    const label = `[${pack.metadata.label}]`;
    const wasLocked = pack.locked;
    if ( wasLocked ) await pack.configure({ locked: false });
    try {
      if ( pack.documentName === "Item" ) {
        const updates = docs.map(d => renameUpdate(d, label)).filter(Boolean);
        if ( updates.length ) await CONFIG.Item.documentClass.updateDocuments(updates, { pack: pack.collection });
      }
      else if ( pack.documentName === "Actor" ) {
        for ( const actor of docs ) await processActor(actor, `${label} ${actor.name}`);
      }
      else for ( const table of docs ) await processTable(table, `${label} ${table.name}`);
    }
    catch ( err ) {
      console.error(`Scarmark | Psionic Fatigue in Names failed in ${pack.collection}`, err);
      ui.notifications.error(`Psionic Fatigue in Names: error in ${pack.metadata.label}, see console.`);
    }
    finally {
      if ( wasLocked ) await pack.configure({ locked: true });
    }
  }

  // --- World items, actors, unlinked tokens and tables ---
  const worldItems = game.items.map(i => renameUpdate(i, "World item")).filter(Boolean);
  if ( worldItems.length ) await CONFIG.Item.documentClass.updateDocuments(worldItems);
  for ( const actor of game.actors ) await processActor(actor, `World actor ${actor.name}`);
  for ( const scene of game.scenes ) {
    for ( const token of scene.tokens ) {
      if ( token.actorLink || !token.actor || !token.delta ) continue;
      const own = new Set((token.delta._source?.items ?? []).map(i => i._id));
      if ( own.size ) await processActor(token.actor, `Scene ${scene.name} › token ${token.name}`, own);
    }
  }
  for ( const table of game.tables ) await processTable(table, `World table ${table.name}`);

  // --- Report ---
  console.log("Scarmark | Psionic Fatigue in Names", { renamed, tableRows });
  let content = `<div class="scarmark-card"><div class="card-title">Psionic Fatigue in Names</div>`;
  content += `<div class="card-line">${renamed.length} talent(s) renamed, ${tableRows.length} table result(s) updated.</div>`;
  content += `<div class="card-line"><i>Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
