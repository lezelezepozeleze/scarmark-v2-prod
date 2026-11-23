/**
 * Scarmark — Remove MOBILITY (one-shot maintenance macro)
 * --------------------------------------------------------
 * D. 2026-09-28: the MOBILITY skill is gone. Movement per round is now AGL in
 * metres, and what used to be a Mobility roll is an AGL x 3 attribute test.
 * "Acrobatics (MOBILITY)" stays as a skill of its own, renamed "Acrobatics".
 *
 * This macro:
 *   - deletes every skill named MOBILITY (any case): the Skills compendium entry,
 *     world items, and the copy on every actor (world actors, actors in the
 *     system and world compendia, e.g. the NPC templates, and the own copies of
 *     unlinked tokens on every scene);
 *   - renames "Acrobatics (MOBILITY)" to "Acrobatics" wherever it is, and drops
 *     the MOBILITY wording from its description;
 *   - rewrites Active Effect keys system.mods.skill.Acrobatics (MOBILITY) to
 *     system.mods.skill.Acrobatics;
 *   - fixes the Water Elf trait text "(Swimming = Mobility)";
 *   - LISTS (does not change) Active Effects that still target
 *     system.mods.skill.MOBILITY, so the GM can decide what they should do.
 * Module compendia are left alone. Locked packs are unlocked and re-locked.
 *
 * HOW TO USE (GM): back up the world, new Script macro -> paste this file ->
 * Execute -> "Report only" -> read the chat summary (details in F12) -> run
 * again -> "Apply". Safe to repeat: a second run finds nothing to do.
 * Requires Scarmark 1.0.35-beta or later (new actors no longer get MOBILITY).
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("Remove MOBILITY: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Remove MOBILITY: run this as the GM.");

  const PREFIX = "system.mods.skill.";
  const NEW_ACRO = "Acrobatics";
  const isMobility = (name) => String(name ?? "").trim().toLowerCase() === "mobility";
  const isOldAcro = (name) => /^acrobatics\s*\(\s*mobility\s*\)$/i.test(String(name ?? "").trim());
  const TEXT_FIXES = [
    ["An extension of MOBILITY into riskier, flashier movement", "Riskier, flashier movement"],
    ["(Swimming = Mobility)", "(AGL metres per round)"]
  ];
  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Remove MOBILITY" },
    content: `<p>Delete the <b>MOBILITY</b> skill from the system and world compendia, world items, all actors
      and unlinked tokens; rename <b>Acrobatics (MOBILITY)</b> to <b>${NEW_ACRO}</b>.</p><p><b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const deleted = [];     // where
  const renamed = [];     // where
  const texts = [];       // where
  const keys = [];        // where (Acrobatics key rewritten)
  const leftover = [];    // where (effects still targeting MOBILITY)
  const errors = [];

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Remove MOBILITY failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  /* -------------------------------------------- */
  /*  Change builders                              */
  /* -------------------------------------------- */

  /** Fixed copy of an effect's changes (Acrobatics key), or null. Lists MOBILITY keys. */
  function effectUpdate(effect, where) {
    const src = effect._source ?? {};
    const path = Array.isArray(src.system?.changes) ? "system.changes" : "changes";
    const changes = foundry.utils.getProperty(src, path) ?? [];
    let changed = false;
    const out = changes.map(change => {
      if ( !change?.key?.startsWith(PREFIX) ) return change;
      const name = change.key.slice(PREFIX.length);
      if ( isMobility(name) ) leftover.push(`${where} › ${effect.name}`);
      if ( !isOldAcro(name) ) return change;
      changed = true;
      keys.push(`${where} › ${effect.name}`);
      return { ...change, key: PREFIX + NEW_ACRO };
    });
    return changed ? { _id: effect.id, [path]: out } : null;
  }

  function effectUpdates(effects, where) {
    return effects.map(e => effectUpdate(e, where)).filter(Boolean);
  }

  /** Name / description fixes for one item (not deletion), or null. */
  function itemUpdate(item, where) {
    const src = item._source ?? {};
    const u = {};
    if ( isOldAcro(src.name) ) { u.name = NEW_ACRO; renamed.push(where); }
    let desc = src.system?.description;
    if ( typeof desc === "string" ) {
      for ( const [from, to] of TEXT_FIXES ) desc = desc.split(from).join(to);
      if ( desc !== src.system.description ) { u["system.description"] = desc; texts.push(where); }
    }
    return Object.keys(u).length ? u : null;
  }

  /* -------------------------------------------- */
  /*  Processors                                   */
  /* -------------------------------------------- */

  /** A stand-alone item (compendium or world). */
  async function processItem(item, where) {
    await guarded(where, async () => {
      if ( (item.type === "skill") && isMobility(item.name) ) {
        deleted.push(where);
        if ( apply ) await item.delete();
        return;
      }
      const u = itemUpdate(item, where);
      if ( apply && u ) await item.update(u);
      const eff = effectUpdates(item.effects, where);
      if ( apply && eff.length ) await item.updateEmbeddedDocuments("ActiveEffect", eff);
    });
  }

  /**
   * An actor's own effects and its items. `only` restricts an unlinked token to
   * the copies stored in its own delta (the rest comes from the world actor).
   */
  async function processActor(actor, where, only = null) {
    await guarded(where, async () => {
      const effects = only ? actor.effects.filter(e => only.effects.has(e.id)) : actor.effects;
      const own = effectUpdates(effects, where);
      if ( apply && own.length ) await actor.updateEmbeddedDocuments("ActiveEffect", own);

      const toDelete = [];
      const itemUpdates = [];
      for ( const item of actor.items ) {
        if ( only && !only.items.has(item.id) ) continue;
        const w = `${where} › ${item.name}`;
        if ( (item.type === "skill") && isMobility(item.name) ) {
          toDelete.push(item.id);
          deleted.push(w);
          continue;
        }
        const u = itemUpdate(item, w);
        if ( u ) itemUpdates.push({ _id: item.id, ...u });
        const eff = effectUpdates(item.effects, w);
        if ( apply && eff.length ) await item.updateEmbeddedDocuments("ActiveEffect", eff);
      }
      if ( apply && itemUpdates.length ) await actor.updateEmbeddedDocuments("Item", itemUpdates);
      if ( apply && toDelete.length ) await actor.deleteEmbeddedDocuments("Item", toDelete);
    });
  }

  /* -------------------------------------------- */
  /*  Run                                          */
  /* -------------------------------------------- */

  for ( const pack of packs ) {
    if ( !["Item", "Actor", "ActiveEffect"].includes(pack.documentName) ) continue;
    const label = `[${pack.metadata.label}]`;
    const wasLocked = pack.locked;
    try {
      const docs = await pack.getDocuments();
      if ( apply && wasLocked ) await pack.configure({ locked: false });
      if ( pack.documentName === "ActiveEffect" ) {
        const updates = effectUpdates(docs, label);
        if ( apply && updates.length ) {
          await CONFIG.ActiveEffect.documentClass.updateDocuments(updates, { pack: pack.collection });
        }
      }
      else {
        for ( const doc of docs ) {
          const where = `${label} ${doc.name}`;
          if ( pack.documentName === "Actor" ) await processActor(doc, where);
          else await processItem(doc, where);
        }
      }
    }
    catch ( err ) {
      console.error(`Scarmark | Remove MOBILITY failed in ${pack.collection}`, err);
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
      const src = token.delta._source ?? {};
      const only = {
        items: new Set((src.items ?? []).map(i => i._id)),
        effects: new Set((src.effects ?? []).map(e => e._id))
      };
      if ( !only.items.size && !only.effects.size ) continue;
      await processActor(token.actor, `Scene ${scene.name} › token ${token.name}`, only);
    }
  }

  /* -------------------------------------------- */
  /*  Report                                       */
  /* -------------------------------------------- */

  const table = (label, list) => { if ( list.length ) console.table(list.map(where => ({ [label]: where }))); };
  console.log(`Scarmark | Remove MOBILITY (${apply ? "APPLY" : "REPORT"})`);
  table("MOBILITY deleted", deleted);
  table("renamed to Acrobatics", renamed);
  table("text fixed", texts);
  table("effect key rewritten", keys);
  table("effect still targets MOBILITY", leftover);
  if ( errors.length ) console.table(errors);

  const verb = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Remove MOBILITY — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">MOBILITY skills deleted${verb}: <b>${deleted.length}</b></div>`;
  content += `<div class="card-line">Renamed to ${NEW_ACRO}${verb}: <b>${renamed.length}</b></div>`;
  content += `<div class="card-line">Descriptions fixed${verb}: <b>${texts.length}</b></div>`;
  content += `<div class="card-line">Effect keys → ${NEW_ACRO}${verb}: <b>${keys.length}</b></div>`;
  if ( leftover.length ) {
    content += `<hr class="card-sep"><div class="card-line"><b>Effects still targeting MOBILITY (not changed, decide by hand):</b></div>`;
    for ( const w of leftover.slice(0, 15) ) content += `<div class="card-line">${esc(w)}</div>`;
  }
  if ( errors.length ) {
    content += `<hr class="card-sep"><div class="card-line broken"><b>${errors.length} error(s)</b> — see F12; run again after fixing.</div>`;
    for ( const e of errors.slice(0, 10) ) content += `<div class="card-line">${esc(e.where)}: ${esc(e.error)}</div>`;
  }
  content += `<div class="card-line"><i>Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
