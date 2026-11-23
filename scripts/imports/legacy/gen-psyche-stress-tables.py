# -*- coding: utf-8 -*-
"""Generate a Foundry VTT Script-macro that imports the English Psyche/Stress RollTables."""
import openpyxl, json, re, io, sys, datetime
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SRC = r"C:\Users\danbe\Desktop\Scarmark Documents\RULES v1\Tables\Scarmark_Psyche Traits and Stress.xlsx"
OUT = r"D:\Projekty\Scarmark\scripts\imports\import-psyche-stress-tables.js"

wb = openpyxl.load_workbook(SRC, data_only=True)

def rng(s):
    """'01-06' / '71-71' / '72-100' / '6' -> [lo, hi]."""
    nums = [int(n) for n in re.findall(r"\d+", str(s))]
    if len(nums) == 1:
        return [nums[0], nums[0]]
    return [nums[0], nums[1]]

def esc(s):
    """Minimal HTML escaping for text baked into a result string."""
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")).strip()

def result(range_cell, name, desc):
    name = esc(name)
    desc = esc(desc)
    return {"range": rng(range_cell), "text": f"<strong>{name}.</strong> {desc}"}

def rows(ws):
    return list(ws.iter_rows(values_only=True))

tables = []

# ---------- Sheet: Psyche Traits ----------
ws = wb["Psyche Traits"]
R = rows(ws)
# main EN table: find "Psyche Traits (EN)" header, data starts 2 rows below
def find_row(R, text, col=0):
    for i, r in enumerate(R):
        if r[col] is not None and str(r[col]).strip() == text:
            return i
    raise ValueError(f"header not found: {text}")

h = find_row(R, "Psyche Traits (EN)")
main = []
i = h + 2  # skip the "1d100 | Trait | Description" header row
while i < len(R):
    a, b, c = R[i][0], R[i][1], R[i][2]
    if a is None and b is None and c is None:
        break
    name = str(b).strip() if b is not None else ""
    if name == "Severity Roll":   # meta-note row, not a d100 outcome; folded into description below
        i += 1
        continue
    main.append(result(a, b, c))
    i += 1

tables.append({
    "name": "Psyche Traits",
    "formula": "1d100",
    "description": ("Roll 1d100 to determine a character's pronounced Psyche trait. "
                    "For results 01\u201370, also roll on the <em>Psyche Trait Severity</em> "
                    "table to set how strongly the trait manifests."),
    "results": main,
})

# severity EN table
h = find_row(R, "Psyche Trait Severity (EN)")
sev = []
i = h + 2
while i < len(R):
    a, b, c = R[i][0], R[i][1], R[i][2]
    if a is None and b is None and c is None:
        break
    sev.append(result(a, b, c))
    i += 1
tables.append({
    "name": "Psyche Trait Severity",
    "formula": "1d6",
    "description": ("Roll 1d6 to determine how strongly a Psyche trait manifests. "
                    "The Will multiplier shown is the target for the roll made to resist acting on the trait."),
    "results": sev,
})

# ---------- Sheets: Panic & Fear (EN sub-tables live in columns E,F,G = idx 4,5,6) ----------
def en_subtables(sheet, blocks):
    ws = wb[sheet]
    R = rows(ws)
    out = []
    for title, formula, desc in blocks:
        # find the header in column E (idx 4)
        hi = None
        for i, r in enumerate(R):
            if len(r) > 4 and r[4] is not None and str(r[4]).strip() == title:
                hi = i; break
        if hi is None:
            raise ValueError(f"{sheet}: header not found: {title}")
        res = []
        j = hi + 2  # skip the "1d6 | Reaction | Effect" row
        while j < len(R):
            row = R[j]
            a = row[4] if len(row) > 4 else None
            b = row[5] if len(row) > 5 else None
            c = row[6] if len(row) > 6 else None
            if a is None and b is None and c is None:
                break
            res.append(result(a, b, c))
            j += 1
        out.append({"name": title.replace(" (EN)", "").strip(),
                    "formula": formula, "description": desc, "results": res})
    return out

tables += en_subtables("Panic", [
    ("Panic Test Failure (EN)", "1d6", "Outcome of a failed Panic test."),
    ("Panic Test Critical Failure (EN)", "1d6", "Outcome of a critically failed Panic test."),
])
tables += en_subtables("Fear", [
    ("Fear Test Failure (EN)", "1d6", "Outcome of a failed Fear test."),
    ("Fear Test Critical Failure (EN)", "1d6", "Outcome of a critically failed Fear test."),
])

# ---------- sanity report ----------
for t in tables:
    lo = t["results"][0]["range"][0]
    hi = t["results"][-1]["range"][1]
    print(f'{t["name"]:<28} {t["formula"]:<6} results={len(t["results"]):>2}  span={lo}-{hi}')
    # contiguity check
    prev = None
    for r in t["results"]:
        a, b = r["range"]
        if prev is not None and a != prev + 1:
            print(f'   !! gap/overlap before range {r["range"]} (prev hi {prev})')
        prev = b

data_js = json.dumps(tables, ensure_ascii=False, indent=2)

gen_date = datetime.date.today().isoformat()
macro = '''/**
 * Scarmark \u2014 Import: Psyche Traits & Stress RollTables (English)
 * ---------------------------------------------------------------
 * Source : Scarmark_Psyche Traits and Stress.xlsx  (sheets: Psyche Traits, Panic, Fear)
 * Creates 6 RollTables inside a "Psyche & Stress" RollTable folder.
 * Generated %s. Auto-generated \u2014 edit the source sheet and regenerate rather than hand-editing.
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

  const TABLES = %s;

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
''' % (gen_date, data_js)

import os
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8", newline="\n") as f:
    f.write(macro)
print("\nWROTE:", OUT, f"({len(macro)} bytes)")
