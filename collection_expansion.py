"""Evidence-bounded child-game expansion of the v19 collection-only audit."""
import json
from pathlib import Path
from collections import Counter
from game_catalog import t

ROOT = Path(__file__).resolve().parent


def load_expansions():
    path = ROOT / 'collection-expansion-review.json'
    if not path.exists():
        return {}
    audit = json.loads(path.read_text())
    assert len(audit['records']) == len(set(audit['reviewedIds'])) == 26
    assert {r['id'] for r in audit['records']} == set(audit['reviewedIds'])
    for r in audit['records']:
        assert r['outcome'] in ['expanded', 'not_disclosed', 'procedural_family', 'unresolved']
        assert r['completeness'] in ['complete', 'partial', 'none']
        assert r['noteZh'] and r['noteEn'] and r['evidence'] and r['checkedAt']
        assert len(r['children']) == len({c['id'] for c in r['children']}), r['id']
        for c in r['children']:
            assert c['parentId'] != c['id'] and c['categories'] and c['scopeZh'] and c['scopeEn']
            assert c['evidence'] and all(e['url'].startswith('https://') for e in c['evidence'])
    return {r['id']: r for r in audit['records']}


def overlay(rows):
    by_id = {r['id']: r for r in rows}
    for rid, expansion in load_expansions().items():
        r = by_id[rid]
        assert r['mappingLevel'] == 'collection' and r['status'] == 'confirmed', rid
        parents = {g['id'] for g in r['games']}
        for update in expansion.get('parentUpdates', []):
            assert update['id'] in parents
            next(g for g in r['games'] if g['id'] == update['id']).update(update)
        r['collectionExpansion'] = {k: expansion[k] for k in ['outcome', 'completeness', 'checkedAt']}
        r['collectionExpansion']['childCount'] = len(expansion['children'])
        r['noteZh'], r['noteEn'] = expansion['noteZh'], expansion['noteEn']
        r['mappingCompleteness'] = expansion['completeness']
        r['checkedAt'] = expansion['checkedAt']
        r['evidence'] = expansion['evidence']
        for child in expansion['children']:
            assert child['parentId'] in parents, (rid, child['id'])
            assert child['id'] not in parents, (rid, child['id'])
            r['games'].append({k: child[k] for k in ['id', 'name', 'categories', 'kind']})
        if expansion['children']:
            r['mappingLevel'] = 'mixed'
    return rows


def attach_hierarchy(payload):
    expansions = load_expansions()
    games = {g['id']: g for g in payload['gameIndex']}
    original = {r['id']: r for r in json.loads((ROOT / 'game-attribution-review.json').read_text())['records']}
    for rid, review in expansions.items():
        for update in review.get('parentUpdates', []):
            games[update['id']].update(update)
        parent_ids = [g['id'] for g in original[rid]['games']]
        for parent_id in parent_ids:
            children = [c for c in review['children'] if c['parentId'] == parent_id]
            games[parent_id].setdefault('collectionReviews', []).append(dict(
                benchmark=rid, children=[c['id'] for c in children],
                outcome=review['outcome'], completeness=review['completeness'],
                noteZh=review['noteZh'], noteEn=review['noteEn'], evidence=review['evidence']))
        for child in review['children']:
            g = games[child['id']]
            g.setdefault('subgameParents', []).append(dict(parentId=child['parentId'], benchmark=rid))
            link = next(l for l in g['links'] if l['benchmark'] == rid)
            link['relation'] = 'verified-subgame'
            link['parentId'] = child['parentId']
            link['source'] = child['evidence'][0]['url']
            link['scope'] = t(child['scopeZh'], child['scopeEn'])
            link['attribution'].update(noteZh=child['scopeZh'], noteEn=child['scopeEn'],
                                       evidence=child['evidence'], mappingLevel='named')
    payload['collectionExpansionStats'] = dict(
        reviewed=len(expansions), expanded=sum(bool(r['children']) for r in expansions.values()),
        links=sum(len(r['children']) for r in expansions.values()),
        subgames=len({c['id'] for r in expansions.values() for c in r['children']}),
        completeness=dict(Counter(r['completeness'] for r in expansions.values())))
    path = ROOT / 'collection-expansion-review.json'
    if path.exists():
        (ROOT / 'dist/collection-expansion-review.json').write_bytes(path.read_bytes())
