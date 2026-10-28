# Project structure

The site is a static application. Python builds the public research data; the
browser uses plain JavaScript and CSS. Node.js runs the tests and two exporters
that share the browser's coverage and archive models. No package installation
is required. Use Python 3.10+ and Node.js 20+.

```text
src/                         Browser source; edit here
  index.html                 Page shell and script load order
  js/app.js                  Navigation, game index and page orchestration
  js/i18n.js                 Language switching
  js/features/               Catalog, research archives, Arena and coverage UI
  js/models/                 Filtering, resource roles, coverage and archive logic
  css/                       Shared and feature styles
  assets/                    Static assets
data/
  catalog.json               Public-only bibliography snapshot
  curation/                  Reviewed associations, protocols, names and evidence
scripts/
  build.py                   Build entry point
  atlas/                     Python data pipeline and curated research definitions
  build_coverage_audit.cjs    Coverage export using the browser model
  build_research_archives.cjs Archive export using the browser model
tests/                       Data, filtering, navigation and coverage checks
prototypes/grid-courier/     Isolated historical prototype; not deployed
dist/                        Generated site, ready for static hosting
output/                      Local build reports; ignored by Git
```

## Commands

Run from the repository root:

```sh
npm run build   # Copy browser sources and generate public data in dist/
npm test        # Check the currently built site
npm run check   # Build, then run all checks
npm run preview # Serve dist/ at http://localhost:4317
```

The build can also be invoked from another directory with the absolute path to
`scripts/build.py`. All Python modules use `scripts/atlas/paths.py` to resolve
project paths. Build inputs live entirely in this repository.

## GitHub Pages

`.github/workflows/pages.yml` builds and tests every push to `main`, verifies that
the tracked `dist/` files are up to date, and publishes only `dist/` through GitHub
Pages. It can also be run manually from the Actions tab. Pages must use **GitHub
Actions** as its publishing source in the repository settings. No external
deployment token is needed; the workflow uses GitHub's deployment identity.

The site uses relative asset links and query-string navigation, so it works under
the repository's `/Game-Agent-Benchmark-Atlas/` URL prefix without a custom domain.

## Where to make changes

- **UI and behavior:** edit `src/`. The build flattens source asset paths into
  `dist/`, preserving existing page URLs and script ordering. Asset basenames
  must be unique. `src/index.html` uses the deployed filenames.
- **Bibliography:** edit `data/catalog.json`. Keep it public-only; do not add
  private reading notes, local document paths or credentials.
- **Evidence and reviews:** edit the relevant files in `data/curation/`.
  `library-*` covers discovery and classification; `game-*` covers game identity,
  introductions and resource use; `task-*` covers protocols and coverage;
  `arena-*` covers the representative task selection. Historical review files
  retain their original evidence and source hashes.
- **Data transformations:** edit `scripts/atlas/`. `build_data.py` orchestrates
  the stages. `game_catalog.py`, `research_content.py`, `game_profiles.py` and
  `translations.py` contain the existing curated definitions and bilingual copy.
- **Generated files:** do not edit `dist/` by hand. It remains tracked so a
  checkout already contains a deployable site. Rebuild and include regenerated
  outputs with source changes.

## Build sequence and boundaries

1. Copy browser code, styles and static assets from `src/` into `dist/`.
2. Assemble curated profiles and the bibliography; integrate game associations,
   collection members, task protocols and agent-paradigm reviews.
3. Generate translations, Arena candidates, gameplay introductions and
   resource-use data.
4. Export coverage accounting and research archives with the same models used
   by the browser, then run the repository checks.

Bibliographic inclusion, documented task coverage and verified execution are
separate concepts. The build must preserve those distinctions and explicit
evidence gaps. `dist/` contains only the website and its public exports; personal
reading materials and hosting credentials are not repository inputs.
