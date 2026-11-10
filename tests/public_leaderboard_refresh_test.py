"""Safety acceptance for unattended source refreshes, using recorded public evidence."""
import copy
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import refresh_public_leaderboards as updater


class RefreshTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / 'scripts', self.root / 'scripts', ignore=shutil.ignore_patterns('__pycache__'))
        (self.root / 'data/curation').mkdir(parents=True)
        for name in ['maintained-leaderboards.json', 'official-leaderboard-expansion.json', 'official-leaderboard-metadata.json', 'update-schedule.json']:
            shutil.copy2(ROOT / 'data/curation' / name, self.root / 'data/curation' / name)
        (self.root / updater.SOURCES).mkdir(parents=True)
        for path in (ROOT / 'data/sources').iterdir():
            if path.name not in ['official-leaderboards', 'weekly-updates']: (self.root / 'data/sources' / path.name).symlink_to(path)
        for path in (ROOT / updater.SOURCES).iterdir():
            target = self.root / updater.SOURCES / path.name
            if path.name == 'current-overrides.json': shutil.copy2(path, target)
            else: target.symlink_to(path)
        self.overrides = updater.load(self.root / updater.OVERRIDES)
        self.captures = []
        for slug in updater.TRACKS:
            cap = {'id': slug}
            for kind, name in updater.names(slug).items():
                receipt = self.overrides[name]
                cap[kind] = {'url': receipt['url'], 'request': receipt.get('request'),
                             'capturedAt': '2026-11-16T02:00:00Z', 'data': updater.load(ROOT / receipt['path'])}
            self.captures.append(cap)
        old = updater.load(ROOT / self.overrides['textarena-results']['path'])
        self.captures.append({'id': 'textarena', 'results': {**old['capture'], 'capturedAt': '2026-11-16T02:00:00Z', 'data': old['data']}})
        self.before = {p: (self.root / p).read_bytes() for p in [updater.OVERRIDES, *[Path('data/curation') / n for n in ['maintained-leaderboards.json', 'official-leaderboard-expansion.json', 'official-leaderboard-metadata.json', 'update-schedule.json']]]}

    def run_refresh(self):
        return updater.refresh(self.captures, self.root, '2026-11-16T02:00:00+00:00')[0]

    def assert_retained(self):
        for p, original in self.before.items(): self.assertEqual((self.root / p).read_bytes(), original, str(p))

    def change_score(self):
        cap = self.captures[0]
        cell = cap['scores']['data']['entries'][0]
        native = updater.result(cell['runs'][0])
        native['numericResult']['value'] = native['numericResult'].get('value', 0) + 1
        native['evaluationDate'] = '2026-11-15T12:00:00Z'
        model = next(h['modelVersion'] for h in cap['scores']['data']['modelVersionHeaders'] if h['modelVersion']['id'] == cell['modelVersionId'])
        h = next(h for h in cap['scores']['data']['taskVersionHeaders'] if h['taskVersion']['id'] == cell['taskVersionId'])
        name = h.get('taskVersionMapping', {}).get('columnName') or h['taskVersion']['name']
        row = next(r for r in cap['download']['data']['rows'] if r['modelVersionSlug'] == model['slug'])
        exported = next(t['result'] for t in row['taskResults'] if t['benchmarkTaskName'] == name)
        exported['numericResult']['value'] = native['numericResult']['value']
        exported['evaluationDate'] = native['evaluationDate']

    def test_unchanged_scores_ignore_new_fetch_and_result_timestamps(self):
        for cap in self.captures[:-1]:
            for row in cap['scores']['data']['entries']:
                updater.result(row['runs'][0])['evaluationDate'] = '2026-11-16T02:00:00Z'
        report = self.run_refresh()
        self.assertEqual(report['status'], 'complete')
        self.assertTrue(all(c['status'] == 'unchanged' for c in report['sources']))
        self.assert_retained()

    def test_failures_empty_and_wrong_protocol_keep_every_old_byte(self):
        self.captures[0] = {'id': 'game-arena', 'error': 'HTTP 503'}
        self.captures[1]['scores']['data']['entries'] = []
        self.captures[2]['protocol']['data']['pages'][0]['content'] += ' changed'
        self.captures[-1]['results']['data'] = []
        report = self.run_refresh()
        self.assertEqual(report['status'], 'partial')
        self.assertEqual(sum(c['status'] == 'failed' for c in report['sources']), 4)
        self.assert_retained()

    def test_independent_success_and_failure_and_original_dates(self):
        self.change_score()
        self.captures[-1] = {'id': 'textarena', 'error': 'HTTP 503'}
        report = self.run_refresh()
        self.assertEqual(report['sources'][0]['status'], 'updated', report)
        self.assertEqual(report['status'], 'partial')
        before = json.loads(self.before[Path('data/curation/maintained-leaderboards.json')])
        after = updater.load(self.root / 'data/curation/maintained-leaderboards.json')
        for old, new in zip(before['boards'], after['boards']):
            if old['id'] == 'kaggle-game-arena': self.assertEqual(new['source']['pageUpdatedAt'], '2026-11-15T12:00:00Z')
            else: self.assertEqual(old, new)
        self.assertEqual((self.root / 'data/curation/official-leaderboard-expansion.json').read_bytes(), self.before[Path('data/curation/official-leaderboard-expansion.json')])
        self.assertEqual((self.root / 'data/curation/update-schedule.json').read_bytes(), self.before[Path('data/curation/update-schedule.json')])

    def test_disagreeing_exports_and_nonfinite_values_rejected(self):
        self.captures[0]['download']['data']['rows'][0]['taskResults'][0]['result']['numericResult']['value'] += 1
        self.captures[1]['scores']['data']['entries'][0]['runs'][0].setdefault('result', {})['numericResult'] = {'value': float('nan')}
        report = self.run_refresh()
        self.assertEqual(report['sources'][0]['status'], 'failed')
        self.assertEqual(report['sources'][1]['status'], 'failed')
        self.assert_retained()

    def test_staged_import_failure_does_not_promote_captures_or_boards(self):
        self.change_score()
        with patch.object(updater.subprocess, 'run', side_effect=updater.subprocess.CalledProcessError(1, 'import')):
            report = self.run_refresh()
        self.assertEqual(report['sources'][0]['status'], 'failed')
        self.assert_retained()

    def test_textarena_activity_and_scores_update_without_inventing_date(self):
        self.captures[-1]['results']['data'][0]['is_active'] = True
        report = self.run_refresh()
        self.assertEqual(report['sources'][-1]['status'], 'updated', report)
        data = updater.load(self.root / 'data/curation/official-leaderboard-expansion.json')
        board = next(b for b in data['boards'] if b['id'] == 'textarena-balanced')
        self.assertIsNone(board['source']['pageUpdatedAt'])
        self.assertEqual(board['entries'][0]['context'][0]['value']['en'], 'Active')
        self.assertEqual(updater.load(self.root / 'data/curation/official-leaderboard-metadata.json')['textarena-balanced']['kind'], 'continuous')


if __name__ == '__main__': unittest.main()
