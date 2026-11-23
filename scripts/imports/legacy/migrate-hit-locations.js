/**
 * Scarmark — Migrate Hit Locations (one-shot maintenance macro, 1.0.39, extended in 1.0.40)
 * ------------------------------------------------------------------------------
 * D. 2026-09-29: the humanoid body has ten hit-location types instead of sixteen
 * (Head, Neck, Shoulder, Arm, Hand, Chest, Belly, Hip, Thigh, Shin), wound levels
 * are plain numbers, and a piece of armor that covered only part of a merged
 * location gets lower protection. Scarmark 1.0.39 keeps working with old records
 * (it reads the old location keys as the new ones) but their hit chances are the old
 * ones until you run this macro.
 *
 * What it does, in this system's compendia and the world's own compendia (locked
 * packs are unlocked and re-locked), world items, world actors and the own data of
 * unlinked tokens on every scene:
 *   1. Actors (characters, NPCs, creatures) with the old 26 humanoid location items:
 *      those items are replaced by the 16 new ones (Head, Neck, Right / Left Shoulder,
 *      Arm, Hand, Hip, Thigh, Shin, Chest, Belly) with the canonical weights and wound
 *      levels of CONFIG.SCARMARK.armorLocations. Animals and other location types
 *      (wing, tentacle, tail, creature legs ...) are left alone. Custom hit weights of
 *      old location items are listed, not kept.
 *   2. Armor pieces (compendia, world items, items on actors and tokens): the covered
 *      old locations become the new ones (Skull and Face -> Head, Upper Arm, Elbow and
 *      Forearm -> Arm, Thorax -> Chest, Abdomen and Groin -> Belly, Knee, Calf and
 *      Foot -> Shin). A piece that covered only part of a merged location:
 *        - covers nothing else (bracers, caps, open helmets, visors, boots, greaves) and
 *          covered 60 % or less of the hits to the merged location: every protection
 *          value (B/E/P/F) is multiplied by that share (nearest whole number, at least 1);
 *        - covers other locations too and covered 25 % or less (Short Legs cover only the
 *          knee of the Shin): the merged location is dropped from its coverage;
 *        - anything else (a hood, Short Arms, a hauberk, a robe ...): coverage mapped,
 *          protection unchanged.
 *      The share is the old hit weights: Head = Skull 5 + Face 5; Arm = Upper Arm 6 +
 *      Elbow 2 + Forearm 4; Belly = Abdomen 10 + Groin 4; Shin = Knee 2 + Calf 6 + Foot 4.
 *   3. The Armor Locations compendium (and any loose world location items): the old
 *      humanoid locations are replaced by the 16 new ones.
 *   4. The Stun Test macro in the system macro compendium is refreshed from
 *      scripts/macros/stun-check.js (the test itself now lives in the system).
 *   5. (1.0.40) Quadruped and other creature locations: Creature Thorax and Creature
 *      Abdomen become Creature Chest and Creature Belly. The items (of animals,
 *      creatures, tokens, the Armor Locations compendium) are renamed in place and keep
 *      their weights; armor pieces that cover them are mapped. Nothing else about them changes.
 * Listed only (not changed): world macros named Stun Test, actors whose old location
 * items had custom hit weights.
 *
 * Safe to repeat (also after the 1.0.39 run: it then only does step 5): it only acts on
 * records that still hold the old location keys.
 *
 * HOW TO USE (GM, LOCAL world first, Scarmark 1.0.40-beta or later):
 *   0. After updating the system files RELOAD the world (F5): Foundry loads the system once per
 *      page load, and the macro refuses to run on a page that still has an older one.
 *   1. Back up the world and commit the system packs.
 *   2. New Script macro -> paste this file -> Execute -> "Report only".
 *   3. Read the chat summary (details in the F12 console) -> run again -> "Apply".
 *   4. Reload the world (F5). Check a character sheet (Combat tab, Armor Locations),
 *      an armor piece (Plate Bracers, Plate Helmet) and the Armor Locations compendium;
 *      commit the packs; upload the world to Molten.
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("Migrate Hit Locations: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Migrate Hit Locations: run this as the GM.");
  const CFG = CONFIG.SCARMARK;
  if ( !CFG?.legacyLocationMap || !CFG.armorLocations?.head || !game.scarmark?.defaultArmorLocationItems ) {
    return ui.notifications.error("Migrate Hit Locations: update the Scarmark system to 1.0.40-beta or later first.");
  }
  // Foundry loads the system once per page load: after updating the files, reload the world (F5) first.
  if ( !CFG.armorLocations.creatureChest ) {
    return ui.notifications.error("Migrate Hit Locations: this page still runs an older Scarmark system (no Creature Chest). Reload the world (F5) so that Foundry loads 1.0.40-beta, then run the macro again.", { permanent: true });
  }

  // The old creature keys and what they became are written out here, so the macro never depends on
  // the system's alias table being loaded.
  const CREATURE_RENAMES = { creatureThorax: "creatureChest", creatureAbdomen: "creatureBelly" };
  const LEGACY = { ...CFG.legacyLocationMap, ...CREATURE_RENAMES };   // skull -> head, ..., creatureThorax -> creatureChest
  // Old HUMANOID keys (the 16 -> 10 merge); creature keys are only renamed, see OLD_CREATURE.
  const OLD_ONLY = new Set(["skull", "face", "upperArm", "elbow", "forearm", "thorax", "abdomen", "groin", "knee", "calf", "foot"]);
  const OLD_CREATURE = new Set(Object.keys(LEGACY).filter(k => !OLD_ONLY.has(k)));   // creatureThorax, creatureAbdomen
  const ANY_OLD = new Set(Object.keys(LEGACY));
  const HUMANOID = new Set([...OLD_ONLY, "head", "neck", "shoulder", "arm", "hand", "chest", "belly", "hip", "thigh", "shin"]);
  // Old hit weights (Mid, per type): the share a piece of armor covered inside a merged location.
  const OLD_WEIGHT = { skull: 5, face: 5, upperArm: 6, elbow: 2, forearm: 4, abdomen: 10, groin: 4, knee: 2, calf: 6, foot: 4 };
  const MERGED = { head: ["skull", "face"], arm: ["upperArm", "elbow", "forearm"], belly: ["abdomen", "groin"], shin: ["knee", "calf", "foot"] };
  const REDUCE_MAX = 0.60;    // single-location piece: reduce protection when it covered this share or less
  const DROP_MAX = 0.25;      // multi-location piece: drop the merged location when it covered this share or less
  const ASPECTS = ["blunt", "edged", "piercing", "fire"];
  // Old canonical Mid weights (x10 of the hit %), to spot hand-edited location items.
  const OLD_CANON = { skull: 50, face: 50, neck: 50, shoulder: 120, upperArm: 60, elbow: 20, forearm: 40, hand: 40, thorax: 170, abdomen: 100, groin: 40, hip: 60, thigh: 80, knee: 20, calf: 60, foot: 40 };

  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");
  const rawLocType = (item) => item._source?.system?.locationType;

  /* -------------------------------------------- */
  /*  Setup                                        */
  /* -------------------------------------------- */

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Migrate Hit Locations" },
    content: `<p>Humanoid hit locations: 16 types → 10 (Head, Neck, Shoulder, Arm, Hand, Chest, Belly, Hip, Thigh, Shin).
      Location items of actors and of the Armor Locations compendium are replaced, armor coverage is mapped and the protection of
      partly covering pieces is lowered, the Stun Test macro is refreshed.</p>
      <p>System and world compendia, world items and actors, unlinked tokens. <b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const count = { actors: 0, locsRemoved: 0, locsCreated: 0, armor: 0, reduced: 0, dropped: 0, packs: 0, macros: 0, renamed: 0 };
  const rows = [];
  const listed = [];
  const errors = [];
  const note = (where, what, detail = "") => rows.push({ where, what, detail });
  const flagIt = (where, why) => listed.push({ where, why });

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Migrate Hit Locations failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  /* -------------------------------------------- */
  /*  Armor coverage                               */
  /* -------------------------------------------- */

  /** Plan for an armor piece still holding old location keys; null when there is nothing to do. */
  function planArmor(src) {
    const stored = src.system?.locations;
    const raw = Array.isArray(stored) ? stored : [...(stored ?? [])];
    if ( !raw.some(k => ANY_OLD.has(k)) ) return null;
    const covered = new Set(raw);
    // Share of each merged location the piece covered (only when it covered part of it).
    const share = {};
    for ( const [merged, parts] of Object.entries(MERGED) ) {
      const got = parts.filter(k => covered.has(k));
      if ( got.length && (got.length < parts.length) ) {
        share[merged] = got.reduce((s, k) => s + OLD_WEIGHT[k], 0) / parts.reduce((s, k) => s + OLD_WEIGHT[k], 0);
      }
    }
    let types = [...new Set(raw.map(k => LEGACY[k] ?? k))];
    let reduce = null;
    const dropped = [];
    if ( (types.length === 1) && (share[types[0]] !== undefined) && (share[types[0]] <= REDUCE_MAX) ) {
      reduce = share[types[0]];
    }
    else if ( types.length > 1 ) {
      for ( const [merged, sh] of Object.entries(share) ) {
        if ( sh <= DROP_MAX ) { types = types.filter(t => t !== merged); dropped.push(merged); }
      }
    }
    const update = { "system.locations": types };
    const before = {}, after = {};
    if ( reduce !== null ) {
      for ( const aspect of ASPECTS ) {
        const v = src.system?.protection?.[aspect] ?? 0;
        before[aspect] = v;
        after[aspect] = v <= 0 ? v : Math.max(1, Math.floor(v * reduce + 0.5));
        update[`system.protection.${aspect}`] = after[aspect];
      }
    }
    return { update, reduce, dropped, before, after, types };
  }

  function armorPlanFor(item, where) {
    if ( item.type !== "armor" ) return null;
    const plan = planArmor(item._source ?? {});
    if ( !plan ) return null;
    count.armor++;
    const fmt = (o) => ASPECTS.map(a => o[a]).join("/");
    if ( plan.reduce !== null ) {
      count.reduced++;
      note(where, "protection lowered", `${Math.round(plan.reduce * 100)} %: ${fmt(plan.before)} → ${fmt(plan.after)}; covers ${plan.types.join(", ")}`);
    }
    else if ( plan.dropped.length ) {
      count.dropped++;
      note(where, "coverage dropped", `${plan.dropped.join(", ")} (a small part of it only); covers ${plan.types.join(", ")}`);
    }
    else note(where, "coverage mapped", plan.types.join(", "));
    return plan;
  }

  /* -------------------------------------------- */
  /*  Location items                               */
  /* -------------------------------------------- */

  const isHumanoidLoc = (i) => (i.type === "armorLocation") && HUMANOID.has(rawLocType(i));
  const isOldCreatureLoc = (i) => (i.type === "armorLocation") && OLD_CREATURE.has(rawLocType(i));
  const creatureName = (name) => String(name).replace(/Thorax/g, "Chest").replace(/Abdomen/g, "Belly");

  /** In-place renames (name and type) for the old creature location items among `items`. */
  function creatureRenames(items, where, onlyIds = null, bare = false) {
    const updates = [];
    for ( const i of items ) {
      if ( !isOldCreatureLoc(i) || (onlyIds && !onlyIds.has(i.id)) ) continue;
      const name = creatureName(i.name);
      const type = LEGACY[rawLocType(i)];
      count.renamed++;
      note(bare ? where : `${where} › ${i.name}`, "creature location renamed", `${name} (${type})`);
      updates.push({ _id: i.id, name, "system.locationType": type });
    }
    return updates;
  }
  const hasOldLoc = (items) => items.some(i => (i.type === "armorLocation") && OLD_ONLY.has(rawLocType(i)));

  /** Replace an actor's old humanoid location items by the 16 new ones. */
  async function relocateActor(actor, where, { onlyIds = null } = {}) {
    const candidates = actor.items.filter(i => isHumanoidLoc(i) && (!onlyIds || onlyIds.has(i.id)));
    if ( !hasOldLoc(candidates) ) return;
    for ( const i of candidates ) {
      const canon = OLD_CANON[rawLocType(i)];
      if ( (canon !== undefined) && (i._source.system?.aim?.medium !== canon) ) flagIt(`${where} › ${i.name}`, "hit weight was customised; replaced by the new default");
    }
    const ids = candidates.map(i => i.id);
    const data = onlyIds && actor.items.some(i => isHumanoidLoc(i) && !onlyIds.has(i.id) && !OLD_ONLY.has(rawLocType(i)))
      ? [] : game.scarmark.defaultArmorLocationItems("character");
    count.actors++;
    count.locsRemoved += ids.length;
    count.locsCreated += data.length;
    note(where, "hit locations replaced", `${ids.length} old → ${data.length} new`);
    if ( !apply ) return;
    await actor.deleteEmbeddedDocuments("Item", ids);
    if ( data.length ) await actor.createEmbeddedDocuments("Item", data);
  }

  /** Replace the old humanoid location items of an Item pack (or of the world's loose items). */
  async function relocateItemCollection(items, where, create, remove) {
    const candidates = items.filter(isHumanoidLoc);
    if ( !hasOldLoc(candidates) ) return;
    const folderCount = {};
    for ( const i of candidates ) if ( i.folder ) folderCount[i.folder.id ?? i.folder] = (folderCount[i.folder.id ?? i.folder] ?? 0) + 1;
    const folder = Object.entries(folderCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const data = game.scarmark.defaultArmorLocationItems("character").map(d => ({ ...d, folder }));
    count.packs++;
    count.locsRemoved += candidates.length;
    count.locsCreated += data.length;
    note(where, "location items replaced", `${candidates.length} old → ${data.length} new`);
    if ( !apply ) return;
    await remove(candidates.map(i => i.id));
    await create(data);
  }

  /* -------------------------------------------- */
  /*  Document processors                          */
  /* -------------------------------------------- */

  async function processActor(actor, where, onlyIds = null) {
    await guarded(where, async () => {
      if ( ["character", "npc", "creature"].includes(actor.type) ) await relocateActor(actor, where, { onlyIds });
      const updates = creatureRenames(actor.items, where, onlyIds);
      for ( const item of actor.items ) {
        if ( onlyIds && !onlyIds.has(item.id) ) continue;
        const plan = armorPlanFor(item, `${where} › ${item.name}`);
        if ( plan ) updates.push({ _id: item.id, ...plan.update });
      }
      if ( apply && updates.length ) await actor.updateEmbeddedDocuments("Item", updates, { diff: false });
    });
  }

  async function processItem(item, where) {
    await guarded(where, async () => {
      const plan = armorPlanFor(item, where);
      const rename = creatureRenames([item], where, null, true)[0];
      const update = { ...(plan?.update ?? {}), ...(rename ? { name: rename.name, "system.locationType": rename["system.locationType"] } : {}) };
      if ( apply && Object.keys(update).length ) await item.update(update, { diff: false });
    });
  }

  async function processToken(scene, token) {
    const where = `Scene ${scene.name} › token ${token.name}`;
    const own = new Set((token.delta?._source?.items ?? []).map(i => i._id));
    if ( own.size ) await processActor(token.actor, where, own);
  }

  async function refreshStunMacro(pack) {
    await guarded("[Scarmark Macro] Stun Test", async () => {
      const docs = await pack.getDocuments();
      const macro = docs.find(m => m.name === "Stun Test");
      if ( !macro ) return flagIt("Scarmark Macro", "no macro named Stun Test");
      const res = await fetch(`systems/${SYS}/scripts/macros/stun-check.js`);
      if ( !res.ok ) throw new Error(`cannot read scripts/macros/stun-check.js (${res.status})`);
      const command = await res.text();
      // Foundry trims a macro's stored command, so compare without the outer whitespace.
      if ( (macro.command ?? "").trim() === command.trim() ) return;
      count.macros++;
      note("[Scarmark Macro] Stun Test", "macro refreshed", "from scripts/macros/stun-check.js");
      if ( apply ) await macro.update({ command });
    });
  }

  /* -------------------------------------------- */
  /*  Run                                          */
  /* -------------------------------------------- */

  ui.notifications.info(`Migrate Hit Locations: ${apply ? "migrating" : "checking"}, please wait...`);

  for ( const pack of packs ) {
    if ( !["Item", "Actor", "Macro"].includes(pack.documentName) ) continue;
    const label = `[${pack.metadata.label}]`;
    const wasLocked = pack.locked;
    try {
      if ( (pack.documentName === "Macro") ) {
        if ( isSystemPack(pack) && (pack.metadata.name === "macros") ) {
          if ( apply && wasLocked ) await pack.configure({ locked: false });
          await refreshStunMacro(pack);
        }
        continue;
      }
      const docs = await pack.getDocuments();
      if ( apply && wasLocked ) await pack.configure({ locked: false });
      if ( pack.documentName === "Actor" ) {
        for ( const doc of docs ) await processActor(doc, `${label} ${doc.name}`);
      }
      else {
        for ( const doc of docs ) await processItem(doc, `${label} ${doc.name}`);
        await guarded(`${label} locations`, () => relocateItemCollection(docs, label,
          (data) => CONFIG.Item.documentClass.createDocuments(data, { pack: pack.collection }),
          (ids) => CONFIG.Item.documentClass.deleteDocuments(ids, { pack: pack.collection })));
      }
    }
    catch ( err ) {
      console.error(`Scarmark | Migrate Hit Locations failed in ${pack.collection}`, err);
      errors.push({ where: label, error: err?.message ?? String(err) });
    }
    finally {
      if ( apply && wasLocked && (pack.locked === false) ) await pack.configure({ locked: true });
    }
  }

  for ( const item of [...game.items] ) await processItem(item, `World item ${item.name}`);
  await guarded("World items: locations", () => relocateItemCollection([...game.items], "[World items]",
    (data) => CONFIG.Item.documentClass.createDocuments(data),
    (ids) => CONFIG.Item.documentClass.deleteDocuments(ids)));
  for ( const actor of game.actors ) await processActor(actor, `World actor ${actor.name}`);
  for ( const scene of game.scenes ) {
    for ( const token of scene.tokens ) {
      if ( token.actorLink || !token.actor || !token.delta ) continue;
      await processToken(scene, token);
    }
  }
  for ( const m of game.macros ) {
    if ( (m.name === "Stun Test") && /Stun Check/.test(m.command ?? "") ) flagIt(`World macro ${m.name}`, "a world copy of the old Stun Test macro; replace it with the one from the Scarmark Macro compendium");
  }

  /* -------------------------------------------- */
  /*  Report                                       */
  /* -------------------------------------------- */

  console.log(`Scarmark | Migrate Hit Locations (${apply ? "APPLY" : "REPORT"})`, count);
  if ( rows.length ) console.table(rows);
  if ( listed.length ) console.table(listed);
  if ( errors.length ) console.table(errors);

  const v = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Migrate Hit Locations — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Actors with new hit locations${v}: <b>${count.actors}</b> (old items removed: <b>${count.locsRemoved}</b>, new items: <b>${count.locsCreated}</b>)</div>`;
  content += `<div class="card-line">Armor pieces with mapped coverage${v}: <b>${count.armor}</b>, protection lowered: <b>${count.reduced}</b>, a location dropped: <b>${count.dropped}</b></div>`;
  content += `<div class="card-line">Location compendia / item lists rebuilt${v}: <b>${count.packs}</b>, Stun Test macro refreshed: <b>${count.macros}</b></div>`;
  content += `<div class="card-line">Creature locations renamed (Thorax → Chest, Abdomen → Belly)${v}: <b>${count.renamed}</b></div>`;
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
