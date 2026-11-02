"""Integrate captured public results without network access or cross-source aggregation."""
import copy
import csv
import gzip
import hashlib
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = Path('data/sources/official-leaderboards/2026-11-02-integration')

def bi(zh, en): return {'zh': zh, 'en': en}
def read(name):
    p = ROOT / EVIDENCE / name
    return json.loads(gzip.decompress(p.read_bytes()) if name.endswith('.gz') else p.read_text())
def col(id, zh, en, unit='', direction='desc', rankable=True):
    return dict(id=id, label=bi(zh,en), unit=unit, direction=direction, rankable=rankable)
def score(v, digits=2, unit='', source=None):
    if v is None or v == '': return None
    n = float(v)
    return dict(value=n, sortValue=n, display=(f'{n:,.0f}' if digits==0 else f'{n:.{digits}f}')+unit, sourceValue=v if source is None else source)
def context(zh,en,value): return dict(label=bi(zh,en),value=value)
def set_score(e, k, v, **kw):
    s=score(v,**kw)
    if s is not None: e['scores'][k]=s

def integrate(boards, metadata, sources):
    capture=read('capture.json')
    byid={b['id']:b for b in boards}
    def snapshot(b,file,date=None):
        b.update(displayMode='snapshot',entries=[])
        b['source'].update(evidenceFile=str(EVIDENCE/file),snapshotAt=capture['capturedAt'])
        if date:
            b['source']['pageUpdatedAt']=date
            metadata[b['id']].update(dateKind='dataUpdated')
            metadata[b['id']].pop('dateLabel',None)
            metadata[b['id']].pop('dateMissingLabel',None)
    def extend(base,id,label):
        b=copy.deepcopy(base);b['id']=id;b['trackLabel']=label
        metadata[id]=copy.deepcopy(metadata[base['id']]);boards.append(b)
        next(s for s in sources if base['id'] in s['boardIds'])['boardIds'].append(id)
        return b

    # Five aggregate tables; native per-game headline scores remain separate metrics.
    base=byid['duellab-gamebench2'];manifest=read('duellab-release.json')
    raw=gzip.decompress((ROOT/EVIDENCE/'duellab.csv.gz').read_bytes())
    assert hashlib.sha256(raw).hexdigest()==manifest['artifact_sha256']['benchmark/leaderboard.csv']
    rows=list(csv.DictReader(io.StringIO(raw.decode())))
    assert {r['results_cut_id'] for r in rows}=={manifest['public_release_id']}
    tracks=[('overall',base['id'],bi('模型总榜','Overall models')),('full_freedom/mixed','duellab-variants',bi('全部推理配置','Reasoning variants')),('full_freedom/baseline','duellab-baseline',bi('Baseline 档','Baseline')),('full_freedom/balanced','duellab-balanced',bi('Balanced 档','Balanced')),('full_freedom/intensive','duellab-intensive',bi('Intensive 档','Intensive'))]
    for track,id,label in tracks:
        b=base if id==base['id'] else extend(base,id,label)
        snapshot(b,'duellab.csv.gz',manifest['generated_at']);b['trackLabel']=label
        b['source'].update(dataUrl=manifest['release_url']+'leaderboard.csv',releaseId=manifest['public_release_id'],licenseUrl=manifest['data_license_url'])
        b['protocolKey']=bi('GameBench 2 · 8 个游戏 · 生成策略程序','GameBench 2 · 8 games · Generated player programs')
        b['snapshotLabel']=bi('完整模型／配置表；分游戏为来源 headline score','Complete model/setup table; game metrics use source headline scores')
        b['protocol']['verification']=bi('DuelLab 官方 CSV，按发布清单 SHA-256 核对。数据 CC BY 4.0；本站调整字段与显示精度。','Official DuelLab CSV, checked against the release SHA-256. Data: CC BY 4.0; Atlas reformats fields and display precision.')
        b['protocol']['variation']=bi('主分数计入模型原因导致的生成失败；provisional 和 partial 行独立列为参考成绩；partial 保留来源名次。分游戏指标取原始 headline_games，缺失值不补零。','Headline scores include model-caused generation failures. Provisional and partial rows are shown as references; partial rows retain source ranks. Game metrics retain headline_games values; missing scores are not zero-filled.')
        b['protocol']['links'].extend([dict(label=bi('字段与排名定义','Data and rank definitions'),url=manifest['release_url']+'data-dictionary'),dict(label=bi('固定版本与引用','Release & citation'),url=manifest['release_url']),dict(label=bi('数据许可 · CC BY 4.0','Data licence · CC BY 4.0'),url=manifest['data_license_url'])])
        b['columns']=[col('overall','主分数','Headline score'),col('cost','生成成本','Generation cost','USD','asc'),col('matches','评级对局数','Rated matches',rankable=False),col('playable','可运行程序强度','Working-program strength')]+[col(f'GB2-{i:02}','游戏 '+f'GB2-{i:02}',f'Game GB2-{i:02}') for i in range(1,9)]
        b['tableMetrics']=['cost','matches']
        for i,r in enumerate(r for r in rows if r['track_id']==track and r['row_kind']=='track'):
            e=dict(id=id+'-'+str(i),agent=r['model_display_name'],configuration=r['reasoning_level'],officialRank=int(r['rank']) if r['rank'] else None,sourceRow=i,scores={},resultUrl=manifest['release_url'],sourceIdentity=r['canonical_public_row_identity'],eligibilityFlag=r['eligibility_flag']=='true',context=[context('提供方','Provider',r['provider']),context('原始状态','Source status',r['ranking_status']),context('计分依据','Score basis',r['score_basis']),context('最近测量','Last measured',r['last_measured_at'] or '—'),context('未排名原因','Unranked reason',r['ineligibility_reason_codes'] or '—'),context('成本依据','Cost evidence',r['codegen_cost_evidence_basis'])])
            if r['ranking_status']!='ranked' or r['eligibility_flag']!='true':e.update(reference=True,referenceLabel=bi('证据不完整 · '+r['ranking_status'],'Incomplete evidence · '+r['ranking_status']))
            for k,rk,dig in [('overall','score',2),('cost','codegen_cost_usd_mean',3),('matches','rated_matches',0),('playable','conditional_success_score',2)]:set_score(e,k,r[rk],digits=dig)
            for k,v in json.loads(r['headline_games_json'] or '{}').items():set_score(e,k,v.get('score'))
            b['entries'].append(e)

    # Preserve the original Best track and add every exported thinking configuration.
    base=byid['chessbench-best'];raw=read('chessbench.json')
    base['trackLabel']=bi('Best · 每模型最佳配置','Best · One setup per model')
    b=extend(base,'chessbench-all',bi('全部推理配置','All thinking setups'));snapshot(b,'chessbench.json',raw['updatedAt'])
    b['title']=bi('ChessBench · 全部配置','ChessBench · All setups')
    b['source']['dataUrl']='https://chessbench.org/data/leaderboard.json'
    b['protocolKey']=bi('chessbench-v3 · 文字棋盘与合法着法 · 独立配置评级','chessbench-v3 · Text board + legal moves · Setup-level ratings')
    b['snapshotLabel']=bi('18 个模型 · 32 个配置','18 models · 32 setups')
    b['protocol']['scope']=bi('完整收录公开导出的全部推理配置，每种配置独立评级。','All thinking setups in the public export, with independent ratings per setup.')
    b['protocol']['verification']=bi('ChessBench 官方 JSON；保留原始精度、配置名与原榜名次。','Official ChessBench JSON; preserves full precision, setup names and source ranks.')
    b['columns']=[col('overall','Glicko-2 评级','Glicko-2 rating'),col('cost','每局成本','Cost / game','USD','asc'),col('time','每步用时','Time / move','s','asc'),col('illegal','非法着法比例','Illegal move rate','%','asc'),col('games','对局数','Games',rankable=False),col('deviation','评级偏差 RD','Rating deviation',rankable=False),col('tokens','每局输出 tokens','Output tokens / game',rankable=False)]
    b['tableMetrics']=['games','cost']
    for m in raw['models']:
        for s in m['setups']:
            e=dict(id='chess-'+s['key'],agent=m['name'],configuration=s['effort'],sourceRow=len(b['entries']),officialRank=s.get('rank'),scores={},resultUrl=m['url'],context=[context('胜 / 和 / 负','Win / draw / loss',f"{s['wins']} / {s['draws']} / {s['losses']}"),context('配置状态','Setup status',s['status']),context('已计价 / 成本未知对局','Priced / unpriced games',f"{s['pricedRuns']} / {s['unknownRuns']}")])
            if not s.get('rank'):e.update(reference=True,referenceLabel=bi('原站未排名','Unranked at source'))
            for k,rk,dig,scale in [('overall','rating',2,1),('cost','avgCost',3,1),('time','avgMoveTime',2,0.001),('illegal','illegalRate',2,1),('games','games',0,1),('deviation','deviation',2,1),('tokens','avgOutputTokens',0,1)]:
                v=s.get(rk);set_score(e,k,v*scale if v is not None else None,digits=dig,source=v)
            b['entries'].append(e)
    # New visits open the complete configuration table; old Best links still resolve.
    src=next(s for s in sources if s['id']=='chessbench');src['boardIds']=['chessbench-all','chessbench-best']
    base['protocolKey']=b['protocolKey']
    for e in base['entries']:
        e['agentLabel'],e['configuration']=e['agent'].rsplit(' · ',1)

    b=byid['starskirmish-v02'];raw=read('starskirmish.json');snapshot(b,'starskirmish.json','2026-10-15')
    b['source']['dataUrl']=capture['starskirmish']['url'];b['protocolKey']=bi('v0.2 · 每次开发 1 小时 · 每模型 5 次运行','v0.2 · 1-hour development · 5 runs per model')
    b['columns']=[col('overall','平均胜率','Mean win rate','%'),col('cost','每次开发成本','Cost / development run','USD','asc')];b['tableMetrics']=['cost']
    b['protocol']['verification']=bi('取自官网 v0.2 图表的 data.js，保留九个模型、五次运行胜率和平均 API 成本。','From the official v0.2 chart data.js: all nine models, five run win rates and mean API cost.')
    for i,r in enumerate(raw['SCORES']):
        k=r['k'];e=dict(id='starskirmish-'+k,agent=raw['MODELS'][k]['name'],configuration='high' if k=='argon' else 'max',sourceRow=i,scores={},resultUrl=b['source']['url'],context=[context('五次运行胜率 (%)','Five run win rates (%)',' / '.join(map(str,raw['RUNS'][k]))),context('BWAPI / 引擎','BWAPI / engine','4.4.0 / OpenBW')]);set_score(e,'overall',r['score']);set_score(e,'cost',raw['COSTS'][k]);b['entries'].append(e)

    # Recap is explicitly attributed as a community mirror; divisions are separate tracks.
    base=byid['sc2-ai-arena'];raw=read('sc2-recap.json')
    for division in sorted({r['division'] for r in raw['data']}):
        id=base['id'] if division==1 else 'sc2-division-'+str(division)
        b=base if division==1 else extend(base,id,bi(f'分区 {division}',f'Division {division}'))
        snapshot(b,'sc2-recap.json');b['trackLabel']=bi(f'分区 {division}',f'Division {division}')
        b['source'].update(dataUrl=capture['sc2']['url'],mirrorSyncedAt=capture['sc2']['mirrorSyncedAt'])
        b['protocolKey']=bi(f'2026 Season 2 · 分区 {division} · 完整 Bot 对战',f'2026 Season 2 · Division {division} · Full-bot matches')
        b['protocol']['verification']=bi('AI Arena 官方对局数据，经社区 AI Arena Recap 汇总。本站按分区展示并保留 Recap 原榜名次；镜像同步时间单独记录。','Official AI Arena match data aggregated by the community AI Arena Recap. Atlas separates divisions and retains Recap ranks; mirror sync time is recorded separately.')
        b['protocol']['links'].append(dict(label=bi('社区数据镜像 · AI Arena Recap','Community data mirror · AI Arena Recap'),url='https://aiarenarecap.com/'))
        b['columns']=[col('overall','Elo','Elo'),col('winrate','胜率','Win rate','%'),col('matches','对局数','Matches',rankable=False),col('peak','最高 Elo','Peak Elo',rankable=False),col('step','每步计算时间','Compute time / step','ms','asc'),col('crashes','崩溃次数','Crashes',rankable=False)];b['tableMetrics']=['winrate','matches']
        for i,r in enumerate(x for x in raw['data'] if x['division']==division):
            e=dict(id='sc2-bot-'+str(r['bot_id']),agent=r['name'],configuration=r['race'],officialRank=r['rank'],sourceRow=i,scores={},resultUrl='https://aiarenarecap.com/bots/'+str(r['bot_id']),context=[context('作者','Author',r['author']),context('实现','Implementation',r['type']),context('胜 / 负 / 平','Win / loss / tie',f"{r['win_count']} / {r['loss_count']} / {r['tie_count']}")])
            for k,rk,dig in [('overall','elo',0),('winrate','win_perc',2),('matches','match_count',0),('peak','highest_elo',0),('crashes','crash_count',0)]:set_score(e,k,r[rk],digits=dig)
            set_score(e,'step',r['avg_step_time']*1000 if r['avg_step_time'] is not None else None,source=r['avg_step_time']);b['entries'].append(e)

    # Kaggle's public response contains all models, including deprecated versions.
    base=byid['kaggle-game-arena']
    configurations=[(None,base['id'],'综合榜','Unified'),('chess-text','kaggle-chess','国际象棋','Chess'),('go','kaggle-go','围棋','Go'),('poker-heads-up','kaggle-poker','单挑扑克','Heads-up poker'),('werewolf','kaggle-werewolf','狼人杀','Werewolf')]
    for slug,id,zh,en in configurations:
        b=base if slug is None else extend(base,id,bi(zh,en))
        filename=slug+'-scores.json' if slug else 'kaggle-unified.json';raw=read(filename);meta=read(slug+'-meta.json' if slug else 'kaggle-meta.json')
        snapshot(b,filename);b['trackLabel']=bi(zh,en);b['source']['url']='https://www.kaggle.com/benchmarks/kaggle/'+(slug or 'game-arena')
        b['source']['request']=capture['kaggle']['api'];b['source']['versionId']=meta['version']['id']
        b['protocolKey']=bi('Game Arena · '+zh+' · 官方模型版本','Game Arena · '+en+' · Published model versions')
        if slug:b['coverageLabel']=bi(zh,en)
        b['protocol']['links']=[dict(label=bi('游戏协议与官方成绩','Game protocol & official results'),url=b['source']['url']),dict(label=bi('Game Arena 评测方法','Game Arena methodology'),url='https://www.kaggle.com/game-arena-faq')]
        b['protocol']['verification']=bi('Kaggle 公开成绩接口的完整模型表，包含已停用模型版本；保留原榜名次和置信区间。','Complete model table from Kaggle’s public result response, including deprecated versions; source ranks and confidence intervals are retained.')
        b['protocol']['scope']=bi(zh+'赛道；各游戏指标使用原榜定义。','The '+en+' track; game metrics retain their source definitions.')
        b['researchUse']=bi(*{
          None:('比较模型在多种策略游戏中的综合对战表现，结合单项成绩分析能力差异。','Compare model performance across strategic games and examine differences through game-specific scores.'),
          'chess-text':('评测文字棋盘下的多步规划、合法着法生成与对手响应。','Evaluate multi-step planning, legal move generation and opponent responses from text board states.'),
          'go':('评测局部战术、全局布局与规则约束下的逐步决策。','Evaluate local tactics, whole-board planning and decisions under game rules.'),
          'poker-heads-up':('评测不完全信息下的下注策略、风险判断与对手适应。','Evaluate betting strategy, risk assessment and opponent adaptation under imperfect information.'),
          'werewolf':('评测角色不对称条件下的社会推理、沟通与协作。','Evaluate social reasoning, communication and coordination with asymmetric roles.')
        }[slug])
        b['protocol']['scoring']=bi(*{
          None:('官方 pooled Bradley–Terry 综合分数；每个游戏仅使用核心变体参与汇总。','Official pooled Bradley–Terry score; each game contributes only its core variant.'),
          'chess-text':('Bradley–Terry Elo-style 评级与原站置信区间。','Bradley–Terry Elo-style ratings and source confidence intervals.'),
          'go':('Bradley–Terry Elo-style 评级与 bootstrap 置信区间。','Bradley–Terry Elo-style ratings and bootstrapped confidence intervals.'),
          'poker-heads-up':('主指标为 Mean BB/100；使用重复发牌降低牌序差异。','Primary metric: Mean BB/100; duplicated hands reduce card-order variance.'),
          'werewolf':('Polarix equilibrium rating，保留角色非对称与非传递对战关系；不解释为 Elo。','Polarix equilibrium rating, representing asymmetric roles and non-transitive performance; not an Elo score.')
        }[slug])
        if slug=='chess-text':b['protocol']['control']=bi('FEN 棋盘与 PGN 历史，不提供合法着法列表；输出 SAN 着法。','FEN board and PGN history, without a legal-move list; outputs SAN moves.')
        if slug=='werewolf':b['protocol']['variation']=bi('评级与区间按原榜换算为百分比，费用保留美分。原榜列名为每步 tokens / 费用，导出任务名含 per game；本站沿用展示列名并保留原始字段。','Ratings and intervals use the source percentage display; costs remain in cents. The visible columns say per turn while export task names say per game; Atlas retains the display labels and original fields.')
        if slug=='werewolf':b['protocol']['budget']=bi('8 人：2 狼人、1 预言家、1 医生、4 村民；最多 3 次输出重试。','Eight players: two werewolves, one seer, one doctor, four villagers; up to three output retries.')
        headers=raw['taskVersionHeaders'];primary=meta['version']['taskVersion']['id'];mapping={}
        labels={'Score':('评分','Score'),'Matches Played':('对局数','Matches played'),'Games Covered':('参与游戏数','Games covered'),'Avg. Tokens/Turn':('每步 tokens','Tokens / turn'),'Avg. Cost/Turn':('每步成本','Cost / turn'),'Mean BB/100':('Mean BB/100','Mean BB/100'),'Equilibrium Rating':('均衡评级','Equilibrium rating'),'Average Output Tokens per Game':('每局输出 tokens','Output tokens / game'),'Average Inference Cost per Game':('每局推理成本','Inference cost / game')}
        b['columns']=[]
        for h in headers:
            task=h['taskVersion'];display=h.get('taskVersionMapping',{});name=display.get('columnName') or task['name'];dtype=display.get('displayType') or task.get('displayType');k='overall' if task['id']==primary else 'metric-'+str(task['id']);mapping[task['id']]=k
            iscost='Cost' in name;iscount='Tokens' in name or name in ['Matches Played','Games Covered'];label=labels.get(name,(name,name))
            c=col(k,*label,unit='¢' if dtype=='CENTS' else '%' if dtype=='PERCENTAGES' else '',direction='asc' if iscost else 'desc',rankable=not iscount)
            c.update(sourceDisplayType=dtype,sourceTaskName=task['name'],displayScale=100 if dtype=='PERCENTAGES' else 1,displayDigits=2 if dtype in ['CENTS','PERCENTAGES'] else 0 if iscount else 1)
            b['columns'].append(c)
        b['columns'].sort(key=lambda c:c['id']!='overall');b['tableMetrics']=[c['id'] for c in b['columns'][1:]]
        lookup={};dates=[]
        for r in raw['entries']:
            assert len(r['runs'])==1
            run=r['runs'][0];num=run['result'].get('numericResult');lookup[(r['modelVersionId'],r['taskVersionId'])]=num
            if run['result'].get('evaluationDate'):dates.append(run['result']['evaluationDate'])
        b['source']['pageUpdatedAt']=max(dates);metadata[id].update(dateKind='dataUpdated');metadata[id].pop('dateMissingLabel',None)
        for i,h in enumerate(raw['modelVersionHeaders']):
            m=h['modelVersion'];e=dict(id=id+'-'+str(m['id']),agent=m['displayName'],sourceRow=i,officialRank=h.get('rank'),scores={},resultUrl=b['source']['url'],context=[context('模型版本','Model version',m['slug']),context('提供方','Provider',m['organization']['name'])])
            if m.get('deprecationTime'):e['entryNote']=bi('已停用版本','Deprecated version')
            if not h.get('rank'):e.update(reference=True,referenceLabel=bi('原站未排名','Unranked at source'))
            for task,k in mapping.items():
                n=lookup.get((m['id'],task))
                if n is None:continue
                # Protobuf JSON omits a numeric zero; a present numericResult is an observation.
                v=n.get('value',0);c=next(c for c in b['columns'] if c['id']==k);scale=c['displayScale'];digits=c['displayDigits'];set_score(e,k,v*scale,digits=digits,source=v)
                ci=n.get('unevenConfidenceInterval')
                if ci:e['scores'][k]['interval']=f"−{ci.get('minus',0)*scale:.{digits}f} / +{ci.get('plus',0)*scale:.{digits}f}"
                if n.get('confidenceInterval') is not None:e['scores'][k]['interval']=f"±{n['confidenceInterval']*scale:.{digits}f}"
            b['entries'].append(e)

    b=byid['arc-agi3-2026'];raw=read('arc-public.json.gz');teams={t['teamId']:t for t in raw['teams']};snapshot(b,'arc-public.json.gz')
    b['protocolKey']=bi('2026 赛季 · Public leaderboard · 公开测试部分','2026 season · Public leaderboard · Public test split')
    b['agentLabel']=bi('参赛团队','Team');b['dateLabel']=bi('团队最近提交','Latest team submission');b['hideRowDates']=True
    metadata[b['id']].update(dateKind='latestSubmission',dateLabel=bi('最近团队提交','Latest team submission'));metadata[b['id']].pop('dateMissingLabel',None)
    b['columns']=[col('overall','公开榜成绩','Public score'),col('submissions','提交次数','Submissions',rankable=False)]
    b['protocol']['scope']=bi('2026 比赛期间公开榜；不是最终私有测试榜。','Public standings during the 2026 competition, not the final private-test leaderboard.')
    b['protocol']['scoring']=bi('ARC-AGI-3 Metric，越高越好。公开榜基于约 50% 测试数据；最终榜使用其余部分。','ARC-AGI-3 Metric, higher is better. The public board uses approximately 50% of test data; final standings use the remainder.')
    b['protocol']['verification']=bi('Kaggle 公开榜完整响应，按 teamId 关联团队；保留 5,038 个排名团队及 3 条未排名记录。','Full Kaggle public leaderboard response, joined by teamId; 5,038 ranked teams and three unranked records.')
    b['protocol']['dates']=bi('显示团队最近提交时间，不代表该队最佳成绩的产生时间。','Dates identify the team’s latest submission, not when its best score was achieved.')
    for i,r in enumerate(raw['publicLeaderboard']):
        t=teams[r['teamId']];e=dict(id='arc-team-'+str(r['teamId']),agent=t['teamName'],sourceRow=i,officialRank=r.get('rank'),submissionDate=t.get('lastSubmissionDate'),scores={},resultUrl=b['source']['url'],context=[context('团队 ID','Team ID',str(r['teamId'])),context('对应提交 ID','Score submission ID',str(r['submissionId']))])
        if not r.get('rank'):e.update(reference=True,referenceLabel=bi('原站未排名','Unranked at source'))
        set_score(e,'overall',r['displayScore']);e['scores']['overall']['display']=r['displayScore'];set_score(e,'submissions',t.get('submissionCount'),digits=0);b['entries'].append(e)

    for b in boards:
        if b['id']=='tales':
            b['researchUse']=bi('比较语言模型在五类文字交互环境中的规划、探索与科学实验推理。','Compare planning, exploration and scientific reasoning across five text-interaction frameworks.')
            b['protocolKey']=bi('文字观察与动作 · 5 个框架 · 含 ScienceWorld','Text observations and actions · 5 frameworks · Includes ScienceWorld')
            for e in b['entries']:e['agentLabel'],e['configuration']=e['agent'].rsplit(' · ',1)
