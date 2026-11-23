/**
 * Scarmark — Convert to Metric Units (one-shot maintenance macro)
 * ----------------------------------------------------------------
 * D. 2026-09-28: Scarmark switches to metric units.
 *   - Weight: "ounces" (1 ounce = 0.5 kg)  ->  kilograms (x 0.5).
 *   - Tactical distances: feet  ->  metres (/ 5). Scarmark canon since 2026-08-27
 *     is 1 grid square = 5 ft = 1 m, so every range, light and move still covers
 *     the same number of squares as before. Whole metres only, rounded UP
 *     (Trident 8 / 14 / 22 / 35 ft -> 2 / 3 / 5 / 7 m).
 *   - Overland maps: miles  ->  kilometres (x 1.6); a 5-mile square becomes 8 km.
 *
 * What it converts, in this system's compendia and the world's own compendia
 * (locked packs are unlocked for the update and re-locked), world documents and
 * unlinked tokens on every scene:
 *   - Items: weight (gear, weapon, missile, armor, container), container Max
 *     Capacity, missile range bands.
 *   - Actors: Move, container-actor Max Capacity, prototype token vision / light.
 *   - Scenes measured in feet or miles: grid distance + units, and every distance
 *     stored in scene units - token vision, light, detection, occlusion and
 *     elevation; ambient light and sound radii; wall thresholds; elevations of
 *     tiles, drawings, notes, lights, sounds, regions and levels.
 *     Scenes in other units (Tarot Table, Notice Board, ...) are left alone.
 *   - Script macros that set token light or vision (Light Picker, Vision
 *     (Darkvision ...)): the numbers after "dim:", "bright:", "range:" and
 *     "N ft / fts / feet" in the name and code.
 * Module compendia are left alone.
 *
 * Every converted document gets flags.scarmark.metric, so an interrupted run can
 * simply be repeated. After a clean "Convert" the hidden world setting
 * scarmark.metricUnits is switched on: the system then reads item weights as kg.
 * Once it is on, "Convert" is refused (items created since then are already
 * metric and would be converted twice).
 *
 * HOW TO USE (GM), on the LOCAL world (the system compendia live in the system
 * folder, i.e. in the repository):
 *   1. Back up the world folder and commit the system packs.
 *   2. New Script macro -> paste this file -> Execute -> "Report only".
 *   3. Read the chat summary (details in the F12 console) -> run again -> "Convert".
 *   4. Check a few sheets and scenes, commit the packs, upload the world to Molten.
 * Requires Scarmark 1.0.34-beta or later.
 */
(async () => {
  const SYS = "scarmark";
  if ( game.system.id !== SYS ) return ui.notifications.error("Convert to Metric: this world does not run the Scarmark system.");
  if ( !game.user.isGM ) return ui.notifications.warn("Convert to Metric: run this as the GM.");

  let already;
  try { already = game.settings.get(SYS, "metricUnits"); }
  catch { return ui.notifications.error("Convert to Metric: update the Scarmark system to 1.0.34-beta or later first."); }

  const KG = 0.5;   // ounces -> kg
  const M = 0.2;    // feet -> metres (5 ft = 1 m)
  const KM = 1.6;   // miles -> km
  const FEET = new Set(["ft", "feet", "foot", "fts", "feets"]);
  const MILES = new Set(["mi", "mile", "miles", "mls"]);
  const SCENE_DOCS = ["Token", "AmbientLight", "AmbientSound", "Wall", "Tile", "Drawing", "Note", "Region", "Level"];

  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
  const kg = (v) => (typeof v === "number" ? round(v * KG, 5) : v);
  // Distances: tactical metres are whole grid squares, rounded UP (D. 2026-09-28:
  // a 1.6 m reach still reaches into the second square -> 2 m). Rounding to 6
  // places first drops float noise (25 x 0.2 = 5.000000000000001 must stay 5).
  // Kilometres keep two decimals (the map conversions are exact anyway).
  const dist = (v, f) => {
    if ( typeof v !== "number" ) return v;
    const x = round(v * f, 6);
    return f === M ? Math.ceil(x) : round(x, 2);
  };
  const flagged = (src) => !!src?.flags?.[SYS]?.metric;
  const FLAG = `flags.${SYS}.metric`;

  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === SYS;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Convert to Metric Units" },
    content: `<p>Weights: ounces &rarr; <b>kg</b> (&times; 0.5). Tactical distances: feet &rarr; <b>m</b> (&divide; 5, one square = 1 m).
      Overland maps: miles &rarr; <b>km</b> (&times; 1.6).</p>
      <p>System and world compendia, world items, actors, scenes, macros and unlinked tokens.
      <b>Back up the world first.</b></p>
      ${already ? "<p><b>This world is already metric:</b> only “Report only” is available.</p>" : ""}`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "convert", label: "Convert" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  if ( (mode === "convert") && already ) {
    return ui.notifications.warn("Convert to Metric: this world is already metric; nothing was converted.");
  }
  const apply = mode === "convert";

  const rows = [];      // { where, field, from, to }
  const errors = [];    // { where, error }
  const count = { items: 0, actors: 0, scenes: 0, sceneDocs: 0, macros: 0 };
  const scenesDone = [];      // "name: 5 ft -> 1 m"
  const scenesSkipped = [];   // "name (units)"

  /** Record a change into `u` (only when the value actually changes). */
  function put(u, where, key, from, to) {
    if ( from === to ) return;
    u[key] = to;
    rows.push({ where, field: key, from, to });
  }

  /* -------------------------------------------- */
  /*  Change builders (work on _source data)       */
  /* -------------------------------------------- */

  function itemChanges(src, where) {
    if ( flagged(src) ) return null;
    const s = src.system ?? {};
    const u = {};
    if ( typeof s.weight === "number" ) put(u, where, "system.weight", s.weight, kg(s.weight));
    if ( (src.type === "container") && (typeof s.maxCapacity === "number") ) {
      put(u, where, "system.maxCapacity", s.maxCapacity, kg(s.maxCapacity));
    }
    if ( (src.type === "missile") && s.range ) {
      for ( const b of ["short", "medium", "long", "extreme"] ) put(u, where, `system.range.${b}`, s.range[b], dist(s.range[b], M));
    }
    if ( !Object.keys(u).length ) return null;
    u[FLAG] = true;
    return u;
  }

  /** Vision / light / detection / occlusion distances of a token or prototype token. */
  function tokenDistances(u, t, f, where, prefix = "") {
    if ( !t ) return;
    if ( t.sight && (t.sight.range !== null) && (t.sight.range !== undefined) ) {
      put(u, where, `${prefix}sight.range`, t.sight.range, dist(t.sight.range, f));
    }
    if ( t.light ) {
      put(u, where, `${prefix}light.dim`, t.light.dim, dist(t.light.dim, f));
      put(u, where, `${prefix}light.bright`, t.light.bright, dist(t.light.bright, f));
    }
    const dm = t.detectionModes;
    if ( Array.isArray(dm) ) {
      const next = dm.map(m => ({ ...m, range: dist(m.range, f) }));
      if ( next.some((m, i) => m.range !== dm[i].range) ) put(u, where, `${prefix}detectionModes`, dm, next);
    }
    else if ( dm && (typeof dm === "object") ) {
      for ( const [id, m] of Object.entries(dm) ) {
        if ( typeof m?.range === "number" ) put(u, where, `${prefix}detectionModes.${id}.range`, m.range, dist(m.range, f));
      }
    }
    if ( typeof t.occludable?.radius === "number" ) {
      put(u, where, `${prefix}occludable.radius`, t.occludable.radius, dist(t.occludable.radius, f));
    }
  }

  function actorChanges(src, where) {
    if ( flagged(src) ) return null;
    const s = src.system ?? {};
    const u = {};
    const mv = s.resources?.move;
    if ( mv ) {
      put(u, where, "system.resources.move.value", mv.value, dist(mv.value, M));
      put(u, where, "system.resources.move.max", mv.max, dist(mv.max, M));
    }
    if ( (src.type === "container") && (typeof s.maxCapacity === "number") ) {
      put(u, where, "system.maxCapacity", s.maxCapacity, kg(s.maxCapacity));
    }
    tokenDistances(u, src.prototypeToken, M, where, "prototypeToken.");
    if ( !Object.keys(u).length ) return null;
    u[FLAG] = true;
    return u;
  }

  /** Changes for one document embedded in a scene, scaled by the scene's factor. */
  function sceneDocChanges(type, src, f, where) {
    if ( flagged(src) ) return null;
    const u = {};
    const elev = (key, v) => put(u, where, key, v, dist(v, f));
    switch ( type ) {
      case "Token":
        tokenDistances(u, src, f, where);
        elev("elevation", src.elevation);
        break;
      case "AmbientLight":
        put(u, where, "config.dim", src.config?.dim, dist(src.config?.dim, f));
        put(u, where, "config.bright", src.config?.bright, dist(src.config?.bright, f));
        elev("elevation", src.elevation);
        break;
      case "AmbientSound":
        put(u, where, "radius", src.radius, dist(src.radius, f));
        elev("elevation", src.elevation);
        break;
      case "Wall":
        for ( const k of ["light", "sight", "sound"] ) {
          const v = src.threshold?.[k];
          if ( typeof v === "number" ) put(u, where, `threshold.${k}`, v, dist(v, f));
        }
        break;
      case "Region":
      case "Level":
        for ( const k of ["bottom", "top"] ) {
          const v = src.elevation?.[k];
          if ( typeof v === "number" ) put(u, where, `elevation.${k}`, v, dist(v, f));
        }
        break;
      default:   // Tile, Drawing, Note
        elev("elevation", src.elevation);
    }
    if ( !Object.keys(u).length ) return null;
    u[FLAG] = true;
    return u;
  }

  /** Scale "dim: 10", "range: 30", "dim 10" and "30 fts" in a light / vision macro. */
  function macroChanges(src, where) {
    if ( flagged(src) || (src.type !== "script") ) return null;
    const cmd = src.command ?? "";
    // Only macros that set token light or vision.
    if ( !/\b(?:sight|light)\b/i.test(cmd) || !/\b(?:dim|bright|range)\b/.test(cmd) ) return null;
    const num = (n) => String(dist(Number(n), M));
    const feetText = (s) => s.replace(/(\d+(?:\.\d+)?)\s*(?:feets|feet|fts|ft)\b\.?/gi, (m, n) => `${num(n)} m`);
    const newCmd = feetText(cmd
      .replace(/\b(dim|bright|range)(\s*:\s*)(\d+(?:\.\d+)?)/g, (m, k, sep, n) => `${k}${sep}${num(n)}`)
      .replace(/\b(dim|bright)(\s+)(\d+(?:\.\d+)?)\b/g, (m, k, sep, n) => `${k}${sep}${num(n)}`));
    const newName = feetText(src.name);
    const u = {};
    if ( newName !== src.name ) put(u, where, "name", src.name, newName);
    if ( newCmd !== cmd ) {
      u.command = newCmd;
      const before = cmd.split("\n"), after = newCmd.split("\n");
      after.forEach((line, i) => { if ( line !== before[i] ) rows.push({ where, field: "command", from: before[i]?.trim(), to: line.trim() }); });
    }
    if ( !Object.keys(u).length ) return null;
    u[FLAG] = true;
    return u;
  }

  /** Feet or miles scene -> { f, units, label }; anything else -> null. */
  function sceneFactor(src) {
    const raw = String(src.grid?.units ?? "").trim();
    const unit = raw.toLowerCase().replace(/\.$/, "");
    const d = src.grid?.distance;
    if ( FEET.has(unit) || (!unit && (d === 5)) ) return { f: M, units: "m", label: `${d} ${raw || "(no unit)"} → ${round(d * M, 4)} m` };
    if ( MILES.has(unit) ) return { f: KM, units: "km", label: `${d} ${raw} → ${round(d * KM, 4)} km` };
    return null;
  }

  /* -------------------------------------------- */
  /*  Processors                                   */
  /* -------------------------------------------- */

  async function guarded(where, fn) {
    try { await fn(); }
    catch ( err ) {
      console.error(`Scarmark | Convert to Metric failed at ${where}`, err);
      errors.push({ where, error: err?.message ?? String(err) });
    }
  }

  /** Items of an actor (or only those in `onlyIds`), in one batch. */
  async function processActorItems(actor, where, onlyIds = null) {
    const updates = [];
    for ( const item of actor.items ) {
      if ( onlyIds && !onlyIds.has(item.id) ) continue;
      const u = itemChanges(item._source, `${where} › ${item.name}`);
      if ( u ) updates.push({ _id: item.id, ...u });
    }
    count.items += updates.length;
    if ( apply && updates.length ) await actor.updateEmbeddedDocuments("Item", updates);
  }

  async function processActor(actor, where) {
    await guarded(where, async () => {
      const u = actorChanges(actor._source, where);
      if ( u ) {
        count.actors++;
        if ( apply ) await actor.update(u);
      }
      await processActorItems(actor, where);
    });
  }

  async function processItem(item, where) {
    await guarded(where, async () => {
      const u = itemChanges(item._source, where);
      if ( !u ) return;
      count.items++;
      if ( apply ) await item.update(u);
    });
  }

  async function processMacro(macro, where) {
    await guarded(where, async () => {
      const u = macroChanges(macro._source, where);
      if ( !u ) return;
      count.macros++;
      if ( apply ) await macro.update(u);
    });
  }

  async function processScene(scene, where) {
    await guarded(where, async () => {
      const src = scene._source;
      // A converted scene stores its factor in the flag, so an interrupted run
      // can still finish its embedded documents (each flagged on its own).
      let f = src.flags?.[SYS]?.metric;
      if ( typeof f !== "number" ) {
        const sf = sceneFactor(src);
        if ( !sf ) {
          scenesSkipped.push(`${scene.name} (${src.grid?.distance} ${src.grid?.units || "no unit"})`);
          return;
        }
        f = sf.f;
        count.scenes++;
        scenesDone.push(`${scene.name}: ${sf.label}`);
        rows.push({ where, field: "grid", from: `${src.grid.distance} ${src.grid.units}`, to: `${round(src.grid.distance * f, 4)} ${sf.units}` });
        if ( apply ) await scene.update({ "grid.distance": round(src.grid.distance * f, 4), "grid.units": sf.units, [FLAG]: f });
      }
      for ( const type of SCENE_DOCS ) {
        const collection = scene.getEmbeddedCollection(type);
        if ( !collection?.size ) continue;
        const updates = [];
        for ( const doc of collection ) {
          const u = sceneDocChanges(type, doc._source, f, `${where} › ${type} ${doc.name ?? doc.id}`);
          if ( u ) updates.push({ _id: doc.id, ...u });
        }
        count.sceneDocs += updates.length;
        if ( apply && updates.length ) await scene.updateEmbeddedDocuments(type, updates);
      }
    });
  }

  /* -------------------------------------------- */
  /*  Run                                          */
  /* -------------------------------------------- */

  ui.notifications.info(`Convert to Metric: ${apply ? "converting" : "checking"}, please wait...`);

  // Compendia
  for ( const pack of packs ) {
    if ( !["Item", "Actor", "Scene", "Macro"].includes(pack.documentName) ) continue;
    const label = `[${pack.metadata.label}]`;
    const wasLocked = pack.locked;
    try {
      const docs = await pack.getDocuments();
      if ( apply && wasLocked ) await pack.configure({ locked: false });
      for ( const doc of docs ) {
        const where = `${label} ${doc.name}`;
        if ( pack.documentName === "Item" ) await processItem(doc, where);
        else if ( pack.documentName === "Actor" ) await processActor(doc, where);
        else if ( pack.documentName === "Scene" ) await processScene(doc, where);
        else await processMacro(doc, where);
      }
    }
    catch ( err ) {
      console.error(`Scarmark | Convert to Metric failed in ${pack.collection}`, err);
      errors.push({ where: label, error: err?.message ?? String(err) });
    }
    finally {
      if ( apply && wasLocked ) await pack.configure({ locked: true });
    }
  }

  // World documents
  for ( const item of game.items ) await processItem(item, `World item ${item.name}`);
  for ( const actor of game.actors ) await processActor(actor, `World actor ${actor.name}`);
  for ( const macro of game.macros ) await processMacro(macro, `World macro ${macro.name}`);
  for ( const scene of game.scenes ) await processScene(scene, `Scene ${scene.name}`);

  // Unlinked tokens: only what the token stores in its own delta (the rest is
  // inherited from the world actor, converted above). Token vision / light was
  // converted with its scene.
  for ( const scene of game.scenes ) {
    for ( const token of scene.tokens ) {
      if ( token.actorLink || !token.actor || !token.delta ) continue;
      const where = `Scene ${scene.name} › token ${token.name}`;
      await guarded(where, async () => {
        const d = token.delta._source ?? {};
        if ( !flagged(d) && d.system ) {
          const u = {};
          const mv = d.system.resources?.move;
          if ( mv ) {
            if ( typeof mv.value === "number" ) put(u, where, "system.resources.move.value", mv.value, dist(mv.value, M));
            if ( typeof mv.max === "number" ) put(u, where, "system.resources.move.max", mv.max, dist(mv.max, M));
          }
          if ( typeof d.system.maxCapacity === "number" ) put(u, where, "system.maxCapacity", d.system.maxCapacity, kg(d.system.maxCapacity));
          if ( Object.keys(u).length ) {
            u[FLAG] = true;
            count.actors++;
            if ( apply ) await token.actor.update(u);
          }
        }
        const own = new Set((d.items ?? []).map(i => i._id));
        if ( own.size ) await processActorItems(token.actor, where, own);
      });
    }
  }

  if ( apply && !errors.length ) await game.settings.set(SYS, "metricUnits", true);

  /* -------------------------------------------- */
  /*  Report                                       */
  /* -------------------------------------------- */

  console.log(`Scarmark | Convert to Metric (${apply ? "CONVERT" : "REPORT"}): ${rows.length} value(s)`);
  if ( rows.length ) console.table(rows);
  if ( errors.length ) console.table(errors);

  const verb = apply ? "converted" : "would be converted";
  let content = `<div class="scarmark-card"><div class="card-title">Convert to Metric — ${apply ? "done" : "report only"}</div>`;
  content += `<div class="card-line">Items ${verb}: <b>${count.items}</b></div>`;
  content += `<div class="card-line">Actors and unlinked tokens (Move, capacity, token vision / light): <b>${count.actors}</b></div>`;
  content += `<div class="card-line">Scenes: <b>${count.scenes}</b>, their tokens / lights / sounds / walls / tiles …: <b>${count.sceneDocs}</b></div>`;
  for ( const s of scenesDone ) content += `<div class="card-line">&nbsp;&nbsp;${esc(s)}</div>`;
  content += `<div class="card-line">Light / vision macros: <b>${count.macros}</b></div>`;
  if ( scenesSkipped.length ) {
    content += `<hr class="card-sep"><div class="card-line"><b>Scenes left alone (not in feet or miles):</b></div>`;
    for ( const s of scenesSkipped ) content += `<div class="card-line">&nbsp;&nbsp;${esc(s)}</div>`;
  }
  if ( errors.length ) {
    content += `<hr class="card-sep"><div class="card-line broken"><b>${errors.length} error(s)</b> — the world is NOT marked metric; fix and run “Convert” again (converted documents are skipped).</div>`;
    for ( const e of errors.slice(0, 10) ) content += `<div class="card-line">${esc(e.where)}: ${esc(e.error)}</div>`;
  }
  else if ( apply ) content += `<hr class="card-sep"><div class="card-line"><b>The world is now metric</b> (kg / m / km).</div>`;
  content += `<div class="card-line"><i>Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
