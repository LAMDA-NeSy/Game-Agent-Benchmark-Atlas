#!/usr/bin/env python3
"""Fetch Kaggle/TextArena; validate in isolation before replacing any accepted data.

No schedule advancement or deployment here: this is one step of the weekly review.
Exit 1 means at least one source failed; successful independent sources may advance.
"""
import argparse
import fcntl
import copy
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
SOURCES = Path('data/sources/official-leaderboards')
OVERRIDES = SOURCES / 'current-overrides.json'
TRACKS = {'game-arena': 'kaggle-game-arena', 'chess-text': 'kaggle-chess',
          'go': 'kaggle-go', 'poker-heads-up': 'kaggle-poker', 'werewolf': 'kaggle-werewolf'}


def encode(value):
    return (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n').encode()


def load(path):
    return json.loads(path.read_text())


def require(condition, message):
    if not condition:
        raise ValueError(message)


def result(run):
    if 'result' in run:
        return run['result']
    require(len(run.get('results', [])) == 1, 'Expected exactly one result per run')
    return run['results'][0]


def names(slug):
    return {'meta': 'kaggle-meta.json' if slug == 'game-arena' else slug + '-meta.json',
            'scores': 'kaggle-unified.json' if slug == 'game-arena' else slug + '-scores.json',
            'protocol': 'kaggle-protocol.json' if slug == 'game-arena' else slug + '-pages.json',
            'download': slug + '-download.json'}


def task_schema(raw):
    fields = ['id', 'versionNumber', 'name', 'displayType', 'precision', 'sortOrder']
    return sorted([{'task': {k: h['taskVersion'].get(k) for k in fields},
                    'mapping': h.get('taskVersionMapping', {})}
                   for h in raw['taskVersionHeaders']], key=lambda h: h['task']['id'])


def protocol_content(raw):
    return sorted([(p['id'], p.get('name'), p.get('content'), p.get('isPublished'))
                   for p in raw['pages']], key=lambda p: p[0])


def numeric(n):
    require(isinstance(n, dict), 'Missing numeric result')
    for value in [n.get('value', 0), n.get('confidenceInterval', 0),
                  *n.get('unevenConfidenceInterval', {}).values()]:
        require(type(value) in (int, float) and math.isfinite(value), 'Invalid numeric result')
    # Export JSON includes unused CI defaults; protobuf native JSON omits them.
    ci = None if n.get('hasConfidenceInterval') is False else n.get('confidenceInterval')
    uneven = None if n.get('hasUnevenConfidenceInterval') is False else n.get('unevenConfidenceInterval')
    return (n.get('value', 0), ci, uneven)


def kaggle_fingerprint(raw):
    # Deliberately exclude retrieval, page edits, run dates and unrelated counters.
    models = sorted([(h['modelVersion']['id'], h['modelVersion']['slug'], h.get('rank'),
                      h['modelVersion'].get('deprecationTime')) for h in raw['modelVersionHeaders']])
    cells = sorted([(r['modelVersionId'], r['taskVersionId'], numeric(result(r['runs'][0])['numericResult']))
                    for r in raw['entries']])
    return models, cells


def validate_kaggle(capture, old):
    raw, meta, download = (capture[k]['data'] for k in ['scores', 'meta', 'download'])
    require(meta['slug'] == capture['id'] and meta['published'], 'Wrong or unpublished benchmark')
    require(meta['version']['id'] == old['meta']['version']['id'], 'Benchmark version changed; review protocol')
    require(meta['version'].get('description') == old['meta']['version'].get('description'), 'Benchmark description changed; review protocol')
    require(task_schema(raw) == task_schema(old['scores']), 'Metric/schema changed; review mapping')
    require(protocol_content(capture['protocol']['data']) == protocol_content(old['protocol']), 'Protocol pages changed; review required')
    models = {h['modelVersion']['id']: h['modelVersion'] for h in raw['modelVersionHeaders']}
    tasks = {h['taskVersion']['id']: h for h in raw['taskVersionHeaders']}
    exported = {r['modelVersionSlug']: r for r in download['rows']}
    require(bool(models) and len(models) == len(raw['modelVersionHeaders']) == len(exported) == len(download['rows']), 'Empty/duplicate/inconsistent model table')
    require(len(models) >= len(old['scores']['modelVersionHeaders']) * .7, 'Large model-count drop; manual confirmation required')
    require({m['slug'] for m in models.values()} == set(exported), 'Model identities disagree')
    seen, dates = set(), []
    for row in raw['entries']:
        key = row['modelVersionId'], row['taskVersionId']
        require(key not in seen and key[0] in models and key[1] in tasks, 'Duplicate/unknown score cell')
        seen.add(key)
        require(len(row['runs']) == 1, 'Ambiguous multiple runs')
        value = result(row['runs'][0])
        h = tasks[key[1]]
        name = h.get('taskVersionMapping', {}).get('columnName') or h['taskVersion']['name']
        matches = [t for t in exported[models[key[0]]['slug']]['taskResults']
                   if t['benchmarkTaskName'] == name and t['taskVersion'] == h['taskVersion']['versionNumber']]
        require(len(matches) == 1, 'Download task mismatch')
        other = matches[0]['result']
        require(numeric(value['numericResult']) == numeric(other['numericResult']), 'Native/download values or intervals disagree')
        date = value.get('evaluationDate') or other.get('evaluationDate')
        if date:
            require(datetime.fromisoformat(date.replace('Z', '+00:00')).tzinfo is not None, 'Result timestamp lacks timezone')
            dates.append(date)
    require(len(seen) == sum(len(r['taskResults']) for r in download['rows']), 'Incomplete native score response')
    require(seen == {(m, t) for m in models for t in tasks}, 'Incomplete model/task matrix; review missing cells')
    changed = kaggle_fingerprint(raw) != kaggle_fingerprint(old['scores'])
    return {'changed': changed, 'rows': len(models), 'cellsCrossChecked': len(seen),
            'resultUpdatedAt': max(dates) if dates else None}


def validate_textarena(capture, old):
    cap = capture['results']
    require(cap['request'] == {'skill_subset': 'Balanced Subset'}, 'Wrong TextArena subset')
    all_rows = cap['data']
    require(isinstance(all_rows, list) and all_rows, 'Empty TextArena response')
    rows = [r for r in all_rows if r.get('is_standard') is True and not r.get('human_id')]
    require(bool(rows) and len({r['model_id'] for r in rows}) == len(rows), 'Empty/duplicate standard models')
    require(len(rows) >= len(old['data']) * .7, 'Large TextArena count drop; review required')
    for r in rows:
        require(isinstance(r['model_name'], str) and r['model_name'], 'Missing model name')
        require(type(r['is_active']) is bool, 'Missing activity flag')
        for field in ['trueskill', 'trueskill_sd', 'win_rate', 'games_played', 'wins', 'draws', 'losses']:
            require(type(r[field]) in (int, float) and math.isfinite(r[field]), 'Invalid TextArena score')
        require(0 <= r['win_rate'] <= 1 and r['trueskill_sd'] >= 0, 'Invalid rating uncertainty or win rate')
        require(all(type(r[k]) is int and r[k] >= 0 for k in ['games_played', 'wins', 'draws', 'losses']), 'Invalid game counts')
        require(r['games_played'] == r['wins'] + r['draws'] + r['losses'], 'Incomplete game counts')
    fields = ['model_id', 'model_name', 'is_active', 'trueskill', 'trueskill_sd', 'win_rate', 'games_played', 'wins', 'draws', 'losses']
    def fingerprint(items):
        return sorted([tuple(r[k] for k in fields) for r in items])
    rows.sort(key=lambda r: (-r['trueskill'], r['model_id']))
    return {'changed': fingerprint(rows) != fingerprint(old['data']), 'rows': len(rows),
            'activeModels': sum(r['is_active'] for r in rows), 'resultUpdatedAt': None}, rows


def atomic(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + '.tmp')
    temporary.write_bytes(value)
    temporary.replace(path)


def refresh(captures, root=ROOT, checked_at=None):
    checked_at = checked_at or datetime.now(timezone.utc).isoformat()
    directory = SOURCES / ('weekly-' + checked_at.replace(':', '').replace('+', '_'))
    original = load(root / OVERRIDES)
    overrides, files, checks = copy.deepcopy(original), {}, []
    current = load(root / 'data/curation/maintained-leaderboards.json')
    for source in [*TRACKS, 'textarena']:
        try:
            matches = [c for c in captures if c.get('id') == source]
            require(len(matches) == 1, 'Missing or duplicate source capture')
            cap = matches[0]
            require(not cap.get('error'), cap.get('error', 'Collection failed'))
            pending = {}
            if source in TRACKS:
                mapping = names(source)
                old = {k: load(root / original[n]['path']) for k, n in mapping.items()}
                outcome = validate_kaggle(cap, old)
                if outcome['changed']:
                    pending = {n: (cap[k], cap[k]['data']) for k, n in mapping.items()}
            else:
                old = load(root / original['textarena-results']['path'])
                outcome, rows = validate_textarena(cap, old)
                if outcome['changed']:
                    c = cap['results']
                    data = {'capture': {k: c[k] for k in ['url', 'request', 'capturedAt']}, 'data': rows}
                    data['capture']['sha256'] = hashlib.sha256(encode(c['data'])).hexdigest()
                    data['capture']['clientEvidence'] = c.get('clientEvidence', {})
                    pending = {'textarena-results': (c, data)}
            for name, (receipt, data) in pending.items():
                path = directory / (name if name.endswith('.json') else name + '.json')
                files[path] = encode(data)
                overrides[name] = {k: receipt[k] for k in ['url', 'request', 'capturedAt']}
                overrides[name].update(path=str(path), sourceSha256=hashlib.sha256(files[path]).hexdigest())
            evidence = [cap[k] for k in ['meta', 'scores', 'protocol', 'download']] if source in TRACKS else [cap['results']]
            checks.append({'source': source, 'checkedAt': checked_at,
                           'status': 'updated' if outcome['changed'] else 'unchanged', **outcome,
                           'evidence': [{'url': e['url'], 'request': e['request'], 'capturedAt': e['capturedAt'],
                                         'decodedJsonSha256': hashlib.sha256(encode(e['data'])).hexdigest()}
                                        for e in evidence]})
        except (KeyError, TypeError, ValueError, IndexError) as error:
            checks.append({'source': source, 'checkedAt': checked_at, 'status': 'failed', 'reason': str(error), 'oldDataPreserved': True})
    # Build prospective imports in a separate tree. No accepted file is touched on failure.
    if files:
        try:
            with tempfile.TemporaryDirectory(prefix='atlas-refresh-') as temp:
                stage = Path(temp)
                shutil.copytree(root / 'scripts', stage / 'scripts', ignore=shutil.ignore_patterns('__pycache__'))
                (stage / 'data/curation').mkdir(parents=True)
                (stage / SOURCES).mkdir(parents=True)
                for p in (root / 'data/sources').iterdir():
                    if p.name != 'official-leaderboards': (stage / 'data/sources' / p.name).symlink_to(p)
                for p in (root / SOURCES).iterdir():
                    if p.name != 'current-overrides.json': (stage / SOURCES / p.name).symlink_to(p)
                for path, value in files.items(): atomic(stage / path, value)
                atomic(stage / OVERRIDES, encode(overrides))
                for script in ['import_maintained_leaderboards.py', 'import_additional_leaderboards.py']:
                    subprocess.run([sys.executable, str(stage / 'scripts' / script)], check=True, capture_output=True, timeout=120)
                maintained_path = Path('data/curation/maintained-leaderboards.json')
                expansion_path = Path('data/curation/official-leaderboard-expansion.json')
                metadata_path = Path('data/curation/official-leaderboard-metadata.json')
                maintained = load(stage / maintained_path)
                expansion = load(stage / expansion_path)
                # Only changed source boards are promoted. Unrelated curated work remains intact.
                updated = {c['source'] for c in checks if c['status'] == 'updated'}
                new_boards = {b['id']: b for b in maintained['boards']}
                for slug in updated & TRACKS.keys():
                    bid = TRACKS[slug]
                    require(bool(new_boards[bid]['entries']), 'Importer produced an empty board')
                    current['boards'] = [new_boards[bid] if b['id'] == bid else b for b in current['boards']]
                    current['boardMetadata'][bid] = maintained['boardMetadata'][bid]
                if updated & TRACKS.keys(): files[maintained_path] = encode(current)
                if 'textarena' in updated:
                    prior = load(root / expansion_path)
                    new = next(b for b in expansion['boards'] if b['id'] == 'textarena-balanced')
                    require(bool(new['entries']), 'Importer produced an empty TextArena board')
                    prior['boards'] = [new if b['id'] == new['id'] else b for b in prior['boards']]
                    prior.setdefault('sourceOverrides', {})['textarena-results'] = overrides['textarena-results']['path']
                    files[expansion_path] = encode(prior)
                    metadata = load(root / metadata_path)
                    active = next(c['activeModels'] for c in checks if c['source'] == 'textarena')
                    metadata[new['id']].update(kind='continuous' if active else 'historical', reviewedAt=checked_at[:10],
                        reason={'zh': 'Balanced Subset 标准模型；活跃状态按官方接口记录。', 'en': 'Balanced Subset standard models; activity follows the official API.'})
                    files[metadata_path] = encode(metadata)
                files[OVERRIDES] = encode(overrides)
            # All fetching, validation and import work has succeeded before promotion.
            backups = {p: (root / p).read_bytes() if (root / p).exists() else None for p in files}
            try:
                for p, value in files.items(): atomic(root / p, value)
            except OSError:
                for p, value in backups.items():
                    if value is None: (root / p).unlink(missing_ok=True)
                    else: atomic(root / p, value)
                raise
        except (OSError, ValueError, KeyError, subprocess.SubprocessError) as error:
            for check in checks:
                if check['status'] == 'updated':
                    check.update(status='failed', reason='Staged import/promotion failed: ' + type(error).__name__, oldDataPreserved=True)
    report = {'checkedAt': checked_at, 'scope': 'Kaggle Game Arena five tracks and TextArena Balanced Subset; not the entire weekly stream',
              'status': 'partial' if any(c['status'] == 'failed' for c in checks) else 'complete', 'sources': checks}
    report_path = Path('data/sources/weekly-updates') / checked_at[:10] / ('public-interfaces-' + checked_at[11:19].replace(':', '') + '.json')
    atomic(root / report_path, encode(report))
    return report, report_path


def collect(cli):
    session = 'atlas-weekly-' + str(os.getpid())
    base = cli + ['--session', session]
    def run(args, timeout=600):
        completed = subprocess.run(base + args, capture_output=True, text=True, timeout=timeout)
        require(completed.returncode == 0, 'Browser collector failed; no source data replaced')
        return completed.stdout
    try:
        run(['open', 'about:blank'], 120)
        output = run(['--raw', 'run-code', (ROOT / 'scripts/collect_public_leaderboards.js').read_text()])
        data = json.loads(output)
        while isinstance(data, str): data = json.loads(data)
        require(isinstance(data, list), 'Invalid browser collector response')
        return data
    finally:
        try: run(['close'], 30)
        except Exception: pass


def browser_command(explicit=None):
    if explicit:
        return [explicit]
    installed = shutil.which('playwright-cli')
    if installed:
        return [installed]
    # Reuse the installed CLI without making npm's registry availability a dependency.
    cache = Path(os.environ.get('npm_config_cache', str(Path.home() / '.npm')))
    cached = [p for p in cache.glob('_npx/*/node_modules/.bin/playwright-cli') if p.is_file() and os.access(p, os.X_OK)]
    if cached:
        return [str(max(cached, key=lambda p: p.stat().st_mtime))]
    return ['npx', '--yes', '--package', '@playwright/cli', 'playwright-cli']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser-cli', help='Path to playwright-cli; otherwise use npx @playwright/cli')
    args = parser.parse_args()
    # Coordinate manual and scheduled invocations; the OS releases this lock on exit.
    lock_name = 'atlas-public-refresh-' + hashlib.sha256(str(ROOT).encode()).hexdigest()[:16] + '.lock'
    with (Path(tempfile.gettempdir()) / lock_name).open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        try:
            captures = collect(browser_command(args.browser_cli))
        except (ValueError, OSError, subprocess.SubprocessError):
            captures = []  # Write a failure report without persisting browser diagnostics or keys.
        report, path = refresh(captures)
    print(json.dumps({'report': str(path), **report}, ensure_ascii=False, indent=2))
    return 1 if report['status'] != 'complete' else 0


if __name__ == '__main__':
    sys.exit(main())
