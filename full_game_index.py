"""Complete bibliographic navigation, separate from reviewed research/Arena coverage.

Only public library fields are used. Title/metadata matches are explicitly provisional.
No capabilities, agent interfaces or execution claims are inferred for these links.
"""
import re
from collections import Counter
from game_catalog import t
from game_attribution import load_reviews, public_review, export_audit

# Explicit lexical identities. Ambiguous names (Avalon, Civilization versions,
# Pokémon adaptations) require exact record mappings below rather than broad aliases.
IDENTITIES = [
 ('minecraft','Minecraft',['Sandbox'],r'minecraft|mineexplorer|mirrorcraft|minerl|mineanybuild|mine.?npc|iglu|minecraft universe'),
 ('crafter','Crafter',['Sandbox'],r'\bcrafter\b'),
 ('nethack','NetHack',['Roguelike'],r'nethack|katakomba'),
 ('starcraft-ii','StarCraft II',['RTS'],r'starcraft\s*(?:ii|2)'),
 ('overcooked','Overcooked',['Simulation','Action'],r'overcooked'),
 ('hanabi','Hanabi',['Cards'],r'hanabi'),
 ('doom','Doom / ViZDoom',['FPS'],r'\bdoom\b|vizdoom'),
 ('counter-strike-go','Counter-Strike: Global Offensive',['FPS'],r'counter.strike: global offensive|cs:go'),
 ('counter-strike-2','Counter-Strike 2',['FPS'],r'counter.strike 2'),
 ('crossfire','CrossFire',['FPS'],r'crossfire|穿越火线'),
 ('overwatch-2','Overwatch 2',['FPS'],r'overwatch 2'),
 ('team-fortress-2','Team Fortress 2',['FPS'],r'team fortress 2'),
 ('farlight84','Farlight 84',['FPS'],r'farlight\s*84'),
 ('arena-breakout-infinite','Arena Breakout: Infinite',['FPS'],r'arena breakout'),
 ('atari-2600','Atari 2600',['Multi-genre'],r'atari'),
 ('procgen-games','Procgen',['Multi-genre'],r'procgen'),
 ('deepmind-lab','DeepMind Lab',['Multi-genre'],r'dmlab|deepmind lab'),
 ('minigrid','MiniGrid',['Puzzle'],r'minigrid'),
 ('miniworld','MiniWorld',['Abstract task'],r'miniworld'),
 ('textworld','TextWorld',['Text adventure'],r'textworld'),
 ('super-mario-bros','Super Mario Bros.',['Platformer'],r'super mario bros|mariogpt'),
 ('football','Google Research Football',['Sports'],r'google research football|grf-marl'),
 ('honor-of-kings','Honor of Kings',['MOBA'],r'honor of kings|hokoff'),
 ('dota-2','Dota 2',['MOBA'],r'dota\s*2'),
 ('chess','Chess',['Board'],r'\bchess\b'),
 ('ludo','Ludo',['Board'],r'\bludo\b|ludobench'),
 ('stratego','Stratego',['Board'],r'stratego'),
 ('codenames','Codenames',['Board'],r'codenames'),
 ('balderdash','Balderdash',['Board'],r'balderdash'),
 ('spyfall','Spyfall',['Board'],r'spyfall'),
 ('werewolf','Werewolf',['Board'],r'werewolf'),
 ('diplomacy','Diplomacy',['Board','TBS'],r'diplomacy'),
 ('poker','Poker (variant unspecified)',['Cards'],r'poker|alphaholdem'),
 ('doudizhu','Dou Dizhu',['Cards'],r'douzero|dou.?dizhu'),
 ('guandan','Guan Dan',['Cards'],r'guandan'),
 ('pokemon-tcg','Pokémon Trading Card Game',['Cards'],r'pokémon trading card|ptcg'),
 ('magic-the-gathering','Magic: The Gathering',['Cards'],r'magic the gathering'),
 ('dungeons-dragons','Dungeons & Dragons',['RPG','Board'],r'dungeons & dragons'),
 ('keep-talking','Keep Talking and Nobody Explodes',['Puzzle'],r'keep talking'),
 ('among-us','Among Us',['Simulation'],r'among us|amongagents'),
 ('dark-souls','Dark Souls',['Action','RPG'],r'dark souls'),
 ('footsies','FOOTSIES',['Fighting'],r'footsies'),
 ('robocup-2d','RoboCup 2D Soccer',['Sports'],r'robocup'),
 ('gran-turismo-sport','Gran Turismo Sport',['Racing'],r'gran turismo sport'),
 ('angry-birds','Angry Birds / Science Birds',['Puzzle'],r'angry birds|science birds'),
 ('smallville','Smallville',['Simulation'],r'smallville'),
 ('farmquest','FarmQuest',['Simulation'],r'farmquest'),
 ('bleeding-edge','Bleeding Edge',['Action'],r'bleeding edge'),
 ('gta-v','Grand Theft Auto V',['Action','Adventure'],r'gta v'),
 ('shattered-pixel-dungeon','Shattered Pixel Dungeon',['Roguelike'],r'shattered pixel dungeon'),
 ('sokoban','Sokoban',['Puzzle'],r'sokoban'),
 ('memory-gym','Memory Gym',['Abstract task'],r'memory gym'),
 ('messenger','MESSENGER',['Puzzle'],r'\bmessenger\b'),
]
# Named benchmark-native environments and suites. These are not silently equated
# with similarly named commercial games or expanded to unverified subgames.
NAMED = {
 'GAB084':('craftium','Craftium',['Sandbox'],'family'),
 'GAB089':('evaaa','EVAAA',['Abstract task'],'environment'),
 'GAB044':('neural-mmo','Neural MMO',['RPG','Sandbox'],'environment'),
 'GAB056':('neural-mmo','Neural MMO',['RPG','Sandbox'],'environment'),
 'GAB027':('avalon-worlds','Avalon procedural worlds',['Adventure'],'environment'),
 'GAB006':('jelly-bean-world','Jelly Bean World',['Abstract task'],'environment'),
 'GAB103':('mini-hok','Mini Honor of Kings',['MOBA'],'environment'),
 'GAB025':('microrts','μRTS',['RTS'],'environment'),
 'GAB110':('towermind','TowerMind',['Tower defense'],'environment'),
 'GAB088':('volleybots','VolleyBots',['Sports'],'environment'),
 'GAB030':('mate','MATE target coverage',['Abstract task'],'environment'),
 'GAB090':('guard-games','GUARD matrix / security games',['Abstract task'],'collection'),
 'GAB062':('adasociety','AdaSociety',['Abstract task'],'environment'),
 'GAB032':('scienceworld','ScienceWorld',['Abstract task'],'environment'),
 'GAB020':('alfworld','ALFWorld',['Abstract task'],'family'),
 'GAB008':('jericho-games','Jericho interactive fiction',['Text adventure'],'collection'),
 'GAB022':('jericho-games','Jericho interactive fiction',['Text adventure'],'collection'),
 'GAB053':('machiavelli-games','Machiavelli text adventures',['Text adventure'],'collection'),
 'GAB033':('griddly-games','Griddly games',['Multi-genre'],'collection'),
 'GAB079':('xland','XLand / OpenXLand',['Abstract task'],'family'),
 'GAB096':('xland-minigrid','XLand-MiniGrid',['Abstract task'],'family'),
 'GAB003':('bsuite','Behaviour Suite',['Abstract task'],'collection'),
 'GAB046':('pgx-games','Pgx games',['Multi-genre'],'collection'),
 'GAB012':('ludii-games','Ludii games',['Board'],'collection'),
 'GAB014':('pettingzoo-games','PettingZoo environments',['Multi-genre'],'collection'),
 'GAB086':('gymnasium-envs','Gymnasium environments',['Multi-genre'],'collection'),
 'GAB060':('benchmarl-envs','BenchMARL environments',['Multi-genre'],'collection'),
 'GAB061':('jaxmarl-envs','JaxMARL environments',['Multi-genre'],'collection'),
 'GAB054':('marllib-envs','MARLlib environments',['Multi-genre'],'collection'),
 'GAB031':('envpool-envs','EnvPool environments',['Multi-genre'],'collection'),
 'GAB051':('carl-envs','CARL environments',['Multi-genre'],'collection'),
 'GAB019':('urlb-envs','URLB environments',['Abstract task'],'collection'),
 'AX26-2604.07733':('civilization-v','Civilization V',['TBS'],'game'),
 'REC-2.5':('civilization-vi','Civilization VI',['TBS'],'game'),
 'GAP-A8':('avalon-board','The Resistance: Avalon',['Board'],'game'),
 'AX26-2608.09638':('avalon-board','The Resistance: Avalon',['Board'],'game'),
 'GAP-B1':('concept','Concept',['Board'],'game'),
 'GAP-B8':('among-us','Among Us',['Simulation'],'game'),
 'AX26-2608.25419':('bvr-sim','BVR Sim',['Simulation'],'environment'),
 'AX26-2603.24621':('arc-agi-3','ARC-AGI-3 interactive tasks',['Puzzle','Abstract task'],'collection'),
}
KIND={'benchmark':'Benchmark','environment':'Environment family','platform':'Research platform','dataset':'Dataset','competition':'Competition','protocol':'Evaluation protocol','method':'Agent method','survey':'Survey','review':'Research record'}

def integrate_full(payload,library):
 audits=load_reviews()
 games=payload['gameIndex']; bygame={g['id']:g for g in games}
 reviewed={r['legacyId']:r for r in payload['records']}
 for g in games:
  for l in g['links']:l['verification']='reviewed'
 unknown=t('具体游戏待确认','Game identity pending')
 def node(gid,name,categories,kind='game'):
  if gid not in bygame:
   g=dict(id=gid,name=name,categories=categories,kind=kind,links=[],note=t('此入口依据完整文献目录建立。历史题录关联未逐项复核；游戏机制、任务配置与接口以原始来源为准。','This entry is derived from the full bibliography. Historical associations have not been individually rechecked; consult original sources for mechanics, tasks and interfaces.'))
   games.append(g);bygame[gid]=g
  return bygame[gid]
 from suite_game_expansion import expand
 expand(payload,node)
 extra=[]
 for row in library['records']:
  if row['id'] in reviewed:continue
  rid=row['id']; rawgames=row['games'];text=' '.join([row['name'],row['title'],' '.join(rawgames) if isinstance(rawgames,list) else rawgames])
  hits=[]
  audit=audits.get(rid)
  if audit:
   if audit['status']=='confirmed':
    hits=[(g['id'],g['name'],g['categories'],g['kind']) for g in audit['games']]
   elif audit['status']=='no_specific_game':
    hits=[('research-without-specific-game','Research without a specific game',['Related research'],'non-game')]
   else:
    hits=[('pending-source-review','Game identity pending',['Unresolved'],'unresolved')]
  elif rid in NAMED:hits=[NAMED[rid]]
  else:
   hits=[(gid,name,cats,'collection' if gid in ['atari-2600','procgen-games','deepmind-lab'] else 'game') for gid,name,cats,pattern in IDENTITIES if re.search(pattern,text,re.I)]
  # With no explicit game identity, retain an honest bibliography grouping. A
  # genre-level lead is not presented as a concrete game or source-reviewed link.
  if not hits and (row['genres']==['Multi-genre'] or (row['domain']=='gameplay' and re.search(r'games|game suite|game environments|game.*platform',row['title'],re.I))):
   hits=[('collection-'+rid.lower(),row['name'],['Multi-genre'],'collection')]
  if not hits:
   cats=row['genres'] or ['Unresolved']
   if row['domain']!='gameplay':cats=['Related research']
   for cat in cats:
    gid='pending-'+re.sub(r'[^a-z0-9]+','-',cat.lower()).strip('-')
    hits.append((gid,t('具体游戏待确认','Game identity pending'),[cat],'unresolved'))
  associated=[]
  for gid,name,cats,kind in hits:
   g=node(gid,name,cats,kind)
   scope=t('历史题录记载：','Historical bibliographic record: ')+text
   # Store the exact field excerpt rather than turn title keywords into claims.
   focus=t('研究侧重与任务协议待核验','Research focus and task protocol unverified')
   l=dict(benchmark=rid,focus=focus,scope=scope,source=row['paper'],relation='bibliographic',verification='catalog',caps=[],agents=[],interactions=[],domain=row['domain'],resourceKind=row['kind'])
   if audit:
    l.update(attribution=public_review(audit),verification='attribution' if audit['status']=='confirmed' else 'reviewed-no-game' if audit['status']=='no_specific_game' else 'catalog',scope=t(audit['noteZh'],audit['noteEn']),source=audit['evidence'][0]['url'])
   g['links'].append(l)
   associated+=g['categories']
  authors=row['authors'] if isinstance(row['authors'],list) else [a.strip() for a in re.split(r'[;；、]|,\s*',row['authors']) if a.strip()]
  extra.append(dict(id=rid,legacyId=rid,name=row['name'],title=row['title'],authors=authors,year=row['year'],venue=row['venue'],paper=row['paper'],repoURL=row.get('repo'),kind=KIND[row['kind']],kinds=[KIND[row['kind']]],genres=sorted(set(associated)),caps=[],agents=[],interactions=[],games=rawgames if isinstance(rawgames,list) else [rawgames],summary=row['title'],zh='',detailLevel='catalog',domain=row['domain'],resourceKind=row['kind']))
  if audit:
   extra[-1]['gameAttribution']=public_review(audit)
   if audit['status']=='confirmed':extra[-1]['games']=[g['name'] for g in audit['games']]
 if 'research-without-specific-game' in bygame:
  bygame['research-without-specific-game'].update(nameZh='不对应特定游戏的研究',note=t('来源已检查，但研究对象不对应一款具体游戏。保留在研究目录，不作为游戏或 Arena 任务计数。','Sources were checked, but the research does not correspond to a specific game. These records remain in the bibliography and do not count as games or Arena tasks.'))
 for g in games:
  if g['links'] and all(l['verification']=='attribution' for l in g['links']):
   g['note']=t('游戏或环境归属已根据下列论文或官方项目核对。这里的关联不等于任务协议或能力已核验；合集只列出已确认的子游戏。','Game or environment attribution was checked against the papers or official projects below. These links do not establish verified task protocols or capabilities; only confirmed subgames are listed for collections.')
  if g['kind']=='unresolved' and any('attribution' in l for l in g['links']):
   g['note']=t('本轮已尝试核验，但现有来源仍不足以确认游戏归属。逐条列出未解决原因与核查来源，不据此推断游戏覆盖。','Attribution was investigated, but available sources do not yet establish the game identity. Each record explains the remaining uncertainty and sources checked; these records do not establish game coverage.')
 if 'honor-of-kings' in bygame:bygame['honor-of-kings'].update(nameZh='王者荣耀',nameType='official',nameSource='https://github.com/tencent-ailab/hok_env',aliases=['王者荣耀'])
 payload['gameCatalogRecords']=extra
 payload['gameFacets']=dict(kinds=sorted({r['kind'] for r in payload['records']+extra}))
 newcats=['MOBA','Board','Tower defense','Shoot-em-up']
 cats=payload['facets']['categories']; split=cats.index('Multi-genre')
 for c in newcats:
  if any(c in g['categories'] for g in games):cats.insert(split,c);split+=1
 for c in ['Unresolved','Related research']:
  if any(c in g['categories'] for g in games):cats.append(c)
 payload['facets']['auxiliaryCategories']+=['Unresolved','Related research']
 ids={l['benchmark'] for g in games for l in g['links']}
 assert ids=={r['id'] for r in payload['records']+extra}
 pending={l['benchmark'] for g in games if g['kind']=='unresolved' for l in g['links']}
 non_game={l['benchmark'] for g in games if g['kind']=='non-game' for l in g['links']}
 payload['gameIndexStats']=dict(total=len(library['records']),reviewed=len(reviewed),historical=len(extra),mapped=len(ids-pending-non_game),pending=len(pending),nonGame=len(non_game),nodes=sum(g['kind'] not in ['unresolved','non-game'] for g in games),genres=len(cats)-len(payload['facets']['auxiliaryCategories']),attributionReview=dict(total=len(audits),collectionOnly=sum(a.get('mappingLevel')=='collection' for a in audits.values()),**dict(Counter(a['status'] for a in audits.values()))))
 from collection_expansion import attach_hierarchy
 attach_hierarchy(payload)
 payload['version']='atlas-collection-expansion-v20'
 export_audit()
 t('非具体游戏研究','Research without a specific game')
 for zh,en in [('多人在线战术竞技（MOBA）','MOBA'),('棋类与桌游','Board'),('塔防','Tower defense'),('清版射击（STG）','Shoot-em-up'),('Unresolved','Unresolved'),('Related research','Related research'),('历史题录关联','Bibliographic association'),('游戏归属待确认','Game identity pending'),('游戏索引覆盖完整目录；跨类别按条目 ID 去重。历史关联与已核验关联分别标注，收录不表示已加入 Arena。','The game index covers the full catalog; counts are deduplicated within each category. Historical and reviewed links are labeled separately; inclusion does not imply Arena selection.'),('从当前已核验条目对比 →','Compare reviewed entries →'),('相关方法','Agent method'),('综述','Survey'),('研究记录','Research record')]:t(zh,en)
 return payload
