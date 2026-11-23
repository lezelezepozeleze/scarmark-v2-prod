// Fixture contexts for rendering the actor sheet parts. "full" fills every list and sets every flag so each branch of the templates renders; "empty" is the opposite.
import { SCARMARK } from "../../module/config.mjs";
import { FORM_LIMITS, ASPECT_LETTERS } from "../../module/config/index.mjs";
import { containerRows, chestGroups } from "../../module/view/inventory-view.mjs";

const item = (id, name, system) => ({ id, name, img: `icons/${id}.svg`, system });

function gearLists() {
  const gear = [
    item("g1", "Rope", { carried: true, quantity: 2, totalWeight: 0.125, notes: "50 ft", rune: false, consumable: true, artifact: { active: false, class: 1 } }),
    item("g2", "Lantern <b>", { carried: false, quantity: 1, totalWeight: 2, notes: "", rune: false, consumable: false, usable: true, artifact: { active: true, class: 2 } })
  ];
  const runes = [item("r1", "Rune of Ash", { carried: true, quantity: 1, totalWeight: 0.1, notes: "burns", rune: true, consumable: false, artifact: { active: false, class: 3 } })];
  const weapons = [
    item("w1", "Longsword", { carried: true, quantity: 1, totalWeight: 1.5, quality: 12, notes: "keen", rune: false, artifact: { active: false, class: 1 } }),
    item("w2", "Axe", { carried: false, quantity: 3, totalWeight: undefined, quality: 8, notes: "", rune: true, artifact: { active: false, class: 4 } })
  ];
  const missiles = [item("m1", "Arrows", { carried: true, quantity: 20, totalWeight: 0.5, notes: "bodkin" })];
  const armor = [
    item("a1", "Chain shirt", { carried: true, quantity: 1, totalWeight: 7.25, quality: 5, layer: 4, notes: "" }),
    item("a2", "Cap", { carried: false, quantity: 1, totalWeight: 0.8, quality: -1, layer: 3, notes: "worn" })
  ];
  const containers = [
    {
      id: "c1", name: "Backpack", img: "icons/c1.svg", quantity: 1, carried: true, maxCapacity: 20, contentWeight: 1.234, overCapacity: false,
      contents: [
        item("s1", "Potion", { quantity: 2, totalWeight: 0.4, notes: "red", consumable: true }),
        item("s2", "Stone", { quantity: 1, totalWeight: 1.5, notes: "", consumable: false })
      ]
    },
    { id: "c2", name: "Pouch", img: "icons/c2.svg", quantity: 1, carried: false, maxCapacity: 1, contentWeight: 3, overCapacity: true, contents: [] }
  ];
  return { gear, runes, weapons, missiles, armor, containers };
}

/** The container items of a fixture actor, with stored and orphaned items, shaped like the Foundry documents the view models read. */
function inventoryItems(full) {
  if (!full) return [];
  const doc = (id, type, sort, system, extra = {}) => ({ id, type, sort, name: id, img: `icons/${id}.svg`, system, ...extra });
  return [
    doc("c2", "container", 20, { quantity: 1, carried: false, weight: 0.5, totalWeight: 0.5, maxCapacity: 1, notes: "small <i>" }, { name: "Pouch" }),
    doc("c1", "container", 10, { quantity: 1, carried: true, weight: 1, totalWeight: 1, maxCapacity: 20, notes: "" }, { name: "Backpack" }),
    doc("s1", "gear", 0, { quantity: 2, weight: 0.2, totalWeight: 0.4, container: "c1", notes: "red" }, { name: "Potion" }),
    doc("s2", "weapon", 0, { quantity: 1, weight: 1.5, totalWeight: 1.5, container: "c2", notes: "" }, { name: "Dagger" }),
    doc("o1", "gear", 0, { quantity: 1, weight: 0.3, totalWeight: 0.3, container: "gone", notes: "lost" }, { name: "Gem" }),
    doc("c3", "container", 30, { quantity: 1, carried: true, weight: 2, totalWeight: undefined, notes: "" }, { name: "Chest" })
  ];
}

/**
 * The template context of one actor sheet part.
 *
 * @param {Function} Sheet the sheet class (its getters give attribute keys, birth block, subtitle)
 * @param {"full"|"empty"} variant
 * @param {string} partId the sheet part ("profile", "gear", ...)
 */
export function buildContext(Sheet, variant, partId) {
  const full = variant === "full";
  const proto = Sheet.prototype;
  const attributeKeys = proto.attributeKeys;
  const rows = { 1: [], 2: [] };
  attributeKeys.forEach((key, i) => rows[SCARMARK.attributes[key].row].push({
    key, label: SCARMARK.attributes[key].label, base: 10 + i, effective: full ? 9 + i : 0
  }));

  const lists = gearLists();
  const isChest = Sheet.DEFAULT_OPTIONS.classes.includes("container-actor");
  const inventory = inventoryItems(full);
  const subtitle = proto.subtitleField;

  return {
    document: { img: "icons/portrait.svg", name: full ? "Aldric <the> Bold" : "" },
    subtitleField: subtitle ? { name: `system.${subtitle.path}`, label: subtitle.label, value: full ? "Human" : "" } : undefined,
    system: {
      resources: { fatigue: full ? 3 : 0 },
      wl: full ? 2 : 0,
      burden: full ? 1 : 0,
      condition: { band: full ? "wounded" : "ok", value: full ? 7 : 12, max: 12, pct: full ? 58 : 100 },
      move: 9,
      load: { overMax: full, pct: full ? 130 : 40 },
      dob: { month: full ? "mar" : "", day: full ? "12" : "", year: full ? "1010" : "" },
      birthplace: full ? "Riverton" : "",
      personality: full ? "practical" : "",
      specialAbilities: full ? "<p>Breathes fire</p>" : "",
      journal: full ? "<p>Notes</p>" : "",
      maxCapacity: 40
    },
    conditionBarPct: full ? 58 : 100,
    tab: { id: partId, active: full },
    showBirthInfo: proto.showBirthInfo,
    showSpecialAbilities: proto.showSpecialAbilities,
    sunsignLabel: full ? "SCARMARK.Sunsign.pisces" : "",
    months: SCARMARK.months,
    personalities: SCARMARK.personalities,
    attributeRows: rows,
    physicalTraits: full ? [item("t1", "Strong", { notes: "+1" }), item("t2", "Tall", { notes: "" })] : [],
    psycheTraits: full ? [item("t3", "Brave", { notes: "always" })] : [],
    skillCategories: [
      { key: "combat", fullLabel: "SCARMARK.Skills.combat", piety: false, skills: full ? [item("k1", "Dodge", { sb: 10, level: 2, esl: 12, faithPoints: 0, notes: "n" })] : [] },
      { key: "esoterics", fullLabel: "SCARMARK.Skills.esoterics", piety: true, skills: full ? [item("k2", "Faith", { sb: 8, level: 1, esl: 9, faithPoints: 4, esotericKind: "religion", notes: "" })] : [] }
    ],
    combat: { fatigueSource: full ? 3 : 0, dodge: { skillId: "k1", esl: 12 }, loadOverMax: full, load: "20 / 30 kg (66 %)", endurance: 11 },
    esotericsStats: {
      willCapacity: 11, will: 12, spiritCapacity: 9, spirit: full ? 10 : 0,
      manyReligions: full,
      religions: full ? [{ id: "k2", name: "Faith", fp: 4 }, { id: "k4", name: "Old Ways", fp: 1 }] : []
    },
    meleeWeapons: full ? [{ id: "w1", name: "Longsword", qty: 1, wq: 12, a: 2, d: 1, spec: 0, b: 0, e: 6, p: 0, f: 0, asl: 55, dsl: 50, notes: "keen" }] : [],
    missileWeapons: full ? [{ id: "m1", name: "Shortbow", qty: 20, skillName: "Ranged", spec: 1, short: 2, medium: 4, long: 6, extreme: 8, asl: 48, notes: "" }] : [],
    injuries: full ? [
      { id: "i1", name: "Heavy Cut", severity: "Heavy", woundLevel: 2, mend: 3, heavy: true, notes: "left arm" },
      { id: "i2", name: "Bruise", severity: "Light", woundLevel: 1, mend: "MRN", heavy: false, notes: "" }
    ] : [],
    combatArmorLocations: full ? [{ id: "l1", name: "Head", layers: 2, b: 1, e: 2, p: 3, f: 0, notes: "helm" }] : [],
    spells: full ? [{ id: "e1", name: "Spark", magicType: "Fire", level: 2, esl: 40, notes: "" }] : [],
    invocations: full ? [{ id: "e2", name: "Blessing", religion: "Faith", circle: 1, esl: 50, notes: "" }] : [],
    psionics: full ? [{ id: "e3", name: "Push", sb: 8, level: 1, esl: 9, fatigue: 1, notes: "" }] : [],
    isOwner: full,
    limits: FORM_LIMITS,
    aspectLetters: Object.values(ASPECT_LETTERS),
    isChest,
    containerRows: isChest ? [] : containerRows(inventory),
    chest: isChest ? chestGroups(inventory) : { groups: [] },
    gearSummary: { weapon: 1.5, missile: 0.5, armor: 8.05, miscGear: 2.125, total: full ? 12.175 : 0, capacity: 40 },
    gearItems: full ? lists.gear : [],
    runeItems: full ? lists.runes : [],
    weaponItems: full ? lists.weapons : [],
    missileItems: full ? lists.missiles : [],
    armorItems: full ? lists.armor : [],
    armorDur: full ? { a1: { text: "5/10", current: 5, original: 10, title: "Original DUR from the compendium: Chain shirt" }, a2: { text: "-1/-", current: -1, original: "-", title: "not found" } } : {},
    containers: full ? lists.containers : [],
    effectCategories: full ? {
      passive: [{ id: "f1", name: "Strong", img: "icons/f1.svg", disabled: false, parent: { documentName: "Actor", name: "Aldric" }, sourceName: "Aldric" }],
      temporary: [],
      inactive: [{ id: "f2", name: "Poison", img: "icons/f2.svg", disabled: true, parent: { documentName: "Item", name: "Vial" }, sourceName: "Vial" }]
    } : { passive: [], temporary: [], inactive: [] }
  };
}
