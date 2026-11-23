/**
 * Scarmark — Set Magic Missiles (one-off GM macro, requires 1.0.43-beta+)
 * HOW TO USE: reload the world (F5), paste into a Script macro, run as GM.
 * Choose "Report only" first, then "Apply".
 *
 * Marks every missile that uses Arcane Combat as a Magic Missile (it then spends
 * Spirit Capacity instead of ammo) and sets its Class from the spell of the same
 * name ("3 Firebolt III" gives Firebolt III Class 3). Covers the Arcane
 * compendium, world Items and the items of world actors. Safe to run again.
 * Unlinked tokens keep their own copies: re-drop the missile from the compendium
 * or tick Magic Missile by hand there.
 */
(async () => {
  if (!game.user.isGM) return ui.notifications.warn("GM only.");
  const mode = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Set Magic Missiles" },
    content: `<div class="form-group"><label>Mode</label><select name="mode"><option value="report">Report only</option><option value="apply">Apply</option></select></div>`,
    ok: { label: "Run", callback: (e, b) => b.form.elements.mode.value }, rejectClose: false
  });
  if (!mode) return;
  const apply = mode === "apply";

  const pack = game.packs.get("scarmark.arcane");
  const spells = (await pack.getDocuments()).filter(d => d.type === "spell");
  const classByName = new Map();
  for (const s of spells) {
    const m = s.name.match(/^(\d+)\s+(.*)$/);
    if (m) classByName.set(m[2].replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase(), Number(m[1]));
  }
  const classFor = (name) => classByName.get(name.replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase());

  const report = [];
  const handle = async (item, where) => {
    if (item.type !== "missile" || item.system.associatedSkill !== "arcane") return;
    const cls = classFor(item.name);
    const upd = { "system.magic": true };
    if (cls) upd["system.spellClass"] = Math.min(6, Math.max(1, cls));
    const same = item.system.magic && (!cls || item.system.spellClass === cls);
    report.push(`${where}: ${item.name} -> Class ${cls ?? "(no spell found, left as is)"}${same ? " (already set)" : ""}`);
    if (apply && !same) await item.update(upd);
  };

  const wasLocked = pack.locked;
  if (apply && wasLocked) await pack.configure({ locked: false });
  for (const d of await pack.getDocuments()) await handle(d, "Arcane pack");
  if (apply && wasLocked) await pack.configure({ locked: true });
  for (const i of game.items) await handle(i, "World item");
  for (const a of game.actors) for (const i of a.items) await handle(i, `Actor ${a.name}`);

  console.log(report.join("\n"));
  ui.notifications.info(`${apply ? "Applied" : "Report only"}: ${report.length} Magic Missile(s). Details in the console (F12).`);
})();
