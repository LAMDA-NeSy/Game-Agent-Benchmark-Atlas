"""Join source-reviewed library entries to discovery without upgrading them to deep profiles.

Associations are explicit: suite-level labels never flow into every subgame.
The full bibliography remains unchanged and title-screened rows stay outside this join.
"""
from .paths import CURATION
import json, re
from .game_catalog import t
# ID, display name, genres, kind. Research collections are not presented as individual games.
NODES=[
 ('atari-2600','Atari 2600',['Multi-genre'],'collection'),
 ('doom','Doom / ViZDoom',['FPS'],'environment'),
 ('openspiel-games','OpenSpiel games',['Multi-genre','Cards'],'collection'),
 ('deepmind-lab','DeepMind Lab',['Multi-genre'],'family'),
 ('gvgai-games','GVGAI / VGDL games',['Multi-genre'],'collection'),
 ('coinrun','CoinRun (original)',['Platformer'],'environment'),
 ('obstacle-tower','Obstacle Tower',['Platformer','Puzzle'],'environment'),
 ('griddly-games','Griddly games',['Multi-genre'],'collection'),
 ('mini-rts','MiniRTS',['RTS'],'environment'),
 ('slay-the-spire','Slay the Spire',['Cards','Roguelike'],'game'),
 ('pokemon-showdown','Pokémon Showdown',['TBS','RPG'],'environment'),
 ('pokemon-emerald','Pokémon Emerald',['RPG'],'game'),
 ('gg-games','gg-bench generated games',['Multi-genre'],'collection'),
 ('slay-the-spire-2','Slay the Spire 2',['Cards','Roguelike'],'game'),
 ('darefightingice','DareFightingICE',['Fighting'],'environment'),
 ('craftax','Craftax / Craftax-Classic',['Sandbox','Roguelike'],'family'),
 ('popgym','POPGym',['Multi-genre','Abstract task'],'collection'),
 ('memory-maze','Memory Maze',['Abstract task'],'environment'),
 ('melting-pot','Melting Pot substrates',['Multi-genre','Abstract task'],'collection'),
 ('freeciv-web','Freeciv-web',['TBS'],'game'),
 ('sokoban','Sokoban',['Puzzle'],'game'),('tetris','Tetris',['Puzzle'],'game'),
 ('2048','2048',['Puzzle'],'game'),('candy-crush','Candy Crush',['Puzzle'],'game'),
 ('super-mario-bros','Super Mario Bros.',['Platformer'],'game'),
 ('ace-attorney','Ace Attorney: Phoenix Wright',['Adventure'],'game'),
 ('doom-ii','Doom II',['FPS'],'game'),('pokemon-crystal','Pokémon Crystal',['RPG'],'game'),
 ('links-awakening','The Legend of Zelda: Link’s Awakening DX',['Action','Adventure'],'game'),
 ('civilization-i','Civilization I',['TBS'],'game'),('need-for-speed','The Need for Speed',['Racing'],'game'),
 ('kirbys-dream-land','Kirby’s Dream Land',['Platformer'],'game'),
 ('incredible-machine','The Incredible Machine',['Puzzle'],'game'),
 ('street-fighter-ii','Street Fighter II: Special Champion Edition',['Fighting'],'game'),
 ('kinetix','Kinetix physics tasks',['Puzzle','Abstract task'],'family'),
]
# One-to-one or explicitly named collections. These are NOT inferred from title keywords.
ASSOCIATIONS={
 'SUP-ale':('atari-2600','single'), 'SUP-vizdoom':('doom','configurable'),
 'SUP-smac':('starcraft-ii','cooperative'), 'SUP-sc2le':('starcraft-ii','configurable'),
 'SUP-textworld':('textworld','single'), 'SUP-babyai':('babyai','single'),
 'SUP-openspiel':('openspiel-games','configurable'), 'SUP-deepmind-lab':('deepmind-lab','single'),
 'SUP-gvgai':('gvgai-games','configurable'), 'SUP-coinrun':('coinrun','single'),
 'SUP-obstacle-tower':('obstacle-tower','single'), 'SUP-minerl-dataset':('minecraft','single'),
 'SUP-griddly':('griddly-games','configurable'), 'SUP-elf':('mini-rts','competitive'),
 'SUP-malmo':('minecraft','configurable'), 'SUP-spirebench':('slay-the-spire','single'),
 'SUP-vgc-bench':('pokemon-showdown','competitive'), 'SUP-gg-bench':('gg-games','competitive'),
 'SUP-comrad':('doom','cooperative'), 'SUP-agenticsts':('slay-the-spire-2','single'),
 'SUP-darefightingice-llm-2026':('darefightingice','competitive'),
 'GAB059':('craftax','single'), 'GAB026':('crafter','single'), 'GAB015':('minihack','single'),
 'GAB048':('popgym','single'), 'GAB047':('memory-maze','single'),
 'GAB013':('melting-pot','configurable'), 'GAB064':('melting-pot','configurable'),
 'GAP-A4':('minecraft','cooperative'), 'GAB075':('freeciv-web','competitive'),
 'GAB067':('starcraft-ii','competitive'), 'GAB076':('street-fighter-ii','competitive'),
 'GAB095':('doom','single'), 'GAB050':('doom','single'), 'GAB034':('doom','single'),
 'GAB094':('kinetix','single'),
}
# Game-scoped capability assignments for suites; no automatic inheritance.
SCOPED={
 'SUP-pokeagent-challenge':[
  ('pokemon-showdown',['strategy','generalization'],'competitive', ['LLM']),
  ('pokemon-emerald',['long-horizon','planning'],'single', ['LLM'])],
 'GAB105':[(g,c,'single',['LLM','VLM']) for g,c in [
  ('sokoban',['planning','control']),('tetris',['planning','control']),('2048',['planning']),
  ('candy-crush',['planning']),('super-mario-bros',['control']),('ace-attorney',['planning'])]],
 'GAP-A3':[(g,c,'single',['VLM']) for g,c in [
  ('doom-ii',['control']),('pokemon-crystal',['long-horizon','planning']),
  ('links-awakening',['control','planning']),('civilization-i',['long-horizon','planning']),
  ('need-for-speed',['control']),('kirbys-dream-land',['control']),('incredible-machine',['planning'])]],
}
KIND={'benchmark':'Benchmark','environment':'Environment family','platform':'Research platform','dataset':'Dataset','competition':'Competition','protocol':'Evaluation protocol'}
GENRES=[('RTS','即时战略（RTS）'),('TBS','回合制策略（TBS）'),('FPS','第一人称射击（FPS）'),('Fighting','格斗（FTG）'),('RPG','角色扮演（RPG）'),('Racing','竞速（RAC）'),('Platformer','平台跳跃'),('Adventure','冒险（AVG）')]

def integrate(payload, library):
 rationales=json.loads((CURATION / 'library-classification-evidence.json').read_text())
 games=payload['gameIndex']; bygame={g['id']:g for g in games}; dims=set(payload['taxonomy'])
 unknown=t('尚未逐任务核验；请查阅所选任务的官方配置。','Not reviewed per task; consult the official configuration of the selected task.')
 no_metrics=t('尚未整理为统一指标；需选定任务后核对官方评分。','Metrics are not normalized here; select a task and check its documented scoring.')
 review_note=t('来源已核对；未安装或运行。能力为研究关联，不是独立测量结果。','Sources reviewed; not installed or run. Capabilities denote research relevance, not isolated measurements.')
 for gid,name,cats,kind in NODES:
  assert gid not in bygame
  g=dict(id=gid,name=name,categories=cats,kind=kind,links=[],note=t('依据来源建立游戏或环境关联；请区分原作、研究环境与评测协议。','Source-backed game or environment association. Distinguish the original game, research environment and evaluation protocol.'))
  games.append(g);bygame[gid]=g
 for r in payload['records']:r['detailLevel']='profile'
 def phrase(value,fallback=unknown):
  return t(value['zh'],value['en']) if isinstance(value,dict) and 'zh' in value else fallback
 for row in library['records']:
  # Surveys remain discoverable archives; cited capabilities are not tasks of the survey.
  if row['review']!='verified' or row.get('incrementRound') or row['kind']=='survey':continue
  rid=row['id'];caps=[c for c in row['caps'] if c in dims]
  scope=phrase(row.get('scope'));limits=phrase(row.get('limits'));metrics=phrase(row.get('metrics'),no_metrics)
  authors=row['authors'] if isinstance(row['authors'],list) else [x.strip() for x in re.split(r'[;；、]|,\s*',row['authors']) if x.strip()]
  r=dict(id=rid,legacyId=rid,name=row['name'],title=row['title'],authors=authors,year=row['year'],venue=row['venue'],paper=row['paper'],repo=(row.get('repo') or '').removeprefix('https://github.com/'),repoURL=row.get('repo'),kind=KIND[row['kind']],kinds=[KIND[row['kind']]],agents=row['agents'],caps=caps,games=row['games'] if isinstance(row['games'],list) else [row['games']],genres=[],interactions=[],summary=(row.get('scope') or {}).get('en',''),zh=scope,observation=unknown,action=unknown,protocol=scope,limit=limits,why=scope,note=phrase(row.get('verificationDetail'),review_note),research=dict(scope=scope,fit=scope,metrics=metrics,controls=limits,setup=review_note),sourceChecked='2026-10-18',sourceScope=review_note,detailLevel='source',sourceEvidence=row['evidence'],access=dict(mode='source-review',status='documented',source=row['paper']))
  r['sourceRationale']=phrase(rationales.get(rid),scope)
  r['evidence']=[dict(cap=c,basis='编辑归类',mechanism=t(f'基于已核对的项目范围，将本条目关联到“{payload["taxonomy"][c][0]}”研究；这不是独立能力得分。',f'Editorial association with {c} research based on the reviewed project scope; this is not an isolated capability score.'),scope=scope+' '+limits,source=row['paper'],locator=t('论文与项目范围','Paper and project scope'),checked='2026-10-18') for c in caps]
  rels=SCOPED.get(rid)
  if rels is None:
   gid,interaction=ASSOCIATIONS[rid];rels=[(gid,caps,interaction,row['agents'])]
  for gid,cs,interaction,agents in rels:
   g=bygame[gid]; cs=[c for c in cs if c in caps];agents=[a for a in agents if a in row['agents']]
   relscope=scope
   if rid in SCOPED or rid=='SUP-elf':
    relscope=t(f'仅 {g["name"]} 子游戏。此处关联按该游戏机制整理；其他子游戏的能力、接口与成绩不继承到本项。',f'Only the {g["name"]} subgame. Associations follow this game’s mechanics; capabilities, interfaces and scores from other subgames do not transfer to this entry.')
   focus=t(' · '.join(payload['taxonomy'][c][0] for c in cs),' · '.join(c.replace('-',' ').title() for c in cs))
   g['links'].append(dict(benchmark=rid,focus=focus,scope=relscope,source=row['paper'],relation='suite' if rid in SCOPED else 'native',checked='2026-10-18',caps=cs,agents=agents,interactions=[interaction]))
   r['genres']+=g['categories'];r['interactions'].append(interaction)
  r['genres']=sorted(set(r['genres']));r['interactions']=sorted(set(r['interactions']));payload['records'].append(r)
 # Concrete Procgen games, rather than assigning all tasks to a multigenre collection.
 procgen=next(r for r in payload['records'] if r['id']=='procgen')
 for gid,name,genre,caps in [('procgen-coinrun','CoinRun (Procgen)','Platformer',['generalization','control']),('procgen-dodgeball','Dodgeball (Procgen)','Action',['control'])]:
  scope=t(f'仅 Procgen 的 {name} 子环境；原版 CoinRun 协议另列，不共享得分或关卡配置。',f'Only the {name} subenvironment of Procgen; original CoinRun protocols are separate and do not share scores or level configurations.')
  games.append(dict(id=gid,name=name,categories=[genre],kind='environment',note=scope,links=[dict(benchmark='procgen',focus=t('具体游戏任务','Concrete game task'),scope=scope,source='https://github.com/openai/procgen',relation='suite',checked='2026-10-18',caps=caps,agents=['RL'],interactions=['single'])]))
  procgen['genres']=sorted(set(procgen['genres']+[genre]))
 # Avoid stale wording implying Minecraft / Crafter still have only their former links.
 bygame['minecraft']['note']=t('同一 Minecraft 游戏下分别收录任务平台、数据集、语言评估与多智能体协作。共享游戏不代表相同接口、训练条件或评分协议。','Minecraft entries cover task platforms, datasets, language evaluation and multi-agent cooperation. Sharing a game does not imply identical interfaces, training conditions or scoring protocols.')
 bygame['crafter']['note']=t('Crafter 是独立的二维生存环境。原生 RL 基准与 BALROG、SmartPlay 的语言评估层分别列出，不与 Minecraft 合并。','Crafter is a separate 2D survival environment. Its native RL benchmark and the BALROG / SmartPlay language-evaluation layers are listed separately, not merged into Minecraft.')
 for key,zh in GENRES:t(zh,key)
 ordered=['RTS','TBS','FPS','Fighting','RPG','Racing','Platformer','Adventure','Simulation','Action','Sandbox','Cards','Roguelike','Puzzle','Sports','Text adventure','Multi-genre','Abstract task']
 payload['facets']['categories']=[c for c in ordered if any(c in g['categories'] for g in games)]
 payload['facets']['kinds']=sorted({r['kind'] for r in payload['records']})
 payload['discovery']=dict(libraryRecords=len(library['records']),sourceLinked=39,detailedProfiles=16,excludedTitleScreened=sum(r['review']=='catalog' for r in library['records']))
 payload['version']='atlas-unified-discovery-v17'
 # Complete the nine research dimensions using the same membership predicate.
 for qid,cap,zh,en,description,checks in [
  ('discovery','exploration','探索与规则发现','Exploration & rule discovery',('未知状态、环境规律及信息获取的价值。','Unknown states, environment rules and the value of acquiring information.'),[('先验知识','Prior knowledge'),('探索预算','Exploration budget'),('发现与利用','Discovery vs exploitation')]),
  ('partners','social','社会推理与伙伴适应','Social reasoning & partner adaptation',('伙伴意图、有限通信与不同群体中的行为适应。','Partner intentions, limited communication and adaptation across populations.'),[('伙伴分布','Partner distribution'),('信息可见性','Information visibility'),('行为与结果','Behavior and outcomes')]),
  ('execution','control','感知与动作控制','Perception & action control',('从观测到动作执行，研究视觉反馈、动作抽象和时序约束。','From observations to execution: visual feedback, action abstraction and timing constraints.'),[('观测模态','Observation modality'),('动作频率','Action frequency'),('延迟与预算','Latency and budget')])]:
  label=t(zh,en);desc=t(*description)
  payload['questions'].append(dict(id=qid,cap=cap,label=label,title=label,subtitle=en,description=desc,decision=t('先固定具体子任务与接口；总体回报不能单独证明该能力。','Fix the subtask and interface first; total return alone does not establish this capability.'),checks=[t(*p) for p in checks],candidates={}))
 for zh,en in [('来源关联条目','Source-reviewed entry'),('数据集','Dataset'),('评测协议','Evaluation protocol'),('竞赛','Competition'),('来源已核对；任务协议需另行固定','Sources reviewed; task protocols require specification'),('深度任务档案','Detailed task profile'),('已关联研究条目','Linked research entries')]:t(zh,en)
 from .arena_catalog_additions import CATALOG
 for task in CATALOG['tasks']:
  if task.get('curationRound')!='v17' or not task['core']:continue
  q=next(q for q in payload['questions'] if q['cap']==task['primary'])
  q['candidates'].setdefault(task['benchmark'],t(f'代表任务：{task["title"]["zh"]}。具体协议与接入条件见 Arena 任务档案。',f'Representative task: {task["title"]["en"]}. See its Arena profile for protocol and integration conditions.'))
 assert len(payload['records'])==55
 assert all(g['links'] for g in games)
 assert {l['benchmark'] for g in games for l in g['links']}=={r['id'] for r in payload['records']}
 return payload
