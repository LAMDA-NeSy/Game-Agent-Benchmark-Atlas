#!/usr/bin/env python3
"""Build the deployable static site from browser sources and public research data."""
import shutil

from atlas.paths import DIST, REPORTS, SOURCE


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
    print(f'Built site in {DIST.name}/ from {len(sources)} browser source files.')


if __name__ == '__main__':
    main()
