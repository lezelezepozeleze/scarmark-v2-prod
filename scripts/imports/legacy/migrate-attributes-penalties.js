/**
 * Scarmark — Migrate Attributes & Penalties (one-shot maintenance macro, 1.0.36)
 * ------------------------------------------------------------------------------
 * D. 2026-09-28: 13 attributes become 9 (STR, STA, DEX, AGL, WIL / PER, PRE, INT,
 * SPI; creatures and animals have no PRE), races go into the attribute values
 * by hand, the AWARENESS skills become macros, helmets cost 1 Perception, and
 * "Aura" becomes "Spirit". Scarmark 1.0.36 already reads old records correctly
 * (migrateData); this macro makes the change permanent and converts what
 * migrateData cannot reach (effects, races, texts).
 *
 * What it does, in this system's compendia and the world's own compendia (locked
 * packs are unlocked and re-locked), world items, world actors and the own data of
 * unlinked tokens on every scene:
 *   1. Actors: writes PER / PRE / SPI (PER = average of EYE, HRG, SML; PRE =
 *      average of VOI, COM; SPI = AUR; creatures and animals get no PRE) and
 *      saves the actor in the new shape (the old keys are dropped on save).
 *   2. Races: an actor with a race trait gets the race's attribute changes added
 *      to its own values (table RACES below: Water Elf PER +1, Forest Elf PER +3,
 *      Leonid and Tavaxi PER +4 including their old Awareness bonuses). The race
 *      trait itself loses every attribute and Awareness change (its skill bonuses
 *      stay), everywhere, compendium copies included.
 *   3. Skills and psionic talents: Skill Base attributes saved in the new keys
 *      (EYE, HRG, SML -> PER; VOI, COM -> PRE; AUR -> SPI); every AWARENESS and
 *      AWARENESS - PASSIVE skill is deleted.
 *   4. Active Effects (effect compendia, items, actors, tokens): attribute changes
 *      on EYE / HRG / SML -> PER as their average; VOI or COM -> PRE at full value;
 *      AUR -> SPI; MOR dropped. Changes on the AWARENESS skills -> PER at a fifth
 *      (Cup of Coffee +10 -> PER +2; both Awareness keys on one effect: the larger).
 *   5. Helmets (Plate Helmet, Plate Full Helmet, Plate Great Helmet, Lamellar
 *      Helmet) get an effect "Helmet: Perception −1"; the old notes "Penalty to EYE
 *      and SML" / "Penalty to HRG" are removed from armor.
 *   6. Texts (item and effect descriptions, notes, psionic Misfire): Aural Shock,
 *      Aura test / signature, AUR, Aura, aura -> Spirit / SPI / spirit (in the
 *      compendia: 125 x Aural Shock, 6 x AUR, "Runeless (aura)" ...);
 *      Sunsign -> Zodiac Sign.
 *   7. The Awareness and Passive Awareness macros are added to the Scarmark Macro
 *      compendium (folder Attributes & Skills) from scripts/macros/.
 * Listed only (not changed): creatures or animals with a skill on Presence,
 * unlinked tokens with their own attribute values, override-type changes on old
 * attributes or Awareness, effects on removed keys (mods.up / pp / encumbrance).
 *
 * Safe to repeat: actors are flagged (flags.scarmark.attr9) so races are added
 * once; everything else only acts on data still in the old shape.
 *
 * HOW TO USE (GM, LOCAL world first, Scarmark 1.0.36-beta or later):
 *   1. Back up the world and commit the system packs.
 *   2. New Script macro -> paste this file -> Execute -> "Report only".
 *   3. Read the chat summary (details in the F12 console) -> run again -> "Apply".
 *   4. Check a character, an NPC template, a creature and a potion; commit the
 *      packs; upload the world to Molten.
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("Migrate Attributes: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Migrate Attributes: run this as the GM.");
  const CFG = CONFIG.SCARMARK;
  if ( !CFG?.legacyAttributeMap || !CFG.attributes?.per ) {
    return ui.notifications.error("Migrate Attributes: update the Scarmark system to 1.0.36-beta or later first.");
  }

  const NEW_KEYS = Object.keys(CFG.attributes);                  // str sta dex agl wil per pre int spi
  const CREATURE_KEYS = CFG.creatureAttributeKeys;               // without pre
  const LEGACY = CFG.legacyAttributeMap;                         // eye/hrg/sml -> per, voi/com -> pre, aur -> spi
  const ATTR_KEY = /^system\.attributes\.(\w+)\.base$/;
  const SKILL_PREFIX = "system.mods.skill.";
  const AWARENESS = new Set(["awareness", "awareness - passive"]);
  const REMOVED_MODS = new Set(["system.mods.up", "system.mods.pp", "system.mods.encumbrance"]);
  const HELMETS = new Set(["plate helmet", "plate full helmet", "plate great helmet", "lamellar helmet"]);
  const HELMET_EFFECT = "Helmet: Perception −1";
  const NOTE_FIXES = [/\s*Penalty to EYE and SML\.?\s*/gi, /\s*Penalty to HRG\.?\s*/gi];
  const TEXT_FIXES = [
    [/Aural Shock/g, "Spirit Shock"],
    [/\bAura (test|Test|TEST|signature|Signature)\b/g, "Spirit $1"],
    [/\bAURA\b/g, "SPIRIT"],
    [/\bAUR\b/g, "SPI"],
    [/\bAura\b/g, "Spirit"],
    [/\baura\b/g, "spirit"],
    [/\bSunsigns\b/g, "Zodiac Signs"],
    [/\bSunsign\b/g, "Zodiac Sign"]
  ];

  // Race attribute changes in the NEW attributes (AI/Notes/2026-09-28-Atributy-9-prepocet.md,
  // decisions of 2026-09-28: senses averaged, COM at full value, Awareness bonuses folded into PER).
  const RACES = {
    "ghetto elf (half-elf)": { str: -1, dex: 1 },
    "dark elf":              { str: -1, dex: 2, agl: 1, spi: 1, per: 1 },
    "drachenborn":           { str: 4, sta: 3, dex: -1, agl: -1, int: -2, wil: 2, spi: -2, per: 1 },
    "dwarf/dwarven":         { str: 2, sta: 1, agl: -2, wil: 1, per: 1 },
    "forest elf":            { str: -1, dex: 1, agl: 2, int: 1, per: 3 },
    "gnome":                 { str: -2, dex: 1, agl: 2, int: 2, wil: 1, spi: 1, per: 1 },
    "goblin":                { str: -2, dex: 2, agl: 2, int: 2, per: 2 },
    "halfling":              { str: -2, dex: 2, agl: 2, int: 1, wil: 1, spi: 1, per: 1 },
    "high elf":              { str: -1, dex: 1, agl: 1, int: 2, spi: 2, per: 1, pre: 2 },
    "leonid":                { str: 3, sta: 2, dex: 1, agl: 1, int: -1, wil: 2, spi: -1, per: 4 },
    "oni":                   { str: 2, sta: 1, dex: -1, agl: -1, int: 1, wil: 1, spi: 2, per: 1 },
    "orc":                   { str: 2, sta: 1, dex: 1, wil: 2, per: 1 },
    "red elf":               { dex: 2, agl: 1, int: 1, wil: 1, spi: 1, per: 1, pre: -2 },
    "tavaxi":                { str: -1, dex: 1, agl: 2, int: 1, wil: 1, spi: 1, per: 4 },
    "water elf":             { str: -1, dex: 1, agl: 2, int: 1, spi: 1, per: 1 }
  };

  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const norm = (s) => String(s ?? "").trim().toLowerCase();
  const roundAway = (x) => (x < 0 ? -Math.round(-x) : Math.round(x));
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");
  const raceOf = (item) => (item.type === "trait" ? RACES[norm(item.name)] : undefined);

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Migrate Attributes & Penalties" },
    content: `<p>13 → 9 attributes, races into attribute values, AWARENESS skills removed, effects converted,
      helmets −1 Perception, Aura → Spirit texts, Awareness macros.</p>
      <p>System and world compendia, world items and actors, unlinked tokens. <b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const count = { actors: 0, races: 0, skillsMapped: 0, awarenessDeleted: 0, effects: 0, raceTraitsStripped: 0, helmets: 0, notes: 0, texts: 0, macros: 0 };
  const rows = [];        // { where, what, detail }
  const listed = [];      // { where, why }
  const errors = [];
  const note = (where, what, detail = "") => rows.push({ where, what, detail });
  const flagIt = (where, why) => listed.push({ where, why });

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Migrate Attributes failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  /* -------------------------------------------- */
  /*  Pure converters                              */
  /* -------------------------------------------- */

  const changesPath = (src) => (Array.isArray(src.system?.changes) ? "system.changes" : "changes");
  const changeType = (c) => c.type ?? (c.mode === 5 ? "override" : "add");

  /**
   * New changes array for an effect, or null when nothing changes.
   * @param {object[]} changes
   * @param {boolean} stripAttributes  race trait: drop every attribute / Awareness change
   */
  function convertChanges(changes, where, stripAttributes = false) {
    const out = [];
    const groups = { per: [], pre: [], spi: [] };
    let awareness = 0, touched = false, proto = null;
    for ( const c of changes ) {
      const key = c?.key ?? "";
      const m = key.match(ATTR_KEY);
      const skill = key.startsWith(SKILL_PREFIX) ? norm(key.slice(SKILL_PREFIX.length)) : null;
      if ( REMOVED_MODS.has(key) ) flagIt(where, `change on removed key ${key}`);
      if ( stripAttributes && (m || AWARENESS.has(skill)) ) { touched = true; continue; }
      if ( m && ((m[1] in LEGACY) || (m[1] === "mor")) ) {
        touched = true;
        if ( m[1] === "mor" ) continue;
        if ( changeType(c) !== "add" ) { flagIt(where, `${changeType(c)} change on ${m[1].toUpperCase()} dropped`); continue; }
        groups[LEGACY[m[1]]].push({ from: m[1], value: Number(c.value) || 0 });
        proto ??= c;
        continue;
      }
      if ( AWARENESS.has(skill) ) {
        touched = true;
        if ( changeType(c) !== "add" ) { flagIt(where, `${changeType(c)} change on ${key.slice(SKILL_PREFIX.length)} dropped`); continue; }
        const v = Number(c.value) || 0;
        if ( Math.abs(v) > Math.abs(awareness) ) awareness = v;
        proto ??= c;
        continue;
      }
      out.push(c);
    }
    if ( !touched ) return null;
    if ( !stripAttributes ) {
      const sum = (list) => list.reduce((s, x) => s + x.value, 0);
      const per = (groups.per.length ? roundAway(sum(groups.per) / 3) : 0) + roundAway(awareness / 5);
      // VOI or COM alone (every case in the data): full value; both at once: their average.
      const pre = groups.pre.length > 1 ? roundAway(sum(groups.pre) / groups.pre.length) : sum(groups.pre);
      const spi = sum(groups.spi);
      for ( const [k, v] of [["per", per], ["pre", pre], ["spi", spi]] ) {
        if ( !v ) continue;
        const c = { key: `system.attributes.${k}.base`, type: "add", value: v };
        if ( proto?.priority !== undefined ) c.priority = proto.priority;
        if ( proto?.phase !== undefined ) c.phase = proto.phase;
        out.push(c);
      }
    }
    return out;
  }

  /** Text fields of an item source: returns { path: newText } for the changed ones. */
  function textUpdates(src, armorNotes = false) {
    const u = {};
    for ( const path of ["system.description", "system.notes", "system.misfire"] ) {
      const text = foundry.utils.getProperty(src, path);
      if ( typeof text !== "string" || !text ) continue;
      let next = text;
      if ( armorNotes && (path === "system.notes") ) {
        for ( const re of NOTE_FIXES ) next = next.replace(re, " ");
        next = next.replace(/\s{2,}/g, " ").replace(/^[\s;,.]+|[\s;,]+$/g, "");
      }
      for ( const [re, to] of TEXT_FIXES ) next = next.replace(re, to);
      if ( next !== text ) u[path] = next;
    }
    return u;
  }

  /* -------------------------------------------- */
  /*  Document processors                          */
  /* -------------------------------------------- */

  /** Effect updates for a collection of ActiveEffects (convert, or strip for a race trait). */
  function effectUpdates(effects, where, stripAttributes = false) {
    const updates = [];
    for ( const effect of effects ) {
      const src = effect._source ?? {};
      const path = changesPath(src);
      const changes = foundry.utils.getProperty(src, path) ?? [];
      const w = `${where} › ${effect.name}`;
      const next = convertChanges(changes, w, stripAttributes);
      const u = {};
      if ( next ) {
        u[path] = next;
        note(w, stripAttributes ? "race effect stripped" : "effect converted",
          next.filter(c => ATTR_KEY.test(c.key ?? "")).map(c => `${c.key.split(".")[2].toUpperCase()} ${c.value > 0 ? "+" : ""}${c.value}`).join(", "));
      }
      if ( typeof src.description === "string" ) {
        let d = src.description;
        for ( const [re, to] of TEXT_FIXES ) d = d.replace(re, to);
        if ( d !== src.description ) u.description = d;
      }
      if ( Object.keys(u).length ) updates.push({ _id: effect.id, ...u });
    }
    return updates;
  }

  /**
   * Everything item-level for one item (embedded or not): skill attributes, text,
   * effects, race strip, helmet effect. Returns { deleted, update, effectUpdates, helmet }.
   */
  function planItem(item, where) {
    const src = item._source ?? {};
    const plan = { deleted: false, update: null, effectUpdates: [], helmet: false };
    if ( (item.type === "skill") && AWARENESS.has(norm(item.name)) ) {
      plan.deleted = true;
      count.awarenessDeleted++;
      note(where, "AWARENESS skill deleted");
      return plan;
    }
    const u = {};
    if ( (item.type === "skill") || (item.type === "psionic") ) {
      // Persist the Skill Base attributes (migrateData already maps them in memory).
      for ( const k of ["attribute1", "attribute2", "attribute3"] ) u[`system.${k}`] = src.system?.[k];
      count.skillsMapped++;
    }
    const texts = textUpdates(src, item.type === "armor");
    if ( Object.keys(texts).length ) {
      Object.assign(u, texts);
      if ( ("system.notes" in texts) && (item.type === "armor") ) count.notes++;
      count.texts++;
      note(where, "text", Object.keys(texts).join(", "));
    }
    plan.update = Object.keys(u).length ? u : null;

    const race = raceOf(item);
    plan.effectUpdates = effectUpdates(item.effects, where, !!race);
    if ( race && plan.effectUpdates.some(e => ("system.changes" in e) || ("changes" in e)) ) count.raceTraitsStripped++;
    count.effects += plan.effectUpdates.length;

    if ( (item.type === "armor") && HELMETS.has(norm(item.name)) ) {
      const has = item.effects.some(e => e.name === HELMET_EFFECT
        || (foundry.utils.getProperty(e._source, changesPath(e._source)) ?? []).some(c => c.key === "system.attributes.per.base"));
      if ( !has ) { plan.helmet = true; count.helmets++; note(where, "helmet effect added"); }
    }
    return plan;
  }

  const helmetEffectData = () => ({
    name: HELMET_EFFECT,
    img: "icons/svg/eye.svg",
    transfer: true,
    disabled: false,
    system: { changes: [{ key: "system.attributes.per.base", type: "add", value: -1 }] },
    flags: { [SYS]: { helmetPerception: true } }
  });

  async function applyItemPlan(item, plan) {
    if ( plan.update ) await item.update(plan.update, { diff: false });
    if ( plan.effectUpdates.length ) await item.updateEmbeddedDocuments("ActiveEffect", plan.effectUpdates);
    if ( plan.helmet ) await item.createEmbeddedDocuments("ActiveEffect", [helmetEffectData()]);
  }

  /** A stand-alone item (compendium or world). */
  async function processItem(item, where) {
    await guarded(where, async () => {
      const plan = planItem(item, where);
      if ( !apply ) return;
      if ( plan.deleted ) return item.delete();
      await applyItemPlan(item, plan);
    });
  }

  /**
   * An actor: attributes (+ race), own effects, items. `only` limits an unlinked
   * token to what its delta owns.
   */
  async function processActor(actor, where, only = null) {
    await guarded(where, async () => {
      const src = actor._source ?? {};
      const keys = ["creature", "animal"].includes(actor.type) ? CREATURE_KEYS : NEW_KEYS;
      const hasAttributes = !!src.system?.attributes && (actor.type !== "container");
      const done = !!src.flags?.[SYS]?.attr9;

      // 1 + 2. Attributes and race (whole actors only; tokens are handled by their delta below).
      if ( hasAttributes && !only ) {
        const u = { [`flags.${SYS}.attr9`]: true };
        const race = done ? null : actor.items.find(i => raceOf(i) && effectHasAttributeChanges(i));
        for ( const k of keys ) {
          let v = Number(src.system.attributes?.[k]?.base ?? 8);
          const delta = race ? (RACES[norm(race.name)][k] ?? 0) : 0;
          if ( delta ) v = Math.max(0, v + delta);
          u[`system.attributes.${k}.base`] = v;
        }
        if ( race ) {
          count.races++;
          note(where, `race ${race.name} into attributes`, Object.entries(RACES[norm(race.name)])
            .filter(([k]) => keys.includes(k)).map(([k, d]) => `${k.toUpperCase()} ${d > 0 ? "+" : ""}${d}`).join(", "));
        }
        if ( !done ) count.actors++;
        if ( apply ) await actor.update(u, { diff: false });
      }

      // Presence skills on a creature / animal: listed only.
      if ( ["creature", "animal"].includes(actor.type) ) {
        for ( const i of actor.items ) {
          if ( (i.type === "skill") && ["attribute1", "attribute2", "attribute3"].some(k => i.system[k] === "pre") ) {
            flagIt(`${where} › ${i.name}`, "creature / animal skill on Presence (it has no Presence)");
          }
        }
      }

      // Own effects.
      const effects = only ? actor.effects.filter(e => only.effects.has(e.id)) : actor.effects;
      const own = effectUpdates(effects, where);
      count.effects += own.length;
      if ( apply && own.length ) await actor.updateEmbeddedDocuments("ActiveEffect", own);

      // Items: batch updates and deletions; effects and helmets per item.
      const toDelete = [], itemUpdates = [], perItem = [];
      for ( const item of actor.items ) {
        if ( only && !only.items.has(item.id) ) continue;
        const w = `${where} › ${item.name}`;
        const plan = planItem(item, w);
        if ( plan.deleted ) { toDelete.push(item.id); continue; }
        if ( plan.update ) itemUpdates.push({ _id: item.id, ...plan.update });
        if ( plan.effectUpdates.length || plan.helmet ) perItem.push([item, { ...plan, update: null }]);
      }
      if ( !apply ) return;
      if ( itemUpdates.length ) await actor.updateEmbeddedDocuments("Item", itemUpdates, { diff: false });
      for ( const [item, plan] of perItem ) await applyItemPlan(item, plan);
      if ( toDelete.length ) await actor.deleteEmbeddedDocuments("Item", toDelete);
    });
  }

  function effectHasAttributeChanges(item) {
    return item.effects.some(e => (foundry.utils.getProperty(e._source, changesPath(e._source)) ?? [])
      .some(c => ATTR_KEY.test(c.key ?? "") || AWARENESS.has(norm((c.key ?? "").startsWith(SKILL_PREFIX) ? c.key.slice(SKILL_PREFIX.length) : ""))));
  }

  /** Unlinked token: its own attribute values (listed and folded), then its own items and effects. */
  async function processToken(scene, token) {
    const where = `Scene ${scene.name} › token ${token.name}`;
    const d = token.delta?._source ?? {};
    await guarded(where, async () => {
      const oldAttrs = d.system?.attributes ?? {};
      const oldKeys = Object.keys(oldAttrs).filter(k => (k in LEGACY) || (k === "mor"));
      if ( oldKeys.length && !d.flags?.[SYS]?.attr9 ) {
        // Fold the token's own old values with the base actor's migrated ones.
        const baseAttrs = token.baseActor?._source?.system?.attributes ?? {};
        const keys = ["creature", "animal"].includes(token.actor?.type) ? CREATURE_KEYS : NEW_KEYS;
        const u = { [`flags.${SYS}.attr9`]: true };
        for ( const target of ["per", "pre", "spi"] ) {
          if ( !keys.includes(target) ) continue;
          const parts = Object.keys(LEGACY).filter(k => LEGACY[k] === target);
          if ( !parts.some(k => oldAttrs[k]) ) continue;
          const fallback = Number(baseAttrs[target]?.base ?? 8);
          const vals = parts.map(k => Number(oldAttrs[k]?.base ?? fallback));
          u[`system.attributes.${target}.base`] = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
        }
        flagIt(where, `token has its own old attributes (${oldKeys.join(", ").toUpperCase()}); folded into ${Object.keys(u).filter(k => k.startsWith("system")).map(k => k.split(".")[2].toUpperCase()).join(", ")}`);
        if ( apply ) await token.actor.update(u);
      }
      const only = {
        items: new Set((d.items ?? []).map(i => i._id)),
        effects: new Set((d.effects ?? []).map(e => e._id))
      };
      if ( only.items.size || only.effects.size ) await processActor(token.actor, where, only);
    });
  }

  /* -------------------------------------------- */
  /*  Run                                          */
  /* -------------------------------------------- */

  ui.notifications.info(`Migrate Attributes: ${apply ? "migrating" : "checking"}, please wait...`);

  for ( const pack of packs ) {
    if ( !["Item", "Actor", "ActiveEffect"].includes(pack.documentName) ) continue;
    const label = `[${pack.metadata.label}]`;
    const wasLocked = pack.locked;
    try {
      const docs = await pack.getDocuments();
      if ( apply && wasLocked ) await pack.configure({ locked: false });
      if ( pack.documentName === "ActiveEffect" ) {
        const updates = effectUpdates(docs, label);
        count.effects += updates.length;
        if ( apply && updates.length ) await CONFIG.ActiveEffect.documentClass.updateDocuments(updates, { pack: pack.collection });
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
      console.error(`Scarmark | Migrate Attributes failed in ${pack.collection}`, err);
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
      await processToken(scene, token);
    }
  }

  // 7. Awareness macros into the system macro compendium.
  await guarded("[Scarmark Macro] Awareness macros", async () => {
    const pack = game.packs.get(`${SYS}.macros`);
    if ( !pack ) return flagIt("Scarmark Macro", "compendium scarmark.macros not found");
    const index = await pack.getIndex();
    const folder = pack.folders?.find(f => f.name === "Attributes & Skills")?.id ?? null;
    const wanted = [
      { name: "Awareness", file: "awareness.js" },
      { name: "Passive Awareness", file: "passive-awareness.js" }
    ].filter(m => !index.some(e => e.name === m.name));
    if ( !wanted.length ) return;
    count.macros += wanted.length;
    wanted.forEach(m => note("[Scarmark Macro]", "macro added", m.name));
    if ( !apply ) return;
    const data = [];
    for ( const m of wanted ) {
      const res = await fetch(`systems/${SYS}/scripts/macros/${m.file}`);
      if ( !res.ok ) throw new Error(`cannot read scripts/macros/${m.file} (${res.status})`);
      data.push({ name: m.name, type: "script", img: "icons/svg/eye.svg", command: await res.text(), folder });
    }
    const wasLocked = pack.locked;
    if ( wasLocked ) await pack.configure({ locked: false });
    try { await CONFIG.Macro.documentClass.createDocuments(data, { pack: pack.collection }); }
    finally { if ( wasLocked ) await pack.configure({ locked: true }); }
  });

  /* -------------------------------------------- */
  /*  Report                                       */
  /* -------------------------------------------- */

  console.log(`Scarmark | Migrate Attributes (${apply ? "APPLY" : "REPORT"})`, count);
  if ( rows.length ) console.table(rows);
  if ( listed.length ) console.table(listed);
  if ( errors.length ) console.table(errors);

  const v = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Migrate Attributes — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Actors saved with 9 attributes${v}: <b>${count.actors}</b>, races folded in: <b>${count.races}</b></div>`;
  content += `<div class="card-line">Skills / talents saved with new attributes${v}: <b>${count.skillsMapped}</b></div>`;
  content += `<div class="card-line">AWARENESS skills deleted${v}: <b>${count.awarenessDeleted}</b></div>`;
  content += `<div class="card-line">Effects converted or stripped${v}: <b>${count.effects}</b> (race traits: <b>${count.raceTraitsStripped}</b>)</div>`;
  content += `<div class="card-line">Helmets −1 Perception${v}: <b>${count.helmets}</b>, armor notes cleaned: <b>${count.notes}</b></div>`;
  content += `<div class="card-line">Texts (Aura → Spirit, Sunsign → Zodiac Sign)${v}: <b>${count.texts}</b></div>`;
  content += `<div class="card-line">Awareness macros added${v}: <b>${count.macros}</b></div>`;
  if ( listed.length ) {
    content += `<hr class="card-sep"><div class="card-line"><b>Check by hand (${listed.length}):</b></div>`;
    for ( const l of listed.slice(0, 12) ) content += `<div class="card-line">${esc(l.where)}: ${esc(l.why)}</div>`;
  }
  if ( errors.length ) {
    content += `<hr class="card-sep"><div class="card-line broken"><b>${errors.length} error(s)</b> — see F12; fix and run again.</div>`;
    for ( const e of errors.slice(0, 10) ) content += `<div class="card-line">${esc(e.where)}: ${esc(e.error)}</div>`;
  }
  content += `<div class="card-line"><i>Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
