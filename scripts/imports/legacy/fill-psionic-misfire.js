/**
 * Scarmark — Fill Psionic Misfire (one-shot maintenance macro)
 * --------------------------------------------------------------
 * Every psionic talent's Description ends with a paragraph
 *   "Misfire (CF): <backlash text>"
 * but the talent's own Misfire field (the text posted to chat on a Critical
 * Failure) was left empty. This macro copies that backlash text into the Misfire
 * field. The Description itself is not changed, and a Misfire field that already
 * has text is never overwritten.
 *
 * Covers psionic talents in this system's and the world's compendia (Item and
 * Actor packs; locked packs are unlocked for the update and re-locked), world
 * Items, world Actors and the own copies of unlinked tokens on every scene.
 *
 * HOW TO USE (GM): new Script macro -> paste this file -> Execute.
 */
(async () => {
  if ( !game.user.isGM ) return ui.notifications.warn("Fill Psionic Misfire: run this as the GM.");

  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === game.system.id;
  const packs = game.packs.filter(p => (isSystemPack(p) || p.metadata.packageType === "world")
    && ["Item", "Actor"].includes(p.documentName));

  /** The backlash text after a bold "Misfire …:" label, as a paragraph, or "". */
  function extractMisfire(html) {
    const div = document.createElement("div");
    div.innerHTML = html ?? "";
    for ( const p of div.querySelectorAll("p") ) {
      const label = p.querySelector("strong, b");
      if ( !label || !/^\s*Misfire\b/i.test(label.textContent) ) continue;
      label.remove();
      const text = p.innerHTML.trim().replace(/^[:\s]+/, "");
      return text ? `<p>${text}</p>` : "";
    }
    return "";
  }

  const filled = [];
  const noText = [];

  /** Update payload for one psionic item, or null. */
  function misfireUpdate(item, where) {
    if ( item.type !== "psionic" ) return null;
    if ( String(item._source.system?.misfire ?? "").replace(/<[^>]*>/g, "").trim() ) return null;
    const misfire = extractMisfire(item._source.system?.description);
    if ( !misfire ) { noText.push(where); return null; }
    filled.push(where);
    return { _id: item.id, "system.misfire": misfire };
  }

  async function processActor(actor, where, onlyItems = null) {
    const updates = [];
    for ( const item of actor.items ) {
      if ( onlyItems && !onlyItems.has(item.id) ) continue;
      const u = misfireUpdate(item, `${where} › ${item.name}`);
      if ( u ) updates.push(u);
    }
    if ( updates.length ) await actor.updateEmbeddedDocuments("Item", updates);
  }

  // --- Compendia ---
  for ( const pack of packs ) {
    const docs = await pack.getDocuments();
    const wasLocked = pack.locked;
    if ( wasLocked ) await pack.configure({ locked: false });
    try {
      if ( pack.documentName === "Item" ) {
        const updates = docs.map(d => misfireUpdate(d, `[${pack.metadata.label}] ${d.name}`)).filter(Boolean);
        if ( updates.length ) await CONFIG.Item.documentClass.updateDocuments(updates, { pack: pack.collection });
      }
      else for ( const actor of docs ) await processActor(actor, `[${pack.metadata.label}] ${actor.name}`);
    }
    catch ( err ) {
      console.error(`Scarmark | Fill Psionic Misfire failed in ${pack.collection}`, err);
      ui.notifications.error(`Fill Psionic Misfire: error in ${pack.metadata.label}, see console.`);
    }
    finally {
      if ( wasLocked ) await pack.configure({ locked: true });
    }
  }

  // --- World items, actors and unlinked tokens ---
  const worldItems = game.items.map(i => misfireUpdate(i, `World item ${i.name}`)).filter(Boolean);
  if ( worldItems.length ) await CONFIG.Item.documentClass.updateDocuments(worldItems);
  for ( const actor of game.actors ) await processActor(actor, `World actor ${actor.name}`);
  for ( const scene of game.scenes ) {
    for ( const token of scene.tokens ) {
      if ( token.actorLink || !token.actor || !token.delta ) continue;
      const own = new Set((token.delta._source?.items ?? []).map(i => i._id));
      if ( own.size ) await processActor(token.actor, `Scene ${scene.name} › token ${token.name}`, own);
    }
  }

  // --- Report ---
  console.log(`Scarmark | Fill Psionic Misfire: ${filled.length} filled`, filled);
  if ( noText.length ) console.warn("Scarmark | Fill Psionic Misfire: no 'Misfire' paragraph in", noText);
  let content = `<div class="scarmark-card"><div class="card-title">Fill Psionic Misfire</div>`;
  content += `<div class="card-line">${filled.length} talent(s) filled.</div>`;
  if ( noText.length ) {
    content += `<hr class="card-sep"><div class="card-line"><b>No "Misfire" paragraph in the Description:</b></div>`;
    for ( const w of noText ) content += `<div class="card-line">${esc(w)}</div>`;
  }
  content += `<div class="card-line"><i>Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
