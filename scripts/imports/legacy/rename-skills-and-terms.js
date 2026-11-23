/**
 * Scarmark — Rename Skills & Terms (one-shot maintenance macro, 1.0.37)
 * ------------------------------------------------------------------------------
 * D. 2026-09-29: skills lose their ALL CAPS names, five skills get new
 * names, and several game terms change. Scarmark 1.0.37 already reads names case-
 * insensitively, so nothing breaks before you run this; the macro makes the data
 * match the new wording and fixes every Active Effect that points at a skill.
 *
 * What it does, in this system's compendia and the world's own compendia (locked
 * packs are unlocked and re-locked), world items, world actors and the own data of
 * unlinked tokens on every scene:
 *   1. Skill names: VITALITY, STEALTH, SWIMMING, DANCING, RHETORIC, INTRIGUE,
 *      SINGING, CLOSE COMBAT, DODGE, INITIATIVE, RANGED COMBAT, UNARMED COMBAT,
 *      FOLKLORE, PHYSICIAN, SURVIVAL become Vitality, Stealth, ... (any other skill
 *      whose name is all capitals gets the same treatment). Renames:
 *        Lovecraft (INTRIGUE) -> Charm (Intrigue)     Tarotry     -> Divination
 *        Legerdemain -> Sleight of Hand               Lockcraft   -> Lockpicking
 *        Animalcraft -> Animal Handling
 *      and the parent tags Courtwise / Streetwise (Intrigue), Villagewise (Folklore).
 *   2. Active Effects (effect compendia, items, actors, tokens): every change on
 *      system.mods.skill.<Skill Name> gets the new exact name, so two effects on
 *      one skill add up again (the old ALL CAPS / Title Case mix is gone).
 *   3. Texts (item descriptions, notes, psionic Misfire, effect descriptions):
 *      old skill names, Shock Roll -> Grit Roll, Counterstrike -> Counterattack,
 *      WQ / AQ / Weapon Quality / Armor Quality -> DUR / Weapon Durability / Armor
 *      Durability, Circle -> Class (invocations only), and wound-scale words in
 *      prose ("a Serious wound" -> "a Heavy wound", Minor -> Light, Grievous ->
 *      Dire, "Serious 3 burns" -> "Severe 3 burns").
 *   4. Wounds on actors and tokens: "Minor / Serious / Grievous  Cut / Stab / Burn"
 *      -> "Light / Heavy (Severe from Wound Level 3) / Dire  Cut / Stab / Burn".
 *      Blunt names (Bruise, Contusion, Fracture, Crush, Mortal ...) do not change.
 *   5. Roll tables (result texts, e.g. "a bonus to VITALITY" in D100 Physical Traits).
 * Listed only (not changed): macros that still mention an old name; poison grades
 * such as "Animal Poisoning (Grievous)" are left alone on purpose.
 *
 * Safe to repeat: it only acts on names and texts still in the old wording.
 *
 * HOW TO USE (GM, LOCAL world first, Scarmark 1.0.37-beta or later):
 *   1. Back up the world and commit the system packs.
 *   2. New Script macro -> paste this file -> Execute -> "Report only".
 *   3. Read the chat summary (details in the F12 console) -> run again -> "Apply".
 *   4. Reload the world (F5) so the effect-key list picks up the new skill names.
 *      Check a character, an NPC template, a potion and a race trait; commit the
 *      packs; upload the world to Molten.
 *   This replaces fix-skill-key-case.js: after this run every key already has the
 *   exact skill name.
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("Rename Skills & Terms: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Rename Skills & Terms: run this as the GM.");

  const SKILL_PREFIX = "system.mods.skill.";

  // Old name (lower case) -> new name. Every basal skill goes from ALL CAPS to Title Case.
  const RENAMES = {
    "vitality": "Vitality", "stealth": "Stealth", "swimming": "Swimming", "dancing": "Dancing",
    "rhetoric": "Rhetoric", "intrigue": "Intrigue", "singing": "Singing",
    "close combat": "Close Combat", "dodge": "Dodge", "initiative": "Initiative",
    "ranged combat": "Ranged Combat", "unarmed combat": "Unarmed Combat",
    "folklore": "Folklore", "physician": "Physician", "survival": "Survival",
    "lovecraft (intrigue)": "Charm (Intrigue)",
    "courtwise (intrigue)": "Courtwise (Intrigue)",
    "streetwise (intrigue)": "Streetwise (Intrigue)",
    "villagewise (folklore)": "Villagewise (Folklore)",
    "tarotry": "Divination",
    "legerdemain": "Sleight of Hand",
    "lockcraft": "Lockpicking",
    "animalcraft": "Animal Handling"
  };
  // Plain words of the renamed skills as they appear in prose.
  const WORD_RENAMES = [
    ["Lovecraft", "Charm"], ["Tarotry", "Divination"], ["Legerdemain", "Sleight of Hand"],
    ["Lockcraft", "Lockpicking"], ["Animalcraft", "Animal Handling"]
  ];
  const SHOUTED = ["CLOSE COMBAT", "RANGED COMBAT", "UNARMED COMBAT", "VITALITY", "STEALTH", "SWIMMING", "DANCING",
    "RHETORIC", "INTRIGUE", "SINGING", "DODGE", "INITIATIVE", "FOLKLORE", "PHYSICIAN", "SURVIVAL"];
  const SHOUTED_RE = new RegExp(`\\b(?:${SHOUTED.join("|")})\\b`, "g");

  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const titleCase = (s) => String(s).toLowerCase().replace(/(^|[\s(\-])([a-z])/g, (m, p, c) => p + c.toUpperCase());
  const isShout = (s) => /[A-Z]{3}/.test(s) && (s === String(s).toUpperCase());
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");

  /* -------------------------------------------- */
  /*  Pure converters                              */
  /* -------------------------------------------- */

  /** New name for a skill (or the tail of a skill effect key); the same string when nothing changes. */
  function newSkillName(name) {
    const raw = String(name ?? "");
    const key = raw.trim().toLowerCase();
    if ( Object.hasOwn(RENAMES, key) ) return RENAMES[key];
    if ( isShout(raw) ) return titleCase(raw);
    return raw;
  }

  const WOUND_NAME = /\b(Minor|Serious|Grievous) (Cut|Stab|Burn)\b/;
  /** New name for a wound item made by the old catalog (Serious splits by Wound Level: 3 and up is Severe). */
  function newInjuryName(name, woundLevel) {
    const m = String(name ?? "").match(WOUND_NAME);
    if ( !m ) return name;
    const tier = m[1] === "Minor" ? "Light" : m[1] === "Grievous" ? "Dire" : ((woundLevel ?? 0) >= 3 ? "Severe" : "Heavy");
    return name.replace(WOUND_NAME, `${tier} ${m[2]}`);
  }

  const woundWord = (m, tier, num, noun) => {
    const word = tier === "Minor" ? "Light" : tier === "Grievous" ? "Dire" : (num === "3" ? "Severe" : "Heavy");
    return `${word}${num ? ` ${num}` : ""} ${noun}`;
  };
  const TEXT_FIXES = [
    // Renamed skills in prose (capitalized and lower case).
    ...WORD_RENAMES.flatMap(([from, to]) => [
      [new RegExp(`\\b${from}\\b`, "g"), to],
      [new RegExp(`\\b${from.toLowerCase()}\\b`, "g"), to.toLowerCase()]
    ]),
    // ALL CAPS basal skills in prose.
    [SHOUTED_RE, (m) => titleCase(m)],
    // Terms.
    [/\bShock (Rolls?|rolls?)\b/g, "Grit $1"],
    [/\bIgnore Shock\b/g, "Ignore Grit"],
    [/\bCounterstrike(s?)\b/g, "Counterattack$1"],
    [/\bcounterstrike(s?)\b/g, "counterattack$1"],
    [/\b(?:WQ|AQ)\b/g, "DUR"],
    [/\bWeapon Quality\b/g, "Weapon Durability"],
    [/\bArmou?r Quality\b/g, "Armor Durability"],
    // Wound scale in prose (bleeding starts at Severe, so "Serious wound (bleeding)" is Severe).
    [/\bSerious (wound \(bleeding\))/g, "Severe $1"],
    [/\b(Minor|Serious|Grievous) (?:(\d) )?(wounds?|Wounds?|burns?)\b/g, woundWord]
  ];
  const INVOCATION_FIXES = [[/\bCircles\b/g, "Classes"], [/\bCircle\b/g, "Class"]];

  const fixText = (text, extra = []) => {
    let next = text;
    for ( const [re, to] of [...TEXT_FIXES, ...extra] ) next = next.replace(re, to);
    return next;
  };

  const OLD_RE = new RegExp(`\\b(?:${[...SHOUTED, "Lovecraft", "Tarotry", "Legerdemain", "Lockcraft", "Animalcraft", "Counterstrike", "Shock Roll"].join("|")})\\b`);

  /* -------------------------------------------- */
  /*  Setup                                        */
  /* -------------------------------------------- */

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Rename Skills & Terms" },
    content: `<p>Skills lose their ALL CAPS names (Vitality, Close Combat ...); Lovecraft → Charm, Tarotry → Divination,
      Legerdemain → Sleight of Hand, Lockcraft → Lockpicking, Animalcraft → Animal Handling; effect keys, texts and
      wound names follow (Grit Roll, Counterattack, DUR, Class, Light / Heavy / Severe / Dire).</p>
      <p>System and world compendia, world items and actors, unlinked tokens. <b>Back up the world first.</b></p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "apply", label: "Apply" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "apply";

  const count = { skills: 0, shouted: 0, keys: 0, effects: 0, texts: 0, wounds: 0 };
  const rows = [];        // { where, what, detail }
  const listed = [];      // { where, why }
  const errors = [];
  const note = (where, what, detail = "") => rows.push({ where, what, detail });
  const flagIt = (where, why) => listed.push({ where, why });

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Rename Skills & Terms failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  const changesPath = (src) => (Array.isArray(src.system?.changes) ? "system.changes" : "changes");

  /* -------------------------------------------- */
  /*  Document processors                          */
  /* -------------------------------------------- */

  /** Updates for a collection of ActiveEffects: skill keys and description texts. */
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
        const to = newSkillName(from);
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

  /** Item plan: skill or wound name, texts, effects. */
  function planItem(item, where) {
    const src = item._source ?? {};
    const u = {};
    if ( item.type === "skill" ) {
      const to = newSkillName(item.name);
      if ( to !== item.name ) {
        u.name = to;
        count.skills++;
        const known = Object.hasOwn(RENAMES, item.name.trim().toLowerCase());
        if ( !known ) { count.shouted++; flagIt(where, `skill "${item.name}" was not on the list; capitals removed → "${to}"`); }
        note(where, "skill renamed", `${item.name} → ${to}`);
      }
    }
    else if ( item.type === "injury" ) {
      const to = newInjuryName(item.name, src.system?.woundLevel);
      if ( to !== item.name ) {
        u.name = to;
        count.wounds++;
        note(where, "wound renamed", `${item.name} → ${to}`);
      }
    }
    const extra = item.type === "invocation" ? INVOCATION_FIXES : [];
    for ( const path of ["system.description", "system.notes", "system.misfire"] ) {
      const text = foundry.utils.getProperty(src, path);
      if ( typeof text !== "string" || !text ) continue;
      const next = fixText(text, extra);
      if ( next !== text ) { u[path] = next; count.texts++; note(where, "text", path.split(".")[1]); }
    }
    return { update: Object.keys(u).length ? u : null, effectUpdates: effectUpdates(item.effects, where) };
  }

  async function applyItemPlan(item, plan) {
    if ( plan.update ) await item.update(plan.update, { diff: false });
    if ( plan.effectUpdates.length ) await item.updateEmbeddedDocuments("ActiveEffect", plan.effectUpdates);
  }

  /** A stand-alone item (compendium or world). */
  async function processItem(item, where) {
    await guarded(where, async () => {
      const plan = planItem(item, where);
      if ( apply ) await applyItemPlan(item, plan);
    });
  }

  /** An actor: own effects and items. `only` limits an unlinked token to what its delta owns. */
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

  /** Unlinked token: only what its own delta owns. */
  async function processToken(scene, token) {
    const where = `Scene ${scene.name} › token ${token.name}`;
    const d = token.delta?._source ?? {};
    const only = {
      items: new Set((d.items ?? []).map(i => i._id)),
      effects: new Set((d.effects ?? []).map(e => e._id))
    };
    if ( only.items.size || only.effects.size ) await processActor(token.actor, where, only);
  }

  /** Result texts of a roll table. */
  async function processTable(table, where) {
    await guarded(where, async () => {
      const updates = [];
      for ( const r of table.results ) {
        const src = r._source ?? r;
        const u = {};
        for ( const f of ["name", "description"] ) {
          if ( typeof src[f] !== "string" || !src[f] ) continue;
          const next = fixText(src[f]);
          if ( next !== src[f] ) u[f] = next;
        }
        if ( Object.keys(u).length ) {
          updates.push({ _id: r.id ?? src._id, ...u });
          count.texts++;
          note(where, "table result text", Object.keys(u).join(", "));
        }
      }
      if ( apply && updates.length ) await table.updateEmbeddedDocuments("TableResult", updates);
    });
  }

  /** Macros are never edited, only listed when they still use an old name. */
  function scanMacro(macro, where) {
    if ( OLD_RE.test(macro.command ?? "") ) flagIt(where, "macro code still uses an old skill or term name");
  }

  /* -------------------------------------------- */
  /*  Run                                          */
  /* -------------------------------------------- */

  ui.notifications.info(`Rename Skills & Terms: ${apply ? "renaming" : "checking"}, please wait...`);

  for ( const pack of packs ) {
    if ( !["Item", "Actor", "ActiveEffect", "Macro", "RollTable"].includes(pack.documentName) ) continue;
    const label = `[${pack.metadata.label}]`;
    const wasLocked = pack.locked;
    try {
      const docs = await pack.getDocuments();
      if ( pack.documentName === "Macro" ) { docs.forEach(m => scanMacro(m, `${label} ${m.name}`)); continue; }
      if ( apply && wasLocked ) await pack.configure({ locked: false });
      if ( pack.documentName === "ActiveEffect" ) {
        const updates = effectUpdates(docs, label);
        if ( apply && updates.length ) await CONFIG.ActiveEffect.documentClass.updateDocuments(updates, { pack: pack.collection });
      }
      else if ( pack.documentName === "RollTable" ) {
        for ( const t of docs ) await processTable(t, `${label} ${t.name}`);
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
      console.error(`Scarmark | Rename Skills & Terms failed in ${pack.collection}`, err);
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
  for ( const m of game.macros ) scanMacro(m, `World macro ${m.name}`);
  for ( const t of game.tables ) await processTable(t, `World table ${t.name}`);

  /* -------------------------------------------- */
  /*  Report                                       */
  /* -------------------------------------------- */

  console.log(`Scarmark | Rename Skills & Terms (${apply ? "APPLY" : "REPORT"})`, count);
  if ( rows.length ) console.table(rows);
  if ( listed.length ) console.table(listed);
  if ( errors.length ) console.table(errors);

  const v = apply ? "" : " (would be)";
  let content = `<div class="scarmark-card"><div class="card-title">Rename Skills &amp; Terms — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Skills renamed${v}: <b>${count.skills}</b> (not on the list, capitals removed: <b>${count.shouted}</b>)</div>`;
  content += `<div class="card-line">Effect skill keys renamed${v}: <b>${count.keys}</b> in <b>${count.effects}</b> effects</div>`;
  content += `<div class="card-line">Texts changed${v}: <b>${count.texts}</b>, wounds renamed: <b>${count.wounds}</b></div>`;
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
