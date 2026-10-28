"""Reviewed bilingual text; names, bibliographic titles and citations stay original."""
from .research_content import TAXONOMY, PROFILES, EVIDENCE, QUESTIONS
PAIRS = {}
def pair(zh,en):
    assert isinstance(zh,str) and isinstance(en,str)
    PAIRS[zh]=en

tax = [
['Long-horizon','Progress spans multiple stages, with earlier actions affecting later outcomes.','Specify episode length, dependency depth and progress measures. Complexity or duration alone does not establish long-term planning.'],
['Planning','Actions have prerequisites; goals require decomposition or revision after feedback.','Separate task structure from the contribution of a planning module. Success alone cannot be attributed to planning.'],
['Coordination','Multiple acting entities divide work, synchronize or adapt toward shared goals.','Specify control, partners and shared information. Multiple visible units do not automatically imply multiple agents.'],
['Strategy','Decisions trade off resources, opponents and longer-term returns.','Distinguish tactical, strategic and card-game scope. A strategy-game genre does not define a common evaluation.'],
['Memory','A decision depends on earlier information that is not currently available.','Specify history windows and observation constraints. Providing history is not itself a memory evaluation.'],
['Exploration','Interaction reveals unknown areas, rules or useful states.','Distinguish information acquisition from random movement; state whether maps or knowledge are supplied.'],
['Generalization','Behavior is evaluated under changes in levels, configurations or task distributions.','Define training and test splits. Randomization alone does not establish generalization to unseen tasks.'],
['Social reasoning','Behavior adapts to partner intentions, communication or asymmetric information.','Communication volume and team scores alone do not establish intention understanding.'],
['Grounding & control','Visual or structured observations are translated into timely, effective game actions.','Fix observation modality, action abstraction and execution frequency before comparing results.']]
for source,target in zip(TAXONOMY.values(),tax):
    for a,b in zip(source,target): pair(a,b)

profiles = {
'balrog':['Six environments; inspect Crafter / NetHack subtasks for long-horizon studies','Study progress and failure during sustained language-agent interaction.','Report success or progress per environment; also record stalls, repeated actions and inference costs.','Environment, task, step limit, text/image history, prompts and model version.','Documented LLM / VLM interfaces. Using RL environments does not establish an available RL comparison in this suite.'],
'smacv2':['Decentralized StarCraft II micromanagement scenarios','Study team control under local observations and adaptation to randomized scenarios.','Compare team win rates under fixed scenario configurations; record failure types.','Race, unit counts, starting-position distribution, sight range, training steps and seeds.','Native MARL; requires StarCraft II and map assets. LLM adaptations have not been verified.'],
'minedojo':['Minecraft task collection; select an explicit objective','Study resource acquisition and multistage objectives in open worlds.','Define success and intermediate progress per task; report the interaction budget.','Task, initial world, resources, external knowledge, rewards and action wrappers.','Simulator and task infrastructure. This demo records RL use; LLM adaptations have not been verified.'],
'smartplay':['Select tasks by game, such as Tower of Hanoi','Study dependency reasoning and use of history across game settings.','The documented interface exposes score / completed; report results separately by game.','Game, difficulty, manual, history window and interaction budget.','Documented LLM use. The repository is archived; installation compatibility has not been tested.'],
'collab-overcooked':['30 collaborative cooking tasks, evaluated by task complexity','Study how language agents initiate, respond to and divide collaborative work.','Documented metrics include TES F1, action redundancy and collaboration initiation/response; interpret alongside task outcomes.','Recipe, layout, partner models, communication rules, action templates and run budget.','Documented LLM multi-agent framework. A native RL evaluation interface has not been verified.'],
'procgen':['16 procedurally generated environments; define train/test levels','Study adaptation to unseen levels under a fixed training budget.','Report training and test returns separately, together with the training sample count.','Level seed ranges, training level count, difficulty, game and training budget.','Native pixel-based RL interface. Pin runtime versions; LLM adaptations have not been verified.'],
'orak':['12-game suite; select games such as StarCraft II for strategy studies','Study language-agent execution and module design across games.','Use game-specific scores; also report action and model-inference costs.','Game, observations, tools, action granularity, modules and model budget.','Documented LLM / VLM use. Some games require separate purchase and installation.'],
'nethack':['A selected NetHack task in NLE','Study the accumulated effects of exploration, survival and sustained interaction.','Report task-specific return; also record survival time and progress.','Task rewards, termination rules, character, seeds, history and environment version.','Native RL environment. Language-agent evaluation through BALROG is a separate evaluation layer.'],
'hanabi':['Cooperative Hanabi; specify self-play or cross-play','Study partner reasoning and conventions under limited hints.','Report team scores and cross-partner performance separately by partner protocol.','Player count, hint rules, partner sources, training method and deal seeds.','Native RL environment. Other agents can be built; ready-made LLM adaptations have not been verified.'],
'football':['Football Academy or full matches; specify controlled players','Study spatial control and team strategy in multi-player control settings.','Report scenario-specific return or outcomes; also record goals, conceded goals and failure causes.','Scenario, opponents, controlled players, observations, rewards and training budget.','Native RL environment. Single-policy control and multi-policy coordination require separate descriptions.'],
'rlcard':['Select a card game and opponents, such as Leduc Hold’em','Design decision-making and opponent-comparison studies under hidden information.','Define returns by game and opponents; specify the evaluation protocol first.','Game rules, opponent pool, seats, seeds and training budget.','Research platform and baselines. A common interface does not specify a unique benchmark protocol.'],
'minigrid':['Specific MiniGrid tasks, such as Memory / DoorKey','Study historical information or action dependencies in interpretable tasks.','Memory / DoorKey documentation specifies success rewards and a step penalty; also report success rates.','Task ID, map size, observation wrapper, seeds and step limit.','Native RL. Task evidence here concerns MiniGrid and does not automatically extend to MiniWorld.']}
for key,translated in profiles.items():
    for a,b in zip(PROFILES[key],translated): pair(a,b)

ev = {
'balrog':[
['The project explicitly targets long-horizon interactive evaluation.','A suite-level objective; actual horizons differ by environment.'],
['Multistep goal progression can support analysis of action dependencies.','Select a specific task; the contribution of planning has not been independently verified.'],
['Sustained interaction with unknown game states can support exploration studies.','A candidate research direction; specify the sub-environment and exploration metrics.'],
['Evaluation settings allow text and image history windows.','History is a controlled condition, not a validated standalone memory test.']],
'smacv2':[
['Decentralized units coordinate micromanagement combat using local observations.','Cooperative MARL micromanagement, excluding full-game macro management.'],
['Unit composition and starting positions can be randomized.','Scenario variation; claims about unseen distributions still require train/test splits.']],
'minedojo':[
['Open-ended tasks support studies of multistage goal execution.','Depends on the selected task; the Minecraft setting alone does not establish the horizon.'],
['Goal completion may involve resource and operation prerequisites.','A task-suite candidate; dependency depth requires task-level verification.'],
['The open-world simulator supports exploration and task interaction.','Fix the initial world and available external knowledge.']],
'smartplay':[
['The documented capability scope includes planning ahead and object-dependency reasoning.','Games correspond to different capability subsets; do not treat the suite as uniform.'],
['The project discusses learning from history and provides history to agents.','Using history and measuring memory capacity require different experimental designs.'],
['Bandit and open-world settings provide candidates for exploration studies.','Distinguish information exploration from spatial exploration.']],
'collab-overcooked':[
['Tasks and evaluation explicitly address initiating and responding to collaboration.','Specify cooking tasks, roles and partner configurations.'],
['Collaboration initiation and response expose aspects of partner interaction.','These behavioral metrics alone do not establish intention understanding.'],
['Recipe execution and collaborative actions have ordering dependencies.','Planning relevance from task structure, not a standalone planning score.']],
'procgen':[
['Procedurally generated levels are used to evaluate generalizable RL skills.','Explicitly separate training levels from test levels.'],
['Agents select discrete button actions from RGB observations.','A visual-control interface; total return combines perception and decisions.']],
'orak':[
['The multi-game agent framework supports studies of planning and action execution.','Depends on the game and module configuration.'],
['The suite includes strategy settings such as StarCraft II.','Inspect the game-specific task; this does not extend to all 12 games.'],
['Agents act and receive feedback through game-specific interfaces.','Different action abstractions and observations cannot be directly pooled.']],
'nethack':[
['Survival and task progress accumulate through sustained interaction.','Task rewards and termination determine the actual evaluation horizon.'],
['Procedurally generated dungeons introduce unknown states and exploration demands.','Define exploration progress rather than relying only on total score.'],
['Exploration provides a setting for studying retention and use of past information.','An editorial candidate; inspect observation fields and history settings.']],
'hanabi':[
['Players cooperate toward a team goal under limited information.','Cooperative cards; evaluate familiar and unfamiliar partners separately.'],
['Legal hints and partner actions provide clues for information reasoning.','Depends on the partner protocol; score alone does not establish social reasoning.'],
['Playing, discarding and hinting involve trade-offs in team returns.','Cooperative game decisions, not an adversarial strategy evaluation.']],
'football':[
['Multi-player control configurations can support studies of team coordination.','Only configurations with multiple acting entities; not every scenario.'],
['Matches and scenarios offer offensive and defensive decision problems.','Short scenarios and full matches have distinct evaluation scopes.'],
['Visual or structured states drive football actions.','Fix the observations and controlled-player configuration.']],
'rlcard':[
['Card-game environments support decisions constrained by rules and information.','The game and opponent protocol must be specified separately.']],
'minigrid':[
['Memory requires retaining an initial object and choosing its match at the corridor end.','Only the MiniGrid Memory task and its observation configuration.'],
['DoorKey requires collecting a key, unlocking a door and then reaching the goal.','Only this task’s prerequisites; not the entire environment family.'],
['Configurable task families support distribution-shift experiments.','Task selection and train/test splits require an explicit protocol.']]}
for key,values in ev.items():
    for original,translated in zip(EVIDENCE[key].values(),values):
        pair(original[1],translated[0]);pair(original[2],translated[1])

qtext=[
['Long-horizon execution','Maintaining and executing long-horizon objectives','Goal maintenance, intermediate progress and execution stability during sustained interaction.','This theme includes language-model evaluation suites and native RL environments; comparisons require explicit subtasks and interaction budgets.',['Task and stage definitions','Action / inference budgets','Progress and failure trajectories'],[
'Use existing LLM / VLM evaluation interfaces to study sustained interaction; inspect individual environments.','Design multistage execution studies around an explicit Minecraft objective.','Study exploration, survival and accumulated progress in a native RL environment.']],
['Coordination & communication','Multi-agent division of work, coordination and information exchange','Division of work, communication, partner adaptation and decentralized team control.','Collab-Overcooked addresses language-mediated collaboration, SMACv2 addresses control under local observations, and Hanabi involves limited hints and partner conventions.',['Partners and roles','Shared information','Team outcomes + collaboration process'],[
'Language-agent collaboration with process metrics for initiation, response and redundancy.','Native MARL micromanagement for team control under local observations.','Limited hints and hidden information for studying partner conventions and team reasoning.','Spatial coordination and offensive/defensive behavior in configurations with multiple controlled players.']],
['Planning & dependencies','Goal decomposition and prerequisite reasoning','Goal decomposition, action prerequisites and feedback-driven plan revision.','This theme spans interpretable dependency tasks and complex games; action abstraction, available information and task complexity affect comparability.',['Task dependency structure','Planning versus execution','Observations and action abstraction'],[
'Inspect tasks such as Tower of Hanoi and the corresponding capability settings.','DoorKey provides interpretable dependencies: collect key → unlock door → reach goal.','Select multistep objectives from the suite to study execution during sustained interaction.','Study multistage dependencies through explicit resource and crafting objectives.']],
['Generalization & distribution shift','Generalization across levels, configurations and task distributions','Performance on unseen levels, randomized scenarios and shifted task distributions.','Procgen addresses unseen levels, SMACv2 offers randomized combat configurations, and MiniGrid supports controlled task variation; generalization claims require explicit train/test splits.',['Train / test split','Type of distribution shift','Matched training budget'],[
'RL generalization on procedurally generated levels, with explicit level ranges.','Randomized units and starting positions; define unseen distributions before testing transfer.','Configurable task families for controlled studies; define the splitting protocol explicitly.']],
['Strategy & resource decisions','Strategic decisions under resource constraints and interactive games','Resource allocation, offensive/defensive choices and trade-offs under information constraints.','This theme spans card decisions in RLCard, spatial offense/defense in Football and strategy games in Orak; decision levels and return definitions differ.',['Decision scope','Opponent / partner protocol','Resources and returns'],[
'Select a card game and opponents to study decisions under hidden information.','Distinguish short scenarios from full matches when studying offensive/defensive trade-offs.','Select strategy games within the suite and inspect their tools and task scope.','Trade off limited hints against team returns in cooperative play.']],
['Memory & partial observability','Retention of historical information and partially observable decisions','Use of past information, memory dependence and decisions under restricted observations.','MiniGrid Memory has explicit historical-information dependence. SmartPlay and NLE offer more complex settings that require observation controls and ablations to isolate memory contributions.',['Currently unavailable information','History window','Memory ablations'],[
'Memory explicitly requires recalling an early object, with task-level documentation.','Settings for learning from history; distinguish learning patterns from retaining information.','A candidate for historical-information use during exploration; control observations and history to isolate contributions.']]
]
for q,arr in zip(QUESTIONS,qtext):
    for field,val in zip(['label','title','description','decision'],arr[:4]):pair(q[field],val)
    for a,b in zip(q['checks'],arr[4]):pair(a,b)
    for a,b in zip(q['candidates'].values(),arr[5]):pair(a,b)

# Interface labels and methodology, kept separate from bibliographic metadata.
UI = '''
Benchmark 目录|Benchmark index
分类体系|Taxonomy
游戏类别|Game categories
对比|Compare
游戏智能体评估基准：研究目录与分类索引|A research index and taxonomy of game agent benchmarks
汇集游戏智能体评估中的 benchmark、环境与研究平台，按研究目标、任务机制及智能体范式组织文献，并提供分类依据与评估协议对照。|A curated collection of benchmarks, environments and research platforms, organized by research objectives, task mechanisms and agent paradigms, with classification evidence and evaluation protocols.
研究条目|research entries
研究主题|Research themes
分类注释|classification annotations
数据核查：2026-10-18|Reviewed: 2026-10-18
收录范围与方法|Scope & methodology
研究主题索引|Research theme index
全部条目|All entries
主题索引用于文献检索与评估选型。各主题可交叉，相关条目不构成能力排名；具体评估范围见任务说明与分类证据。|Use the theme index to find literature and select evaluations. Themes overlap; related entries are not capability rankings. Consult task descriptions and classification evidence for scope.
全部范式|All paradigms
强化学习 RL|Reinforcement learning
导出记录|Export records
筛选条件|Filters
清除筛选|Clear filters
分类说明|Classification notes
同一维度内为并集；不同维度间为交集。条目级分类不等同于所有子任务均满足条件。|Options within a dimension are combined with OR; dimensions are combined with AND. Entry-level labels do not imply that all subtasks meet the conditions.
查看收录方法|View methodology
搜索名称、游戏、作者…|Search names, games, authors…
目录顺序|Index order
最新发表|Newest first
名称 A–Z|Name A–Z
查看数据说明 ↗|Dataset notes ↗
本 demo 展示经过整理的研究条目。候选路径与组合筛选仍以整个条目为单位，具体子任务不一定同时满足所有条件。|This demo presents curated research entries. Theme selections and combined filters operate at entry level; individual subtasks may not satisfy every condition.
收录方法与来源|Methodology & sources
收录范围与分类方法|Scope and classification methodology
本目录以研究目标组织文献，并提供任务、接口与评估条件的结构化对照。当前版本包含 12 个示范条目。|This index organizes literature by research objectives and compares tasks, interfaces and evaluation conditions. The current demonstration includes 12 entries.
收录对象|Included resources
这版展示真实研究样例，并明确区分 benchmark、环境与平台。|This demo presents real research examples and distinguishes benchmarks, environments and platforms.
分类依据分层展示|Levels of classification evidence
“官方定位”对应项目明确的研究目标；“任务文档”对应具体任务机制；“编辑归类”是根据机制整理的研究视角。它们都不自动证明某项能力被独立测量。|Official scope denotes a project's stated objectives; task documentation describes concrete mechanisms; editorial classification organizes research perspectives by those mechanisms. None automatically establishes isolated measurement of a capability.
标签表示主题覆盖；组合筛选暂以整个条目为单位，不表示所有子任务同时满足全部条件。|Labels indicate thematic coverage. Combined filters operate at entry level and do not imply that every subtask meets all conditions.
来源与核查状态|Sources and verification
论文与代码提供可追溯入口；本 demo 没有独立复现实验。|Paper and code links provide traceable sources. Experiments have not been independently reproduced for this demo.
使用边界|Interpretation limits
研究路径是编辑整理的候选清单，不提供自动适配或质量排名。对比中的建议指标、控制条件属于研究设计提示；各条目的结果不能直接跨协议合并。|Theme selections are editorial candidate lists, not automatic compatibility checks or quality rankings. Suggested metrics and controls are research-design guidance; results cannot be pooled across different protocols.
返回目录|Back to index
研究主题、评估关注点、协议要素与相关条目|Research themes, evaluation focus, protocol factors and related entries
研究主题 / Research theme|Research theme
评估关注点|Evaluation focus
关键协议要素|Protocol factors
条目|Entries
适用范围|Scope
官方定位|Official scope
任务文档|Task documentation
编辑归类|Editorial classification
移除主题筛选 ×|Remove theme filter ×
文献关联依据：编辑整理，按具体任务核验适用性。|Literature links are editorial; verify applicability for the specific task.
分类定义与边界|Classification definitions & limits
智能体范式 · 文档记录|Agent paradigms · documented
研究能力 · 主题覆盖|Capabilities · thematic coverage
游戏类型|Game genre
语言模型|Language models
视觉语言模型|Vision-language
强化学习|Reinforcement learning
研究关联|Research relevance
分类依据|Classification evidence
Benchmark 文献、任务范围、能力分类、智能体与来源|Benchmark papers, task scope, capability labels, agents and sources
Benchmark / 文献|Benchmark / Paper
任务与评估范围|Task & evaluation scope
能力分类|Capabilities
资源|Resources
当前条件下没有候选|No entries match these filters
可以放宽智能体或游戏条件，或清除当前研究问题重新探索。|Broaden the agent or game filters, or clear the research theme to explore again.
清除全部条件|Clear all filters
能力、游戏类型、智能体范式与评估协议是独立维度。这里解释每个能力标签的归类规则；点击矩阵中的标记，可查看该条目的任务机制和来源。|Capabilities, game genres, agent paradigms and evaluation protocols are independent dimensions. The rules below define each capability label. Select a matrix marker to inspect the task mechanism and source.
游戏类型帮助定位交互场景。能力仍需根据具体任务、观测和行动约束判断。|Game genres locate interaction settings. Assess capabilities using the specific task, observation and action constraints.
研究能力|Research capabilities
要理解什么行为|Behavior under investigation
在什么场景中交互|Interaction setting
智能体范式|Agent paradigm
文档记录了哪些接口|Documented interfaces
评估协议|Evaluation protocol
任务、预算、伙伴与指标|Tasks, budgets, partners and metrics
官方定位 / 任务文档|Official scope / Task documentation
原文明确的研究目标或任务机制|Research objectives or task mechanisms stated in the source
依据机制整理的研究视角，需进一步核对|Mechanism-based research perspectives requiring further verification
归类规则|Classification rule
判断边界|Interpretation limits
分类证据 · 点击查看|Classification evidence · select to inspect
本 demo 未归类|Not classified in this demo
● 官方定位或任务文档　○ 编辑归类　— 本 demo 未归类。标记表示分类依据的类型，不表示能力强弱。|● Official scope or task documentation   ○ Editorial classification   — Not classified in this demo. Markers indicate evidence types, not capability strength.
相关 Benchmark|Related benchmarks
分类体系与证据|Taxonomy & evidence
游戏类别索引|Game category index
文献 · 任务范围 · 能力分类 · 评估接口|Literature · Task scope · Capabilities · Evaluation interfaces
分类定义 · 任务机制 · 证据来源|Definitions · Task mechanisms · Evidence sources
游戏类型描述场景，能力标签描述研究视角。|Genres describe settings; capability labels describe research perspectives.
研究目标|Research objectives
任务范围|Task scope
能力分类与依据|Capability labels & evidence
内容概览|Summary
标签逐项给出依据、任务范围与来源。“编辑归类”是研究选型的判断，不是论文已经验证的独立能力指标。最后核查：2026-10-18。|Each label includes its rationale, task scope and source. Editorial classification is a selection aid, not an independently validated capability measure. Last reviewed: 2026-10-18.
建议关注的评估信息|Suggested evaluation information
编辑建议；其中明确标注“官方”的字段来自项目文档。|Editorial suggestions; fields explicitly marked “official” come from project documentation.
比较前需控制的条件|Conditions to control before comparison
接入边界|Integration limits
解释限制|Interpretation limits
选型概览|Overview
任务与评估|Tasks & evaluation
来源与引用|Sources & citation
Benchmark 对照表|Benchmark comparison
从目录中选择 2–4 个条目，比较任务范围、智能体接口、评估条件及证据。|Select 2–4 entries from the index to compare task scope, agent interfaces, evaluation conditions and evidence.
未被收录到当前问题的候选路径；可作为相邻方向参考。|Not included in the current theme selection; may be relevant as an adjacent direction.
条目性质|Entry type
已记录的 Agent 使用|Documented agent use
观测|Observation
动作|Action
评估信息 / 编辑建议|Evaluation information / Editorial suggestions
需控制的实验条件|Experimental controls
接入与资源限制|Integration & resource constraints
解释边界|Interpretation limits
复现状态|Reproduction status
文档核查；未独立安装或运行。版本、种子与预算尚未逐项审计。|Documentation reviewed; not independently installed or run. Versions, seeds and budgets have not been individually audited.
先比较研究适用性，再确定任务与评估协议。|Compare research suitability before selecting tasks and evaluation protocols.
以下列出范围、接口与协议差异。选择同类任务后，再比较模型结果。|The table lists scope, interface and protocol differences. Select comparable tasks before comparing model results.
各 benchmark 的分数尺度、任务和预算不同；本表不合并分数。建议指标与控制条件属于编辑的研究设计提示。|Benchmarks differ in score scales, tasks and budgets; this table does not aggregate scores. Suggested metrics and controls are editorial research-design guidance.
仅显示不同项|Show differences only
比较维度|Comparison dimension
移出对比 ×|Remove ×
分类证据|Classification evidence
此问题对应的能力标签未归类。|The capability associated with this theme is not classified here.
论文与实现|Paper & implementation
论文 ↗|Paper ↗
代码 ↗|Code ↗
多游戏|Multi-game
沙盒|Sandbox
策略游戏|Strategy
合作游戏|Cooperative
卡牌|Cards
街机|Arcade
Roguelike 类|Roguelike
解谜|Puzzle
体育|Sports
文字冒险|Text adventure
评测套件|Benchmark suite
评测基准|Benchmark
环境与基准|Environment + benchmark
跳至目录|Skip to collection
主导航|Main navigation
快捷筛选|Quick filters
筛选基准|Filter benchmarks
搜索基准、游戏与作者|Search benchmarks, games, authors
结果排序|Sort results
条目级分类|Entry-level classification
研究文献索引 · 演示数据集|Curated research index · Demo dataset
清空|Clear
对比所选条目|Compare selected
关闭方法说明|Close field guide
移除筛选|Remove filter
游戏场景|GAME WORLD
所含游戏|INCLUDED GAMES
观测接口|OBSERVATION
动作接口|ACTION
已记录的智能体使用|DOCUMENTED AGENT USE
条目类型|ENTRY TYPE
评估设置|EVALUATION CONTEXT
原始论文|Original paper
来源于研究文献集的出版记录|Publication record from the research collection
官方仓库 · 已检查可访问性|Official repository · availability checked
标签说明|ABOUT THESE TAGS
导出引用|PORTABLE CITATION
用于保存来源的通用 BibTeX 记录。正式投稿请使用出版方提供的引用。|A generic BibTeX record for saving this source. Use the publisher citation for final manuscript submission.
阅读论文|Read paper
已加入对比|In comparison
加入对比|Add to compare
引用|Cite
基准详情|Benchmark details
关闭基准详情|Close benchmark details
关闭对比|Close comparison
并列对照|SIDE BY SIDE
至少选择 2 个条目进行对比|Select at least 2 entries to compare
最多选择 4 个条目，请先移除一个。|Select up to 4 entries. Remove one to add another.
引用已复制，投稿前请核对出版信息。|Citation copied. Verify publisher fields before submission.
引用已复制。|Citation copied.
当前无法复制，请在来源页选取引用文本。|Copy unavailable here. Select the citation in Sources.
本预览总结文档中的设置，未审计具体种子、预算、发行版本及安装状态。开展比较前请查阅论文与官方实现。|This preview summarizes documented settings. Exact seeds, budgets, releases and installation status are not audited here. Consult the paper and official implementation before running a comparison.
书目信息来自已有文献集，官方仓库已为本 demo 核查。主题标签表示编辑整理的覆盖范围，不是独立能力得分。|Bibliographic metadata from the existing collection; official repositories checked for this demo. Thematic tags are editorial coverage labels, not isolated capability scores.
当前目录包括评测套件、单项基准、环境家族与研究平台，均保留原始论文与作者。|The indexed entries include benchmark suites, individual benchmarks, environment families and research platforms. Each record keeps its original paper and authors.
书目字段来自已有文献集。官方仓库链接于 2026 年 10 月 18 日核查。代码可访问不代表环境已安装或实验已复现。|Bibliographic fields come from the existing collection. Official repository links were checked for this demo on 18 October 2026. Code availability does not mean the environment was installed or experiments reproduced.
跨多种环境的统一视角。|A shared view across diverse environments.
探索、收集资源并追求开放式目标。|Explore, gather resources and pursue open-ended goals.
战术战斗与战略决策。|Tactical combat and strategic decisions.
共同目标、不同角色与联合决策。|Shared goals, different roles and joint decisions.
隐藏信息与结构化游戏规则。|Hidden information and structured game rules.
视觉反馈与精确动作。|Visual feedback and precise action.
探索、生存与持续的不确定性。|Exploration, survival and persistent uncertainty.
规则、导航与目标导向推理。|Rules, navigation and goal-directed reasoning.
空间控制、队友与对手。|Spatial control, teammates and opponents.
由语言描述的世界。|Worlds described through language.
'''
for line in UI.strip().splitlines():
    zh,en=line.split('|',1);pair(zh,en)

RECORD_ZH = {
'balrog': ['根据环境使用文字或视觉观测。','通过智能体接口执行各环境特定的离散动作。','在六个已有游戏环境上使用统一评估框架，得分和进度定义取决于具体环境。','套件级标签仅概括覆盖范围，不表示每个任务都能独立测量各项能力，也不表示单一汇总分数只测量规划能力。','官方仓库记录了 LLM 与 VLM 评估，实验尚未独立复现。'],
'smacv2': ['局部单位观测；全局状态访问取决于训练设置。','各受控单位分散执行移动与战斗动作。','合作式 StarCraft II 微操场景，包含场景变化与团队表现评估。','评估范围为微操，而非完整游戏的宏观战略。原生 RL 接口不意味着已有 LLM 适配。','官方 README 记录了任务范围与原生多智能体强化学习使用方式，尚未独立复现。'],
'minedojo': ['视觉观测与取决于具体任务的环境信息。','通过模拟器 API 执行 Minecraft 底层控制。','面向开放式 Minecraft 研究的任务套件与模拟器；评估需明确所选任务及成功标准。','模拟器与知识语料本身并不意味着每种基础模型都有可直接运行的评估适配器。','已关联官方任务与模拟器文档。RL 使用方式来自收录论文，具体配置需进一步核查。'],
'smartplay': ['游戏描述、观测、手册与交互历史。','通过统一环境接口执行各游戏特定的动作。','六个游戏覆盖不同的智能体能力子集，汇总前应理解每个游戏及其设置。','各游戏的能力覆盖存在交叉。官方仓库已归档；代码可访问不等于安装已验证。','官方仓库标注于 2026-07-01 归档，链接于 2026-10-18 核查。'],
'collab-overcooked': ['任务与环境观测，以及智能体间通信。','通过基准框架进行通信与环境交互。','包含 30 个开放式任务，在任务结果之外提供面向协作过程的指标。','表现取决于任务与伙伴设置，过程指标需结合完成结果解读。','任务数量与协作重点由论文及官方仓库报告，未进行独立复现。'],
'procgen': ['RGB 像素。','离散游戏动作。','16 个程序生成环境；训练与测试关卡的选择是解释泛化结果的关键。','表现受关卡分布、难度与训练预算影响，报告结果时需保留这些条件。','环境数量与泛化研究目标见官方仓库。'],
'orak': ['根据游戏使用文字或视觉状态。','通过框架提供的游戏特定工具与控制接口执行动作。','包含 12 个游戏，提供各游戏得分及智能体模块研究；接口与资源因游戏而异。','套件包含策略场景并不表示每个游戏都测量战略规划，部分游戏需单独购买。','官方 README 记录了 12 个游戏及 LLM/VLM 支持，发表信息沿用关联文献记录。'],
'nethack': ['终端字符、字形与结构化状态信息。','离散 NetHack 动作。','学习环境包含任务特定的奖励与终止设置，比较时需固定任务与环境版本。','通过 BALROG 等独立套件评估 LLM，与 NLE 的原生支持是不同层次。','原生环境与学习设置见关联论文及仓库。'],
'hanabi': ['相对当前玩家的观测、公开信息与提示。','出牌、弃牌或给出合法提示。','该挑战与学习环境支持隐藏信息下的合作研究，需明确伙伴协议。','自博弈与陌生伙伴协作回答不同问题，高自博弈得分并不能证明稳健的交叉配对能力。','官方学习环境提供 RL 接口，本 demo 未审计其他智能体适配。'],
'football': ['根据配置使用视觉或结构化观测。','离散足球控制动作。','包含 Football Academy 场景与完整比赛，可配置智能体、奖励及对手。','协作结论取决于受控球员数量及其策略，各场景不可互换。','配置与观测选项见官方环境说明。'],
'rlcard': ['各游戏特定的编码观测与合法动作。','合法的离散卡牌动作。','包含多个游戏及基线智能体的平台，评估需明确游戏与对手配置。','统一接口不等于统一评估协议，此条目归类为研究平台。','平台范围与支持游戏见官方仓库。'],
'minigrid': ['局部符号网格或图像，取决于环境与包装器。','离散导航与物体交互动作。','面向目标的任务家族，任务选择与包装器决定观测及评估条件。','关联仓库为 MiniGrid，MiniWorld 是独立实现；能力要求因具体任务而异。','论文元数据涵盖两个环境家族，代码链接专门指向 MiniGrid 官方仓库。']}

def generate(records, path):
    import json
    from .game_catalog import GAME_TRANSLATIONS
    from .arena_catalog_additions import RECORD_ZH_ADDITIONS
    RECORD_ZH.update(RECORD_ZH_ADDITIONS)
    PAIRS.update(GAME_TRANSLATIONS)
    for r in records:
        pair(r['zh'],r['summary'])
        for field,zh in zip(['observation','action','protocol','limit','note'],RECORD_ZH[r['id']]):
            pair(zh,r[field])
    pair('研究平台','Research platform')
    pair('环境家族','Environment family')
    path.write_text('window.ATLAS_TRANSLATIONS = '+json.dumps(PAIRS,ensure_ascii=False,indent=2)+';\nwindow.ATLAS_EN_TO_ZH = '+json.dumps(EN_ALIASES,ensure_ascii=False,indent=2)+';\n')

for zh,en in [
('游戏智能体评估','GAME-BASED EVALUATION OF INTELLIGENT AGENTS'),('研究主题','Research themes'),
('02 / 基准目录','02 / BENCHMARK INDEX'),('分类体系与证据','TAXONOMY & EVIDENCE'),('游戏类别','GAME CATEGORIES'),
('收录范围与方法','SCOPE & METHODOLOGY'),('浏览 ↗','EXPLORE ↗'),
('16 个程序生成游戏','16 procedurally generated games'),('MineDojo 任务','MineDojo tasks'),
('12 个视频游戏，包括 Minecraft、StarCraft II 与 Baba Is You','12 video games, including Minecraft, StarCraft II and Baba Is You')]:
    # Keep the first translation for a Chinese label and register aliases separately.
    if zh not in PAIRS: pair(zh,en)

EN_ALIASES={
'SCOPE & METHODOLOGY':'收录范围与方法',
'TAXONOMY & EVIDENCE':'分类体系与证据',
'GAME CATEGORIES':'游戏类别',
'Strategy':'策略',
'GAME WORLD':'游戏场景',
'02 / BENCHMARK INDEX':'02 / 基准目录',
'Filters':'筛选',
'Agent':'智能体',
'Game Agent Benchmark Atlas home':'Game Agent Benchmark Atlas 首页',
}

pair('全量目录区分存量题录、本轮来源核验与深度档案。核验范围见各条目；收录或代码可用不代表已安装环境或复现实验。','The full index distinguishes existing bibliographic records, newly checked sources and detailed profiles. Consult each record for verification scope; inclusion and code availability do not imply installation or reproduction.')
