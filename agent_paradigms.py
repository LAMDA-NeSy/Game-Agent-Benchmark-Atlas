"""Apply field-specific, primary-source agent reviews without promoting other fields."""
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LABELS = ('LLM', 'VLM', 'VLA', 'IL', 'RL')


def load():
    return json.loads((ROOT / 'agent-paradigm-review.json').read_text())


def apply_library(rows):
    review = load()
    (ROOT / 'dist/agent-paradigm-review.json').write_text(
        json.dumps(review, ensure_ascii=False, indent=2) + '\n')
    by_id = {r['id']: r for r in review['records']}
    for row in rows:
        entry = by_id.get(row['id'])
        if not entry:
            raise ValueError('Missing agent paradigm review: ' + row['id'])
        row['agents'] = entry['agents'] if entry['status'] == 'confirmed' else []
        row['agentReview'] = entry
    return {
        'version': review['version'], 'checkedAt': review['checkedAt'],
        'status': dict(Counter(r['agentReview']['status'] for r in rows)),
        'labels': {a: sum(a in r['agents'] for r in rows) for a in LABELS},
        'policy': review['policy'],
    }


def integrate(data):
    # Paper-level classifications do not automatically propagate into every
    # game or task of a suite. Task/association evidence remains independent.
    by_id = {r['id']: r for r in load()['records']}
    for row in data['records'] + data.get('gameCatalogRecords', []):
        entry = by_id.get(row.get('legacyId') or row['id'])
        if not entry:
            raise ValueError('Missing source review for ' + row['id'])
        row['agents'] = entry['agents'] if entry['status'] == 'confirmed' else []
        row['agentReview'] = entry
    data['agentParadigmReview'] = {
        'version': load()['version'], 'checkedAt': load()['checkedAt'],
        'scope': 'paper-level; game and task claims require separate evidence',
    }


def sync():
    path = ROOT / 'dist/data.js'
    data = json.loads(path.read_text().removeprefix('window.ATLAS_DATA = ').rstrip(';\n'))
    integrate(data)
    path.write_text('window.ATLAS_DATA = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n')
    (ROOT / 'dist/agent-paradigm-review.json').write_text(
        (ROOT / 'agent-paradigm-review.json').read_text())
    from build_library import build
    build()


if __name__ == '__main__':
    sync()
