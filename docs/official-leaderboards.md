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

### Maintained-source curation (2026-11-02)

The index is organized by **source**, with tracks selected in the detail panel. Eight selected sources appear by default; all 19 sources remain accessible through the collection selector. The original 16 tracks and 344 records are unchanged. Seven new tracks add 58 score records, bringing the export to 23 tracks and 402 records.

| Selected source | Classification | Date provenance | Presentation |
| --- | --- | --- | --- |
| Kaggle Game Arena | Maintained | Go results: 2026-10-19; unified date unverified | Source links for unified/chess/Go/poker/Werewolf boards |
| DuelLab GameBench 2 | Maintained | Leaderboard page: 2026-11-01 | Source standings and release archive |
| ChessBench | Maintained | Results: 2026-10-26 | Complete Best view, 18 model configurations |
| StarSkirmish | Maintained, versioned | v0.2 results: 2026-10-15 | v0.2 mean win rate and separate v0.1 link |
| SC2 AI Arena | Seasonal | Latest match date unverified | Official ladder and attributed community Recap |
| ARC-AGI-3 2026 | Seasonal | Latest submission date unverified | Official competition board; deadline is separate |
| BALROG | LLM maintained; VLM research reference | Latest collected submissions: 2026-09-20 / 2025-04-25 | Existing LLM and VLM result snapshots |
| TALES | Research reference | Source table has no results-update date | Complete 40-configuration table, including ScienceWorld |

“Maintained” describes the external source's evidenced updates, not automatic Atlas synchronization. StarSkirmish updates by release. Submission availability alone is insufficient: Orak and VideoGameBench remain research references until recent scores are confirmed. Old competitions and the inactive TextArena batch remain historical; the classification applies to the collected track, not the entire service.

`data/curation/maintained-leaderboards.json` contains the source index, seven new tracks, bilingual protocols, maintainer identity and sourced classification metadata. `python3 scripts/import_maintained_leaderboards.py` regenerates it offline from the two committed source-table extracts and curated primary-source notes. The two evidence files are `data/sources/official-leaderboards/2026-11-02-{chessbench,tales}.json`. ChessBench preserves the displayed Best view, not all thinking variants; TALES retains each framework score and the source overall score without recomputing the aggregation. Two TALES naming discrepancies between overview and framework tables are normalized only for row matching; source rows remain intact.

Five sources use explicitly labeled external-result panels, not empty local tables. Their zero local records mean that results are accessed at the source, not that the competition has no submissions. This avoids implying that a partial or stale snapshot is a live board. Public pages were verified through the web reader; several endpoints reject direct programmatic fetching. No fabricated score rows, refresh dates, or cross-source rankings are introduced.

ScienceWorld is connected as a TALES framework metric, with a reciprocal link from archive GAB032. It is not a new standalone ScienceWorld ranking, and the score scope is TALES's tasks and configuration. Model providers are distinguished from evaluating or submitting organizations.

The prominent date retains source semantics (results, page update, submission, or version release); missing date verification is distinguished from a date not published by the source. A community-view sync time, season deadline, paper date, code commit, and Atlas retrieval date never substitute for the score date. Collection dates remain secondary.

Validation: 43 automated checks; browser checks at 1366×768, 1440×900 and 1200×900 in Chinese and English. All eight selected entries fit without clipping. Verified source/type/direction filters, empty results, track selection, search and ranking, language/reload persistence, ScienceWorld archive navigation, retained legacy scores and evaluation tools.
