#!/usr/bin/env python3
"""Rebuild the twelve additional boards from the committed official-source snapshot.

No network requests. Native score cells, source rows and capture timestamps are
retained; editorial scope and protocol notes are intentionally curated below.
"""
import json
import re
from pathlib import Path
from urllib.parse import urljoin
from email.utils import parsedate_to_datetime
ROOT=Path(__file__).resolve().parents[1]
SNAPSHOT='data/sources/official-leaderboards/2026-11-01-expansion.json'
RAW=json.loads((ROOT/SNAPSHOT).read_text())['sources']
BOARDS=[]
def bi(zh,en): return {'zh':zh,'en':en}
def col(key,zh,en,source=None,unit='',rankable=True,direction='desc'):
 return {'id':key,'label':bi(zh,en),'sourceColumn':source,'direction':direction,'unit':unit,'rankable':rankable,'isOverall':key=='overall'}
def score(raw,value=None,display=None):
 if value is None:
  match=re.fullmatch(r'-?\d+(?:\.\d+)?%?',str(raw).strip())
  value=float(str(raw).rstrip('%')) if match else None
 return {'display':str(raw) if display is None else display,'value':value,'sortValue':value,'sourceValue':raw}
def board(key,source,title,en,group,coverage,status,status_en,scope,scope_en,use,use_en,scoring,scoring_en,links,archive=None):
 cap=RAW[source]['capture'];b={'id':key,'evidenceKey':source,'benchmarkId':archive,'title':bi(title,en),'group':group,'coverageLabel':bi(*coverage),'statusLabel':bi(status,status_en),'researchUse':bi(use,use_en),'source':{'url':cap['url'],'dataUrl':cap['url'],'pageSha256':cap['sha256'],'snapshotAt':cap['capturedAt'],'pageUpdatedAt':None},'protocol':{'scope':bi(scope,scope_en),'scoring':bi(scoring,scoring_en),'variation':bi('保留来源发布的数值与精度。','Values and precision are retained from the source.'),'verification':bi('成绩由项目作者或竞赛组织方发布。','Results published by the project authors or competition organizers.'),'dates':bi('快照日期表示本站取数时间。','Snapshot date records when Atlas retrieved the source.'),'links':[{'label':bi(zh,en),'url':url} for zh,en,url in links]},'columns':[],'entries':[]}
 BOARDS.append(b);return b
def entry(b,i,name):
 return {'id':f'{b["id"]}-{i:03}','agent':re.sub('[🥇🥈🥉🎮]','',name).strip(),'sourceAgent':name,'sourceRow':i,'scores':{},'resultUrl':b['source']['url'],'context':[]}
def table_entries(b,name_col,date_col=None,context_cols=()):
 tab=RAW[b['evidenceKey']]['table'];b['source']['tableId']=tab['id']
 for c in b['columns']:c['sourceLabel']=tab['rows'][0]['cells'][c['sourceColumn']]['text']
 for i,row in enumerate(tab['rows'][1:],1):
  cells=row['cells'];e=entry(b,i,cells[name_col]['text'])
  for c in b['columns']:e['scores'][c['id']]=score(cells[c['sourceColumn']]['text'])
  for n,zh,en in context_cols:e['context'].append({'label':bi(zh,en),'value':cells[n]['text']})
  if cells[name_col]['text'].startswith('Baseline '):
   e.update(reference=True,referenceLabel=bi('组织方基线','Organizer baseline'))
  if date_col is not None and len(cells)==len(tab['rows'][0]['cells']):
   raw=cells[date_col]['text'];e['sourceDate']=raw
   e['submissionDate']=parsedate_to_datetime(raw).date().isoformat() if raw else None
  result=next((u for c in cells for u in c['links'] if '/submissions/' in u),None)
  if result:e['resultUrl']=urljoin(b['source']['url'],result)
  b['entries'].append(e)
 if date_col is not None:
  b['dateLabel']=bi('最后提交','Last submission');b['protocol']['dates']=bi('每行日期为最后提交日期；快照日期为本站取数时间。','Row dates are last-submission dates; snapshot date is the Atlas retrieval date.')
 return b

b=board('lmgame-model','lmgame-rendered','LMGame-Bench · 模型赛道','LMGame-Bench · Model track','general',('6 款游戏','6 games'),'官方模型榜','Official model board','固定模型赛道，包含马力欧、推箱子、2048、Candy Crush、俄罗斯方块与逆转裁判。','Model track covering Super Mario Bros, Sokoban, 2048, Candy Crush, Tetris and Ace Attorney.','比较同一模型跨动作控制、解谜和叙事推理任务的表现。','Compare a model across action control, puzzles and narrative reasoning.','综合分采用官方按模型池标准化的游戏分数；单游戏保留原始分。标准化随参评模型集合变化，缺失单项显示 n/a。','The aggregate uses the official model-pool normalization; game columns retain raw scores. Normalization depends on the model pool, and missing game results remain n/a.',[('计分实现','Scoring implementation','https://huggingface.co/spaces/lmgame/lmgame_bench/blob/main/leaderboard_utils.py'),('项目实现','Project code','https://github.com/lmgame-org/GamingAgent')],'GAB105')
b['columns']=[col('overall','平均标准化分','Average normalized score',3)]+[col(k,zh,en,i) for i,(k,zh,en) in enumerate([('mario','超级马力欧','Super Mario Bros'),('sokoban','推箱子','Sokoban'),('2048','2048','2048'),('candy-crush','Candy Crush','Candy Crush'),('tetris','俄罗斯方块','Tetris'),('ace-attorney','逆转裁判','Ace Attorney')],4)]
table_entries(b,1,context_cols=[(2,'机构','Organization')])

b=board('videogamebench-full','vgbench','VideoGameBench · 实时赛道','VideoGameBench · Full / real-time','general',('10 个测试游戏槽位','10 test-game slots'),'官方 Full 榜','Official Full board','视觉输入与按键操作；模型推理期间游戏继续运行，采用 Full 实时设置。','Screenshot input and keyboard control in the Full setting; games continue running during model inference.','比较视觉操作、任务进度与推理延迟对实际游戏表现的共同影响。','Study visual control and task progress under inference-time pressure.','保留官方总体进度与逐游戏百分比。榜单包含 7 个具名游戏与 3 个保密测试游戏；与暂停游戏的 Lite 设置分开。','Retains published overall and per-game progress percentages across seven named and three secret test games. Full and paused-game Lite results are separate.',[('设置与评价','Setting and evaluation','https://antimlabs.com/vgbench')],'GAP-A3')
b['columns']=[col('overall','总体进度','Overall progress',1,'%')]+[col('game-'+str(i),n,n,i,'%') for i,n in enumerate(['Civilization I','The Need for Speed','The Incredible Machine','Pokémon Crystal','Doom II',"Kirby’s Dream Land (DX)","Link’s Awakening (DX)",'Secret game #1','Secret game #2','Secret game #3'],2)]
table_entries(b,0)

b=board('gamebot','gamebot','GAMEBoT · 八游戏综合榜','GAMEBoT · Eight-game aggregate','strategy',('8 款游戏','8 games'),'官方综合榜','Official aggregate','文本游戏状态与专家设计的 CoT 子问题；八款游戏包含棋类、Atari、扑克和谈判。','Text game states and expert-designed CoT subproblems across board games, Atari, poker and negotiation.','研究规则理解、中间推理步骤与最终决策效果的关系。','Study how rule understanding and intermediate reasoning relate to final decisions.','对局分为累计奖励除以累计可得最高奖励；胜负型游戏按胜 +1、平 0、负 −1 计分，综合列保留官方跨游戏平均。此表与后续单独发布的两两对局记录分别维护。','Game scores divide total reward by total achievable reward; outcome-based games use win +1, draw 0 and loss −1. The aggregate retains the official cross-game average. Later pairwise match records are a separate result set.',[('论文与评测协议','Paper and protocol','https://aclanthology.org/2025.acl-long.378/'),('代码与对局','Code and matches','https://github.com/Visual-AI/GAMEBoT')],'GAB098')
b['columns']=[col('overall','平均分','Average score',2)]+[col('game-'+str(i),n,n,i) for i,n in enumerate(['Othello','Pong','Surround','Checkers','TicTacToe','Connect4',"Texas hold’em",'Negotiation v2'],3)]
table_entries(b,0)

b=board('procgen-2020-generalization','procgen-generalization','Procgen 2020 · 泛化决赛','Procgen 2020 · Generalization final','generalization',('16 公开 + 4 隐藏环境','16 public + 4 hidden environments'),'2020 决赛','2020 final','泛化赛道：每环境 200 个训练关卡，8M 交互步预算；在未见关卡及隐藏环境上测试。','Generalization track: 200 training levels and an 8M-step budget per environment, evaluated on unseen levels and hidden environments.','比较视觉强化学习的训练关卡过拟合与跨关卡泛化。','Compare training-level overfitting and generalization in visual reinforcement learning.','主指标为官方平均归一化回报；公开与隐藏环境组按竞赛权重汇总。IMPALA 为组织方参考基线，单独列示。','The primary metric is the official mean normalized reward, with public and hidden groups aggregated using competition weights. IMPALA is an organizer reference baseline.',[('竞赛协议','Competition protocol','https://www.aicrowd.com/challenges/neurips-2020-procgen-competition')])
b['columns']=[col('overall','平均归一化回报','Mean normalized reward',4)];table_entries(b,2,6)
for e in b['entries']:
 if 'impala' in e['agent'].lower():e.update(reference=True,referenceLabel=bi('IMPALA 基线','IMPALA baseline'))

b=board('nethack-2021-overall','nethack-overall','NetHack 2021 · 总决赛','NetHack 2021 · Final overall','exploration',('NetHack','NetHack'),'2021 Final Overall','2021 Final Overall','NetHack Learning Environment；包含学习策略与脚本策略的 Final Overall 赛道。','Final Overall track in the NetHack Learning Environment, including learned and scripted agents.','比较长期生存、探索、物品管理与程序化地下城决策。','Compare long-horizon survival, exploration, inventory management and procedural dungeon decisions.','本届决赛没有通关记录，按游戏分数中位数排序；同时保留均值与评测局数。脚本/神经策略类型见成绩详情。','No agent ascended in this final. Results are ordered by median game score, retaining mean score and episode counts; scripted/neural tags are shown in result details.',[('官方结果与协议','Official results and protocol','https://nethackchallenge.com/report.html'),('竞赛设置','Competition setting','https://www.aicrowd.com/challenges/neurips-2021-the-nethack-challenge')])
b['columns']=[col('overall','分数中位数','Median score',3),col('mean','平均分数','Mean score',4),col('episodes','评测局数','Episodes evaluated',5,rankable=False)]
table_entries(b,2,9,[(6,'策略类型','Agent type')])

b=board('meltingpot-2023-generalization','meltingpot-generalization','Melting Pot 2023 · 泛化赛道','Melting Pot 2023 · Generalization','cooperation',('4 类社会情境','4 social substrates'),'2023 泛化榜','2023 generalization board','四类社会情境中的 focal 群体，与未见的 background 策略群体交互。','Focal populations interact with unseen background populations across four social substrates.','比较策略面对陌生伙伴、竞争者和社会惯例时的适应能力。','Compare adaptation to unfamiliar partners, competitors and social conventions.','Generalization score 为主指标；按情境及 substrate 汇总归一化回报。归一化参照 Melting Pot 基线，数值可以超过 1；另保留 Mean Focal Score。','Generalization score aggregates normalized returns over scenarios and substrates. Normalization uses Melting Pot reference agents and may exceed 1. Mean Focal Score is retained separately.',[('赛道与计分规则','Track and scoring rules','https://www.aicrowd.com/challenges/meltingpot-challenge-2023')])
b['columns']=[col('overall','泛化分数','Generalization score',3),col('focal','平均 Focal 分数','Mean focal score',4)];table_entries(b,2,6)

b=board('minerl-2021-research','minerl','MineRL 2021 · Research 第二轮','MineRL 2021 · Research round 2','exploration',('Minecraft · ObtainDiamond','Minecraft · ObtainDiamond'),'2021 Research · Round 2','2021 Research · Round 2','在混淆观测/动作的 MineRL ObtainDiamond 环境中学习采集与制作；训练使用示范数据，交互预算为 8M 步。','Learn gathering and crafting in the obfuscated MineRL ObtainDiamond environment, using demonstrations and an 8M-step interaction budget.','比较示范学习与样本受限的长程技能学习。','Compare learning from demonstrations and sample-limited acquisition of long-horizon skills.','主指标为平均回合奖励，包含获取钻石前的阶段奖励；该分数不是获取钻石的成功率。只收录 Research 第二轮。','The metric is mean episode reward, including intermediate rewards before obtaining a diamond; it is not diamond success rate. Only Research round 2 is included.',[('Research 赛道协议','Research track protocol','https://www.aicrowd.com/challenges/neurips-2021-minerl-diamond-competition')])
b['source']['url']+='?challenge_leaderboard_extra_id=788&challenge_round_id=956'
b['columns']=[col('overall','平均回合奖励','Mean episode reward',3)];table_entries(b,2,6,[(4,'赛道','Track')])

b=board('textarena-balanced','textarena-results','TextArena · Balanced Subset','TextArena · Balanced Subset','strategy',('多游戏文字对战','Multi-game text competition'),'历史成绩 · 含非活跃模型','Historical results · inactive models included','官方 Balanced Subset 的标准模型成绩；本次来源返回的 21 个模型均已标记为非活跃，作为历史比较保留。','Standard-model results for the official Balanced Subset. All 21 returned models are marked inactive and retained for historical comparison.','比较模型通过文字规则、状态与行动进行多游戏对战的能力。','Compare multi-game competition through textual rules, states and actions.','以 TrueSkill μ 排序，σ 表示评级不确定性；另报告胜率和对局数。评级与对手池相关，胜率不包含平局为胜。','Ranked by TrueSkill μ, with σ describing rating uncertainty. Win rate and game counts are also retained. Ratings depend on the opponent pool; draws are not wins.',[('评测框架','Evaluation framework','https://www.textarena.ai/docs/overview'),('官方实现','Official implementation','https://github.com/TextArena/TextArena')])
b['source']['url']='https://www.textarena.ai/leaderboard';b['source']['request']=RAW['textarena-results']['capture']['request']
b['columns']=[col('overall','TrueSkill μ','TrueSkill μ'),col('uncertainty','TrueSkill σ','TrueSkill σ',rankable=False),col('win-rate','胜率','Win rate',unit='%'),col('games','对局数','Games played',rankable=False)]
for i,r in enumerate(RAW['textarena-results']['data'],1):
 e=entry(b,i,r['model_name']);e['sourceRecordId']=r['model_id']
 for k,field,factor in [('overall','trueskill',1),('uncertainty','trueskill_sd',1),('win-rate','win_rate',100),('games','games_played',1)]:
  v=r[field]*factor;e['scores'][k]=score(r[field],v,str(v) if k=='games' else f'{v:.2f}')
 e['context']=[{'label':bi('状态','Status'),'value':bi('非活跃','Inactive')},{'label':bi('胜 / 平 / 负','Wins / draws / losses'),'value':f'{r["wins"]} / {r["draws"]} / {r["losses"]}'}];b['entries'].append(e)
b['protocol']['variation']=bi('排名保留来源 μ 的完整精度，表格显示两位小数；σ 单独展示。','Ranking uses full source precision for μ; the table shows two decimals. σ is displayed separately.')

b=board('pgg-trueskill','pgg','PGG-Bench · TrueSkill','PGG-Bench · TrueSkill','cooperation',('公共物品与惩罚博弈','Public goods and punishment'),'作者发布结果','Author-published results','五名 LLM 进行十轮公共物品博弈，每轮包含公开交流、贡献与惩罚。','Five LLMs play ten rounds of a public-goods game with public messages, contributions and punishment.','研究个体收益、合作、搭便车与惩罚机制的相互作用。','Study interactions between individual payoffs, cooperation, free-riding and punishment.','根据最终代币余额的相对名次更新 TrueSkill；200 次随机重排对局并重新拟合，报告 μ 与 σ 的中位数。高评级表示相对收益更高，而非合作更多。','TrueSkill is updated from relative final-token ranks. The published μ and σ are medians over 200 random-order refits. A higher rating indicates higher relative payoffs, not more cooperation.',[('实验与计分协议','Experiment and scoring protocol','https://github.com/lechmazur/pgg_bench')])
b['source']['url']='https://github.com/lechmazur/pgg_bench#multi-pass-trueskill-leaderboard'
b['columns']=[col('overall','TrueSkill μ','TrueSkill μ',2),col('uncertainty','TrueSkill σ','TrueSkill σ',3,rankable=False),col('games','对局数','Games',4,rankable=False),col('tokens','平均最终代币','Average final tokens',5)]
table_entries(b,1);b['protocol']['variation']=bi('μ、σ 为 200 次重排拟合的中位数；代币列为对局结束余额的均值。','μ and σ are medians across 200 reordered fits; the token column is the mean end-of-game balance.')

for fmt in ['gen1ou','gen9ou']:
 label='Gen 1 OU' if fmt=='gen1ou' else 'Gen 9 OU'
 b=board('pokeagent-2025-'+fmt,'poke-battle-data','PokéAgent 2025 · '+label,'PokéAgent 2025 · '+label,'strategy',(label,label),'2025 资格赛 · 已冻结','2025 qualifying · frozen','Pokémon Showdown '+label+' 资格赛；按对应世代的规则、招式与队伍配置对战。','Pokémon Showdown '+label+' qualifying, using the generation-specific rules, moves and teams.','比较不完全信息下的队伍决策、对手建模与回合策略。','Compare team decisions, opponent modeling and turn-based strategy under imperfect information.','默认按官方 History Rating 排序，另列 Elo、GXE 与胜负局数。HR 基于全部对局拟合 Bradley–Terry 模型；基线单列，资格晋级和淘汰赛结果见官方页面。','Default ordering uses the official History Rating; Elo, GXE and win/loss counts are retained. HR fits a Bradley–Terry model to all battles. Baselines are separate; qualification and knockout outcomes remain on the official page.',[('对战赛道协议','Battle track protocol','https://pokeagent.github.io/track1.html'),('官方比赛回放','Official replays','https://replays.pokeagentshowdown.com/')],'SUP-pokeagent-challenge')
 b['source']['url']='https://pokeagent.github.io/leaderboard.html';d=RAW['poke-battle-data']['data'];b['source']['pageUpdatedAt']=d['last_updated'];b['source']['format']=fmt;b['source']['formatTimestamp']=d['format_timestamps'][fmt]
 b['columns']=[col('overall','History Rating','History Rating'),col('hr-uncertainty','HR 标准差','HR standard deviation',rankable=False),col('elo','Elo','Elo'),col('gxe','GXE','GXE',unit='%'),col('wins','胜局','Wins',rankable=False),col('losses','负局','Losses',rankable=False)]
 for i,r in enumerate(d['formats'][fmt],1):
  e=entry(b,i,r['username']['display']);e['sourceAgent']=r['username']['original'];e['sourceRecordId']=e['sourceAgent'];hr=r.get('whr') or {};v=hr.get('whr_elo')
  e['scores']['overall']=score(v,v,'—' if v is None else f'{v:.2f}')
  sd=hr.get('whr_std');e['scores']['hr-uncertainty']=score(sd,sd,'—' if sd is None else f'{sd:.2f}')
  for k in ['elo','gxe','wins','losses']:e['scores'][k]=score(r.get(k,'—'))
  if r['username'].get('is_starter_kit') or e['sourceAgent'].startswith('PAC-LLM-'):e.update(reference=True,referenceLabel=bi('组织方基线','Organizer baseline'))
  e['context']=[{'label':bi('原始参赛账号','Source competitor ID'),'value':e['sourceAgent']}]
  if hr.get('whr_ci_lower') is not None:e['context'].append({'label':bi('来源标注的 HR 95% 区间','Source-reported HR 95% interval'),'value':f'{hr["whr_ci_lower"]:.2f} – {hr["whr_ci_upper"]:.2f}'})
  b['entries'].append(e)
 b['protocol']['dates']=bi('数据文件于 2025-11-11 冻结更新；两个赛制的资格窗口分别在 10 月结束，非当前实时榜。','The source file was frozen on 2025-11-11; the two qualifying windows ended in October. This is not the current live ladder.')
 b['protocol']['variation']=bi('HR 保留来源完整精度排序、显示两位小数；标准差与来源标注的 95% 区间见详情。缺失 HR 的成绩可通过 Elo 查看。','HR uses full source precision for ordering and two decimals for display. Details retain its standard deviation and source-reported 95% interval. Entries without HR can be viewed by Elo.')

def seconds(s):
 try:
  parts=[float(x) for x in s.split(':')];return sum(v*60**i for i,v in enumerate(reversed(parts)))
 except (ValueError,AttributeError):return None
b=board('pokeagent-2025-speedrun','poke-speed-data','PokéAgent 2025 · Emerald 速通','PokéAgent 2025 · Emerald speedrun','exploration',('Emerald · 第一座道馆','Emerald · first gym'),'2025 速通结果','2025 speedrun results','推进 Pokémon Emerald 至第一座道馆：7 个阶段、26 个里程碑。','Progress through Pokémon Emerald to the first gym across seven phases and 26 milestones.','比较长程推进、导航、对话交互与跨阶段任务执行效率。','Compare long-horizon progress, navigation, dialogue interaction and execution efficiency across stages.','先按已完成里程碑数排序，同进度按累计用时排序。100% 表示第一座道馆任务完成；官方允许组合多个提交的最佳分段时间。人类与组织方 Agent 作为参考单列。','Ranked first by completed milestones, then by cumulative runtime. 100% means completion through the first gym. Official results allow best combined splits across submissions; human and organizer agents are separate references.',[('速通任务协议','Speedrunning task protocol','https://pokeagent.github.io/track2.html'),('官方榜单说明','Official leaderboard notes','https://pokeagent.github.io/leaderboard.html')],'SUP-pokeagent-challenge')
b['source']['url']='https://pokeagent.github.io/leaderboard.html';b['dateLabel']=bi('记录更新','Record updated');b['columns']=[col('overall','第一道馆进度','First-gym progress',unit='%'),col('runtime','累计用时','Cumulative runtime',rankable=False,direction='asc')];b['columns'][0]['tieBreak']='runtime';b['summaryMetric']='runtime'
b['rankingNote']=bi('按里程碑数降序，同进度按累计用时升序；参考成绩单列。','Completed milestones descending, then cumulative runtime ascending; references listed separately.')
for i,r in enumerate(RAW['poke-speed-data']['data'],1):
 e=entry(b,i,r['team']);phases=list(r.get('phase_splits',{}).values());done=sum(x.get('completed',0) for x in phases)
 if r['team']=='Avg Human':time=sum(seconds(x.get('duration')) or 0 for x in phases if x.get('completed',0)>0)
 else:
  times=[x.get('endTime') or x.get('duration') for x in phases if x.get('completed',0)>0 and (x.get('endTime') or x.get('duration')) not in [None,'-']];time=seconds(times[-1]) if times else None
 time=time or None
 display='—' if time is None else (f'{int(time)//3600}:{int(time)%3600//60:02}:{int(time)%60:02}' if time>=3600 else f'{int(time)//60}:{int(time)%60:02}')
 e['scores']={'overall':score(r['completion_percent'],done/26*100,f'{done/26*100:.1f}%'),'runtime':score(r['runtime'],time,display)}
 e['context']=[{'label':bi('已完成里程碑','Completed milestones'),'value':f'{done} / 26'},{'label':bi('提交次数','Submissions'),'value':str(r.get('submission_count',1))}]
 e['submissionDate']=r.get('last_updated','')[:10] or None;e['sourceDate']=r.get('last_updated')
 if r.get('video'):e['mediaUrl']=r['video']
 if r['team'] in ['Avg Human','PokeAgent','PokeAgentV2']:e.update(reference=True,referenceLabel=bi('人类参考','Human reference') if r['team']=='Avg Human' else bi('组织方基线','Organizer baseline'))
 b['entries'].append(e)
b['protocol']['dates']=bi('行日期为官方记录更新时间；用时按官方页面的阶段累计时间逻辑读取。','Row dates are official record-update dates; runtime follows the official page’s phase-time aggregation.')
b['protocol']['variation']=bi('进度由已完成里程碑数除以 26 计算；用时保留至秒。','Progress is completed milestones divided by 26; runtime is retained to the second.')

assert len(BOARDS)==12
out={'sourceSnapshot':SNAPSHOT,'boards':BOARDS}
(ROOT/'data/curation/official-leaderboard-expansion.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Imported',len(BOARDS),'additional boards,',sum(len(b['entries']) for b in BOARDS),'results.')
for b in BOARDS:print(b['id'],len(b['entries']))
