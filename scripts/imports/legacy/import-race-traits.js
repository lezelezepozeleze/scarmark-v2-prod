/**
 * Scarmark — Import: Race Traits (physical)
 * -----------------------------------------
 * Source : Scarmark_Race Traits.xlsx (RULES v1\Wiki? -> RULES v1\Tables), BOTH tabs:
 *          "Atributy" (attribute deltas) + "Schopnosti" (per-race abilities), revised 2026-09-20.
 * Creates one physical `trait` Item per race in a world "Race Traits" Item folder, plus the
 * toggleable "Blood Frenzy" trait. Move them into a compendium yourself if you want.
 *
 * WHAT THE ACTIVE EFFECT APPLIES (agreed with D. 2026-09-20):
 *   - Attributes (Atributy tab) -> system.attributes.<key>.base (ADD).
 *   - Explicit "+N ESL" to a named skill -> system.mods.skill.<Name> (case-insensitive match
 *     to the skill item's name); to a skill group -> system.mods.skills.<category>.
 *   - Impact -> system.mods.impact ; Endurance -> system.mods.endurance ; Vitality is a skill
 *     -> system.mods.skill.Vitality.
 * EVERYTHING ELSE lives in the description (not mechanized here): Darkvision, natural weapons &
 *   natural armor profiles (D. adds those items), weapon specializations (D. sets those),
 *   granted skills at fixed ESL (Streetwise / Elven Empathy / Cat Senses / cat-tongue), esoteric
 *   access & the Leonid/Drachenborn ESL caps, "+1 SB Dodge", Amphibious, magic immunity/resistance,
 *   Ignore-Shock, corrupted Morality, Fire Breath, and the Acceptance rating (in `notes`).
 *
 * NOTES / open rules (from the revision handoff — kept AS WRITTEN in the sheet, not "fixed"):
 *   - Skill names must match the skill items: "Bargaming" (gambling skill, per Skills.xlsx),
 *     "Awareness - Passive", "Enthropic Magic", "Blood Magic", "Ranged Combat", "Close Combat",
 *     "Unarmed Combat". If your skills use different spellings, the matching mod silently won't apply.
 *   - Leonid/Drachenborn "Strong Blow +1 Impact" says it does NOT stack with their natural weapons;
 *     a flat system.mods.impact can't express that, so it is applied to ALL damage and the caveat is
 *     in the description (GM adjudicates the natural-weapon case, or drop the impact mod).
 *   - The sheet's flagged double-counts (Halfling/Goblin Stealth, Ork Communication also hitting
 *     Awareness) are applied exactly as written.
 *
 * HOW TO USE: Foundry (as GM) -> Macros -> new "Script" macro -> paste -> Execute.
 *   Re-running replaces a trait of the same name in the folder (no duplicates).
 */
(async () => {
  if (!game.user?.isGM) return ui.notifications.error("Race Traits import: must be run by a GM.");

  const ADD = CONST.ACTIVE_EFFECT_MODES.ADD;
  const FOLDER_NAME = "Race Traits";
  const attr = (k, v) => ({ key: `system.attributes.${k}.base`, mode: ADD, value: String(v) });
  const mod  = (path, v) => ({ key: `system.mods.${path}`, mode: ADD, value: String(v) });

  // name, attrs{key:±n}, mods[[path,±n]], notes, desc(HTML), disabled?
  const TRAITS = [
    {
      name: "Ghetto Elf (Half-Elf)",
      attrs: { str: -1, dex: 1 },
      mods: [ ["skill.Stealth", 10], ["skill.Lockcraft", 10], ["skill.Legerdemain", 10], ["skill.Bargaming", 10] ],
      notes: "Acceptance 6 (seen as an elf if unmasked — hostile).",
      desc: `<p>A mixed elven branch that took to life under human rule — often of mixed blood, and able to pass fairly well for human.</p>
<p><strong>Applied:</strong> +10 Stealth, Lockcraft, Legerdemain, Bargaming (a hard life, well adapted to it).</p>
<p><strong>Quick Reflexes:</strong> +1 SB to Dodge <em>(apply to the Dodge skill base; not mechanized)</em>.</p>
<p><strong>Grants:</strong> Streetwise skill (ESL 75), Elven Empathy (ESL 50).</p>
<p><strong>Esoterics:</strong> no restriction. <strong>Darkvision:</strong> 20 ft.</p>`
    },
    {
      name: "Forest Elf",
      attrs: { str: -1, dex: 1, agl: 2, int: 1, eye: 1, hrg: 1, sml: 1 },
      mods: [ ["skill.Ranged Combat", 10], ["skill.Stealth", 10], ["skill.Survival", 10], ["skill.Herblore", 10], ["skill.Awareness", 10], ["skill.Awareness - Passive", 5], ["skill.Tracking", 10] ],
      notes: "Acceptance 6 (open hostility toward elves).",
      desc: `<p>Elves of the deep woods — natural hunters.</p>
<p><strong>Applied (Natural Hunter):</strong> +10 Ranged Combat, Stealth, Survival, Herblore, Awareness, Tracking; +5 Awareness - Passive.</p>
<p><strong>Quick Reflexes:</strong> +1 SB to Dodge <em>(not mechanized)</em>.</p>
<p><strong>Grants:</strong> Elven Empathy (ESL 65).</p>
<p><strong>Esoterics:</strong> no restriction; can learn Fey magic. <strong>Darkvision:</strong> 20 ft.</p>`
    },
    {
      name: "Moon Elf (High Elf)",
      attrs: { str: -1, dex: 1, agl: 1, int: 2, aur: 2, eye: 1, sml: 1, com: 2 },
      mods: [ ["skill.Rhetoric", 10], ["skill.Lore", 10], ["skills.magic", 10] ],
      notes: "Acceptance 6 (open hostility toward elves).",
      desc: `<p>High elves of moonlit courts — scholars and natural mages.</p>
<p><strong>Applied:</strong> +10 Rhetoric and Lore (Learning: all learning-based matters, per GM); +10 all Arcane/Magic skills (Innate Magical Talent).</p>
<p><strong>Weapon affinity</strong> (set as specialization): Swords +10.</p>
<p><strong>Quick Reflexes:</strong> +1 SB to Dodge <em>(not mechanized)</em>.</p>
<p><strong>Grants:</strong> Elven Empathy (ESL 80).</p>
<p><strong>Esoterics:</strong> may use Fey magic and casts almost any spell without runes. <strong>Darkvision:</strong> 20 ft.</p>`
    },
    {
      name: "Water Elf",
      attrs: { str: -1, dex: 1, agl: 2, int: 1, aur: 1, eye: 1 },
      mods: [ ["skill.Stealth", 10] ],
      notes: "Acceptance 6 (open hostility toward elves).",
      desc: `<p>Amphibious elves of rivers, lakes and coasts.</p>
<p><strong>Applied:</strong> +10 Stealth (on land). A further +10 Stealth while in water or in the rain is applied manually / at GM discretion.</p>
<p><strong>Amphibious:</strong> breathes underwater as well as air; water creatures do not attack (they take you as one of their own) and you can communicate with them a little; Swimming equals your land movement (Swimming = Mobility).</p>
<p><strong>Weapon affinity</strong> (set as specialization): Polearms &amp; Staff (tridents, spears) +10.</p>
<p><strong>Quick Reflexes:</strong> +1 SB to Dodge <em>(not mechanized)</em>.</p>
<p><strong>Esoterics:</strong> no restriction; can learn Fey magic. <strong>Darkvision:</strong> 20 ft.</p>`
    },
    {
      name: "Dark Elf",
      attrs: { str: -1, dex: 2, agl: 1, aur: 1, eye: 1, hrg: 1, sml: 1 },
      mods: [ ["skill.Intrigue", 20], ["skill.Close Combat", 10], ["skill.Enthropic Magic", 10] ],
      notes: "Acceptance 3 (feared — reputation as slavers/corsairs).",
      desc: `<p>Elves of the deep places — schemers and fast blades.</p>
<p><strong>Applied:</strong> +20 Intrigue (born intriguer, liar, manipulator); +10 Close Combat (Fast Attacks); +10 Enthropic Magic (Dark Talent).</p>
<p><strong>Quick Reflexes:</strong> +1 SB to Dodge <em>(not mechanized)</em>.</p>
<p><strong>Esoterics:</strong> no restriction; can learn hybrid Fey magic and use Enthropic magic. <strong>Darkvision:</strong> 30 ft.</p>`
    },
    {
      name: "Red Elf",
      attrs: { dex: 2, agl: 1, int: 1, aur: 1, wil: 1, eye: 1, sml: 1, com: -2 },
      mods: [ ["skill.Close Combat", 10], ["skill.Intrigue", 20], ["skill.Enthropic Magic", 10], ["skill.Blood Magic", 10] ],
      notes: "Acceptance 4 (feared/mistrusted; some won't accept you at all).",
      desc: `<p>Blood-touched elves — drawn to violence and the scent of blood.</p>
<p><strong>Applied:</strong> +10 Close Combat (Fast Attacks); +20 Intrigue (born intriguer); +10 Enthropic Magic and +10 Blood Magic (Dark Talent).</p>
<p><strong>Blood Frenzy:</strong> a separate trait — enable it when Condition drops below 50% (+10 Combat, +1 Impact).</p>
<p><strong>Ignore Shock:</strong> ignores the first failed Shock Roll and fights on; even a mortal wound buys one more round.</p>
<p><strong>Corrupted Morality:</strong> whatever your Morality, you lean toward blood/sadism; expect occasional Morality tests to resist toying with a target (GM's call).</p>
<p><strong>Quick Reflexes:</strong> +1 SB to Dodge <em>(not mechanized)</em>.</p>
<p><strong>Esoterics:</strong> no restriction; hybrid Fey magic, plus Enthropic and Blood magic. <strong>Darkvision:</strong> 20 ft.</p>`
    },
    {
      name: "Dwarf",
      attrs: { str: 2, sta: 1, agl: -2, wil: 1, hrg: 1, sml: 1 },
      mods: [ ["skill.Vitality", 20], ["endurance", 4] ],
      notes: "Acceptance 1 (common dwarf) / 3 (from Dwarvenia).",
      desc: `<p>Stout, stubborn mountain folk — hardy and deeply resistant to the arcane.</p>
<p><strong>Applied:</strong> +20 Vitality (resists disease, alcohol and alchemical side effects); +4 Endurance (a massive frame survives wounds that would drop others).</p>
<p><strong>Magic immunity:</strong> magic has no effect on you — you take elemental damage, but cannot otherwise be enchanted.</p>
<p><strong>No esoterics:</strong> the price of that immunity is that you cannot use esoterics (psionics excepted).</p>
<p><strong>Darkvision:</strong> 20 ft.</p>`
    },
    {
      name: "Halfling",
      attrs: { str: -2, dex: 2, agl: 2, int: 1, aur: 1, wil: 1, hrg: 1, sml: 1 },
      mods: [ ["skills.communication", 10], ["skill.Stealth", 10], ["skill.Lockcraft", 10], ["skill.Legerdemain", 10], ["skill.Bargaming", 10], ["impact", -1] ],
      notes: "Acceptance 1 (integrates well — until you start stealing).",
      desc: `<p>Small folk — nimble, sociable and quick-fingered, if short on muscle.</p>
<p><strong>Applied:</strong> +10 all Communication skills (Small &amp; Talkative); +10 Stealth (Small &amp; Unremarkable); +10 Lockcraft, Legerdemain, Bargaming (Light Fingers); −1 Impact on melee weapons (small size).</p>
<p><strong>Weapon affinity</strong> (set as specialization): Crossbow +10.</p>
<p><strong>Esoterics:</strong> no restriction.</p>`
    },
    {
      name: "Gnome",
      attrs: { str: -2, dex: 1, agl: 2, int: 2, aur: 1, wil: 1, hrg: 1, sml: 1 },
      mods: [ ["skill.Engineering", 10], ["skill.Stealth", 10], ["skill.Alchemy", 10], ["skill.Herblore", 10], ["impact", -1] ],
      notes: "Acceptance 2 (integrated, but their brews and gadgets cause trouble).",
      desc: `<p>Small tinker-folk — forever building and brewing.</p>
<p><strong>Applied:</strong> +10 Engineering (no machine stays a mystery); +10 Stealth (Small &amp; Unremarkable); +10 Alchemy and Herblore (a gnome always has something on the boil); −1 Impact on melee weapons (small size).</p>
<p><strong>Weapon affinity</strong> (set as specialization): Crossbow +10.</p>
<p><strong>Esoterics:</strong> no restriction.</p>`
    },
    {
      name: "Goblin",
      attrs: { str: -2, dex: 2, agl: 2, int: 2, eye: 2, hrg: 2, sml: 1 },
      mods: [ ["skill.Stealth", 10], ["skill.Lockcraft", 10], ["skill.Legerdemain", 10], ["skill.Bargaming", 10], ["skill.Alchemy", 20], ["skill.Herblore", 20], ["impact", -1] ],
      notes: "Acceptance 5 (strongly rejected despite intelligence and skill).",
      desc: `<p>Small, cunning goblinoids — quick, sharp-sensed and light-fingered.</p>
<p><strong>Applied:</strong> +10 Stealth (Small &amp; Unremarkable); +10 Lockcraft, Legerdemain, Bargaming (Light Fingers); +20 Alchemy and Herblore (a naturally gifted alchemist); −1 Impact on melee weapons (small size).</p>
<p><strong>Weapon affinity</strong> (set as specialization): Ranged weapons +10 (crossbow or bow).</p>
<p><strong>Esoterics:</strong> no restriction. <strong>Darkvision:</strong> 20 ft.</p>`
    },
    {
      name: "Ork",
      attrs: { str: 2, sta: 1, dex: 1, wil: 2, sml: 2 },
      mods: [ ["skills.communication", -20], ["endurance", 2], ["skill.Vitality", 10] ],
      notes: "Acceptance 2 (seen as a dull brute).",
      desc: `<p>Tough, aggressive goblinoids — deeds over words.</p>
<p><strong>Applied:</strong> −20 all Communication skills (tusks are poor for oratory — <em>this also lowers Awareness / Awareness - Passive / Mental Conflict, which sit in the Communication group</em>); +2 Endurance; +10 Vitality (resists disease, poison and injury).</p>
<p><strong>Natural armor</strong> (add as an item): Thick Skin B1 E2 P1 F2, plus Orc Harden Skin B3 E3 P2 F3 on Skull / Shoulder / Thorax (stacks).</p>
<p><strong>Esoterics:</strong> fully available (the Communication penalty touches Mental Conflict but is not a ban on magic).</p>`
    },
    {
      name: "Tavax",
      attrs: { str: -1, dex: 1, agl: 2, int: 1, aur: 1, wil: 1, eye: 1, hrg: 2, sml: 2 },
      mods: [ ["skill.Awareness - Passive", 10], ["skill.Unarmed Combat", 10], ["skill.Stealth", 10], ["skill.Lockcraft", 10], ["skill.Legerdemain", 10], ["skill.Bargaming", 10], ["skill.Alchemy", 10], ["skill.Lore", 10] ],
      notes: "Acceptance 4 (a suspicious stranger; trade yes, thieves no).",
      desc: `<p><em>Bestienfolk.</em> Small, quick feline folk — curious and acquisitive.</p>
<p><strong>Applied:</strong> +10 Awareness - Passive (Cat Senses); +10 Unarmed Combat; +10 Stealth, Lockcraft, Legerdemain, Bargaming (Everything Shiny is Pretty); +10 Alchemy and Lore (Natural Curiosity).</p>
<p><strong>Grants:</strong> Cat Senses skill (SB ×5); cat-tongue (ESL 90 — speaks with cats and felines; felines take you as one of their own and won't attack).</p>
<p><strong>Natural weapons</strong> (add as items): Claws I (E2), Bite I (P2).</p>
<p><strong>Natural armor</strong> (add as an item): Thick Skin B1 E2 P1 F2.</p>
<p><strong>Esoterics:</strong> no restriction. <strong>Darkvision:</strong> 30 ft.</p>`
    },
    {
      name: "Leonid",
      attrs: { str: 3, sta: 2, dex: 1, agl: 1, int: -1, aur: -1, wil: 2, eye: 1, hrg: 2, sml: 2 },
      mods: [ ["skill.Awareness - Passive", 10], ["skill.Unarmed Combat", 10], ["impact", 1] ],
      notes: "Acceptance 3 (mistaken for a lycanthrope; often works as a mercenary).",
      desc: `<p><em>Bestienfolk.</em> Massive lion-folk — born warriors and guardians.</p>
<p><strong>Applied:</strong> +10 Awareness - Passive (Cat Senses); +10 Unarmed Combat; +1 Impact (Strong Blow — <em>does not stack with natural weapons; GM adjudicates</em>).</p>
<p><strong>Grants:</strong> Cat Senses skill (SB ×5); cat-tongue (ESL 80).</p>
<p><strong>Natural weapons</strong> (add as items): Claws II (E3), Bite II (P3).</p>
<p><strong>Natural armor</strong> (add as an item): Thick Skin B1 E2 P1 F2, plus a Mane B4 E3 P2 F2 on Skull / Neck / Shoulder / Thorax (stacks).</p>
<p><strong>Esoterics:</strong> limited — max ESL 50 for Arcane and Religion (prefers blade and axe to magic and miracles); psionics unrestricted. <strong>Darkvision:</strong> 30 ft.</p>`
    },
    {
      name: "Drachenborn",
      attrs: { str: 4, sta: 3, dex: -1, agl: -1, int: -2, aur: -2, wil: 2, eye: 2 },
      mods: [ ["skill.Unarmed Combat", 10], ["impact", 1] ],
      notes: "Acceptance 5 (very poorly received — a legacy of the Drachenborn wars).",
      desc: `<p><em>Bestienfolk.</em> Towering, scaled dragon-born warriors — among the most dangerous humanoids known.</p>
<p><strong>Applied:</strong> +10 Unarmed Combat; +1 Impact (Strong Blow — <em>does not stack with natural weapons; GM adjudicates</em>).</p>
<p><strong>Natural weapons</strong> (add as items): Claws II (E3), Bite II (P3), Tail II (B3); Fire Breath I (draconic breath).</p>
<p><strong>Natural armor</strong> (add as an item): Thick Skin B1 E2 P1 F2, plus Drachenborn Scales B4 E4 P3 F3 on Skull / Neck / Shoulder / Upper Arm / Thorax / Thigh / Tail (stacks).</p>
<p><strong>Unusual anatomy:</strong> cannot wear ordinary armor — needs modified or custom-fitted armor (armorer's fee by service and type).</p>
<p><strong>Esoterics:</strong> limited — max ESL 40 for Arcane and Religion; psionics unrestricted.</p>`
    },
    {
      name: "Oni",
      attrs: { str: 2, sta: 1, dex: -1, agl: -1, int: 1, aur: 2, wil: 1, eye: 1, sml: 1 },
      mods: [ ["skill.Unarmed Combat", 10], ["skills.magic", 10] ],
      notes: "Acceptance 4 (demonic origin draws inquisitorial suspicion).",
      desc: `<p>Horned folk of demonic descent, drawn to magic and kept to society's margins.</p>
<p><strong>Applied:</strong> +10 Unarmed Combat; +10 all Arcane/Magic skills.</p>
<p><strong>Natural weapons</strong> (add as items): Horns I (P3), Tail I (B1).</p>
<p><strong>Runeless illusion:</strong> may use illusion magic without runes.</p>
<p><strong>Magic resistance:</strong> a natural, innate Dispel — every attempt to enchant you has a 50/50 chance to work; elemental damage affects you in full.</p>`
    },
    {
      name: "Blood Frenzy",
      attrs: {},
      mods: [ ["skills.combat", 10], ["impact", 1] ],
      disabled: true,
      notes: "Red Elf racial rage — enable manually below 50% Condition (no automation).",
      desc: `<p>The blood sings. When a Red Elf (or any creature the GM allows) drops below 50% Condition, a battle-fury takes hold.</p>
<p><strong>While active:</strong> +10 Combat skills (covers Close/Ranged/Unarmed/Arcane Combat and Dodge), +1 Impact.</p>
<p><strong>Use:</strong> this trait's effect is <em>disabled by default</em> — enable it when the trigger is met, disable it again on recovery. No automation.</p>`
    }
  ];

  let folder = game.folders.find(f => (f.type === "Item") && (f.name === FOLDER_NAME));
  if ( !folder ) folder = await Folder.create({ name: FOLDER_NAME, type: "Item" });

  let created = 0, replaced = 0;
  for ( const t of TRAITS ) {
    const dupes = game.items.filter(i => (i.type === "trait") && (i.name === t.name) && (i.folder?.id === folder.id));
    if ( dupes.length ) {
      await Item.deleteDocuments(dupes.map(d => d.id));
      replaced += dupes.length;
    }
    const changes = [
      ...Object.entries(t.attrs).map(([k, v]) => attr(k, v)),
      ...t.mods.map(([p, v]) => mod(p, v))
    ];
    await Item.create({
      name: t.name,
      type: "trait",
      folder: folder.id,
      system: { category: "physical", description: t.desc, notes: t.notes },
      effects: [{
        name: t.name === "Blood Frenzy" ? "Blood Frenzy" : `${t.name} (racial)`,
        transfer: true,
        disabled: !!t.disabled,
        changes
      }]
    });
    created += 1;
  }

  ui.notifications.info(`Race Traits: imported ${created} physical trait(s)` +
    (replaced ? ` (replaced ${replaced} existing)` : ``) + ` into folder "${FOLDER_NAME}".`);
  console.log("Scarmark | Race Traits import complete", { created, replaced, folder: folder.id });
})();
