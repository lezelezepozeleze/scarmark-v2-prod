/**
 * Scarmark — Import: Mounts (Horse & War Horse)
 * ------------------------------------------------
 * Creates the two mount actors D. asked for, built on the **Animal V (XL)**
 * template (from Scarmark_NPC.xlsx → CREATURES: "Horse (Light)" and "War Horse",
 * both Animal V) + their concrete kit:
 *   Horse     — Hooves I; Animal Fur; Saddle, Bridle & Reins, Fodder.
 *   War Horse — Hooves II, Bite II; Animal Fur, Leather Barding (Horse); War Saddle, Fodder.
 * Mounts are their own actors (they were pulled out of the riders’ Gear column in
 * the 2026-09-22 review corrections). Drop one next to a mounted NPC.
 *
 * Actor type = "animal": 11 attributes, quadruped Armor Locations, Animal V skills
 * at their template ESL (5 formula skills pre-computed). Natural weapons/armor/gear
 * are copied from the scarmark.weapons / .armor / .gear compendia by name (trailing
 * flavour "(...)" is stripped when matching). Tokens are 2×2, scale 0.6, UNLINKED.
 *
 * HOW TO USE: Foundry (as GM) -> Macros -> new "Script" macro -> paste -> Execute.
 *   Re-running replaces same-named actors in the "NPC Templates" folder.
 */

const DATA = {
  "attributes": {
    "str": 26,
    "sta": 23,
    "dex": 11,
    "agl": 13,
    "int": 4,
    "aur": 10,
    "wil": 13,
    "eye": 14,
    "hrg": 16,
    "sml": 18,
    "voi": 8
  },
  "skills": [
    {
      "name": "VITALITY",
      "level": 99,
      "category": "physical",
      "attrs": [
        "sta",
        "sta",
        "wil"
      ]
    },
    {
      "name": "STEALTH",
      "level": 40,
      "category": "physical",
      "attrs": [
        "agl",
        "hrg",
        "wil"
      ]
    },
    {
      "name": "SWIMMING",
      "level": 45,
      "category": "physical",
      "attrs": [
        "str",
        "sta",
        "agl"
      ]
    },
    {
      "name": "MOBILITY",
      "level": 82,
      "category": "physical",
      "attrs": [
        "agl",
        "agl",
        "sta"
      ]
    },
    {
      "name": "AWARENESS",
      "level": 80,
      "category": "communication",
      "attrs": [
        "eye",
        "hrg",
        "sml"
      ]
    },
    {
      "name": "AWARENESS - PASSIVE",
      "level": 50,
      "category": "communication",
      "attrs": [
        "eye",
        "hrg",
        "sml"
      ]
    },
    {
      "name": "DODGE",
      "level": 65,
      "category": "combat",
      "attrs": [
        "agl",
        "agl",
        "agl"
      ]
    },
    {
      "name": "INITIATIVE",
      "level": 65,
      "category": "combat",
      "attrs": [
        "agl",
        "wil",
        "wil"
      ]
    },
    {
      "name": "UNARMED COMBAT",
      "level": 75,
      "category": "combat",
      "attrs": [
        "str",
        "dex",
        "agl"
      ]
    },
    {
      "name": "Tracking",
      "level": 75,
      "category": "craft",
      "attrs": [
        "eye",
        "sml",
        "wil"
      ]
    }
  ],
  "token": {
    "w": 2,
    "h": 2,
    "s": 0.6
  },
  "mounts": [
    {
      "name": "Horse",
      "species": "Riding horse (light) — Animal V (XL) mount.",
      "weapons": [
        "Hooves I"
      ],
      "armor": [
        "Animal Fur"
      ],
      "gear": [
        "Saddle",
        "Bridle & Reins",
        "Fodder"
      ]
    },
    {
      "name": "War Horse",
      "species": "War-trained warhorse — Animal V (XL) mount; trample & bite.",
      "weapons": [
        "Hooves II",
        "Bite II"
      ],
      "armor": [
        "Animal Fur",
        "Leather Barding (Horse)"
      ],
      "gear": [
        "War Saddle",
        "Fodder"
      ]
    }
  ]
};

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("Mounts import: must be run by a GM.");
  const FOLDER_NAME = "NPC Templates";

  const QUADRUPED = [
    ["Creature Head","creatureHead"],["Creature Neck","creatureNeck"],
    ["Creature Thorax","creatureThorax"],["Creature Abdomen","creatureAbdomen"],
    ["Creature Right Fore Leg","creatureForeLeg"],["Creature Left Fore Leg","creatureForeLeg"],
    ["Creature Right Hind Leg","creatureHindLeg"],["Creature Left Hind Leg","creatureHindLeg"],
    ["Tail","tail"]
  ];
  const armorLocationItems = () => {
    const canonAll = CONFIG.SCARMARK?.armorLocations ?? {};
    return QUADRUPED.flatMap(([name,type]) => {
      const canon = canonAll[type]; if (!canon) return [];
      return [{ name, type:"armorLocation", system:{ locationType:type, aim:{...canon.aim}, injury:{...canon.injury}, risk:{...canon.risk} } }];
    });
  };

  const norm = (s) => String(s).toLowerCase().replace(/[\u2010-\u2015\u2212]/g,"-").replace(/\s+/g," ").trim();
  const stripFlavor = (s) => s.replace(/\s*\([^)]*\)\s*$/,"").trim();

  // generic "copy an item from a pack by name" (skills carry a level override)
  const packCache = {};
  const getPack = async (id) => {
    if (packCache[id] !== undefined) return packCache[id];
    const p = game.packs.get(id); if (!p) { console.warn(`Scarmark | pack "${id}" not found`); return (packCache[id]=null); }
    const byName = new Map(); for (const e of await p.getIndex()) byName.set(norm(e.name), e._id);
    return (packCache[id] = { p, byName });
  };
  const copyItem = async (packId, name, level) => {
    const pk = await getPack(packId);
    if (pk) {
      let id = pk.byName.get(norm(name)) ?? pk.byName.get(norm(stripFlavor(name)));
      if (id) { const d = (await pk.p.getDocument(id)).toObject(); delete d._id; delete d.folder;
        if (level != null) { d.system = d.system ?? {}; d.system.level = level; } return d; }
    }
    console.warn(`Scarmark | "${name}" not found in ${packId}`); return null;
  };

  let folder = game.folders.find(f => f.type==="Actor" && f.name===FOLDER_NAME);
  if (!folder) folder = await Folder.create({ name: FOLDER_NAME, type: "Actor" });

  let created=0, replaced=0, missing=[];
  for (const m of DATA.mounts) {
    const dupes = game.actors.filter(a => a.name===m.name && a.folder?.id===folder.id);
    if (dupes.length) { await Actor.deleteDocuments(dupes.map(d=>d.id)); replaced+=dupes.length; }

    const items = [ ...armorLocationItems() ];
    for (const s of DATA.skills) {
      const d = await copyItem("scarmark.skills", s.name, s.level)
        ?? { name:s.name, type:"skill", system:{ category:s.category, attribute1:s.attrs[0], attribute2:s.attrs[1], attribute3:s.attrs[2], level:s.level } };
      items.push(d);
    }
    for (const w of m.weapons) { const d = await copyItem("scarmark.weapons", w); if (d) items.push(d); else missing.push(`${m.name}: weapon ${w}`); }
    for (const a of m.armor)   { const d = await copyItem("scarmark.armor",   a); if (d) items.push(d); else missing.push(`${m.name}: armor ${a}`); }
    for (const g of m.gear)    { const d = await copyItem("scarmark.gear",    g); if (d) items.push(d); else missing.push(`${m.name}: gear ${g}`); }

    const system = { attributes:{}, species:m.species };
    for (const [k,v] of Object.entries(DATA.attributes)) system.attributes[k] = { base:v };

    await Actor.create({
      name: m.name, type: "animal", folder: folder.id, system, items,
      prototypeToken: { name:m.name, actorLink:false, width:DATA.token.w, height:DATA.token.h, texture:{ scaleX:DATA.token.s, scaleY:DATA.token.s } },
      flags: { scarmark: { mount:true } }
    });
    created++;
  }
  ui.notifications.info(`Mounts: created ${created} actor(s)` + (replaced?` (replaced ${replaced})`:``)
    + ` in "${FOLDER_NAME}".` + (missing.length?` Missing items: ${missing.length} (see console).`:``));
  if (missing.length) console.warn("Scarmark | Mounts \u2014 items not found:", missing);
  console.log("Scarmark | Mounts import complete", { created, replaced });
})();
