# Smoke test

Manual verification checklist for Scarmark, to be run in Foundry v14 on a copy of an existing world. Run it before a release and after any change to sheets, rules or migrations.

## 1. Setup

1. Use a COPY of an existing world (never the original).
2. System version: the `version` in system.json.
3. Open the world in Foundry v14.369 (or your current verified v14 version).
4. Watch the browser console (F12) for errors during world load.

## 2. Sheets

Open one sheet of each type. Check that derived values are correct and no console errors appear.

### Actor types

**character**
- Open the sheet
- Check tabs: Journal, Profile, Skills, Combat, Esoterics, Gear, Containers, Effects
- Profile tab: attributes grid shows base values and effective values (after fatigue penalty); Character and NPC have a free-text Specialization box under the traits, Creature and Animal do not
- Combat tab: Fatigue, Endurance, Condition (value/max/pct/band), Load (kg/capacity/pct/steps), Movement
- Combat tab: armor protection per location (b/e/p/f values, layers count)
- Skills tab: each skill shows Skill Base (SB) and Effective Skill Level (ESL = level + sunsign bonus + mods - the fixed skill penalty of fatigue, load and wounds, 5 ESL per point)
- Esoterics tab: spells show target ESL, invocations show target ESL and Faith Points cost
- No console errors

**creature**
- Open the sheet
- Same as character except: no Presence attribute (8 attributes instead of 9), no DOB/sunsign
- No console errors

**npc**
- Open the sheet
- Same as character (9 attributes, no DOB/sunsign field shown)
- No console errors

**animal**
- Open the sheet
- Extends creature (8 attributes)
- No console errors

**container**
- Open the sheet
- Shows maxCapacity, description, gear summary (weight totals)
- No console errors

### Item types

**trait**
- Open the sheet
- Category (physical/psyche), description, notes
- No console errors

**skill**
- Open the sheet
- Category dropdown (skill/combat/esoterics); for esoterics a Kind dropdown (arcane/religion); the Faith Points box only for the religion kind
- Three attribute dropdowns (attribute1/attribute2/attribute3)
- Sunsign bonuses array (sunsign + bonus)
- Level, Faith Points, notes, description
- Derived: SB and ESL visible if embedded in an actor
- No console errors

**gear**
- Open the sheet
- Weight, value, quantity, carried checkbox, container dropdown
- Consumable checkbox, rune checkbox
- Artifact section: active/attuned checkboxes, class (1-5)
- Total weight and total value calculated
- No console errors

**weapon**
- Open the sheet
- Quantity, weight, value, carried, container
- Quality (DUR 0-16), isShield checkbox, broken checkbox
- Attack, defense, specialization
- Impact grid: blunt/edged/piercing/fire (each -1 to n)
- Associated skill dropdown (close/unarmed/ranged/arcane)
- Rune checkbox, artifact section
- No console errors

**missile**
- Open the sheet
- Quantity, weight, value, carried, container
- Quality (DUR 0-16)
- Velocity dropdown (low/high)
- Aspect dropdown (blunt/edged/piercing/fire)
- Associated skill dropdown (close/ranged/unarmed/arcane)
- Range grid: short/medium/long/extreme (thresholds in metres)
- Impact grid: short/medium/long/extreme (impact values)
- Magic checkbox, spell class (1-6)
- No console errors

**armorLocation**
- Open the sheet
- Location type (head/neck/shoulder/...)
- Aim weights: high/medium/low
- Injury thresholds: t1/t5/t9/t13/t17 (Wound Level 0-5)
- Risk checkboxes: fumble/stumble/amputate
- Notes
- No console errors

**armor**
- Open the sheet
- Quantity, weight, value, carried, container
- Quality (DUR, -1 = permanent, 0 = destroyed)
- Layer (0-5)
- Protection grid: blunt/edged/piercing/fire
- Locations set (multi-select of location type keys)
- Notes
- No console errors

**container**
- Open the sheet
- Quantity, weight, value, maxCapacity, carried, notes
- Total weight and total value calculated
- No console errors

**injury**
- Open the sheet
- Wound Level (0+)
- Mend Rate (0-6, displayed as MRN/H1-H6)
- Heavy bleeding checkbox
- Vital dropdown (blank/out/dying)
- Notes
- Severity derived from Wound Level
- No console errors

**invocation**
- Open the sheet
- Religion (name of Religion skill)
- Circle (1-5, Faith Points cost)
- Notes, description
- No console errors

**spell**
- Open the sheet
- Magic type (name of Magic skill, the Convocation)
- Level (1-6)
- Notes, description
- No console errors

**psionic**
- Open the sheet
- Three attribute dropdowns (attribute1/attribute2/attribute3)
- Sunsign bonuses array
- Level, fatigue cost, notes, description, misfire (HTML)
- Derived: SB and ESL visible if embedded in an actor
- No console errors

## 3. Rolls

Test each roll type. Check that the chat card appears with correct formatting, no console errors, and the d100/Nd6 result is shown with outcome level.

1. **Skill test**: open a character with skills, click a skill name or use "Roll Skill" button. Dialog appears with modifier field, roll produces a test card with target (ESL + modifier, capped at 95), roll result, outcome (CF/MF/MS/CS).
2. **Attribute test**: on character sheet Profile tab, click an attribute name (STR/STA/DEX/...). Dialog with multiplier (default 5) and modifier. Test card shows target (attribute effective * multiplier + modifier, capped at 95), roll, outcome.
3. **Spell**: Esoterics tab, Spells section, click "Cast" button. Picker dialog (if multiple Magic skills), roll produces test card with spell name, target (skill ESL - spell level penalty, (level-1)*5, capped at 95), roll, outcome, fatigue cost line (MS = 0, MF = 1, CF = 2).
4. **Invocation** (with enough Faith Points): Esoterics tab, Invocations section, click "Invoke" button. Picker dialog (if multiple Religion skills), roll produces test card with invocation name, target (skill ESL - circle * 5, capped at 95), roll, outcome, piety line (FP change: CS = -0, MS = -circle, MF = -0, CF = -circle).
5. **Invocation** (not enough Faith Points): set Religion skill's Faith Points to less than the invocation circle. Click "Invoke", dialog warns "Not enough Faith Points", cancel or proceed. If proceed, roll happens but FP goes to 0.
6. **Psionic talent**: Esoterics tab, Psionics section, click "Use" button. Test card with psionic name, target (psionic ESL, capped at 95), roll, outcome. On CF, misfire text (if any) is posted. Fatigue increases by the psionic's fatigue cost after roll.
7. **Shock**: Combat tab, click "Shock" button. Test card with actor name, target (2 * Condition pct, capped at 95), roll, outcome. On CF, a "Request Shock" button appears for the GM to apply the Stunned status.
8. **Stun**: select a token, run `game.scarmark.stunTest(<actor>)` from console (replace `<actor>` with `canvas.tokens.controlled[0].actor`). Dialog with protection bonus (from armor layer), test card with target (50 + bonus, capped at 95), roll, outcome. On CF, Stunned status is applied.
9. **Mend**: open an actor with injuries, Combat tab Injuries section, click "Mend" button on an injury. Test card with injury name, target (Endurance), roll, outcome, result text (WL change: CS = -2, MS = -1, MF = 0, CF = +1). Injury Wound Level updates.

## 4. Combat

Test combat flows. Use two tokens (attacker and target) on a scene. Check that cards appear, no console errors, and damage/status updates happen.

1. **Melee attack with Ignore**: attacker selects one token, clicks "Declare Attack" on Combat tab. Dialog: weapon picker, aspect (b/e/p/f), aim (high/medium/low). Attack card posted. Target player (or GM) clicks "Ignore" button. Result card shows attacker roll (attack test), target roll (ignore = 0), outcome. If hit lands, strike card follows with hit location, damage, wound level, armor wear decision.
2. **Melee attack with Block**: same as Ignore, but target clicks "Block" and picks a weapon. Both roll, outcome resolves (attacker/defender strike dice, opportunity, clash if applicable).
3. **Melee attack with Dodge**: same, target clicks "Dodge". Target uses Dodge skill ESL for defense roll.
4. **Melee attack with Riposte**: same, target clicks "Riposte" and picks weapon + aspect. Both roll; if defender wins or ties, defender strikes back.
5. **Melee attack with Counterattack**: same, target clicks "Counterattack" and picks weapon + aspect. If defender wins, both strike; ties and defender losses produce no strike.
6. **Ranged attack**: attacker clicks "Declare Range Attack", picks missile, range band (short/medium/long/extreme), aim. Attack card posted. Target responds (Ignore/Block with shield if applicable/Dodge).
7. **High-velocity missile vs Dodge**: use a missile with velocity = "high". Target chooses Dodge. Check that the result card applies Dodge halving (effective Dodge ESL is Math.floor(Dodge / 2)).
8. **Armor-piercing hit**: use a weapon or missile with "bodkin" in the name (regex `/bodkin/i`). Strike card shows armor protection reduced (Math.floor(armorProt / 2)).
9. **Weapon clash**: melee attack, both attacker and defender Block. If outcome is a tie, clash occurs: WQ tests (3d6 each), loser's weapon durability decreases by 1 (floor 1), chat card shows results.
10. **Wound**: strike lands with effective impact >= location injury threshold. Injury item is created on the target with the calculated Wound Level, aspect, location. Chat shows "Add Wound" button, click it to add the injury to the actor.
11. **Shock request**: strike produces a heavy wound (Wound Level >= 3, or Condition drops below 25%). Chat card includes a "Request Shock" button (GM only). Click it, shock roll dialog appears for the target.
12. **Armor wear**: strike card shows armor wear decision (Math.random >= 0.5 = "spared", < 0.5 = wear occurs). If wear, armor quality decreases by 1.
13. **Combat round fatigue**: advance a combat round (Foundry's combat tracker "Next Turn"). Every 5 rounds (configurable via FATIGUE_ROUND_INTERVAL = 5), all combatants gain +1 Fatigue, and actors with heavy bleeding injuries gain +1 Wound Level. Chat card lists affected actors.

## 5. Effects

Test Active Effects and status effects. Check that changes apply to mods and derived stats update.

1. **Timed Active Effect**: create an effect on an actor with a duration (e.g. 1 hour). Advance world time (requires Simple Calendar or SmallTime module). After the duration expires, the effect is removed. Check the "ready" hook sweep runs (watch console for "Swept N expired effects" or similar log).
2. **Apply each status**: open a token HUD (right-click a token), click each status icon:
   - **Prone** (id: "prone"): skills -20, incoming melee +20, incoming missile -20. Check actor sheet Skills tab: ESL values drop by 20. Combat tab: open the full mods if visible.
   - **Grappled** (id: "grappled"): skills -20.
   - **Pinned Down** (id: "pinnedDown"): skills -30, incoming melee +30, incoming missile -30.
   - **Entangled** (id: "entangled"): skills -30.
   - **Stunned** (id: "stun"): defense -30 (applies to all defense rolls: Block/Dodge/Riposte/Counterattack).
3. **Open the effect sheet**: create or edit an effect (character, weapon or armor type), open its sheet. Change the Key dropdown: check that the picker includes the 15 static mods (meleeAttack, meleeDefense, missileAttack, incomingMelee, incomingMissile, outnumbered, defense, impact, skills.physical/communication/combat/craft/religion/magic/psionic, injury, endurance, system.resources.fatigue), all 9 attributes (system.attributes.str.base, etc.), and dynamic skill entries (system.mods.skill[Name]). No console errors.

## 5a. Toxicity, the effect library and keyboard access (1.0.55)

1. **Toxicity**: on a gear item tick Consumable. A Toxicity field appears next to it, in the same row and font as Container and Consumable. Set it to 5, put the item on a character, click Consume. The actor gets an effect with Vitality -5 that ends with the item's longest effect; with no effect on the item the penalty is permanent. Untick Consumable: the field disappears.
2. **Toxicity migration**: run `scripts/imports/migrate-toxicity.js` on a copy, "Report only" first. Beer (5) gets toxicity 5 and loses its own Vitality -5; an item with no number in its name is unchanged. A second Apply changes nothing.
3. **Add menu**: on a character's Effects tab click Add. A menu opens under the button (above it when there is no room): Blank effect first, then the effect compendiums grouped by name. It scrolls with a visible scrollbar and the tab behind it stays still. Pick Tipsy (II): the effect appears enabled and expires after its duration when time advances. Esc, a click outside or scrolling the tab closes the menu.
4. **Keyboard**: Tab reaches the Add, edit, delete, toggle and Consume controls; Enter or Space activates them. Clicking a field label focuses its field.
5. **Hit location**: strike a target many times; every location with a non-zero weight can be hit.

## 5b. Actions, effects and regions (1.1.0)

Switch the old patch macros off first (`SM_PATCHES.stop()`), then reload.

1. **Actions tab**: open a weapon, an armor piece, a gear item and a container actor: each has an Actions tab. Add an action: it appears as one row with its name only (like an effect), the on/off switch and the red bin on the right. Click the name: a window opens with the name field, "when:" and one roll-down per line; the lines change with the kind. Name it, pick a trigger and a kind; it all stays after a reload and the row shows the name. Drag the row onto another item's Actions tab (or a chest's): a copy of the action is added there; dropping it on its own list does nothing. Drag an Action from the compendium or the Items directory onto an Actions tab: its action is added under the entry's name. Dropping a non-Action item on a chest's Actions tab still does what it did. Switch the action off: the block dims and using the item no longer fires it.
1a. **Action compendium**: open the Compendiums sidebar; there is an empty "Actions" compendium (reload the world once if it is missing). Unlock it, create an Action there: its sheet shows only the icon and name and then "when:" with its roll-downs (no Actions tab, Add link, name field, switch or bin; the action is there already). Name the entry, pick a trigger and what it does (for example "when Used: add <library effect> on Self"). On a gear item with Usable ticked, click Add in the Actions tab: a menu offers Blank action and your entry; picking the entry copies its actions into the item. With the compendium empty Add adds a blank action at once. Drag an Action onto a character: it is refused with a notice.
2. **Use**: on a gear item tick Usable, add "when Used: add <effect> on Self". The sheet row shows a Use button. Click it: the chat says what was used and what happened, the effect is on the actor, One-use only works (the item is spent when used). In Gear Details Usable sits right under Consumable and One-use only right under Toxicity, also when Toxicity is hidden.
3. **Consume**: a consumable with a "consumed" action puts the effect on the consumer with its countdown started, and the card shows the result. Run `scripts/imports/migrate-consumable-actions.js` on a copy ("Report only" first) for old consumables.
4. **Test and message actions**: an action that rolls a skill or an attribute shows the dice inside the item's card; a message action posts its text.
5. **Alter action**: open the compendiums "Armor alterations" and "Weapon alterations" (reload the world once if they are missing) and run `scripts/macros/create-alterations.js` as the GM to fill them. An alter action asks which weapon or armor piece it changes and applies the picked alteration. Repair puts an armor piece back to its original durability (`quality` becomes `originalQuality`) and clears the broken flag of a weapon; Natural armor, a natural weapon (quality 0) and a weapon that is not broken say there is nothing to repair.
6. **Effect types**: on a weapon, add an effect with a +1 Impact modifier: the weapon sheet and the attack use the higher value, the stored value is unchanged. On an armor piece a Protection or Durability modifier changes what combat uses; a Durability modifier that brings the piece to 0 makes it stop protecting.
7. **Immediate effect**: an immediate effect rewrites the stored values once and nothing is left in Effects.
8. **Unique effect**: tick Unique on an effect; adding the same effect to the same item or actor a second time is refused.
9. **Poison on a blade**: give a weapon an effect with On hit, a test and 2 charges; a wounding hit shows the target a test button, a failed test puts the effect on the target, and a charge is spent (relayed to the GM when the weapon belongs to someone else).
10. **Region behavior**: add a "Watch your step" behavior to a Region with a message action; a token that crosses it posts the message once or every time, as set.
11. **Block with a body location**: in the Block dialog pick a body location instead of a weapon; when the block turns the blow aside, the blow lands on that location as an ordinary strike (protection and wear of the worn armor there, one wear step at most).
12. **Armor durability**: strike a worn armor piece until it reaches 0: it stops protecting; there is no condition per location anywhere on the armor sheet.

## 6. Compendiums and macros

1. **Drag items from packs**: open the Skills compendium (pack id: "scarmark.skills"), drag one skill onto a character sheet. Check it appears in the Skills tab. Repeat for Weapons, Armor, Armor Locations packs.
2. **Run a macro**: open the Scarmark Macro compendium (pack id: "scarmark.macros"), pick one macro, execute it. No console errors.

## 6a. Inventory and sheet behaviors

Switch the old patch macros off first (SM_PATCHES.stop()), then reload.

1. **Weights and DUR**: on the Gear tab a weight like 0.125 shows as 0.125 (not 0.1). Armor shows DUR as current/original (for example 5/10); an armor piece with no compendium source shows 5/-.
2. **Click to open**: click an item row (Gear, Skills, Combat, Esoterics) and an effect row: its sheet opens. Click a button, link or input inside a row: only that control acts. A stackable item opens about a third of a second after the click.
3. **Scroll**: scroll down the Skills tab, change a skill level: the tab keeps its scroll position. Switch to another tab and back: the position is kept.
4. **Containers section**: the Gear tab of a character lists every container with weight and "used / capacity". A container over its capacity shows the capacity in the warning colour. Carry, edit, delete and add work.
5. **Chest list**: on a Container actor each container is listed with the items stored in it; items whose container was deleted are listed under "Items without a valid container". The Gear filter narrows the list (by name or notes). Unpack on an item takes it out of its container; Unpack on a container empties it.
6. **Stacks**: double click an item row with quantity 5: it becomes 3 and a new row of 2 appears. Triple click a row of an item that has identical stacks in the same container: they merge. Different notes: nothing merges and a warning shows.
7. **Drag and drop**: drag an item onto a container block on the Containers tab: it moves into the container (outline while dragging). Drag a container to another character: it arrives with its contents, carried. Drag an item out of a container to another character: it arrives at the top level. Drop onto a Container actor and back.
8. **Dialog keyboard**: open any dialog; the arrow keys move between the buttons, the focus follows the mouse, a delete confirmation focuses Cancel first.

## 6c. Armor

1. Open a piece of armor that is on a character: the Properties tab shows a grid with In container, Quantity, Weight, Value; Durability, Original durability and Layer; Protection; Locations; Notes. There is no Material and no Resistance. Type an original durability: the Gear tab shows it as current/original (5/10).
2. The location picker offers 16 entries for a character (Head, Neck, Chest, Belly and Left and Right Shoulder, Arm, Hand, Hip, Thigh, Shin) and none of the creature locations. On an animal it offers the creature locations with Left and Right legs. Armor from the Items directory offers all 28.
3. Add Left Arm: a row appears with a Condition field (0) and a remove button. Type a number in Condition, close and reopen: it is still there. Remove the row: the picker offers Left Arm again.
4. Migration: run scripts/imports/migrate-armor-coverage.js on a COPY of the world: "Report only" first, then "Apply", reload (F5). Old armor that covered "Arm" (or "Arm (both sides)") shows "Left Arm" and "Right Arm" rows with the same condition, and still protects a hit on either arm; armor that covered "Left Arm" shows "Left Arm"; Original durability is filled; no errors in the console.
5. Hit locations: open "Left Arm" on a character's Combat tab. It has a Side set to Left. In a fight, armor covering only Left Arm adds protection against a hit on the left arm, not the right; armor covering Arm covers both.

## 6b. Combat helper

1. Target a token and press T (or double click a token you do not own): the combat helper lists the attacker's attacks by group (Unarmed, Close, Throwable, Missiles, Artifacts, Runes). A weapon with a damage aspect shows its letters in the order B E P F, strongest first.
2. Click a weapon: the attack dialog opens for that weapon. Click an artifact: the Artifact/Rune Use dialog opens with it selected.
3. Maneuvers column: choose Grapple; a chat card "X attempted to Grapple Y" appears with Dodge, Grappled and Break free buttons, and the unarmed test opens. As the target's owner, click Dodge and Grappled: the roll and the status are applied. Pin appears only against a grappled target. Trip appears only with a polearm.
4. Show tactics (header button of the dialog) lists the tactics; each expands to its text.
5. Language: switch the user language to Czech (Settings, Configure Settings): the maneuver and tactic texts show in Czech, everything else stays in English where it has no Czech text.

## 7. Schema check (console)

Run this once BEFORE prompts 3c and 4a and once AFTER each of them, in the same world, as GM. It walks the instantiated schema of every registered Actor and Item data model (including nested SchemaField, ArrayField and SetField children), records each field's class name and its resolved options, and copies the result to the clipboard. Paste each run into a file (e.g. `schema-before-3c.json`, `schema-after-3c.json`) and compare with `diff`. Any difference in field names, types, `initial`, `required`, `nullable`, `blank`, `integer`, `min`, `max` or `choices` must be explained before the change is accepted.

```javascript
(() => {
  const SKIP = new Set(["name", "parent", "fieldPath", "fields", "element", "model", "options"]);
  const ser = (v) => {
    if (typeof v !== "function") return v;
    try { return { fn: v.name || "anonymous", value: v() }; } catch { return { fn: v.name || "anonymous" }; }
  };
  const walk = (f) => {
    const out = { type: f.constructor.name };
    for (const [k, v] of Object.entries(f)) if (!SKIP.has(k)) out[k] = ser(v);
    if (f.fields) out.fields = Object.fromEntries(Object.entries(f.fields).map(([k, c]) => [k, walk(c)]));
    if (f.element) out.element = walk(f.element);
    if (f.model) out.model = f.model.name;
    return out;
  };
  const dump = { system: game.system.version };
  for (const doc of ["Actor", "Item"]) {
    for (const [type, cls] of Object.entries(CONFIG[doc].dataModels).sort(([a], [b]) => a.localeCompare(b))) {
      dump[`${doc}.${type}`] = walk(cls.schema);
    }
  }
  copy(JSON.stringify(dump, null, 2));
  console.log("Schema copied to clipboard:", Object.keys(dump).filter(k => k !== "system"));
})();
```

Expected: the console lists all 5 Actor types and all 12 Item types from system.json. `initial` values that are functions are recorded with their return value (`{ fn, value }`).

## 8. Golden verification (console)

There are NO "copied:" golden cases in the test fixtures (all cases have `"source": "executed"`, or `"executed:sample"` for the real-data samples). The golden runner executed the current code for all mechanics.

The real-data fixtures (committed samples tests/golden/compendium-items-sample.json and compendium-actors-sample.json; full sets local only in tests/golden/local/, frozen from the compendium export by tests/tools/import-compendium-fixtures.mjs, see tests/golden/README.md) rest on the same assumption as (a) and (b) below, plus one more: the compendium-actors adapter applies Active Effect changes (all phase "initial") after the embedded items are prepared and before the actor's prepareDerivedData. Question (b) on a world actor with a transferred trait effect (a racial trait with skill-mod changes) checks it.

However, the following open questions from the golden capture process need verification in real Foundry v14:

### (a) Item prepareDerivedData timing

**Question**: Does item prepareDerivedData (for Skill items computing Skill Base) run BEFORE Active Effects are applied to the actor and BEFORE actor prepareDerivedData?

**Context**: The golden adapters assume that Skill Base ignores Active Effects on attributes (it reads `attribute.base`, not `attribute.effective`), and (since 1.0.53) that skills ignore Active Effects on attributes altogether: applyDerivedCombat lowers every skill by the fixed skill penalty (fatigue, load, wounds) only. This matches the code in `module/data/item-skill.mjs:58-68` and `module/data/base-actor-schema.mjs:290-299`.

**Console snippet to verify**:

```javascript
// Create a character with a skill
const actor = game.actors.getName("YourCharacterName");
const skill = actor.items.find(i => i.type === "skill");
console.log("Skill:", skill.name);
console.log("Attributes for SB:", skill.system.attribute1, skill.system.attribute2, skill.system.attribute3);
console.log("Actor attribute bases:", 
  actor.system.attributes[skill.system.attribute1]?.base,
  actor.system.attributes[skill.system.attribute2]?.base,
  actor.system.attributes[skill.system.attribute3]?.base
);
console.log("Skill Base (item.system.sb):", skill.system.sb);
console.log("Calculated SB from bases:", 
  Math.round((
    (actor.system.attributes[skill.system.attribute1]?.base ?? 0) +
    (actor.system.attributes[skill.system.attribute2]?.base ?? 0) +
    (actor.system.attributes[skill.system.attribute3]?.base ?? 0)
  ) / 3)
);

// Add an Active Effect that modifies one of the attributes (e.g., +5 to STR base)
// Observe: does item.system.sb change? It should NOT if item prep runs before effects.
```

**Expected result**: `item.system.sb` should equal the calculated SB from attribute bases and should NOT change when Active Effects modify attributes, because item prepareDerivedData runs first and reads `base`, not `effective`.

### (b) Skill item sb/esl comparison

**Question**: for one skill or psionic item on a real character, does Foundry produce the same `sb` and `esl` as the code path frozen in the golden fixtures (`item-skill.mjs` prepareDerivedData plus `applyDerivedCombat` step 6 in `base-actor-schema.mjs`)?

Pick a character with at least one Active Effect that changes an attribute (so the SB delta is non-zero) and set the two names below.

```javascript
(() => {
  const actor = game.actors.getName("YourCharacterName");
  const item = actor.items.getName("YourSkillName");
  const keys = [item.system.attribute1, item.system.attribute2, item.system.attribute3];
  const attrs = actor.system.attributes;
  const src = actor._source.system.attributes;

  // Skill Base: item prepareDerivedData, reads attributes[k].base (missing = 0).
  const sb = Math.round(keys.map(k => attrs[k]?.base ?? 0).reduce((a, b) => a + b, 0) / 3);

  // SB delta: applyDerivedCombat, effective minus stored base, 0 if any side is missing.
  let delta = 0, missing = false;
  for (const k of keys) {
    const eff = attrs[k]?.effective, base = src[k]?.base;
    if (eff == null || base == null) { missing = true; break; }
    delta += eff - base;
  }
  const sbDelta = missing ? 0 : Math.round((delta / 3) * 5);

  const mods = actor.system.mods;
  const bonus = item.system.sunsignBonuses?.find(e => e.sunsign && e.sunsign === actor.system.sunsign)?.bonus ?? 0;
  const catMod = item.type === "psionic" ? mods.skills.psionic : (mods.skills[item.system.category] ?? 0);
  const skillMod = Object.entries(mods.skill).find(([n]) => n.toLowerCase() === item.name.toLowerCase())?.[1] ?? 0;
  const esl = Math.max(0, (item.system.level ?? 0) + bonus + catMod + skillMod + sbDelta);

  console.table({
    sb: { foundry: item.system.sb, expected: sb, match: item.system.sb === sb },
    esl: { foundry: item.system.esl, expected: esl, match: item.system.esl === esl },
  });
  console.log({ keys, sbDelta, bonus, catMod, skillMod });
})();
```

**Expected result**: both rows show `match: true`. If `esl` does not match, check whether the item is targeted by a skill override Active Effect (`collectSkillOverrides` in `base-actor-schema.mjs`); overrides replace the whole sum and are not modelled in this snippet. If `sb` does not match, question (a) has failed: report it, because the golden fixtures assume item preparation reads unmodified attribute bases.

## 9. Result log template

Date: YYYY-MM-DD
Tester: [name]
Foundry version: v14.xxx
System version: 1.0.57-beta
World: [copy name]

### Sections 6a and 6b: inventory, sheet behaviors and combat helper
- [ ] weights and DUR: pass / fail
- [ ] click to open and scroll: pass / fail
- [ ] containers section and chest list: pass / fail
- [ ] stack split and merge: pass / fail
- [ ] drag and drop: pass / fail
- [ ] dialog keyboard: pass / fail
- [ ] combat helper, maneuvers, tactics: pass / fail

### Section 2: Sheets
- [ ] character: pass / fail (note: ___)
- [ ] creature: pass / fail
- [ ] npc: pass / fail
- [ ] animal: pass / fail
- [ ] container: pass / fail
- [ ] trait: pass / fail
- [ ] skill: pass / fail
- [ ] gear: pass / fail
- [ ] weapon: pass / fail
- [ ] missile: pass / fail
- [ ] armorLocation: pass / fail
- [ ] armor: pass / fail
- [ ] container (item): pass / fail
- [ ] injury: pass / fail
- [ ] invocation: pass / fail
- [ ] spell: pass / fail
- [ ] psionic: pass / fail

### Section 3: Rolls
- [ ] skill test: pass / fail
- [ ] attribute test: pass / fail
- [ ] spell: pass / fail
- [ ] invocation (enough FP): pass / fail
- [ ] invocation (not enough FP): pass / fail
- [ ] psionic talent: pass / fail
- [ ] shock: pass / fail
- [ ] stun: pass / fail
- [ ] mend: pass / fail

### Section 4: Combat
- [ ] melee attack - Ignore: pass / fail
- [ ] melee attack - Block: pass / fail
- [ ] melee attack - Dodge: pass / fail
- [ ] melee attack - Riposte: pass / fail
- [ ] melee attack - Counterattack: pass / fail
- [ ] ranged attack: pass / fail
- [ ] high-velocity missile vs Dodge: pass / fail
- [ ] armor-piercing hit: pass / fail
- [ ] weapon clash: pass / fail
- [ ] wound: pass / fail
- [ ] shock request: pass / fail
- [ ] armor wear: pass / fail
- [ ] combat round fatigue: pass / fail

### Section 5: Effects
- [ ] timed Active Effect expiry: pass / fail
- [ ] Prone status: pass / fail
- [ ] Grappled status: pass / fail
- [ ] Pinned Down status: pass / fail
- [ ] Entangled status: pass / fail
- [ ] Stunned status: pass / fail
- [ ] Active Effect config key picker: pass / fail

### Section 6: Compendiums and macros
- [ ] drag skill from compendium: pass / fail
- [ ] drag weapon from compendium: pass / fail
- [ ] drag armor from compendium: pass / fail
- [ ] drag armor location from compendium: pass / fail
- [ ] run macro: pass / fail

### Section 7: Schema check
- [ ] captured before refactor: date ___
- [ ] compared after prompt 3c: match / differ (note: ___)
- [ ] compared after prompt 4a: match / differ (note: ___)

### Section 8: Golden verification
- [ ] item prepareDerivedData timing (a): verified / differs (note: ___)
- [ ] skill sb/esl calculation (b): verified / differs (note: ___)

### Console errors
List any console errors or warnings here:

### Notes
Additional observations:
