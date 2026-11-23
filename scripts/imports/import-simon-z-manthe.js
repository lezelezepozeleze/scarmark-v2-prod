/**
 * Scarmark — Import: Šimon z Manthé (30 miraculous details of Erminfried's life)
 * ------------------------------------------------------------------
 * Creates the RollTable "Šimon z Manthé" (1d30) in the RollTable folder "Erminfried".
 * Every entry is a verse of the preacher Šimon z Manthé from "Skutečná pravda Erminfriedská"
 * in the voice of the Story of Erminfried: an absurdly pious claim about the miraculous, perfectly
 * handsome Erminfried that nobody is supposed to doubt. The verses contradict each other now and then
 * (the preacher is not a reliable witness), which is part of the joke. Verse numbers are unique and
 * do not repeat the ones already quoted in the Story (12, 33, 41, 49, 53, 63, 87, 97, 103, 112, 139).
 *
 * HOW TO USE: as GM, create a new "Script" macro, paste this, Execute.
 * Re-running replaces the table of the same name in that folder.
 */

const SOURCE = "kazatel Šimon z Manthé, Skutečná pravda Erminfriedská";
const VERSES = [
  [5, "Erminfried jednou ve chrámu kýchl a vitráže všechny se samy zakryly, aby na Sličného nepadl prach."],
  [8, "Když Erminfried po prvé spatřil moře, moře se zastydělo a ustoupilo o tři dny cesty, aby Sličný nemusel hleděti na vlhkost."],
  [17, "Erminfried nikdy nezmokl. Déšť, spatřiv jej jíti, zdvořile nad ním vyčkával, dokud neprojde."],
  [21, "Kozu, která Erminfrieda zkusila nabrati na rohy, stihla spravedlnost. Od oné chvíle rodí pouze jehňata. Nikdo neví proč, a všichni se tomu klanějí."],
  [24, "Jedenkráte přinesli Erminfriedovi dary tři knížata ze tří krajin. Erminfried přijal pouze lžíci, neb ostatní dary by dojímaly ty, kdo žádné nemají."],
  [27, "Erminfried znal jména všech svých vojínů, i těch, kteří se ještě nenarodili. Mnohý rekrut se tázal, odkud jej zná. Erminfried toliko mlčel a usmíval se."],
  [30, "Erminfried nikdy nezabloudil, neomdlel a neztratil cestu. Když cesta zahnula jinam, než chtěl, byla od téhož dne přeložena."],
  [35, "Jedno zrnko soli, jež Erminfried omylem ukápl, vyklíčilo a vzrostlo ve strom. Solný strom ten dosud stojí poblíž Falzenbergu a žádný pták mu neublíží."],
  [38, "Erminfriedův stín chodil vždy o krok za ním z úcty a nikdy jej nepředešel, ani když Erminfried běžel."],
  [44, "Kdykoli Erminfried zívl, o čtvrt hodiny později se v nejbližší vsi rozhostil klid a všichni psi ztichli."],
  [46, "Hospodský z Kurrfurstu poslal Erminfriedovi účet za pivo. Erminfried zaplatil a mince se mu vrátila do kapsy, neb ani peníze nesnesly myšlenku, že by byly od něj pryč."],
  [51, "Erminfried dovedl rozmnožiti chléb. Pětkrát se pokusil rozmnožiti i pivo, ale pivo mu pokaždé pravilo, že je již na jeho počest vypito."],
  [58, "Když Erminfried procházel lesem, stromy se mu uklonily. Jeden dub se neuklonil a Erminfried jej beze slova minul. Dub se do roka zastyděl a uschl."],
  [61, "Na Erminfriedově meči nebylo nikdy rzi. Neb rez se bála."],
  [66, "Erminfried jedl toliko chléb a pil toliko vodu. Chléb byl vždy sladký jako med a voda chutnala jako nejlepší víno, a kdokoli jiný z nich okusil, měl žaludek již navždy rozmazlený."],
  [70, "Erminfried se jednou podíval na slunce a slunce mrklo první."],
  [72, "Když Erminfried umlkl, nemluvil po sedm dní nikdo v celém kraji, neb se nikdo neodvážil mluviti hlasitěji než jeho ticho."],
  [75, "Erminfried jednou zazpíval. Slavíci, kteří poslouchali, se rozhodli, že již nikdy nezazpívají, aby si neudělali ostudu."],
  [78, "Zlá bába u studny spatřila Erminfrieda a oslepla krásou. Trvalo jí sedm let, než pochopila, že žízniti přestala."],
  [81, "Dítě, jež se Erminfrieda dotklo, nebylo již nikdy nemocné. Pouze příliš rozmazlené, neb mu pak každý sliboval hory doly."],
  [84, "Erminfriedova družina marně hledala jeho stopy v bahně. Bahno je totiž z úcty nepřijalo, a tak Erminfried šel vždy po ostrůvku suché země, který se před ním sám tvořil."],
  [90, "Erminfried vstoupil jednou do elfského kostela a svatý obraz se sám obrátil ke zdi, neb nesnesl pohled Sličného."],
  [92, "Erminfriedův plášť nebyl nikdy špinavý. Špína, spatřivši jej, ihned onemocněla a odešla se léčit do jiného kraje."],
  [95, "Tělo Erminfriedovo nevonělo potem. Vonělo čerstvým chlebem, dubovým dřevem a lehce spravedlností."],
  [99, "Když Erminfried dřímal, což činil zřídka, vítr se zastavil, aby jej nevzbudil. Námořníci pak sedm dní proklínali a plakali, a poté jej začali uctívati."],
  [105, "Erminfried jednou vzal ze stolu jablko a kousl. Jablko pravilo: „Děkuji, Pane.“ Od dob oněch každé jablko nese jednoho červa, aby si pamatovalo, že Pána nepoznalo včas."],
  [108, "Když Erminfried hleděl na žebráka, žebrák zbohatl. Když hleděl na boháče, boháč zbledl a obdaroval církev."],
  [115, "Erminfried jednou vyřkl na koně slovo a kůň se rozhodl, že jej již nikdy nebude nést, neb se necítil hoden. Erminfried šel tedy sedm mil pěšky a kůň šel za ním a zpíval žalm."],
  [120, "Erminfried se jednou zasmál příliš hlasitě. Od oné chvíle se v Karamoru nikdo nemůže smáti, aniž by si na to vzpomněl."],
  [126, "Kdo Erminfrieda spatřil, nikdy již nezapomněl. Kdo jej nespatřil, vyprávěl o něm déle než ten, kdo spatřil."]
];

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("Šimon z Manthé: must be run by a GM.");
  const FOLDER_NAME = "Erminfried";
  const TABLE_NAME = "Šimon z Manthé";
  let folder = game.folders.find(f => f.type === "RollTable" && f.name === FOLDER_NAME);
  if (!folder) folder = await Folder.create({ name: FOLDER_NAME, type: "RollTable" });

  const dupes = game.tables.filter(rt => rt.name === TABLE_NAME && rt.folder?.id === folder.id);
  if (dupes.length) await RollTable.deleteDocuments(dupes.map(d => d.id));

  const n = VERSES.length;
  await RollTable.create({
    name: TABLE_NAME,
    folder: folder.id,
    formula: `1d${n}`,
    description: "30 verses of the preacher Šimon z Manthé from Skutečná pravda Erminfriedská: miraculous, unbelievably true details of the life of Erminfried Sličný. Roll 1d30.",
    replacement: true,
    displayRoll: true,
    results: VERSES.map(([verse, text], i) => ({
      type: CONST.TABLE_RESULT_TYPES.TEXT,
      name: `„${text}“ (${SOURCE}, verš ${verse})`,
      weight: 1,
      range: [i + 1, i + 1]
    }))
  });
  ui.notifications.info(`Šimon z Manthé: table with ${n} verses created in the folder "${FOLDER_NAME}".`);
})();
