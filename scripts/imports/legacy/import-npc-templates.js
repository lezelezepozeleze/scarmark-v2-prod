/**
 * Scarmark — Import: NPC Templates (base "NPC types")
 * ---------------------------------------------------
 * Source : Scarmark_NPC.xlsx (RULES v1\Tables), sheet "NPC types" — the reworked
 *          base-template ruleset (humans 2026-09-18, creatures/animals 2026-09-19).
 * Creates ONE Actor per template row in a world "NPC Templates" parent folder,
 * sorted into sub-folders: Animals (0–VII), Creatures (I–VII), Common NPC
 * (0 Poor..5 Hero), Arcane NPC (Trained..Hero) and Invoker NPC (Trained..Hero).
 * Each actor gets the row's attributes, every listed skill at its
 * template ESL (the 5 formula skills — Vitality/Mobility/Awareness-Passive/Dodge/
 * Initiative — are pre-computed here), the default Armor Locations for its body
 * plan, and the prototype-token size the reworks specified for the XL+ tiers.
 *
 * These are PALETTES to duplicate from, per the "template + add-on" design: race,
 * psionics, gear and weapon specializations are added to a copy, not baked in here.
 *
 * Skills are copied from the "scarmark.skills" compendium when present (keeping SB
 * attributes / sunsign / description) and the template ESL is written onto
 * system.level; skills missing from the pack (Arcane Combat) and the two generic
 * caster columns fall back to a baked definition. The generic columns become
 * clearly-named placeholder skills — "Religion (choose ritual)" and
 * "Arcane (choose convocation)" — for you to rename to the concrete religion /
 * convocation. Actors are created UNLINKED (prototypeToken.actorLink = false), the
 * way NPC tokens are used in play.
 *
 * HOW TO USE: Foundry (as GM) -> Macros -> new "Script" macro -> paste -> Execute.
 *   Re-running replaces same-named templates in the folder (no duplicates).
 *   Then move the folder's actors into a compendium yourself if you want a library.
 *
 * GENERATED from the "NPC types" sheet (attributes + skills baked in below). To
 * refresh after the sheet changes, re-run the generator or ask Claude to regenerate.
 */

const TYPES = [
  {
    "name": "0 Poor",
    "actorType": "npc",
    "folder": "Common NPC",
    "attributes": {
      "str": 8,
      "sta": 8,
      "dex": 8,
      "agl": 8,
      "int": 8,
      "aur": 8,
      "wil": 8,
      "eye": 8,
      "hrg": 8,
      "sml": 8,
      "voi": 8,
      "com": 9,
      "mor": 9
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 40,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 25,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 25,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 20,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 40,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 30,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 15,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 20,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 20,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 20,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 22,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 24,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 24,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 20,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 32,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 22,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 15,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 22,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      }
    ],
    "optional": "Any craft/trade skill; Regional Lore; a weapon Specialization"
  },
  {
    "name": "1 Common",
    "actorType": "npc",
    "folder": "Common NPC",
    "attributes": {
      "str": 10,
      "sta": 10,
      "dex": 9,
      "agl": 9,
      "int": 9,
      "aur": 8,
      "wil": 10,
      "eye": 9,
      "hrg": 9,
      "sml": 9,
      "voi": 9,
      "com": 10,
      "mor": 10
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 50,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 32,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 32,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 28,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 47,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 38,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 19,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 28,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 28,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 28,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 32,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 27,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 29,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 30,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 47,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 30,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 22,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 30,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      }
    ],
    "optional": "Any craft/trade skill; Regional Lore; a weapon Specialization"
  },
  {
    "name": "2 Trained",
    "actorType": "npc",
    "folder": "Common NPC",
    "attributes": {
      "str": 12,
      "sta": 11,
      "dex": 11,
      "agl": 11,
      "int": 10,
      "aur": 9,
      "wil": 11,
      "eye": 10,
      "hrg": 9,
      "sml": 9,
      "voi": 10,
      "com": 10,
      "mor": 10
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 55,
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
        "level": 40,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 36,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 55,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 46,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 23,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 36,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 36,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 36,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 68,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 44,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 44,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 66,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 57,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 38,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 30,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 40,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      }
    ],
    "optional": "Any craft/trade skill; Regional Lore; a weapon Specialization"
  },
  {
    "name": "3 Experienced",
    "actorType": "npc",
    "folder": "Common NPC",
    "attributes": {
      "str": 14,
      "sta": 13,
      "dex": 12,
      "agl": 12,
      "int": 11,
      "aur": 9,
      "wil": 13,
      "eye": 11,
      "hrg": 10,
      "sml": 10,
      "voi": 10,
      "com": 10,
      "mor": 11
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 65,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 48,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 48,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 44,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 62,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 54,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 27,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 44,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 44,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 44,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 76,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 48,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 51,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 74,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 64,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 46,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 40,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 50,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      }
    ],
    "optional": "Any craft/trade skill; Regional Lore; a weapon Specialization"
  },
  {
    "name": "4 Master",
    "actorType": "npc",
    "folder": "Common NPC",
    "attributes": {
      "str": 15,
      "sta": 14,
      "dex": 13,
      "agl": 14,
      "int": 11,
      "aur": 10,
      "wil": 15,
      "eye": 12,
      "hrg": 11,
      "sml": 10,
      "voi": 11,
      "com": 11,
      "mor": 11
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 72,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 56,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 56,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 52,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 70,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 62,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 31,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 52,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 52,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 52,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 82,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 56,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 59,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 80,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 70,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 54,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 50,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 60,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      }
    ],
    "optional": "Any craft/trade skill; Regional Lore; a weapon Specialization"
  },
  {
    "name": "5 Hero",
    "actorType": "character",
    "folder": "Common NPC",
    "attributes": {
      "str": 17,
      "sta": 16,
      "dex": 14,
      "agl": 16,
      "int": 12,
      "aur": 10,
      "wil": 16,
      "eye": 13,
      "hrg": 11,
      "sml": 11,
      "voi": 12,
      "com": 12,
      "mor": 12
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 80,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 64,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 64,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 60,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 80,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 70,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 35,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 60,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 60,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 60,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 90,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 64,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 80,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 88,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 79,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 62,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 60,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 70,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      }
    ],
    "optional": "Any craft/trade skill; Regional Lore; a weapon Specialization"
  },
  {
    "name": "2.1 Invoker Trained",
    "actorType": "npc",
    "folder": "Invoker NPC",
    "attributes": {
      "str": 10,
      "sta": 10,
      "dex": 10,
      "agl": 10,
      "int": 11,
      "aur": 12,
      "wil": 12,
      "eye": 10,
      "hrg": 10,
      "sml": 9,
      "voi": 12,
      "com": 10,
      "mor": 12
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 54,
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
        "level": 40,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 36,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 50,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 46,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 23,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 42,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 36,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 42,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 50,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 40,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 34,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 50,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 50,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 38,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 30,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 40,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      },
      {
        "name": "Religion (choose ritual)",
        "level": 52,
        "category": "religion",
        "attrs": [
          "voi",
          "int",
          "aur"
        ],
        "placeholder": true
      }
    ],
    "optional": "2nd Religion Circle; Lovecraft; Intrigue; Physician"
  },
  {
    "name": "3.1 Invoker Experienced",
    "actorType": "npc",
    "folder": "Invoker NPC",
    "attributes": {
      "str": 10,
      "sta": 11,
      "dex": 10,
      "agl": 10,
      "int": 12,
      "aur": 13,
      "wil": 14,
      "eye": 11,
      "hrg": 10,
      "sml": 10,
      "voi": 13,
      "com": 10,
      "mor": 13
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 60,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 48,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 48,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 44,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 52,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 54,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 27,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 50,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 44,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 50,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 50,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 40,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 38,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 52,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 50,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 46,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 40,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 50,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      },
      {
        "name": "Religion (choose ritual)",
        "level": 62,
        "category": "religion",
        "attrs": [
          "voi",
          "int",
          "aur"
        ],
        "placeholder": true
      }
    ],
    "optional": "2nd Religion Circle; Lovecraft; Intrigue; Physician"
  },
  {
    "name": "4.1 Invoker Master",
    "actorType": "npc",
    "folder": "Invoker NPC",
    "attributes": {
      "str": 11,
      "sta": 12,
      "dex": 11,
      "agl": 11,
      "int": 13,
      "aur": 15,
      "wil": 15,
      "eye": 11,
      "hrg": 11,
      "sml": 10,
      "voi": 14,
      "com": 11,
      "mor": 15
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 65,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 56,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 56,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 52,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 57,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 62,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 31,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 58,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 52,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 58,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 55,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 44,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 55,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 55,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 55,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 54,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 50,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 60,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      },
      {
        "name": "Religion (choose ritual)",
        "level": 72,
        "category": "religion",
        "attrs": [
          "voi",
          "int",
          "aur"
        ],
        "placeholder": true
      }
    ],
    "optional": "2nd Religion Circle; Lovecraft; Intrigue; Physician"
  },
  {
    "name": "5.1 Invoker Hero",
    "actorType": "character",
    "folder": "Invoker NPC",
    "attributes": {
      "str": 12,
      "sta": 13,
      "dex": 12,
      "agl": 12,
      "int": 14,
      "aur": 16,
      "wil": 17,
      "eye": 12,
      "hrg": 11,
      "sml": 11,
      "voi": 15,
      "com": 12,
      "mor": 16
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 72,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 64,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 64,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 60,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 62,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 70,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 35,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 66,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 60,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 66,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 60,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 48,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 77,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 60,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 60,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 62,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 60,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 70,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      },
      {
        "name": "Religion (choose ritual)",
        "level": 82,
        "category": "religion",
        "attrs": [
          "voi",
          "int",
          "aur"
        ],
        "placeholder": true
      }
    ],
    "optional": "2nd Religion Circle; Lovecraft; Intrigue; Physician"
  },
  {
    "name": "2.2 Arcane Trained",
    "actorType": "npc",
    "folder": "Arcane NPC",
    "attributes": {
      "str": 9,
      "sta": 9,
      "dex": 10,
      "agl": 10,
      "int": 13,
      "aur": 14,
      "wil": 12,
      "eye": 10,
      "hrg": 10,
      "sml": 9,
      "voi": 10,
      "com": 10,
      "mor": 10
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 50,
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
        "level": 40,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 36,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 49,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 46,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 23,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 36,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 36,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 36,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 49,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 30,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 34,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 39,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 39,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Arcane Combat",
        "level": 74,
        "category": "combat",
        "attrs": [
          "int",
          "aur",
          "eye"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 46,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 36,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 40,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      },
      {
        "name": "Arcane (choose convocation)",
        "level": 54,
        "category": "magic",
        "attrs": [
          "int",
          "aur",
          "wil"
        ],
        "placeholder": true
      }
    ],
    "optional": "Alchemy; Ancient Language; a 2nd Convocation; Astrology"
  },
  {
    "name": "3.2 Arcane Experienced",
    "actorType": "npc",
    "folder": "Arcane NPC",
    "attributes": {
      "str": 10,
      "sta": 10,
      "dex": 11,
      "agl": 10,
      "int": 14,
      "aur": 15,
      "wil": 13,
      "eye": 11,
      "hrg": 10,
      "sml": 10,
      "voi": 10,
      "com": 10,
      "mor": 11
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 55,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 48,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 48,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 44,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 50,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 54,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 27,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 44,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 44,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 44,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 54,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 30,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 36,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 43,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 42,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Arcane Combat",
        "level": 80,
        "category": "combat",
        "attrs": [
          "int",
          "aur",
          "eye"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 54,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 46,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 50,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      },
      {
        "name": "Arcane (choose convocation)",
        "level": 64,
        "category": "magic",
        "attrs": [
          "int",
          "aur",
          "wil"
        ],
        "placeholder": true
      }
    ],
    "optional": "Alchemy; Ancient Language; a 2nd Convocation; Astrology"
  },
  {
    "name": "4.2 Arcane Master",
    "actorType": "npc",
    "folder": "Arcane NPC",
    "attributes": {
      "str": 10,
      "sta": 11,
      "dex": 11,
      "agl": 11,
      "int": 15,
      "aur": 16,
      "wil": 15,
      "eye": 11,
      "hrg": 11,
      "sml": 10,
      "voi": 11,
      "com": 11,
      "mor": 11
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 62,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 56,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 56,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 52,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 55,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 62,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 31,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 52,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 52,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 52,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 54,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 33,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 55,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 43,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 43,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Arcane Combat",
        "level": 84,
        "category": "combat",
        "attrs": [
          "int",
          "aur",
          "eye"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 62,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 56,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 60,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      },
      {
        "name": "Arcane (choose convocation)",
        "level": 74,
        "category": "magic",
        "attrs": [
          "int",
          "aur",
          "wil"
        ],
        "placeholder": true
      }
    ],
    "optional": "Alchemy; Ancient Language; a 2nd Convocation; Astrology"
  },
  {
    "name": "5.2 Arcane Hero",
    "actorType": "character",
    "folder": "Arcane NPC",
    "attributes": {
      "str": 11,
      "sta": 12,
      "dex": 12,
      "agl": 12,
      "int": 17,
      "aur": 18,
      "wil": 16,
      "eye": 12,
      "hrg": 11,
      "sml": 11,
      "voi": 12,
      "com": 12,
      "mor": 12
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 67,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 64,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 64,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "DANCING",
        "level": 60,
        "category": "physical",
        "attrs": [
          "dex",
          "agl",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 60,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 70,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 35,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "RHETORIC",
        "level": 60,
        "category": "communication",
        "attrs": [
          "voi",
          "int",
          "com"
        ]
      },
      {
        "name": "INTRIGUE",
        "level": 60,
        "category": "communication",
        "attrs": [
          "int",
          "aur",
          "wil"
        ]
      },
      {
        "name": "SINGING",
        "level": 60,
        "category": "communication",
        "attrs": [
          "hrg",
          "voi",
          "voi"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 59,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 36,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 74,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 47,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 47,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Arcane Combat",
        "level": 94,
        "category": "combat",
        "attrs": [
          "int",
          "aur",
          "eye"
        ]
      },
      {
        "name": "FOLKLORE",
        "level": 70,
        "category": "craft",
        "attrs": [
          "hrg",
          "int",
          "int"
        ]
      },
      {
        "name": "PHYSICIAN",
        "level": 66,
        "category": "craft",
        "attrs": [
          "dex",
          "eye",
          "int"
        ]
      },
      {
        "name": "SURVIVAL",
        "level": 70,
        "category": "craft",
        "attrs": [
          "sta",
          "dex",
          "int"
        ]
      },
      {
        "name": "Arcane (choose convocation)",
        "level": 84,
        "category": "magic",
        "attrs": [
          "int",
          "aur",
          "wil"
        ],
        "placeholder": true
      }
    ],
    "optional": "Alchemy; Ancient Language; a 2nd Convocation; Astrology"
  },
  {
    "name": "0 Animal",
    "actorType": "animal",
    "folder": "Animals",
    "attributes": {
      "str": 5,
      "sta": 6,
      "dex": 10,
      "agl": 18,
      "int": 4,
      "aur": 7,
      "wil": 8,
      "eye": 14,
      "hrg": 16,
      "sml": 18,
      "voi": 4
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 34,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 60,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 25,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 70,
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
        "level": 90,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 57,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 32,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Tracking",
        "level": 67,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "Venom (if venomous); Climbing; Flight (if winged)",
    "token": {
      "w": 1,
      "h": 1,
      "s": 0.5
    }
  },
  {
    "name": "1 Animal I",
    "actorType": "animal",
    "folder": "Animals",
    "attributes": {
      "str": 12,
      "sta": 13,
      "dex": 11,
      "agl": 17,
      "int": 5,
      "aur": 8,
      "wil": 10,
      "eye": 14,
      "hrg": 16,
      "sml": 18,
      "voi": 6
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 60,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 55,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 35,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 79,
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
        "level": 85,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 62,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 50,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Tracking",
        "level": 70,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "Venom (if venomous); Aquatic; Climbing; Flight (if winged)"
  },
  {
    "name": "2 Animal II",
    "actorType": "animal",
    "folder": "Animals",
    "attributes": {
      "str": 15,
      "sta": 15,
      "dex": 12,
      "agl": 16,
      "int": 5,
      "aur": 9,
      "wil": 11,
      "eye": 14,
      "hrg": 16,
      "sml": 18,
      "voi": 6
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 69,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 60,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 40,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 79,
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
        "level": 80,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 64,
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
        "level": 72,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "Venom (if venomous); Aquatic; Climbing; Flight (if winged)"
  },
  {
    "name": "3 Animal III",
    "actorType": "animal",
    "folder": "Animals",
    "attributes": {
      "str": 18,
      "sta": 17,
      "dex": 12,
      "agl": 15,
      "int": 5,
      "aur": 9,
      "wil": 12,
      "eye": 14,
      "hrg": 16,
      "sml": 18,
      "voi": 7
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 77,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 55,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 40,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 79,
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
        "level": 75,
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
        "level": 74,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "Venom (if venomous); Aquatic; Climbing; Flight (if winged)"
  },
  {
    "name": "4 Animal IV",
    "actorType": "animal",
    "folder": "Animals",
    "attributes": {
      "str": 22,
      "sta": 20,
      "dex": 11,
      "agl": 14,
      "int": 5,
      "aur": 9,
      "wil": 13,
      "eye": 14,
      "hrg": 16,
      "sml": 18,
      "voi": 7
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 89,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 45,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 40,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 80,
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
        "level": 70,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 67,
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
    "optional": "Venom (if venomous); Aquatic; Climbing; Flight (if winged)"
  },
  {
    "name": "5 Animal V (XL)",
    "actorType": "animal",
    "folder": "Animals",
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
    "optional": "Venom (if venomous); Aquatic; Climbing; Flight (if winged)",
    "token": {
      "w": 2,
      "h": 2,
      "s": 0.6
    }
  },
  {
    "name": "6 Animal VI (XXL)",
    "actorType": "animal",
    "folder": "Animals",
    "attributes": {
      "str": 30,
      "sta": 26,
      "dex": 10,
      "agl": 12,
      "int": 4,
      "aur": 11,
      "wil": 14,
      "eye": 14,
      "hrg": 16,
      "sml": 18,
      "voi": 8
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 110,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 30,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 40,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 84,
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
        "level": 36,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 67,
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
        "level": 77,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "Venom (if venomous); Aquatic; Climbing; Flight (if winged)",
    "token": {
      "w": 2,
      "h": 2,
      "s": 1.0
    }
  },
  {
    "name": "7 Animal VII (XXXL)",
    "actorType": "animal",
    "folder": "Animals",
    "attributes": {
      "str": 36,
      "sta": 30,
      "dex": 10,
      "agl": 11,
      "int": 8,
      "aur": 15,
      "wil": 17,
      "eye": 14,
      "hrg": 16,
      "sml": 18,
      "voi": 10
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 129,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 30,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 55,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 87,
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
        "level": 33,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 75,
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
        "level": 82,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "Venom (if venomous); Aquatic; Climbing; Flight (if winged)",
    "token": {
      "w": 3,
      "h": 3,
      "s": 0.75
    }
  },
  {
    "name": "1 Creature I",
    "actorType": "creature",
    "folder": "Creatures",
    "attributes": {
      "str": 8,
      "sta": 6,
      "dex": 11,
      "agl": 12,
      "int": 7,
      "aur": 7,
      "wil": 7,
      "eye": 11,
      "hrg": 11,
      "sml": 10,
      "voi": 8
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 32,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 50,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 25,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 50,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 42,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 21,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 60,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 48,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 44,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 60,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 40,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Tracking",
        "level": 40,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "a ranged weapon; Ambush/Trap-making; Intimidation"
  },
  {
    "name": "2 Creature II",
    "actorType": "creature",
    "folder": "Creatures",
    "attributes": {
      "str": 10,
      "sta": 9,
      "dex": 11,
      "agl": 13,
      "int": 8,
      "aur": 8,
      "wil": 9,
      "eye": 11,
      "hrg": 10,
      "sml": 10,
      "voi": 9
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 45,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 45,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 30,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 59,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 45,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 23,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 64,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 52,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 52,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 64,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 50,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Tracking",
        "level": 42,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "a ranged weapon; Ambush/Trap-making; Intimidation"
  },
  {
    "name": "3 Creature III",
    "actorType": "creature",
    "folder": "Creatures",
    "attributes": {
      "str": 12,
      "sta": 11,
      "dex": 12,
      "agl": 14,
      "int": 9,
      "aur": 9,
      "wil": 11,
      "eye": 11,
      "hrg": 11,
      "sml": 11,
      "voi": 10
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 55,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 42,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 35,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 65,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 50,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 25,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 72,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 56,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 60,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 70,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 60,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Tracking",
        "level": 45,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "a ranged weapon; Ambush/Trap-making; Intimidation"
  },
  {
    "name": "4 Creature IV",
    "actorType": "creature",
    "folder": "Creatures",
    "attributes": {
      "str": 16,
      "sta": 15,
      "dex": 12,
      "agl": 15,
      "int": 9,
      "aur": 10,
      "wil": 13,
      "eye": 12,
      "hrg": 12,
      "sml": 13,
      "voi": 11
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 72,
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
        "level": 40,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 75,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 55,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 28,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 80,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 60,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 69,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 80,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 70,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Tracking",
        "level": 50,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "a ranged weapon; Ambush/Trap-making; Intimidation"
  },
  {
    "name": "5 Creature V (XL)",
    "actorType": "creature",
    "folder": "Creatures",
    "attributes": {
      "str": 20,
      "sta": 18,
      "dex": 13,
      "agl": 12,
      "int": 10,
      "aur": 11,
      "wil": 15,
      "eye": 12,
      "hrg": 11,
      "sml": 11,
      "voi": 12
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 85,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 38,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 42,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 70,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 60,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 30,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 77,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 48,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 70,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 60,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 80,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Tracking",
        "level": 52,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "a ranged weapon; Ambush/Trap-making; Intimidation",
    "token": {
      "w": 2,
      "h": 2,
      "s": 0.6
    }
  },
  {
    "name": "6 Creature VI (XXL)",
    "actorType": "creature",
    "folder": "Creatures",
    "attributes": {
      "str": 24,
      "sta": 22,
      "dex": 9,
      "agl": 9,
      "int": 6,
      "aur": 11,
      "wil": 13,
      "eye": 11,
      "hrg": 11,
      "sml": 12,
      "voi": 11
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 95,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 25,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 30,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 67,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 45,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 23,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 70,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 27,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 59,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 59,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 82,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Tracking",
        "level": 40,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "Rock-throwing (Ranged); Intimidation; Sweep attack",
    "token": {
      "w": 2,
      "h": 2,
      "s": 1.0
    }
  },
  {
    "name": "7 Creature VII (XXXL)",
    "actorType": "creature",
    "folder": "Creatures",
    "attributes": {
      "str": 28,
      "sta": 26,
      "dex": 7,
      "agl": 6,
      "int": 10,
      "aur": 14,
      "wil": 16,
      "eye": 12,
      "hrg": 10,
      "sml": 10,
      "voi": 12
    },
    "skills": [
      {
        "name": "VITALITY",
        "level": 114,
        "category": "physical",
        "attrs": [
          "sta",
          "sta",
          "wil"
        ]
      },
      {
        "name": "STEALTH",
        "level": 18,
        "category": "physical",
        "attrs": [
          "agl",
          "hrg",
          "wil"
        ]
      },
      {
        "name": "SWIMMING",
        "level": 20,
        "category": "physical",
        "attrs": [
          "str",
          "sta",
          "agl"
        ]
      },
      {
        "name": "MOBILITY",
        "level": 64,
        "category": "physical",
        "attrs": [
          "agl",
          "agl",
          "sta"
        ]
      },
      {
        "name": "AWARENESS",
        "level": 48,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "AWARENESS - PASSIVE",
        "level": 24,
        "category": "communication",
        "attrs": [
          "eye",
          "hrg",
          "sml"
        ]
      },
      {
        "name": "CLOSE COMBAT",
        "level": 70,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "dex"
        ]
      },
      {
        "name": "DODGE",
        "level": 18,
        "category": "combat",
        "attrs": [
          "agl",
          "agl",
          "agl"
        ]
      },
      {
        "name": "INITIATIVE",
        "level": 64,
        "category": "combat",
        "attrs": [
          "agl",
          "wil",
          "wil"
        ]
      },
      {
        "name": "RANGED COMBAT",
        "level": 47,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "eye"
        ]
      },
      {
        "name": "UNARMED COMBAT",
        "level": 88,
        "category": "combat",
        "attrs": [
          "str",
          "dex",
          "agl"
        ]
      },
      {
        "name": "Tracking",
        "level": 35,
        "category": "craft",
        "attrs": [
          "eye",
          "sml",
          "wil"
        ]
      }
    ],
    "optional": "Rock-throwing (Ranged); Intimidation; Sweep attack",
    "token": {
      "w": 3,
      "h": 3,
      "s": 0.75
    }
  }
];

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("NPC Templates import: must be run by a GM.");

  const FOLDER_NAME = "NPC Templates";
  const SKILL_PACK  = "scarmark.skills";

  // Default Armor Location body plans (mirror of module/helpers/actor-setup.mjs).
  const HUMANOID = [
    ["Skull","skull"],["Face","face"],["Neck","neck"],
    ["Right Shoulder","shoulder"],["Left Shoulder","shoulder"],
    ["Right Upper Arm","upperArm"],["Left Upper Arm","upperArm"],
    ["Right Elbow","elbow"],["Left Elbow","elbow"],
    ["Right Forearm","forearm"],["Left Forearm","forearm"],
    ["Right Hand","hand"],["Left Hand","hand"],
    ["Thorax","thorax"],["Abdomen","abdomen"],
    ["Right Hip","hip"],["Left Hip","hip"],["Groin","groin"],
    ["Right Thigh","thigh"],["Left Thigh","thigh"],
    ["Right Knee","knee"],["Left Knee","knee"],
    ["Right Calf","calf"],["Left Calf","calf"],
    ["Right Foot","foot"],["Left Foot","foot"]
  ];
  const QUADRUPED = [
    ["Creature Head","creatureHead"],["Creature Neck","creatureNeck"],
    ["Creature Thorax","creatureThorax"],["Creature Abdomen","creatureAbdomen"],
    ["Creature Right Fore Leg","creatureForeLeg"],["Creature Left Fore Leg","creatureForeLeg"],
    ["Creature Right Hind Leg","creatureHindLeg"],["Creature Left Hind Leg","creatureHindLeg"],
    ["Tail","tail"]
  ];
  const PLANS = { character: HUMANOID, npc: HUMANOID, creature: HUMANOID, animal: QUADRUPED };
  const armorLocationItems = (actorType) => {
    const plan = PLANS[actorType]; if (!plan) return [];
    const canonAll = CONFIG.SCARMARK?.armorLocations ?? {};
    return plan.flatMap(([name, type]) => {
      const canon = canonAll[type];
      if (!canon) { console.warn(`Scarmark | armor location "${type}" missing from CONFIG`); return []; }
      return [{ name, type: "armorLocation", system: {
        locationType: type, aim: {...canon.aim}, injury: {...canon.injury}, risk: {...canon.risk}
      }}];
    });
  };

  // Skill sourcing: prefer the compendium copy, fall back to a baked definition.
  const normalize = (s) => String(s).toLowerCase().replace(/[\u2010-\u2015\u2212]/g, "-").replace(/\s+/g, " ").trim();
  const pack = game.packs.get(SKILL_PACK);
  const packByName = new Map();
  if (pack) { for (const e of await pack.getIndex()) packByName.set(normalize(e.name), e._id); }
  else console.warn(`Scarmark | skills pack "${SKILL_PACK}" not found \u2014 using baked skill definitions`);

  const buildSkill = async (s) => {
    let data = null;
    if (pack && !s.placeholder) {
      const id = packByName.get(normalize(s.name));
      if (id) { data = (await pack.getDocument(id)).toObject(); delete data._id; delete data.folder; }
    }
    if (!data) data = { name: s.name, type: "skill", system: {
      category: s.category, attribute1: s.attrs[0], attribute2: s.attrs[1], attribute3: s.attrs[2]
    }};
    data.system = data.system ?? {};
    data.system.level = s.level;           // write the template ESL onto the skill's SL
    return data;
  };

  // Parent folder + lazily-created thematic sub-folders under it.
  let parent = game.folders.find(f => f.type === "Actor" && f.name === FOLDER_NAME && !f.folder);
  if (!parent) parent = await Folder.create({ name: FOLDER_NAME, type: "Actor" });
  const subCache = {};
  const getFolder = async (name) => {
    if (!name) return parent;
    if (subCache[name]) return subCache[name];
    let f = game.folders.find(x => x.type === "Actor" && x.name === name && x.folder?.id === parent.id);
    if (!f) f = await Folder.create({ name, type: "Actor", folder: parent.id });
    return subCache[name] = f;
  };

  let created = 0, replaced = 0;
  for (const t of TYPES) {
    // Remove any prior import of this template (our flag), wherever it sits, so
    // re-runs (incl. flat→foldered migration) stay clean.
    const dupes = game.actors.filter(a => a.name === t.name && a.flags?.scarmark?.template);
    if (dupes.length) { await Actor.deleteDocuments(dupes.map(d => d.id)); replaced += dupes.length; }

    const skills = [];
    for (const s of t.skills) skills.push(await buildSkill(s));
    const items = [ ...armorLocationItems(t.actorType), ...skills ];

    const system = { attributes: {} };
    for (const [k, v] of Object.entries(t.attributes)) system.attributes[k] = { base: v };
    const note = `<p><em>Base template imported from the \u201cNPC types\u201d sheet \u2014 duplicate this and add race / psionics / gear.</em></p>`
      + `<p><strong>Suggested optional skills:</strong> ${t.optional || "\u2014"}</p>`;
    if (t.actorType === "creature" || t.actorType === "animal") system.specialAbilities = note;
    else if (t.actorType === "character") system.journal = note;

    const prototypeToken = { name: t.name, actorLink: false };
    if (t.token) {
      prototypeToken.width = t.token.w;
      prototypeToken.height = t.token.h;
      prototypeToken.texture = { scaleX: t.token.s, scaleY: t.token.s };
    }

    const fol = await getFolder(t.folder);
    await Actor.create({
      name: t.name,
      type: t.actorType,
      folder: fol.id,
      system,
      items,
      prototypeToken,
      flags: { scarmark: { template: true, optionalSkills: t.optional || "" } }
    });
    created += 1;
  }

  ui.notifications.info(`NPC Templates: imported ${created} template actor(s)`
    + (replaced ? ` (replaced ${replaced} existing)` : ``) + ` into "${FOLDER_NAME}" (Animals / Creatures / Common NPC / Arcane NPC / Invoker NPC).`);
  console.log("Scarmark | NPC Templates import complete", { created, replaced, folder: parent.id });
})();
