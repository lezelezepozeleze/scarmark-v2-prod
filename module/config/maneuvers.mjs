/**
 * Combat maneuvers and tactics offered by the combat helper dialog (helpers/combat-helper.mjs). Pure data.
 *
 * Names, descriptions and button labels are lang keys: SCARMARK.Maneuvers.<id>.name / .description, SCARMARK.Maneuvers.button.<id> and SCARMARK.Tactics.<id>.name / .description. A description may contain placeholders for numbers that live in config (rules/maneuvers.mjs maneuverTextValues).
 *
 * A maneuver is posted to chat as a card ("X attempted to Grapple Y") with buttons for the target's answers. Its `use` and every button `action` is a descriptor that helpers/maneuvers.mjs turns into a roll or status:
 *   { test: "skill", skill: "unarmed", modifier?: -20 }   a skill test (skill = a SCARMARK.combatSkills key)
 *   { test: "strength" }                                  a STR attribute test
 *   { defense: "dodge" | "block" }                        a defense roll
 *   { status: "<status id>" }                             apply a status effect
 *   { stumble: true }                                     a Stumble test
 *   { melee: "polearm", aim: "low" }                      a melee attack with a polearm and this aim
 * `requires` hides the maneuver unless the condition holds: { targetStatus, targetStrMax } or { weapon: "polearm" }.
 */
const button = (id, action) => ({ label: `SCARMARK.Maneuvers.button.${id}`, action });
const maneuver = (id, img, rest) => ({ id, img, name: `SCARMARK.Maneuvers.${id}.name`, description: `SCARMARK.Maneuvers.${id}.description`, ...rest });

export const MANEUVERS = [
  maneuver("grapple", "icons/svg/net.svg", {
    use: { test: "skill", skill: "unarmed" },
    buttons: [
      button("dodge", { defense: "dodge" }),
      button("grappled", { status: "grappled" }),
      button("breakFree", { test: "skill", skill: "unarmed", modifier: -20 })
    ]
  }),
  maneuver("pin", "icons/svg/statue.svg", {
    requires: { targetStatus: "grappled", targetStrMax: 22 },
    use: { test: "strength" },
    buttons: [
      button("struggle", { test: "strength" }),
      button("pinnedDown", { status: "pinnedDown" }),
      button("breakFree", { test: "strength" })
    ]
  }),
  maneuver("push", "icons/svg/combat.svg", {
    use: { test: "strength" },
    buttons: [button("stumbleTest", { stumble: true })]
  }),
  maneuver("ram", "icons/svg/shield.svg", {
    use: { test: "strength" },
    buttons: [button("block", { defense: "block" }), button("dodge", { defense: "dodge" })]
  }),
  maneuver("trip", "icons/svg/falling.svg", {
    requires: { weapon: "polearm" },
    use: { melee: "polearm", aim: "low" },
    buttons: [button("block", { defense: "block" }), button("dodge", { defense: "dodge" }), button("prone", { status: "prone" })]
  }),
  maneuver("entangle", "icons/svg/trap.svg", {
    buttons: [button("dodge", { defense: "dodge" }), button("blinded", { status: "blind" }), button("entangled", { status: "entangled" })]
  })
];

/** The tactics listed by the "Show tactics" button of the combat helper dialog. */
export const TACTICS = ["feint", "rapidAttack", "rapidFire", "twoWeaponCombat", "defensiveStance", "aimedAttack", "aimedFire", "catchBreath", "cover"]
  .map(id => ({ id, name: `SCARMARK.Tactics.${id}.name`, description: `SCARMARK.Tactics.${id}.description` }));

/** A weapon counts as a polearm (for Trip) when its notes contain this word. */
export const POLEARM_NOTES = /\bpolearm\b/i;
