/**
 * Scarmark — Fix Skill-Key Case (one-shot maintenance macro)
 * -------------------------------------------------------------
 * Active Effects that target one skill use the key `system.mods.skill.<Skill Name>`.
 * The name must match the skill EXACTLY, including case. Two effects on the same
 * skill whose keys differ only in case ("VITALITY" vs "Vitality") do NOT add up -
 * only one of them applies.
 *
 * SUPERSEDED in 1.0.37: skill names lost their ALL CAPS and rename-skills-and-terms.js
 * fixes every skill key together with the renames. Run that one first; this macro
 * stays only as a generic check for keys typed by hand later.
 *
 * This macro rewrites every such key to the canonical skill name, taken from the
 * skill and psionic items in this system's compendia. It fixes the effects in:
 *   - this system's compendia and the world's own compendia (Item, Actor and
 *     ActiveEffect packs; locked packs are unlocked for the update and re-locked),
 *   - world Items and world Actors (their own effects and their items' effects),
 *   - unlinked tokens on every scene (their own copies of items/effects).
 * Nothing needs to be re-imported. Module compendia are left alone.
 * Keys whose skill name matches no known skill at all are only listed.
 *
 * HOW TO USE (GM): new Script macro -> paste this file -> Execute.
 *   "Report only" lists what would change; "Fix" applies it.
 * The summary is whispered to you in chat; details are in the F12 console.
 */
(async () => {
  if ( !game.user.isGM ) return ui.notifications.warn("Fix Skill-Key Case: run this as the GM.");

  const PREFIX = "system.mods.skill.";
  const esc = (s) => Handlebars.escapeExpression(String(s ?? ""));
  const isSystemPack = (p) => p.metadata.packageType === "system" && p.metadata.packageName === game.system.id;
  const packs = game.packs.filter(p => isSystemPack(p) || p.metadata.packageType === "world");

  // --- Canonical names: skill + psionic items in this system's Item compendia ---
  const canon = new Map(); // lower-case name -> Set of exact names
  for ( const pack of game.packs.filter(p => isSystemPack(p) && p.documentName === "Item") ) {
    const index = await pack.getIndex({ fields: ["type"] });
    for ( const entry of index ) {
      if ( (entry.type !== "skill") && (entry.type !== "psionic") ) continue;
      const name = entry.name.trim();
      const low = name.toLowerCase();
      if ( !canon.has(low) ) canon.set(low, new Set());
      canon.get(low).add(name);
    }
  }
  if ( !canon.size ) return ui.notifications.error("Fix Skill-Key Case: no skills found in the system compendia.");

  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: "Fix Skill-Key Case" },
    content: `<p>Rewrite <code>${PREFIX}&lt;name&gt;</code> effect keys to the exact skill names
      (${canon.size} known skills) in system and world compendia, world items and actors, and unlinked tokens.</p>`,
    buttons: [
      { action: "report", label: "Report only", default: true },
      { action: "fix", label: "Fix" }
    ],
    rejectClose: false
  });
  if ( !mode ) return;
  const apply = mode === "fix";

  const fixes = [];          // { where, from, to }
  const unknown = new Map(); // name -> where (first seen)
  const ambiguous = new Set();

  /** Corrected copy of a changes array, or null when nothing needs fixing. */
  function fixChanges(changes, where) {
    let changed = false;
    const out = changes.map(change => {
      if ( !change?.key?.startsWith(PREFIX) ) return change;
      const name = change.key.slice(PREFIX.length);
      const names = canon.get(name.trim().toLowerCase());
      if ( !names ) {
        if ( !unknown.has(name) ) unknown.set(name, where);
        return change;
      }
      if ( names.size > 1 ) {
        ambiguous.add(name);
        return change;
      }
      const right = [...names][0];
      if ( right === name ) return change;
      changed = true;
      fixes.push({ where, from: name, to: right });
      return { ...change, key: PREFIX + right };
    });
    return changed ? out : null;
  }

  /** Update payloads for a collection of ActiveEffects. */
  function effectUpdates(effects, where) {
    const updates = [];
    for ( const effect of effects ) {
      const src = effect._source ?? {};
      const path = Array.isArray(src.system?.changes) ? "system.changes" : "changes";
      const changes = foundry.utils.getProperty(src, path) ?? [];
      const fixed = fixChanges(changes, `${where} › ${effect.name}`);
      if ( fixed ) updates.push({ _id: effect.id, [path]: fixed });
    }
    return updates;
  }

  async function processItem(item, where) {
    const updates = effectUpdates(item.effects, where);
    if ( apply && updates.length ) await item.updateEmbeddedDocuments("ActiveEffect", updates);
    return updates.length;
  }

  /**
   * Fix an actor's own effects and its items' effects. `only` restricts an
   * unlinked token to the copies stored in its own delta (the rest is inherited
   * from the world actor, which is fixed separately).
   */
  async function processActor(actor, where, only = null) {
    let n = 0;
    const effects = only ? actor.effects.filter(e => only.effects.has(e.id)) : actor.effects;
    const own = effectUpdates(effects, where);
    if ( apply && own.length ) await actor.updateEmbeddedDocuments("ActiveEffect", own);
    n += own.length;
    for ( const item of actor.items ) {
      if ( only && !only.items.has(item.id) ) continue;
      n += await processItem(item, `${where} › ${item.name}`);
    }
    return n;
  }

  // --- Compendia ---
  for ( const pack of packs ) {
    if ( !["Item", "Actor", "ActiveEffect"].includes(pack.documentName) ) continue;
    const label = `[${pack.metadata.label}]`;
    const docs = await pack.getDocuments();
    const wasLocked = pack.locked;
    if ( apply && wasLocked ) await pack.configure({ locked: false });
    try {
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
      console.error(`Scarmark | Fix Skill-Key Case failed in ${pack.collection}`, err);
      ui.notifications.error(`Fix Skill-Key Case: error in ${pack.metadata.label}, see console.`);
    }
    finally {
      if ( apply && wasLocked ) await pack.configure({ locked: true });
    }
  }

  // --- World items and actors ---
  for ( const item of game.items ) await processItem(item, `World item ${item.name}`);
  for ( const actor of game.actors ) await processActor(actor, `World actor ${actor.name}`);

  // --- Unlinked tokens: only the copies stored in the token's own delta ---
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

  // --- Report ---
  console.log(`Scarmark | Fix Skill-Key Case (${apply ? "FIX" : "REPORT"}): ${fixes.length} key(s)`);
  if ( fixes.length ) console.table(fixes);
  if ( unknown.size ) console.table([...unknown].map(([name, where]) => ({ name, where })));

  const pairs = new Map();
  for ( const f of fixes ) pairs.set(`${f.from} → ${f.to}`, (pairs.get(`${f.from} → ${f.to}`) ?? 0) + 1);
  let content = `<div class="scarmark-card"><div class="card-title">Fix Skill-Key Case — ${apply ? "fixed" : "report only"}</div>`;
  content += `<div class="card-line">${fixes.length} effect key(s) ${apply ? "rewritten" : "would be rewritten"}.</div>`;
  for ( const [pair, n] of pairs ) content += `<div class="card-line">${esc(pair)} &times;${n}</div>`;
  if ( unknown.size ) {
    content += `<hr class="card-sep"><div class="card-line"><b>Unknown skill names (not changed):</b></div>`;
    for ( const [name, where] of unknown ) content += `<div class="card-line">${esc(name)} <i>(${esc(where)})</i></div>`;
  }
  if ( ambiguous.size ) {
    content += `<hr class="card-sep"><div class="card-line"><b>Ambiguous (several skills differ only in case):</b> ${esc([...ambiguous].join(", "))}</div>`;
  }
  content += `<div class="card-line"><i>Details: F12 console.</i></div></div>`;
  await ChatMessage.create({ content, whisper: [game.user.id], speaker: { alias: "Scarmark" } });
})();
