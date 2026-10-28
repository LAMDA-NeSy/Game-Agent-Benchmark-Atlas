"""Additional game membership checked against official suite lists, 2026-10-18.
Game membership alone does not assign per-game capabilities or agent support.
"""
from game_catalog import t

def expand(payload,node):
 byid={r['id']:r for r in payload['records']}
 def add(rid,gid,name,cats,source,kind='game'):
  g=node(gid,name,cats,kind)
  if any(l['benchmark']==rid for l in g['links']):return
  scope=t('官方游戏清单收录此子游戏；任务设置、能力归因与接口需按子游戏文档确认，不继承整个套件的能力标签。','The official game list includes this subgame. Verify its tasks, capabilities and interface in game-specific documentation; suite-wide capability labels are not inherited.')
  g['links'].append(dict(benchmark=rid,focus=t('套件子游戏 · 能力待逐任务核验','Suite subgame · capabilities require task-level review'),scope=scope,source=source,relation='suite',verification='reviewed',checked='2026-10-18',caps=[],agents=[],interactions=[]))
  byid[rid]['genres']=sorted(set(byid[rid]['genres']+g['categories']))
 for gid,name,cats in [
  ('street-fighter-iii','Street Fighter III',['Fighting']),('ace-attorney','Ace Attorney: Phoenix Wright',['Adventure']),
  ('pokemon-red','Pokémon Red',['RPG']),('super-mario-orak','Super Mario (Orak)',['Platformer']),
  ('her-story','Her Story',['Adventure']),('darkest-dungeon','Darkest Dungeon',['RPG','Roguelike']),
  ('stardew-valley','Stardew Valley',['Simulation','RPG']),('slay-the-spire','Slay the Spire',['Cards','Roguelike']),('2048','2048',['Puzzle'])]:
  add('orak',gid,name,cats,'https://github.com/krafton-ai/Orak#game-list')
 for name,genre in [('bigfish','Action'),('bossfight','Shoot-em-up'),('caveflyer','Shoot-em-up'),('chaser','Action'),('climber','Platformer'),('fruitbot','Action'),('heist','Puzzle'),('jumper','Platformer'),('leaper','Action'),('maze','Puzzle'),('miner','Puzzle'),('ninja','Platformer'),('plunder','Shoot-em-up'),('starpilot','Shoot-em-up')]:
  add('procgen','procgen-'+name,name.title()+' (Procgen)',[genre],'https://github.com/openai/procgen#environments','environment')
 for gid,name,cats in [('blackjack','Blackjack',['Cards']),('leduc-holdem','Leduc Hold’em',['Cards']),('limit-holdem','Limit Texas Hold’em',['Cards']),('no-limit-holdem','No-limit Texas Hold’em',['Cards']),('doudizhu','Dou Dizhu',['Cards']),('mahjong','Mahjong',['Board']),('uno','UNO',['Cards']),('gin-rummy','Gin Rummy',['Cards']),('bridge','Bridge',['Cards'])]:
  add('rlcard',gid,name,cats,'https://github.com/datamllab/rlcard#available-environments')
