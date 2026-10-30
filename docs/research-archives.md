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

## Ten-archive editorial pilot

The `pilot-10` batch covers Bench-MFG, BALROG, TeamCraft, Crafter, SMAC, Katakomba,
CivRealm, Collab-Overcooked, MiniGrid & MiniWorld, and Procgen. Each has three
bilingual paragraphs covering task mechanism, research use, evaluation and scope.
Examples are identified as subsets of the full resource. Eight media links retain
official provenance and distinguish architecture diagrams from gameplay demos.
Katakomba's official repository was confirmed from its paper; this updates code
availability without changing task, capability or independent-execution reviews.

The pilot is discoverable through `libraryReview=overview-pilot` in the archive directory.

Pilot overviews use four parallel sections: tasks/environment, research use, evaluation,
and evaluation scope. Scope is descriptive rather than prescriptive; code and runtime
review statuses remain in their structured fields. The overview omits redundant
selection/limitation blocks when these four sections are available.

## First expansion batch

Twenty further resources have source-reviewed four-section descriptions in both
languages, covering Minecraft learning, language interaction, memory/exploration,
and multi-agent games. Eleven additional media links point to official repository
assets or an author-linked video. Captions distinguish gameplay, environment
illustrations, finite-task observations and example diagnostic results.

`libraryReview=overview-structured` selects all 30 structured overviews;
`libraryReview=overview-expansion` selects these 20 additions. The 236 evaluation
resources retain their existing identities and task/capability reviews. Remaining
resources keep their earlier summaries until subsequent editorial review.

## Completion of the evaluation-resource scope

All 236 current evaluation resources have bilingual sections for task/environment,
research use, evaluation and scope. The `completion-206` batch preserves the previous
30 edited overviews and adds the remaining 206. This includes datasets, diagnostic
evaluations, statistical protocols, development/world-model resources and platforms
under their actual research object, rather than inheriting gameplay claims.

`libraryReview=overview-structured` selects all 236;
`libraryReview=overview-completion` selects the new 206.
`archive-overview-review.json` records the primary identities and source checks for
this pass. Detailed numerical protocol statements also use the existing source-linked
reviews; completing descriptions does not promote task or runtime verification.
Official illustrations and demos retain source captions and representative-task scope.
