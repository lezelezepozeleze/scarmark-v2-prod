/**
 * Scarmark — New Arcane skills (one-shot maintenance macro, 1.0.60)
 * -----------------------------------------------------------------
 * D. 2026-11-21 (New Attributes and Skills.xlsx): the new magic needs only two skills,
 * Arcane Combat (battle spells, a Combat skill, unchanged) and Arcane (all other magic,
 * an Esoterics skill of the kind Arcane). Runecraft goes, and Handicraft (crafts, DEX DEX
 * WIL; Alchemy stays separate) is added.
 *
 * In this system's compendia and the world's own compendia (locked packs are unlocked and
 * re-locked), world items, world actors (including the NPC templates in Actor compendia)
 * and the own data of unlinked tokens on every scene:
 *
 *   1. RENAMES the skill "Arcane Magic" to "Arcane" (description updated).
 *   2. MERGES the school skills (Creation, Elemental, Fey, Blood, Entropic, Illusion Magic)
 *      into Arcane. Compendium and item copies are deleted. An actor keeps the HIGHEST level
 *      (SL) of all of them: it ends with ONE Arcane skill (a school skill is renamed to Arcane
 *      when the actor has no Arcane Magic).
 *   3. DELETES Runecraft and Arcane Lore (an actor's SL is lost; actors that had SL above 0
 *      are listed in the report).
 *   4. SETS the Magic Type of every spell to "Arcane" (the school stays visible in the folder
 *      the spell sits in, in the Arcane compendium). Casting already uses the actor's only
 *      Arcane skill, so no code changed.
 *   5. RENAMES Active Effect keys system.mods.skill.<school or Arcane Magic> to
 *      system.mods.skill.Arcane, and REPORTS keys that still point at Runecraft or Arcane Lore.
 *   6. CREATES Handicraft (Skill, DEX DEX WIL) in the Skills compendium of the system when it
 *      is missing. An actor does not get it automatically (it is teachable).
 *
 * NOT touched: Arcane Combat, the religions, psionics, the spells' levels and notes.
 *
 * HOW TO USE (GM, LOCAL world first, Scarmark 1.0.60-beta or later):
 *   1. Back up the world and commit the system packs.
 *   2. New Script macro -> paste this file -> Execute -> "Report only".
 *   3. Read the chat summary (details in the F12 console) -> run again -> "Apply".
 *   4. Reload the world (F5). Check a caster, a spell and the Skills compendium.
 * Safe to repeat: a second run finds nothing to do.
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("New Arcane skills: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("New Arcane skills: run this as the GM.");

  const ARCANE = "Arcane";
  const OLD_ARCANE = "Arcane Magic";
  const SCHOOLS = ["Creation Magic", "Elemental Magic", "Fey Magic", "Blood Magic", "Entropic Magic", "Illusion Magic"];
  const DELETE = ["Runecraft", "Arcane Lore"];
  const ARCANE_DESCRIPTION = "<p>The skill of wielding magic: the ability to cast spells. It governs how reliably a mage turns will and gathered spirit into a finished magical effect. Battle spells use Arcane Combat.</p>";
  const SKILL_PREFIX = "system.mods.skill.";
  const HANDICRAFT = {
    name: "Handicraft",
    type: "skill",
    img: "systems/scarmark/icons/skills/anvil-impact-lorc.svg",
    system: {
      category: "skill", attribute1: "dex", attribute2: "dex", attribute3: "wil", sunsignBonuses: [], level: 0, faithPoints: 0, notes: "",
      description: "<p>Everyday crafts and fine handiwork: smithing, carpentry, leatherwork, weaving, repairs and the making of tools. Alchemy is a skill of its own.</p>"
    }
  };

  const norm = (s) => String(s ?? "").toLowerCase().replace(/[‐-―−]/g, "-").replace(/\s+/g, " ").trim();
  const schoolSet = new Set(SCHOOLS.map(norm));
  const deleteSet = new Set(DELETE.map(norm));
  const arcaneSources = new Set([norm(OLD_ARCANE), ...schoolSet]);
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");
  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "New Arcane skills" },
    content: `<p>Renames <b>Arcane Magic</b> to <b>Arcane</b>, merges the six school skills into it (highest SL kept),
      deletes <b>Runecraft</b> and <b>Arcane Lore</b>, sets every spell's Magic Type to Arcane and adds
      <b>Handicraft</b> to the Skills compendium.</p>
      <p>System and world compendia, world items and actors, unlinked tokens. <b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const count = { renamed: 0, merged: 0, schoolsDeleted: 0, deleted: 0, spells: 0, keys: 0, created: 0 };
  const rows = [];
  const flagged = [];
  const errors = [];
  const note = (where, what, detail = "") => rows.push({ where, what, detail });

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | New Arcane skills failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  /* -------------------------------------------- */
  /*  Effects                                      */
  /* -------------------------------------------- */

  const changesPath = (src) => (Array.isArray(src.system?.changes) ? "system.changes" : "changes");

  function keyUpdates(effects, where) {
    const updates = [];
    for ( const effect of effects ) {
      const src = effect._source ?? {};
      const path = changesPath(src);
      const changes = foundry.utils.getProperty(src, path) ?? [];
      let renamed = 0;
      const next = changes.map(c => {
        const key = c?.key ?? "";
        if ( !key.startsWith(SKILL_PREFIX) ) return c;
        const name = key.slice(SKILL_PREFIX.length);
        if ( arcaneSources.has(norm(name)) ) { renamed++; return { ...c, key: SKILL_PREFIX + ARCANE }; }
        if ( deleteSet.has(norm(name)) ) flagged.push({ where: `${where} › ${effect.name}`, why: `still targets deleted skill "${name}"` });
        return c;
      });
      if ( renamed ) {
        count.keys += renamed;
        updates.push({ _id: effect.id, [path]: next });
        note(`${where} › ${effect.name}`, "effect key renamed", `→ ${ARCANE}`);
      }
    }
    return updates;
  }

  /* -------------------------------------------- */
  /*  Items (compendia and world items)            */
  /* -------------------------------------------- */

  /** A loose item (not on an actor): decide what happens to it. */
  function planItem(item, where) {
    const plan = { deleteItem: false, update: null, keyUpdates: [] };
    const name = norm(item.name);
    if ( item.type === "skill" ) {
      if ( deleteSet.has(name) ) { plan.deleteItem = true; count.deleted++; note(where, "skill deleted"); return plan; }
      if ( schoolSet.has(name) ) { plan.deleteItem = true; count.schoolsDeleted++; note(where, "school skill deleted (merged into Arcane)"); return plan; }
      if ( name === norm(OLD_ARCANE) ) {
        plan.update = { name: ARCANE, "system.description": ARCANE_DESCRIPTION };
        count.renamed++;
        note(where, "skill renamed", `${item.name} → ${ARCANE}`);
      }
    }
    else if ( (item.type === "spell") && (item.system?.magicType !== ARCANE) ) {
      plan.update = { "system.magicType": ARCANE };
      count.spells++;
      note(where, "spell Magic Type", `${item.system?.magicType || "(empty)"} → ${ARCANE}`);
    }
    if ( item.effects?.size ) plan.keyUpdates = keyUpdates(item.effects, where);
    return plan;
  }

  async function processItem(item, where) {
    await guarded(where, async () => {
      const plan = planItem(item, where);
      if ( !apply ) return;
      if ( plan.deleteItem ) { await item.delete(); return; }
      if ( plan.update ) await item.update(plan.update, { diff: false });
      if ( plan.keyUpdates.length ) await item.updateEmbeddedDocuments("ActiveEffect", plan.keyUpdates);
    });
  }

  /* -------------------------------------------- */
  /*  Actors                                       */
  /* -------------------------------------------- */

  /** `only` = ids of the delta items and effects of an unlinked token (its own data), or null for a whole actor. */
  async function processActor(actor, where, only = null) {
    await guarded(where, async () => {
      const effects = only ? actor.effects.filter(e => only.effects.has(e.id)) : actor.effects;
      const own = keyUpdates(effects, where);
      if ( apply && own.length ) await actor.updateEmbeddedDocuments("ActiveEffect", own);

      const itemUpdates = [];
      const deleteIds = [];
      const keyPlans = [];
      const scope = (i) => !only || only.items.has(i.id);

      // Arcane: one skill with the highest SL of Arcane, Arcane Magic and the schools.
      const sources = actor.items.filter(i => (i.type === "skill") && scope(i) && (norm(i.name) === norm(ARCANE) || arcaneSources.has(norm(i.name))));
      if ( sources.length ) {
        const keep = sources.find(i => norm(i.name) === norm(ARCANE)) ?? sources.find(i => norm(i.name) === norm(OLD_ARCANE)) ?? sources[0];
        const level = Math.max(...sources.map(i => i.system.level ?? 0));
        const update = { _id: keep.id };
        if ( keep.name !== ARCANE ) { update.name = ARCANE; count.renamed++; note(`${where} › ${keep.name}`, "skill renamed", `→ ${ARCANE}`); }
        if ( level !== (keep.system.level ?? 0) ) {
          update["system.level"] = level;
          note(`${where} › ${keep.name}`, "Arcane SL raised by merge", `${keep.system.level ?? 0} → ${level}`);
          flagged.push({ where: `${where} › ${keep.name}`, why: `merged ${sources.length} magic skills: Arcane SL is now ${level} (the highest), check it` });
        }
        if ( Object.keys(update).length > 1 ) itemUpdates.push(update);
        for ( const s of sources ) if ( s.id !== keep.id ) {
          deleteIds.push(s.id);
          count.merged++;
          note(`${where} › ${s.name}`, "merged into Arcane", `SL ${s.system.level ?? 0}`);
        }
      }

      for ( const item of actor.items ) {
        if ( !scope(item) ) continue;
        const w = `${where} › ${item.name}`;
        if ( (item.type === "skill") && deleteSet.has(norm(item.name)) ) {
          deleteIds.push(item.id);
          count.deleted++;
          note(w, "skill deleted", `SL ${item.system.level ?? 0}`);
          if ( (item.system.level ?? 0) > 0 ) flagged.push({ where: w, why: `${item.name} SL ${item.system.level} is lost` });
        }
        else if ( (item.type === "spell") && (item.system?.magicType !== ARCANE) ) {
          itemUpdates.push({ _id: item.id, "system.magicType": ARCANE });
          count.spells++;
        }
        if ( item.effects?.size ) {
          const ku = keyUpdates(item.effects, w);
          if ( ku.length ) keyPlans.push([item, ku]);
        }
      }
      if ( !apply ) return;
      if ( itemUpdates.length ) await actor.updateEmbeddedDocuments("Item", itemUpdates, { diff: false });
      for ( const [item, ku] of keyPlans ) await item.updateEmbeddedDocuments("ActiveEffect", ku);
      if ( deleteIds.length ) await actor.deleteEmbeddedDocuments("Item", deleteIds);
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

  /* -------------------------------------------- */
  /*  Run                                          */
  /* -------------------------------------------- */

  ui.notifications.info(`New Arcane skills: ${apply ? "working" : "checking"}, please wait...`);

  // Handicraft in the Skills compendium of the system.
  await guarded("Handicraft", async () => {
    const pack = game.packs.get(`${SYS}.skills`);
    if ( !pack ) throw new Error("Skills compendium not found");
    const index = await pack.getIndex();
    if ( index.some(e => norm(e.name) === norm(HANDICRAFT.name)) ) return;
    count.created++;
    note("[Skills]", "skill created", "Handicraft (DEX DEX WIL)");
    if ( !apply ) return;
    const wasLocked = pack.locked;
    try {
      if ( wasLocked ) await pack.configure({ locked: false });
      const folder = pack.folders.find(f => norm(f.name) === "craft skills");
      await Item.create({ ...HANDICRAFT, folder: folder?.id ?? null }, { pack: pack.collection });
    }
    finally {
      if ( wasLocked && (pack.locked === false) ) await pack.configure({ locked: true });
    }
  });

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
      console.error(`Scarmark | New Arcane skills failed in ${pack.collection}`, err);
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

  /* -------------------------------------------- */
  /*  Report                                       */
  /* -------------------------------------------- */

  console.log(`Scarmark | New Arcane skills (${apply ? "APPLY" : "REPORT"})`, count);
  if ( rows.length ) console.table(rows);
  if ( flagged.length ) console.table(flagged);
  if ( errors.length ) console.table(errors);

  const v = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">New Arcane skills — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Arcane Magic renamed to Arcane${v}: <b>${count.renamed}</b>; school skills deleted: <b>${count.schoolsDeleted}</b>; merged on actors: <b>${count.merged}</b></div>`;
  content += `<div class="card-line">Runecraft / Arcane Lore deleted${v}: <b>${count.deleted}</b>; spells set to Arcane: <b>${count.spells}</b>; effect keys renamed: <b>${count.keys}</b>; Handicraft created: <b>${count.created}</b></div>`;
  if ( flagged.length ) {
    content += `<hr class="card-sep"><div class="card-line"><b>Check by hand (${flagged.length}):</b></div>`;
    for ( const l of flagged.slice(0, 12) ) content += `<div class="card-line">${esc(l.where)}: ${esc(l.why)}</div>`;
  }
  if ( errors.length ) {
    content += `<hr class="card-sep"><div class="card-line broken"><b>${errors.length} error(s)</b> — see F12; fix and run again.</div>`;
    for ( const e of errors.slice(0, 10) ) content += `<div class="card-line">${esc(e.where)}: ${esc(e.error)}</div>`;
  }
  content += `<div class="card-line"><i>${apply ? "Reload the world (F5). " : ""}Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
