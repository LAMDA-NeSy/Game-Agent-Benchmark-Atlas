"""Source-reviewed collection increments, separate from frozen earlier audits.

This layer consumes public research fields only. Personal cards and Notes never
enter the site, and a new paper does not automatically become an Arena task.
"""
import json
from copy import deepcopy
from pathlib import Path
from game_catalog import t

ROOT = Path(__file__).resolve().parent
KINDS = {'benchmark':'Benchmark', 'environment':'Environment family',
         'platform':'Research platform', 'dataset':'Dataset',
         'protocol':'Evaluation protocol', 'method':'Agent method',
         'survey':'Survey', 'review':'Research record', 'competition':'Competition'}


def load():
    path = ROOT / 'corpus-increment.json'
    return json.loads(path.read_text()) if path.exists() else {'records': []}


def patch_library(rows):
    by_id = {r['id']: r for r in rows}
    for entry in load()['records']:
        row = by_id[entry['id']]
        for field in ['paper','repo','kind','domain','scope','metrics','limits','agents','caps']:
            row[field] = deepcopy(entry[field])
        row['genres'] = sorted({c for g in entry['games'] for c in g['categories']})
        row['games'] = [g['name'] for g in entry['games']]
        row['evidence'] = [e['url'] for e in entry['evidence']]
        row.update(review='verified' if entry.get('verified', True) else 'catalog',
                   classification='source-review', incrementRound='v38',
                   runtimeVerified=False, verificationDetail=deepcopy(entry['limits']))
    return rows


def integrate(payload):
    audit = load()
    additions = {r['id']: r for r in audit['records']}
    games = {g['id']: g for g in payload['gameIndex']}
    records = {r['id']: r for r in payload['gameCatalogRecords']}
    for g in games.values():
        g['links'] = [l for l in g['links'] if l['benchmark'] not in additions]
    for rid, entry in additions.items():
        record = records[rid]
        record.update(domain=entry['domain'],resourceKind=entry['kind'],
                      kind=KINDS[entry['kind']],kinds=[KINDS[entry['kind']]],
                      incrementRound='v38',repoURL=entry['repo'],paper=entry['paper'])
        attribution = dict(status=entry['attributionStatus'], checkedAt=audit['checkedAt'],
                           noteZh=entry['scope']['zh'], noteEn=entry['scope']['en'],
                           evidence=deepcopy(entry['evidence']))
        record['gameAttribution'] = attribution
        selected = entry['games']
        if not selected:
            unresolved = entry['attributionStatus'] == 'unresolved'
            selected = [dict(id='pending-source-review' if unresolved else 'research-without-specific-game',
                             name='Game identity pending' if unresolved else 'Research without a specific game',
                             categories=['Unresolved' if unresolved else 'Related research'],
                             kind='unresolved' if unresolved else 'non-game',
                             scope=entry['scope'], focus=entry['scope'], roles=[])]
        for member in selected:
            gid = member['id']
            if gid not in games:
                games[gid] = dict(id=gid,name=member['name'],categories=member['categories'],
                                 kind=member['kind'],links=[],note=t(*[member['scope'][l] for l in ['zh','en']]))
            game = games[gid]
            if member.get('nameZh'):
                game.update(nameZh=member['nameZh'],nameType=member.get('nameType','descriptive'),
                            nameSource=member.get('nameSource') or entry['paper'])
                game['aliases'] = list(dict.fromkeys(game.get('aliases',[])+[game['name'],member['nameZh']]))
            game['links'].append(dict(benchmark=rid,focus=t(member['focus']['zh'],member['focus']['en']),
                scope=t(member['scope']['zh'],member['scope']['en']),source=entry['evidence'][0]['url'],
                relation='source-reviewed',verification='attribution' if entry['games'] else 'reviewed-no-game',
                checked=audit['checkedAt'],caps=[],agents=[],interactions=[],
                domain=entry['domain'],resourceKind=entry['kind'],attribution=deepcopy(attribution)))
        for group in entry.get('gameParents',[]):
            parent=games[group['parentId']]
            for child_id in group['children']:
                ref=dict(parentId=parent['id'],benchmark=rid)
                if ref not in games[child_id].setdefault('subgameParents',[]):games[child_id]['subgameParents'].append(ref)
            parent.setdefault('collectionReviews',[]).append(dict(benchmark=rid,completeness='complete',
                children=group['children'],noteZh=group['scope']['zh'],noteEn=group['scope']['en'],evidence=deepcopy(entry['evidence'])))
        record.update(games=[m['name'] for m in selected],genres=sorted({c for m in selected for c in m['categories']}))
    payload['gameIndex'] = [g for g in games.values() if g['links']]
    payload['corpusIncrement'] = {k:deepcopy(v) for k,v in audit.items() if k not in ['records','baseline']}
    return payload


def finalize(payload):
    audit = load()
    games = {g['id']:g for g in payload['gameIndex']}
    records = {r['id']:r for r in payload['gameCatalogRecords']}
    promoted = set()
    for entry in audit['records']:
        record = records[entry['id']]
        units = deepcopy(entry.get('units', []))
        reason = entry['coverageReason']
        review = dict(status='partial' if units else 'not_applicable' if reason!='protocol_missing' else 'unresolved',
                      checkedAt=audit['checkedAt'], noteZh=entry['limits']['zh'], noteEn=entry['limits']['en'],
                      evidence=deepcopy(entry['evidence']),
                      eligibility=dict(decision='eligible' if units else 'needs_protocol' if reason=='protocol_missing' else 'out_of_scope',
                                       reason=None if units else reason))
        if not units and reason=='protocol_missing':
            review['protocolFollowup'] = dict(outcome='still_missing',previousState='missing',
                noteZh=entry['limits']['zh'],noteEn=entry['limits']['en'],sources=deepcopy(entry['evidence']),
                missing=[dict(field='scoped_protocol',detail=deepcopy(entry['limits']))])
        record['taskReview'] = review
        for game in games.values():
            for link in game['links']:
                if link['benchmark']==entry['id']:link['taskReview']=deepcopy(review)
        for unit in units:
            unit.update(benchmark=entry['id'],origin='collection-increment',executionVerified=False)
            for gid in unit['gameIds']:
                link=next(l for l in games[gid]['links'] if l['benchmark']==entry['id'])
                link.setdefault('taskUnitIds',[]).append(unit['id'])
                link['caps']=sorted(set(link['caps'])|{c['id'] for c in unit['capabilities']})
                link['agents']=list(entry['agents'])
            payload['documentedTasks'].append(unit)
        core_caps=sorted({c['id'] for u in units for c in u['capabilities'] if c['id'] in payload['taxonomy']})
        phrase=lambda p:t(p['zh'],p['en'])
        scope,limits=phrase(entry['scope']),phrase(entry['limits'])
        record.update(detailLevel='source',caps=core_caps,agents=entry['agents'],interactions=[],
                repo=(entry['repo'] or '').removeprefix('https://github.com/'),summary=entry['scope']['en'],
                zh=scope,observation=phrase(units[0]['observation']) if units else limits,
                action=phrase(units[0]['action']) if units else limits,
                protocol=scope,limit=limits,why=scope,note=limits,sourceChecked=audit['checkedAt'],
                sourceScope=limits,sourceRationale=scope,sourceEvidence=[e['url'] for e in entry['evidence']],
                research=dict(scope=scope,fit=scope,metrics=phrase(entry['metrics']),controls=limits,setup=limits),
                access=dict(mode='source-review',status='documented',source=entry['paper']),evidence=[])
        if entry['domain']=='gameplay' and core_caps:
            promoted.add(entry['id'])
            payload['records'].append(record)
    for game in games.values():
        for parent in game.get('subgameParents',[]):
            if parent['benchmark'] not in records:continue
            child=next(l for l in game['links'] if l['benchmark']==parent['benchmark'])
            target=next(l for l in games[parent['parentId']]['links'] if l['benchmark']==parent['benchmark'])
            if child.get('taskUnitIds'):
                target['taskUnitIds']=list(dict.fromkeys(target.get('taskUnitIds',[])+child['taskUnitIds']))
                target['taskCoverageIncludesMembers']=True
    payload['gameCatalogRecords']=[r for r in payload['gameCatalogRecords'] if r['id'] not in promoted]
    for g in games.values():
        for c in g['categories']:
            if c not in payload['facets']['categories']:payload['facets']['categories'].append(c)
    payload['gameFacets']['kinds']=sorted({r['kind'] for r in payload['records']+payload['gameCatalogRecords']})
    payload['facets']['kinds']=sorted({r['kind'] for r in payload['records']})
    all_records=payload['records']+payload['gameCatalogRecords']
    pending={l['benchmark'] for g in games.values() if g['kind']=='unresolved' for l in g['links']}
    non_game={l['benchmark'] for g in games.values() if g['kind']=='non-game' for l in g['links']}
    payload['gameIndexStats'].update(total=len(all_records),reviewed=len(payload['records']),
        historical=len(payload['gameCatalogRecords']),mapped=len(all_records)-len(pending|non_game),
        pending=len(pending),nonGame=len(non_game),nodes=sum(g['kind'] not in ['unresolved','non-game'] for g in games.values()))
    payload['discovery'].update(libraryRecords=len(all_records),incrementReviewed=len(audit['records']),
                               incrementThemes=len(promoted))
    payload['taskReviewStats'].update(units=len(payload['documentedTasks']),
        benchmarks=len({u['benchmark'] for u in payload['documentedTasks']}),
        games=len({g for u in payload['documentedTasks'] for g in u['gameIds']}))
    payload['version']='atlas-collection-increment-v38'
    (ROOT/'dist/corpus-increment.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    return payload


def reviewed_roles(base):
    roles=deepcopy(base)
    audit=load()
    for entry in audit['records']:
        for member in entry['games']:
            if member['roles']:
                roles['claims'].append(dict(benchmark=entry['id'],gameIds=[member['id']],roles=member['roles'],
                    basis=deepcopy(member['scope']),evidence=deepcopy(member.get('evidence') or entry['evidence']),
                    checkedAt=audit['checkedAt'],protocolStatus='partial'))
        for unit in entry.get('units',[]):
            if unit.get('mode') in ['offline','online']:roles['unitModes'][unit['id']]=unit['mode']
    roles['version']='game-roles-v38'
    return roles


def introductions(content,review):
    audit=load();known={r['id'] for r in review['records']}
    for entry in audit['records']:
        for member in entry['games']:
            if member['id'] in known:continue
            intro=member.get('introduction')
            if intro:
                content['entries'].append(dict(ids=[member['id']],zh=intro['zh'],en=intro['en'],
                    source=intro['url'],detailUrl=intro['url'],basis='primary-game-description',checkedAt=audit['checkedAt']))
            review['records'].append(dict(id=member['id'],status='described' if intro else 'not_described',
                reason=dict(zh='尚缺与此任务变体明确对应的玩法介绍来源。',en='A gameplay introduction matching this exact task variant is not yet documented.')))
            known.add(member['id'])
    content['stats']['described']=sum(len(e['ids']) for e in content['entries'])
    review['summary'].update(described=content['stats']['described'],reviewedNodes=len(review['records']))
    return content,review
