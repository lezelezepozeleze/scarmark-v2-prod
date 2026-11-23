/** Attributes and their legacy keys. Pure data (no Foundry globals). Owns the attribute list, the attribute key lists per actor type and the pre-1.0.36 key map. */

/**
 * The 9 attributes, in the display order used on the sheet.
 * `row` groups them for the Profile tab's two-row grid: body and will on row 1,
 * perception, presence and mind on row 2.
 */
export const ATTRIBUTES = {
  str: { label: "SCARMARK.Attribute.str", row: 1 },
  sta: { label: "SCARMARK.Attribute.sta", row: 1 },
  dex: { label: "SCARMARK.Attribute.dex", row: 1 },
  agl: { label: "SCARMARK.Attribute.agl", row: 1 },
  wil: { label: "SCARMARK.Attribute.wil", row: 1 },
  per: { label: "SCARMARK.Attribute.per", row: 2 },
  pre: { label: "SCARMARK.Attribute.pre", row: 2 },
  int: { label: "SCARMARK.Attribute.int", row: 2 },
  spi: { label: "SCARMARK.Attribute.spi", row: 2 }
};

/** Attributes only characters and NPCs have: creatures and animals have no Presence. Macros may read it as SCARMARK.characterOnlyAttributes. */
export const CHARACTER_ONLY_ATTRIBUTES = ["pre"];

/** Attribute keys per actor family: characters and NPCs have all 9, creatures and animals have no Presence. */
export const CHARACTER_ATTRIBUTE_KEYS = Object.keys(ATTRIBUTES);
export const CREATURE_ATTRIBUTE_KEYS = CHARACTER_ATTRIBUTE_KEYS.filter(key => !CHARACTER_ONLY_ATTRIBUTES.includes(key));

/** A skill or psionic talent is built on this many attributes (attribute1 to attribute3). */
export const SKILL_ATTRIBUTE_COUNT = 3;

/**
 * The 13 attributes before 1.0.36 and the one each folds into (data migration:
 * PER = average of EYE, HRG, SML; PRE = average of VOI, COM; SPI = AUR; MOR is
 * dropped). Used by migrateData and the one-shot migration macro.
 */
export const LEGACY_ATTRIBUTE_MAP = { eye: "per", hrg: "per", sml: "per", voi: "pre", com: "pre", aur: "spi" };
