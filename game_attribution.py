"""Source-backed game identity reviews, deliberately independent of task reviews.

The audit is an overlay on public bibliography fields. It never rewrites the
research corpus or assigns capability / agent-interface claims.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STATUSES = {'confirmed', 'no_specific_game', 'unresolved', 'source_mismatch'}


def load_reviews():
    path = ROOT / 'game-attribution-review.json'
    if not path.exists():
        return {}
    audit = json.loads(path.read_text())
    rows = audit['records']
    from collection_expansion import overlay
    overlay(rows)
    assert len(rows) == len({r['id'] for r in rows}) == len(audit['reviewedIds'])
    assert {r['id'] for r in rows} == set(audit['reviewedIds'])
    for r in rows:
        assert r['status'] in STATUSES, r['id']
        assert r['noteZh'] and r['noteEn'] and r['checkedAt'] and r['evidence'], r['id']
        assert bool(r['games']) == (r['status'] == 'confirmed'), r['id']
        assert len(r['games']) == len({g['id'] for g in r['games']}), r['id']
        for e in r['evidence']:
            assert e['url'].startswith('https://') and e['title'] and e['excerpt'], r['id']
    return {r['id']: r for r in rows}


def public_review(r):
    result = {k: r[k] for k in ['status', 'checkedAt', 'noteZh', 'noteEn', 'evidence']}
    for k in ['mappingLevel', 'mappingCompleteness', 'mappingScope', 'collectionExpansion']:
        if k in r:
            result[k] = r[k]
    return result


def export_audit():
    path = ROOT / 'game-attribution-review.json'
    if path.exists():
        audit = json.loads(path.read_text())
        audit['records'] = list(load_reviews().values())
        (ROOT / 'dist/game-attribution-review.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2)+'\n')
