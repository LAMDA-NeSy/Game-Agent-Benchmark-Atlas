# Weekly Atlas updates

Both streams run every Monday at 10:00 Asia/Shanghai (02:00 UTC), beginning
9 November 2026. The local Codex recurring task performs the checks and publishes
to GitHub Pages; GitHub Pages itself only serves the resulting static files.
The local task runner must be available. The UI deadline is a planned check time,
not a promise of new results from external leaderboard maintainers.

## Independent completion records

`data/curation/update-schedule.json` is the published schedule, with separate
`benchmarks` and `leaderboards` records. Initial `lastCompletedAt` values are null:
older content edits are not evidence of a completed weekly cycle. Source result
dates and snapshot dates remain in their existing records.

For each run:

1. Inspect repository instructions and existing changes before editing. Keep an
   audit report under `data/sources/weekly-updates/YYYY-MM-DD/` with sources
   checked, retrieval times, changes, unresolved items and verification results.
2. Leaderboards: fetch current maintained-source results and protocols. Preserve
   raw evidence, dates, rank rules, units, configurations and historical records.
   Existing importers may use dated captures: update captures and importer paths
   before importing. Rebuilding an old capture does not constitute a check.
   A source that fails retrieval remains unchanged and is listed in the report.
3. Benchmarks: inspect the existing literature collection for new evaluation
   resources and verify papers/project documentation. Deduplicate records and
   synchronize tasks, protocols, games, research themes and filter counts.
   Surveys and methods without an evaluation resource are not new benchmarks.
4. Complete each stream independently. Only after its required checks succeed,
   set its `lastCompletedAt` to the actual UTC completion instant and its `report`
   to the audit-report path. Advance `nextScheduledAt` to the first Monday at
   02:00 UTC strictly after completion. Update `revisionAt` to the current UTC
   time. A successful check with no changes counts; a failed or partial check
   does not. Leave failed streams' deadlines and completion records unchanged.
5. Run `npm run check`, inspect the affected UI, commit the explicit changes and
   publish to GitHub Pages. Verify the deployment and the published schedule.
   If deployment fails, report the failure; the public site retains its previous
   completion record until a successful deployment. Do not claim it was updated.

The browser counts down to the stored deadline. It shows “Update pending” after
that deadline and never advances the deadline by itself. It refreshes published
metadata every five minutes and on returning to the tab; offline copies retain
their bundled schedule. Countdown text is bilingual and uses the same UTC+8
schedule regardless of the viewer's time zone.
