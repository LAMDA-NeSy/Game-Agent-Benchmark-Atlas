"""Export only selected, public bibliographic fields from the existing collection."""
import json
import re
from .research_content import TAXONOMY, PROFILES, EVIDENCE, QUESTIONS

from .paths import ROOT

def build():
    SOURCE = ROOT / 'data/catalog.json'
    (ROOT / 'dist').mkdir(exist_ok=True)
    (ROOT / 'output').mkdir(exist_ok=True)
    records = {r['id']: r for r in json.loads(SOURCE.read_text())['records']}

    # Thematic coverage is editorial. Agent badges describe documented use, not tested installations.
    specs = [
     dict(key='GAB080',id='balrog',name='BALROG',repo='balrog-ai/BALROG',venue='ICLR 2025',kind='Benchmark suite',art='dungeon',accent='sage',agents=['LLM','VLM'],genres=['Multi-game','Sandbox','Puzzle','Text adventure'],caps=['long-horizon','planning','exploration','memory'],games=['BabyAI','Crafter','TextWorld','Baba Is AI','MiniHack','NetHack'],summary='How far can language and vision-language agents go in demanding, long-horizon games?',zh='长时程、规划、探索，语言与视觉语言模型的跨游戏评测。',observation='Text or visual observations, depending on the environment.',action='Environment-specific discrete actions through agent interfaces.',protocol='A shared evaluation framework over six existing game environments. Scores and progress depend on the environment.',limit='Suite-level tags summarize coverage. They do not imply that every task isolates each capability, or that a single aggregate measures planning alone.',why='A useful starting point for studying the gap between reasoning and sustained interaction.',note='Official repository documents LLM and VLM evaluation. Experiments have not been independently rerun.'),
     dict(key='GAB040',id='smacv2',name='SMACv2',repo='oxwhirl/smacv2',venue='NeurIPS 2023',kind='Benchmark',art='strategy',accent='blue',agents=['RL'],genres=['Strategy'],caps=['coordination','generalization'],games=['StarCraft II'],summary='Cooperative multi-agent learning under partial observability and randomized combat scenarios.',zh='多智能体协作、部分可观测，星际争霸微操评测。',observation='Local unit observations; state access depends on training setup.',action='Decentralized movement and combat actions for controlled units.',protocol='Cooperative StarCraft II micromanagement scenarios, with scenario variation and team performance evaluation.',limit='This evaluates micromanagement rather than full-game macro strategy. An LLM adaptation is not implied by the native RL interface.',why='A focused counterpart to broad game suites when coordination is the research question.',note='Scope and native MARL use are documented in the official README. Not independently rerun.'),
     dict(key='GAB028',id='minedojo',name='MineDojo',repo='MineDojo/MineDojo',venue='NeurIPS 2022',kind='Environment + benchmark',art='sandbox',accent='sand',agents=['RL'],genres=['Sandbox'],caps=['long-horizon','planning','exploration'],games=['Minecraft'],summary='Open-ended embodied tasks in Minecraft, paired with internet-scale game knowledge.',zh='Minecraft 我的世界，开放世界、生存、探索与长期任务。',observation='Visual observations and task-dependent environment information.',action='Low-level Minecraft controls through the simulator API.',protocol='A task suite and simulator for open-ended Minecraft research. Evaluation must specify the selected tasks and success criteria.',limit='A simulator and knowledge corpus do not by themselves establish a ready-to-run evaluation adapter for every foundation model.',why='Connects open-ended task execution with rich external knowledge.',note='Official task and simulator documentation linked. RL use comes from the collected paper; exact configurations require review.'),
     dict(key='GAB057',id='smartplay',name='SmartPlay',repo='microsoft/SmartPlay',venue='ICLR 2024',kind='Benchmark suite',art='puzzle',accent='lavender',agents=['LLM'],genres=['Multi-game','Puzzle','Sandbox'],caps=['planning','memory','exploration'],games=['Rock-Paper-Scissors','Two-armed bandit','Tower of Hanoi','Messenger','Crafter','MineDojo tasks'],summary='A collection of games designed to probe distinct capabilities of interactive language agents.',zh='交互式语言智能体，规划、学习历史、空间推理与随机性。',observation='Game descriptions, observations, manuals and interaction history.',action='Game-specific actions exposed through a common environment interface.',protocol='Six games cover different subsets of agent capabilities; interpret each game and setting before aggregating.',limit='Capabilities overlap across games. The official repository is archived; availability of code is not an installation test.',why='Offers a capability-oriented view of game-based agent evaluation.',note='The official repository reports archive status as of 2026-07-01. Linked and checked on 2026-10-18.'),
     dict(key='GAB100',id='collab-overcooked',name='Collab-Overcooked',repo='YusaeMeow/Collab-Overcooked',venue='EMNLP 2025',kind='Benchmark',art='kitchen',accent='peach',agents=['LLM'],genres=['Cooperative'],caps=['coordination','social','planning'],games=['Overcooked-AI'],summary='Can language agents communicate, divide work and adapt while cooking together?',zh='胡闹厨房，多智能体协作、沟通、分工与动态适应。',observation='Task and environment observations with inter-agent communication.',action='Communication and environment interactions through the benchmark framework.',protocol='Thirty open-ended tasks and process-oriented collaboration metrics, alongside task outcomes.',limit='Performance depends on the task and partner setup. Process measures should be read together with completion outcomes.',why='Makes the collaboration process visible, beyond a final team score.',note='Task count and collaboration focus are reported by the paper and official repository. No independent reproduction.'),
     dict(key='GAB001',id='procgen',name='Procgen',repo='openai/procgen',venue='ICML 2020',kind='Benchmark suite',art='arcade',accent='pink',agents=['RL'],genres=['Arcade','Multi-game'],caps=['generalization','control'],games=['16 procedurally generated games'],summary='Test whether policies learn transferable skills rather than memorize fixed levels.',zh='程序生成、街机游戏、强化学习、样本效率与泛化。',observation='RGB pixels.',action='Discrete game actions.',protocol='Sixteen procedurally generated environments; train/test level selection is essential for interpreting generalization.',limit='Performance depends on level distribution, difficulty and training budget. Keep these conditions attached to reported results.',why='A foundational reference for generalization across unseen game levels.',note='Environment count and generalization focus are documented in the official repository.'),
     dict(key='GAB106',id='orak',name='Orak',repo='krafton-ai/Orak',venue='ICLR 2026',kind='Benchmark suite',art='mosaic',accent='sage',agents=['LLM','VLM'],genres=['Multi-game','Strategy','Sandbox','Puzzle','Arcade'],caps=['planning','strategy','control'],games=['12 video games, including Minecraft, StarCraft II and Baba Is You'],summary='A common interface for evaluating language agents across diverse, familiar video games.',zh='多游戏、MCP、真实视频游戏、语言与视觉语言智能体。',observation='Textual and visual game states, depending on the game.',action='Game-specific tools and controls exposed through the framework.',protocol='Twelve games with game-specific scores and studies of agent modules. Interface and assets vary by game.',limit='Suite-level strategy coverage does not imply every included game tests strategic planning. Some games require separate purchases.',why='Brings varied commercial and research game settings into a shared agent workflow.',note='Official README documents 12 games and LLM/VLM support. Venue follows the linked collection record.'),
     dict(key='GAB004',id='nethack',name='NetHack Learning Environment',repo='facebookresearch/nle',venue='NeurIPS 2020',kind='Environment + benchmark',art='terminal',accent='sand',agents=['RL'],genres=['Roguelike'],caps=['long-horizon','exploration','memory'],games=['NetHack'],summary='A procedurally generated roguelike that challenges exploration and long-term decision making.',zh='NetHack 地牢、长时程、探索、记忆与强化学习。',observation='Terminal characters, glyphs and structured status information.',action='Discrete NetHack actions.',protocol='A learning environment with task-specific reward and termination settings. Pin the task and environment version for comparison.',limit='LLM evaluation through a separate suite such as BALROG is distinct from native NLE support.',why='A rich environment where progress depends on knowledge, exploration and survival.',note='Native environment and learning setup are described in the linked paper and repository.'),
     dict(key='GAB010',id='hanabi',name='The Hanabi Challenge',repo='google-deepmind/hanabi-learning-environment',venue='Artificial Intelligence 2020',kind='Environment + benchmark',art='cards',accent='lavender',agents=['RL'],genres=['Cards','Cooperative'],caps=['coordination','social','strategy'],games=['Hanabi'],summary='Cooperate with limited communication when you cannot see your own cards.',zh='花火、合作卡牌、不完全信息、有限通信与伙伴推理。',observation='Player-relative observations, public information and hints.',action='Play, discard or give a legal hint.',protocol='The challenge and learning environment support research on cooperative play under hidden information; specify the partner protocol.',limit='Self-play and play with unfamiliar partners answer different questions. A high self-play score is not evidence of robust cross-play.',why='Separates cooperative decision making from simple access to shared information.',note='The official learning environment exposes an RL interface. Other agent adaptations are not audited in this demo.'),
     dict(key='GAB007',id='football',name='Google Research Football',repo='google-research/football',venue='AAAI 2020',kind='Environment + benchmark',art='football',accent='sage',agents=['RL'],genres=['Sports'],caps=['coordination','strategy','control'],games=['Football'],summary='From short football scenarios to full matches, explore control and team behavior.',zh='足球、强化学习、团队协作、策略和实时控制。',observation='Visual or structured observations, according to configuration.',action='Discrete football controls.',protocol='Football Academy scenarios and full matches with configurable agents, rewards and opponents.',limit='Coordination claims depend on how many players are controlled and by which policies. Scenarios are not interchangeable.',why='Connects low-level control with spatial and team-level decisions.',note='Configurations and observation options are described by the official environment.'),
     dict(key='GAB011',id='rlcard',name='RLCard',repo='datamllab/rlcard',venue='IJCAI 2020 · Demo',kind='Research platform',art='poker',accent='peach',agents=['RL'],genres=['Cards'],caps=['strategy'],games=['Blackjack','Leduc Hold’em','Texas Hold’em','Dou Dizhu','Mahjong','UNO'],summary='A common research interface for learning and evaluating agents in card games.',zh='卡牌、扑克、麻将、斗地主、不完全信息博弈。',observation='Game-specific encoded observations and legal actions.',action='Legal discrete card-game actions.',protocol='A platform with multiple games and baseline agents. Evaluation requires an explicit game and opponent configuration.',limit='A shared interface does not define a single universal evaluation protocol. This entry is classified as a research platform.',why='Useful infrastructure for comparing decisions under hidden information.',note='Platform scope and supported games are documented by the official repository.'),
     dict(key='GAB041',id='minigrid',name='MiniGrid & MiniWorld',repo='Farama-Foundation/Minigrid',venue='NeurIPS 2023',kind='Environment family',art='grid',accent='blue',agents=['RL'],genres=['Puzzle'],caps=['planning','memory','generalization'],games=['MiniGrid','MiniWorld'],summary='Small, configurable worlds for studying navigation, memory and goal-directed behavior.',zh='网格世界、迷宫、导航、记忆、规划与泛化。',observation='Local symbolic grids or images, depending on environment and wrapper.',action='Discrete navigation and object-interaction actions.',protocol='A family of goal-oriented tasks. Task selection and wrappers define the observation and evaluation conditions.',limit='The linked repository is MiniGrid; MiniWorld is a separate implementation. Capabilities vary across individual tasks.',why='Offers interpretable task design and lightweight environments for controlled studies.',note='Paper metadata covers both families. The code button points specifically to the official MiniGrid repository.'),
    ]

    from .arena_catalog_additions import extend, CATALOG
    extend(specs, PROFILES, EVIDENCE)
    out=[]
    for s in specs:
     r=records[s.pop('key')]
     authors=[a.strip() for a in re.split(r'[;；、]|,\s*',r['authors']) if a.strip()]
     out.append({**s,'title':r['title'],'authors':authors,'year':int(r['year']),'paper':r['source_url'],'legacyId':r['id'],'sourceChecked':'2026-10-18','sourceScope':'Bibliographic metadata from the existing collection; official repositories checked for this demo. Thematic tags are editorial coverage labels, not isolated capability scores.'})

    for r in out:
     scope, fit, metrics, controls, setup = PROFILES[r['id']]
     r['research'] = dict(scope=scope, fit=fit, metrics=metrics, controls=controls, setup=setup)
     r['evidence'] = [dict(cap=cap, basis=basis, mechanism=mechanism, scope=scope,
       source=ref if ref.startswith('https:') else 'https://github.com/'+r['repo']+ref,
       locator=('任务文档 · Description' if ref.startswith('https:') else '官方 README · '+ref[1:]),
       checked='2026-10-18') for cap,(basis,mechanism,scope,ref) in EVIDENCE[r['id']].items()]
     assert set(r['caps']) == {e['cap'] for e in r['evidence']}, r['id']
     assert not {'Notes','notes','original_card','ideas'} & set(r)
    from .game_catalog import GAMES
    record_by_id={r['id']:r for r in out}
    for g in GAMES:
     assert len({x['benchmark'] for x in g['links']}) == len(g['links'])
     for x in g['links']:
      assert x['benchmark'] in record_by_id
      if not x['source']: x['source']=('https://github.com/balrog-ai/BALROG/blob/main/docs/evaluation.md#configuring-eval' if x['benchmark']=='balrog' else 'https://github.com/'+record_by_id[x['benchmark']]['repo'])
    assert len({g['id'] for g in GAMES}) == len(GAMES)
    assert {x['benchmark'] for g in GAMES for x in g['links']} == set(record_by_id)
    from .catalog_schema import enrich
    facets=enrich(out,GAMES,QUESTIONS)
    from .game_profiles import enrich_profiles
    enrich_profiles(GAMES)
    payload={'facets':facets,'gameIndex':GAMES,'version':'demo-2026-10-18-genres-v13','records':out,'questions':QUESTIONS,'taxonomy':TAXONOMY}
    (ROOT/'dist/data.js').write_text('window.ATLAS_DATA = '+json.dumps(payload,ensure_ascii=False,indent=2)+';\n')
    print(f'Exported {len(out)} selected public records.')
    from .translations import generate
    generate(out, ROOT/'dist/translations.js')
    (ROOT/'dist/arena-data.js').write_text('/* Generated from arena-task-catalog.json. */\n(function(root){const data='+json.dumps(CATALOG,ensure_ascii=False,indent=2)+';if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.ArenaCatalog=data;})(typeof window!=="undefined"?window:globalThis);\n')
    from .arena_selection import write
    write(records, ROOT/'dist/arena-selection.js')

    from .build_library import build as build_library
    library=build_library()
    from .unified_discovery import integrate
    integrate(payload, library)
    from .full_game_index import integrate_full
    integrate_full(payload, library)
    from .corpus_increment import integrate as integrate_increment, finalize as finalize_increment
    integrate_increment(payload)
    from .task_reviews import integrate as integrate_tasks
    integrate_tasks(payload)
    finalize_increment(payload)
    from .localized_game_names import integrate as integrate_names
    integrate_names(payload)
    from .agent_paradigms import integrate as integrate_paradigms
    integrate_paradigms(payload)
    (ROOT/'dist/data.js').write_text('window.ATLAS_DATA = '+json.dumps(payload,ensure_ascii=False,indent=2)+';\n')
    generate([r for r in out if r.get('detailLevel')=='profile'], ROOT/'dist/translations.js')

    # Refresh curated library facets after adding concrete game associations.
    build_library()

    write(records, ROOT/'dist/arena-selection.js', library)

    # Reuse the browser model for the downloadable coverage accounting.
    import subprocess
    subprocess.run(["node", str(ROOT/"scripts/build_coverage_audit.cjs")],cwd=ROOT,check=True)

    # Keep gameplay introductions separate from task-protocol and attribution data.
    from .build_game_introductions import build as build_introductions
    build_introductions()

    # Resource-use review is a separate, versioned layer over game associations.
    from .build_game_roles import build as build_roles
    build_roles()

    # Refresh the shared downloadable archive format after all public data layers.
    subprocess.run(["node", str(ROOT/"scripts/build_research_archives.cjs")],cwd=ROOT,check=True)

if __name__ == "__main__":
    build()
