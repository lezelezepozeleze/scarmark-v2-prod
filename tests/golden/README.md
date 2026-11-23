# Golden fixtures

Golden-master tests: every fixture case holds an input and the output the code produced when it was captured. `npm run golden` (and `npm test`) re-run the current code and fail on any difference. Never edit `input` or `expected` of an existing case; only adapters.mjs may change, to point at moved code (docs/AGENTS.md).

## Committed vs local

- Committed, `tests/golden/*.json`: the hand-written mechanic fixtures (inputs in `inputs/<mechanic>.mjs`) and two real-data samples, `compendium-items-sample.json` (46 items) and `compendium-actors-sample.json` (21 actors), source `"executed:sample"`. The samples use the `compendium-items` / `compendium-actors` adapters (name aliases in adapters.mjs). Actors from `world.*` packs in the sample are anonymized; `scarmark.*` data ships with the system and is kept as is.
- Local only, `tests/golden/local/` (gitignored): the full real-data fixtures `compendium-items.json` (1185 cases) and `compendium-actors.json` (160 cases), and their frozen data in `local/data/<pack-id>.json`. `world.actors` is the GM's private world content: never commit anything from this folder.

`npm run golden` and `npm test` run the local fixtures when the folder exists and print `local real-data fixtures: N cases`, or `local real-data fixtures: not present (skipped)` without failing.

## Import (local)

    node tests/tools/import-compendium-fixtures.mjs <export>/compendiums

Reads the Foundry compendium export (plain JSON, nothing executed) and writes `tests/golden/local/data/`.

## Capture

    npm run golden -- --capture <mechanic> [--force]
    npm run golden -- --capture compendium-items --local [--force]
    npm run golden -- --capture compendium-actors --local [--force]

The compendium mechanics read the local data and can only be captured with `--local` (into `tests/golden/local/`). `--force` only when the inputs change on purpose, never to make a comparison pass.

## Select the committed sample

    node tests/tools/select-compendium-sample.mjs [--dry-run]

Builds the two `*-sample.json` files from the local full set: greedy cover of per-case feature signatures plus a few cases per document type, anonymization of `world.*` actors with a proof that the anonymized input gives the original expected values, and a leak check of the samples and the git-tracked tree for private world names, ids and free text. Fails loudly when a proof or the leak check fails. Deterministic: same local data, same sample.

## Mutation check (dev tool, not in npm test)

    node tests/tools/mutation-check.mjs

Applies each of a list of small mutations to a temp copy of `module/` and reports whether the full local set, the committed sample and the hand-written fixtures kill it. Fails when the full set kills a mutation the sample misses; then extend the features in select-compendium-sample.mjs and reselect. Needs `tests/golden/local/`.
