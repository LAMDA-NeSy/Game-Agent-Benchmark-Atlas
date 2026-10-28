"""Editorial research navigation, grounded in linked public project documentation.

Question shortlists are curated discovery aids, not capability measurements.
Metrics below are study-design suggestions unless explicitly marked as documented.
"""

TAXONOMY = {
 'long-horizon': ['长时程', '任务需要持续推进多个阶段，早期行动会影响后续进展。', '需标明回合长度、依赖深度和进展定义；游戏复杂或耗时长本身不足以证明长期规划能力。'],
 'planning': ['规划', '行动之间存在先后条件，目标需要分解或随反馈调整。', '需区分任务结构与规划模块的实际贡献；成功率不能单独归因于规划。'],
 'coordination': ['多智能体协作', '多个可行动主体为共同目标分工、同步或相互适应。', '需说明控制主体、伙伴配置和共享信息；多单位画面不自动等于多智能体。'],
 'strategy': ['策略决策', '在资源约束、对手或长期收益之间作取舍。', '标明战术、全局战略或卡牌博弈范围；同属策略游戏不代表同一种评估。'],
 'memory': ['记忆', '当前决策需要利用此前出现、当前不可直接获得的信息。', '需说明历史窗口和观测限制；提供历史记录不等于测量了记忆能力。'],
 'exploration': ['探索', '通过交互发现未知区域、规律或有用状态。', '需区分信息获取与随机移动，并说明知识和地图是否预先提供。'],
 'generalization': ['泛化', '评估关卡、配置或任务分布变化下的行为。', '需明确训练与测试划分；随机化机制本身不能证明对未见任务的泛化。'],
 'social': ['社会推理', '根据伙伴意图、通信或信息不对称调整行为。', '通信量与团队得分都不能单独证明意图理解。'],
 'control': ['感知与控制', '将视觉或结构化观测转化为及时、有效的游戏动作。', '固定观测形式、动作抽象和执行频率后再作比较。'],
}

# scope, useful for, metrics to consider, conditions to control, setup boundary
PROFILES = {
 'balrog': ['六个环境；长时程问题优先检查 Crafter / NetHack 子任务', '观察语言智能体在持续交互中的进展与失败。', '按环境报告成功或进展；另记录停滞、重复动作和调用成本。', '环境、任务、步数上限、文本/图像历史、提示词与模型版本。', '已记录 LLM / VLM 接口；底层使用 RL 环境不等于本条目已提供 RL 对照。'],
 'smacv2': ['StarCraft II 去中心化微操场景', '研究局部观测下的团队控制和随机场景适应。', '固定场景配置后比较团队胜率；另记录失败类型。', '种族、单位数、起始位置分布、视野、训练步数和随机种子。', '原生 MARL；需要 StarCraft II 与地图资源。LLM 适配未核验。'],
 'minedojo': ['Minecraft 任务集；须先选择明确目标', '研究开放世界中的资源获取与多阶段目标。', '按选定任务定义成功率与中间进展；报告交互预算。', '任务、初始世界、资源条件、外部知识、奖励与动作封装。', '模拟器和任务基础设施；本 demo 仅记录 RL 使用，LLM 适配未核验。'],
 'smartplay': ['按游戏选任务，例如 Tower of Hanoi', '用不同游戏设置观察依赖推理与历史利用。', '官方接口含 score / completed；建议分游戏汇报。', '游戏、难度、手册、历史窗口与交互预算。', '已记录 LLM 使用；仓库已归档，实际安装兼容性未测试。'],
 'collab-overcooked': ['30 个烹饪协作任务；按任务复杂度评估', '研究语言智能体如何发起、响应协作并分工。', '官方含 TES F1、动作冗余、发起/响应协作指标；结合任务结果。', '菜谱、布局、伙伴模型、通信规则、动作模板和运行预算。', '已记录 LLM 多智能体框架；未核验原生 RL 评估接口。'],
 'procgen': ['16 个程序生成环境；显式定义训练/测试关卡', '研究固定训练预算下对未见关卡的适应。', '分开报告训练与测试回报；附训练样本量。', '关卡种子范围、训练关卡数、难度、游戏、训练预算。', '原生 RL 像素接口；需要固定运行库版本，LLM 适配未核验。'],
 'orak': ['12 游戏套件；策略问题需单独选 StarCraft II 等游戏', '研究语言智能体跨游戏执行与模块设计。', '逐游戏使用相应分数；另报告动作与模型调用成本。', '游戏、观测、工具、动作粒度、模块与模型预算。', '已记录 LLM / VLM 使用；部分游戏需单独购买与安装。'],
 'nethack': ['NLE 中选定的 NetHack 任务', '研究探索、生存与长期交互的累积效应。', '按具体任务报告回报；另记录生存时长与进展。', '任务奖励、终止规则、角色、种子、历史和环境版本。', '原生 RL 环境；BALROG 的语言模型适配是另一个评估层。'],
 'hanabi': ['Hanabi 合作卡牌；先明确 self-play / cross-play', '研究有限提示下的伙伴推理与协作约定。', '按伙伴协议分别报告团队得分与跨伙伴表现。', '玩家数、提示规则、伙伴来源、训练方式与牌局种子。', '原生 RL 环境；可构建其他智能体，现成 LLM 适配未核验。'],
 'football': ['Football Academy 或完整比赛；明确受控球员数', '研究空间控制，以及多人控制设置下的团队策略。', '按场景报告回报或胜负；另记录进球、失球与失败原因。', '场景、对手、受控球员数、观测、奖励和训练预算。', '原生 RL 环境；单策略控制与多策略协作需要分别描述。'],
 'rlcard': ['单独选择卡牌游戏与对手，例如 Leduc Hold’em', '构建隐含信息下的决策与对手比较实验。', '按游戏与对手定义收益；先明确评估协议。', '游戏规则、对手集合、座位、随机种子与训练预算。', '研究平台与基线；统一接口没有指定唯一的 benchmark 协议。'],
 'minigrid': ['MiniGrid 的 Memory / DoorKey 等具体任务', '用可解释的小任务研究历史信息或行动依赖。', 'Memory / DoorKey 文档提供成功奖励与步数惩罚；建议另报成功率。', '任务 ID、地图尺寸、观测 wrapper、种子与步数上限。', '原生 RL；这里的任务证据针对 MiniGrid，不能自动外推到 MiniWorld。'],
}

# Each tag has an explicit mechanism and bounded scope. Links are attached below.
EVIDENCE = {
 'balrog': {
  'long-horizon': ('官方定位', '官方将评估目标定位为长时程交互任务。', '套件研究目标；每个环境的实际时程不同。', '#balrog-benchmarking-agentic-llm-and-vlm-reasoning-on-games'),
  'planning': ('编辑归类', '多步目标推进可用于分析行动依赖。', '需选择具体任务；未完成规划贡献的独立验证。', '#documentation'),
  'exploration': ('编辑归类', '在未知游戏状态中持续交互，可研究探索行为。', '只作为候选方向；需指定子环境与探索指标。', '#documentation'),
  'memory': ('编辑归类', '评估配置允许设置文本与图像历史。', '历史窗口是可控条件；它不是已验证的独立记忆测试。', '#-evaluate-using-api'),
 },
 'smacv2': {
  'coordination': ('官方定位', '去中心化单位在局部观测下协同完成微操战斗。', '协作 MARL 微操；不覆盖完整星际宏观运营。', '#introduction'),
  'generalization': ('编辑归类', '单位构成和初始位置可随机生成。', '场景变化；未见分布的泛化结论仍需训练/测试划分。', '#differences-to-smac'),
 },
 'minedojo': {
  'long-horizon': ('编辑归类', '开放任务支持跨阶段目标执行研究。', '取决于选定任务；不能由 Minecraft 名称推定长度。', '#readme'),
  'planning': ('编辑归类', '目标完成可包含资源与操作的前置依赖。', '任务集级候选；依赖深度需逐任务确认。', '#readme'),
  'exploration': ('编辑归类', '开放世界模拟器提供探索与任务交互空间。', '需固定初始世界和可用外部知识。', '#readme'),
 },
 'smartplay': {
  'planning': ('官方定位', '官方能力描述包含前瞻规划与对象依赖推理。', '游戏对应不同能力子集，不能整套等同。', '#smartplay'),
  'memory': ('编辑归类', '官方讨论从历史中学习，并向智能体提供 history。', '历史利用与记忆容量需要不同实验设计。', '#using-smartplay'),
  'exploration': ('编辑归类', '包括 bandit 与开放环境，适合探索决策的候选研究。', '需区分信息探索与空间探索。', '#smartplay'),
 },
 'collab-overcooked': {
  'coordination': ('官方定位', '任务与评估显式关注发起和响应协作。', '指定烹饪任务、角色及伙伴设置。', '#evaluation'),
  'social': ('编辑归类', '协作发起和响应提供伙伴交互的过程观测。', '这些行为指标不能单独证明意图理解。', '#evaluation'),
  'planning': ('编辑归类', '菜谱执行与协作动作存在顺序依赖。', '任务结构上的规划相关性，非独立规划分数。', '#modify-the-environment'),
 },
 'procgen': {
  'generalization': ('官方定位', '程序生成关卡用于评估可泛化的 RL 技能。', '需显式分离训练关卡和测试关卡。', '#procgen-benchmark'),
  'control': ('编辑归类', '智能体从 RGB 图像选择离散按键动作。', '视觉控制接口；总回报混合感知与决策。', '#environments'),
 },
 'orak': {
  'planning': ('编辑归类', '多游戏智能体框架可研究计划与行动执行。', '取决于游戏与模块配置。', '#readme'),
  'strategy': ('编辑归类', '套件包含 StarCraft II 等策略场景。', '需查看该游戏的任务；不能推广到全部 12 游戏。', '#readme'),
  'control': ('编辑归类', '通过各游戏接口执行动作并获得反馈。', '不同动作抽象与观测不能直接混合比较。', '#readme'),
 },
 'nethack': {
  'long-horizon': ('编辑归类', '生存与任务进展在持续交互中累积。', '任务奖励与终止方式决定实际评估时程。', '#readme'),
  'exploration': ('编辑归类', '程序生成地牢提供未知状态与探索需求。', '需定义探索进展，不能只看总分。', '#readme'),
  'memory': ('编辑归类', '探索过程中可研究过去信息的保留与使用。', '候选归类；须核对观测字段及历史设置。', '#readme'),
 },
 'hanabi': {
  'coordination': ('官方定位', '玩家为团队目标在受限信息下合作。', '合作卡牌；固定伙伴与陌生伙伴应分别评估。', '#readme'),
  'social': ('编辑归类', '合法提示与伙伴行为为信息推理提供线索。', '依赖伙伴协议；得分不能独立验证社会推理。', '#readme'),
  'strategy': ('编辑归类', '打牌、弃牌与提示之间存在收益取舍。', '合作博弈决策；不是对抗式战略评估。', '#readme'),
 },
 'football': {
  'coordination': ('编辑归类', '多受控球员设置可用于研究团队协作。', '仅当配置多个行动主体；不适用于所有场景。', '#readme'),
  'strategy': ('编辑归类', '比赛与场景提供攻防决策问题。', '短场景与完整比赛分别定义评估范围。', '#readme'),
  'control': ('编辑归类', '视觉或结构化状态驱动足球动作。', '需固定观测和受控球员设置。', '#readme'),
 },
 'rlcard': {
  'strategy': ('编辑归类', '多种卡牌环境支持规则和信息约束下的决策。', '游戏与对手协议必须另行指定。', '#readme'),
 },
 'minigrid': {
  'memory': ('任务文档', 'Memory 要求记住起始物体，并在走廊尽头选择匹配物体。', '仅 MiniGrid Memory 任务及对应观测设置。', 'https://minigrid.farama.org/environments/minigrid/MemoryEnv/#description'),
  'planning': ('编辑归类', 'DoorKey 要求先拿钥匙、开门，再到目标位置。', '仅该任务的前置依赖；不代表全部环境。', 'https://minigrid.farama.org/environments/minigrid/DoorKeyEnv/#description'),
  'generalization': ('编辑归类', '可配置任务族支持构建分布变化实验。', '需另行定义任务与训练/测试切分。', '#readme'),
 },
}

QUESTIONS = [
 dict(id='sustained',cap='long-horizon',label='长时程目标执行',title='长时程目标维持与持续执行',subtitle='Long-horizon execution',description='目标维持、阶段性进展与长期交互中的执行稳定性。',decision='本主题包含语言模型评估套件与原生 RL 环境；比较须基于明确的子任务与交互预算。',checks=['任务与阶段定义','动作 / 调用预算','进展与失败轨迹'],candidates={
  'balrog':'从现有 LLM / VLM 评估入口研究持续交互；需下钻子环境。',
  'minedojo':'为明确的 Minecraft 目标设置多阶段执行实验。',
  'nethack':'从原生 RL 环境研究探索、生存与累积进展。'}),
 dict(id='teamwork',cap='coordination',label='多智能体协作与通信',title='多智能体分工、协调与信息交互',subtitle='Coordination & communication',description='任务分工、通信行为、伙伴适应与去中心化协同控制。',decision='Collab-Overcooked 关注语言协作过程，SMACv2 关注局部观测下的协同控制，Hanabi 涉及有限提示与伙伴约定。',checks=['伙伴与角色','可共享的信息','团队结果 + 协作过程'],candidates={
  'collab-overcooked':'语言智能体协作；可查看发起、响应和冗余等过程指标。',
  'smacv2':'原生 MARL 微操；适合局部观测下的团队控制问题。',
  'hanabi':'有限提示与隐含信息；适合研究伙伴约定与团队推理。',
  'football':'仅在多受控球员配置下，研究空间协同与攻防行为。'}),
 dict(id='dependencies',cap='planning',label='规划与任务依赖',title='目标分解与前置依赖推理',subtitle='Planning & dependencies',description='目标分解、行动前置条件与反馈驱动的计划调整。',decision='本主题包含可解释的依赖任务与复杂游戏任务；动作抽象、信息量与任务复杂度影响结果的可比性。',checks=['任务依赖结构','计划与执行的区分','观测与动作抽象'],candidates={
  'smartplay':'先检查 Tower of Hanoi 等任务与对应能力设置。',
  'minigrid':'DoorKey 提供拿钥匙 → 开门 → 到达目标的可解释依赖。',
  'balrog':'从套件选多步目标任务，观察持续交互中的执行表现。',
  'minedojo':'通过明确的资源与制作目标研究多阶段依赖。'}),
 dict(id='transfer',cap='generalization',label='泛化与分布迁移',title='关卡、配置及任务分布变化下的泛化',subtitle='Generalization',description='未见关卡、场景随机化及任务分布变化下的性能。',decision='Procgen 涉及未见关卡，SMACv2 提供随机战斗配置，MiniGrid 支持可控任务变化；泛化结论依赖明确的训练与测试划分。',checks=['训练 / 测试切分','分布变化类型','相同训练预算'],candidates={
  'procgen':'面向程序生成关卡的 RL 泛化；可显式指定关卡范围。',
  'smacv2':'单位与起始位置随机化；额外定义未见分布后再检验迁移。',
  'minigrid':'可配置任务族用于自建对照；需要自行明确切分协议。'}),
 dict(id='tradeoffs',cap='strategy',label='策略与资源决策',title='资源约束与交互博弈中的策略决策',subtitle='Strategic decision-making',description='资源配置、攻防选择与信息约束下的策略权衡。',decision='本主题覆盖 RLCard 的卡牌决策、Football 的空间攻防及 Orak 中的策略游戏；各类任务具有不同的决策层级与收益定义。',checks=['决策范围','对手 / 伙伴协议','资源与收益定义'],candidates={
  'rlcard':'选择具体卡牌与对手，研究隐含信息下的决策。',
  'football':'区分短场景与完整比赛，研究空间攻防的取舍。',
  'orak':'选择套件中的策略游戏，再检查其工具与任务范围。',
  'hanabi':'在有限提示与团队收益间作取舍；属于合作博弈。'}),
 dict(id='recall',cap='memory',label='记忆与部分可观测性',title='历史信息保留与部分可观测决策',subtitle='Memory & partial observability',description='历史信息利用、记忆依赖与受限观测下的决策。',decision='MiniGrid Memory 具有明确的历史信息依赖；SmartPlay 和 NLE 提供更复杂的历史利用场景，需通过观测控制与消融设计区分记忆贡献。',checks=['当前不可见的信息','历史窗口','记忆机制消融'],candidates={
  'minigrid':'Memory 任务直接要求记住早期物体，证据定位到任务文档。',
  'smartplay':'从历史中学习的能力设置；要区分学习规律与信息记忆。',
  'nethack':'探索中的历史利用候选；需自行控制观测与历史以隔离贡献。'}),
]
