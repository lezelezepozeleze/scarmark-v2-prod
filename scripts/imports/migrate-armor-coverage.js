/**
 * Scarmark - Migrate Armor Coverage (one-shot maintenance macro, 1.0.54)
 * ------------------------------------------------------------------------------
 * Armor used to list the hit locations it covers as a set of keys (system.locations,
 * "arm" for both sides, "leftArm" for one) with a separate map of conditions
 * (system.locationConditions). It now has one entry per covered location in
 * system.coverage: { type, side, condition }; an entry for both sides of a type that has sides (arm, hand, shin ...) is split into a left and a right entry. Armor also got
 * system.originalQuality (the durability it started with, shown as 5/10).
 *
 * The system converts old armor in memory whenever it loads, so nothing breaks before you run
 * this macro. The macro writes the result to the database and deletes the old fields:
 *   1. Armor pieces (system and world compendia, world items, items on actors, unlinked
 *      tokens): system.coverage is stored (both-sides entries split into left and right), system.locations and system.locationConditions are
 *      deleted, and system.originalQuality is set when it is 0: from the compendium item the
 *      piece was copied from (its durability), else from the piece's own durability if that is
 *      above 0.
 *   2. Hit location items (armorLocation: of actors, tokens and the Armor Locations
 *      compendium): system.side is set to left or right when it is empty and the name has the
 *      word Left or Right.
 * Locked packs are unlocked and locked again. Safe to repeat: a second run writes the same data.
 *
 * HOW TO USE (GM, a COPY of the world first, Scarmark 1.0.54-beta or later):
 *   0. After updating the system files RELOAD the world (F5).
 *   1. Back up the world and commit the system packs.
 *   2. New Script macro -> paste this file -> Execute -> "Report only".
 *   3. Read the chat summary (details in the F12 console) -> run again -> "Apply".
 *   4. Reload the world (F5). Open an armor piece (Properties tab) and a character's Combat tab.
 */
(async () => {
  if ( game.system.id !== "scarmark" ) return ui.notifications.error("Migrate Armor Coverage: this world does not run the scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Migrate Armor Coverage: run this as the GM.");
  const armorSchema = CONFIG.Item.dataModels?.armor?.defineSchema?.();
  if ( !armorSchema?.coverage || !armorSchema?.originalQuality ) {
    return ui.notifications.error("Migrate Armor Coverage: this page runs an older system (armor has no coverage). Update the system and reload the world (F5), then run the macro again.", { permanent: true });
  }

  // What the old keys meant, written out so the macro does not depend on the system's tables.
  const SIDED = {
    leftShoulder: ["shoulder", "left"], rightShoulder: ["shoulder", "right"], leftArm: ["arm", "left"], rightArm: ["arm", "right"],
    leftHand: ["hand", "left"], rightHand: ["hand", "right"], leftHip: ["hip", "left"], rightHip: ["hip", "right"],
    leftThigh: ["thigh", "left"], rightThigh: ["thigh", "right"], leftShin: ["shin", "left"], rightShin: ["shin", "right"],
    leftWing: ["wing", "left"], rightWing: ["wing", "right"],
    creatureLeftForeLeg: ["creatureForeLeg", "left"], creatureRightForeLeg: ["creatureForeLeg", "right"],
    creatureLeftHindLeg: ["creatureHindLeg", "left"], creatureRightHindLeg: ["creatureHindLeg", "right"]
  };
  const SIDED_TYPES = [...new Set(Object.values(SIDED).map(([type]) => type))];
  const LEGACY_TYPES = CONFIG.SCARMARK?.legacyLocationMap ?? {};
  const legacyCoverage = (keys, conditions) => {
    const seen = new Set();
    const out = [];
    for ( const key of keys ?? [] ) {
      const [type, side] = SIDED[key] ?? [LEGACY_TYPES[key] ?? key, ""];
      if ( seen.has(`${type}:${side}`) ) continue;
      seen.add(`${type}:${side}`);
      const condition = Number(conditions?.[key]);
      out.push({ type, side, condition: Number.isFinite(condition) ? condition : 0 });
    }
    return out;
  };

  /** A both-sides entry of a type that has sides becomes a left and a right entry (the condition is copied; a side that has its own entry keeps it). */
  const splitBothSides = (coverage) => {
    const out = [];
    const seen = new Set();
    const push = (type, side, condition) => {
      if ( seen.has(`${type}:${side}`) ) return;
      seen.add(`${type}:${side}`);
      out.push({ type, side, condition });
    };
    const own = new Set(coverage.filter(e => e.side).map(e => `${LEGACY_TYPES[e.type] ?? e.type}:${e.side}`));
    for ( const e of coverage ) {
      const type = LEGACY_TYPES[e.type] ?? e.type;
      const condition = Number(e.condition) || 0;
      if ( e.side || !SIDED_TYPES.includes(type) ) { push(type, e.side ?? "", condition); continue; }
      for ( const side of ["left", "right"] ) if ( !own.has(`${type}:${side}`) ) push(type, side, condition);
    }
    return out;
  };

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Migrate Armor Coverage" },
    content: `<p>Armor locations become coverage entries (type, side, condition), armor gets an original durability, and hit locations get a side from their name.</p>
      <p>System and world compendia, world items and actors, unlinked tokens. <b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const count = { armor: 0, withOriginal: 0, locations: 0, packs: 0 };
  const rows = [];
  const errors = [];
  const sourceCache = new Map();

  /** The durability of the compendium item a piece was copied from, or null. */
  async function sourceQuality(item) {
    const uuid = [item._stats?.compendiumSource, item.flags?.core?.sourceId].find(u => typeof u === "string" && u.startsWith("Compendium."));
    if ( !uuid ) return null;
    if ( !sourceCache.has(uuid) ) {
      let quality = null;
      try {
        const source = await fromUuid(uuid);
        const value = Number(source?.type === "armor" ? source.system.quality : NaN);
        quality = value > 0 ? value : null;
      } catch ( err ) { console.warn("Migrate Armor Coverage: cannot read", uuid, err); }
      sourceCache.set(uuid, quality);
    }
    return sourceCache.get(uuid);
  }

  /** The update for an armor piece, or null for anything else. */
  async function armorChanges(item) {
    if ( item.type !== "armor" ) return null;
    const sys = item._source.system;
    // The system has already turned old data into coverage while loading; the old fields are gone from _source then.
    const coverage = splitBothSides(Array.isArray(sys.coverage) ? sys.coverage : legacyCoverage(sys.locations, sys.locationConditions));
    let original = Number(sys.originalQuality) || 0;
    if ( original <= 0 ) original = (await sourceQuality(item)) ?? (Number(sys.quality) > 0 ? Number(sys.quality) : 0);
    return {
      "system.coverage": coverage.map(e => ({ type: e.type, side: e.side ?? "", condition: Number(e.condition) || 0 })),
      "system.originalQuality": original,
      "system.-=locations": null,
      "system.-=locationConditions": null
    };
  }

  /** The update for a hit location item, or null when it has a side already or none in its name. */
  function locationChanges(item) {
    if ( item.type !== "armorLocation" ) return null;
    if ( ["left", "right"].includes(item._source.system.side) ) return null;
    const side = /\b(left|right)\b/i.exec(item.name)?.[1]?.toLowerCase();
    return side ? { "system.side": side } : null;
  }

  async function changesFor(item) {
    return (await armorChanges(item)) ?? locationChanges(item);
  }

  function record(where, item, changes) {
    if ( item.type === "armor" ) {
      count.armor++;
      if ( changes["system.originalQuality"] > 0 ) count.withOriginal++;
      rows.push({ where, item: item.name, coverage: changes["system.coverage"].map(e => `${e.type}${e.side ? ":" + e.side : ""}`).join(", "), original: changes["system.originalQuality"] });
    } else {
      count.locations++;
      rows.push({ where, item: item.name, coverage: `side: ${changes["system.side"]}`, original: "" });
    }
  }

  async function processItem(item, where) {
    const changes = await changesFor(item);
    if ( !changes ) return;
    record(where, item, changes);
    if ( apply ) await item.update(changes, { diff: false });
  }

  async function processActor(actor, where, onlyIds = null) {
    const updates = [];
    for ( const item of actor.items ) {
      if ( onlyIds && !onlyIds.has(item.id) ) continue;
      const changes = await changesFor(item);
      if ( !changes ) continue;
      record(`${where} › ${actor.name}`, item, changes);
      updates.push({ _id: item.id, ...changes });
    }
    if ( apply && updates.length ) await actor.updateEmbeddedDocuments("Item", updates, { diff: false });
  }

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Migrate Armor Coverage failed in ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  ui.notifications.info(`Migrate Armor Coverage: ${apply ? "migrating" : "checking"}, please wait...`);

  // Compendia of this system and of the world.
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

  console.log(`Scarmark | Migrate Armor Coverage (${apply ? "APPLY" : "REPORT"})`, count);
  if ( rows.length ) console.table(rows);
  if ( errors.length ) console.table(errors);

  const v = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Migrate Armor Coverage - ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Armor pieces written${v}: <b>${count.armor}</b>, with an original durability: <b>${count.withOriginal}</b></div>`;
  content += `<div class="card-line">Hit locations given a side${v}: <b>${count.locations}</b></div>`;
  content += `<div class="card-line">Compendia checked: <b>${count.packs}</b>${errors.length ? `, <b>errors: ${errors.length}</b> (see the console)` : ""}</div>`;
  content += apply ? `<div class="card-line"><i>Reload the world (F5).</i></div>` : `<div class="card-line"><i>Nothing was changed. Run again and choose Apply.</i></div>`;
  content += `</div>`;
  await ChatMessage.create({ whisper: [game.user.id], content });
})();
