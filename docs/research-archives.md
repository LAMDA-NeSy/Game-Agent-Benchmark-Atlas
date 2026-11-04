# Research archives

## Discovery and filtering

Research themes and the resource directory share `discovery-model.js` and the same
archive identities. A theme applies a capability filter. Scope tabs distinguish
evaluation resources, related methods, references and records awaiting review.
Counts represent research records, not runnable benchmarks.

Different facets combine with AND. Within a facet, choices use OR by default;
agent and capability filters also support matching all selected values. Facet
counts apply the other active filters. Clearing conditions preserves the selected
archive scope. Search includes titles, authors, documented tasks, goals and metrics.

Discovery associations distinguish bibliographic screening, record-level
associations and task-specific evidence. Editorial Arena proposals do not add
capability evidence. The original classification and source records are retained.

## Tasks and protocols

`task-protocol-model.js` supplies the shared task representation. Curated protocols
are stored in `data/curation/task-protocol-p0.json` and the other source-linked task
reviews. Each task has a stable ID, resource and game associations, evidence and a
protocol type. Goals, observations, actions, metrics and configuration are bilingual.
Version, budget and termination fields remain empty where not separately documented.

Task links use `detail=<resource>&archiveTab=protocol&task=<task-id>`.
Full protocols appear on the task tab; the overview previews relevant tasks and
metrics. Generic interface descriptions are omitted when concrete protocols exist.
Code availability and independently verified execution remain separate fields.

The archive JSON export separates `taskGroups.documented` from
`taskGroups.arenaProposals`, using existing task IDs. Tasks with origin
`arena-documented-candidate` are editorial selections. Their proposed evaluation
settings must remain distinct from original published protocols.

## Overviews and media

`data/curation/archive-overviews.json` stores bilingual descriptions in four sections:

- Tasks and environment: the agent's decisions, observations and task progression.
- Research use: the research questions the resource supports.
- Evaluation: measured outcomes, metrics and score meanings.
- Evaluation scope: versions, splits and the settings covered by the protocol.

Primary sources and check dates accompany each overview. Editorial review evidence
lives in `data/curation/archive-overview-review.json`. Batch metadata is retained
for traceability; it does not define a separate public catalog.

Official media retain source links and captions distinguishing gameplay, diagrams
and representative examples. Videos are external links and do not autoplay.
Generated illustrations are labeled separately. Updating an overview or its media
does not change task coverage or execution-verification status.

## Validation

Run `npm run check` after changes. Checks cover bilingual descriptions, archive
identities, source preservation, discovery consistency, filtering, task links and
the distinction between documented protocols and editorial proposals. Rebuild and
commit generated `dist/` exports with their source changes.
