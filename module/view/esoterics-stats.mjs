/**
 * Context for the "Esoterics Statistics" block of the Esoterics tab (D. 2026-09-29).
 *
 *  - Spirit Capacity: a PLAIN number field for now (`system.resources.spiritCapacity`).
 *    Arcane casting capacity is set by Spirit (Spirit 13 = 13 points); the rules for
 *    spending and refilling it are still being worked out, so the pool is stored independently. Artifact/Rune Use spends it; Recharge
 *    restores it to effective Spirit. Ordinary spell rolls are not connected yet.
 *    The effective Spirit is shown beside it as a reminder.
 *  - Will Capacity: stored independently, shown on Combat with effective Will.
 *    Artifact/Rune Use spends it; Recharge restores it to effective Will.
 *  - Faith Points: NOT a copy. Each Religion skill's own `faithPoints` is shown and
 *    edited right here, so overwriting the field overwrites the skill, and a roll of
 *    an Invocation (which takes Faith Points off the skill) changes it at once. An actor
 *    with several Religion skills gets one field per skill.
 *
 * @param {Actor} actor
 * @param {Iterable<Item>} [items]  The actor's items (defaults to actor.items).
 * @returns {{spiritCapacity: number, spirit: (number|null), willCapacity: number, will: (number|null), religions: {id: string, name: string, fp: number}[], manyReligions: boolean}}
 */
export function esotericsStatistics(actor, items = actor.items) {
  const system = actor.system ?? {};
  const religions = [...items]
    .filter(i => (i.type === "skill") && (i.system?.category === "esoterics") && (i.system?.esotericKind === "religion"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(s => ({ id: s.id, name: s.name, fp: s.system.faithPoints ?? 0 }));
  return {
    // The stored value (not the prepared one): the input writes the source.
    spiritCapacity: actor._source?.system?.resources?.spiritCapacity ?? system.resources?.spiritCapacity ?? 0,
    spirit: system.attributes?.spi?.effective ?? null,
    willCapacity: actor._source?.system?.resources?.willCapacity ?? system.resources?.willCapacity ?? 0,
    will: system.attributes?.wil?.effective ?? null,
    religions,
    manyReligions: religions.length > 1
  };
}
