/**
 * Scarmark — Migrate skill categories (one-shot maintenance macro, 1.0.51)
 * ------------------------------------------------------------------------
 * D. 2026-11-20: skills have three categories instead of six:
 *   Physical, Communication, Craft  ->  Skill
 *   Combat                          ->  Combat
 *   Religion, Magic                 ->  Esoterics (kind "religion" / "arcane")
 *
 * Scarmark 1.0.51 already reads the old values correctly when a skill is loaded
 * (the old category is converted in memory), so nothing breaks if you never run this.
 * The macro writes the converted values into the database, so that compendia, world
 * items, actors and unlinked tokens store the new category, and it renames the
 * Active Effect keys that target a whole category:
 *   system.mods.skills.physical / communication / craft  ->  system.mods.skills.skill
 *   system.mods.skills.religion / magic                  ->  system.mods.skills.esoterics
 * Keys of single skills (system.mods.skill.<Name>) are not touched.
 * An effect that lists several old keys which land on the same new key (Hangover III,
 * Black Death and Sepsis list physical, communication and craft) keeps ONE change of
 * that mode, the one with the largest absolute value, so it no longer counts three times.
 *
 * Scope: this system's compendia and the world's own compendia (locked packs are
 * unlocked and re-locked), world items, world actors and the own data of unlinked
 * tokens on every scene.
 *
 * HOW TO USE (GM, Scarmark 1.0.51-beta or later): back up the world and commit the
 * system packs, new Script macro -> paste this file -> Execute -> "Report only" ->
 * read the chat summary (details in F12) -> run again -> "Apply" -> reload (F5).
 * Safe to repeat. "Report only" counts every skill item it would rewrite and every
 * effect key it would rename; it cannot tell which skills are already converted.
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("Migrate skill categories: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Migrate skill categories: run this as the GM.");

  const KEY_MAP = {
    "system.mods.skills.physical": "system.mods.skills.skill",
    "system.mods.skills.communication": "system.mods.skills.skill",
    "system.mods.skills.craft": "system.mods.skills.skill",
    "system.mods.skills.religion": "system.mods.skills.esoterics",
    "system.mods.skills.magic": "system.mods.skills.esoterics"
  };
  const NEW_KEYS = new Set(Object.values(KEY_MAP));
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");
  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Migrate skill categories" },
    content: `<p>Skill categories become <b>Skill / Combat / Esoterics</b> (Religion and Magic keep their kind).
      Effect keys that target a whole category are renamed.</p>
      <p>System and world compendia, world items and actors, unlinked tokens. <b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const count = { skills: 0, keys: 0, effects: 0, merged: 0 };
  const errors = [];

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Migrate skill categories failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  const changesPath = (src) => (Array.isArray(src.system?.changes) ? "system.changes" : "changes");

  function effectUpdates(effects) {
    const updates = [];
    for ( const effect of effects ) {
      const src = effect._source ?? {};
      const path = changesPath(src);
      const changes = foundry.utils.getProperty(src, path) ?? [];
      let renamed = 0;
      const mapped = changes.map(c => {
        const to = KEY_MAP[c?.key];
        if ( !to ) return c;
        renamed++;
        return { ...c, key: to };
      });
      if ( !renamed ) continue;
      // Merge duplicates created by the rename: same new key and mode -> one change, largest |value|.
      const next = [];
      const at = new Map();
      for ( const c of mapped ) {
        if ( !NEW_KEYS.has(c?.key) ) { next.push(c); continue; }
        const id = `${c.key}|${c.mode ?? c.type}`;
        if ( !at.has(id) ) { at.set(id, next.length); next.push(c); continue; }
        count.merged++;
        const i = at.get(id);
        if ( Math.abs(Number(c.value)) > Math.abs(Number(next[i].value)) ) next[i] = { ...next[i], value: c.value };
      }
      count.keys += renamed;
      count.effects++;
      updates.push({ _id: effect.id, [path]: next });
    }
    return updates;
  }

  /** The converted category and kind, as Scarmark 1.0.51 loaded them into _source. */
  function skillUpdate(item) {
    if ( item.type !== "skill" ) return null;
    count.skills++;
    return { "system.category": item._source.system.category, "system.esotericKind": item._source.system.esotericKind ?? "" };
  }

  async function processItem(item, where) {
    await guarded(where, async () => {
      const u = skillUpdate(item);
      const fx = effectUpdates(item.effects);
      if ( !apply ) return;
      if ( u ) await item.update(u, { diff: false });
      if ( fx.length ) await item.updateEmbeddedDocuments("ActiveEffect", fx);
    });
  }

  async function processActor(actor, where, only = null) {
    await guarded(where, async () => {
      const effects = only ? actor.effects.filter(e => only.effects.has(e.id)) : actor.effects;
      const own = effectUpdates(effects);
      if ( apply && own.length ) await actor.updateEmbeddedDocuments("ActiveEffect", own);
      for ( const item of actor.items ) {
        if ( only && !only.items.has(item.id) ) continue;
        await processItem(item, `${where} › ${item.name}`);
      }
    });
  }

  async function processToken(scene, token) {
    const where = `Scene ${scene.name} › token ${token.name}`;
    const d = token.delta?._source ?? {};
    const only = {
      items: new Set((d.items ?? []).map(i => i._id)),
      effects: new Set((d.effects ?? []).map(e => e._id))
    };
    if ( only.items.size || only.effects.size ) await processActor(token.actor, where, only);
  }

  ui.notifications.info(`Migrate skill categories: ${apply ? "migrating" : "checking"}, please wait...`);

  for ( const pack of packs ) {
    if ( !["Item", "Actor", "ActiveEffect"].includes(pack.documentName) ) continue;
    const label = `[${pack.metadata.label}]`;
    const wasLocked = pack.locked;
    try {
      const docs = await pack.getDocuments();
      if ( apply && wasLocked ) await pack.configure({ locked: false });
      if ( pack.documentName === "ActiveEffect" ) {
        const updates = effectUpdates(docs);
        if ( apply && updates.length ) await CONFIG.ActiveEffect.documentClass.updateDocuments(updates, { pack: pack.collection });
      }
      else {
        for ( const doc of docs ) {
          if ( pack.documentName === "Actor" ) await processActor(doc, `${label} ${doc.name}`);
          else await processItem(doc, `${label} ${doc.name}`);
        }
      }
    }
    catch ( err ) {
      console.error(`Scarmark | Migrate skill categories failed in ${pack.collection}`, err);
      errors.push({ where: label, error: err?.message ?? String(err) });
    }
    finally {
      if ( apply && wasLocked && (pack.locked === false) ) await pack.configure({ locked: true });
    }
  }

  for ( const item of [...game.items] ) await processItem(item, `World item ${item.name}`);
  for ( const actor of game.actors ) await processActor(actor, `World actor ${actor.name}`);
  for ( const scene of game.scenes ) {
    for ( const token of scene.tokens ) {
      if ( token.actorLink || !token.actor || !token.delta ) continue;
      await processToken(scene, token);
    }
  }

  console.log(`Scarmark | Migrate skill categories (${apply ? "APPLY" : "REPORT"})`, count);
  if ( errors.length ) console.table(errors);

  const v = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Migrate skill categories — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Skill items rewritten${v}: <b>${count.skills}</b></div>`;
  content += `<div class="card-line">Category effect keys renamed${v}: <b>${count.keys}</b> in <b>${count.effects}</b> effects, duplicate changes merged: <b>${count.merged}</b></div>`;
  if ( errors.length ) {
    content += `<hr class="card-sep"><div class="card-line broken"><b>${errors.length} error(s)</b> — see F12; fix and run again.</div>`;
    for ( const e of errors.slice(0, 10) ) content += `<div class="card-line">${esc(e.where)}: ${esc(e.error)}</div>`;
  }
  content += `<div class="card-line"><i>${apply ? "Reload the world (F5). " : ""}Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
