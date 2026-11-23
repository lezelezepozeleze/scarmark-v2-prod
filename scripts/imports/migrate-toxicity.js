/**
 * Scarmark - Migrate Toxicity (one-shot maintenance macro, 1.0.55)
 * ------------------------------------------------------------------------------
 * A consumable (gear with Consumable ticked) has a Toxicity number: consuming it lowers Vitality by that many points for as long as its effect lasts. Until now the Vitality penalty was typed into each item's own Active Effect (Beer (5) carried "Vitality -5").
 *
 *   1. Every consumable whose name ends in a number in brackets, e.g. Beer (5), gets that number as its toxicity (when its toxicity is still 0).
 *   2. The Vitality change of -N (the same number) is removed from the item's own effects, so consuming does not apply the penalty twice. The effect itself stays (it still carries the duration and any other changes).
 * Consumables with no number in the name are left alone (toxicity 0, effects untouched).
 *
 * Covers system and world compendia, world items and actors, unlinked tokens. Locked packs are unlocked and locked again. Safe to repeat: a second run changes nothing.
 *
 * HOW TO USE (GM, a COPY of the world first, Scarmark 1.0.55-beta or later):
 *   0. After updating the system files RELOAD the world (F5).
 *   1. Back up the world and commit the system packs.
 *   2. New Script macro -> paste this file -> Execute -> "Report only".
 *   3. Read the chat summary (details in the F12 console) -> run again -> "Apply".
 *   4. Reload the world (F5). Open a drink (Details tab) and consume one on a character.
 */
(async () => {
  if ( game.system.id !== "scarmark" ) return ui.notifications.error("Migrate Toxicity: this world does not run the scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Migrate Toxicity: run this as the GM.");
  if ( !CONFIG.Item.dataModels?.gear?.defineSchema?.()?.toxicity ) {
    return ui.notifications.error("Migrate Toxicity: this page runs an older system (gear has no toxicity). Update the system and reload the world (F5), then run the macro again.", { permanent: true });
  }

  const VITALITY_KEY = "system.mods.skill.vitality";
  const NAME_NUMBER = /\((\d+)\)\s*$/;

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Migrate Toxicity" },
    content: `<p>Consumables with a number in their name (Beer (5)) get that number as toxicity, and the matching hand-typed Vitality penalty is removed from their effects.</p>
      <p>System and world compendia, world items and actors, unlinked tokens. <b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const count = { items: 0, effects: 0, packs: 0 };
  const rows = [];
  const errors = [];

  const changesOf = (effect) => effect._source.system?.changes ?? effect._source.changes ?? [];

  /** The item update and the effect updates for a consumable, or null when there is nothing to do. */
  function plan(item) {
    if ( item.type !== "gear" || !item._source.system.consumable ) return null;
    const toxicity = Number(NAME_NUMBER.exec(item.name)?.[1]);
    if ( !Number.isFinite(toxicity) || toxicity <= 0 ) return null;
    const itemUpdate = Number(item._source.system.toxicity) > 0 ? null : { "system.toxicity": toxicity };
    const effectUpdates = [];
    for ( const effect of item.effects ) {
      const changes = changesOf(effect);
      const kept = changes.filter(c => !(String(c.key).toLowerCase() === VITALITY_KEY && Number(c.value) === -toxicity));
      if ( kept.length !== changes.length ) effectUpdates.push({ _id: effect.id, "system.changes": kept });
    }
    if ( !itemUpdate && !effectUpdates.length ) return null;
    return { toxicity, itemUpdate, effectUpdates };
  }

  async function processItem(item, where) {
    const p = plan(item);
    if ( !p ) return;
    count.items++;
    count.effects += p.effectUpdates.length;
    rows.push({ where, item: item.name, toxicity: p.toxicity, vitalityChangesRemoved: p.effectUpdates.length });
    if ( !apply ) return;
    if ( p.itemUpdate ) await item.update(p.itemUpdate, { diff: false });
    if ( p.effectUpdates.length ) await item.updateEmbeddedDocuments("ActiveEffect", p.effectUpdates, { diff: false });
  }

  async function processActor(actor, where, onlyIds = null) {
    for ( const item of actor.items ) {
      if ( onlyIds && !onlyIds.has(item.id) ) continue;
      await processItem(item, `${where} › ${actor.name}`);
    }
  }

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Migrate Toxicity failed in ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  ui.notifications.info(`Migrate Toxicity: ${apply ? "migrating" : "checking"}, please wait...`);

  for ( const pack of game.packs ) {
    if ( !["Item", "Actor"].includes(pack.documentName) ) continue;
    if ( ![game.system.id, "world"].includes(pack.metadata.packageName) ) continue;
    count.packs++;
    const label = `[${pack.metadata.label}]`;
    const wasLocked = pack.locked;
    await guarded(label, async () => {
      const docs = await pack.getDocuments();
      if ( apply && wasLocked ) await pack.configure({ locked: false });
      try {
        for ( const doc of docs ) {
          if ( pack.documentName === "Actor" ) await processActor(doc, label);
          else await processItem(doc, label);
        }
      } finally {
        if ( apply && wasLocked && (pack.locked === false) ) await pack.configure({ locked: true });
      }
    });
  }

  for ( const item of [...game.items] ) await guarded(`World item ${item.name}`, () => processItem(item, "World item"));
  for ( const actor of game.actors ) await guarded(`World actor ${actor.name}`, () => processActor(actor, "World actor"));
  for ( const scene of game.scenes ) {
    for ( const token of scene.tokens ) {
      if ( token.actorLink || !token.actor || !token.delta ) continue;
      const own = new Set((token.delta._source?.items ?? []).map(i => i._id));
      if ( own.size ) await guarded(`Scene ${scene.name} token ${token.name}`, () => processActor(token.actor, `Scene ${scene.name}`, own));
    }
  }

  console.log(`Scarmark | Migrate Toxicity (${apply ? "APPLY" : "REPORT"})`, count);
  if ( rows.length ) console.table(rows);
  if ( errors.length ) console.table(errors);

  const v = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Migrate Toxicity - ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Consumables changed${v}: <b>${count.items}</b>, Vitality changes removed from effects${v}: <b>${count.effects}</b></div>`;
  content += `<div class="card-line">Compendia checked: <b>${count.packs}</b>${errors.length ? `, <b>errors: ${errors.length}</b> (see the console)` : ""}</div>`;
  content += apply ? `<div class="card-line"><i>Reload the world (F5).</i></div>` : `<div class="card-line"><i>Nothing was changed. Run again and choose Apply.</i></div>`;
  content += `</div>`;
  await ChatMessage.create({ whisper: [game.user.id], content });
})();
