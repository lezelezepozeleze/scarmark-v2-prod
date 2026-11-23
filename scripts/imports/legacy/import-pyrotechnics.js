/**
 * Scarmark — Import: Pyrotechnics (2026-09-27)
 * --------------------------------------------
 * Source : Scarmark_Gear.xlsx (Alchemy sheet, folder "Pyrotechnics") + Scarmark_Alchemy.docx (H1 "Pyrotechnika").
 *
 * 1) Creates 5 WORLD Items with NO folder (sort them and drag them into the compendia yourself):
 *      gear    : Saltpeter, Black Powder, Petard
 *      missile : Fire Bomb II, Fire Bomb III   (thrown, CLOSE COMBAT, fire aspect, Oil Flask range)
 *    Create-missing-only: a name already present as a world Item or in scarmark.alchemy / scarmark.weapons /
 *    scarmark.gear is skipped, so re-running is safe.
 *
 * 2) Oil Flask (Throwing) rework: value 200 -> 15 Pf, Impact 6 -> 1 on every range band, new notes
 *    (minimal instant damage; setting the target on fire is up to the GM). Only value / impact / notes change,
 *    quantity and everything else stay. Applied to every copy by name: scarmark.weapons, world Items,
 *    world Actors, unlinked tokens on all scenes, and the scarmark.actors / scarmark.merchants compendia.
 *
 * 3) Smoke Bomb (scarmark.gear + world Items): fills notes / description ONLY when they are empty.
 *
 * HOW TO USE: Foundry (as GM) -> Macros -> new "Script" macro -> paste -> Execute.
 */
(async () => {
  if ( !game.user?.isGM ) return ui.notifications.error("Pyrotechnics import: must be run by a GM.");

  const ICON = "systems/scarmark/icons/gear/";
  const OIL_RANGE = { short: 10, medium: 15, long: 20, extreme: 30 };
  const bombNotes = (radius, impact, kit, recipe) =>
    `Light the fuse (Short Action), throw (CLOSE COMBAT): explodes in a ${radius} ft radius. `
    + `Target hit: ${impact} Fire Impact + Burning. Everyone else in the radius: DODGE test, `
    + `F = ${impact} Fire Impact (random location), CF = also Burning. `
    + `Miss = explodes next to the target (target tests DODGE too). Attack CF = explodes in your hand. `
    + `Alchemy Kit ${kit}. Recipe: ${recipe}`;

  const NEW_ITEMS = [
    {
      name: "Saltpeter", type: "gear", img: `${ICON}swap-bag-lorc.svg`,
      system: {
        weight: 0.1, value: 5, quantity: 1, consumable: false, carried: true,
        notes: "Used in: Black Powder, Smoke Bomb.", description: ""
      }
    },
    {
      name: "Black Powder", type: "gear", img: `${ICON}powder-lorc.svg`,
      system: {
        weight: 0.1, value: 15, quantity: 1, consumable: true, carried: true,
        notes: "1 dose = 1 firearm shot (Handgonne, Arquebus). Used in: Petard, Fire Bomb II, Fire Bomb III. "
          + "Must stay dry; ignites in fire.",
        description: "<p>Alchemy Kit I. A batch yields 4 doses.</p><hr>"
          + "<p>Recipe: 2x Saltpeter + Sulfur + Charcoal + 4x Flask (yields 4)</p>"
      }
    },
    {
      name: "Petard", type: "gear", img: "icons/svg/explosion.svg",
      system: {
        weight: 0.1, value: 40, quantity: 1, consumable: true, carried: true,
        notes: "Light the fuse (Short Action), throw up to 30 ft: everyone within 10 ft makes a Panic test, "
          + "animals a Fear test (a rider tests Riding when the mount bolts). No damage. "
          + "Affects each creature once per scene.",
        description: "<p>Alchemy Kit I.</p><hr><p>Recipe: Black Powder + Parchment + String</p>"
      }
    },
    {
      name: "Fire Bomb II", type: "missile", img: "icons/svg/fire.svg",
      system: {
        quantity: 1, weight: 0.5, value: 250, carried: true, container: "",
        quality: 2, velocity: "low", aspect: "fire", associatedSkill: "close",
        range: { ...OIL_RANGE }, impact: { short: 6, medium: 6, long: 6, extreme: 6 },
        notes: bombNotes(5, 6, "II", "Black Powder + 4x Lamp Oil + Sulfur + Flask")
      }
    },
    {
      name: "Fire Bomb III", type: "missile", img: "icons/svg/fire.svg",
      system: {
        quantity: 1, weight: 0.5, value: 500, carried: true, container: "",
        quality: 2, velocity: "low", aspect: "fire", associatedSkill: "close",
        range: { ...OIL_RANGE }, impact: { short: 8, medium: 8, long: 8, extreme: 8 },
        notes: bombNotes(10, 8, "III", "2x Black Powder + 4x Lamp Oil + Sulfur + Phosphorus + Flask")
      }
    }
  ];

  const OIL_NAME = "Oil Flask (Throwing)";
  const OIL_PATCH = {
    "system.value": 15,
    "system.impact": { short: 1, medium: 1, long: 1, extreme: 1 },
    "system.notes": "A flask of lamp oil (10 units). Splashes the target: minimal instant damage. "
      + "Setting the target on fire (Burning) is up to the GM."
  };

  const SMOKE_NAME = "Smoke Bomb";
  const SMOKE_NOTES = "Smash or throw up to 30 ft: smoke cloud 10 ft radius for 1d3+1 rounds, sight 5 ft into/out of/"
    + "through it (no missile fire through it); leaving the cloud allows an immediate STEALTH.";
  const SMOKE_DESC = "<p>Alchemy Kit I. Phosphorus ignites on contact with air, no flame needed.</p><hr>"
    + "<p>Recipe: Saltpeter + Sugar + Phosphorus + Flask</p>";

  const report = { created: [], skipped: [], oilFlask: [], smokeBomb: [] };

  // Run fn with the compendium unlocked, restoring the lock afterwards.
  const withPack = async (id, fn) => {
    const pack = game.packs.get(id);
    if ( !pack ) return;
    const wasLocked = pack.locked;
    if ( wasLocked ) await pack.configure({ locked: false });
    try { await fn(pack); } finally { if ( wasLocked ) await pack.configure({ locked: true }); }
  };

  // ---- 1) new items (world, no folder) ----
  const known = new Set(game.items.map(i => i.name));
  for ( const id of ["scarmark.alchemy", "scarmark.weapons", "scarmark.gear"] ) {
    const pack = game.packs.get(id);
    if ( pack ) for ( const e of await pack.getIndex() ) known.add(e.name);
  }
  const todo = NEW_ITEMS.filter(d => {
    if ( known.has(d.name) ) { report.skipped.push(d.name); return false; }
    return true;
  });
  if ( todo.length ) await Item.createDocuments(todo);
  report.created = todo.map(d => d.name);

  // ---- 2) Oil Flask (Throwing): every copy ----
  const isOil = i => i.name === OIL_NAME && i.type === "missile";
  const patchEmbedded = async (actor, where) => {
    const hits = actor.items.filter(isOil);
    if ( !hits.length ) return;
    await actor.updateEmbeddedDocuments("Item", hits.map(i => ({ _id: i.id, ...OIL_PATCH })));
    report.oilFlask.push(`${where}: ${actor.name}`);
  };

  await withPack("scarmark.weapons", async pack => {
    for ( const doc of await pack.getDocuments() ) {
      if ( !isOil(doc) ) continue;
      await doc.update(OIL_PATCH);
      report.oilFlask.push("scarmark.weapons");
    }
  });
  for ( const item of game.items.filter(isOil) ) {
    await item.update(OIL_PATCH);
    report.oilFlask.push(`world item${item.folder ? ` (${item.folder.name})` : ""}`);
  }
  for ( const actor of game.actors ) await patchEmbedded(actor, "actor");
  for ( const scene of game.scenes ) {
    for ( const token of scene.tokens ) {
      if ( token.actorLink || !token.actor ) continue;   // linked tokens = world actors, done above
      await patchEmbedded(token.actor, `token on "${scene.name}"`);
    }
  }
  for ( const id of ["scarmark.actors", "scarmark.merchants"] ) {
    await withPack(id, async pack => {
      for ( const actor of await pack.getDocuments() ) await patchEmbedded(actor, id);
    });
  }

  // ---- 3) Smoke Bomb: fill empty notes / description only ----
  const fillSmoke = async (item, where) => {
    const patch = {};
    if ( !item.system.notes?.trim() ) patch["system.notes"] = SMOKE_NOTES;
    if ( !item.system.description?.trim() ) patch["system.description"] = SMOKE_DESC;
    if ( !Object.keys(patch).length ) return;
    await item.update(patch);
    report.smokeBomb.push(where);
  };
  await withPack("scarmark.gear", async pack => {
    for ( const doc of await pack.getDocuments() ) if ( doc.name === SMOKE_NAME ) await fillSmoke(doc, "scarmark.gear");
  });
  for ( const item of game.items.filter(i => i.name === SMOKE_NAME) ) await fillSmoke(item, "world item");

  // ---- summary ----
  const li = arr => arr.length ? `<ul>${arr.map(s => `<li>${s}</li>`).join("")}</ul>` : "<p>none</p>";
  ChatMessage.create({
    whisper: [game.user.id],
    content: `<div class="scarmark-card test-card"><div class="card-title">Pyrotechnics import</div>`
      + `<div class="card-line"><b>Created (world, no folder):</b></div>${li(report.created)}`
      + (report.skipped.length ? `<div class="card-line"><b>Skipped (already exist):</b></div>${li(report.skipped)}` : "")
      + `<div class="card-sep"></div><div class="card-line"><b>${OIL_NAME} updated:</b></div>${li(report.oilFlask)}`
      + `<div class="card-line"><b>Smoke Bomb filled:</b></div>${li(report.smokeBomb)}</div>`
  });
  ui.notifications.info(`Pyrotechnics import: created ${report.created.length}, Oil Flask copies updated `
    + `${report.oilFlask.length}, Smoke Bomb filled ${report.smokeBomb.length}.`);
  console.log("Scarmark | Pyrotechnics import", report);
})();
