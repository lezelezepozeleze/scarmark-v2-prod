/**
 * Scarmark — Import: Psyche Traits & Stress RollTables (English)
 * ---------------------------------------------------------------
 * Source : Scarmark_Psyche Traits and Stress.xlsx  (sheets: Psyche Traits, Panic, Fear)
 * Creates 6 RollTables inside a "Psyche & Stress" RollTable folder.
 * Generated 2026-09-09. Auto-generated — edit the source sheet and regenerate rather than hand-editing.
 *
 * HOW TO USE
 *   1. In Foundry (as GM), open the Macros directory and create a new macro of type "Script".
 *   2. Paste this whole file into it and Execute. (Or drag this file onto the macro hotbar.)
 *   3. Re-running is safe: tables of the same name inside the folder are replaced, not duplicated.
 */
(async () => {
  if (!game.user?.isGM) return ui.notifications.error("Psyche & Stress import: must be run by a GM.");

  const FOLDER_NAME = "Psyche & Stress";
  const TEXT = CONST.TABLE_RESULT_TYPES.TEXT;

  const TABLES = [
  {
    "name": "Psyche Traits",
    "formula": "1d100",
    "description": "Roll 1d100 to determine a character's pronounced Psyche trait. For results 01–70, also roll on the <em>Psyche Trait Severity</em> table to set how strongly the trait manifests.",
    "results": [
      {
        "range": [
          1,
          6
        ],
        "text": "<strong>Trauma.</strong> A specific trigger takes you back to a terrifying experience. The smell of burning, a particular voice or the sound of chains can drown out the present. Work with the GM to define the trigger and your response based on your past."
      },
      {
        "range": [
          7,
          8
        ],
        "text": "<strong>Nightmares.</strong> Terrifying images return in your sleep. You wake up, cry out or put off going to bed. Night does not always bring you rest."
      },
      {
        "range": [
          9,
          10
        ],
        "text": "<strong>Addiction.</strong> You repeatedly seek alcohol, tobacco or another chosen substance and struggle to resist a chance to indulge. Obtaining it can influence your decisions and spending. Of course, you have everything under control. You are just running low on supplies."
      },
      {
        "range": [
          11,
          12
        ],
        "text": "<strong>Survivor's Guilt.</strong> You hold yourself responsible for someone's suffering or death. You struggle to accept help and may put yourself in danger to repay your imagined debt."
      },
      {
        "range": [
          13,
          14
        ],
        "text": "<strong>Fear of Divine Wrath.</strong> You fear that your god is constantly watching and judging your actions."
      },
      {
        "range": [
          15,
          16
        ],
        "text": "<strong>Fear of Magic.</strong> Spellcasting, enchanted objects and unexplained phenomena make you anxious and urge you to keep your distance."
      },
      {
        "range": [
          17,
          18
        ],
        "text": "<strong>Elvenphobia.</strong> You feel uneasy around elves and want to avoid them or question their motives. Their composure and longevity unsettle you. Surely nobody should have that much time and so few wrinkles."
      },
      {
        "range": [
          19,
          20
        ],
        "text": "<strong>Fear of Death and the Dead.</strong> Corpses, burial grounds and reminders of your own mortality fill you with revulsion. You struggle to touch bodies, enter tombs or remain near the deceased."
      },
      {
        "range": [
          21,
          22
        ],
        "text": "<strong>Fear of Confinement.</strong> You panic in cramped spaces, collapsed passages and situations with no means of escape."
      },
      {
        "range": [
          23,
          24
        ],
        "text": "<strong>Fear of Heights.</strong> Cliffs, ladders and unsecured walkways make you dizzy and send you searching for a firm hold. You find the scenery much prettier from below."
      },
      {
        "range": [
          25,
          26
        ],
        "text": "<strong>Fear of the Dark.</strong> When you lose sight of your surroundings, you expect danger. You seek light, company and reassurance that the noise really was a branch."
      },
      {
        "range": [
          27,
          28
        ],
        "text": "<strong>Fear of Fire.</strong> Open flames, fires or the prospect of burning to death urge you to back away. The range of things that frighten you depends on the trait's severity."
      },
      {
        "range": [
          29,
          30
        ],
        "text": "<strong>Fear of Deep Water.</strong> You find water threatening when you cannot touch the bottom. You may manage a ford, but swimming or travelling by boat takes some persuading."
      },
      {
        "range": [
          31,
          32
        ],
        "text": "<strong>Pyromania.</strong> Fire fascinates you. You feel an urge to set things alight, feed the flames or watch them burn. Temptation can outweigh both purpose and caution. When asked why something is on fire, you usually have a more interesting answer than anyone else."
      },
      {
        "range": [
          33,
          34
        ],
        "text": "<strong>Fear of Many-Legged Vermin.</strong> Insects, spiders, centipedes and similar vermin fill you with revulsion and an urge to get away."
      },
      {
        "range": [
          35,
          36
        ],
        "text": "<strong>Fear of Predatory Beasts.</strong> You tense up around dogs, wolves and other predatory beasts and seek cover or a safe distance. Growling and bared teeth intensify your reaction. “He only wants to play” is not enough reassurance."
      },
      {
        "range": [
          37,
          38
        ],
        "text": "<strong>Grudge Against Cats.</strong> You distrust cats, dislike letting them near your belongings and struggle to tolerate their presence. You take their behaviour as a personal provocation. That cat knows exactly what it did."
      },
      {
        "range": [
          39,
          40
        ],
        "text": "<strong>Fear of Rats.</strong> Rats, mice and their scurrying or scratching make you uneasy. You need to get out of their reach. A rodent's size is no reliable measure of the size of your reaction."
      },
      {
        "range": [
          41,
          42
        ],
        "text": "<strong>Chronic Womanising.</strong> You feel an urge to flirt, court and seek romantic attention, even at inappropriate moments. You take “diplomatic relations” very personally. Choose your preferences to suit your character."
      },
      {
        "range": [
          43,
          44
        ],
        "text": "<strong>Pride Before the Fall.</strong> You struggle to admit mistakes, accept advice or turn down a challenge to your abilities. Your plan was excellent. The others simply carried it out badly."
      },
      {
        "range": [
          45,
          46
        ],
        "text": "<strong>Short Fuse.</strong> You react quickly to insults, opposition and frustration with anger. You act or speak before considering the consequences."
      },
      {
        "range": [
          47,
          48
        ],
        "text": "<strong>Compulsive Curiosity.</strong> You struggle to leave mysteries unanswered, other people's conversations unheard and closed doors unnoticed. You need to know what lies inside, even when you have good reason to leave."
      },
      {
        "range": [
          49,
          50
        ],
        "text": "<strong>Compulsive Gambling.</strong> A wager and an uncertain outcome appeal to you more than sensible security. You usually take a loss as a compelling reason to try one more game."
      },
      {
        "range": [
          51,
          52
        ],
        "text": "<strong>Sticky Fingers.</strong> You feel an urge to take things that belong to others. It does not matter that you do not need them."
      },
      {
        "range": [
          53,
          54
        ],
        "text": "<strong>Need to Prove Your Courage.</strong> You need to prove to yourself and others that you are not afraid. You struggle to accept caution or retreat, especially when someone is watching."
      },
      {
        "range": [
          55,
          56
        ],
        "text": "<strong>Superstitious Rituals.</strong> You need to observe particular customs, omens and protective rituals. Skipping one makes you uneasy. After all, tapping your sword hilt twice has never killed anyone."
      },
      {
        "range": [
          57,
          58
        ],
        "text": "<strong>Need for Control.</strong> You struggle to delegate, tolerate uncertainty or accept changes to the plan. You are happy to let others have their own opinion, provided it agrees with yours."
      },
      {
        "range": [
          59,
          60
        ],
        "text": "<strong>Resentment.</strong> You struggle to forgive humiliation, wrongs and betrayal. You always seize a chance for revenge, sometimes regardless of the consequences."
      },
      {
        "range": [
          61,
          62
        ],
        "text": "<strong>Chronic Suspicion.</strong> You look for obligations behind kindness and intent behind coincidence. You struggle to trust others or accept help. You would check a gift horse's alibi."
      },
      {
        "range": [
          63,
          64
        ],
        "text": "<strong>Saviour Complex.</strong> You struggle to accept that you cannot help someone. You take on other people's problems, promise too much and risk yourself even for those who refuse your help."
      },
      {
        "range": [
          65,
          66
        ],
        "text": "<strong>Empty Sack Syndrome.</strong> You feel an urge to carry off objects of doubtful use and struggle to part with them. You see opportunities in a rusty hinge, a cracked pot and six feet of rope. “This will come in handy.”"
      },
      {
        "range": [
          67,
          68
        ],
        "text": "<strong>Hero of Your Own Ballad.</strong> You need to appear heroic and dignified. You seek dramatic entrances and places where your cloak billows nicely. You struggle to accept ridiculous or humiliating solutions. Saving a village disguised as a washerwoman will be a personal trial."
      },
      {
        "range": [
          69,
          70
        ],
        "text": "<strong>Aversion to Authority.</strong> You struggle to accept orders, prohibitions and lectures from people who wield power over you. Even a reasonable request invites an argument if delivered with enough condescension. You would cooperate more willingly if they had not just ordered you to."
      },
      {
        "range": [
          71,
          71
        ],
        "text": "<strong>Two Personality Traits.</strong> You really are a case! Roll twice on this table."
      },
      {
        "range": [
          72,
          100
        ],
        "text": "<strong>No Pronounced Trait.</strong> You gain no additional Psyche trait. You determine your own personality and ordinary flaws."
      }
    ]
  },
  {
    "name": "Psyche Trait Severity",
    "formula": "1d6",
    "description": "Roll 1d6 to determine how strongly a Psyche trait manifests. The Will multiplier shown is the target for the roll made to resist acting on the trait.",
    "results": [
      {
        "range": [
          1,
          3
        ],
        "text": "<strong>Mild (Will x 5).</strong> You usually keep yourself under control."
      },
      {
        "range": [
          4,
          5
        ],
        "text": "<strong>Moderate (Will x 3).</strong> You need considerable self-control."
      },
      {
        "range": [
          6,
          6
        ],
        "text": "<strong>Severe (Will x 1).</strong> You often lose control."
      }
    ]
  },
  {
    "name": "Panic Test Failure",
    "formula": "1d6",
    "description": "Outcome of a failed Panic test.",
    "results": [
      {
        "range": [
          1,
          3
        ],
        "text": "<strong>Nervousness.</strong> You suffer −10 to Combat skills and Esoterics."
      },
      {
        "range": [
          4,
          5
        ],
        "text": "<strong>Trembling.</strong> You suffer −20 to Combat skills and Esoterics."
      },
      {
        "range": [
          6,
          6
        ],
        "text": "<strong>Hesitation.</strong> You lose your action. You can only defend."
      }
    ]
  },
  {
    "name": "Panic Test Critical Failure",
    "formula": "1d6",
    "description": "Outcome of a critically failed Panic test.",
    "results": [
      {
        "range": [
          1,
          3
        ],
        "text": "<strong>Panic.</strong> You suffer −20 to Combat skills and Esoterics."
      },
      {
        "range": [
          4,
          5
        ],
        "text": "<strong>Freezing Up.</strong> You lose your action but can still defend."
      },
      {
        "range": [
          6,
          6
        ],
        "text": "<strong>Flight.</strong> Flee to safety at full movement. You can only defend."
      }
    ]
  },
  {
    "name": "Fear Test Failure",
    "formula": "1d6",
    "description": "Outcome of a failed Fear test.",
    "results": [
      {
        "range": [
          1,
          2
        ],
        "text": "<strong>Dread.</strong> Combat Skills and Esoterics −30; you cannot willingly approach the source."
      },
      {
        "range": [
          3,
          4
        ],
        "text": "<strong>Defensive Reflex.</strong> You lose your action. You can only defend."
      },
      {
        "range": [
          5,
          5
        ],
        "text": "<strong>Terrified Flight.</strong> You use your full movement to reach safety; you can only defend at −10."
      },
      {
        "range": [
          6,
          6
        ],
        "text": "<strong>Frozen in Fear.</strong> You cannot act or move. You can only defend at −20."
      }
    ]
  },
  {
    "name": "Fear Test Critical Failure",
    "formula": "1d6",
    "description": "Outcome of a critically failed Fear test.",
    "results": [
      {
        "range": [
          1,
          2
        ],
        "text": "<strong>Overwhelmed by Horror.</strong> You lose your action. You can only defend at −20."
      },
      {
        "range": [
          3,
          4
        ],
        "text": "<strong>Blind Terror.</strong> You use your full movement to reach safety; you can only defend at −20."
      },
      {
        "range": [
          5,
          5
        ],
        "text": "<strong>Paralysed.</strong> You cannot act or move. You can only defend at −30."
      },
      {
        "range": [
          6,
          6
        ],
        "text": "<strong>Emotional Breakdown.</strong> You cannot act, move, defend or react consciously. Fully incapacitated."
      }
    ]
  }
];

  // Find or create the RollTable folder.
  let folder = game.folders.find(f => (f.type === "RollTable") && (f.name === FOLDER_NAME));
  if ( !folder ) folder = await Folder.create({ name: FOLDER_NAME, type: "RollTable" });

  let created = 0, replaced = 0;
  for ( const t of TABLES ) {
    // Remove any existing table of the same name in this folder (clean re-import).
    const dupes = game.tables.filter(rt => (rt.name === t.name) && (rt.folder?.id === folder.id));
    if ( dupes.length ) {
      await RollTable.deleteDocuments(dupes.map(d => d.id));
      replaced += dupes.length;
    }
    const results = t.results.map(r => ({
      type: TEXT,
      text: r.text,
      weight: 1,
      range: r.range
    }));
    await RollTable.create({
      name: t.name,
      folder: folder.id,
      formula: t.formula,
      description: t.description ?? "",
      replacement: true,
      displayRoll: true,
      results
    });
    created += 1;
  }

  ui.notifications.info(`Psyche & Stress: imported ${created} RollTable(s)` +
    (replaced ? ` (replaced ${replaced} existing)` : ``) + ` into folder "${FOLDER_NAME}".`);
  console.log("Scarmark | Psyche & Stress import complete", { created, replaced, folder: folder.id });
})();
