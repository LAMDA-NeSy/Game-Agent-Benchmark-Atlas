"""Public, bilingual additions selected from the full corpus for Arena.

Only bibliographic metadata is joined by build_data.py. Personal reading notes
and manuscript bodies are never serialized into the public site.
"""
import json
from pathlib import Path
from game_catalog import GAMES, game, link, t
from catalog_schema import RELATIONS

CATALOG=json.loads((Path(__file__).parent/'arena-task-catalog.json').read_text())
RECORD_ZH_ADDITIONS={}
ADDITIONS=[
 ('memorygym-sequence','GAB104','Memory Gym Endless','MarcoMeter/endless-memory-gym','JMLR 2025',['RL'],'memory-gym','Memory Gym',['Puzzle'],['single']),
 ('alchemy-discovery','GAB018','Alchemy','google-deepmind/dm_alchemy','NeurIPS 2021 · Datasets and Benchmarks',['RL'],'alchemy','Alchemy',['Puzzle'],['single']),
 ('factorio-production','GAB091','Factorio Learning Environment','JackHopkins/factorio-learning-environment','NeurIPS 2025 · Datasets and Benchmarks',['LLM'],'factorio','Factorio',['Sandbox','Strategy'],['single']),
 ('overcooked-zsc','GAB063','ZSC-Eval','sjtu-marl/ZSC-Eval','NeurIPS 2024 · Datasets and Benchmarks',['RL'],'overcooked','Overcooked',['Cooking'],['cooperative']),
]

def extend(specs, profiles, evidence):
 for task_id,legacy,name,repo,venue,agents,game_id,game_name,categories,interactions in ADDITIONS:
  task=next(x for x in CATALOG['tasks'] if x['id']==task_id)
  bid=task['benchmark']; caps=[task['primary'],*task['secondary']]
  for value in task.values():
   if isinstance(value,dict) and set(value)=={'zh','en'}:t(value['zh'],value['en'])
  action={'language':('通过框架提供的代码或工具动作交互。','Interact through framework-provided code or tool actions.'),'visual':('原生移动控制动作；适配器需固定执行时序。','Native movement controls; adapters must pin execution timing.'),'structured':('使用原生离散交互接口；语言转换需单独说明。','Use native discrete interactions; document language conversion separately.')}[task['track']]
  t(*action)
  specs.append(dict(key=legacy,id=bid,name=name,repo=repo,venue=venue,kind='Environment + benchmark' if bid!='zsc-eval' else 'Benchmark',art='grid',accent='sand',agents=agents,genres=categories,caps=caps,games=[game_name],summary=task['scope']['en'],zh=task['scope']['zh'],observation=task['interface']['en'],action=action[1],protocol=task['controls']['en'],limit=task['pending']['en'],why=task['why']['en'],note=task['pending']['en']))
  RECORD_ZH_ADDITIONS[bid]=[task['interface']['zh'],action[0],task['controls']['zh'],task['pending']['zh'],task['pending']['zh']]
  profiles[bid]=[t(x['zh'],x['en']) for x in [task['scope'],task['why'],task['metric'],task['controls'],task['pending']]]
  evidence[bid]={cap:('编辑归类',task['why']['zh'],task['controls']['zh'],task['docs']) for cap in caps}
  l=link(bid,(task['title']['zh'],task['title']['en']),(task['scope']['zh'],task['scope']['en']),task['source'],'adapted' if bid in ['fle','zsc-eval'] else 'native')
  existing=next((g for g in GAMES if g['id']==game_id),None)
  if existing:existing['links'].append(l)
  else:GAMES.append(game(game_id,game_name,categories,(task['why']['zh'],task['why']['en']),[l],kind='environment' if game_id!='factorio' else 'game'))
  RELATIONS.setdefault(game_id,{})[bid]=(caps,agents,interactions)

