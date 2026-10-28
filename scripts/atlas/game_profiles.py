"""Game-scoped profiles. Sources checked 2026-10-18; no execution claims."""
from .game_catalog import t

def field(zh,en,source,locator):
    return dict(text=t(zh,en),source=source,locator=locator)
M='https://github.com/MineDojo/MineDojo#benchmarking-suite'
MI='https://docs.minedojo.org/sections/getting_started/sim.html#basic-observation-and-action-spaces'
S='https://arxiv.org/html/2310.01557v3#S3.SS7'
SP='https://arxiv.org/html/2310.01557v3#S4.SS1'
SM='https://arxiv.org/html/2310.01557v3#S4.SS2'
OM='https://github.com/krafton-ai/Orak/blob/release/docs/eval_metrics.md#minecraft'
OV='https://github.com/krafton-ai/Orak/blob/release/src/mcp_game_servers/minecraft/game/voyager_env.py'
C='https://github.com/YusaeMeow/Collab-Overcooked#install'
CM='https://github.com/YusaeMeow/Collab-Overcooked/blob/main/src/main.py'
CE='https://github.com/YusaeMeow/Collab-Overcooked/blob/main/src/eval_utils.py'
R='https://github.com/oxwhirl/smacv2#differences-to-smac'
RE='https://github.com/oxwhirl/smacv2/blob/main/smacv2/env/starcraft2/starcraft2.py'
OS='https://github.com/krafton-ai/Orak/blob/release/docs/eval_metrics.md#starcraft-ii'
OE='https://github.com/krafton-ai/Orak/blob/release/src/mcp_game_servers/star_craft/game/star_craft_env.py'
OC='https://github.com/krafton-ai/Orak/blob/release/src/mcp_agent_client/configs/star_craft/config.yaml'
OI='https://github.com/krafton-ai/Orak/blob/release/docs/setup_star_craft.md'
PROFILES={
('minecraft','minedojo'):dict(
 environment=field('Minecraft → MineDojo 模拟器 → 任务套件','Minecraft → MineDojo simulator → task suite',M,'Benchmarking Suite'),
 scope=field('Programmatic、Creative、Playthrough 三类任务；先选任务类别和明确目标，再定义评估。','Programmatic, Creative and Playthrough tasks; select the task family and objective before defining evaluation.',M,'Benchmarking Suite'),
 observation=field('RGB、位置与朝向、周边方块等；实际字段取决于传感器与任务配置。','RGB, position/orientation and nearby blocks; available fields depend on sensors and task configuration.',MI,'Basic observation and action spaces'),
 action=field('移动、镜头、攻击、使用与制作等复合离散控制。','Composite discrete controls for movement, camera, attack, use and crafting.',MI,'Action space'),
 metrics=field('Programmatic 任务可按模拟器状态自动评分；Creative 任务没有统一且容易自动化的成功判定。','Programmatic tasks support simulator-state-based automatic evaluation; Creative tasks lack a single readily automated success criterion.',M,'Programmatic / Creative Tasks'),
 integration=field('原生模拟器接口；文档记录 RL 研究使用。现成 LLM 评测适配未在此档案核验。','Native simulator interface with documented RL research use. A ready-made LLM evaluation adapter is not verified in this profile.',M,'Benchmarking Suite'),
 controls=field('选定任务、初始世界、资源、观测字段、动作封装和交互预算。','Selected task, initial world, resources, observation fields, action wrappers and interaction budget.',MI,'Observation / action configuration'),
 unknown=field('未固定发布版本；任务总量随文档版本不同，暂不合并统计。安装、种子与实际运行成本待核验。','No pinned release. Task counts differ across documentation versions and are not aggregated here. Installation, seeds and actual running costs remain unverified.',M,'Documentation scope'),
 fit=t('适合自定义多阶段目标和研究低层控制；需要自行明确任务成功标准。','Useful for custom multistage goals and low-level control; define task-specific success criteria.'),
 ),
('minecraft','smartplay'):dict(
 environment=field('Minecraft → MineDojo Creative FIND → SmartPlay 文本接口','Minecraft → MineDojo Creative FIND → SmartPlay text interface',S,'Paper §3.7'),
 scope=field('寻找指定生物群系的简化导航任务；不覆盖制作技术树或完整生存流程。','Simplified navigation to a specified biome; does not cover crafting progression or full survival.',S,'Paper §3.7'),
 observation=field('将视觉世界转换为文本描述，并提供任务说明与历史信息。','The visual world is converted to textual descriptions, with task instructions and history.',S,'Paper §3.7'),
 action=field('LLM 从 4 类动作中选择，由手写控制器执行。','The LLM chooses among four action categories, executed by a hand-coded controller.',S,'Paper §3.7'),
 metrics=field('找到目标生物群系的完成指示值与完成率；按本游戏报告。','Completion indicator and completion rate for finding the target biome; report this game separately.',SM,'Paper §4.2'),
 integration=field('官方语言智能体评测接口；底层接入 MineDojo。','Official language-agent evaluation interface built on MineDojo.',S,'Paper §3.7'),
 controls=field('原论文协议：历史长度 2、rollout 200、20 次试验。这些是论文设置，不代表当前代码默认值。','Paper protocol: history length 2, rollout 200, and 20 trials. These are paper settings, not verified current code defaults.',SP,'Paper §4.1'),
 unknown=field('论文任务与协议已核对；当前代码默认值、安装兼容性及运行状态未核验。仓库已归档。','Paper tasks and protocol checked; current code defaults, installation compatibility and execution remain unverified. The repository is archived.','https://github.com/microsoft/SmartPlay','Repository / archive status'),
 fit=t('适合研究语言观测下的空间导航；不能用来直接比较 Minecraft 制作能力。','Useful for spatial navigation with language observations; does not directly assess Minecraft crafting ability.'),
 ),
('minecraft','orak'):dict(
 environment=field('Minecraft → Voyager / Mineflayer → Orak','Minecraft → Voyager / Mineflayer → Orak',OV,'VoyagerEnv / MinecraftEnv'),
 scope=field('按 success_condition 配置制作目标。官方汇总指标列出 8 个目标，包括工作台、石镐、熔炉、水桶、金剑、钻石镐、附魔台与下界传送门。','Crafting targets configured by success_condition. The documented aggregate covers eight targets: crafting table, stone pickaxe, furnace, bucket, golden sword, diamond pickaxe, enchanting table and nether portal.',OM,'Minecraft'),
 observation=field('文本状态包含生物群系、附近方块与实体、生命、饥饿、位置、装备、库存及箱子信息。','Text state includes biome, nearby blocks/entities, health, hunger, position, equipment, inventory and chests.',OV,'MineCraftObs.to_text'),
 action=field('生成 JavaScript 异步函数，调用提供的控制技能。','Generate asynchronous JavaScript functions using provided control skills.',OV,'text2action'),
 metrics=field('官方汇总：完成的制作目标数 / 8 × 100。单任务 evaluator 按配置目标检查装备或库存；与汇总指标分开记录。','Documented aggregate: completed crafting targets / 8 × 100. The single-task evaluator checks configured targets in equipment or inventory; record it separately from the aggregate.',OM,'Minecraft; evaluator linked below'),
 integration=field('官方 Voyager 适配与语言智能体控制；该档案按文本接口记录。','Official Voyager adaptation and language-agent control; this profile records the text interface.',OV,'get_game_info / text2action'),
 controls=field('制作目标、初始世界与库存、技能库、代码执行限制、提示词及调用预算。','Crafting target, initial world/inventory, skill library, code-execution constraints, prompts and inference budget.',OV,'MinecraftEnv / evaluate'),
 unknown=field('下界传送门目标如何对应通用库存检查尚未确认；未固定提交，安装与运行成本未核验。','How the nether-portal target maps to the generic inventory check remains unresolved. No pinned commit; installation and running costs unverified.',OV,'MineCraftObs.evaluate / MinecraftEnv.evaluate'),
 fit=t('适合研究代码技能调用与制作目标执行；与 MineDojo 低层动作或 SmartPlay 导航的分数不可直接互换。','Useful for code-skill use and crafting-goal execution; scores are not interchangeable with MineDojo low-level control or SmartPlay navigation.'),
 ),
('overcooked','collab-overcooked'):dict(
 environment=field('Overcooked → 修改后的 Overcooked-AI → Collab-Overcooked','Overcooked → modified Overcooked-AI → Collab-Overcooked',C,'Install'),
 scope=field('两名厨师 / 助手协作完成订单；修改版研究环境扩展菜谱与食材。','Two cooks / assistants collaborate on orders; the modified research environment extends recipes and ingredients.',C,'Install / environment modifications'),
 observation=field('订单、环境状态、可用技能与自然语言沟通信息。','Orders, environment state, available skills and natural-language communication.',CM,'main / agent interaction'),
 action=field('技能执行与通信；main.py 将联合动作送入环境推进。','Skill execution and communication; main.py advances the environment with joint actions.',CM,'Joint-action environment step'),
 metrics=field('任务结果：成功率、成功轨迹的完成时间步。协作过程：参考动作序列相似度 / 冗余、发起与响应协作统计。时间步不是墙钟延迟。','Task outcomes: success rate and completion timestep for successful trajectories. Collaboration process: reference-action sequence similarity/redundancy and initiation/response statistics. Timesteps are not wall-clock latency.',CE,'compute_task_metrics / evaluate / evaluate_collaboration'),
 integration=field('官方 LLM 多智能体框架；原生 RL 对照接口尚未核验。','Official LLM multi-agent framework; a native RL comparison interface has not been verified.',CM,'Agent setup'),
 controls=field('菜谱、布局、伙伴模型、通信规则、时限和参考动作序列。安装示例的 horizon 不是统一评测预算。','Recipe, layout, partner models, communication rules, horizon and reference action sequence. The installation example horizon is not a universal evaluation budget.',CM,'Arguments / environment setup'),
 unknown=field('未固定提交或复现实验；过程指标不等于独立人工评价，需结合任务完成结果。','No pinned commit or independent reproduction. Process metrics are not independent human evaluation and should be read alongside task outcomes.',CE,'Evaluation implementation'),
 fit=t('适合分析语言智能体如何分工、发起和响应协作；同时观察任务结果与交互过程。','Useful for analyzing division of work and collaboration initiation/response, alongside task outcomes.'),
 ),
('starcraft-ii','smacv2'):dict(
 environment=field('StarCraft II → SMACv2 微操环境 → 随机场景','StarCraft II → SMACv2 micromanagement environment → randomized scenarios',R,'Differences to SMAC'),
 scope=field('去中心化多智能体微操战斗；随机初始位置与单位构成，不覆盖完整 RTS 的建造和运营。','Decentralized multi-agent micromanagement with randomized starting positions and unit composition; excludes full RTS construction and economy.',R,'Differences to SMAC'),
 observation=field('每个单位的局部观测；全局状态、视野与附加特征由配置决定。','Local observations per unit; global state, sight range and additional features depend on configuration.',RE,'StarCraft2Env.__init__ / get_obs'),
 action=field('单位级移动、停止、攻击或治疗，带可用动作约束。','Unit-level movement, stop, attack or heal, subject to available-action constraints.',RE,'get_avail_agent_actions'),
 metrics=field('团队胜率：battles_won / battles_game；另记录超时等统计。','Team win rate: battles_won / battles_game; additional statistics include timeouts.',RE,'get_stats'),
 integration=field('原生 cooperative MARL 接口；LLM 适配在本档案中未核验。','Native cooperative MARL interface; LLM adaptations are not verified in this profile.',R,'SMACv2'),
 controls=field('capability config、单位数量与分布、视野、地图、StarCraft II 版本及环境步进。','Capability configuration, unit counts/distributions, sight range, map, StarCraft II version and environment stepping.',RE,'StarCraft2Env.__init__'),
 unknown=field('需要 StarCraft II 与地图资源；未安装或运行，未固定配置、种子及训练预算。','Requires StarCraft II and map assets; not installed or run. Configuration, seeds and training budget are not pinned.',R,'Installation / configuration'),
 fit=t('适合局部观测下的团队协同控制与场景变化研究；不用于直接评价完整游戏宏观战略。','Useful for team control under partial observability and changing scenarios; not a direct full-game macro-strategy evaluation.'),
 ),
('starcraft-ii','orak'):dict(
 environment=field('StarCraft II → Orak 游戏接口 → 1v1 对 AI 对局','StarCraft II → Orak game interface → 1v1 versus an AI bot',OE,'StarCraftEnv'),
 scope=field('完整 1v1 对内置 AI 的对局；示例配置为 Protoss 对 Zerg，不据此推定覆盖所有种族。','Full 1v1 matches against a built-in AI; the example config is Protoss versus Zerg, which does not establish coverage of all races.',OC,'env / agent configuration'),
 observation=field('文本摘要包含资源、建筑、单位、科研、进行中动作及敌人信息；源码另有可选图像输入。','Text summaries include resources, buildings, units, research, ongoing actions and enemy information; the implementation also has optional image input.',OE,'Observation construction'),
 action=field('从预定义的高层动作词典中选择动作。','Choose actions from a predefined high-level action dictionary.',OE,'Action handling'),
 metrics=field('对 AI bot 的胜场 / 总场次 × 100。与 SMACv2 微操胜率的评估单位不同。','Wins against the AI bot / total matches × 100. The evaluation unit differs from SMACv2 micromanagement win rate.',OS,'StarCraft II'),
 integration=field('官方游戏适配；SC2 安装文档将 MCP 运行方式标为 Work in Progress，不能据套件宣传认定此模式可直接使用。','Official game adaptation; SC2 setup documentation marks MCP mode as Work in Progress. Suite-level claims do not establish that this mode is ready to use.',OI,'Play modes / MCP'),
 controls=field('地图、双方种族、AI 难度与风格、查询间隔、动作批量、观测模态及模型预算。','Map, player/opponent races, AI difficulty/style, query interval, action batch, observation modality and model budget.',OC,'Configuration'),
 unknown=field('MCP 模式完成度、安装兼容性与实际运行成本未核验；未固定提交或复现实验。','MCP-mode readiness, installation compatibility and actual running costs remain unverified; no pinned commit or independent reproduction.',OI,'Setup status'),
 fit=t('适合研究高层策略动作与完整对局执行；与 SMACv2 比较时应对照研究范围，而非直接比较胜率。','Useful for high-level strategic actions and full-match execution. Compare research scope with SMACv2 rather than ranking their win rates.'),
 ),
}
NOTES={
'minecraft':('任务平台、biome 导航与代码制作任务是三种评估单位。先选择目标与动作层级，再比较指标；SmartPlay 使用 MineDojo，不能把共享基础设施计作独立环境。','A task platform, biome navigation and code-based crafting are different evaluation units. Select the objective and action level before comparing metrics. SmartPlay uses MineDojo; shared infrastructure is not an independent environment.'),
'overcooked':('先区分游戏、研究环境与评测基准。任务完成结果和协作过程指标分列；固定伙伴、菜谱与布局后再做对照。','Distinguish the game, research environment and benchmark. Separate task outcomes from collaboration-process metrics and align partners, recipes and layouts.'),
'starcraft-ii':('先选择团队微操或完整 1v1 对局。两者都报告胜率，但控制主体、动作抽象与对手设置不同，不能直接据此排名。','Choose team micromanagement or full 1v1 matches first. Both report win rates, but control units, action abstraction and opponents differ; their scores cannot directly rank performance.'),
}
def enrich_profiles(games):
    for g in games:
        if g['id'] in NOTES:g['comparisonNote']=t(*NOTES[g['id']])
        for l in g['links']:
            p=PROFILES.get((g['id'],l['benchmark']))
            if p:
                l['profile']={**p,'checked':'2026-10-18','versionPinned':False,'executionVerified':False}
                l['scope']=p['scope']['text']
                if (g['id'],l['benchmark'])==('minecraft','smartplay'):
                    l['focus']=t('空间导航 · 语言观测 · 探索','Spatial navigation · Language observations · Exploration')
                    l['caps']=['exploration']
                if (g['id'],l['benchmark'])==('minecraft','orak'):l['focus']=t('代码技能 · 制作目标 · 依赖执行','Code skills · Crafting targets · Prerequisite execution')
                if (g['id'],l['benchmark'])==('starcraft-ii','orak'):
                    l['agents']=['LLM','VLM']
                    l['focus']=t('完整对局 · 高层策略动作','Full matches · High-level strategic actions')
