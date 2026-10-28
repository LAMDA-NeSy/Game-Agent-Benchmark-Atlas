"""Documented task coverage, kept separate from Arena selection and runtime claims."""
from .paths import ROOT, CURATION
import json
from collections import Counter
from copy import deepcopy
from .game_catalog import t, GAME_TRANSLATIONS as TRANSLATIONS
CAPS = {'long-horizon','planning','coordination','strategy','memory','exploration','generalization','social','control','rule-reasoning','spatial-reasoning'}

def pair(s):
    if isinstance(s,dict):return s
    return {'zh':s,'en':TRANSLATIONS.get(s,s)}

def validate_sources(sources, record_id):
    assert sources, record_id
    for source in sources:
        assert source.get('url','').startswith(('https://','http://')) and source.get('title') and source.get('excerpt'), (record_id,source)

def integrate(payload):
    path=CURATION / 'task-protocol-review.json'
    audit=json.loads(path.read_text()) if path.exists() else {'records':[]}
    games={g['id']:g for g in payload['gameIndex']}
    records={r['id']:r for r in payload['records']+payload['gameCatalogRecords']}
    legacy={r['legacyId']:r['id'] for r in records.values()}
    units=[]
    corrected_ids={}
    for row in audit['records']:
        rid=legacy.get(row['id'],row['id']);record=records[rid]
        assert row['status'] in ['verified','partial','not_applicable','unresolved']
        assert row['status'] not in ['not_applicable','unresolved'] or not row['units']
        assert row['noteZh'] and row['noteEn'] and row['evidence'] and row['checkedAt']
        validate_sources(row['evidence'],rid)
        if row.get('followup'):
            f=row['followup']
            assert f['outcome'] in ['expanded','clarified','still_limited'] and f['noteZh'] and f['noteEn'] and f['checkedAt'],rid
            validate_sources(f['sources'],rid)
        if row.get('protocolFollowup'):
            f=row['protocolFollowup']
            assert f['outcome'] in ['integrated','mapped','still_missing','out_of_scope']
            assert f['previousState'] in ['missing','unmapped'] and f['noteZh'] and f['noteEn']
            validate_sources(f['sources'],rid)
            for gap in f['missing']:
                assert gap['field'] and gap['detail']['zh'] and gap['detail']['en'],rid
            if f['outcome']=='still_missing':assert f['missing'],rid
        if row.get('reviewedScope'):
            assert row['reviewedScope'].get('zh') and row['reviewedScope'].get('en'),rid
        for correction in row.get('gameCorrections',[]):
            old_id=correction['removeGameId'];new_game=correction['game'];gid=new_game['id']
            assert correction['evidence'] and old_id in games
            validate_sources(correction['evidence'],rid)
            assert all(c in payload['facets']['categories'] for c in new_game['categories']), (rid,gid)
            old_game=games[old_id]
            previous=next(l for l in old_game['links'] if l['benchmark']==rid)
            old_game['links']=[l for l in old_game['links'] if l['benchmark']!=rid]
            if gid not in games:
                games[gid]=dict(new_game,links=[],note=t(correction['noteZh'],correction['noteEn']))
                payload['gameIndex'].append(games[gid])
            link=deepcopy(previous)
            link.update(source=correction['evidence'][0]['url'],scope=t(correction['noteZh'],correction['noteEn']),caps=[],agents=[],interactions=[],verification='task-reviewed')
            if 'attribution' in link:
                link['attribution'].update(noteZh=correction['noteZh'],noteEn=correction['noteEn'],evidence=deepcopy(correction['evidence']),checkedAt=row['checkedAt'],mappingLevel='named')
            games[gid]['links'].append(link)
            corrected_ids.setdefault(old_id,set()).add(gid)
            record['gameIdentityCorrected']=True
            if record.get('gameAttribution'):
                record['gameAttribution'].update(noteZh=correction['noteZh'],noteEn=correction['noteEn'],evidence=deepcopy(correction['evidence']),checkedAt=row['checkedAt'],mappingLevel='named')
            record['games']=[g['name'] for g in games.values() if any(l['benchmark']==rid for l in g['links'])]
            record['genres']=sorted({c for g in games.values() if any(l['benchmark']==rid for l in g['links']) for c in g['categories']})
        for member in row.get('gameMembers',[]):
            parent=games[member['parentId']];new_game=member['game'];gid=new_game['id']
            assert member['evidence'] and all(c in payload['facets']['categories'] for c in new_game['categories'])
            validate_sources(member['evidence'],rid)
            if gid not in games:
                games[gid]=dict(new_game,links=[],note=t(member['noteZh'],member['noteEn']))
                payload['gameIndex'].append(games[gid])
            g=games[gid]
            if not any(l['benchmark']==rid for l in g['links']):
                link=deepcopy(next(l for l in parent['links'] if l['benchmark']==rid))
                link.update(source=member['evidence'][0]['url'],scope=t(member['noteZh'],member['noteEn']),caps=[],agents=[],interactions=[],verification='task-reviewed',parentId=parent['id'],relation='verified-subgame')
                if 'attribution' in link:
                    link['attribution'].update(noteZh=member['noteZh'],noteEn=member['noteEn'],evidence=deepcopy(member['evidence']),checkedAt=row['checkedAt'],mappingLevel='named')
                g['links'].append(link)
            parent_ref=dict(parentId=parent['id'],benchmark=rid)
            if parent_ref not in g.setdefault('subgameParents',[]):g['subgameParents'].append(parent_ref)
            cr=next((x for x in parent.setdefault('collectionReviews',[]) if x['benchmark']==rid),None)
            if not cr:
                cr=dict(benchmark=rid,completeness='partial',children=[],noteZh='本轮任务协议核验确认的成员；不声明涵盖全部平台环境。',noteEn='Members confirmed by this task-protocol review; not a claim to cover every platform environment.',evidence=[])
                parent['collectionReviews'].append(cr)
            if gid not in cr['children']:cr['children'].append(gid)
            for e in member['evidence']:
                if e not in cr['evidence']:cr['evidence'].append(e)
        if row.get('gameMembers'):
            record['gameIdentityCorrected']=True
            if record.get('gameAttribution'):
                linked=[g for g in games.values() if any(l['benchmark']==rid for l in g['links'])]
                has_collection=any(g['kind']=='collection' for g in linked)
                has_named=any(g['kind'] not in ['collection','unresolved','non-game'] for g in linked)
                record['gameAttribution']['mappingLevel']='mixed' if has_collection and has_named else 'collection' if has_collection else 'named'
            record['games']=[g['name'] for g in games.values() if any(l['benchmark']==rid for l in g['links'])]
            record['genres']=sorted({c for g in games.values() if any(l['benchmark']==rid for l in g['links']) for c in g['categories']})
        review={k:row[k] for k in ['status','noteZh','noteEn','evidence','checkedAt']}
        for key in ['followup','reviewedScope','eligibility','routingReview','protocolFollowup']:
            if key in row:review[key]=deepcopy(row[key])
        record['taskReview']=review
        for g in games.values():
            for link in g['links']:
                if link['benchmark']==rid:link['taskReview']=review
        for src in row['units']:
            u=deepcopy(src);u.update(benchmark=rid,origin='protocol-review',executionVerified=False)
            assert u['gameIds'] and u['evidence']
            validate_sources(u['evidence'],rid)
            assert len({c['id'] for c in u['capabilities']})==len(u['capabilities']), (rid,u['id'])
            for key in ['label','task','observation','action','metrics','controls','limits']:
                assert u[key]['zh'] and u[key]['en'],(rid,key)
            for c in u['capabilities']:
                assert c['id'] in CAPS and c['role'] in ['primary','secondary'] and c['basis']['zh'] and c['basis']['en']
            for gid in u['gameIds']:
                assert gid in games and any(l['benchmark']==rid for l in games[gid]['links']),(rid,gid)
                assert games[gid]['kind'] not in ['unresolved','non-game'],(rid,gid)
            units.append(u)
    # Retain the already documented candidate protocols, including their explicit
    # proposed diagnostics and unpinned-run limitations, without altering selection.
    arena=json.loads((CURATION / 'arena-task-catalog.json').read_text())
    for a in arena['tasks']:
        units.append(dict(id='existing-'+a['id'],benchmark=a['benchmark'],gameIds=[a['game']],
            label=a['title'],task=a['scope'],observation=a['interface'],action=a['interface'],
            metrics=a['metric'],controls=a['controls'],limits=a['pending'],
            capabilities=[dict(id=a['primary'],role='primary',basis=a['why'])]+[dict(id=c,role='secondary',basis=a['why']) for c in a['secondary']],
            evidence=[dict(url=a.get('docs') or a['source'],title='Existing task documentation',excerpt='Existing source-linked Arena candidate; proposed diagnostics and pending setup remain explicitly labeled.')],
            origin='arena-documented-candidate',executionVerified=False,arenaTaskId=a['id']))
    # Six existing game-scoped deep profiles carry field-level sources.
    for g in games.values():
        for l in g['links']:
            p=l.get('profile')
            if not p:continue
            units.append(dict(id='profile-'+g['id']+'-'+l['benchmark'],benchmark=l['benchmark'],gameIds=[g['id']],
                label=pair(l['focus']),task=pair(p['scope']['text']),observation=pair(p['observation']['text']),
                action=pair(p['action']['text']),metrics=pair(p['metrics']['text']),controls=pair(p['controls']['text']),limits=pair(p['unknown']['text']),
                capabilities=[dict(id=c,role='secondary',basis=pair(p['fit'])) for c in l['caps']],
                evidence=[dict(url=p[k]['source'],title=p[k]['locator'],excerpt=p[k]['text']) for k in ['scope','observation','action','metrics','controls']],
                origin='existing-game-profile',executionVerified=False))
    assert len({u['id'] for u in units})==len(units)
    for u in units:
        u['gameIds']=list(dict.fromkeys(u['gameIds']))
        for gid in u['gameIds']:
            l=next(l for l in games[gid]['links'] if l['benchmark']==u['benchmark'])
            l.setdefault('taskUnitIds',[]).append(u['id'])
            if u['origin']=='protocol-review':l['caps']=sorted(set(l['caps'])|{c['id'] for c in u['capabilities']})
    # Collection pages aggregate their verified members; child games never inherit
    # another member's protocol or a platform-wide capability claim.
    for g in games.values():
        for parent in g.get('subgameParents',[]):
            child_link=next(l for l in g['links'] if l['benchmark']==parent['benchmark'])
            parent_link=next(l for l in games[parent['parentId']]['links'] if l['benchmark']==parent['benchmark'])
            if child_link.get('taskUnitIds'):
                parent_link['taskUnitIds']=list(dict.fromkeys(parent_link.get('taskUnitIds',[])+child_link['taskUnitIds']))
                parent_link['taskCoverageIncludesMembers']=True
    payload['gameIndex']=[g for g in payload['gameIndex'] if g['links']]
    payload['gameRedirects']={old:next(iter(targets)) for old,targets in corrected_ids.items() if not games[old]['links'] and len(targets)==1}
    payload['gameIndexStats']['nodes']=sum(g['kind'] not in ['unresolved','non-game'] for g in payload['gameIndex'])
    payload['gameIndexStats']['attributionReview']['collectionOnly']=sum(r.get('gameAttribution',{}).get('mappingLevel')=='collection' for r in records.values())
    payload['documentedTasks']=units
    payload['taskReviewStats']=dict(reviewed=len(audit['records']),statuses=dict(Counter(r['status'] for r in audit['records'])),units=len(units),benchmarks=len({u['benchmark'] for u in units}),games=len({g for u in units for g in u['gameIds']}))
    policy=json.loads((CURATION / 'task-coverage-policy.json').read_text())
    payload['taskCoveragePolicy']=policy
    payload['taskDimensions']=deepcopy(arena['dimensions'])+policy['supplementalDimensions']
    (ROOT/'dist/task-coverage-policy.json').write_text(json.dumps(policy,ensure_ascii=False,indent=2)+'\n')
    integration_path=CURATION / 'task-coverage-integration.json'
    if integration_path.exists():
        integration=json.loads(integration_path.read_text())
        payload['taskCoverageIntegration']=integration['summary']
        (ROOT/'dist/task-coverage-integration.json').write_bytes(integration_path.read_bytes())
    protocol_followup_path=CURATION / 'task-coverage-followup.json'
    if protocol_followup_path.exists():
        protocol_followup=json.loads(protocol_followup_path.read_text())
        payload['taskCoverageFollowup']=protocol_followup['summary']
        (ROOT/'dist/task-coverage-followup.json').write_bytes(protocol_followup_path.read_bytes())
    payload['version']='atlas-task-protocols-v24'
    followup_path=CURATION / 'task-review-followup.json'
    if followup_path.exists():
        followup=json.loads(followup_path.read_text())
        payload['taskReviewFollowup']=followup['summary']
        (ROOT/'dist/task-review-followup.json').write_bytes(followup_path.read_bytes())
    if path.exists():(ROOT/'dist/task-protocol-review.json').write_bytes(path.read_bytes())
    return payload
