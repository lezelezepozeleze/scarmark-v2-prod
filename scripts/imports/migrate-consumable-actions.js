/**
 * Scarmark - Migrate Consumable Actions (one-shot maintenance macro)
 * ------------------------------------------------------------------------------
 * Until now consuming a consumable put ALL the effects of the item on the consumer. Items now say what happens in their Actions tab. This macro gives every older consumable (gear with Consumable ticked, at least one effect, and no actions yet) one action per effect: "when Consumed add <effect>". Consuming then does exactly what it did before.
 * The effects of those items are also set not to transfer, so they stay a list of what the item can do instead of applying to whoever carries it.
 * Items that already have actions, and consumables without effects, are left alone.
 *
 * Covers system and world compendia, world items and actors, unlinked tokens. Locked packs are unlocked and locked again. Safe to repeat: a second run changes nothing.
 *
 * HOW TO USE (GM, a COPY of the world first, a Scarmark version with item actions):
 *   0. After updating the system files RELOAD the world (F5).
 *   1. Back up the world and commit the system packs.
 *   2. New Script macro -> paste this file -> Execute -> "Report only".
 *   3. Read the chat summary (details in the F12 console) -> run again -> "Apply".
 *   4. Reload the world (F5). Open a drink, check its Actions tab, consume one on a character.
 */
(async () => {
  if ( game.system.id !== "scarmark" ) return ui.notifications.error("Migrate Consumable Actions: this world does not run the scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Migrate Consumable Actions: run this as the GM.");
  if ( !CONFIG.Item.dataModels?.gear?.defineSchema?.()?.actions ) {
    return ui.notifications.error("Migrate Consumable Actions: this page runs an older system (gear has no actions). Update the system and reload the world (F5), then run the macro again.", { permanent: true });
  }

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Migrate Consumable Actions" },
    content: `<p>Older consumables get one "when Consumed add effect" action per effect, and their effects stop transferring to the carrier.</p>
      <p>System and world compendia, world items and actors, unlinked tokens. <b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const count = { items: 0, actions: 0, effects: 0, packs: 0 };
  const rows = [];
  const errors = [];

  /** The item update and the effect updates for an older consumable, or null when there is nothing to do. */
  function plan(item) {
    if ( item.type !== "gear" || !item._source.system.consumable ) return null;
    if ( (item._source.system.actions ?? []).length ) return null;
    const effects = [...item.effects];
    if ( !effects.length ) return null;
    const actions = effects.map(effect => ({ id: foundry.utils.randomID(), kind: "effect", test: "", effect: effect.id, on: "", targetItem: "", when: "consumed" }));
    const effectUpdates = effects.filter(effect => effect._source.transfer !== false).map(effect => ({ _id: effect.id, transfer: false }));
    return { actions, effectUpdates };
  }

  async function processItem(item, where) {
    const p = plan(item);
    if ( !p ) return;
    count.items++;
    count.actions += p.actions.length;
    count.effects += p.effectUpdates.length;
    rows.push({ where, item: item.name, actionsAdded: p.actions.length, effectsMadeNonTransferring: p.effectUpdates.length });
    if ( !apply ) return;
    await item.update({ "system.actions": p.actions }, { diff: false });
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
      console.error(`Scarmark | Migrate Consumable Actions failed in ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  ui.notifications.info(`Migrate Consumable Actions: ${apply ? "migrating" : "checking"}, please wait...`);

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

  console.log(`Scarmark | Migrate Consumable Actions (${apply ? "APPLY" : "REPORT"})`, count);
  if ( rows.length ) console.table(rows);
  if ( errors.length ) console.table(errors);

  const v = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Migrate Consumable Actions - ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Consumables changed${v}: <b>${count.items}</b>, actions added${v}: <b>${count.actions}</b>, effects made non-transferring${v}: <b>${count.effects}</b></div>`;
  content += `<div class="card-line">Compendia checked: <b>${count.packs}</b>${errors.length ? `, <b>errors: ${errors.length}</b> (see the console)` : ""}</div>`;
  content += apply ? `<div class="card-line"><i>Reload the world (F5).</i></div>` : `<div class="card-line"><i>Nothing was changed. Run again and choose Apply.</i></div>`;
  content += `</div>`;
  await ChatMessage.create({ whisper: [game.user.id], content });
})();
