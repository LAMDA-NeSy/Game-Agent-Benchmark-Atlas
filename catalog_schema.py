"""Orthogonal taxonomy and explicit game-scoped relationships."""
from game_catalog import t
CATEGORIES = ['RTS','Simulation','Action','Sandbox','Cards','Roguelike','Puzzle','Sports','Text adventure','Multi-genre','Abstract task']
AUXILIARY_CATEGORIES = ['Multi-genre','Abstract task']
INTERACTIONS = ['single','cooperative','competitive','configurable']
RELATIONS = {
 'minecraft': {'minedojo':(['long-horizon','planning','exploration'],['RL'],['single']), 'smartplay':(['planning','exploration'],['LLM'],['single']), 'orak':(['planning','control'],['LLM'],['single'])},
 'crafter': {'balrog':(['long-horizon','planning','exploration','memory'],['LLM','VLM'],['single']), 'smartplay':(['planning','memory','exploration'],['LLM'],['single'])},
 'starcraft-ii': {'smacv2':(['coordination','generalization'],['RL'],['cooperative']), 'orak':(['planning','strategy','control'],['LLM'],['competitive'])},
 'overcooked': {'collab-overcooked':(['coordination','social','planning'],['LLM'],['cooperative'])},
 'hanabi': {'hanabi':(['coordination','social','strategy'],['RL'],['cooperative'])},
 'nethack': {'nethack':(['long-horizon','exploration','memory'],['RL'],['single']), 'balrog':(['long-horizon','planning','exploration','memory'],['LLM','VLM'],['single'])},
 'minihack': {'balrog':(['planning','exploration'],['LLM','VLM'],['single'])},
 'minigrid': {'minigrid':(['planning','memory','generalization'],['RL'],['single'])},
 'babyai': {'balrog':(['planning'],['LLM','VLM'],['single'])},
 'baba-is-ai': {'balrog':(['planning'],['LLM','VLM'],['single'])},
 'baba-is-you': {'orak':(['planning','control'],['LLM'],['single'])},
 'tower-of-hanoi': {'smartplay':(['planning'],['LLM'],['single'])},
 'messenger': {'smartplay':(['memory'],['LLM'],['single'])},
 'textworld': {'balrog':(['planning','exploration','memory'],['LLM','VLM'],['single'])},
 'football': {'football':(['coordination','strategy','control'],['RL'],['configurable'])},
 'rlcard-games': {'rlcard':(['strategy'],['RL'],['configurable'])},
 'procgen-games': {'procgen':(['generalization','control'],['RL'],['single'])},
 'rock-paper-scissors': {'smartplay':(['memory'],['LLM'],['competitive'])},
 'two-armed-bandit': {'smartplay':(['memory','exploration'],['LLM'],['single'])},
}
def enrich(records, games, questions):
    byid={r['id']:r for r in records}
    for g in games:
        g['categories']=[c for c in g['categories'] if c!='Cooperative']
        replacements = {
            'starcraft-ii':['RTS'], 'overcooked':['Simulation','Action'],
            'factorio':['Simulation','Sandbox'], 'procgen-games':['Multi-genre'],
            'rock-paper-scissors':['Abstract task'], 'two-armed-bandit':['Abstract task'],
            'memory-gym':['Abstract task'], 'alchemy':['Abstract task'],
        }
        if g['id'] in replacements:g['categories']=replacements[g['id']]
        if g['id']=='overcooked':
            g['genreTags']=[t('烹饪','Cooking'),t('时间管理','Time management')]
            g['genreSource']='https://www.team17.com/games/overcooked'
            g['genreBasis']=t('发行商将原作归为动作与模拟；本站沿用游戏背景类型，合作另按交互关系标注。','The publisher lists the original as Action and Simulation. This index retains those setting genres and labels cooperation separately.')
        if g['id']=='factorio':
            g['genreTags']=[t('工厂建设','Factory building'),t('自动化经营','Automation')]
            g['genreSource']='https://www.factorio.com/'
            g['genreBasis']=t('依据官方描述的工厂建设与自动化生产玩法，编辑归入模拟与沙盒。','Editorially classified as Simulation and Sandbox from the official factory-building and automated-production description.')
        if g['id']=='hanabi':
            g['note']=t('游戏类型为卡牌，合作作为独立交互关系标注；条目按 ID 去重计数。','The genre is Cards; cooperation is an independent interaction structure. Entry counts are deduplicated by ID.')
        if g['id'] in ['crafter','baba-is-ai','messenger','football']:g['kind']='environment'
        if g['id'] in ['tower-of-hanoi','rock-paper-scissors']:g['kind']='task'
        for l in g['links']:
            caps,agents,interaction=RELATIONS[g['id']][l['benchmark']]
            l.update(caps=caps,agents=agents,interactions=interaction)
            assert set(caps)<=set(byid[l['benchmark']]['caps'])
            assert set(agents)<=set(byid[l['benchmark']]['agents'])
    for r in records:
        associated=[(g,l) for g in games for l in g['links'] if l['benchmark']==r['id']]
        r['genres']=sorted({c for g,l in associated for c in g['categories']})
        r['interactions']=sorted({i for g,l in associated for i in l['interactions']})
        r['kinds']=[r['kind']]
        r['access']=dict(mode='official-adapter' if r['id'] in ['balrog','smartplay','orak','collab-overcooked'] else 'native',status='documented',source='https://github.com/'+r['repo'])
    for q in questions:
        assert set(q['candidates'])<={r['id'] for r in records if q['cap'] in r['caps']}
    return dict(categories=CATEGORIES,auxiliaryCategories=AUXILIARY_CATEGORIES,interactions=INTERACTIONS,kinds=sorted({r['kind'] for r in records}))

UI='''
烹饪|Cooking
单智能体|Single agent
合作|Cooperative
竞争|Competitive
取决于配置|Configuration dependent
交互关系|Interaction structure
条目性质|Entry type
研究环境|Research environment
重点候选|Priority candidates
其他相关条目|Other related entries
该条目具有对应能力标签；任务适用性见分类依据。|This entry carries the corresponding capability label; consult classification evidence for task applicability.
重点候选优先排列，其他相关条目仍可检索。主题与能力筛选使用同一关联规则。|Priority candidates appear first; other related entries remain discoverable. Themes and capability filters use the same membership rule.
主题筛选|Research theme
全部研究主题|All research themes
当前游戏中的筛选|Filter within this game
清除条件|Clear conditions
全部相关条目|All related entries
筛选结果|Filtered results
任务与接入档案|Task & interface profiles
游戏背景|Game setting
环境 / 适配层|Environment / adapter
任务与设置|Tasks & settings
官方评估指标|Documented metrics
观测接口|Observation interface
动作接口|Action interface
接入方式|Integration route
原生研究接口|Native research interface
官方评测适配|Official evaluation adapter
核验状态|Verification status
文档已核对；未安装或运行|Documentation checked; not installed or run
未核验不等于不支持。LLM / VLM 与 RL 可重叠，不表示互斥的模型分类。|Unverified does not mean unsupported. LLM / VLM and RL may overlap; they are not mutually exclusive model categories.
当前能力与 Agent 条件按本游戏的关联信息匹配；未补充的任务信息保留为未知。|Capability and agent conditions match this game's indexed relationships; missing task information remains unknown.
推荐研究用途|Suggested research use
必须对齐的条件|Conditions to align
待核验信息|Not yet verified
文档来源|Documentation sources
显示任务档案|Show task profile
收起任务档案|Hide task profile
适用性与可比性|Suitability & comparability
本游戏的任务档案|Task profiles for this game
文档描述的设置；数值预算与安装状态请按所选版本核对。|Documented settings; verify numeric budgets and installation status against the selected version.
仅有条目级说明；本游戏字段尚未核验。|Only entry-level information is available; game-specific fields are not yet verified.
查看该游戏中的档案|View this game's profile
复制对比链接|Copy comparison link
对比链接已复制|Comparison link copied
研究主题与游戏条件可组合筛选；同维度取并集，不同维度取交集。|Combine research themes and game conditions; values within a dimension use OR, while dimensions use AND.
游戏类型描述玩法；合作与竞争属于独立的交互关系。环境、平台和套件另按条目性质标识。|Genres describe gameplay; cooperation and competition are independent interaction structures. Environments, platforms and suites are labeled by entry type.
能力标签是研究关联，不代表独立能力测量；点击标签查看依据。|Capability labels indicate research relevance, not isolated capability measurement; open a label to inspect its evidence.
当前分类仅覆盖本站已整理的游戏关联。|Classification covers only game relationships curated in this index.
从当前结果对比|Compare filtered results
未固定版本；核查于 2026-10-18|Version not pinned; checked 2026-10-18
筛选后暂无关联条目。可清除条件，保留当前游戏。|No related entries match. Clear conditions to keep browsing this game.
详情与来源|Details & sources
任务档案采用本游戏字段；没有核验的字段不使用整套 Benchmark 的信息代填。|Profiles use game-specific fields; unverified fields are not filled with suite-wide information.
'''
for line in UI.strip().splitlines():t(*line.split('|',1))
for zh,en in [
 ('目录按条目检索；游戏页面按本游戏的关联与任务档案筛选。','Search the directory by entry; game pages filter using game-scoped relationships and task profiles.'),
 ('玩法与合作、竞争分别标注','Gameplay and cooperative/competitive structure are labeled separately'),
 ('建议指标与控制条件属于编辑的研究设计提示。','Suggested metrics and controls are editorial study-design guidance.'),
]:t(zh,en)

t('对比链接','Comparison link')
t('本 demo 包含 12 个精选条目。','This demo contains 12 curated entries.')

# Navigation and page responsibilities.
for zh,en in [
 ('研究主题','Research themes'),('游戏索引','Game index'),('全部条目','All entries'),('分类方法','Methods'),
 ('主题相关条目','Entries for this theme'),('重点候选 · 关联依据 · 实验条件','Priority candidates · Relevance · Experimental conditions'),
 ('完整文献目录 · 搜索与组合筛选','Full research catalog · Search & combined filters'),
 ('收录规则 · 分类定义 · 证据来源与核验','Inclusion criteria · Definitions · Sources & verification'),
 ('选择研究主题，查看重点候选、其他相关条目与实验条件；也可从游戏索引定位具体任务。','Choose a research theme to inspect priority candidates, related entries and experimental conditions, or use the game index to locate specific tasks.'),
 ('主题检索结果','THEME RESULTS'),('文献目录','BENCHMARK INDEX'),
]:t(zh,en)

t('条目对比','Compare entries')

t('接入说明','Integration details')

# Conventional gameplay genres; research-only tasks remain visibly separate.
for zh,en in [
 ('即时战略（RTS）','RTS'),('模拟类（SIM）','Simulation'),('动作类（ACT）','Action'),
 ('跨类型合集','Multi-genre'),('抽象决策任务','Abstract task'),
 ('合集与实验任务','Collections & experimental tasks'),('玩法与题材','Mechanics & themes'),
 ('类型归类依据','Genre classification evidence'),
 ('按常见游戏玩法分类；允许多类型。题材、交互方式与研究能力分别标注。合集与实验任务单列，不视为游戏类型。','Classified by common gameplay genres, allowing multiple genres. Themes, interaction structures and research capabilities are separate. Collections and experimental tasks are indexed separately from genres.'),
]:t(zh,en)
