# Official leaderboard snapshots

Arena presents published results within each source's metric and protocol. It does not compute a cross-benchmark model ranking.

## Data and regeneration

- `data/curation/official-leaderboards.json`: the original BALROG and Orak boards.
- `data/curation/official-leaderboard-expansion.json`: twelve additional tracks, curated research uses, bilingual protocols, and score provenance.
- `data/sources/official-leaderboards/2026-11-01-expansion.json`: extracted official table cells and public result JSON, capture times, response hashes, and protocol-source references. Unrelated page code and credentials are excluded.
- `python3 scripts/import_additional_leaderboards.py`: deterministic regeneration of the expansion from the committed evidence snapshot. This does not fetch live results.
- `npm run check`: rebuild merged exports and validate the data and website. `dist/official-leaderboards.json` is the downloadable, merged snapshot.

## November 1, 2026 expansion

12 new boards from 10 projects; 268 source records including 65 reference records. Combined with the original four boards: 16 boards and 344 records.

| Board | Records | Scope |
| --- | ---: | --- |
| LMGame-Bench | 24 | Model track, six games |
| VideoGameBench | 3 | Full real-time setting, ten test-game slots |
| GAMEBoT | 17 | Eight-game aggregate; later pairwise matches are separate |
| Procgen 2020 | 11 | Generalization final; includes IMPALA reference |
| NetHack 2021 | 17 | Final Overall, not Final Academic |
| Melting Pot 2023 | 25 | Generalization board; includes random reference |
| MineRL 2021 | 12 | Research round 2, not Introduction track |
| TextArena | 21 | Balanced Subset standard-model results, all marked inactive by source |
| PGG-Bench | 19 | Author-published multi-pass TrueSkill table |
| PokéAgent 2025 Gen 1 OU | 40 | Frozen qualifying results, including organizer baselines |
| PokéAgent 2025 Gen 9 OU | 57 | Frozen qualifying results, including organizer baselines |
| PokéAgent 2025 speedrun | 22 | Emerald through the first gym, including human/organizer references |

## Ranking semantics

- Raw values and display precision are retained for HTML tables. Missing scores remain missing, never zero-filled.
- JSON ratings retain full source precision for ordering; rendered ratings use two decimals. HR uncertainty is retained in details.
- Reference agents are placed in a separate section and excluded from displayed competitor ranks. The source snapshot retains original rows and source IDs.
- Search filters an already ranked list, so it does not renumber results.
- PokéAgent speedrun progress is completed milestones / 26, with runtime as the tie-break. Runtime follows the official renderer's phase-time logic, including the human-reference split-time exception. Best combined splits are not described as a single uninterrupted run.
- Counts, uncertainty and partial-run runtime are context fields, not independent ranking choices. Win rates, scores and ratings retain their native meanings.
- Capture time, source-update time, last-submission time and record-update time remain distinct. An old competition retrieved today is still a historical competition.

## Verification

The expansion passed 35 automated checks and browser checks of all 16 boards in both languages, every selectable metric, missing ratings, reference sections, search-rank stability, detailed results, and retained evaluation-tool navigation. Desktop widths of 1200 and 1440 pixels were checked. Both existing data exports and the original four source tables are preserved.

### Board status and date hierarchy (2026-11-02)

`data/curation/official-leaderboard-metadata.json` classifies each imported **track or result batch**, independently of the score records. Five tracks are open boards (BALROG LLM/VLM, Orak performance/battles, VideoGameBench Full); eight are historical competition rounds or archived model batches; three are fixed author-published result batches (LMGame model, GAMEBoT aggregate, PGG multi-pass). “Open” requires an official submission route or an explicit statement accepting new submissions; it does not promise continuous updates or live synchronization. VideoGameBench explicitly describes author-run hidden tests for new submissions in its repository. “Fixed” describes the collected experimental batch, not a claim that its project will never publish further results. TextArena's historical designation applies only to the imported inactive Balanced Subset records, not the entire service. Per-track bilingual reasons and evidence links appear under protocol/provenance.

The prominent date preserves the source field's semantics: source-page update (Orak), score-data update (PokéAgent qualifying JSON), latest record update (PokéAgent speedrun), or latest submission among collected records (BALROG and the four AIcrowd rounds). Missing update dates are explicitly shown as unpublished, without inferring a date from paper publication, code commits, or Atlas collection. The collection date remains secondary below source links. No score, ranking, reference baseline, evaluation protocol, or snapshot capture time is altered by this presentation metadata.

The left index retains its existing 30/32 px rows, with short textual status labels; environment counts remain in the detail panel. Full track names and status remain available in button tooltips and accessible names. Typography uses the existing local font stack and tabular numerals, with the score date emphasized separately from collection metadata.
