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
    schedule = json.loads((CURATION / 'update-schedule.json').read_text())
    (DIST / 'update-schedule.json').write_text(json.dumps(schedule, ensure_ascii=False, indent=2)+'\n')
    (DIST / 'update-schedule-data.js').write_text('window.AtlasUpdateSchedule = '+json.dumps(schedule, ensure_ascii=False)+';\n')
    design = json.loads((CURATION / 'evaluation-design.json').read_text())
    (DIST / 'evaluation-design.json').write_text(json.dumps(design, ensure_ascii=False, indent=2)+'\n')
    (DIST / 'evaluation-design.js').write_text('window.AtlasEvaluationDesign = '+json.dumps(design, ensure_ascii=False)+';\n')
    leaderboards = json.loads((CURATION / 'official-leaderboards.json').read_text())
    expansion = json.loads((CURATION / 'official-leaderboard-expansion.json').read_text())
    leaderboards['sourceSnapshots'] = [leaderboards['sourceSnapshot'], expansion['sourceSnapshot']]
    leaderboards['boards'].extend(expansion['boards'])
    leaderboards['capturedAt'] = max(b['source']['snapshotAt'] for b in leaderboards['boards'])
    leaderboards['boardMetadata'] = json.loads((CURATION / 'official-leaderboard-metadata.json').read_text())
    maintained = json.loads((CURATION / 'maintained-leaderboards.json').read_text())
    leaderboards['boards'].extend(maintained['boards'])
    leaderboards['boardMetadata'].update(maintained['boardMetadata'])
    leaderboards['sources'] = maintained['sources']
    source_board_ids = [bid for source in maintained['sources'] for bid in source['boardIds']]
    if len(source_board_ids) != len(set(source_board_ids)) or set(source_board_ids) != {b['id'] for b in leaderboards['boards']}:
        raise ValueError('Every leaderboard track must belong to exactly one source.')
    leaderboards['capturedAt'] = max(b['source']['snapshotAt'] for b in leaderboards['boards'])
    leaderboards['sourceSnapshots'].extend(b['source']['evidenceFile'] for b in maintained['boards'] if b['source'].get('evidenceFile'))
    if set(leaderboards['boardMetadata']) != {b['id'] for b in leaderboards['boards']}:
        raise ValueError('Every official leaderboard must have explicit status and date provenance.')
    if len({b['id'] for b in leaderboards['boards']}) != len(leaderboards['boards']):
        raise ValueError('Official leaderboard IDs must be unique.')
    (DIST / 'official-leaderboards.json').write_text(json.dumps(leaderboards, ensure_ascii=False, indent=2)+'\n')
    (DIST / 'official-leaderboards-data.js').write_text('window.AtlasOfficialLeaderboardsData = '+json.dumps(leaderboards, ensure_ascii=False)+';\n')
    images = json.loads((CURATION / 'game-images.json').read_text())
    ids = [entry['gameId'] for entry in images['entries']]
    if len(ids) != len(set(ids)):
        raise ValueError('Game images must map to unique, exact game IDs.')
    for entry in images['entries']:
        for kind in ('image',):
            asset = DIST / entry[kind]
            if asset.parent != DIST or hashlib.sha256(asset.read_bytes()).hexdigest() != entry['sha256'][kind]:
                raise ValueError(f'Game image asset mismatch: {entry["gameId"]} / {kind}')
    (DIST / 'game-images-data.js').write_text(
        'window.ATLAS_GAME_IMAGES = ' + json.dumps(images, ensure_ascii=False) + ';\n')
    visuals = json.loads((CURATION / 'benchmark-visuals.json').read_text())
    for entry in visuals['entries']:
        asset = DIST / entry['image']
        if asset.parent != DIST or hashlib.sha256(asset.read_bytes()).hexdigest() != entry['sha256']:
            raise ValueError(f'Benchmark visual asset mismatch: {entry["id"]}')
    (DIST / 'benchmark-visuals-data.js').write_text(
        'window.AtlasBenchmarkVisuals = ' + json.dumps(visuals, ensure_ascii=False) + ';\n')
    media = json.loads((CURATION / 'archive-media-previews.json').read_text())
    for entry in media['entries']:
        asset = DIST / entry['image']
        if asset.parent != DIST or hashlib.sha256(asset.read_bytes()).hexdigest() != entry['sha256']:
            raise ValueError(f'Archive media preview mismatch: {entry["url"]}')
    (DIST / 'archive-media-previews-data.js').write_text(
        'window.AtlasArchiveMediaPreviews = ' + json.dumps(media, ensure_ascii=False) + ';\n')
    print(f'Built site in {DIST.name}/ from {len(sources)} browser source files.')


if __name__ == '__main__':
    main()
