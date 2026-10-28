"""Editorial game-to-benchmark relationships; no capability inheritance from suites."""
GAME_TRANSLATIONS = {}
def t(zh, en):
    GAME_TRANSLATIONS[zh] = en
    return zh

def link(benchmark, focus, scope, source=None, relation='suite'):
    return dict(benchmark=benchmark, focus=t(*focus), scope=t(*scope), source=source,
                relation=relation, checked='2026-10-18')

def game(id, name, categories, note, links, kind='game'):
    return dict(id=id, name=name, categories=categories, note=t(*note), links=links, kind=kind)

GAMES = [
 game('minecraft','Minecraft',['Sandbox'],
 ('当前收录的三个条目分别提供任务基础设施、LLM 能力评估和智能体模块比较。SmartPlay 使用 MineDojo 任务，三者不是三个互相独立的游戏环境。',
  'The three indexed entries provide task infrastructure, LLM capability evaluation and agent-module comparisons. SmartPlay uses MineDojo tasks; these are not three independent game environments.'),[
 link('minedojo',('开放式任务 · 探索与技能组合','Open-ended tasks · Exploration & skill composition'),
 ('原生 Minecraft 任务平台，含生存、采集、科技树、战斗与创造性任务；规划和长时程研究需指定任务与成功标准。','Native Minecraft task platform with survival, harvesting, tech-tree, combat and creative tasks. Specify tasks and success criteria for planning or long-horizon studies.'),
 'https://github.com/MineDojo/MineDojo#benchmarking-suite','native'),
 link('smartplay',('语言智能体 · 创造性任务','Language agents · Creative tasks'),
 ('通过 MineDojo Creative Tasks 纳入 Minecraft，用于语言智能体能力分析；具体能力覆盖需核对所选任务，不能继承整个 SmartPlay 套件的标签。','Includes Minecraft through MineDojo Creative Tasks for language-agent evaluation. Check the selected task before assigning capabilities; suite-wide SmartPlay labels do not apply automatically.'),
 'https://github.com/microsoft/SmartPlay#smartplay','adapted'),
 link('orak',('工具交互 · 智能体模块比较','Tool interaction · Agent-module comparisons'),
 ('Minecraft 是多游戏套件中的一个游戏，框架支持工具接口及智能体模块研究；具体任务、动作接口和评分应按游戏配置核对。','Minecraft is one game in a multigame suite supporting tool interfaces and agent-module studies. Verify tasks, action interfaces and scoring in its game configuration.'),
 'https://github.com/krafton-ai/Orak#game-list')]),
 game('crafter','Crafter',['Sandbox'],
 ('Crafter 是独立的二维生存环境，不并入 Minecraft。两套评估共享游戏，但智能体接口与预算仍需分别核对。','Crafter is a separate 2D survival environment, not Minecraft. These evaluations share a game, but agent interfaces and budgets still require separate checks.'),[
 link('balrog',('持续执行 · 生存与进展','Sustained execution · Survival & progress'),('套件中的 Crafter 环境；按具体目标和交互预算分析长期执行。','The Crafter environment in the suite; analyze sustained execution under specified objectives and interaction budgets.')),
 link('smartplay',('语言智能体 · 游戏能力分析','Language agents · Game-based capability analysis'),('六个游戏之一；具体能力划分需参照 Crafter 的任务设置。','One of six games; inspect Crafter task settings for specific capability assignments.'),'https://github.com/microsoft/SmartPlay#smartplay')]),
 game('starcraft-ii','StarCraft II',['Strategy'],
 ('同一游戏下，团队微操与更广的策略交互不是同一评估单位；比较前应确认控制层级。','Team micromanagement and broader strategic interaction within the same game are different evaluation units. Establish the control level before comparing.'),[
 link('smacv2',('团队协作 · 去中心化微操','Team coordination · Decentralized micromanagement'),('局部观测下的单位控制与随机化战斗场景，关注团队表现；不等于完整游戏宏观战略。','Unit control under local observations and randomized combat scenarios, focusing on team performance; not full-game macro strategy.'),'https://github.com/oxwhirl/smacv2#introduction','native'),
 link('orak',('策略交互 · 语言智能体工具','Strategic interaction · Language-agent tools'),('StarCraft II 是套件的策略游戏之一；按具体配置核对宏观、微观控制与评估任务。','StarCraft II is a strategy game in the suite. Inspect its configuration for macro/micro control and evaluation tasks.'),'https://github.com/krafton-ai/Orak#game-list')]),
 game('overcooked','Overcooked',['Cooperative'],
 ('Overcooked（胡闹厨房）是游戏背景；Overcooked-AI 是基于该游戏构建的合作研究环境。当前收录的 Collab-Overcooked 使用修改后的 Overcooked-AI 开展评测，并非直接运行商业游戏。','Overcooked is the underlying game setting; Overcooked-AI is a cooperative research environment based on it. The indexed Collab-Overcooked benchmark evaluates agents in a modified Overcooked-AI environment, rather than running the commercial game directly.'),[
 link('collab-overcooked',('通信 · 分工 · 协作过程','Communication · Division of work · Collaboration process'),('使用修改后的 Overcooked-AI 环境，扩展菜谱与食材；研究烹饪任务中的发起、响应与动作冗余，并控制伙伴、菜谱和布局。','Uses a modified Overcooked-AI environment with extended recipes and ingredients. Study initiation, response and redundant actions in cooking tasks while controlling partners, recipes and layouts.'),'https://github.com/YusaeMeow/Collab-Overcooked#install',relation='adapted')]),
 game('hanabi','Hanabi',['Cards','Cooperative'],
 ('合作卡牌可同时出现在卡牌与合作类别；同一个条目按 ID 去重计数。','Cooperative card games appear in both Cards and Cooperative; entry counts are deduplicated by ID.'),[
 link('hanabi',('隐含信息 · 伙伴推理 · 有限通信','Hidden information · Partner reasoning · Limited communication'),('明确自博弈或陌生伙伴协议；高自博弈得分不能直接说明交叉配对稳健性。','Specify self-play or unfamiliar-partner protocols; high self-play scores do not establish robust cross-play.'),relation='native')]),
 game('nethack','NetHack',['Roguelike'],
 ('NLE 提供学习环境，BALROG 在该游戏上组织语言智能体评估。接口层与实验协议应分别记录。','NLE provides the learning environment, while BALROG evaluates language agents on the game. Record interface layers and experimental protocols separately.'),[
 link('nethack',('强化学习 · 探索与生存','Reinforcement learning · Exploration & survival'),('原生 NLE 任务、奖励与终止设置；长期进展依赖具体任务。','Native NLE tasks, rewards and termination settings; sustained progress depends on the selected task.'),relation='native'),
 link('balrog',('语言智能体 · 长时程交互','Language agents · Long-horizon interaction'),('套件中的 NetHack 评估；固定历史窗口和行动预算后分析进展。','NetHack evaluation within the suite; analyze progress with fixed history windows and action budgets.'))]),
 game('minihack','MiniHack',['Roguelike'],
 ('基于 NetHack 的任务环境，独立列出，避免与完整 NetHack 评估混计。','A NetHack-based task environment, listed separately to avoid conflating it with full NetHack evaluations.'),[
 link('balrog',('任务执行 · 地牢交互','Task execution · Dungeon interaction'),('套件中的 MiniHack 子环境；任务机制与终止条件需按所选关卡核对。','The MiniHack subenvironment in the suite; check mechanisms and termination conditions for the selected level.'))],kind='family'),
 game('minigrid','MiniGrid',['Puzzle'],
 ('按具体任务选择：DoorKey 偏向依赖处理，Memory 显式依赖历史信息。MiniWorld 另有实现，不与 MiniGrid 合并。','Select specific tasks: DoorKey emphasizes prerequisites, while Memory explicitly requires past information. MiniWorld has a separate implementation and is not merged into MiniGrid.'),[
 link('minigrid',('任务依赖 · 记忆 · 可控泛化','Task dependencies · Memory · Controlled generalization'),('DoorKey、Memory 等子任务的能力要求不同；需固定包装器、视野与训练测试划分。','DoorKey, Memory and other subtasks have different requirements. Fix wrappers, field of view and train/test splits.'),relation='native')],kind='family'),
 game('babyai','BabyAI',['Puzzle'],
 ('语言指令驱动的网格任务；与 MiniGrid 环境家族保留关联但分别列出。','Language-instruction grid tasks; related to the MiniGrid family but indexed separately.'),[
 link('balrog',('指令理解 · 目标执行','Instruction following · Goal execution'),('BALROG 中的 BabyAI 子环境，按指令和关卡分析执行表现。','The BabyAI subenvironment in BALROG; analyze execution by instruction and level.'))],kind='family'),
 game('baba-is-ai','Baba Is AI',['Puzzle'],
 ('保留 BALROG 使用的环境名称；不与商业游戏 Baba Is You 直接合并统计。','Keeps the environment name used by BALROG; not merged directly with the commercial game Baba Is You.'),[
 link('balrog',('规则推理 · 解谜执行','Rule reasoning · Puzzle execution'),('套件中的规则解谜环境；归类是基于任务机制的研究视角。','A rule-based puzzle environment in the suite; the research focus is an editorial interpretation of its mechanisms.'))]),
 game('baba-is-you','Baba Is You',['Puzzle'],
 ('作为具体游戏单独列出，安装条件与文本化变体不同。','Indexed as a distinct game, with setup conditions different from text-based variants.'),[
 link('orak',('解谜交互 · 工具使用','Puzzle interaction · Tool use'),('Orak 中的解谜游戏；需按游戏文档核对关卡、接口与资产要求。','A puzzle game in Orak; inspect its documentation for levels, interfaces and asset requirements.'),'https://github.com/krafton-ai/Orak#game-list')]),
 game('tower-of-hanoi','Tower of Hanoi',['Puzzle'],
 ('以明确规则与前置依赖分析计划和执行，可控制问题规模。','Analyze planning and execution under explicit rules and prerequisites, controlling problem size.'),[
 link('smartplay',('规划 · 顺序依赖','Planning · Sequential dependencies'),('SmartPlay 中的汉诺塔游戏；使用具体设置分析依赖处理。','Tower of Hanoi in SmartPlay; use explicit settings to analyze prerequisite handling.'),'https://github.com/microsoft/SmartPlay#smartplay')]),
 game('messenger','Messenger',['Puzzle'],
 ('保留套件中已记录的交互环境，具体规则见项目文档。','Includes the interaction environment documented in the suite; consult project documentation for its rules.'),[
 link('smartplay',('语言信息 · 任务交互','Language information · Task interaction'),('SmartPlay 收录 Messenger-EMMA；所需能力依赖具体任务设置。','SmartPlay includes Messenger-EMMA; capability requirements depend on its task settings.'),'https://github.com/microsoft/SmartPlay#smartplay')]),
 game('textworld','TextWorld',['Text adventure'],
 ('文字交互环境家族，观测与动作均需按具体生成任务解释。','A text-interaction environment family; interpret observations and actions for the specific generated task.'),[
 link('balrog',('文字交互 · 任务规划','Text interaction · Task planning'),('BALROG 中的 TextWorld 子环境，控制任务难度及语言动作接口。','The TextWorld subenvironment in BALROG; control task difficulty and the language-action interface.'))],kind='family'),
 game('football','Football',['Sports','Cooperative'],
 ('区分短场景与完整比赛，以及单球员和多球员控制。','Distinguish short scenarios from full matches, and single-player from multiplayer control.'),[
 link('football',('实时控制 · 团队配合 · 攻防决策','Real-time control · Team play · Offense/defense'),('Football Academy 或完整比赛；控制球员数、对手、奖励与观测设置。','Football Academy or full matches; control player count, opponents, rewards and observations.'),relation='native')]),
 game('rlcard-games','RLCard games',['Cards'],
 ('此处是游戏集合入口，不计作一款游戏；Blackjack、Leduc Hold’em 等应在实验时分别选定。','This is a game-collection entry, not one game. Select Blackjack, Leduc Hold’em or another supported game explicitly for experiments.'),[
 link('rlcard',('隐藏信息 · 对手策略 · 强化学习','Hidden information · Opponent strategies · RL'),('平台包含多种卡牌游戏，规则、对手与回报定义必须随结果报告。','The platform contains multiple card games; report rules, opponents and return definitions with results.'),relation='native')],kind='collection'),
 game('procgen-games','Procgen games',['Arcade'],
 ('此处是程序生成游戏集合入口，不计作一款游戏；泛化实验必须固定具体环境及训练测试关卡。','This is a collection of procedurally generated games, not one game. Fix the environment and train/test levels in generalization experiments.'),[
 link('procgen',('未见关卡泛化 · 样本效率','Unseen-level generalization · Sample efficiency'),('16 个程序生成环境，按游戏分别报告，并控制难度、关卡分布和训练预算。','16 procedurally generated environments; report each game separately and control difficulty, level distributions and training budgets.'),relation='native')],kind='collection'),
 game('rock-paper-scissors','Rock-Paper-Scissors',['Strategy'],
 ('结构化的重复决策任务，适合检查对历史和对手模式的利用。','A structured repeated-decision task for examining the use of history and opponent patterns.'),[
 link('smartplay',('历史利用 · 对手模式','History use · Opponent patterns'),('SmartPlay 中的石头剪刀布；需明确对手规则与历史访问条件。','Rock-Paper-Scissors in SmartPlay; specify opponent rules and history access.'),'https://github.com/microsoft/SmartPlay#smartplay')]),
 game('two-armed-bandit','2-armed bandit',['Strategy'],
 ('作为决策任务单独标识，不与完整策略游戏混同。','Listed explicitly as a decision task rather than conflated with full strategy games.'),[
 link('smartplay',('探索与利用 · 随机性','Exploration/exploitation · Randomness'),('SmartPlay 中的双臂老虎机任务；控制奖励分布和交互预算。','The two-armed bandit task in SmartPlay; control reward distributions and interaction budgets.'),'https://github.com/microsoft/SmartPlay#smartplay')],kind='task'),
]

GAME_UI = '''
按游戏浏览|Browse by game
游戏 → Benchmark|Game → Benchmark
游戏类别 → 具体游戏 → 相关 Benchmark|Game category → Specific game → Related benchmarks
选择游戏，查看同一场景下各 Benchmark 的研究侧重与评估边界。|Select a game to examine research focuses and evaluation boundaries across related benchmarks.
游戏类别导航|Game category navigation
具体游戏与环境|Games & environments
该类别下的游戏|Games in this category
当前收录|Indexed here
关联条目|related entries
游戏与环境|games & environments
已收录 Benchmark|indexed benchmarks
研究侧重与任务边界|Research focus & task boundaries
研究侧重|Research focus
在此游戏中的范围|Scope within this game
关联类型|Relationship
原生环境 / 基准|Native environment / benchmark
套件子游戏|Game within a suite
基于已有任务接入|Adapted from existing tasks
具体游戏|Game
环境家族|Environment family
游戏集合|Game collection
决策任务|Decision task
此游戏下的 Benchmark|Benchmarks for this game
查看完整条目|View full record
游戏关联来源 ↗|Game relationship source ↗
加入对比|Add to compare
已加入对比|In comparison
对比本游戏条目|Compare entries for this game
仅统计当前 demo 已收录且建立游戏关联的条目，不代表该游戏的全部研究。跨类别关联按条目 ID 去重。|Counts cover only entries with indexed game relationships in this demo, not all research on a game. Cross-category entries are deduplicated by ID.
研究侧重为基于任务机制的编辑归类；游戏归属来源见各行链接。套件标签不自动代表此游戏独立测量了对应能力。|Research focuses are editorial classifications based on task mechanisms; each row links to its game-membership source. Suite labels do not establish isolated capability measurement in a game.
同游戏比较仍需控制任务、观测、动作、预算及评价指标。|Even within one game, comparisons require matched tasks, observations, actions, budgets and metrics.
本游戏关联|This game relationship
以下比较采用当前游戏中的任务范围；条目级信息仍可在详情中查看。|The research focus and task scope below refer to this game; remaining interface and protocol fields describe the full benchmark entry and require game-specific verification.
未关联到当前游戏，请查看完整条目。|Not linked to the current game; consult the full record.
其他筛选在 Benchmark 目录中使用；游戏索引独立展示游戏级关联。|Use other filters in the benchmark index; this game index independently shows game-level relationships.
按具体游戏定位评估任务，再查看其研究侧重与分类依据。|Locate evaluation tasks by game, then inspect their research focuses and classification evidence.
'''
for line in GAME_UI.strip().splitlines():
    a,b=line.split('|',1);t(a,b)

t('游戏关联来源','Game relationship source')
t('对比本游戏条目 →','Compare entries for this game →')

t('研究关联与任务范围为当前游戏的信息；其余接口与协议字段来自完整条目，需按所选游戏进一步核对。','The research focus and task scope below refer to this game; remaining interface and protocol fields describe the full benchmark entry and require game-specific verification.')

t('此索引仅展示已整理的游戏关联，套件的完整游戏清单见官方来源。','This index shows curated game relationships only. Consult official sources for the complete game list of each suite.')

# Display names never replace canonical game IDs, benchmark names or paper titles.
GAME_NAMES = {
 'minecraft': dict(nameZh='我的世界', nameType='official', nameSource='https://www.xbox.com/zh-CN/games/store/minecraft-launcher/9pgw18npbzv5', aliases=['我的世界','Minecraft']),
 'starcraft-ii': dict(nameZh='星际争霸II', nameType='official', nameSource='https://sc2.blizzard.cn/home.html', aliases=['星际争霸II','星际争霸Ⅱ','星际争霸2','星际争霸 2','星海爭霸II','StarCraft II','StarCraft 2']),
 'tower-of-hanoi': dict(nameZh='汉诺塔', nameType='generic', aliases=['汉诺塔','Tower of Hanoi']),
 'rock-paper-scissors': dict(nameZh='石头剪刀布', nameType='generic', aliases=['石头剪刀布','Rock-Paper-Scissors']),
 'two-armed-bandit': dict(nameZh='双臂老虎机', nameType='generic', aliases=['双臂老虎机','2-armed bandit','two-armed bandit']),
 'football': dict(nameZh='足球', nameType='generic', aliases=['足球','Football']),
 'overcooked': dict(nameZh='胡闹厨房', nameContext=t('游戏系列名称；研究环境保留英文原名','Game-series name; research environments retain their original names'), nameSource='https://www.gamesource-ent.com/news/detail/411/en', aliases=['胡闹厨房','胡鬧廚房','Overcooked','Overcooked-AI'], hierarchy=[
     dict(label=t('游戏背景','Game setting'), name='Overcooked', source='https://github.com/HumanCompatibleAI/overcooked_ai'),
     dict(label=t('研究环境','Research environment'), name='Overcooked-AI', source='https://github.com/HumanCompatibleAI/overcooked_ai'),
     dict(label=t('评测基准 · 使用修改版环境','Benchmark · modified environment'), name='Collab-Overcooked', source='https://github.com/YusaeMeow/Collab-Overcooked#install'),
 ]),
}
for g in GAMES:
    g.update(GAME_NAMES.get(g['id'],{}))
for zh,en in [
 ('官方中文名 ↗','Official Chinese name ↗'),
 ('名称说明 ↗','Name context ↗'),
 ('任务 / 场景通用名称','Generic task / setting name'),
 ('英文原名','Original English name'),
]:t(zh,en)
