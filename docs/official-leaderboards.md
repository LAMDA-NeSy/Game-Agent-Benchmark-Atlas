# Official leaderboard snapshots

Arena presents published results within each source's metric and protocol. It does not compute a cross-benchmark model ranking.

## Data and regeneration

- `data/curation/official-leaderboards.json`: the original BALROG and Orak boards.
- `data/curation/official-leaderboard-expansion.json`: twelve additional tracks, curated research uses, bilingual protocols, and score provenance.
- `data/sources/official-leaderboards/2026-11-01-expansion.json`: extracted official table cells and public result JSON, capture times, response hashes, and protocol-source references. Unrelated page code and credentials are excluded.
- `python3 scripts/import_additional_leaderboards.py`: deterministic regeneration of the expansion from the committed evidence snapshot. This does not fetch live results.
- `npm run check`: rebuild merged exports and validate the data and website. `dist/official-leaderboards.json` is the downloadable, merged snapshot.

## Ranking semantics

- Raw values and display precision are retained for HTML tables. Missing scores remain missing, never zero-filled.
- JSON ratings retain full source precision for ordering; rendered ratings use two decimals. HR uncertainty is retained in details.
- Reference agents are placed in a separate section and excluded from displayed competitor ranks. The source snapshot retains original rows and source IDs.
- Search filters an already ranked list, so it does not renumber results.
- PokéAgent speedrun progress is completed milestones / 26, with runtime as the tie-break. Runtime follows the official renderer's phase-time logic, including the human-reference split-time exception. Best combined splits are not described as a single uninterrupted run.
- Counts, uncertainty and partial-run runtime are context fields, not independent ranking choices. Win rates, scores and ratings retain their native meanings.
- Capture time, source-update time, last-submission time and record-update time remain distinct. An old competition retrieved today is still a historical competition.

## Integrated public results


The merged export contains native score tables by source and track. Records can repeat a model under different configurations; record counts are not distinct-model counts. Source snapshots retain their original table rows and dates.

| Source | Native tables | Records | Source/date semantics |
| --- | --- | ---: | --- |
| DuelLab GameBench 2 | Overall, reasoning variants, baseline, balanced, intensive | 642 | Release `gb2-20261107-a12a38c1543d`, generated 2026-11-07; 566 ranked and 76 provisional/partial reference rows |
| ChessBench | Existing Best view plus all thinking setups | 18 + 32 | `chessbench-v3`, results 2026-10-26; each setup has its own rating |
| StarSkirmish | v0.2 mean win rates and development cost | 9 | Official chart payload, published 2026-10-15; five run scores retained in details |
| SC2 AI Arena | Seven divisions of 2026 Season 2 | 156 | Official match data through the attributed AI Arena Recap community mirror; sync time is not a result-update date |
| Kaggle Game Arena | Unified, Chess, Go, Heads-up Poker, Werewolf | 41 + 41 + 38 + 31 + 8 | Complete public model tables, including deprecated versions; dates from result evaluation timestamps |
| ARC-AGI-3 2026 | Public competition leaderboard | 4,926 | 4,923 ranked teams and three unranked records; team latest-submission date is not the best-score date |
| TALES | Overall and five framework metrics | 40 | Author-published research results; no published result-update date; includes ScienceWorld |

DuelLab uses its source headline score, including model-caused generation failures. Aggregate-table game metrics come directly from `headline_games_json`. Its full CSV evidence includes 4,553 aggregate and per-game records; the UI imports the 642 aggregate-table records and their native game scores. Per-game CSV rows are not treated as additional models. The downloaded CSV SHA-256 matches the official release manifest. Credit: DuelLab, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); Atlas reformats fields and rounds display values, retaining source precision for sorting.

Kaggle game metrics remain distinct: pooled Bradley–Terry score for the unified board, game-specific ratings for chess/Go, Mean BB/100 for poker, and Polarix equilibrium rating for Werewolf. Numeric zero omitted by protobuf JSON is decoded as zero only when a `numericResult` object exists. An absent result remains missing. Source confidence intervals and model deprecation status are retained. Kaggle `CENTS` values remain cents (¢), not USD. `PERCENTAGES` values and intervals are multiplied by 100 for display. Display-column mappings take precedence over task-internal labels; Werewolf’s per-turn visible labels versus per-game task names are documented in its protocol details.

ARC's public competition table is not the final private-test leaderboard. The capture includes every returned team, retaining official source ranks and the source's displayed score precision. Individual team-member profile/thumbnail data are omitted from the stored evidence. Large tables use 50-row pagination; search operates over the complete track before pagination.

#### Rebuilding and evidence

`python3 scripts/import_maintained_leaderboards.py` calls `scripts/leaderboard_snapshots.py` to regenerate the maintained curation **offline**. `npm run check` builds the site and validates it; it does not fetch live scores. Captured evidence is stored in `data/sources/official-leaderboards/2026-11-02-integration/`, including raw official JSON, the deterministic gzip of DuelLab CSV, release manifest, StarSkirmish chart data, Kaggle public API responses and protocol pages, and the SC2 community mirror response. `capture.json` records retrieval provenance. The earlier Best/TALES extracts remain intact.

“Maintained” classifies the external source's evidenced updates; it does not imply automatic Atlas synchronization. Refreshing a source requires a new evidence capture, protocol/version checks, regeneration and deployment. Source result timestamps, release dates, team submission timestamps, community mirror sync and Atlas collection times remain separate.

#### Results-first presentation

The right panel shows the source title/type and date, one research-use sentence, a short protocol key and source links, then track/metric/search controls and the score table. Full scope, scoring rules, budgets, statistical details, attribution and collection time are folded below the table, accessible through the header's evaluation-protocol action. Metric selection includes ScienceWorld directly; the archive link remains available.

The default score is visually primary. Optional columns are chosen per source; configuration, match counts, costs or confidence intervals are shown where relevant. Source ranks are retained when supplied for the primary metric; alternate metrics use an explicit order label, never an invented official rank. Provisional, partial and other reference entries stay separate. Partial DuelLab Overall rows retain their official rank and incomplete-evidence label; provisional rows have no source rank. Searching does not renumber results. Every table is native, without an iframe or browser-side dependency on the external source.

### Navigation refinement (2026-11-02)

Board type is a horizontal filter above the list/detail layout. Research direction is collapsed by default; its active condition remains visible as a removable chip. There is one source count (matching / 19), and no collection selector or repeated per-source status label. Existing `arenaCollection` links are accepted with the complete source scope; the obsolete parameter is removed on the next interaction.

Changing filters preserves the selected track, metric and agent search. If the selected track is excluded, the detail pane asks the user to choose a matching source or clear filters; it does not silently select another track or display out-of-filter scores. A source with mixed track types remains selectable via its matching track. Explicit selection, filters and metric/search values persist across language changes and reload. With no explicit source in an incoming link, the first matching source is selected.

The Arena header scrolls with the document instead of overlapping the page title. The source list retains its own 16 px sticky offset once the header has scrolled away. The 19-row index fits 1366×768 and larger tested desktop viewports without an inner scroll region. Original score data, protocols, historical tracks and evaluation tools are preserved.

Validation for this integration: 50 automated checks; all 37 tracks rendered in both languages at 1366×768, with focused 1200×900 and 1440×900 checks. No horizontal overflow or JavaScript errors were observed. Verified track/metric changes, whole-track search, original-rank persistence, pagination, entry details, protocol access, filter exclusion/restoration, language/reload persistence, ScienceWorld and evaluation-tool navigation.

Weekly source updates use `data/sources/official-leaderboards/current-overrides.json` to select a dated capture per file. The 2026-11-10 captures update DuelLab and SC2 only; other capture dates remain unchanged. The weekly audit records unresolved live checks separately.

## Kaggle and TextArena follow-up (2026-11-10)

Kaggle provides unauthenticated JSON downloads at `https://www.kaggle.com/api/v1/benchmarks/kaggle/{slug}/leaderboard` (slugs: `game-arena`, `chess-text`, `go`, `poker-heads-up`, `werewolf`). Cross-check these against the public page's `GetBenchmark` and `GetUnifiedBenchmarkLeaderboard` responses: the page response supplies source ranks, model IDs and display-column mappings. A direct request returning 404 is not evidence that the public page has no data; the same read request succeeded in a fresh, signed-out browser session.

The importer accepts both `run.result` and exactly one `run.results` element. For result dates it prefers an explicit native `evaluationDate`, then the official download's explicit `evaluationDate`; it never substitutes the Atlas retrieval timestamp or a generic benchmark-page edit time. The public download and native response agree on all 477 numeric cells and intervals in this capture. Source date semantics can differ by response format, so a run's `endTime` is not automatically treated as its evaluation date. General, chess and Go scores were updated on 2026-11-09 UTC; poker and Werewolf retain their original dates.

TextArena's official page calls the public Supabase RPC `get_leaderboard_from_mv_trueskill_humans_models` with `skill_subset`. Observe the signed-out page's own response; do not extract, replay or commit client keys. The earlier description of the shipped key as anonymous was not established and is superseded by this credential-free collection procedure. Inspect `Balanced Subset` and the `is_standard` and `is_active` flags. The 2026-11-10 response is byte-identical to the previous 21-row snapshot: all 21 standard models are inactive. An additional `All` query returned 860 model/human configurations, 55 standard models and no active entries. This does not establish that the entire TextArena project is abandoned; the existing Balanced track remains historical and its result-update date remains unknown.

Follow-up evidence is in `data/sources/official-leaderboards/2026-11-10-followup/`; overrides select each source independently. ARC's fresh public response contains 4,926 rows. Previous captures remain in their original dated directories, rather than being merged into current standings.

The weekly task now invokes `npm run refresh:public-leaderboards` for these five
Game Arena tracks and TextArena. See [weekly-updates.md](weekly-updates.md) for
staging, cross-checks and failure retention. ARC remains a separate weekly check;
it is not silently included in this command. Offline imports and builds never
contact these endpoints.
