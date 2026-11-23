/**
 * Scarmark — Import: Tarot Arcana (Container actors)
 * ----------------------------------------------------
 * Creates one Container actor per Major Arcana card (0 Fool … 23 Erminfried),
 * named "<Number> <Name>", with the card art from systems/scarmark/artwork/arcana
 * as both the actor portrait and the token image. Token settings mirror D.'s
 * hand-made "0 Fool": 2 × 3 × 1 grid spaces (X × Y × Z), Neutral disposition,
 * image fit "contain", name shown on hover, unlinked.
 * The card back (24 Card Back) is not an arcana and is not imported.
 *
 * Re-running is safe: a Container actor with the same name is UPDATED (portrait,
 * token image/size/disposition, folder); its contents are never touched.
 * A card whose image is missing on the server is skipped and listed.
 *
 * HOW TO USE: Foundry (as GM) -> Macros -> new "Script" macro -> paste -> Execute.
 */

const FOLDER_NAME = "Arcana"; // Actor folder for the cards; set to null to leave them at the root
const ART_DIR = "systems/scarmark/artwork/arcana/";

const CARDS = [
  [0, "Fool"], [1, "Magician"], [2, "Elf"], [3, "Wild Woman"], [4, "King"],
  [5, "Canonist"], [6, "Lovers"], [7, "Oath"], [8, "Chariot"], [9, "Monster"],
  [10, "Strength"], [11, "Hermit"], [12, "Wheel of Fortune"], [13, "Justice"],
  [14, "Hanged Man"], [15, "Karnoth"], [16, "Temperance"], [17, "Demon"],
  [18, "Tower"], [19, "Star"], [20, "Moon"], [21, "Sun"], [22, "Inquisition"],
  [23, "Erminfried"]
];

if (!game.user.isGM) return ui.notifications.warn("Arcana import: run this as the GM.");

// Same encoding the FilePicker stores (spaces -> %20), e.g. ".../Card%200%20Fool.png".
const artPath = (n, title) => ART_DIR + encodeURIComponent(`Card ${n} ${title}.png`);

async function artExists(path) {
  try { return (await fetch(foundry.utils.getRoute(path), { method: "HEAD" })).ok; }
  catch { return false; }
}

let folderId = null;
if (FOLDER_NAME) {
  const folder = game.folders.find(f => f.type === "Actor" && f.name === FOLDER_NAME)
    ?? await Folder.create({ name: FOLDER_NAME, type: "Actor" });
  folderId = folder.id;
}

const tokenData = (name, img) => ({
  name,
  width: 2,
  height: 3,
  depth: 1,
  disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
  displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
  actorLink: false,
  texture: { src: img, fit: "contain" }
});

const created = [], updated = [], missing = [];
for (const [n, title] of CARDS) {
  const name = `${n} ${title}`;
  const img = artPath(n, title);
  if (!(await artExists(img))) { missing.push(name); continue; }

  const existing = game.actors.find(a => a.type === "container" && a.name === name);
  if (existing) {
    await existing.update({ img, folder: folderId, prototypeToken: tokenData(name, img) });
    updated.push(name);
  } else {
    await Actor.create({ name, type: "container", img, folder: folderId, prototypeToken: tokenData(name, img) });
    created.push(name);
  }
}

const esc = (s) => Handlebars.escapeExpression(s);
const line = (label, list) => list.length
  ? `<div class="card-line"><b>${label} (${list.length}):</b> ${list.map(esc).join(", ")}</div>` : "";
await ChatMessage.create({
  whisper: ChatMessage.getWhisperRecipients("GM"),
  content: `<div class="scarmark-card test-card">
    <div class="card-title">Arcana import</div>
    ${line("Created", created)}${line("Updated", updated)}${line("Missing image, skipped", missing)}
  </div>`
});
ui.notifications.info(`Arcana import: ${created.length} created, ${updated.length} updated${missing.length ? `, ${missing.length} skipped` : ""}.`);
