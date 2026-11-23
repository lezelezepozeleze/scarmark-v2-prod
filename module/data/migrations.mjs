/**
 * Data migrations shared by several data models: old attribute keys of actors, skills and psionic talents. They run in memory in migrateData when old data loads; the one-shot macros (removed from the tree after 1.0.55, see git history) wrote the result back to the world. Every migration stays, a world may still hold old data (docs/AGENTS.md, persisted contract).
 */
import { LEGACY_ATTRIBUTE_MAP, LEGACY_SKILL_CATEGORIES } from "../config/index.mjs";

/**
 * migrateData helper: fold the pre-1.0.36 attributes into the 9 when a record
 * still has the old keys - PER = average of EYE, HRG, SML; PRE = average of VOI,
 * COM (VOI alone when COM is missing); SPI = AUR (see LEGACY_ATTRIBUTE_MAP).
 * Only fills a new key that is still missing, so migrated data is never touched.
 * Foundry drops the old keys on the next save; the migration macro
 * (migrate-attributes-penalties.js, now only in git history) persisted the new values.
 * @param {object} attributes  source.attributes (mutated)
 * @param {string[]} keys      the attribute keys of this actor type
 */
export function migrateLegacyAttributes(attributes, keys) {
  if (!attributes || (typeof attributes !== "object")) return;
  const value = (k) => Number(attributes[k]?.base);
  const average = (list) => {
    const vals = list.map(value).filter(Number.isFinite);
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  };
  const fill = (key, v) => {
    if (keys.includes(key) && !attributes[key] && Number.isFinite(v)) attributes[key] = { base: v };
  };
  fill("per", average(["eye", "hrg", "sml"]));
  fill("pre", average(["voi", "com"]));
  fill("spi", Number.isFinite(value("aur")) ? value("aur") : null);
}

/**
 * Migration shared by the skill and psionic item models: Skill Base attributes from before 1.0.36 (EYE, HRG, SML -> PER; VOI, COM -> PRE; AUR -> SPI via LEGACY_ATTRIBUTE_MAP) and the unused MOR -> WIL. Keeps an old compendium or world item loadable. Mutates `source` in place, like the migrateData hooks that call it.
 *
 * @param {object} source raw item system data
 */
export function migrateSkillAttributeKeys(source) {
  for (const key of ["attribute1", "attribute2", "attribute3"]) {
    const v = source[key];
    if (Object.hasOwn(LEGACY_ATTRIBUTE_MAP, v)) source[key] = LEGACY_ATTRIBUTE_MAP[v];
    else if (v === "mor") source[key] = "wil";
  }
}

/**
 * Migration of the skill item model (1.0.51): the six categories became three. Physical, Communication and Craft are now "skill"; Religion and Magic are "esoterics", and the old category survives as the esotericKind ("religion" / "arcane"). Mutates `source` in place.
 *
 * @param {object} source raw item system data
 */
export function migrateSkillCategory(source) {
  if (!Object.hasOwn(LEGACY_SKILL_CATEGORIES, source.category)) return;
  if (source.category === "religion") source.esotericKind ||= "religion";
  else if (source.category === "magic") source.esotericKind ||= "arcane";
  source.category = LEGACY_SKILL_CATEGORIES[source.category];
}
