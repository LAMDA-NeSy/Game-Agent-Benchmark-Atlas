/* Generated from arena-task-catalog.json. */
(function(root){const data={
  "version": "representative-suite-v17",
  "checkedAt": "2026-10-18",
  "dimensions": [
    {
      "id": "long-horizon",
      "label": {
        "zh": "长时程",
        "en": "Long horizon"
      },
      "definition": {
        "zh": "跨多个阶段持续推进目标",
        "en": "Sustain progress across multiple stages"
      }
    },
    {
      "id": "planning",
      "label": {
        "zh": "规划",
        "en": "Planning"
      },
      "definition": {
        "zh": "处理前置依赖与行动顺序",
        "en": "Resolve dependencies and action order"
      }
    },
    {
      "id": "coordination",
      "label": {
        "zh": "协作",
        "en": "Coordination"
      },
      "definition": {
        "zh": "分工、沟通与联合执行",
        "en": "Divide work, communicate and act jointly"
      }
    },
    {
      "id": "strategy",
      "label": {
        "zh": "策略",
        "en": "Strategy"
      },
      "definition": {
        "zh": "在对手与资源约束下作出取舍",
        "en": "Make trade-offs under opponents and resource limits"
      }
    },
    {
      "id": "memory",
      "label": {
        "zh": "记忆",
        "en": "Memory"
      },
      "definition": {
        "zh": "保留并使用当前观测之外的信息",
        "en": "Retain and use information absent from the current observation"
      }
    },
    {
      "id": "exploration",
      "label": {
        "zh": "探索",
        "en": "Exploration"
      },
      "definition": {
        "zh": "通过交互获取未知信息",
        "en": "Acquire unknown information through interaction"
      }
    },
    {
      "id": "generalization",
      "label": {
        "zh": "泛化",
        "en": "Generalization"
      },
      "definition": {
        "zh": "在明确划分的未见配置上评估",
        "en": "Evaluate on explicitly held-out configurations"
      }
    },
    {
      "id": "social",
      "label": {
        "zh": "社会推理",
        "en": "Social reasoning"
      },
      "definition": {
        "zh": "推断伙伴的信息与意图",
        "en": "Infer a partner’s information and intent"
      }
    },
    {
      "id": "control",
      "label": {
        "zh": "感知控制",
        "en": "Perception & control"
      },
      "definition": {
        "zh": "将空间观测转化为有效动作",
        "en": "Turn spatial observations into effective actions"
      }
    }
  ],
  "tasks": [
    {
      "id": "crafter-progress",
      "benchmark": "balrog",
      "game": "crafter",
      "title": {
        "zh": "Crafter · 生存与进展",
        "en": "Crafter · Survival & progress"
      },
      "primary": "long-horizon",
      "secondary": [
        "planning",
        "exploration"
      ],
      "core": true,
      "track": "language",
      "scope": {
        "zh": "选择 BALROG 中的 Crafter 子环境；固定一组进展目标及单局预算。",
        "en": "Select the Crafter environment in BALROG; fix a set of progression goals and an episode budget."
      },
      "why": {
        "zh": "生存约束与资源获取贯穿多个阶段，适合观察目标是否持续推进。长时程表现同时依赖探索与控制，不能单独归因于记忆。",
        "en": "Survival and resource acquisition span multiple stages, making sustained progress observable. Exploration and control also affect outcomes; this is not an isolated memory test."
      },
      "interface": {
        "zh": "沿用 BALROG 的 Crafter 观测与动作适配；模态、历史窗口和动作粒度须固定。",
        "en": "Use BALROG’s Crafter observation/action adapter; pin modality, history window and action granularity."
      },
      "metric": {
        "zh": "任务指标：目标或成就达成情况。Arena 建议补充：阶段首次达成时间、无进展区间与重复动作。",
        "en": "Task measures: goal or achievement completion. Proposed Arena diagnostics: first milestone times, stalls and repeated actions."
      },
      "controls": {
        "zh": "固定种子、目标清单、单局预算、历史窗口与环境版本；不能以一次存活或单个成就代表长期执行能力。",
        "en": "Fix seeds, goal list, episode budget, history window and environment version. One survival episode or achievement is insufficient."
      },
      "pending": {
        "zh": "需固定具体目标、适配器版本和终止条件，接入轨迹记录后验证。",
        "en": "Pin concrete goals, adapter version and termination; integrate and validate trace recording."
      },
      "source": "https://github.com/balrog-ai/BALROG",
      "docs": "https://github.com/balrog-ai/BALROG/blob/main/docs/evaluation.md",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "factorio-production",
      "benchmark": "fle",
      "game": "factorio",
      "title": {
        "zh": "Factorio · 持续生产",
        "en": "Factorio · Sustained production"
      },
      "primary": "long-horizon",
      "secondary": [
        "planning",
        "strategy"
      ],
      "core": true,
      "track": "language",
      "scope": {
        "zh": "FLE Open-play 工厂扩展：从初始资源持续发展生产链；Arena 拟固定阶段目标与评估预算。",
        "en": "FLE Open-play factory expansion: develop production chains from initial resources; Arena proposes fixed milestones and evaluation budgets."
      },
      "why": {
        "zh": "持续运转的生产链补充 Crafter 的生存进展；可检查建成之后是否仍能维护目标产出。",
        "en": "A running production chain complements Crafter survival progression and tests whether target output is maintained after construction."
      },
      "interface": {
        "zh": "Python 代码与工具接口，使用执行输出和错误反馈；不等同于像素加键鼠操作。",
        "en": "Python code/tools with execution output and error feedback; distinct from pixel-and-keyboard control."
      },
      "metric": {
        "zh": "保留所固定版本的生产分数；拟议补充阶段达成、稳定吞吐、修复次数与停滞。分数定义与测量窗口须随结果记录。",
        "en": "Retain the pinned version’s production score; proposed diagnostics include milestones, sustained throughput, repairs and stalls. Record scoring definitions and measurement windows."
      },
      "controls": {
        "zh": "固定地图、初始库存、科技、API、阶段目标及计量窗口；程序提交数和游戏时间分别记录。",
        "en": "Fix map, inventory, technology, API, milestones and measurement window; record program submissions separately from game time."
      },
      "pending": {
        "zh": "需固定 Open-play 配置与评估版本，验证无界面服务和计分；论文协议与后续 SDK 版本分开标记。",
        "en": "Pin Open-play configuration and evaluator version; validate headless service and scoring. Distinguish paper protocols from later SDK releases."
      },
      "source": "https://github.com/JackHopkins/factorio-learning-environment",
      "docs": "https://proceedings.neurips.cc/paper_files/paper/2025/hash/75f3a62e55187bc3e5e5961fa2a46bcf-Abstract-Datasets_and_Benchmarks_Track.html",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "hanoi-order",
      "benchmark": "smartplay",
      "game": "tower-of-hanoi",
      "title": {
        "zh": "汉诺塔 · 依赖与顺序",
        "en": "Tower of Hanoi · Dependencies"
      },
      "primary": "planning",
      "secondary": [
        "memory"
      ],
      "core": true,
      "track": "language",
      "scope": {
        "zh": "从 SmartPlay 汉诺塔开始，采用三盘任务作为首个候选配置。",
        "en": "Start with SmartPlay’s Tower of Hanoi, using a three-disk task as the initial candidate configuration."
      },
      "why": {
        "zh": "规则清楚，移动存在前置依赖，可检查计划是否可执行，以及错误后能否恢复。熟悉的谜题仍可能受到先验解题知识影响。",
        "en": "Explicit rules and dependencies expose executable planning and recovery. Prior knowledge of this familiar puzzle can affect performance."
      },
      "interface": {
        "zh": "文本状态与规则说明；通过环境规定的移动动作操作圆盘。",
        "en": "Text state and rules; move disks through the environment’s action interface."
      },
      "metric": {
        "zh": "任务指标：完成情况。Arena 建议补充：合法移动数、无效动作及相对于最短解的额外步数。",
        "en": "Task measure: completion. Proposed Arena diagnostics: legal moves, invalid actions and excess steps over an optimal solution."
      },
      "controls": {
        "zh": "固定盘数、初始位置、动作预算、规则与历史可见范围；明确是否允许外部求解器。",
        "en": "Fix disk count, initial state, action budget, rules and visible history; declare any external solver access."
      },
      "pending": {
        "zh": "需核对当前实现配置并固定版本；SmartPlay 仓库已归档，安装可用性待验证。",
        "en": "Verify implementation configuration and pin a version. SmartPlay is archived; installation remains unverified."
      },
      "source": "https://github.com/microsoft/SmartPlay",
      "docs": "https://arxiv.org/html/2310.01557v3#S3.SS4",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "overcooked-team",
      "benchmark": "collab-overcooked",
      "game": "overcooked",
      "title": {
        "zh": "Overcooked-AI · 协作烹饪",
        "en": "Overcooked-AI · Joint cooking"
      },
      "primary": "coordination",
      "secondary": [
        "planning",
        "social"
      ],
      "core": true,
      "track": "language",
      "scope": {
        "zh": "采用 Collab-Overcooked 扩展环境中的双 Agent 配方任务；固定布局、角色与菜谱。",
        "en": "Use a two-agent recipe task in the extended Collab-Overcooked environment; fix layout, roles and recipe."
      },
      "why": {
        "zh": "共享工作空间与依赖步骤使分工和通信直接影响任务完成。其扩展配方与原版 Overcooked-AI 并不等同。",
        "en": "Shared space and dependent steps make division of work and communication consequential. Extended recipes differ from base Overcooked-AI."
      },
      "interface": {
        "zh": "环境状态、角色任务与 Agent 间通信；动作使用该框架的交互接口。",
        "en": "Environment state, role tasks and inter-agent messages; actions use this framework’s interaction interface."
      },
      "metric": {
        "zh": "文档指标：任务成功、成功任务步数与协作过程统计。Arena 建议同时报告失败率、重复劳动和等待片段。",
        "en": "Documented measures: task success, steps on successful tasks and collaboration-process statistics. Also report failures, duplicated work and waiting intervals."
      },
      "controls": {
        "zh": "固定配方、布局、伙伴、通信规则和预算；自我配对与跨模型配对分开报告。",
        "en": "Fix recipe, layout, partner, communication rules and budget; report self-pairing and cross-model pairing separately."
      },
      "pending": {
        "zh": "需选定具体配方与参考动作，固定伙伴协议；双 Agent 团队表现不直接等于单模型能力。",
        "en": "Select a concrete recipe and reference actions; pin partner protocols. Team outcomes do not directly identify an individual model’s ability."
      },
      "source": "https://github.com/YusaeMeow/Collab-Overcooked",
      "docs": "https://github.com/YusaeMeow/Collab-Overcooked/blob/main/src/eval_utils.py",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "overcooked-zsc",
      "benchmark": "zsc-eval",
      "game": "overcooked",
      "title": {
        "zh": "Overcooked-AI · 陌生伙伴",
        "en": "Overcooked-AI · Unseen partners"
      },
      "primary": "coordination",
      "secondary": [
        "generalization",
        "social"
      ],
      "core": true,
      "track": "structured",
      "scope": {
        "zh": "采用 ZSC-Eval 的 Overcooked-AI 场景及固定评测伙伴池，测试未配合训练过的伙伴。",
        "en": "Use a ZSC-Eval Overcooked-AI scenario and fixed evaluation partner pool to test partners not jointly trained with the agent."
      },
      "why": {
        "zh": "补充 Collab-Overcooked 的语言协作过程，区分“会和自己配合”与“能适应不同伙伴”。",
        "en": "Complements Collab-Overcooked’s language collaboration with a distinct test of adaptation to diverse partners beyond self-pairing."
      },
      "interface": {
        "zh": "环境观测与同步动作，接入固定策略伙伴；语言 Agent 需要独立适配，不默认具备聊天通道。",
        "en": "Environment observations and simultaneous actions with fixed policy partners; language agents need a separate adapter, without an assumed chat channel."
      },
      "metric": {
        "zh": "文档指标包括团队回报与 Best-Response Proximity。报告伙伴分布、区间估计和参考策略；归一化值不保证严格小于 1。",
        "en": "Documented measures include team return and Best-Response Proximity. Report partner distribution, uncertainty and reference policies; normalization is not a strict bound of one."
      },
      "controls": {
        "zh": "固定布局、伙伴池、伙伴训练预算、角色交换与最佳回应参照；伙伴多样性影响结论。",
        "en": "Fix layout, partner pool, partner training budget, role swaps and best-response reference; partner diversity affects conclusions."
      },
      "pending": {
        "zh": "需锁定伙伴检查点及观测/动作适配，验证与 Collab-Overcooked 的环境差异；分别计分。",
        "en": "Pin partner checkpoints and observation/action adapters; verify environment differences from Collab-Overcooked and score separately."
      },
      "source": "https://github.com/sjtu-marl/ZSC-Eval",
      "docs": "https://github.com/sjtu-marl/ZSC-Eval#how-to-use-zsc-eval-for-evaluating-zsc-algorithms",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "sc2-match",
      "benchmark": "orak",
      "game": "starcraft-ii",
      "title": {
        "zh": "星际争霸 II · 完整对局",
        "en": "StarCraft II · Full match"
      },
      "primary": "strategy",
      "secondary": [
        "planning",
        "long-horizon"
      ],
      "core": true,
      "track": "language",
      "scope": {
        "zh": "采用 Orak 的 StarCraft II 完整 1v1 对局，对手为固定配置的游戏 AI。",
        "en": "Use Orak’s full StarCraft II 1v1 match against a game AI with a fixed configuration."
      },
      "why": {
        "zh": "经济、生产、科技与战斗需要共同取舍，补充微操任务无法覆盖的宏观决策。",
        "en": "Economy, production, technology and combat create trade-offs beyond micromanagement scenarios."
      },
      "interface": {
        "zh": "通过 Orak 的游戏状态与动作工具交互；具体模态、查询间隔和动作批量须固定。",
        "en": "Use Orak’s game-state and action tools; pin modality, query interval and action batching."
      },
      "metric": {
        "zh": "文档指标：胜率。Arena 建议补充：资源利用、发展阶段、决策延迟和停滞轨迹；须先验证记录器。",
        "en": "Documented measure: win rate. Proposed diagnostics: resource use, development stages, latency and stalls; recorders need validation."
      },
      "controls": {
        "zh": "固定地图、双方种族、AI 难度与风格、决策频率和预算；不与 SMACv2 微操胜率混合。",
        "en": "Fix map, races, AI difficulty/style, decision frequency and budget. Do not pool this win rate with SMACv2 micromanagement."
      },
      "pending": {
        "zh": "需安装游戏、固定配置并验证 Orak 适配；仓库中 SC2 的 MCP 路线仍标注开发中。",
        "en": "Game installation, pinned configuration and adapter validation are required; the SC2 MCP path is marked work in progress."
      },
      "source": "https://github.com/krafton-ai/Orak",
      "docs": "https://github.com/krafton-ai/Orak/blob/release/docs/eval_metrics.md#starcraft-ii",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "memorygym-sequence",
      "benchmark": "memory-gym",
      "game": "memory-gym",
      "title": {
        "zh": "Mortar Mayhem · 累积序列",
        "en": "Mortar Mayhem · Growing sequences"
      },
      "primary": "memory",
      "secondary": [
        "control"
      ],
      "core": true,
      "track": "visual",
      "scope": {
        "zh": "Memory Gym 的 Endless-MortarMayhem-v0：新指令逐次加入，Agent 需要重演累积序列。",
        "en": "Memory Gym’s Endless-MortarMayhem-v0: newly revealed commands extend a sequence the agent must replay."
      },
      "why": {
        "zh": "相比单个线索的延迟匹配，可观察记忆负荷增长后的表现。Minigrid Memory 保留为较简单的诊断对照。",
        "en": "Growing memory load complements single-cue delayed matching; MiniGrid Memory remains a simpler diagnostic alternative."
      },
      "interface": {
        "zh": "视觉观测与移动动作；固定帧采样和动作重复。引擎真值仅供诊断，不能进入 Agent 输入。",
        "en": "Visual observations and movement actions; fix frame sampling and action repeat. Engine ground truth is diagnostic only, never agent input."
      },
      "metric": {
        "zh": "记录正确完成的指令序列长度；建议另报不同负荷下的错误、动作延迟与截断情况。",
        "en": "Record correctly completed sequence length; also report errors by load, action latency and truncation."
      },
      "controls": {
        "zh": "固定有限/无终点变体、显示时长、执行时序、历史访问与预算；区分记忆失败和控制失败。",
        "en": "Pin finite/endless variant, display duration, execution timing, history access and budget; distinguish memory and control failures."
      },
      "pending": {
        "zh": "需锁定版本、任务配置和视觉适配，验证真值隔离；未安装或运行。",
        "en": "Pin version, task configuration and visual adapter; validate ground-truth isolation. Not installed or run."
      },
      "source": "https://github.com/MarcoMeter/endless-memory-gym",
      "docs": "https://www.jmlr.org/papers/v26/24-0043.html",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "bandit-learning",
      "benchmark": "smartplay",
      "game": "two-armed-bandit",
      "title": {
        "zh": "双臂老虎机 · 交互学习",
        "en": "Two-armed bandit · Online learning"
      },
      "primary": "exploration",
      "secondary": [
        "memory",
        "strategy"
      ],
      "core": true,
      "track": "language",
      "scope": {
        "zh": "SmartPlay 双臂老虎机：收益概率未知，通过多轮选择获取反馈。",
        "en": "SmartPlay’s two-armed bandit: infer unknown reward probabilities through repeated choices and feedback."
      },
      "why": {
        "zh": "提供低控制负担的探索—利用取舍，与开放世界的空间探索互补。它不覆盖导航式探索。",
        "en": "A low-control test of exploration–exploitation complements spatial exploration; it does not test navigation exploration."
      },
      "interface": {
        "zh": "文本历史、每轮动作和收益反馈；选择两臂之一。",
        "en": "Text history, per-round choices and reward feedback; select one of two arms."
      },
      "metric": {
        "zh": "任务指标：累计收益。Arena 建议补充：已知生成概率下的遗憾值与选择比例，需明确定义估计方式。",
        "en": "Task measure: cumulative reward. Proposed additions: regret under known generation probabilities and arm-choice ratios, with explicit estimators."
      },
      "controls": {
        "zh": "固定轮数、概率差、收益幅度和反馈格式；随机交换臂顺序并匹配随机种子。",
        "en": "Fix rounds, probability gap, reward magnitude and feedback format; randomize arm ordering and match seeds."
      },
      "pending": {
        "zh": "需固定具体概率配置、轮数和随机数协议；仓库已归档，运行依赖待验证。",
        "en": "Pin probabilities, rounds and random-number protocol; the repository is archived and runtime dependencies are unverified."
      },
      "source": "https://github.com/microsoft/SmartPlay",
      "docs": "https://arxiv.org/html/2310.01557v3#S3.SS2",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "alchemy-discovery",
      "benchmark": "alchemy",
      "game": "alchemy",
      "title": {
        "zh": "Alchemy · 隐藏规则发现",
        "en": "Alchemy · Hidden-rule discovery"
      },
      "primary": "exploration",
      "secondary": [
        "memory",
        "planning"
      ],
      "core": true,
      "track": "structured",
      "scope": {
        "zh": "采用符号版 Alchemy：在同一 episode 的多次 trial 中，通过石头与药水的交互推断隐藏变换规则。",
        "en": "Use symbolic Alchemy: infer hidden transformation rules through stone–potion interactions across trials within an episode."
      },
      "why": {
        "zh": "补充老虎机的简单探索—利用选择，研究结构化规则发现及后续利用。符号版减少视觉和移动的干扰。",
        "en": "Adds structured rule discovery and subsequent use beyond bandit exploration–exploitation; the symbolic variant reduces visual and movement demands."
      },
      "interface": {
        "zh": "石头/药水特征与离散交互；隐藏 chemistry 不向 Agent 提供，trial 间保留允许的记忆。",
        "en": "Stone/potion features and discrete interactions; withhold hidden chemistry and retain permitted memory across trials."
      },
      "metric": {
        "zh": "报告 episode 回报及逐 trial 回报曲线；信息获取诊断需单独定义，不把规则真值作为普通输入。",
        "en": "Report episode return and per-trial curves; define information-gain diagnostics separately and exclude rule ground truth from normal inputs."
      },
      "controls": {
        "zh": "固定 chemistry 分布、训练/测试划分、trial 数与记忆重置边界；符号和 3D 版本分开报告。",
        "en": "Fix chemistry distribution, train/test splits, trial count and memory-reset boundaries; report symbolic and 3D variants separately."
      },
      "pending": {
        "zh": "官方仓库已归档；需核实符号版依赖、固定生成器与适配接口，不能直接声称支持所有 LLM。",
        "en": "The official repository is archived; verify symbolic dependencies, pin the generator and implement the adapter. Universal LLM support is not established."
      },
      "source": "https://github.com/google-deepmind/dm_alchemy",
      "docs": "https://datasets-benchmarks-proceedings.neurips.cc/paper/2021/hash/a3f390d88e4c41f2747bfa2f1b5f87db-Abstract-round2.html",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "coinrun-heldout",
      "benchmark": "procgen",
      "game": "procgen-coinrun",
      "title": {
        "zh": "CoinRun · 未见关卡",
        "en": "CoinRun · Held-out levels"
      },
      "primary": "generalization",
      "secondary": [
        "control"
      ],
      "core": true,
      "track": "visual",
      "scope": {
        "zh": "从 Procgen 选择 CoinRun；在明确隔离的关卡范围上评测到达金币的能力。",
        "en": "Select CoinRun from Procgen; evaluate reaching the coin on explicitly held-out level ranges."
      },
      "why": {
        "zh": "程序生成关卡提供可复现的分布划分，适合检查是否只记住训练布局。仅更换种子不自动构成有效泛化实验。",
        "en": "Procedural levels support reproducible splits for testing layout memorization. A seed change alone does not establish a valid generalization experiment."
      },
      "interface": {
        "zh": "原生 64×64 RGB 观测与离散动作；LLM 适配需另行定义动作重复和帧采样。",
        "en": "Native 64×64 RGB observations and discrete actions; LLM adaptation requires explicit action repeat and frame sampling."
      },
      "metric": {
        "zh": "环境回报与关卡完成情况；分别报告训练范围和未见范围的表现及差距。",
        "en": "Environment return and level completion; report training-range and held-out performance plus the gap."
      },
      "controls": {
        "zh": "固定 distribution_mode、关卡范围、训练/适应预算与评测样本；零样本 LLM 和训练后 RL 分轨比较。",
        "en": "Fix distribution_mode, level ranges, training/adaptation budget and evaluation sample. Separate zero-shot LLM and trained RL tracks."
      },
      "pending": {
        "zh": "需锁定训练/适应/测试划分与环境版本，并实现像素控制适配。",
        "en": "Pin training/adaptation/test splits and the environment version; implement the visual-control adapter."
      },
      "source": "https://github.com/openai/procgen",
      "docs": "https://github.com/openai/procgen#environment-options",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "hanabi-partner",
      "benchmark": "hanabi",
      "game": "hanabi",
      "title": {
        "zh": "Hanabi · 隐藏信息协作",
        "en": "Hanabi · Hidden-information cooperation"
      },
      "primary": "social",
      "secondary": [
        "coordination",
        "strategy"
      ],
      "core": true,
      "track": "structured",
      "scope": {
        "zh": "采用 Hanabi Learning Environment；候选方案固定为双人局，并区分自我配对与跨伙伴评测。",
        "en": "Use the Hanabi Learning Environment; propose a fixed two-player setup with separate self-play and cross-partner evaluation."
      },
      "why": {
        "zh": "自身手牌隐藏，线索有限；选择提示和行动需要考虑伙伴可见的信息。约定学习与记忆也会影响结果。",
        "en": "Hidden own cards and limited clues require reasoning about a partner’s information. Learned conventions and memory also affect outcomes."
      },
      "interface": {
        "zh": "按玩家视角的结构化观测与合法动作；语言描述层需单独记录。",
        "en": "Player-specific structured observations and legal actions; any language-description layer must be documented separately."
      },
      "metric": {
        "zh": "任务指标：团队游戏得分。Arena 建议分别报告固定伙伴池中的均值、离散程度和跨伙伴表现。",
        "en": "Task measure: team game score. Report mean, dispersion and cross-partner performance over a fixed partner pool."
      },
      "controls": {
        "zh": "固定玩家数、牌局种子、线索规则、伙伴池及约定访问权限；不能把团队得分直接归因于一个 Agent。",
        "en": "Fix player count, deal seeds, clue rules, partner pool and convention access. Team scores do not identify one agent’s contribution."
      },
      "pending": {
        "zh": "需确定伙伴池、语言适配和自我/跨伙伴协议，并检查隐藏信息边界。",
        "en": "Specify partner pool, language adapter and self-/cross-play protocols; validate hidden-information boundaries."
      },
      "source": "https://github.com/google-deepmind/hanabi-learning-environment",
      "docs": "https://arxiv.org/abs/1902.00506",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "dodgeball-control",
      "benchmark": "procgen",
      "game": "procgen-dodgeball",
      "title": {
        "zh": "Dodgeball · 空间控制",
        "en": "Dodgeball · Spatial control"
      },
      "primary": "control",
      "secondary": [
        "strategy"
      ],
      "core": true,
      "track": "visual",
      "scope": {
        "zh": "从 Procgen 选择 Dodgeball；固定难度与关卡范围，观察移动、朝向和投掷行为。",
        "en": "Select Dodgeball from Procgen; fix difficulty and level ranges, and inspect movement, orientation and throwing."
      },
      "why": {
        "zh": "空间布局和面向方向直接影响行动效果，补充文本策略任务中较弱的感知与控制要求。",
        "en": "Spatial layout and facing direction affect action outcomes, complementing the lighter control demands of text strategy tasks."
      },
      "interface": {
        "zh": "原生 RGB 观测与离散动作；动作重复、帧采样和延迟必须进入协议。",
        "en": "Native RGB observations and discrete actions; action repeat, frame sampling and latency belong in the protocol."
      },
      "metric": {
        "zh": "任务指标：回报与关卡完成情况。Arena 建议补充：动作频率、决策延迟和失败轨迹分类。",
        "en": "Task measures: return and level completion. Proposed additions: action frequency, decision latency and failure-trace categories."
      },
      "controls": {
        "zh": "固定关卡分布、难度、观测频率、动作粒度和训练预算；暂停式与实时控制不可直接排名。",
        "en": "Fix level distribution, difficulty, observation rate, action granularity and training budget. Paused and real-time control are not directly rankable."
      },
      "pending": {
        "zh": "需实现控制适配并验证时间推进方式；这一个游戏不能代表全部视觉运动技能。",
        "en": "Implement the control adapter and validate time advancement. One game cannot represent all visuomotor skills."
      },
      "source": "https://github.com/openai/procgen",
      "docs": "https://github.com/openai/procgen#environment-descriptions",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "vizdoom-deadly-corridor",
      "benchmark": "SUP-vizdoom",
      "game": "doom",
      "title": {
        "zh": "ViZDoom：致命走廊",
        "en": "ViZDoom: Deadly Corridor"
      },
      "primary": "control",
      "secondary": [
        "strategy"
      ],
      "core": true,
      "track": "visual",
      "scope": {
        "zh": "在敌人火力下推进至护甲目标，组合移动、转向与射击，主要衡量视觉动作控制。",
        "en": "Advance to the armor through enemy fire using movement, turning and firing; primarily visual control."
      },
      "why": {
        "zh": "在敌人火力下推进至护甲目标，组合移动、转向与射击，主要衡量视觉动作控制。 单人对怪物场景；不是多模型对战或独立策略能力测量。原生 RL 接口已记录，LLM/VLM 动作适配尚未实现或验证。",
        "en": "Advance to the armor through enemy fire using movement, turning and firing; primarily visual control. Single-player against monsters, not model-versus-model combat or isolated strategy assessment. Native RL interface is documented; LLM/VLM adapters remain unimplemented and unverified."
      },
      "interface": {
        "zh": "原生 DoomGame 或 Gymnasium；屏幕观测，7个二元按键。建议固定 MultiBinary 版本，额外状态缓冲单独声明。",
        "en": "DoomGame or Gymnasium; screen observations and seven binary buttons. Pin the MultiBinary variant and disclose auxiliary buffers."
      },
      "metric": {
        "zh": "回合累计奖励：向目标接近/远离产生距离增量奖励，到达目标 +1000，死亡 -100。 目标到达率、死亡率与耗时，作为 Arena 补充统计。",
        "en": "Episode return: distance-progress shaping, +1000 on reaching the target, -100 on death. Target-reach rate, death rate and duration as additional Arena diagnostics."
      },
      "controls": {
        "zh": "固定 WAD/CFG 与软件版本、doom_skill=5、2100 tic 上限。 固定 frame_skip、动作组合、屏幕分辨率、可见辅助信息及随机种子列表。",
        "en": "Pin WAD/CFG and software version, doom_skill=5 and 2100-tic timeout. Fix frame_skip, action combinations, screen resolution, auxiliary observations and evaluation seed list."
      },
      "pending": {
        "zh": "单人对怪物场景；不是多模型对战或独立策略能力测量。原生 RL 接口已记录，LLM/VLM 动作适配尚未实现或验证。 待锁定资源与版本、逐任务预算、种子清单和适配器，并完成运行验证。",
        "en": "Single-player against monsters, not model-versus-model combat or isolated strategy assessment. Native RL interface is documented; LLM/VLM adapters remain unimplemented and unverified. Pin assets and versions, per-task budgets, seed lists and adapters; complete runtime validation."
      },
      "source": "https://vizdoom.farama.org/environments/default/#deadly-corridor",
      "docs": "https://raw.githubusercontent.com/Farama-Foundation/ViZDoom/master/scenarios/deadly_corridor.cfg",
      "officialTask": "VizdoomDeadlyCorridor-MultiBinary-v1 / deadly_corridor.cfg",
      "evidence": [
        {
          "url": "https://vizdoom.farama.org/environments/default/#deadly-corridor",
          "verified": "Goal, rewards, actions, timeout and difficulty."
        },
        {
          "url": "https://raw.githubusercontent.com/Farama-Foundation/ViZDoom/master/scenarios/deadly_corridor.cfg",
          "verified": "Official scenario configuration."
        },
        {
          "url": "https://vizdoom.farama.org/api/python/gymnasium_wrapper/",
          "verified": "Wrapper action variants, frame skip and observation buffers."
        }
      ],
      "status": "candidate",
      "runnable": false,
      "curationRound": "v17"
    },
    {
      "id": "textworld-cooking-dependencies",
      "benchmark": "SUP-textworld",
      "game": "textworld",
      "title": {
        "zh": "TextWorld：食谱依赖执行",
        "en": "TextWorld: Recipe Dependencies"
      },
      "primary": "planning",
      "secondary": [
        "exploration",
        "generalization"
      ],
      "core": true,
      "track": "language",
      "scope": {
        "zh": "Arena 拟议 tw-cooking 配置：3 种食材、6 个房间，开启取物、开门、烹调与切配，100 步上限；读取食谱并执行依赖链。这是本站选定配置，尚未生成或运行。",
        "en": "Proposed Arena tw-cooking setup: three ingredients, six rooms, taking/opening/cooking/cutting enabled and a 100-step cap. Read the recipe and execute its dependency chain. This is an Arena-selected configuration, not yet generated or run."
      },
      "why": {
        "zh": "阅读食谱，获取并处理食材，再制作与食用餐点；动作存在前置依赖。 文字冒险玩法，烹饪只是题材，不属于 Overcooked。官方支持 train/valid/test 食材与加工组合划分，但“主规划、次泛化”为编辑归类；本次配置未生成运行。",
        "en": "Read a recipe, gather and process ingredients, then prepare and consume the meal; actions have dependencies. A text adventure with a cooking theme, distinct from Overcooked. Official ingredient/preparation splits exist; capability mapping is editorial and this selected configuration has not been generated or executed."
      },
      "interface": {
        "zh": "TextWorld 文本观测与命令字符串；评估器可请求 score、max_score、won、lost、moves。",
        "en": "TextWorld text observations and command strings; evaluator requests score, max_score, won, lost and moves."
      },
      "metric": {
        "zh": "原生分数、最高可达分数、胜负标记与动作次数；没有跨所有 TextWorld 场景的唯一总分。 Arena 按实例报告 score/max_score、任务完成率和无效命令率；归一化属于本站协议。",
        "en": "Native score, maximum attainable score, win/loss flags and move count; no universal TextWorld score. Arena reports per-instance score/max_score, completion and invalid-command rates; normalization is an Arena protocol choice."
      },
      "controls": {
        "zh": "固定生成器版本、全部技能参数、地图/物体/食谱/语法随机种子及游戏文件。 固定100步上限及历史窗口；禁止向待测智能体泄露 walkthrough、policy_commands、全局 facts；合法动作列表须统一决定是否提供。",
        "en": "Pin generator version, skill settings, map/object/recipe/grammar seeds and compiled game files. Fix the proposed 100-step budget and history; withhold walkthrough, policy_commands and global facts; standardize admissible-command exposure."
      },
      "pending": {
        "zh": "文字冒险玩法，烹饪只是题材，不属于 Overcooked。官方支持 train/valid/test 食材与加工组合划分，但“主规划、次泛化”为编辑归类；本次配置未生成运行。 待锁定资源与版本、逐任务预算、种子清单和适配器，并完成运行验证。",
        "en": "A text adventure with a cooking theme, distinct from Overcooked. Official ingredient/preparation splits exist; capability mapping is editorial and this selected configuration has not been generated or executed. Pin assets and versions, per-task budgets, seed lists and adapters; complete runtime validation."
      },
      "source": "https://raw.githubusercontent.com/microsoft/TextWorld/main/textworld/challenges/tw_cooking/cooking.py",
      "docs": "https://raw.githubusercontent.com/microsoft/TextWorld/main/textworld/core.py",
      "officialTask": "tw-cooking",
      "evidence": [
        {
          "url": "https://raw.githubusercontent.com/microsoft/TextWorld/main/textworld/challenges/tw_cooking/cooking.py",
          "verified": "Official objective, skill parameters, food/preparation splits and max_score construction."
        },
        {
          "url": "https://raw.githubusercontent.com/microsoft/TextWorld/main/textworld/core.py",
          "verified": "Command interface and evaluator information fields."
        }
      ],
      "status": "candidate",
      "runnable": false,
      "curationRound": "v17"
    },
    {
      "id": "football-academy-3v1",
      "benchmark": "football",
      "game": "football",
      "title": {
        "zh": "足球学院：三打一与守门员",
        "en": "Football Academy: 3 vs 1 with Keeper"
      },
      "primary": "coordination",
      "secondary": [
        "strategy",
        "control"
      ],
      "core": true,
      "track": "structured",
      "scope": {
        "zh": "仅在三名受控球员分别由可行动主体控制时，将传跑配合归为协作；单控制器模式应改列策略/控制。",
        "en": "Count coordination only when three controllable players are assigned distinct acting policies; single-controller mode belongs under strategy/control."
      },
      "why": {
        "zh": "仅在三名受控球员分别由可行动主体控制时，将传跑配合归为协作；单控制器模式应改列策略/控制。 短攻门场景，不代表完整11人足球比赛或长期战略。原生多球员接口需要调度层分派到独立 Agent；当前任务未接入运行，LLM/VLM 支持未核验。",
        "en": "Count coordination only when three controllable players are assigned distinct acting policies; single-controller mode belongs under strategy/control. A short attacking scenario, not full 11-a-side football or long-term strategy. The multi-player interface needs a dispatcher for independent agents; no runner is connected and LLM/VLM support is unverified."
      },
      "interface": {
        "zh": "create_environment，建议 raw 观测；number_of_left_players_agent_controls=3，右侧0；每次传入三个动作，默认动作集19项。",
        "en": "create_environment with raw observations, three controlled left players and zero right players; supply three actions from the default 19-action set."
      },
      "metric": {
        "zh": "scoring 回报为比分差的变化；原生暴露 score 与 info.score_reward。 固定 scoring-only 时统计进球成功率、球权丢失与出界终止次数；不得把传球次数单独当作协作水平。",
        "en": "Scoring reward is the change in score difference; native fields include score and info.score_reward. Under scoring-only evaluation report scoring success, possession-loss and out-of-play endings; pass count alone is not coordination quality."
      },
      "controls": {
        "zh": "官方场景：game_duration=400，随机环境，关闭越位；进球、出界或球权改变即终止。 固定三主体分配、共享信息/通信规则、对手、种子、动作集及物理步频；区分 scoring 与 checkpoints 塑形。",
        "en": "Official scenario uses game_duration=400, stochastic dynamics, offsides disabled, and termination on score, out-of-play or possession change. Fix policy-to-player assignment, shared information/communication, opponents, seeds, action set and physics step frequency; distinguish scoring from checkpoint shaping."
      },
      "pending": {
        "zh": "短攻门场景，不代表完整11人足球比赛或长期战略。原生多球员接口需要调度层分派到独立 Agent；当前任务未接入运行，LLM/VLM 支持未核验。 待锁定资源与版本、逐任务预算、种子清单和适配器，并完成运行验证。",
        "en": "A short attacking scenario, not full 11-a-side football or long-term strategy. The multi-player interface needs a dispatcher for independent agents; no runner is connected and LLM/VLM support is unverified. Pin assets and versions, per-task budgets, seed lists and adapters; complete runtime validation."
      },
      "source": "https://raw.githubusercontent.com/google-research/football/master/gfootball/scenarios/academy_3_vs_1_with_keeper.py",
      "docs": "https://raw.githubusercontent.com/google-research/football/master/gfootball/doc/scenarios.md",
      "officialTask": "academy_3_vs_1_with_keeper",
      "evidence": [
        {
          "url": "https://raw.githubusercontent.com/google-research/football/master/gfootball/scenarios/academy_3_vs_1_with_keeper.py",
          "verified": "Exact scenario name, positions, duration and termination flags."
        },
        {
          "url": "https://raw.githubusercontent.com/google-research/football/master/gfootball/doc/scenarios.md",
          "verified": "Official three-attacker/one-defender-plus-keeper task description."
        },
        {
          "url": "https://raw.githubusercontent.com/google-research/football/master/gfootball/env/__init__.py",
          "verified": "Current create_environment parameter names, representation and reward options."
        },
        {
          "url": "https://raw.githubusercontent.com/google-research/football/master/gfootball/doc/observation.md",
          "verified": "Raw observation fields and default 19-action set."
        },
        {
          "url": "https://raw.githubusercontent.com/google-research/football/master/gfootball/env/football_env_core.py",
          "verified": "Reward equals score-difference change and episode termination logic."
        },
        {
          "url": "https://raw.githubusercontent.com/google-research/football/master/gfootball/env/football_env.py",
          "verified": "MultiDiscrete interface and score_reward field."
        },
        {
          "url": "https://raw.githubusercontent.com/google-research/football/master/gfootball/doc/multi_agent.md",
          "verified": "Caller must dispatch individual player actions; multi-policy setup is not implied by player count."
        }
      ],
      "status": "candidate",
      "runnable": false,
      "curationRound": "v17"
    },
    {
      "id": "spirebench-a20-full-run",
      "benchmark": "SUP-spirebench",
      "game": "slay-the-spire",
      "title": {
        "zh": "A20 Ironclad 完整闯关",
        "en": "A20 Ironclad full run"
      },
      "primary": "long-horizon",
      "secondary": [
        "strategy",
        "planning"
      ],
      "core": true,
      "track": "language",
      "scope": {
        "zh": "控制原版游戏中的 Ironclad，在 A20 完成四幕并挑战 Heart。",
        "en": "Control the Ironclad in the original game at A20 through four acts and the Heart."
      },
      "why": {
        "zh": "战斗、构筑与路线共同决定整局结果；只有配对记忆消融才能单独评价记忆。 尚未核实论文专用仓库和完整种子清单；需商业游戏。十种子不足以可靠区分相邻模型，不是像素控制评测。",
        "en": "Combat, deck and route decisions affect full-run outcomes; memory requires a separate paired ablation. Paper-specific repository and exact seed list are unverified; commercial game required. Ten seeds cannot reliably order nearby models; this is not pixel-control evaluation."
      },
      "interface": {
        "zh": "CommunicationModPlus 交换 JSON 状态与文本命令；模型使用按名称选牌、选路线等工具。",
        "en": "CommunicationModPlus exchanges JSON state and text commands; named tools select cards, routes and options."
      },
      "metric": {
        "zh": "官方指标：平均完成幕数、各幕通关率、终止楼层、每局成本。按本任务协议报告，不合并为跨游戏总分。",
        "en": "Documented metrics: Mean acts cleared, Per-act win rates, Final floor, Cost per run. Report within this task protocol; do not aggregate into a cross-game score."
      },
      "controls": {
        "zh": "固定游戏与模组版本、A20、Ironclad、种子序列、术语重命名、记忆模式、推理设置和动作批处理。论文主表用相同十种子及 themed reskin；可写记忆按种子顺序传递。",
        "en": "Fix game/mod versions, A20, Ironclad, seed order, reskin, memory mode, reasoning and action batching. Main results use ten shared seeds with themed reskin; writable memory carries sequentially."
      },
      "pending": {
        "zh": "尚未核实论文专用仓库和完整种子清单；需商业游戏。十种子不足以可靠区分相邻模型，不是像素控制评测。 待固定实验清单、预算和运行器；论文实验数量不自动成为 Arena 默认预算。",
        "en": "Paper-specific repository and exact seed list are unverified; commercial game required. Ten seeds cannot reliably order nearby models; this is not pixel-control evaluation. Pin manifests, budgets and runners; paper experiment counts are not adopted as Arena defaults."
      },
      "source": "https://arxiv.org/abs/2610.12596",
      "docs": "https://arxiv.org/html/2610.12596v1",
      "evidence": [
        {
          "url": "https://arxiv.org/html/2610.12596v1",
          "sections": [
            "3 Methods",
            "B.1 Game interface",
            "B.2 Agent harness",
            "B.3 Notes and memory",
            "C.2 Seeds and cohort selection",
            "C.3 Metrics and statistics"
          ]
        }
      ],
      "status": "candidate",
      "runnable": false,
      "curationRound": "v17"
    },
    {
      "id": "vgc-unseen-team-crossplay",
      "benchmark": "SUP-vgc-bench",
      "game": "pokemon-showdown",
      "title": {
        "zh": "未见阵容交叉对战",
        "en": "Unseen-team cross-play"
      },
      "primary": "generalization",
      "secondary": [
        "strategy"
      ],
      "core": true,
      "track": "structured",
      "scope": {
        "zh": "在双方未见阵容上交叉对战，比较不同训练阵容规模得到的策略。",
        "en": "Cross-play policies on team configurations unseen by every evaluated policy."
      },
      "why": {
        "zh": "使用训练时未见的双方阵容直接检验策略泛化；双打不等于不同智能体之间的语言协作。 不是完整队伍构筑；LLM 基础交叉评测仅 100 局，而 RL 为 1000 局。接入 Arena 前须锁定队伍文件和策略检查点。",
        "en": "Held-out lineups directly test strategic generalization; doubles do not imply inter-agent language coordination. Not full team building. Basic LLM cross-play uses 100 games versus 1000 for RL; pin team files and policy checkpoints before Arena execution."
      },
      "interface": {
        "zh": "poke-env 与 PettingZoo 多智能体接口；结构化状态、合法联合动作；仓库提供基础 LLM 文本接口。",
        "en": "poke-env/PettingZoo interface with structured observations and legal joint actions; a basic LLM text wrapper is provided."
      },
      "metric": {
        "zh": "官方指标：交叉对战胜率、策略池 Alpha-Rank。按本任务协议报告，不合并为跨游戏总分。",
        "en": "Documented metrics: Cross-play win rate, Policy-pool Alpha-Rank. Report within this task protocol; do not aggregate into a cross-game score."
      },
      "controls": {
        "zh": "锁定 Showdown/poke-env 版本、规则、队伍文件、对手池、训练条件与 Team Preview 设置；训练和测试阵容不重叠。",
        "en": "Pin Showdown/poke-env, rules, team files, opponent pool, training and Team Preview settings; exclude test teams from training."
      },
      "pending": {
        "zh": "不是完整队伍构筑；LLM 基础交叉评测仅 100 局，而 RL 为 1000 局。接入 Arena 前须锁定队伍文件和策略检查点。 待固定实验清单、预算和运行器；论文实验数量不自动成为 Arena 默认预算。",
        "en": "Not full team building. Basic LLM cross-play uses 100 games versus 1000 for RL; pin team files and policy checkpoints before Arena execution. Pin manifests, budgets and runners; paper experiment counts are not adopted as Arena defaults."
      },
      "source": "https://arxiv.org/abs/2506.10326",
      "docs": "https://arxiv.org/html/2506.10326v3",
      "evidence": [
        {
          "url": "https://arxiv.org/html/2506.10326v3",
          "sections": [
            "4.1 Infrastructure",
            "4.2.2 LLM Agent",
            "4.3 Evaluation Methods",
            "5.1 Cross-Play Performance",
            "5.2 Performance and Generalization Evaluations"
          ]
        },
        {
          "url": "https://github.com/cameronangliss/vgc-bench",
          "sections": [
            "README"
          ]
        },
        {
          "url": "https://github.com/cameronangliss/vgc-bench/blob/main/eval.sh",
          "sections": [
            "evaluation launcher"
          ]
        }
      ],
      "status": "candidate",
      "runnable": false,
      "curationRound": "v17"
    },
    {
      "id": "comrad-ammo-carrier",
      "benchmark": "SUP-comrad",
      "game": "doom",
      "title": {
        "zh": "Ammo Carrier：供弹与防守",
        "en": "Ammo Carrier: supply and defense"
      },
      "primary": "coordination",
      "secondary": [
        "control"
      ],
      "core": true,
      "track": "visual",
      "scope": {
        "zh": "以两名智能体协作，一名驻守据点，另一名从补给点运送弹药。",
        "en": "Two agents cooperate: one defends the hub while the other carries ammunition from depots."
      },
      "why": {
        "zh": "角色不对称：一方守卫据点，另一方往返补给；主要测局部视觉下的配合。只有明确留出地图才计入泛化。 当前仓库默认预算与官方页论文设置不一致，需锁版本；未核实原生 LLM 接口，不能标成已可运行的 LLM 任务。",
        "en": "Asymmetric defender/supplier roles test cooperation with local vision; generalization needs an explicit held-out map split. Current launcher differs from paper-facing settings; version pinning is required. Native LLM support is unverified, so this is not a runnable LLM task."
      },
      "interface": {
        "zh": "ViZDoom 私有第一人称 RGB 视角与分解离散动作，接入修改后的 Sample Factory。",
        "en": "Private first-person RGB views and factorized discrete actions through ViZDoom and modified Sample Factory."
      },
      "metric": {
        "zh": "官方指标：场景得分、场景归一化得分。按本任务协议报告，不合并为跨游戏总分。",
        "en": "Documented metrics: Scenario score, Normalized scenario score. Report within this task protocol; do not aggregate into a cross-game score."
      },
      "controls": {
        "zh": "固定 ammo_carrier 环境、两名智能体、地图与 WAD/CFG、动作跳帧、角色与队友策略、训练预算、检查点选择及评测种子。",
        "en": "Pin ammo_carrier, two agents, map/WAD/CFG, action frame skip, roles/partner policy, training budget, checkpoint selection and evaluation seeds."
      },
      "pending": {
        "zh": "当前仓库默认预算与官方页论文设置不一致，需锁版本；未核实原生 LLM 接口，不能标成已可运行的 LLM 任务。 待固定实验清单、预算和运行器；论文实验数量不自动成为 Arena 默认预算。",
        "en": "Current launcher differs from paper-facing settings; version pinning is required. Native LLM support is unverified, so this is not a runnable LLM task. Pin manifests, budgets and runners; paper experiment counts are not adopted as Arena defaults."
      },
      "source": "https://openreview.net/forum?id=0x7G2k0Hh7",
      "docs": "https://lmbored.github.io/comrad_site/",
      "evidence": [
        {
          "url": "https://lmbored.github.io/comrad_site/",
          "sections": [
            "When centralized training hurts",
            "Scoreboard",
            "13 scenarios"
          ]
        },
        {
          "url": "https://github.com/TTomilin/COMRAD/blob/main/comrad/train_all.py",
          "sections": [
            "BENCHMARK_SCENARIOS",
            "SEEDS",
            "TRAIN_FOR_ENV_STEPS",
            "ALGORITHMS"
          ]
        },
        {
          "url": "https://github.com/TTomilin/COMRAD",
          "sections": [
            "Benchmark launchers",
            "Scenario assets"
          ]
        }
      ],
      "status": "candidate",
      "runnable": false,
      "curationRound": "v17"
    },
    {
      "id": "civrealm-settler-build-city",
      "title": {
        "zh": "Freeciv-web：建城选址",
        "en": "Freeciv-web: city-site selection"
      },
      "scope": {
        "zh": "在 CivRealm 的建城小游戏中移动移民并选择建城位置，以地块资源产出衡量选址。",
        "en": "Move a settler and choose a city site in the CivRealm development minigame, evaluated by resource output."
      },
      "why": {
        "zh": "补充回合制经济取舍；将资源评估与即时战略中的实时操作区分。此任务不能代表完整文明经营。",
        "en": "Adds turn-based economic trade-offs distinct from RTS execution; this task does not represent full civilization management."
      },
      "interface": {
        "zh": "官方提供张量和语言接口；小游戏沿用完整游戏的输入输出，语言动作包含对象类型、ID 与合法动作名称。",
        "en": "Tensor and language interfaces are documented; minigames share full-game I/O, with actor type, ID and legal action name in language actions."
      },
      "metric": {
        "zh": "报告官方成功状态与建城资源得分；论文将食物、生产、贸易加权，按任务定义的目标阈值判定成功。",
        "en": "Report official success status and city resource score; the paper weights food, production and trade against the task-defined target."
      },
      "controls": {
        "zh": "固定任务存档、地图生成种子、难度、规则集、接口和可用信息；保留官方回合上限与终止条件。",
        "en": "Pin task saves, map seeds, difficulty, ruleset, interface and visible information; retain official turn limits and termination."
      },
      "pending": {
        "zh": "待核对当前任务存档与计分脚本、封装语言与张量 runner，并确定重复次数和行动预算；尚未执行。",
        "en": "Pending current save/scoring-script checks, language/tensor runners, repetitions and action-budget specification; not executed."
      },
      "source": "https://github.com/bigai-ai/civrealm",
      "docs": "https://bigai-ai.github.io/civrealm/advanced_materials/minigame_setting.html",
      "officialTask": "development_build_city / SettlerBuildCity",
      "evidence": [
        {
          "url": "https://bigai-ai.github.io/civrealm/advanced_materials/minigame_setting.html",
          "section": "Supported Types; Game Status; Victory Status",
          "supports": [
            "officialTask",
            "scope",
            "metric",
            "controls"
          ]
        },
        {
          "url": "https://arxiv.org/html/2401.10568v1",
          "section": "3.2; A.2 Tables 8–10; C.2",
          "supports": [
            "interface",
            "metric"
          ]
        },
        {
          "url": "https://github.com/bigai-ai/civrealm",
          "section": "README",
          "supports": [
            "game",
            "agents"
          ]
        }
      ],
      "benchmark": "GAB075",
      "game": "freeciv-web",
      "core": true,
      "track": "language",
      "primary": "strategy",
      "secondary": [
        "planning"
      ],
      "status": "candidate",
      "runnable": false,
      "curationRound": "v17"
    },
    {
      "id": "fightladder-ryu-mirror",
      "title": {
        "zh": "街头霸王 II：Ryu 镜像对战",
        "en": "Street Fighter II: Ryu mirror match"
      },
      "scope": {
        "zh": "在官方双人 Ryu 镜像场景中比较双方策略，记录回合胜负及固定对手池的对战矩阵。",
        "en": "Compare policies in the official two-player Ryu mirror scenario, recording round outcomes and a fixed-pool matchup matrix."
      },
      "why": {
        "zh": "增加格斗类的时机控制与竞争性反制；与合作任务及单人躲避任务互补。",
        "en": "Adds fighting-game timing and competitive counterplay, complementing cooperation and single-agent avoidance tasks."
      },
      "interface": {
        "zh": "Gym Retro 图像接口；原始按键与转换动作空间可选，特殊招式宏需单独声明。原生基线为 RL。",
        "en": "Gym Retro pixel interface, with raw-button or transformed actions; declare special-move macros. Native baselines use RL."
      },
      "metric": {
        "zh": "以回合胜率和固定池 Elo 比较；如运行统一 RL 攻击者，则另外报告其胜率，作为近似可利用性诊断。",
        "en": "Compare round win rate and fixed-pool Elo; a consistently trained RL exploiter may additionally provide an approximate exploitability diagnostic."
      },
      "controls": {
        "zh": "固定 Genesis 版本、存档、Ryu 双方角色、动作宏、帧堆叠与动作保持；记录左右侧、对手池及奖励设置。",
        "en": "Pin Genesis version, saves, Ryu characters, action macros, frame stacking and action duration; record sides, opponent pool and rewards."
      },
      "pending": {
        "zh": "待游戏资源和 runner 校验；确定对局数、时序及预算。LLM/VLM 控制适配未验证；不把 Elo 当作绝对能力分。",
        "en": "Pending game assets, runner validation, match counts, timing and budgets. LLM/VLM adapters are unverified; Elo is not an absolute capability score."
      },
      "source": "https://github.com/wenzhe-li/FightLadder",
      "docs": "https://arxiv.org/html/2406.02081v1",
      "officialTask": "sf_ryu_vs_ryu",
      "evidence": [
        {
          "url": "https://arxiv.org/html/2406.02081v1",
          "section": "4.1–4.4; 5; 7.2–7.3",
          "supports": [
            "officialTask",
            "interface",
            "metric",
            "controls"
          ]
        },
        {
          "url": "https://github.com/wenzhe-li/FightLadder",
          "section": "Setup; Key concepts; League / PSRO / FSP; Single-Agent RL Exploiters",
          "supports": [
            "game",
            "agents",
            "pending"
          ]
        }
      ],
      "benchmark": "GAB076",
      "game": "street-fighter-ii",
      "core": true,
      "track": "visual",
      "primary": "control",
      "secondary": [
        "strategy"
      ],
      "status": "candidate",
      "runnable": false,
      "curationRound": "v17"
    },
    {
      "id": "minecraft-crafting",
      "benchmark": "orak",
      "game": "minecraft",
      "title": {
        "zh": "我的世界 · 合成依赖",
        "en": "Minecraft · Crafting dependencies"
      },
      "primary": "planning",
      "secondary": [
        "long-horizon",
        "exploration"
      ],
      "core": false,
      "track": "language",
      "scope": {
        "zh": "Orak Minecraft 合成目标中，选石镐作为首个候选目标；后续可增加更长依赖链。",
        "en": "Select a stone pickaxe goal from Orak’s Minecraft crafting tasks as the initial candidate; longer dependency chains can follow."
      },
      "why": {
        "zh": "在开放世界中检查资源与合成依赖，可与规则封闭的汉诺塔互补。技能库会改变实际规划难度。",
        "en": "Resource and crafting dependencies complement Hanoi’s closed rules. Skill libraries change the effective planning difficulty."
      },
      "interface": {
        "zh": "Orak 的 Minecraft 工具与代码/技能执行层；须披露技能库和初始状态。",
        "en": "Orak’s Minecraft tools and code/skill execution layer; disclose skill libraries and initial state."
      },
      "metric": {
        "zh": "记录所选目标的完成率；Orak 全套 8 目标的汇总定义不直接用于一个目标的运行。",
        "en": "Report completion for the selected goal; Orak’s eight-goal aggregate does not apply to a single-goal run."
      },
      "controls": {
        "zh": "固定世界、初始背包、目标、可用技能与预算；与 MineDojo 底层控制任务分开报告。",
        "en": "Fix world, initial inventory, goal, available skills and budget; report separately from low-level MineDojo tasks."
      },
      "pending": {
        "zh": "需固定具体目标配置、技能库及目标检测器，安装游戏与适配器。",
        "en": "Pin goal configuration, skill library and goal detector; install the game and adapter."
      },
      "source": "https://github.com/krafton-ai/Orak",
      "docs": "https://github.com/krafton-ai/Orak/blob/release/docs/eval_metrics.md#minecraft",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "smac-team",
      "benchmark": "smacv2",
      "game": "starcraft-ii",
      "title": {
        "zh": "星际争霸 II · 团队微操",
        "en": "StarCraft II · Team micromanagement"
      },
      "primary": "coordination",
      "secondary": [
        "generalization",
        "control"
      ],
      "core": false,
      "track": "structured",
      "scope": {
        "zh": "SMACv2 合作微操；从固定阵容和出生分布开始，再明确测试变化。",
        "en": "SMACv2 cooperative micromanagement; start with fixed unit and spawn distributions, then define test variation."
      },
      "why": {
        "zh": "去中心化单位控制提供语言协作以外的团队任务，适合比较观测与通信约束。",
        "en": "Decentralized unit control complements language-based cooperation and supports comparisons of observation and communication constraints."
      },
      "interface": {
        "zh": "各单位的局部观测与离散移动/攻击动作；训练时全局状态访问需披露。",
        "en": "Per-unit local observations and discrete move/attack actions; disclose global-state access during training."
      },
      "metric": {
        "zh": "文档指标：团队胜率。需按具体场景与分布单独报告。",
        "en": "Documented measure: team win rate, reported separately by scenario and distribution."
      },
      "controls": {
        "zh": "固定场景、单位分布、出生位置分布、SC2 版本与步长；这不是完整 RTS 经济与战略评测。",
        "en": "Fix scenario, unit/spawn distributions, SC2 version and step size; this does not evaluate full RTS economy and strategy."
      },
      "pending": {
        "zh": "需确定训练与测试分布、安装 SC2、固定多 Agent 接口并运行验证。",
        "en": "Specify training/test distributions, install SC2, pin the multi-agent interface and validate execution."
      },
      "source": "https://github.com/oxwhirl/smacv2",
      "docs": "https://github.com/oxwhirl/smacv2#differences-to-smac",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "minigrid-memory",
      "benchmark": "minigrid",
      "game": "minigrid",
      "title": {
        "zh": "MiniGrid · 延迟匹配",
        "en": "MiniGrid · Delayed matching"
      },
      "primary": "memory",
      "secondary": [
        "control"
      ],
      "core": false,
      "track": "structured",
      "scope": {
        "zh": "MiniGrid-MemoryS13-v0：先观察物体，再沿走廊前进，在分叉处选择匹配物体。",
        "en": "MiniGrid-MemoryS13-v0: observe an object, traverse a corridor, then select the matching object at a fork."
      },
      "why": {
        "zh": "选择时早期线索已不在当前局部观测中，可以研究历史利用；同时仍受导航和观测编码影响。",
        "en": "The early cue is absent from the local observation at decision time, exposing history use while retaining navigation and encoding effects."
      },
      "interface": {
        "zh": "局部图像编码、方向与任务信息；原生离散动作。文本或像素转换需作为独立适配轨道。",
        "en": "Local image encoding, direction and mission; native discrete actions. Text or pixel conversion requires a separately documented adapter track."
      },
      "metric": {
        "zh": "文档回报：成功时按步数折减，失败为 0。Arena 建议分别报告成功率与成功步数。",
        "en": "Documented reward: success discounted by steps, zero on failure. Report success rate and steps on success separately."
      },
      "controls": {
        "zh": "固定走廊配置、观测编码、历史长度、步数上限与种子；额外历史消融需单独标记。",
        "en": "Fix corridor configuration, encoding, history length, step limit and seeds; label history ablations separately."
      },
      "pending": {
        "zh": "需实现 Agent 适配与轨迹记录，验证局部观测没有泄露起始线索。",
        "en": "Implement the agent adapter and trace recording; verify the local observation does not leak the initial cue."
      },
      "source": "https://minigrid.farama.org/environments/minigrid/MemoryEnv/",
      "docs": "https://minigrid.farama.org/environments/minigrid/MemoryEnv/",
      "status": "candidate",
      "runnable": false
    },
    {
      "id": "coinrun-original-500",
      "benchmark": "SUP-coinrun",
      "game": "coinrun",
      "title": {
        "zh": "原版 CoinRun：500关训练与测试",
        "en": "Original CoinRun: 500-Level Train/Test"
      },
      "primary": "generalization",
      "secondary": [
        "control"
      ],
      "core": false,
      "track": "visual",
      "scope": {
        "zh": "比较固定训练关卡与测试关卡的回报，研究平台跳跃策略的过拟合。",
        "en": "Compare return on fixed training levels and test levels to study platformer overfitting."
      },
      "why": {
        "zh": "比较固定训练关卡与测试关卡的回报，研究平台跳跃策略的过拟合。 官方测试脚本从高难度关卡总体抽样，未显式排除训练关卡，只说明碰撞概率很低。因此不能声称严格无重叠，除非新增排除检查。仓库已归档；与 Procgen CoinRun 不混用。",
        "en": "Compare return on fixed training levels and test levels to study platformer overfitting. Official testing samples high-difficulty levels without explicitly excluding training levels, relying on negligible collision probability. Strict disjointness requires an added audit. Repository archived; keep separate from Procgen CoinRun."
      },
      "interface": {
        "zh": "原始 CoinRun VecEnv；图像观测、离散动作、回合回报与结束信号。",
        "en": "Original CoinRun VecEnv; image observations, discrete actions, rewards and episode termination."
      },
      "metric": {
        "zh": "enjoy.py 汇总每回合回报并输出 mean_score / mpi_mean；训练与测试结果分开。 可增加 train-test 回报差，但不要将其直接当作通用模型分数。",
        "en": "enjoy.py aggregates episode returns into mean_score / mpi_mean; train and test scores are separate. Optionally report the train-test return gap; it is not a universal model score."
      },
      "controls": {
        "zh": "原论文500关设置为 NUM_LEVELS=500、SET_SEED=-1；固定训练预算、难度、模型检查点与评估回合数。 固定游戏版本、图像处理、帧堆叠及速度信息绘制；明确测试采样机制。",
        "en": "Original 500-level setting uses NUM_LEVELS=500 and SET_SEED=-1; fix training budget, difficulty, checkpoint and evaluation episode count. Fix game version, image processing, frame stack and velocity overlay; disclose test sampling."
      },
      "pending": {
        "zh": "官方测试脚本从高难度关卡总体抽样，未显式排除训练关卡，只说明碰撞概率很低。因此不能声称严格无重叠，除非新增排除检查。仓库已归档；与 Procgen CoinRun 不混用。 待锁定资源与版本、逐任务预算、种子清单和适配器，并完成运行验证。",
        "en": "Official testing samples high-difficulty levels without explicitly excluding training levels, relying on negligible collision probability. Strict disjointness requires an added audit. Repository archived; keep separate from Procgen CoinRun. Pin assets and versions, per-task budgets, seed lists and adapters; complete runtime validation."
      },
      "source": "https://raw.githubusercontent.com/openai/coinrun/master/README.md",
      "docs": "https://raw.githubusercontent.com/openai/coinrun/master/coinrun/config.py",
      "officialTask": "game_type=standard, num_levels=500, set_seed=-1; train-eval and test-eval",
      "evidence": [
        {
          "url": "https://raw.githubusercontent.com/openai/coinrun/master/README.md",
          "verified": "500-level protocol, separate train/test scripts, test-overlap caveat and archive status."
        },
        {
          "url": "https://raw.githubusercontent.com/openai/coinrun/master/coinrun/config.py",
          "verified": "SET_SEED=-1 convention and observation/training configuration switches."
        },
        {
          "url": "https://raw.githubusercontent.com/openai/coinrun/master/coinrun/enjoy.py",
          "verified": "Episode return aggregation and output metric names."
        },
        {
          "url": "https://raw.githubusercontent.com/openai/coinrun/master/coinrun/coinrunenv.py",
          "verified": "Image observation and discrete-action VecEnv interface."
        }
      ],
      "status": "candidate",
      "runnable": false,
      "curationRound": "v17"
    }
  ],
  "previousDefaults": [
    "crafter-progress",
    "factorio-production",
    "hanoi-order",
    "overcooked-team",
    "overcooked-zsc",
    "sc2-match",
    "memorygym-sequence",
    "bandit-learning",
    "alchemy-discovery",
    "coinrun-heldout",
    "hanabi-partner",
    "dodgeball-control"
  ]
};if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.ArenaCatalog=data;})(typeof window!=="undefined"?window:globalThis);
