/**
 * Scarmark — Import: Midland NPCs, batch 1 (Villages & Wilds)
 * ------------------------------------------------------------------
 * Creates 13 NPCs: Farmer, Wench, Villager, Village Woman, Village Elder, Fisherman, Trapper, Hunter, Lumberjack, Militia I and three Militia II variants (Spear, Shield, Crossbow).
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
  {"name": "Farmer", "tier": "Poor", "attrs": {"str": 11, "sta": 11, "dex": 9, "agl": 9, "wil": 8, "per": 9, "pre": 8, "int": 8, "spi": 8}, "skills": {"Vitality": 50, "Stealth": 22, "Close Combat": 29, "Unarmed Combat": 34, "Ranged Combat": 20, "Dodge": 27, "Initiative": 25, "Physician": 13}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Cap", 1], ["Sickle", 1], ["Wooden Bowl", 1], ["Pfennig", 4]], "desc": "Serf toiling in the fields with little freedom of movement. A hard-worn farmhand with almost nothing to his name.", "folder": "Villages & Wilds"},
  {"name": "Wench", "tier": "Poor", "attrs": {"str": 8, "sta": 10, "dex": 10, "agl": 10, "wil": 9, "per": 10, "pre": 9, "int": 8, "spi": 8}, "skills": {"Vitality": 49, "Stealth": 25, "Close Combat": 28, "Unarmed Combat": 33, "Ranged Combat": 19, "Dodge": 30, "Initiative": 28, "Physician": 14}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Dress", 1], ["Cloth Cap", 1], ["Knife", 1], ["Comb", 1], ["Pfennig", 3]], "desc": "Serf girl working the fields and the farmstead, bound to the land with little freedom of movement.", "folder": "Villages & Wilds"},
  {"name": "Villager", "tier": "Common", "attrs": {"str": 10, "sta": 10, "dex": 10, "agl": 10, "wil": 10, "per": 10, "pre": 10, "int": 9, "spi": 9}, "skills": {"Vitality": 50, "Stealth": 30, "Close Combat": 35, "Unarmed Combat": 40, "Ranged Combat": 30, "Dodge": 30, "Initiative": 30, "Physician": 20}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Cap", 1], ["Leather Vest", 1], ["Knife", 1], ["Club I", 1], ["Purse", 1], ["Waterskin (water)", 1], ["Bread (Portion)", 1], ["Pfennig", 25]], "desc": "Free villager with a field, a trade or a flock. Can move freely and knows everyone's business.", "folder": "Villages & Wilds"},
  {"name": "Village Woman", "tier": "Common", "attrs": {"str": 8, "sta": 10, "dex": 10, "agl": 10, "wil": 10, "per": 11, "pre": 11, "int": 10, "spi": 9}, "skills": {"Vitality": 50, "Stealth": 31, "Close Combat": 33, "Unarmed Combat": 38, "Ranged Combat": 29, "Dodge": 30, "Initiative": 30, "Physician": 21}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Dress", 1], ["Cloth Hood", 1], ["Woolen Cloak", 1], ["Knife", 1], ["Purse", 1], ["Comb", 1], ["Bread (Portion)", 1], ["Pfennig", 20]], "desc": "Free village woman, keeps the household together and the gossip flowing.", "folder": "Villages & Wilds"},
  {"name": "Village Elder", "tier": "Veteran", "attrs": {"str": 10, "sta": 11, "dex": 10, "agl": 9, "wil": 14, "per": 12, "pre": 14, "int": 13, "spi": 11}, "skills": {"Vitality": 60, "Stealth": 35, "Close Combat": 36, "Unarmed Combat": 31, "Ranged Combat": 22, "Dodge": 29, "Initiative": 50, "Physician": 35, "Erminfried": 35, "Animal Handling": 40}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Woolen Clothes (Warm)", 1], ["Woolen Cloak", 1], ["Fur Cap", 1], ["Staff I", 1], ["Knife", 1], ["Purse", 1], ["Pipe", 1], ["Walking Staff", 1], ["Pfennig", 60], ["Groschen", 1]], "desc": "Oldest and most experienced villager, the one both neighbours and the lord's bailiff listen to.", "folder": "Villages & Wilds"},
  {"name": "Fisherman", "tier": "Common", "attrs": {"str": 12, "sta": 12, "dex": 10, "agl": 10, "wil": 10, "per": 11, "pre": 9, "int": 9, "spi": 8}, "skills": {"Vitality": 57, "Stealth": 31, "Close Combat": 38, "Unarmed Combat": 43, "Ranged Combat": 33, "Dodge": 30, "Initiative": 30, "Physician": 20}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Hood", 1], ["Knife", 1], ["Hatchet I", 1], ["Fishing kit", 1], ["Rope, hemp (50 ft)", 1], ["Sack", 1], ["Waterskin (water)", 1], ["Pfennig", 15]], "desc": "Fisherman of the village pond and the river, up before dawn and strong from hauling nets.", "folder": "Villages & Wilds"},
  {"name": "Trapper", "tier": "Common", "attrs": {"str": 11, "sta": 12, "dex": 11, "agl": 12, "wil": 11, "per": 13, "pre": 8, "int": 10, "spi": 8}, "skills": {"Vitality": 59, "Stealth": 54, "Close Combat": 39, "Unarmed Combat": 46, "Ranged Combat": 49, "Dodge": 36, "Initiative": 34, "Physician": 23, "Animal Handling": 35}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Fur Cap", 1], ["Leather Jacket", 1], ["Hatchet II", 1], ["Knife", 1], ["Bow (Shortbow)", 1], ["Arrow (Shortbow) I", 10], ["Quiver", 1], ["Snare", 3], ["Beartrap", 1], ["Waterskin (water)", 1], ["Trophy (Pelt)", 1], ["Pfennig", 20]], "desc": "Lives off snares, traps and pelts in the forest, quiet and patient.", "folder": "Villages & Wilds"},
  {"name": "Hunter", "tier": "Common", "attrs": {"str": 12, "sta": 12, "dex": 12, "agl": 12, "wil": 11, "per": 13, "pre": 8, "int": 10, "spi": 8}, "skills": {"Vitality": 59, "Stealth": 51, "Close Combat": 49, "Unarmed Combat": 48, "Ranged Combat": 56, "Dodge": 36, "Initiative": 34, "Physician": 24, "Animal Handling": 35}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Leather Cap", 1], ["Woolen Cloak", 1], ["Leather Greaves", 1], ["Bow (Longbow)", 1], ["Arrow (Longbow) I", 15], ["Spear I", 1], ["Knife", 1], ["Quiver", 1], ["Dried meat (Portion)", 2], ["Trophy (Pelt)", 1], ["Pfennig", 30]], "desc": "Hunts game with a longbow and knows the woods around the village.", "folder": "Villages & Wilds"},
  {"name": "Lumberjack", "tier": "Common", "attrs": {"str": 14, "sta": 13, "dex": 10, "agl": 9, "wil": 10, "per": 9, "pre": 8, "int": 8, "spi": 8}, "skills": {"Vitality": 60, "Stealth": 28, "Close Combat": 48, "Unarmed Combat": 49, "Ranged Combat": 33, "Dodge": 27, "Initiative": 29, "Physician": 18}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Cap", 1], ["Leather Vest", 1], ["Long Axe I", 1], ["Handaxe I", 1], ["Saw", 1], ["Whetstone (personal)", 1], ["Rope, hemp (50 ft)", 1], ["Waterskin (booze)", 1], ["Dried meat (Portion)", 1], ["Pfennig", 12]], "desc": "Fells trees for the village and the lord. Broad shoulders, a heavy axe and a thirst.", "folder": "Villages & Wilds"},
  {"name": "Militia I", "tier": "Poor", "attrs": {"str": 11, "sta": 11, "dex": 10, "agl": 10, "wil": 9, "per": 10, "pre": 9, "int": 8, "spi": 8}, "skills": {"Vitality": 52, "Stealth": 25, "Close Combat": 35, "Unarmed Combat": 37, "Ranged Combat": 21, "Dodge": 30, "Initiative": 28, "Physician": 14}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Cloth Cap", 1], ["Leather Cap", 1], ["Leather Vest", 1], ["Spear I", 1], ["Knife", 1], ["Waterskin (water)", 1], ["Pfennig", 8]], "desc": "Farm or small-village levy. Cloth, leather and a plain spear. Enough to scare off a wolf pack, not a bear, and elves simply shoot them.", "folder": "Villages & Wilds"},
  {"name": "Militia II (Spear)", "tier": "Common", "attrs": {"str": 12, "sta": 12, "dex": 11, "agl": 11, "wil": 11, "per": 11, "pre": 9, "int": 9, "spi": 8}, "skills": {"Vitality": 59, "Stealth": 33, "Close Combat": 48, "Unarmed Combat": 46, "Ranged Combat": 34, "Dodge": 37, "Initiative": 33, "Physician": 21}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Quilted Cap", 1], ["Quilted Gambeson (Harden)", 1], ["Leather Greaves", 1], ["Leather Gloves", 1], ["Knife", 1], ["Waterskin (water)", 1], ["Bread (Portion)", 1], ["Pfennig", 30], ["Spear II", 1]], "desc": "Spearman of the levy of a larger village. Quilted gambeson and a quilted cap, better paid than a farm levy but still no real armor.", "folder": "Villages & Wilds"},
  {"name": "Militia II (Shield)", "tier": "Common", "attrs": {"str": 13, "sta": 12, "dex": 11, "agl": 11, "wil": 11, "per": 11, "pre": 9, "int": 9, "spi": 8}, "skills": {"Vitality": 59, "Stealth": 33, "Close Combat": 49, "Unarmed Combat": 47, "Ranged Combat": 35, "Dodge": 37, "Initiative": 33, "Physician": 21}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Quilted Cap", 1], ["Quilted Gambeson (Harden)", 1], ["Leather Greaves", 1], ["Leather Gloves", 1], ["Knife", 1], ["Waterskin (water)", 1], ["Bread (Portion)", 1], ["Pfennig", 30], ["Round Shield", 1], ["Mace II", 1]], "desc": "Shield-bearer of the levy of a larger village, with a mace. Quilted gambeson and a quilted cap, better paid than a farm levy but still no real armor.", "folder": "Villages & Wilds"},
  {"name": "Militia II (Crossbow)", "tier": "Common", "attrs": {"str": 11, "sta": 12, "dex": 12, "agl": 11, "wil": 11, "per": 12, "pre": 9, "int": 9, "spi": 8}, "skills": {"Vitality": 59, "Stealth": 34, "Close Combat": 49, "Unarmed Combat": 46, "Ranged Combat": 41, "Dodge": 37, "Initiative": 33, "Physician": 22}, "items": [["Fist", 1], ["Leg", 1], ["Head", 1], ["Clothes", 1], ["Quilted Cap", 1], ["Quilted Gambeson (Harden)", 1], ["Leather Greaves", 1], ["Leather Gloves", 1], ["Knife", 1], ["Waterskin (water)", 1], ["Bread (Portion)", 1], ["Pfennig", 30], ["Crossbow", 1], ["Bolt (Medium) I", 20], ["Bolt Case", 1], ["Handaxe I", 1]], "desc": "Crossbowman of the levy of a larger village. Quilted gambeson and a quilted cap, better paid than a farm levy but still no real armor.", "folder": "Villages & Wilds"}
];

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("NPC import: must be run by a GM.");
  const BATCH = "midland-villagers-1";
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
