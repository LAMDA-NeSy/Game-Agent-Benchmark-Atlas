"""Public selection ledger; reasons are editorial decisions, not paper claims."""
import json

DECISIONS={
'GAB080':('recommended','保留 Crafter，观察生存约束下的持续进展。','Retain Crafter for sustained progress under survival constraints.'),
'GAB057':('recommended','保留汉诺塔与老虎机，作为依赖规划和交互学习的可解释任务。','Retain Hanoi and bandits as interpretable dependency-planning and online-learning tasks.'),
'GAB100':('recommended','保留语言协作过程，与陌生策略伙伴评测互补。','Retain language collaboration as a complement to evaluation with unfamiliar policy partners.'),
'GAB106':('recommended','选择完整 SC2 对局；Minecraft 合成为扩展，明确动作抽象。','Select full SC2 matches; retain Minecraft crafting as an extension with explicit action abstraction.'),
'GAB001':('recommended','拆到 CoinRun 与 Dodgeball，分别侧重未见关卡和空间控制。','Use CoinRun and Dodgeball for held-out levels and spatial control respectively.'),
'GAB010':('recommended','有限通信和隐藏手牌提供伙伴信息推理任务。','Limited communication and hidden own cards support partner-information reasoning.'),
'GAB104':('recommended','加入增长序列的记忆负荷，避免只用单线索匹配代表记忆。','Add growing sequence load rather than representing memory solely with single-cue matching.'),
'GAB018':('recommended','加入符号版隐藏规则发现，补充 bandit 的简单随机收益学习。','Add symbolic hidden-rule discovery beyond simple stochastic bandit rewards.'),
'GAB091':('recommended','加入生产链任务，补充生存类长时程；按具体配置确认时程。','Add production chains beyond survival tasks; establish the horizon for the selected configuration.'),
'GAB063':('recommended','加入固定陌生伙伴池，拓展协作评价协议。','Add a fixed unfamiliar-partner pool to broaden coordination protocols.'),
'GAB041':('extension','Memory 延迟匹配保留为简单诊断对照，可按成本替换。','Retain Memory delayed matching as a simple diagnostic or lower-cost alternative.'),
'GAB040':('extension','保留去中心化微操扩展，与完整 SC2 对局分开计分。','Retain decentralized micromanagement as an extension, separate from full SC2 matches.'),
'GAB028':('reserve','任务空间宽；优先固定成功判据与控制层级后再增加，避免重复 Minecraft 覆盖。','Broad task space; first pin success criteria and control granularity, avoiding redundant Minecraft coverage.'),
'GAB004':('reserve','保留复杂探索候选；先解决具体任务与游戏知识对表现的影响。','Retain for complex exploration; first specify tasks and the role of game knowledge.'),
'GAB007':('reserve','可补充团队运动；需先区分单策略多单位控制与多策略协作。','Potential team-sport extension; separate one-policy multi-unit control from multi-policy coordination.'),
'GAB011':('reserve','平台不是单一任务；先选牌种、规则与对手池再纳入。','A platform is not one task; choose a card game, rules and opponent pool first.'),
'GAB048':('review','作为记忆对照池，进一步核对游戏子任务及与 Memory Gym 的增量价值。','Memory comparison pool; review specific game tasks and incremental value over Memory Gym.'),
'GAB094':('review','物理控制候选；需单独定义任务分布及训练和评测条件。','Physics-control candidate; separately define task distribution and training/evaluation conditions.'),
'GAP-A4':('review','Minecraft 多模态协作候选；需继续核对具体任务、硬件成本和队伍配置。','Multimodal Minecraft cooperation candidate; review concrete tasks, hardware cost and team configuration.'),
'GAB013':('review','社会互动候选池；先选择具体底座和评测群体，再判断与 Hanabi 的互补性。','Social-interaction pool; select a substrate and evaluation population before assessing complementarity to Hanabi.'),
'GAP-A8':('review','社会推理扩展候选；需固定角色与对手，分开统计不同阵营；保留 Workshop 身份。','Social-reasoning extension; fix roles/opponents and separate faction outcomes. Preserve workshop publication status.'),
'GAB075':('review','回合制战略候选；核对任务边界和回合预算后，与实时战略形成互补。','Turn-based strategy candidate; review task boundaries and turn budgets for complementarity to RTS tasks.'),
'GAB105':('review','多游戏套件候选；先逐子游戏核查，避免直接以套件名计为新增能力。','Multigame suite candidate; inspect subgames before counting new capability coverage.'),
'AX26-2601.16690':('review','情景记忆候选；需对齐暴露和提问协议，保留预印本身份。','Episodic-memory candidate; align exposure and question protocols and retain preprint status.'),
}

def write(records,path,library=None):
 rows=[]
 for key,(decision,zh,en) in DECISIONS.items():
  r=records[key]
  rows.append(dict(id=key,title=r['title'],name=r.get('short') or r['title'],year=r['year'],venue=r['venue'],source=r['source_url'],decision=decision,reason=dict(zh=zh,en=en)))
 if library:
  from .arena_catalog_additions import CATALOG
  byid={r['id']:r for r in library['records']}
  profiled={r['profileId']:r['id'] for r in library['records'] if r.get('profileId')}
  for task in CATALOG['tasks']:
   key=profiled.get(task['benchmark'],task['benchmark']);r=byid[key]
   existing=next((x for x in rows if x['id']==key),None)
   decision='recommended' if task['core'] else 'extension'
   if existing:
    # Keep a core decision when the same source also contributes extensions.
    if task.get('curationRound')=='v17':existing.update(decision=decision,reason=task['why'])
   else:rows.append(dict(id=key,title=r['title'],name=r['name'],year=r['year'],venue=r['venue'],source=r['paper'],decision=decision,reason=task['why']))
 payload=dict(corpusRecords=len(library['records']) if library else len(records),checkedAt='2026-10-18',scope='Title-level screening of the complete research collection; targeted task and protocol review, not exhaustive runtime verification.',records=rows)
 path.write_text('window.ArenaSelection='+json.dumps(payload,ensure_ascii=False,indent=2)+';\n')
