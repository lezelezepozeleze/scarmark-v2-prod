/**
 * Scarmark — Reduce skills (one-shot maintenance macro, 1.0.52)
 * -------------------------------------------------------------
 * D. 2026-11-20: most skills become an attribute roll with a multiplier, so they are
 * removed. Racial bonuses and potions will be redone from scratch, so their Active
 * Effects are removed too.
 *
 * What it does, in this system's compendia and the world's own compendia (locked
 * packs are unlocked and re-locked), world items, world actors (including the NPC
 * templates in Actor compendia) and the own data of unlinked tokens on every scene:
 *
 *   1. DELETES these skills: see DELETE below (30 skills: Acrobatics, Dancing,
 *      Swimming, Acting, Charm, Intrigue, Rhetoric, Singing, Musician, Mental
 *      Conflict, Courtwise, Streetwise, Villagewise, Divination, Folklore, Lore, Law,
 *      Literacy, Mathematics, Engineering, Astrology, Drawing, Handicraft, Sailing,
 *      Survival, Tracking, Bargaming, Herblore, Cat Senses, Elven Empathy).
 *      Their level (SL) on an actor is lost.
 *   2. MERGES Herblore into Alchemy: an actor that has both keeps the higher level in
 *      Alchemy; one that has only Herblore gets it renamed to Alchemy (check its
 *      attributes afterwards; it is listed in the report).
 *   3. RENAMES Sleight of Hand to Pickpocketing (skill items and effect keys
 *      system.mods.skill.Sleight of Hand).
 *   4. DELETES ALL Active Effects of the Alchemy compendium items (potions and the
 *      rest) and of the Racial Traits compendium items, and of every copy of those
 *      items (same name) on world items and actors. The items themselves, with their
 *      descriptions, stay so they can be rebuilt.
 *   5. REPORTS (changes nothing) any other effect that still targets a deleted skill
 *      by name.
 *
 * NOT touched (the magic rework is planned): the magic schools, Arcane Lore, Runecraft,
 * Arcane Combat, the religions, the spells and the Arcane compendium.
 *
 * HOW TO USE (GM, LOCAL world first, Scarmark 1.0.52-beta or later):
 *   1. Back up the world and commit the system packs.
 *   2. New Script macro -> paste this file -> Execute -> "Report only".
 *   3. Read the chat summary (details in the F12 console) -> run again -> "Apply".
 *   4. Reload the world (F5). Check a character, an NPC template and a potion.
 * Safe to repeat: a second run finds nothing to do. Edit DELETE / EFFECT_PACKS below
 * if the lists change.
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("Reduce skills: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Reduce skills: run this as the GM.");

  const DELETE = [
    "Acrobatics", "Dancing", "Swimming", "Acting", "Charm (Intrigue)", "Intrigue", "Rhetoric", "Singing",
    "Musician", "Mental Conflict", "Courtwise (Intrigue)", "Streetwise (Intrigue)", "Villagewise (Folklore)",
    "Divination", "Folklore", "Lore", "Law", "Literacy", "Mathematics", "Engineering", "Astrology", "Drawing",
    "Handicraft", "Sailing", "Survival", "Tracking", "Bargaming", "Herblore", "Cat Senses", "Elven Empathy"
  ];
  const RENAME = { "sleight of hand": "Pickpocketing" };
  const SKILL_PREFIX = "system.mods.skill.";
  // Compendia (by pack name in this system) whose items lose all Active Effects.
  const EFFECT_PACKS = ["alchemy", "racial-traits"];

  const norm = (s) => String(s ?? "").toLowerCase().replace(/[‐-―−]/g, "-").replace(/\s+/g, " ").trim();
  const deleteSet = new Set(DELETE.map(norm));
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");
  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Reduce skills" },
    content: `<p>Deletes <b>${DELETE.length} skills</b>, merges Herblore into Alchemy, renames Sleight of Hand to Pickpocketing,
      and deletes all Active Effects of <b>potions (Alchemy)</b> and <b>racial traits</b>.</p>
      <p>System and world compendia, world items and actors, unlinked tokens. The SL of deleted skills is lost.
      <b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const count = { skillsDeleted: 0, merged: 0, herbRenamed: 0, renamed: 0, keys: 0, effectsDeleted: 0, effectItems: 0 };
  const perSkill = {};
  const rows = [];
  const flagged = [];
  const errors = [];
  const note = (where, what, detail = "") => rows.push({ where, what, detail });

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Reduce skills failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  /* -------------------------------------------- */
  /*  Names of items that lose their effects       */
  /* -------------------------------------------- */

  const effectItemNames = new Set();
  for ( const name of EFFECT_PACKS ) {
    const pack = game.packs.get(`${SYS}.${name}`);
    if ( !pack ) { errors.push({ where: name, error: "pack not found" }); continue; }
    const docs = await pack.getDocuments();
    for ( const d of docs ) if ( d.effects?.size ) effectItemNames.add(norm(d.name));
  }

  /* -------------------------------------------- */
  /*  Effects                                      */
  /* -------------------------------------------- */

  const changesPath = (src) => (Array.isArray(src.system?.changes) ? "system.changes" : "changes");

  /** Rename Sleight of Hand keys; flag keys that still point at a deleted skill. */
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
        const to = RENAME[norm(name)];
        if ( to ) { renamed++; return { ...c, key: SKILL_PREFIX + to }; }
        if ( deleteSet.has(norm(name)) ) flagged.push({ where: `${where} › ${effect.name}`, why: `still targets deleted skill "${name}"` });
        return c;
      });
      if ( renamed ) {
        count.keys += renamed;
        updates.push({ _id: effect.id, [path]: next });
        note(`${where} › ${effect.name}`, "effect key renamed", "Sleight of Hand → Pickpocketing");
      }
    }
    return updates;
  }

  /* -------------------------------------------- */
  /*  Items                                        */
  /* -------------------------------------------- */

  /**
   * One item: delete / rename a skill, drop the effects of potion and racial items,
   * rename effect keys. Returns what to do; `deleteItem` means the item is removed.
   */
  function planItem(item, where) {
    const plan = { deleteItem: false, update: null, effectIds: [], keyUpdates: [] };
    const name = norm(item.name);
    if ( item.type === "skill" ) {
      if ( deleteSet.has(name) ) {
        plan.deleteItem = true;
        count.skillsDeleted++;
        perSkill[item.name] = (perSkill[item.name] ?? 0) + 1;
        note(where, "skill deleted");
        return plan;
      }
      if ( RENAME[name] ) {
        plan.update = { name: RENAME[name] };
        count.renamed++;
        note(where, "skill renamed", `${item.name} → ${RENAME[name]}`);
      }
    }
    if ( item.effects?.size && effectItemNames.has(name) ) {
      plan.effectIds = item.effects.map(e => e.id);
      count.effectsDeleted += plan.effectIds.length;
      count.effectItems++;
      note(where, "effects deleted", `${plan.effectIds.length}`);
    }
    else if ( item.effects?.size ) plan.keyUpdates = keyUpdates(item.effects, where);
    return plan;
  }

  async function applyItemPlan(item, plan) {
    if ( plan.update ) await item.update(plan.update, { diff: false });
    if ( plan.effectIds.length ) await item.deleteEmbeddedDocuments("ActiveEffect", plan.effectIds);
    if ( plan.keyUpdates.length ) await item.updateEmbeddedDocuments("ActiveEffect", plan.keyUpdates);
  }

  async function processItem(item, where) {
    await guarded(where, async () => {
      const plan = planItem(item, where);
      if ( !apply ) return;
      if ( plan.deleteItem ) { await item.delete(); return; }
      await applyItemPlan(item, plan);
    });
  }

  /* -------------------------------------------- */
  /*  Actors                                       */
  /* -------------------------------------------- */

  async function processActor(actor, where, only = null) {
    await guarded(where, async () => {
      const effects = only ? actor.effects.filter(e => only.effects.has(e.id)) : actor.effects;
      const own = keyUpdates(effects, where);
      if ( apply && own.length ) await actor.updateEmbeddedDocuments("ActiveEffect", own);

      const items = actor.items.filter(i => !only || only.items.has(i.id));
      const skills = actor.items.filter(i => i.type === "skill");
      const alchemy = skills.find(i => norm(i.name) === "alchemy");
      const deleteIds = [];
      const itemUpdates = [];
      const perItem = [];

      for ( const item of items ) {
        const w = `${where} › ${item.name}`;
        // Herblore merges into Alchemy instead of just disappearing.
        if ( (item.type === "skill") && (norm(item.name) === "herblore") ) {
          count.skillsDeleted++;
          perSkill[item.name] = (perSkill[item.name] ?? 0) + 1;
          if ( alchemy ) {
            const level = Math.max(item.system.level ?? 0, alchemy.system.level ?? 0);
            if ( level !== (alchemy.system.level ?? 0) ) {
              itemUpdates.push({ _id: alchemy.id, "system.level": level });
              count.merged++;
              note(w, "merged into Alchemy", `Alchemy SL → ${level}`);
            }
            else note(w, "skill deleted", "Alchemy already has the higher SL");
            deleteIds.push(item.id);
          }
          else {
            itemUpdates.push({ _id: item.id, name: "Alchemy" });
            count.herbRenamed++;
            count.skillsDeleted--;
            perSkill[item.name]--;
            flagged.push({ where: w, why: "had Herblore but no Alchemy: renamed to Alchemy, check its attributes and SL" });
            note(w, "Herblore renamed to Alchemy", "no Alchemy present");
          }
          continue;
        }
        const plan = planItem(item, w);
        if ( plan.deleteItem ) deleteIds.push(item.id);
        else {
          if ( plan.update ) itemUpdates.push({ _id: item.id, ...plan.update });
          if ( plan.effectIds.length || plan.keyUpdates.length ) perItem.push([item, { update: null, deleteItem: false, effectIds: plan.effectIds, keyUpdates: plan.keyUpdates }]);
        }
      }
      if ( !apply ) return;
      if ( itemUpdates.length ) await actor.updateEmbeddedDocuments("Item", itemUpdates, { diff: false });
      for ( const [item, plan] of perItem ) await applyItemPlan(item, plan);
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

  ui.notifications.info(`Reduce skills: ${apply ? "working" : "checking"}, please wait...`);

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
      console.error(`Scarmark | Reduce skills failed in ${pack.collection}`, err);
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

  console.log(`Scarmark | Reduce skills (${apply ? "APPLY" : "REPORT"})`, count, perSkill);
  if ( rows.length ) console.table(rows);
  if ( flagged.length ) console.table(flagged);
  if ( errors.length ) console.table(errors);

  const v = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Reduce skills — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Skill items deleted${v}: <b>${count.skillsDeleted}</b> (${Object.keys(perSkill).length} different skills)</div>`;
  content += `<div class="card-line">Herblore merged into Alchemy: <b>${count.merged}</b>, renamed to Alchemy: <b>${count.herbRenamed}</b>; Sleight of Hand renamed: <b>${count.renamed}</b> (effect keys: <b>${count.keys}</b>)</div>`;
  content += `<div class="card-line">Active Effects deleted${v}: <b>${count.effectsDeleted}</b> on <b>${count.effectItems}</b> potion and racial items</div>`;
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
