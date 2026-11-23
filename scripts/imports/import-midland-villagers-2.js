/**
 * Scarmark — Import: Midland NPCs, batch 2 (Villages, Wilds and Village Authorities)
 * ------------------------------------------------------------------
 * Creates 16 NPCs: Village Priest, Wandering Monk, Hermit, Witch Hunter, Village Craftsman, Miller, Wise Woman, Witch (token named Village Woman), Bailiff, Landlord, three Man-at-arms variants (Spear, Shield, Longbow), Tax Collector, Scribe and War Veteran (his army kit is stored, not carried).
 *
 * Actors are created directly in World Actors, in the folder
 * "Midland NPCs / <sub-folder>" (sub-folder per NPC, see the data).
 *
 * Each actor gets: the 9 attributes, the skills below (copied from the Skills
 * compendium, level set directly; a skill missing from the compendium is created
 * with its standard attributes instead), the default humanoid Armor Locations,
 * and its kit (weapons, armor, gear, coins) copied from the system compendia by
 * exact name, with quantities. Everyone also has Fist, Leg and Head (Unarmed
 * Combat). Items with a third entry 0 are put on the actor NOT carried (stored
 * somewhere). The background text goes to the Specialization field. Tokens are
 * NEUTRAL and unlinked; no token or portrait art is set (add it yourself).
 *
 * Items missing from a compendium are listed in the console and in the final
 * notification, never dropped silently.
 *
 * HOW TO USE: as GM, create a new "Script" macro, paste this, Execute.
 * Re-running replaces actors of this batch (same name + flag) in the folder.
 * ONE-TIME import: afterwards edit the actors in Foundry and move them to a
 * compendium by hand.
 */

const NPCS = [
  {"name": "Village Priest", "tier": "Common", "folder": "Villages & Wilds", "attrs": {"str": 9, "sta": 10, "dex": 9, "agl": 8, "wil": 11, "per": 10, "pre": 12, "int": 10, "spi": 11}, "skills": {"Vitality": 52, "Stealth": 29, "Close Combat": 29, "Unarmed Combat": 32, "Ranged Combat": 28, "Dodge": 24, "Initiative": 30, "Physician": 20, "Erminfried": 45}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Cloth Robe", 1], ["Cloth Hood", 1], ["Staff I", 1], ["Knife", 1], ["Book", 1], ["Candle", 3], ["Wine, common (bottle)", 2], ["Holy Water (Throwing)", 1], ["Purse", 1], ["Pfennig", 40]], "desc": "Erminfried priest without invocations, usually a mediocre cleric shelved in a village parish. Often a drunkard or a lecher, and quite often a fanatic."},
  {"name": "Wandering Monk", "tier": "Common", "folder": "Villages & Wilds", "attrs": {"str": 10, "sta": 11, "dex": 10, "agl": 10, "wil": 12, "per": 11, "pre": 11, "int": 10, "spi": 12}, "skills": {"Vitality": 57, "Stealth": 33, "Close Combat": 42, "Unarmed Combat": 40, "Ranged Combat": 31, "Dodge": 30, "Initiative": 34, "Physician": 35, "Erminfried": 55}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Cloth Robe", 1], ["Cloth Hood", 1], ["Staff II", 1], ["Knife", 1], ["Book", 1], ["Waterskin (water)", 1], ["Bread (Portion)", 2], ["Bedroll", 1], ["Pfennig", 6]], "desc": "Mendicant monk walking the roads with a staff, a prayer and an empty bowl."},
  {"name": "Hermit", "tier": "Common", "folder": "Villages & Wilds", "attrs": {"str": 9, "sta": 11, "dex": 9, "agl": 10, "wil": 13, "per": 13, "pre": 8, "int": 12, "spi": 12}, "skills": {"Vitality": 59, "Stealth": 51, "Close Combat": 32, "Unarmed Combat": 38, "Ranged Combat": 31, "Dodge": 30, "Initiative": 36, "Physician": 40, "Animal Handling": 45, "Alchemy": 30}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Hood", 1], ["Woolen Cloak", 1], ["Staff I", 1], ["Knife", 1], ["Snare", 2], ["Fishing kit", 1], ["Cooking Kit", 1], ["Tinderbox (flint & steel)", 1], ["Bedroll", 1], ["Dried meat (Portion)", 1], ["Book", 1], ["Pfennig", 3]], "desc": "Lives alone in the wilds, wise or mad, usually both. Knows the forest, herbs and animals, and wants to be left alone."},
  {"name": "Witch Hunter", "tier": "Veteran", "folder": "Villages & Wilds", "attrs": {"str": 12, "sta": 12, "dex": 12, "agl": 11, "wil": 13, "per": 12, "pre": 10, "int": 11, "spi": 9}, "skills": {"Vitality": 62, "Stealth": 36, "Close Combat": 54, "Unarmed Combat": 47, "Ranged Combat": 48, "Dodge": 44, "Initiative": 50, "Physician": 35, "Erminfried": 40}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Leather Cap", 1], ["Leather Coat", 1], ["Leather Gloves", 1], ["Falchion II", 1], ["Dagger", 1], ["Crossbow", 1], ["Bolt (Medium) I", 15], ["Bolt Case", 1], ["Manacles", 1], ["Rope, hemp (50 ft)", 1], ["Holy Water (Throwing)", 2], ["Holy Ash (Throwing)", 1], ["Torch", 2], ["Book", 1], ["Purse", 1], ["Pfennig", 25], ["Groschen", 2]], "desc": "Self-appointed hunter of mages and a believer in Erminfried, usually a fanatic without any standing in the Church."},
  {"name": "Village Craftsman", "tier": "Common", "folder": "Villages & Wilds", "attrs": {"str": 11, "sta": 11, "dex": 12, "agl": 10, "wil": 10, "per": 10, "pre": 9, "int": 10, "spi": 8}, "skills": {"Vitality": 54, "Stealth": 30, "Close Combat": 37, "Unarmed Combat": 44, "Ranged Combat": 33, "Dodge": 30, "Initiative": 30, "Physician": 22, "Handicraft": 55}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Cap", 1], ["Club II", 1], ["Knife", 1], ["Hammer", 1], ["Maintenance Kit (Blacksmith)", 1], ["Maintenance Kit (Clothier)", 1], ["Piece of Cloth", 1], ["Whetstone (personal)", 1], ["Purse", 1], ["Pfennig", 35]], "desc": "Average, capable village craftsman who repairs armor, weapons and clothing."},
  {"name": "Miller", "tier": "Common", "folder": "Villages & Wilds", "attrs": {"str": 12, "sta": 12, "dex": 10, "agl": 10, "wil": 11, "per": 12, "pre": 10, "int": 12, "spi": 8}, "skills": {"Vitality": 59, "Stealth": 43, "Close Combat": 38, "Unarmed Combat": 43, "Ranged Combat": 34, "Dodge": 30, "Initiative": 32, "Physician": 23, "Lockpicking": 30}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Cap", 1], ["Leather Vest", 1], ["Club II", 1], ["Knife", 1], ["Sack", 3], ["Scales & Weights", 1], ["Ledger", 1], ["Lockpick", 1], ["Purse", 1], ["Pfennig", 40], ["Groschen", 2]], "desc": "Miller who hears every rumor in the district and quietly works as a contact for the thieves' guild. Flour, scales and secret messages pass through his mill."},
  {"name": "Wise Woman", "tier": "Common", "folder": "Villages & Wilds", "attrs": {"str": 8, "sta": 10, "dex": 10, "agl": 9, "wil": 11, "per": 12, "pre": 10, "int": 12, "spi": 12}, "skills": {"Vitality": 52, "Stealth": 32, "Close Combat": 33, "Unarmed Combat": 36, "Ranged Combat": 30, "Dodge": 27, "Initiative": 31, "Physician": 50, "Alchemy": 50, "Arcane": 40}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Dress", 1], ["Cloth Hood", 1], ["Woolen Cloak", 1], ["Knife", 1], ["Healing Kit", 1], ["Bandage", 3], ["Leech", 2], ["Comb", 1], ["Purse", 1], ["Pfennig", 20]], "desc": "Village herbalist and healer, suspected of witchcraft by half the village and visited at night by the other half."},
  {"name": "Witch", "tier": "Veteran", "folder": "Villages & Wilds", "attrs": {"str": 8, "sta": 11, "dex": 10, "agl": 10, "wil": 14, "per": 13, "pre": 11, "int": 14, "spi": 15}, "skills": {"Vitality": 60, "Stealth": 49, "Close Combat": 42, "Unarmed Combat": 38, "Ranged Combat": 42, "Dodge": 40, "Initiative": 51, "Physician": 45, "Arcane": 65, "Alchemy": 50}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Dress", 1], ["Cloth Hood", 1], ["Woolen Cloak", 1], ["Knife", 1], ["Black Candle", 2], ["Vial with Blood", 1], ["Gem Dust", 1], ["Grimoire", 1], ["Purse", 1], ["Pfennig", 30]], "desc": "Disguised witch living as an ordinary village woman. Her real craft is hidden, and she is far more dangerous than she looks.", "token": "Village Woman"},
  {"name": "Bailiff", "tier": "Veteran", "folder": "Village Authorities", "attrs": {"str": 11, "sta": 11, "dex": 10, "agl": 10, "wil": 12, "per": 12, "pre": 13, "int": 12, "spi": 9}, "skills": {"Vitality": 57, "Stealth": 34, "Close Combat": 42, "Unarmed Combat": 42, "Ranged Combat": 44, "Dodge": 36, "Initiative": 46, "Physician": 34}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Fancy Clothes", 1], ["Fur Cap", 1], ["Woolen Cloak", 1], ["Leather Gloves", 1], ["Falchion II", 1], ["Dagger", 1], ["Purse", 1], ["Ledger", 1], ["Wax & Seal", 1], ["Parchment (sheet)", 2], ["Ink & quill", 1], ["Pfennig", 80], ["Groschen", 8], ["Gulden", 1]], "desc": "Village reeve, a fairly well-off man who keeps order and the lord's accounts. Dresses to show it."},
  {"name": "Landlord", "tier": "Elite", "folder": "Village Authorities", "attrs": {"str": 15, "sta": 14, "dex": 13, "agl": 12, "wil": 14, "per": 11, "pre": 13, "int": 11, "spi": 9}, "skills": {"Vitality": 70, "Stealth": 44, "Close Combat": 76, "Unarmed Combat": 60, "Ranged Combat": 65, "Dodge": 54, "Initiative": 60, "Physician": 35}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Plate Helmet Visor", 1], ["Mail Aventail (for helmet only)", 1], ["Padded Gambeson", 1], ["Brigandine Cuirass with a fauld", 1], ["Brigandine Full Arms", 1], ["Brigandine Gauntlets", 1], ["Mail Leggings", 1], ["Sword II", 1], ["Mace III", 1], ["Heater Shield", 1], ["Dagger", 1], ["Purse", 1], ["Pfennig", 100], ["Groschen", 20], ["Gulden", 3]], "desc": "Poorer knight and lord of the manor, with a few men-at-arms at his call. Proud, short of coin and quick with his sword."},
  {"name": "Man-at-arms (Spear)", "tier": "Veteran", "folder": "Village Authorities", "attrs": {"str": 13, "sta": 12, "dex": 11, "agl": 11, "wil": 12, "per": 11, "pre": 9, "int": 9, "spi": 8}, "skills": {"Vitality": 60, "Stealth": 34, "Close Combat": 58, "Unarmed Combat": 47, "Ranged Combat": 47, "Dodge": 44, "Initiative": 47, "Physician": 31}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Plate Helmet", 1], ["Mail Aventail (for helmet only)", 1], ["Padded Gambeson", 1], ["Cuirass with a fauld", 1], ["Cuir bouilli Full Arms", 1], ["Cuir bouilli Greaves", 1], ["Leather Gloves", 1], ["Spear III", 1], ["Falchion I", 1], ["Dagger", 1], ["Waterskin (water)", 1], ["Bread (Portion)", 1], ["Purse", 1], ["Pfennig", 40]], "desc": "Retainer of a larger estate or a small castle, armed with a spear."},
  {"name": "Man-at-arms (Shield)", "tier": "Veteran", "folder": "Village Authorities", "attrs": {"str": 13, "sta": 13, "dex": 11, "agl": 11, "wil": 12, "per": 11, "pre": 9, "int": 9, "spi": 8}, "skills": {"Vitality": 64, "Stealth": 34, "Close Combat": 61, "Unarmed Combat": 47, "Ranged Combat": 47, "Dodge": 44, "Initiative": 47, "Physician": 31}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Plate Helmet", 1], ["Mail Aventail (for helmet only)", 1], ["Padded Gambeson", 1], ["Cuirass with a fauld", 1], ["Cuir bouilli Full Arms", 1], ["Cuir bouilli Greaves", 1], ["Leather Gloves", 1], ["Sword I", 1], ["Heater Shield", 1], ["Dagger", 1], ["Waterskin (water)", 1], ["Bread (Portion)", 1], ["Purse", 1], ["Pfennig", 40]], "desc": "Retainer of a larger estate or a small castle, with sword and shield."},
  {"name": "Man-at-arms (Longbow)", "tier": "Veteran", "folder": "Village Authorities", "attrs": {"str": 12, "sta": 12, "dex": 12, "agl": 11, "wil": 12, "per": 12, "pre": 9, "int": 9, "spi": 8}, "skills": {"Vitality": 60, "Stealth": 35, "Close Combat": 54, "Unarmed Combat": 47, "Ranged Combat": 60, "Dodge": 44, "Initiative": 47, "Physician": 33}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Padded Cap", 1], ["Plate Helmet", 1], ["Padded Gambeson", 1], ["Leather Gloves", 1], ["Leather Greaves", 1], ["Bow (Longbow)", 1], ["Arrow (Longbow) I", 20], ["Arrow (Bodkin)", 6], ["Quiver", 1], ["Falchion I", 1], ["Dagger", 1], ["Waterskin (water)", 1], ["Bread (Portion)", 1], ["Purse", 1], ["Pfennig", 40]], "desc": "Archer in the retinue of a larger estate or a small castle."},
  {"name": "Tax Collector", "tier": "Common", "folder": "Village Authorities", "attrs": {"str": 9, "sta": 9, "dex": 10, "agl": 9, "wil": 11, "per": 11, "pre": 12, "int": 13, "spi": 8}, "skills": {"Vitality": 49, "Stealth": 31, "Close Combat": 28, "Unarmed Combat": 38, "Ranged Combat": 30, "Dodge": 27, "Initiative": 31, "Physician": 23}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Fancy Clothes", 1], ["Fur Cap", 1], ["Woolen Cloak", 1], ["Dagger", 1], ["Purse", 1], ["Ledger", 1], ["Scales & Weights", 1], ["Abacus", 1], ["Ink & quill", 1], ["Wax & Seal", 1], ["Small Chest", 1], ["Parchment (sheet)", 3], ["Gulden", 3], ["Groschen", 15]], "desc": "Official who collects the lord's dues and is thoroughly hated for it."},
  {"name": "Scribe", "tier": "Common", "folder": "Village Authorities", "attrs": {"str": 8, "sta": 9, "dex": 11, "agl": 9, "wil": 11, "per": 12, "pre": 10, "int": 13, "spi": 9}, "skills": {"Vitality": 49, "Stealth": 32, "Close Combat": 28, "Unarmed Combat": 38, "Ranged Combat": 31, "Dodge": 27, "Initiative": 31, "Physician": 24, "Language - Other": 40}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Cap", 1], ["Knife", 1], ["Ink & quill", 1], ["Parchment (sheet)", 5], ["Wax Tablet", 1], ["Book", 1], ["Ledger", 1], ["Candle", 2], ["Purse", 1], ["Pfennig", 15]], "desc": "Clerk and scribe in the service of the bailiff or the lord, ink-stained and underpaid."},
  {"name": "War Veteran", "tier": "Elite", "folder": "Villages & Wilds", "attrs": {"str": 14, "sta": 14, "dex": 13, "agl": 12, "wil": 14, "per": 11, "pre": 10, "int": 10, "spi": 9}, "skills": {"Vitality": 70, "Stealth": 44, "Close Combat": 74, "Unarmed Combat": 59, "Ranged Combat": 64, "Dodge": 54, "Initiative": 60, "Physician": 34}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Cap", 1], ["Knife", 1], ["Waterskin (water)", 1], ["Tinderbox (flint & steel)", 1], ["Purse", 1], ["Pfennig", 20], ["Groschen", 5], ["Padded Cap", 1, 0], ["Plate Helmet Visor", 1, 0], ["Padded Gambeson", 1, 0], ["Cuirass with a fauld", 1, 0], ["Brigandine Full Arms", 1, 0], ["Cuir bouilli Greaves", 1, 0], ["Leather Gloves", 1, 0], ["Poleaxe II", 1, 0], ["Falchion III", 1, 0], ["Dagger", 1, 0]], "desc": "Former soldier of the army, now living quietly in the village. His old gear lies packed away somewhere, not on his back."}
];

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("NPC import: must be run by a GM.");
  const BATCH = "midland-villagers-2";
  const PARENT = "Midland NPCs";
  const PACKS = ["weapons", "armor", "gear", "gear-funny", "valuables", "currencies", "alchemy"].map(n => `scarmark.${n}`);
  // Standard definitions, used only when the Skills compendium does not have the skill yet.
  const SKILL_DEFS = {
    "arcane": ["esoterics", "arcane", "int", "spi", "wil"],
    "handicraft": ["skill", "", "dex", "dex", "wil"],
    "erminfried": ["esoterics", "religion", "pre", "int", "str"],
    "alchemy": ["skill", "", "per", "int", "spi"],
    "animal handling": ["skill", "", "agl", "pre", "wil"],
    "lockpicking": ["skill", "", "dex", "per", "wil"],
    "language - other": ["skill", "", "int", "int", "wil"]
  };
  const norm = (s) => String(s).toLowerCase().replace(/[‐-―−]/g, "-").replace(/\s+/g, " ").trim();

  // folders
  const ensureFolder = async (name, parent) => {
    const hit = game.folders.find(f => f.type === "Actor" && f.name === name && (f.folder?.id ?? null) === (parent?.id ?? null));
    return hit ?? Folder.create({ name, type: "Actor", folder: parent?.id ?? null });
  };
  const parent = await ensureFolder(PARENT, null);
  const folders = {};
  for (const name of new Set(NPCS.map(n => n.folder))) folders[name] = await ensureFolder(name, parent);

  // pack indexes
  const index = new Map(); // normalized name -> {pack, id}
  for (const key of PACKS) {
    const pack = game.packs.get(key);
    if (!pack) { console.warn(`NPC import | pack ${key} not found`); continue; }
    for (const e of await pack.getIndex()) { const k = norm(e.name); if (!index.has(k)) index.set(k, { pack, id: e._id }); }
  }
  const skillPack = game.packs.get("scarmark.skills");
  if (!skillPack) return ui.notifications.error("NPC import: skills pack scarmark.skills not found.");
  const skillIndex = new Map((await skillPack.getIndex()).map(e => [norm(e.name), e._id]));

  const getItem = async (name) => {
    const hit = index.get(norm(name)); if (!hit) return null;
    const d = (await hit.pack.getDocument(hit.id)).toObject();
    delete d._id; delete d.folder; delete d.sort;
    return d;
  };
  const getSkill = async (name, level) => {
    const id = skillIndex.get(norm(name));
    if (id) {
      const d = (await skillPack.getDocument(id)).toObject();
      delete d._id; delete d.folder; delete d.sort;
      d.system.level = level;
      return d;
    }
    const def = SKILL_DEFS[norm(name)];
    if (!def) return null;
    const [category, kind, a1, a2, a3] = def;
    console.warn(`NPC import | skill "${name}" not in the Skills compendium, created from its standard definition`);
    return { name, type: "skill", system: { category, esotericKind: kind, attribute1: a1, attribute2: a2, attribute3: a3, level } };
  };

  const missing = [];
  let made = 0;
  for (const n of NPCS) {
    const folder = folders[n.folder];
    // replace a previous run of this batch
    for (const old of game.actors.filter(a => a.name === n.name && a.getFlag("scarmark", "npcBatch") === BATCH && a.folder?.id === folder.id)) await old.delete();

    const items = game.scarmark.defaultArmorLocationItems("npc");

    for (const [skill, level] of Object.entries(n.skills)) {
      const d = await getSkill(skill, level);
      if (!d) { missing.push(`${n.name}: skill ${skill}`); continue; }
      items.push(d);
    }
    for (const [name, qty, carried] of n.items) {
      const d = await getItem(name);
      if (!d) { missing.push(`${n.name}: item ${name}`); continue; }
      d.system.quantity = qty;
      // armor copied from the compendium: Original durability = Durability when the compendium has none
      if (d.type === "armor" && !(d.system.originalQuality > 0) && d.system.quality > 0) d.system.originalQuality = d.system.quality;
      if (carried === 0) d.system.carried = false;
      items.push(d);
    }

    const attributes = Object.fromEntries(Object.entries(n.attrs).map(([k, v]) => [k, { base: v }]));
    await Actor.create({
      name: n.name,
      type: "npc",
      folder: folder.id,
      system: { attributes, race: "Human", specialization: n.desc },
      prototypeToken: { name: n.token ?? n.name, actorLink: false, disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL },
      flags: { scarmark: { npcBatch: BATCH, tier: n.tier } },
      items
    });
    made++;
  }

  if (missing.length) console.warn("NPC import | not found:", missing);
  ui.notifications[missing.length ? "warn" : "info"](
    `NPC import: ${made} actors created in "${PARENT}"` + (missing.length ? `, ${missing.length} items/skills not found (see console F12)` : "."));
})();
