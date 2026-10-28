"""Build the public full index from a bibliographic whitelist, never personal notes."""
from .paths import ROOT, CURATION
import json,re,csv,hashlib
from collections import Counter
from .game_attribution import load_reviews, public_review
SOURCE=ROOT/'data/catalog.json'
KINDS={
 'benchmark':['AX26-2602.17594','AX26-2604.07429','GAB098','AX26-2605.30931','AX26-2607.29218','GAP-A10','AX26-2605.29512','AX26-2601.09017','REC-4.2','GAB092','GAB099','GAP-B8','GAB082','GAB078','GAB003','GAP-A7'],
 'environment':['GAB004','GAB006','GAB007','GAB008','GAB015','GAB016','GAB018','GAB020','GAB021','GAB025','GAB028','GAB030','GAB032','GAB041','GAB044','GAB047','GAB049','GAB051','GAB062','GAB075','GAB079','GAB084','GAB089','GAB091','GAB094','GAB103'],
 'platform':['GAB009','GAB011','GAB012','GAB014','GAB031','GAB033','GAB046','GAB054','GAB060','GAB061','GAB086','GAP-A11'],
 'dataset':['GAB022','GAB002','GAB029','GAB043','GAB045','GAB096','GAB107','AX26-2607.20767'],
 'protocol':['GAB023','GAB039','GAB068'],
 'method':['GAB083','GAB111','TOP-01','TOP-02','TOP-03','TOP-04','TOP-05','TOP-06','TOP-07','TOP-08','TOP-09','TOP-10','TOP-11','TOP-12','TOP-13','TOP-14','TOP-15','TOP-16','TOP-17','TOP-18','TOP-19','TOP-21','TOP-22','TOP-23','TOP-24','TOP-25','AX26-2601.02427','AX26-2604.08340','AX26-2605.00347'],
}
GENRE_RULES={
 'RTS':r'starcraft|star craft|μrts|microrts|rtsgame|age of llm|^smac',
 'TBS':r'civrealm|civbench|civilization|diplomacy',
 'MOBA':r'honor of kings|hokoff|moba|dota',
 'FPS':r'doom|hasard|coom|counter.strike|crossfire|farlight|arena breakout',
 'Fighting':r'fightladder|footsies|fightingice|dark souls|dsle',
 'Racing':r'gran turismo|gt sophy|racing',
 'Sandbox':r'minecraft|minedojo|mineanybuild|mineexplorer|mirrorcraft|teamcraft|craftax|crafter|craftium|neural mmo|basalt|\biglu|factorio|\bmcu\b|mine.?npc',
 'Simulation':r'factorio|overcooked|smallville|farmquest',
 'Cards':r'card|poker|hanabi|douzero|doudizhu|guandan|ptcg|valet|spire',
 'Board':r'chess|ludo|board game|stratego|codenames|balderdash|avalonbench|avalon.tom|werewolf|spyfall|parliamentbench',
 'Roguelike':r'nethack|\bnle\b|minihack|katakomba|spire|roguelike',
 'Puzzle':r'puzzle|hanoi|sokoban|baba is|witness|minigrid|babyai|messenger|classiclogic|childplay|game.?traversal|arc.agi',
 'Sports':r'football|soccer|volleyball|volleybots|basketball|robocup',
 'Text adventure':r'textworld|jericho|scienceworld|machiavelli|alfworld|agentodyssey|flashadventure|whodunit|ncp.bench',
 'Platformer':r'coinrun|mariogpt|platform game',
 'Abstract task':r'alchemy|memory gym|memory maze|popgym|bsuite|matrix game|mean field|repeated games|bench.mfg|\bguard\b',
}
MULTI={'GAB001','GAB005','GAB052','GAB057','GAB058','GAB070','GAB077','GAB080','GAB081','GAB082','GAB098','GAB105','GAB106','GAB112','GAP-A1','GAP-A3','GAP-A5','GAP-A6','GAP-A7','GAP-A12','GAP-B4','GAB013','GAB064'}
CAP_RULES={
 'long-horizon':r'long.horizon|long.term|long.context|open.ended|never.ending|full story|multi.horizon',
 'planning':r'planning|plan and select|traversing|compositional|spatial planning',
 'coordination':r'coordinat|cooperat|collaborat|multi.agent|multiagent|team',
 'strategy':r'strateg|game.theor|decision.making',
 'memory':r'memory|remember|episodic|partial.*observ',
 'exploration':r'explor|discovery|hidden rule|causal',
 'generalization':r'generaliz|generalisation|transfer|unseen|distribution',
 'social':r'social|deception|deceive|theory of mind|belief|communication|negotiat',
 'control':r'control|real.time|visual.temporal',
}
def kind(r):
 if re.search(r'survey|sok:',r['title'].lower()):return 'survey'
 for k,ids in KINDS.items():
  if r['id'] in ids:return k
 if r['id'].startswith('VLA-') or r['category'].startswith('X') or r['id'].startswith(('NATURE','CWM')):return 'method'
 title=r['title'].lower();short=r['short'].lower()
 if 'survey' in title or 'sok:' in title:return 'survey'
 if 'benchmark' in title or 'bench' in short:return 'benchmark'
 if 'competition' in title or 'contest' in title or 'challenge' in title:return 'competition'
 if 'dataset' in title:return 'dataset'
 if re.search(r'environment|testbed|simulator',title):return 'environment'
 if re.search(r'platform|toolkit|framework|library',title):return 'platform'
 return 'review'
def identity(url):
 m=re.search(r'(?:arxiv.org/(?:abs|html|pdf)/|alphaxiv.org/abs/)(\d{4}\.\d{4,5})',url)
 if m:return 'arxiv:'+m[1]
 m=re.search(r'doi.org/(.+)',url)
 if m:return 'doi:'+m[1].lower().rstrip('/')
 m=re.search(r'openreview.net/(?:forum|pdf)\?id=([^&]+)',url)
 if m:return 'openreview:'+m[1]
 return url.rstrip('/').lower()
def canonical(url):
 if not url or not re.match(r'^https?://',url):return None
 key=identity(url)
 if key.startswith('arxiv:'):return 'https://arxiv.org/abs/'+key[6:]
 return url

def build():
 attribution_reviews=load_reviews()
 source=json.loads(SOURCE.read_text());raw=source['records'];datajs=(ROOT/'dist/data.js').read_text();atlas=json.loads(datajs.removeprefix('window.ATLAS_DATA = ').rstrip(';\n'));curated=atlas['records'];game_records={r['id']:r for r in atlas.get('gameCatalogRecords',[])};discovery={r['legacyId']:r for r in curated};profiles={r['legacyId']:r for r in curated if r.get('detailLevel')!='source'}
 rows=[]
 for r in raw:
  text=' '.join([r['title'],r['short'],r.get('game','')]).lower();k=kind(r);g=[key for key,rule in GENRE_RULES.items() if re.search(rule,text)]
  if r['id'] in MULTI:g=['Multi-genre']
  caps=[key for key,rule in CAP_RULES.items() if re.search(rule,text)]
  agents=[]
  if re.search(r'language model|\bllm|language agent',text):agents.append('LLM')
  if re.search(r'vision.language|\bvlm|multimodal.*agent|multi.modal.*agent|\bmllm',text):agents.append('VLM')
  if re.search(r'reinforcement learning|\brl\b|\bmarl\b',text):agents.append('RL')
  paper=canonical(r.get('verified_source_url') or r['source_url'])
  row=dict(domain='development' if r['category']=='G10' else 'adjacent' if r['category'].startswith('X') or r['category'] in ['N01','C01'] else 'gameplay',id=r['id'],name=r['short'] or r['title'],title=r['title'],authors=r['authors'],year=r['year'],venue=r['venue'],paper=paper,repo=None,kind=k,genres=g,caps=caps,agents=agents,games=r.get('game') or '',review='catalog',added=False,profileId=None,evidence=[paper] if paper else [],classification='title-screen',scope=None,metrics=None,limits=None)
  if r['id'] in profiles:
   q=profiles[r['id']];row.update(profileId=q['id'],genres=q['genres'],caps=q['caps'],agents=q['agents'],games=', '.join(q['games']),repo='https://github.com/'+q['repo'],review='profiled',classification='profile',kind={'Benchmark':'benchmark','Benchmark suite':'benchmark','Research platform':'platform','Environment family':'environment','Environment + benchmark':'environment'}[q['kind']])
  rows.append(row)
 enrichment=json.loads((CURATION / 'library-enrichment.json').read_text()) if (CURATION / 'library-enrichment.json').exists() else []
 for patch in enrichment:
  target=next((r for r in rows if r['id']==patch.get('existingId')),None)
  if target:
   for field in ['repo','paper','genres','games','agents','caps','scope','metrics','limits','evidence','kind']:
    if field in patch and patch[field] is not None:target[field]=patch[field]
   target['review']='verified';target['classification']='source-review'
 additions=json.loads((CURATION / 'library-additions.json').read_text()) if (CURATION / 'library-additions.json').exists() else []
 for a in additions:rows.append(dict(a,domain='gameplay',added=True,profileId=None,review='verified',classification='source-review'))
 from .corpus_increment import patch_library
 patch_library(rows)
 # Exact identities only. Versions share identity; different papers in one project remain separate.
 seen={};unique=[];duplicates=[]
 for r in rows:
  if r['id'] in attribution_reviews:
   a=attribution_reviews[r['id']]
   r['gameAttribution']=public_review(a)
   if a.get('domain'):
    assert a['domain'] in ['gameplay','development','adjacent']
    r['domain']=a['domain']
   if a['status']=='confirmed':
    r['originalGames']=r['games']
    r['games']=[g['name'] for g in a['games']]
  if r['id'] in discovery:r['genres']=discovery[r['id']]['genres']
  elif r['id'] in game_records:r['genres']=game_records[r['id']]['genres']
  keys=['title:'+re.sub(r'[^\w]','',r['title'].lower())]
  if r.get('paper'):keys.append(identity(r['paper']))
  found=next((seen[k] for k in keys if k in seen),None)
  if found:duplicates.append(dict(id=r['id'],duplicateOf=found,reason='matching paper identity'));continue
  for key in keys:seen[key]=r['id']
  review_record=discovery.get(r['id']) or game_records.get(r['id'])
  if review_record and review_record.get('taskReview'):r['taskReview']=review_record['taskReview']
  if review_record and review_record.get('gameIdentityCorrected'):r['games']=review_record['games']
  unique.append(r)
 from .agent_paradigms import apply_library
 agent_summary=apply_library(unique)
 updated=max(['2026-10-18',agent_summary['checkedAt']]+[a['checkedAt'] for a in attribution_reviews.values()])
 payload=dict(version='full-index-'+updated,updated=updated,sourceRecords=len(raw),sourceHash=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),records=unique,duplicates=duplicates,counts=dict(total=len(unique),added=sum(r['added'] for r in unique),review=dict(Counter(r['review'] for r in unique)),kind=dict(Counter(r['kind'] for r in unique))),method={'zh':'范式字段已逐条核验，附独立依据与核验状态；其余题录、能力分类、游戏关联及任务协议分别保留原有核验范围。题录初筛标签只用于检索，不自动证明任务覆盖或模型兼容性。未知不代表不支持。','en':'Agent paradigms have field-specific primary-source reviews and statuses. Other bibliography, capability, game-association and protocol fields retain their separate review scopes. Bibliographic screening aids discovery and does not establish task coverage or model compatibility. Unknown does not imply unsupported.'})
 payload['agentParadigms']=agent_summary
 (ROOT/'dist/library-data.js').write_text('window.AtlasLibraryData='+json.dumps(payload,ensure_ascii=False,indent=2)+';\n')
 (ROOT/'dist/benchmark-library.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2))
 with (ROOT/'dist/benchmark-library.csv').open('w',newline='',encoding='utf-8-sig') as f:
  fields=['id','name','title','authors','year','venue','kind','domain','genres','games','agents','caps','paper','repo','review','classification','added','gameAttributionStatus','gameAttributionChecked','gameAttributionSources','taskReviewStatus','taskReviewChecked','taskReviewSources','taskReviewedScopeZh','taskReviewedScopeEn','taskFollowupOutcome','taskFollowupNoteZh','taskFollowupNoteEn','taskFollowupSources','taskEligibility','taskExclusionReason','protocolFollowupOutcome','protocolEvidenceMissingZh','protocolEvidenceMissingEn','protocolFollowupSources','agentParadigmStatus','agentParadigmChecked','agentParadigmBasisZh','agentParadigmBasisEn','agentParadigmSources','agentParadigmMissingZh','agentParadigmMissingEn'];w=csv.DictWriter(f,fieldnames=fields,lineterminator='\n');w.writeheader()
  for r in unique:
   row={k:'; '.join(r[k]) if isinstance(r.get(k),list) else r.get(k) for k in fields}
   ar=r['agentReview'];row.update(agentParadigmStatus=ar['status'],agentParadigmChecked=ar['checkedAt'],agentParadigmBasisZh='; '.join(c['agent']+': '+c['basis']['zh'] for c in ar['claims']),agentParadigmBasisEn='; '.join(c['agent']+': '+c['basis']['en'] for c in ar['claims']),agentParadigmSources='; '.join(e['url'] for e in ar['evidence']),agentParadigmMissingZh='; '.join(m['detail']['zh'] for m in ar['missing']),agentParadigmMissingEn='; '.join(m['detail']['en'] for m in ar['missing']))
   a=r.get('gameAttribution',{})
   row.update(gameAttributionStatus=a.get('status',''),gameAttributionChecked=a.get('checkedAt',''),gameAttributionSources='; '.join(e['url'] for e in a.get('evidence',[])))
   review=r.get('taskReview',{})
   pf=review.get('protocolFollowup',{})
   row.update(protocolFollowupOutcome=pf.get('outcome',''),protocolEvidenceMissingZh='; '.join(g['detail']['zh'] for g in pf.get('missing',[])),protocolEvidenceMissingEn='; '.join(g['detail']['en'] for g in pf.get('missing',[])),protocolFollowupSources='; '.join(e['url'] for e in pf.get('sources',[])))
   row.update(taskEligibility=review.get('eligibility',{}).get('decision',''),taskExclusionReason=review.get('eligibility',{}).get('reason') or '')
   row.update(taskReviewStatus=review.get('status',''),taskReviewChecked=review.get('checkedAt',''),taskReviewSources='; '.join(e['url'] for e in review.get('evidence',[])))
   followup=review.get('followup',{});scope=review.get('reviewedScope',{})
   row.update(taskReviewedScopeZh=scope.get('zh',''),taskReviewedScopeEn=scope.get('en',''),taskFollowupOutcome=followup.get('outcome',''),taskFollowupNoteZh=followup.get('noteZh',''),taskFollowupNoteEn=followup.get('noteEn',''),taskFollowupSources='; '.join(e['url'] for e in followup.get('sources',[])))
   w.writerow(row)
 (ROOT/'output/library-audit.json').write_text(json.dumps({k:v for k,v in payload.items() if k!='records'},ensure_ascii=False,indent=2))
 print(json.dumps(payload['counts'],ensure_ascii=False))
 return payload
if __name__=='__main__':build()
