/**
 * Scarmark — Rename Entropic & Base (one-shot maintenance macro, 1.0.38)
 * ------------------------------------------------------------------------------
 * D. 2026-09-29: "Enthropic Magic" is spelled "Entropic Magic", and the Skill Base
 * (SB) is simply called "Base". Scarmark 1.0.38 already shows the new labels; this
 * macro makes the data match.
 *
 * What it does, in this system's compendia and the world's own compendia (locked
 * packs are unlocked and re-locked), world items, world actors and the own data of
 * unlinked tokens on every scene:
 *   1. The skill "Enthropic Magic" becomes "Entropic Magic" (skill items), every
 *      spell that draws on it (the Magic Type field) follows, and so does every
 *      Active Effect change on system.mods.skill.Enthropic Magic (Dark Elf and Red
 *      Elf traits and any effect you made yourself).
 *   2. Folders named "Enthropic Magic" (the Arcane compendium has one) are renamed.
 *      If Foundry refuses to rename a compendium folder, the macro tells you and you
 *      rename that one folder by hand.
 *   3. Texts (item descriptions, notes, psionic Misfire, effect descriptions):
 *      Enthropic -> Entropic, "Skill Base" and "SB" -> "Base" ("+1 SB to Dodge" ->
 *      "+1 Base to Dodge").
 *   4. Macro code: the old-game tag in the Stun Test comment ("(<tag>: multiples of 5
 *      are critical ...") is removed (system macro compendium and world macros).
 *
 * Safe to repeat: it only acts on names and texts still in the old wording.
 *
 * HOW TO USE (GM, LOCAL world first, Scarmark 1.0.38-beta or later):
 *   1. Back up the world and commit the system packs.
 *   2. New Script macro -> paste this file -> Execute -> "Report only".
 *   3. Read the chat summary (details in the F12 console) -> run again -> "Apply".
 *   4. Reload the world (F5). Check a Dark Elf, a spell of the Entropic school and
 *      the Arcane compendium folder; commit the packs; upload the world to Molten.
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("Rename Entropic & Base: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Rename Entropic & Base: run this as the GM.");

  const SKILL_PREFIX = "system.mods.skill.";
  const RENAMES = { "enthropic magic": "Entropic Magic" };
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");
  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));

  /* -------------------------------------------- */
  /*  Pure converters                              */
  /* -------------------------------------------- */

  /** New name for a skill, a Magic Type or the tail of a skill effect key; the same string when nothing changes. */
  function newName(name) {
    const raw = String(name ?? "");
    const key = raw.trim().toLowerCase();
    return Object.hasOwn(RENAMES, key) ? RENAMES[key] : raw;
  }

  const TEXT_FIXES = [
    [/\bEnthropic\b/g, "Entropic"],
    [/\benthropic\b/g, "entropic"],
    [/\bSkill Base\b/g, "Base"],
    [/\bSB\b/g, "Base"]
  ];
  const fixText = (text) => TEXT_FIXES.reduce((t, [re, to]) => t.replace(re, to), text);
  const fixFolderName = (name) => String(name ?? "").replace(/\bEnthropic\b/g, "Entropic").replace(/\benthropic\b/g, "entropic");
  // The tag that named the old game in the Stun Test comment: "(<tag>: multiples of 5 ...".
  const OLD_TAG = new RegExp("\\(" + String.fromCharCode(72, 77, 51) + ": ", "g");
  const fixMacroCode = (code) => String(code ?? "").replace(OLD_TAG, "(");

  /* -------------------------------------------- */
  /*  Setup                                        */
  /* -------------------------------------------- */

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Rename Entropic & Base" },
    content: `<p>Enthropic Magic → Entropic Magic (skill, spells, effect keys, texts, folder); "Skill Base" and SB → Base in texts;
      the old-game tag leaves the Stun Test macro.</p>
      <p>System and world compendia, world items and actors, unlinked tokens. <b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const count = { skills: 0, spells: 0, keys: 0, effects: 0, texts: 0, folders: 0, macros: 0 };
  const rows = [];
  const listed = [];
  const errors = [];
  const note = (where, what, detail = "") => rows.push({ where, what, detail });
  const flagIt = (where, why) => listed.push({ where, why });

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Rename Entropic & Base failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  const changesPath = (src) => (Array.isArray(src.system?.changes) ? "system.changes" : "changes");

  /* -------------------------------------------- */
  /*  Document processors                          */
  /* -------------------------------------------- */

  function effectUpdates(effects, where) {
    const updates = [];
    for ( const effect of effects ) {
      const src = effect._source ?? {};
      const path = changesPath(src);
      const changes = foundry.utils.getProperty(src, path) ?? [];
      const w = `${where} › ${effect.name}`;
      const u = {};
      const renamed = [];
      const next = changes.map(c => {
        const key = c?.key ?? "";
        if ( !key.startsWith(SKILL_PREFIX) ) return c;
        const from = key.slice(SKILL_PREFIX.length);
        const to = newName(from);
        if ( to === from ) return c;
        renamed.push(`${from} → ${to}`);
        return { ...c, key: SKILL_PREFIX + to };
      });
      if ( renamed.length ) {
        u[path] = next;
        count.keys += renamed.length;
        note(w, "skill key renamed", renamed.join(", "));
      }
      if ( typeof src.description === "string" && src.description ) {
        const d = fixText(src.description);
        if ( d !== src.description ) u.description = d;
      }
      if ( Object.keys(u).length ) { updates.push({ _id: effect.id, ...u }); count.effects++; }
    }
    return updates;
  }

  function planItem(item, where) {
    const src = item._source ?? {};
    const u = {};
    if ( item.type === "skill" ) {
      const to = newName(item.name);
      if ( to !== item.name ) { u.name = to; count.skills++; note(where, "skill renamed", `${item.name} → ${to}`); }
    }
    if ( item.type === "spell" ) {
      const from = src.system?.magicType;
      const to = newName(from);
      if ( to !== from ) { u["system.magicType"] = to; count.spells++; note(where, "spell school", `${from} → ${to}`); }
    }
    for ( const path of ["system.description", "system.notes", "system.misfire"] ) {
      const text = foundry.utils.getProperty(src, path);
      if ( typeof text !== "string" || !text ) continue;
      const next = fixText(text);
      if ( next !== text ) { u[path] = next; count.texts++; note(where, "text", path.split(".")[1]); }
    }
    return { update: Object.keys(u).length ? u : null, effectUpdates: effectUpdates(item.effects, where) };
  }

  async function applyItemPlan(item, plan) {
    if ( plan.update ) await item.update(plan.update, { diff: false });
    if ( plan.effectUpdates.length ) await item.updateEmbeddedDocuments("ActiveEffect", plan.effectUpdates);
  }

  async function processItem(item, where) {
    await guarded(where, async () => {
      const plan = planItem(item, where);
      if ( apply ) await applyItemPlan(item, plan);
    });
  }

  async function processActor(actor, where, only = null) {
    await guarded(where, async () => {
      const effects = only ? actor.effects.filter(e => only.effects.has(e.id)) : actor.effects;
      const own = effectUpdates(effects, where);
      if ( apply && own.length ) await actor.updateEmbeddedDocuments("ActiveEffect", own);

      const itemUpdates = [], perItem = [];
      for ( const item of actor.items ) {
        if ( only && !only.items.has(item.id) ) continue;
        const plan = planItem(item, `${where} › ${item.name}`);
        if ( plan.update ) itemUpdates.push({ _id: item.id, ...plan.update });
        if ( plan.effectUpdates.length ) perItem.push([item, { update: null, effectUpdates: plan.effectUpdates }]);
      }
      if ( !apply ) return;
      if ( itemUpdates.length ) await actor.updateEmbeddedDocuments("Item", itemUpdates, { diff: false });
      for ( const [item, plan] of perItem ) await applyItemPlan(item, plan);
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

  async function processMacro(macro, where) {
    await guarded(where, async () => {
      const next = fixMacroCode(macro.command);
      if ( next === macro.command ) return;
      count.macros++;
      note(where, "macro remark", "old-game tag removed");
      if ( apply ) await macro.update({ command: next });
    });
  }

  /** Folders (of a compendium or of the world) whose name still says Enthropic. */
  async function processFolders(folders, where, updateFn) {
    const updates = [];
    for ( const f of folders ) {
      const to = fixFolderName(f.name);
      if ( to === f.name ) continue;
      updates.push({ _id: f.id, name: to });
      count.folders++;
      note(`${where} folder`, "folder renamed", `${f.name} → ${to}`);
    }
    if ( !updates.length || !apply ) return;
    try { await updateFn(updates); }
    catch ( err ) {
      console.error(`Scarmark | Rename Entropic & Base: folder rename failed in ${where}`, err);
      flagIt(where, `folder rename failed (${err?.message ?? err}); rename "${updates.map(u => u.name).join('", "')}" by hand`);
    }
  }

  /* -------------------------------------------- */
  /*  Run                                          */
  /* -------------------------------------------- */

  ui.notifications.info(`Rename Entropic & Base: ${apply ? "renaming" : "checking"}, please wait...`);

  for ( const pack of packs ) {
    if ( !["Item", "Actor", "ActiveEffect", "Macro"].includes(pack.documentName) ) continue;
    const label = `[${pack.metadata.label}]`;
    const wasLocked = pack.locked;
    try {
      const docs = await pack.getDocuments();
      if ( apply && wasLocked ) await pack.configure({ locked: false });
      if ( pack.documentName === "ActiveEffect" ) {
        const updates = effectUpdates(docs, label);
        if ( apply && updates.length ) await CONFIG.ActiveEffect.documentClass.updateDocuments(updates, { pack: pack.collection });
      }
      else if ( pack.documentName === "Macro" ) {
        for ( const m of docs ) await processMacro(m, `${label} ${m.name}`);
      }
      else {
        for ( const doc of docs ) {
          const where = `${label} ${doc.name}`;
          if ( pack.documentName === "Actor" ) await processActor(doc, where);
          else await processItem(doc, where);
        }
      }
      await processFolders([...(pack.folders ?? [])], label,
        (updates) => CONFIG.Folder.documentClass.updateDocuments(updates, { pack: pack.collection }));
    }
    catch ( err ) {
      console.error(`Scarmark | Rename Entropic & Base failed in ${pack.collection}`, err);
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
  for ( const m of game.macros ) await processMacro(m, `World macro ${m.name}`);
  await processFolders([...game.folders], "World",
    (updates) => CONFIG.Folder.documentClass.updateDocuments(updates));

  /* -------------------------------------------- */
  /*  Report                                       */
  /* -------------------------------------------- */

  console.log(`Scarmark | Rename Entropic & Base (${apply ? "APPLY" : "REPORT"})`, count);
  if ( rows.length ) console.table(rows);
  if ( listed.length ) console.table(listed);
  if ( errors.length ) console.table(errors);

  const v = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Rename Entropic &amp; Base — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Skills renamed${v}: <b>${count.skills}</b>, spells moved to the new school name: <b>${count.spells}</b></div>`;
  content += `<div class="card-line">Effect skill keys renamed${v}: <b>${count.keys}</b> in <b>${count.effects}</b> effects</div>`;
  content += `<div class="card-line">Texts changed${v}: <b>${count.texts}</b>, folders renamed: <b>${count.folders}</b>, macros: <b>${count.macros}</b></div>`;
  if ( listed.length ) {
    content += `<hr class="card-sep"><div class="card-line"><b>Check by hand (${listed.length}):</b></div>`;
    for ( const l of listed.slice(0, 12) ) content += `<div class="card-line">${esc(l.where)}: ${esc(l.why)}</div>`;
  }
  if ( errors.length ) {
    content += `<hr class="card-sep"><div class="card-line broken"><b>${errors.length} error(s)</b> — see F12; fix and run again.</div>`;
    for ( const e of errors.slice(0, 10) ) content += `<div class="card-line">${esc(e.where)}: ${esc(e.error)}</div>`;
  }
  content += `<div class="card-line"><i>${apply ? "Reload the world (F5). " : ""}Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
