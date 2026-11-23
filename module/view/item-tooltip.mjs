/**
 * What the item tooltip shows: a header (icon, name, type, quantity), badges for the unusual states and a few sections (facts, tables, bars, lists), then the notes. Pure: no Foundry globals; the text comes through the `context` functions, so the Node tests can check it.
 *
 * Only what is worth a glance is shown: a flag that is off, a specialization of 0 or a total equal to the single value is left out.
 */
import { ownWeight, itemWeight, contentsWeight, containerFill, directChildren } from "../rules/index.mjs";
import { ASPECT_LETTERS, RANGE_PENALTY } from "../config/index.mjs";
import { formatNumber, durabilityText } from "./format.mjs";
import { fillText } from "./inventory-view.mjs";

const ASPECTS = Object.keys(ASPECT_LETTERS);
const BANDS = Object.keys(RANGE_PENALTY);
const NOTES_LIMIT = 400;
/** Fractions of the original durability / of the capacity where the bar changes colour. */
const BAR_OK = 0.5;
const BAR_LOW = 0.25;
const BAR_FULL = 0.8;

/** Text of a rich-text (HTML) description: tags removed, block ends become line breaks, the common entities decoded. */
export function plainText(html) {
  return String(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The numbers of an aspect or range band table; "-" for a missing value and for -1 (not available). */
const cells = (table, keys) => keys.map(key => (table?.[key] === -1 ? "-" : formatNumber(table?.[key])));

/** How full something is, 0 to 1; null when there is nothing to compare with. */
const ratio = (value, whole) => (whole > 0 ? Math.max(0, Math.min(1, value / whole)) : null);

/**
 * @param {object} item the inventory item ({id, type, name, img, system})
 * @param {object[]} items every item of the same actor (for the container and its contents)
 * @param {{t: (key: string, data?: object) => string, typeLabel?: (type: string) => string, label?: (group: string, key: string) => string, coverageLabel?: (entry: object) => string, showDescription?: boolean}} context
 *        t looks up SCARMARK.Tooltip.<key>; typeLabel names an item type; label names a skill, aspect, band or velocity key; coverageLabel names an armor coverage entry; showDescription adds the (normally hidden) description of a gear item to the notes
 * @returns {{title: string, img: string, subtitle: string, quantity: string, badges: {text: string, tone: string}[], sections: object[], notes: string}}
 *          sections: {type: "facts", items: {label, value}[]} | {type: "table", head: string[], rows: {label, cells: string[]}[]} | {type: "bar", label, text, ratio, tone} | {type: "list", rows: {name, value}[]} | {type: "text", label, value}
 */
export function itemTooltip(item, items, { t, typeLabel = (type) => type, label = (group, key) => key, coverageLabel = (entry) => entry.type, showDescription = false }) {
  const sys = item.system ?? {};
  const quantity = Number(sys.quantity ?? 1);
  const kg = (value) => `${formatNumber(value)} kg`;
  const magical = Boolean(sys.rune || sys.artifact?.active);

  // Badges: only the states worth a glance.
  const badges = [];
  const badge = (text, tone) => badges.push({ text, tone });
  if (sys.rune) badge(t("rune"), "gold");
  else if (sys.artifact?.active) badge(t("artifact"), "gold");
  if (magical && sys.artifact?.attuned) badge(t("attuned"), "gold");
  if (item.type === "weapon" && sys.isShield) badge(t("shield"), "info");
  if (item.type === "weapon" && sys.broken) badge(t("broken"), "danger");
  if (item.type === "missile" && sys.magic) badge(t("magic"), "gold");
  if (sys.consumable) badge(t("consumable"), "plain");
  if (sys.usable) badge(t("usable"), "plain");
  if (sys.carried === false) badge(t("notCarried"), "muted");
  if (sys.container) badge(t("storedIn", { name: items.find(i => i.id === sys.container)?.name ?? t("unknown") }), "muted");

  // Sections.
  const sections = [];
  const facts = (...entries) => {
    const shown = entries.filter(([, value]) => value != null && value !== "").map(([name, value]) => ({ label: name, value: String(value) }));
    if (shown.length) sections.push({ type: "facts", items: shown });
  };
  const table = (head, ...rows) => sections.push({ type: "table", head, rows: rows.map(([name, values]) => ({ label: name, cells: values })) });
  const skill = () => (sys.associatedSkill ? `${label("skill", sys.associatedSkill)}${sys.specialization ? ` ${sys.specialization > 0 ? "+" : ""}${sys.specialization}` : ""}` : "");
  const aspectHead = ASPECTS.map(key => label("aspect", key));
  const bandHead = BANDS.map(key => label("band", key));
  // The class of a rune or an artifact joins the main facts of its item (a missile has its own magic class).
  const classFact = magical && item.type !== "missile" ? [[t("class"), sys.artifact?.class]] : [];

  switch (item.type) {
    case "weapon":
      facts([t("durability"), sys.quality], [t("attack"), sys.attack], [t("defense"), sys.defense], [t("skill"), skill()], ...classFact);
      table(aspectHead, [t("impact"), cells(sys.impact, ASPECTS)]);
      break;
    case "armor": {
      facts([t("layer"), sys.layer]);
      const share = ratio(sys.quality, sys.originalQuality);
      if (share !== null) sections.push({ type: "bar", label: t("durability"), text: durabilityText(sys.quality, sys.originalQuality), ratio: share, tone: share > BAR_OK ? "ok" : (share > BAR_LOW ? "warn" : "danger") });
      else facts([t("durability"), durabilityText(sys.quality, sys.originalQuality)]);
      table(aspectHead, [t("protection"), cells(sys.protection, ASPECTS)]);
      const places = [...(sys.coverage ?? [])].map(entry => coverageLabel(entry)).join(", ");
      if (places) sections.push({ type: "text", label: t("locations"), value: places });
      break;
    }
    case "missile":
      facts([t("durability"), sys.quality], [t("velocity"), label("velocity", sys.velocity)], [t("aspect"), label("aspect", sys.aspect)], [t("skill"), skill()], [t("class"), sys.magic ? sys.spellClass : ""]);
      table(bandHead, [t("range"), cells(sys.range, BANDS)], [t("impact"), cells(sys.impact, BANDS)]);
      break;
    case "container": {
      const fill = containerFill(items, item);
      const share = fill.capacity === null ? null : ratio(fill.used, fill.capacity);
      sections.push({ type: "bar", label: t("contents"), text: `${fillText(fill)} kg`, ratio: share, tone: fill.over ? "danger" : (share !== null && share > BAR_FULL ? "warn" : "ok") });
      const stored = directChildren(items, item.id);
      if (stored.length) sections.push({ type: "list", rows: stored.map(i => ({ name: i.name, value: `×${formatNumber(i.system?.quantity ?? 1)}` })) });
      else sections.push({ type: "text", label: "", value: t("empty") });
      break;
    }
    default:
      facts([t("toxicity"), sys.consumable && sys.toxicity > 0 ? sys.toxicity : ""], ...classFact);
  }

  // Weight and value: the total follows the single value in brackets only when it differs (quantity, or the contents of a container).
  const worth = (each, total, show) => (total === undefined || Number(total) === Number(each) ? show(each) : `${show(each)} (= ${show(total)})`);
  const totalWeight = item.type === "container" ? ownWeight(item) + contentsWeight(items, item.id) : itemWeight(item);
  facts(
    [t("weight"), sys.weight === undefined ? "" : worth(sys.weight, totalWeight, kg)],
    [t("value"), sys.value ? worth(sys.value, sys.totalValue, formatNumber) : ""]
  );

  const text = [sys.notes, showDescription ? plainText(sys.description) : ""].filter(Boolean).join("\n\n");
  return {
    title: item.name,
    img: item.img ?? "",
    subtitle: sys.rune ? t("rune") : typeLabel(item.type),
    quantity: sys.quantity !== undefined && quantity !== 1 ? `×${formatNumber(quantity)}` : "",
    badges,
    sections,
    notes: text.length > NOTES_LIMIT ? `${text.slice(0, NOTES_LIMIT)}…` : text
  };
}
