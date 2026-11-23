/**
 * Scarmark — Import: Midland name tables
 * ------------------------------------------------------------------
 * Creates three RollTables in the RollTable folder "Midland Names":
 *   - Midland Names           200 male given names (1d200)
 *   - Midland Names (Female)   50 female given names (1d50)
 *   - Midland Surnames        200 surnames for both sexes (1d200): about half are
 *                             places of origin ("aus Honibrk"), the rest are classic
 *                             family names (Kramer, Schröder, Kowalski, Novak ...)
 * Old Czech, German and Polish names mixed together, a few real historical figures
 * and roughly 30 % jokes with easter eggs.
 *
 * Draw a name and a surname, e.g. "Mathyas" + "aus Honibrk".
 *
 * HOW TO USE: as GM, create a new "Script" macro, paste this, Execute.
 * Re-running replaces tables of the same name in that folder.
 */

const TABLES = [
  {"name": "Midland Names", "description": "Male given names of Midland: Old Czech, German and Polish names, a handful of real historical figures and a good dose of jokes. Roll 1d200.", "entries": ["Jakub", "Oswald", "Vlach", "Kuno Kuhfladen", "Mikulas", "Dietmar Dunnbier", "Bohus", "Vinoslav", "Zdenek", "Jeronym Prazsky", "Wawrzyniec", "Lubor", "Kazimierz", "Dobroslav", "Maciej", "Wladyslaw Jagiello", "Hrichomir", "Michal", "Cenek", "Wenzel", "Hynek Neumyl", "Jan Hus", "Vilem Prdelka", "Hanus Hrabivy", "Hynek", "Smrtimir", "Rupert Ruchlos", "Pivoslav", "Veit Verdammt", "Kiejstut", "Zdzislaw", "Zbynek", "Prokop Holy", "Jakob Fugger", "Hubertus Hochmut", "Wit", "Wladek Wodka", "Radoslaw", "Cenek Cernokneznik", "Jan Zizka", "Eberhard", "Tomasz", "Tilman", "Stach", "Hermann", "Wilhelm", "Vlad Tepes", "Oswald Ohneland", "Zehntus Eintreiber", "Vaclav", "Mscislaw", "Erhard", "Hanus", "Vlach Pochybny", "Dietrich", "Albrecht Durer", "Dobiesz", "Mathyas Pivoun", "Ciesnek", "Johannes Gutenberg", "Lukas", "Sambor", "Drahomir", "Bogumil", "Zbigniew Zakonnik", "Ablassius", "Balthasar Beichtgeheimnis", "Wolfram", "Albrecht", "Otto Ohnesorge", "Jorg", "Velen", "Radim", "Bartos", "Gottlieb Strohfeuer", "Egon", "Matyas Korvin", "Milos", "Jaromir", "Leopold", "Stach Kielbasa", "Piotr", "Mieszko", "Georg", "Zikmund Lucemburk", "Lorenz Leichenfledderer", "Kvasek", "Havel Svedomity", "Werner", "Krzesimir", "Ales", "Piotrek", "Havel", "Zygmunt", "Jiri Podebradsky", "Konrad", "Ludwig", "Ctibor", "Mieszko Piwosz", "Till Eulenspiegel", "Chlastoslav", "Petr Chelcicky", "Honza Kocourek", "Bogdan Bimber", "Janusz", "Heinrich", "Benes", "Pius Peinlich", "Marcin", "Swietoslaw", "Szymon", "Kunz Halbvoll", "Bonifaz Zweitmeinung", "Kaspar", "Rudolf", "Smil Flaska", "Burkhard", "Lech", "Gerhard", "Hladimir", "Kunes", "Sigmund Sunderlos", "Sieciech", "Lenoslav", "Hieronymus Lugenbaron", "Hrdon", "Johann Faust", "Dobes", "Janusz Jasnowidz", "Ratibor", "Svinoslav", "Spalimir", "Zawisza Czarny", "Vaclav Kuchar", "Heribert Halbmond", "Zbigniew", "Ostoja", "Fidelis Brennholz", "Ondrej", "Wojciech", "Czeslaw", "Bohuslav", "Lorenz", "Bohumil Lahvac", "Vojtech", "Prokop", "Eckhart Eisenbart", "Ignaz Fastenbrecher", "Veit", "Strachomir", "Vit", "Lumir", "Boleslaw", "Jarek", "Friedrich", "Jan Dlugosz", "Berthold", "Balthasar", "Mordomir", "Karel Lucemburk", "Ctibor Hladovy", "Anselm", "Dluzimir", "Jaroslaw", "Krvomir", "Hugo", "Walter Weihrauch", "Walter", "Stanislaw", "Jarek Nezapomnetlivy", "Matthias", "Stepan", "Siegfried", "Cestmir", "Rupert", "Otto", "Hartmut", "Jan Zelivsky", "Mikolaj", "Jan Rokycana", "Gniewomir", "Eckhart", "Bartosz", "Bronislaw", "Nikolaus", "Jorg Galgenstrick", "Mikolaj Kopernik", "Przemysl", "Sobeslav", "Bogdan", "Kacirimir", "Dobromir", "Vratislav", "Fritz", "Ulrich", "Zbynek Opilec", "Kunes Dlouhoprsty", "Sigmund", "Mathyas", "Ludwig Lasterhaft"]},
  {"name": "Midland Names (Female)", "description": "Female given names of Midland: Old Czech, German and Polish names, a few historical women and some jokes. Roll 1d50.", "entries": ["Grzymislawa", "Libuse Vestkyne", "Marketa", "Hana", "Grete Gutenacht", "Dorota", "Dobromila", "Agnes", "Swietoslawa", "Dobrawa", "Grete", "Johanna Orleanska", "Elsbeth Eisenjungfrau", "Wanda", "Elschka", "Anezka Ceska", "Katharina Kettenhund", "Eliska", "Kunhuta Uherska", "Wanda Wodka", "Mscislawa", "Katerina", "Jitka Jedovata", "Malgorzata", "Mechthild", "Marketa Pivovarka", "Hedwig Haubenlos", "Irmgard", "Bozena Nemcova", "Danuta", "Elsbeth", "Agnes Ablass", "Adelheid", "Barbora Brennnessel", "Trude Trinkfest", "Bronislawa", "Vlasta", "Ursula Unkenruf", "Jadwiga Jagiellonka", "Zdenka Zlomysl", "Bogna", "Jitka", "Anezka", "Kunigunde", "Hedwig", "Dorota Dorn", "Zofie Bavorska", "Gertrud", "Barbora", "Gryzelda"]},
  {"name": "Midland Surnames", "description": "Surnames of Midland, for men and women alike: places of origin (\"aus ...\") and classic family names, with some jokes. Roll 1d200.", "entries": ["aus Pivovarov", "aus Landbrunn", "Mazur", "Schuster", "Kral", "Schnapsnase", "Henkersknecht", "aus Lindek", "aus Kostice", "Ketzerjagd", "aus Mordsburg", "Marek", "Müller", "aus Bialice", "Hajek", "aus Goldlos", "aus Weissbrunn", "Gorzalka", "aus Grunwald", "Pivoun", "aus Hirschfeld", "Kucera", "aus Hirschice", "Kramer", "aus Fressdorf", "Bierbauch", "Wozniak", "aus Hochhof", "aus Dolni Prdelov", "aus Pfennigfuchs", "Pijanski", "aus Peklo", "aus Kostibrk", "aus Radow", "aus Althorn", "aus Kalany", "Vesely", "aus Dubov", "aus Schnapsburg", "Urban", "Cerny", "aus Pestdorf", "aus Birkenov", "Jankowski", "aus Forhorn", "aus Galgenberg", "Cermak", "Schneider", "Fischer", "Plesnivy", "Nemam", "Dvorak", "Zeman", "aus Hexenkessel", "aus Domazlice", "Zimmermann", "aus Wolftal", "Richter", "Schröder", "Smrdutka", "Sedlacek", "Bezdomny", "aus Zborky", "Kozlowski", "aus Eichov", "Chlopek", "aus Neutal", "Wisniewski", "Fleischer", "aus Solau", "aus Hochek", "Seiler", "aus Rudice", "Becker", "Habenichts", "aus Gnieek", "aus Landwald", "aus Kocourkov", "aus Javice", "aus Smrdov", "aus Korheim", "aus Niederhof", "aus Elfenbrand", "aus Zlotek", "aus Dubtal", "Wagner", "aus Turek", "aus Belanik", "Kacirsky", "aus Landek", "aus Lipany", "aus Barstein", "aus Vlkany", "Navratil", "aus Sedibrk", "aus Vlkin", "aus Eisenhorn", "Weihwasser", "aus Morek", "Lewandowski", "aus Krassk", "Faulpelz", "aus Turany", "Nezbeda", "Novak", "Nimmersatt", "Benes", "aus Salzstein", "Böttcher", "aus Lipice", "Michalski", "aus Staribrk", "Nowak", "Szymanski", "Pokorny", "aus Kleinen Pfuhl", "aus Bratwurstheim", "aus Lanov", "aus Korwald", "Kowalczyk", "Schlagetot", "aus Henkersbach", "Schäfer", "aus Ketzerbach", "aus Kamenek", "aus Lesbrunn", "aus Lanin", "aus Saufeld", "Pawlowski", "Horak", "aus Hochbrunn", "aus Zlotice", "aus Holov", "Neumann", "Zielinski", "aus Kalov", "Koch", "aus Vlkibrk", "aus Hungerdorf", "aus Lubice", "Bezbozny", "Dolezal", "aus Hradnik", "Maurer", "aus Steinbrunn", "aus Svinov", "aus Waldbach", "Ruzicka", "aus Ablassdorf", "Niedzwiedz", "aus Schilda", "Kaminski", "Bauer", "aus Totenwald", "Dabrowski", "Pestbeule", "Ablasskrämer", "Nemec", "Dluzny", "Weber", "Fuhrmann", "Prochazka", "Köhler", "Nevim", "Fiala", "aus Konstanz", "aus Vitkov", "Piotrowski", "Pospisil", "aus Bumbalov", "Krawczyk", "aus Lindau", "Scheinheilig", "Wirth", "aus Falkental", "aus Liphof", "Krol", "Kowalski", "aus Hirschdorf", "Kolar", "Wojcik", "Svoboda", "Grabowski", "aus Scheiterhaufen", "Zakalec", "Jelinek", "aus Leichenfeld", "Gerber", "aus Bergheim", "aus Horni Pupky", "Hoffmann", "aus Honibrk", "Galgenvogel", "Nezmar", "aus Lenochov", "Krüger", "aus Lindhorn", "aus Folterwald", "Totengräber", "aus Zlathof"]}
];

(async () => {
  if (!game.user?.isGM) return ui.notifications.error("Name tables: must be run by a GM.");
  const FOLDER_NAME = "Midland Names";
  let folder = game.folders.find(f => f.type === "RollTable" && f.name === FOLDER_NAME);
  if (!folder) folder = await Folder.create({ name: FOLDER_NAME, type: "RollTable" });

  let created = 0, replaced = 0;
  for (const t of TABLES) {
    const dupes = game.tables.filter(rt => rt.name === t.name && rt.folder?.id === folder.id);
    if (dupes.length) { await RollTable.deleteDocuments(dupes.map(d => d.id)); replaced += dupes.length; }
    const n = t.entries.length;
    await RollTable.create({
      name: t.name,
      folder: folder.id,
      formula: `1d${n}`,
      description: t.description,
      replacement: true,
      displayRoll: true,
      results: t.entries.map((name, i) => ({ type: CONST.TABLE_RESULT_TYPES.TEXT, name, weight: 1, range: [i + 1, i + 1] }))
    });
    created++;
  }
  ui.notifications.info(`Midland names: ${created} table(s) created` + (replaced ? ` (replaced ${replaced})` : "") + ` in the folder "${FOLDER_NAME}".`);
})();
