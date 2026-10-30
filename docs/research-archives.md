# Research archive presentation

The default directory shows evaluation resources: benchmarks, environments, platforms,
datasets, competitions and protocols. Separate views retain related methods, surveys
and references, and records whose type still needs review. All-archive access and
existing record identities are preserved. View counts describe records, not runnable
benchmarks. Facet counts are conditional on the selected view and other filters.
Existing links with explicit kinds or searches and no view scope use the full archive.
Clearing filters preserves the selected archive scope.

Each archive has one overview, classification evidence, tasks and evaluation, and
sources and citations. Full task descriptions appear only on the task tab;
classification shows capability associations and sources. Detailed missing information
also lives on the task tab. The overview links there and separately states code and
independent-execution status.

The v2 JSON export adds `taskGroups.documented` and `taskGroups.arenaProposals`, both
lists of existing task IDs. Original task text and provenance are retained. The 24
`arena-documented-candidate` views are editorial selections rather than reproduced
original protocols. Thirteen candidate metric descriptions contain explicit source /
editorial boundaries, rendered separately without rewriting their content; remaining
candidate evaluation descriptions retain an explicit mixed-plan label. No runtime
verification or new research classification is inferred from this presentation change.

Validation: `npm run check`. Archive tests cover both languages, preserved identities,
provenance partitioning, source text preservation and non-duplicated task rendering.

## Overview descriptions and official media

`data/curation/archive-overviews.json` stores bilingual editorial descriptions with
primary sources and check dates. Links distinguish diagrams from demonstration
videos and retain the official project page as provenance. They open externally;
there is no automatic video loading. Source-informed interpretation does not add
capability mappings or runtime verification.

Other archives preview up to two already documented task descriptions and their
metrics in the overview. Candidate Arena designs remain on the task tab and are
not used to synthesize descriptions of original protocols. Source wording and
protocol versions retain their original review scope. The archive export includes
the curated overview and media metadata.
