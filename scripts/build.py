#!/usr/bin/env python3
"""Build the deployable static site from browser sources and public research data."""
import hashlib
import json
import shutil

from atlas.paths import CURATION, DIST, REPORTS, SOURCE


def main():
    DIST.mkdir(exist_ok=True)
    REPORTS.mkdir(exist_ok=True)
    sources = [path for path in sorted(SOURCE.rglob('*')) if path.is_file()]
    names = [path.name for path in sources]
    if len(names) != len(set(names)):
        raise ValueError('Browser source basenames must be unique: deployed asset URLs are flat.')
    for path in sources:
        shutil.copy2(path, DIST / path.name)

    # Browser models are copied before the Node exporters reuse their counting rules.
    from atlas.build_data import build
    build()
    images = json.loads((CURATION / 'game-images.json').read_text())
    ids = [entry['gameId'] for entry in images['entries']]
    if len(ids) != len(set(ids)):
        raise ValueError('Game images must map to unique, exact game IDs.')
    for entry in images['entries']:
        for kind in ('image', 'thumbnail'):
            asset = DIST / entry[kind]
            if asset.parent != DIST or hashlib.sha256(asset.read_bytes()).hexdigest() != entry['sha256'][kind]:
                raise ValueError(f'Game image asset mismatch: {entry["gameId"]} / {kind}')
    (DIST / 'game-images-data.js').write_text(
        'window.ATLAS_GAME_IMAGES = ' + json.dumps(images, ensure_ascii=False) + ';\n')
    print(f'Built site in {DIST.name}/ from {len(sources)} browser source files.')


if __name__ == '__main__':
    main()
