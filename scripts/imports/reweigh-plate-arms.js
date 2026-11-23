/**
 * Scarmark — Reweigh plate arms and shoulders (one-shot maintenance macro)
 * ------------------------------------------------------------------------
 * D. 2026-10-03: Elbow, Forearm and Upper Arm merged into Arm, so the plate arm
 * pieces were re-cut and need new weights (kg, per unit):
 *
 *   Plate Shoulders   (Shoulder)         1.8
 *   Plate Half Arms   (Arm)              3.3
 *   Plate Full Arms   (Shoulder, Arm)    5.1
 *
 * Derivation from the old pieces: Plate Arms (Shoulder, Upper Arm, Elbow, Forearm)
 * weighed 5.1, so Full Arms keeps 5.1. Plate Short Arms (Shoulder, Upper Arm) weighed
 * 3.3 and the shoulder share of a short arm is 0.93 / 1.7 = 55 % (Cuir bouilli
 * Shoulders vs. Short Arms), i.e. Shoulders 1.8 and Half Arms 5.1 - 1.8 = 3.3
 * (= Upper Arm 1.5 + Bracers 1.4 + Elbow 0.4). Edit WEIGHTS below to taste.
 *
 * Sets system.weight on every Item with one of these names (case-insensitive):
 * system and world Item compendia, world items, every actor (world, Actor
 * compendia, own copies of unlinked tokens on scenes). Price is NOT changed.
 * Module compendia are left alone. Locked packs are unlocked and re-locked.
 *
 * HOW TO USE (GM): back up the world, new Script macro -> paste -> Execute ->
 * "Report only" -> read the chat summary -> run again -> "Apply". Safe to repeat.
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("Reweigh: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Reweigh: run this as the GM.");

  const WEIGHTS = { "plate shoulders": 1.8, "plate half arms": 3.3, "plate full arms": 5.1 };
  const norm = (name) => String(name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
  const target = (item) => WEIGHTS[norm(item.name)];
  const needs = (item) => (target(item) !== undefined) && (Number(item._source?.system?.weight) !== target(item));
  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Reweigh plate arms" },
    content: `<p>Set the weight of <b>Plate Shoulders</b> (${WEIGHTS["plate shoulders"]}), <b>Plate Half Arms</b>
      (${WEIGHTS["plate half arms"]}) and <b>Plate Full Arms</b> (${WEIGHTS["plate full arms"]}) kg in the system and world
      compendia, world items, all actors and unlinked tokens.</p><p><b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const changed = [];   // "where: old -> new"
  const errors = [];
  const seen = new Set();

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Reweigh failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }
  const note = (item, where) => {
    seen.add(norm(item.name));
    changed.push(`${where}: ${item._source.system?.weight} → ${target(item)}`);
  };

  async function processItem(item, where) {
    if ( !needs(item) ) { if ( target(item) !== undefined ) seen.add(norm(item.name)); return; }
    await guarded(where, async () => {
      note(item, where);
      if ( apply ) await item.update({ "system.weight": target(item) });
    });
  }

  /** `only` restricts an unlinked token to the copies stored in its own delta. */
  async function processActor(actor, where, only = null) {
    await guarded(where, async () => {
      const updates = [];
      for ( const item of actor.items ) {
        if ( only && !only.has(item.id) ) continue;
        if ( target(item) === undefined ) continue;
        seen.add(norm(item.name));
        if ( !needs(item) ) continue;
        note(item, `${where} › ${item.name}`);
        updates.push({ _id: item.id, "system.weight": target(item) });
      }
      if ( apply && updates.length ) await actor.updateEmbeddedDocuments("Item", updates);
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
      console.error(`Scarmark | Reweigh failed in ${pack.collection}`, err);
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

  const missing = Object.keys(WEIGHTS).filter(n => !seen.has(n));
  console.log(`Scarmark | Reweigh plate arms (${apply ? "APPLY" : "REPORT"})`);
  if ( changed.length ) console.table(changed.map(c => ({ reweighed: c })));
  if ( errors.length ) console.table(errors);

  const verb = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Reweigh plate arms — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Items reweighed${verb}: <b>${changed.length}</b></div>`;
  if ( missing.length ) content += `<div class="card-line">Not found anywhere: <b>${esc(missing.join(", "))}</b></div>`;
  if ( errors.length ) {
    content += `<hr class="card-sep"><div class="card-line broken"><b>${errors.length} error(s)</b> — see F12.</div>`;
    for ( const e of errors.slice(0, 10) ) content += `<div class="card-line">${esc(e.where)}: ${esc(e.error)}</div>`;
  }
  content += `<div class="card-line"><i>Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
