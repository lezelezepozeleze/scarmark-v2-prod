/** The template context of the actor sheets: the Combat and Esoterics tab tables, built from the actor and its items (the Profile, Skills and Gear lists are view models in view/actor-view.mjs). */
import { SCARMARK } from "../config.mjs";
import { DODGE_SKILL } from "../config/index.mjs";
import { findEsotericSkill } from "../helpers/dice.mjs";
import { coveringArmor } from "../helpers/combat.mjs";
import { protectionSum, spellTarget, invocationTarget, locationSide, effectiveStat } from "../rules/index.mjs";
import { findSkillByName, weaponAsl, weaponDsl, missileAsl } from "../helpers/combat/lookup.mjs";
import { esotericsStatistics } from "../view/esoterics-stats.mjs";

/**
 * Build the Esoterics tab context: spells / invocations / psionics.
 *
 * @param {object} context the template context being built
 * @param {Actor} actor
 * @param {Item[]} items the actor's items in display order
 */
export function prepareEsoterics(context, actor, items) {
  // Same skill resolution as the rolls (rollSpell / rollInvocation): name match,
  // else the actor's only skill of that category ("All" invocations).
  const findSkill = (kind, name) => findEsotericSkill(actor, kind, name).skill;

  context.spells = items.filter(i => i.type === "spell").map(s => {
    const skill = findSkill("arcane", s.system.magicType);
    return {
      id: s.id, name: s.name,
      magicType: skill?.name ?? (s.system.magicType || "—"),
      level: s.system.level,
      esl: skill ? spellTarget(skill.system.esl, s.system.level) : 0,
      notes: s.system.notes
    };
  });

  context.invocations = items.filter(i => i.type === "invocation").map(inv => {
    const skill = findSkill("religion", inv.system.religion);
    return {
      id: inv.id, name: inv.name,
      religion: skill?.name ?? (inv.system.religion || "—"),
      circle: inv.system.circle,
      esl: skill ? invocationTarget(skill.system.esl, inv.system.circle) : 0,
      notes: inv.system.notes
    };
  });

  context.esotericsStats = esotericsStatistics(actor, items);

  context.psionics = items.filter(i => i.type === "psionic").map(p => ({
    id: p.id, name: p.name,
    fatigue: p.system.fatigue,
    sb: p.system.sb,
    level: p.system.level,
    esl: p.system.esl,
    notes: p.system.notes
  }));
}

/**
 * Build the Combat tab context: statistics + melee/missile/armor tables.
 *
 * @param {object} context the template context being built
 * @param {Actor} actor
 * @param {Item[]} items the actor's items in display order
 */
export function prepareCombat(context, actor, items) {
  const system = actor.system;
  if (!system.resources) return; // stat-less actors (e.g. Container) have no combat block
  const dodgeSkill = findSkillByName(actor, DODGE_SKILL);

  context.combat = {
    fatigue: system.resources.fatigue,
    fatigueSource: actor._source.system?.resources?.fatigue ?? system.resources.fatigue,
    endurance: system.endurance,
    // "32.7 / 30 kg (109 %)": carried kg against the capacity (STR + STA).
    load: system.load ? game.i18n.format("SCARMARK.Combat.loadFormat", { kg: Math.round(system.load.kg * 10) / 10, capacity: system.load.capacity, pct: system.load.pct }) : "",
    loadOverMax: !!system.load?.overMax,
    wl: system.wl,
    burden: system.burden,
    dodge: { esl: dodgeSkill?.system.esl ?? 0, skillId: dodgeSkill?.id ?? "" }
  };

  const asp = (v) => (v < 0 ? "—" : v); // -1 = weapon lacks this aspect
  context.meleeWeapons = items.filter(i => i.type === "weapon").map(w => {
    return {
      id: w.id, name: w.name, img: w.img,
      qty: w.system.quantity, wq: w.system.quality,
      a: effectiveStat(w.system, "attack"), d: effectiveStat(w.system, "defense"), spec: effectiveStat(w.system, "specialization"),
      b: asp(effectiveStat(w.system, "impact.blunt")), e: asp(effectiveStat(w.system, "impact.edged")),
      p: asp(effectiveStat(w.system, "impact.piercing")), f: asp(effectiveStat(w.system, "impact.fire")),
      asl: weaponAsl(actor, w),
      dsl: weaponDsl(actor, w),
      notes: w.system.notes
    };
  });

  context.missileWeapons = items.filter(i => i.type === "missile").map(m => ({
    id: m.id, name: m.name, img: m.img,
    qty: m.system.magic
      ? Math.floor((system.resources?.spiritCapacity ?? 0) / Math.max(1, m.system.spellClass ?? 1))
      : m.system.quantity,
    skillName: game.i18n.localize(SCARMARK.combatSkills[m.system.associatedSkill] ?? ""),
    short: `${m.system.range.short}/${m.system.impact.short}`,
    medium: `${m.system.range.medium}/${m.system.impact.medium}`,
    long: `${m.system.range.long}/${m.system.impact.long}`,
    extreme: `${m.system.range.extreme}/${m.system.impact.extreme}`,
    spec: m.system.specialization ?? 0,
    asl: missileAsl(actor, m),
    notes: m.system.notes
  }));

  // Armor Locations with protection summed from the WORN armor pieces covering
  // them (not packed in a container). A DESTROYED piece (AQ 0) is excluded — it
  // no longer protects, so it matches what combat resolution (armorProtection)
  // actually subtracts.
  context.combatArmorLocations = items.filter(i => i.type === "armorLocation").map(loc => {
    const type = loc.system.locationType;
    const covering = coveringArmor(actor, type, locationSide(loc));
    const sum = (aspect) => protectionSum(covering, aspect);
    return {
      id: loc.id,
      name: loc.name,
      layers: covering.length,
      b: sum("blunt"), e: sum("edged"), p: sum("piercing"), f: sum("fire"),
      notes: loc.system.notes
    };
  });

  context.injuries = items.filter(i => i.type === "injury").map(inj => ({
    id: inj.id,
    name: inj.name,
    severity: game.i18n.localize(SCARMARK.injurySeverities[SCARMARK.severityKey(inj.system.woundLevel)]),
    woundLevel: inj.system.woundLevel,
    mend: inj.system.mend || "—",
    heavy: inj.system.heavyBleeding,
    notes: inj.system.notes
  }));
}
