# Task comparison and Arena composition

The P1 workspace compares concrete documented tasks and assembles research
evaluation plans. It does not execute environments or produce model scores.

## Shared task identity

`data/curation/evaluation-design.json` binds each of the 24 representative Arena
candidates to one canonical ID in `ATLAS_DATA.documentedTasks`. The binding must
match both the resource identity and the specific game. The browser's
`evaluation-model.js` resolves task descriptions, observations, actions, metrics,
controls and evidence from that protocol. Archives, comparison columns and Arena
therefore refer to the same protocol rather than maintaining parallel copies.

`task-protocol-p1.json` adds two SmartPlay protocols, Hanoi3Disk and the HighLow
two-armed bandit, from official implementation and evaluation configuration files.
The build currently exports 440 documented task views and 24 historical Arena
proposals. Historical proposals are excluded from task selection and cannot be
used as evidence for the bindings. The old `arena-model.js` remains for historical
catalog regression tests; the website no longer loads it.

## Comparison

`benchmark-comparison.js` provides resource selection and task-protocol modes.
Each task column selects exactly one source protocol. A resource can occupy more
than one column to compare its own tasks; the table has at most four columns.
When opened from a game, available protocols stay within that game's scope.
Missing protocols remain missing rather than borrowing another game's task.

The difference filter compares field values, not semantic equivalence. Protocol
choices, additional columns and display mode are encoded in the comparison URL.
A selected protocol can be added directly to Arena.

## Research design and composition

The design file also holds four starting templates and five curated task-pair
relationships. Research questions, interface tracks, task roles and relationship
judgments are editorial interpretations of the linked protocols. Experimental
suggestions are separate from source defaults.

- MiniGrid Memory / Endless Mortar Mayhem: delayed cue retention and accumulating
  instruction sequences, with different observation and control demands.
- Collab-Overcooked / ZSC-Eval Overcooked: language-mediated division of labor and
  coordination with independently trained partners.
- Procgen CoinRun / original CoinRun: alternative level-generalization protocols;
  they share one mechanism in the composition analysis.
- BALROG Crafter / Factorio Learning Environment open-play: survival/crafting
  progression and persistent production-network development.
- Orak StarCraft II / SMACv2: full-game strategic management and tactical
  multi-agent micromanagement.

These are not automatically matched controlled experiments. Unreviewed pairs
remain unreviewed. Removing a task reports which catalogued mechanism or sole
primary purpose would be lost; adding a repeated protocol is deduplicated by ID.
No sum of heterogeneous native scores is computed.

## Persistence and exports

Arena starts empty and offers four editable templates. Search includes all
documented tasks; tasks outside the representative selection retain their source
protocol even when mechanism metadata has not been curated.

`atlas-arena-plan-v4` stores selection and experiment configuration locally.
`arenaPlan` shares a snapshot in the URL, including task IDs, template and the
separate configuration inputs. JSON and Markdown export the plan, original
protocols, sources, configuration and curated relationships. JSON keeps
`status: planning-only`, `ready: false`, and an empty results array.

The default 20-task selection from the previous interface is not silently carried
into a new plan. Custom previous selections are retained where IDs still resolve.

## Validation

Run `npm run check`. `evaluation-workspace.test.cjs` checks canonical references,
deduplication, source immutability, native metrics, pair relationships, templates,
exports and bilingual task comparison. Browser verification additionally covers
template selection, concrete-task switching, local persistence, isolated-context
share restoration, actual downloads, language switching and adding from compare.
