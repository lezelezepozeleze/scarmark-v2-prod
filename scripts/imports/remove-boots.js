/**
 * Scarmark — Remove boots (one-shot maintenance macro)
 * ----------------------------------------------------
 * D. 2026-10-03: with the new hit locations, boots are part of the clothing /
 * armor worn on the Shin and Foot, so the stand-alone boot items are gone
 * (Knee and Calf were merged into Shin).
 *
 * This macro deletes every Item named Leather Boots, Leather Calf Boots,
 * Leather Knee Boots or Cloth Boots (case-insensitive, any item type):
 * system and world Item compendia, world items, the copy on every actor
 * (world actors, Actor compendia such as the NPC templates, and the own copies
 * of unlinked tokens on every scene).
 * Plate boots (and anything else with "boot" in the name that is not on the
 * list) are KEPT; those are only listed in the report so you can check them.
 * Module compendia are left alone. Locked packs are unlocked and re-locked.
 *
 * HOW TO USE (GM): back up the world, new Script macro -> paste this file ->
 * Execute -> "Report only" -> read the chat summary (details in F12) -> run
 * again -> "Apply". Safe to repeat: a second run finds nothing to do.
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("Remove boots: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Remove boots: run this as the GM.");

  const REMOVE = new Set(["leather boots", "leather calf boots", "leather knee boots", "cloth boots"]);
  const norm = (name) => String(name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
  const isRemoved = (item) => REMOVE.has(norm(item.name));
  const isKeptBoot = (item) => /boot/i.test(item.name ?? "") && !isRemoved(item);
  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Remove boots" },
    content: `<p>Delete the items <b>Leather Boots, Leather Calf Boots, Leather Knee Boots, Cloth Boots</b>
      from the system and world compendia, world items, all actors and unlinked tokens.
      Plate boots are kept.</p><p><b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const deleted = [];   // where
  const kept = [];      // where (other boots, not touched)
  const errors = [];

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Remove boots failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  async function processItem(item, where) {
    await guarded(where, async () => {
      if ( isRemoved(item) ) {
        deleted.push(where);
        if ( apply ) await item.delete();
      }
      else if ( isKeptBoot(item) ) kept.push(where);
    });
  }

  /** `only` restricts an unlinked token to the copies stored in its own delta. */
  async function processActor(actor, where, only = null) {
    await guarded(where, async () => {
      const toDelete = [];
      for ( const item of actor.items ) {
        if ( only && !only.has(item.id) ) continue;
        const w = `${where} › ${item.name}`;
        if ( isRemoved(item) ) { toDelete.push(item.id); deleted.push(w); }
        else if ( isKeptBoot(item) ) kept.push(w);
      }
      if ( apply && toDelete.length ) await actor.deleteEmbeddedDocuments("Item", toDelete);
    });
  }

  for ( const pack of packs ) {
    if ( !["Item", "Actor"].includes(pack.documentName) ) continue;
    const label = `[${pack.metadata.label}]`;
    const wasLocked = pack.locked;
    try {
      const docs = await pack.getDocuments();
      if ( apply && wasLocked ) await pack.configure({ locked: false });
      for ( const doc of docs ) {
        const where = `${label} ${doc.name}`;
        if ( pack.documentName === "Actor" ) await processActor(doc, where);
        else await processItem(doc, where);
      }
    }
    catch ( err ) {
      console.error(`Scarmark | Remove boots failed in ${pack.collection}`, err);
      errors.push({ where: label, error: err?.message ?? String(err) });
    }
    finally {
      if ( apply && wasLocked ) await pack.configure({ locked: true });
    }
  }

  for ( const item of [...game.items] ) await processItem(item, `World item ${item.name}`);
  for ( const actor of game.actors ) await processActor(actor, `World actor ${actor.name}`);

  for ( const scene of game.scenes ) {
    for ( const token of scene.tokens ) {
      if ( token.actorLink || !token.actor || !token.delta ) continue;
      const only = new Set((token.delta._source?.items ?? []).map(i => i._id));
      if ( !only.size ) continue;
      await processActor(token.actor, `Scene ${scene.name} › token ${token.name}`, only);
    }
  }

  const table = (label, list) => { if ( list.length ) console.table(list.map(where => ({ [label]: where }))); };
  console.log(`Scarmark | Remove boots (${apply ? "APPLY" : "REPORT"})`);
  table("boots deleted", deleted);
  table("other boots kept", kept);
  if ( errors.length ) console.table(errors);

  const verb = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Remove boots — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Boot items deleted${verb}: <b>${deleted.length}</b></div>`;
  content += `<div class="card-line">Other boots kept (e.g. plate): <b>${kept.length}</b></div>`;
  if ( kept.length ) {
    for ( const w of [...new Set(kept.map(k => k.split(" › ").pop()))].slice(0, 15) ) content += `<div class="card-line">${esc(w)}</div>`;
  }
  if ( errors.length ) {
    content += `<hr class="card-sep"><div class="card-line broken"><b>${errors.length} error(s)</b> — see F12; run again after fixing.</div>`;
    for ( const e of errors.slice(0, 10) ) content += `<div class="card-line">${esc(e.where)}: ${esc(e.error)}</div>`;
  }
  content += `<div class="card-line"><i>Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
