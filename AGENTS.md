# Scarmark publishing instructions for all AI collaborators

## Developing the system (code, tests, sheets, macros)

This is the first thing to read when the task is to change the Foundry system itself. Read `docs/AGENTS.md` before you change anything: start with "Before you start: look first, keep the docs alive" and "How to work". Search for what already exists before you write anything and reuse the shared helpers it lists; work like a careful senior engineer; keep the docs alive in the same change. The publishing instructions below are only for publishing work (books, illustrations, Word documents), not for code. You may be written to in Czech: answer in the language of the user, but write code, comments, docs and commit messages in English.


Before Scarmark publishing work, read:

- `C:/Users/danbe/Desktop/Scarmark Documents/Logs/Scarmark_Visual_Standard.md`
- `C:/Users/danbe/Desktop/Scarmark Documents/AI/AGENTS.md`

These contain the author's **2026-09-28** publishing update, version 1.4. Visual references: `Scarmark_Rules_Herblore and Alchemy_done.docx` and `Scarmark_Esoterics_3.4_Arcana_done.docx` in the document workspace's `SCARMARK RULES Beta/`.

Use unified Palatino Linotype, the exact approved parchment, left-aligned burgundy Word Title / Název, left-aligned quotation sources and black table borders. Remove unwanted white exterior illustration margins. Always check spelling and language. New prose uses the Erminfriedian chronicler's voice and direct second-person singular player address, informed by the current Beta rule collection.

Four books: **Scarmark_Rules**, **Scarmark_Esoterics**, **Scarmark_Wiki**, **Scarmark_GM**. Read their scopes in the standard. Use the author's current `Artwork/` illustration references. Illustration prompts and artwork-specific notes go to the document workspace's **`Artwork/Prompts/`**; other AI support files go to **`AI/`** and shared log entries to **`Logs/Scarmark_AI_Log.md`**.

Preserve author edits, mechanics, formulas and data; respect the scope of each task and verify finished publishing output visually. This supersedes obsolete publishing notes and `RULES v1/` paths without changing game mechanics or Foundry application CSS.

## Shared log and rule authority — 2026-09-28

The following four user-facing files stay together in `C:/Users/danbe/Desktop/Scarmark Documents/Logs/` (paths below are relative to the document workspace root):

- `Logs/Scarmark_AI_Log.md`: the single shared ChatGPT/Codex/Claude log. “Zapiš do logu” always means append here. Read the current file before appending; date and attribute the entry, preserve other assistants' entries, and distinguish decisions, completed work and pending work. Do not create parallel system logs.
- `Logs/Scarmark_Noncodex Instructions.md`: maintained instructions for ordinary ChatGPT/Claude chats outside Codex that cannot access local folders. The author authorized creation on 2026-09-28; update the shared file while preserving other contributors’ work and incrementing its version.
- `Logs/Scarmark_System setup.md`: consolidated record of Foundry settings and implemented rules, currently being authored by Claude. Do not overwrite concurrent work. **Actual current Foundry implementation/settings take precedence over rule documents when interpretation is unclear or conflicting.** If this record is missing, stale or incomplete, verify Foundry rather than guessing. An explicit new author decision can change a rule.
- `Logs/Scarmark_Visual_Standard.md`: authoritative publishing appearance and editorial style.

Other AI support files, general working notes, scripts, intermediate outputs and QA artifacts go under **`Scarmark Documents/AI/`**. The previously specified **`Artwork/Prompts/`** remains for illustration prompts and notes directly tied to artwork; it is not the general AI notes directory. Root `AGENTS.md` and `CLAUDE.md` are minimal discovery entry points, not additional logs. Old logs are historical references; new log entries go only to `Logs/Scarmark_AI_Log.md`.

**“Zkontroluj log” means read all four files in `C:/Users/danbe/Desktop/Scarmark Documents/Logs/` in full**, including the entire shared log and applicable current instructions, not only the latest entry or the shared-log file. If a file is long, read it in successive sections without skipping content. Apply newer decisions over superseded historical entries; report missing or empty sources rather than assuming their contents. “Zapiš do logu” means append only to `Logs/Scarmark_AI_Log.md`.
