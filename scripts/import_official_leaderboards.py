#!/usr/bin/env python3
"""Import saved official HTML tables. No network access or inferred scores.

Usage: python3 scripts/import_official_leaderboards.py --balrog page.html --orak page.html --captured-at 2026-11-01T14:00:00+00:00
"""
import argparse
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]

class Tables(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = {}
        self.table = self.row = self.cell = None
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'table':
            self.table = {'id': attrs.get('id'), 'rows': []}
        elif self.table is not None and tag == 'tr':
            self.row = {'attrs': attrs, 'cells': []}
        elif self.row is not None and tag in ('td', 'th'):
            self.cell = {'tag': tag, 'attrs': attrs, 'text': '', 'links': []}
        elif self.cell is not None and tag == 'a' and attrs.get('href'):
            self.cell['links'].append(attrs['href'])
    def handle_data(self, text):
        if self.cell is not None:
            self.cell['text'] += text
    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.cell is not None:
            self.cell['text'] = ' '.join(self.cell['text'].split())
            self.row['cells'].append(self.cell)
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            if self.row['cells']:
                self.table['rows'].append(self.row)
            self.row = None
        elif tag == 'table' and self.table is not None:
            self.tables[self.table['id']] = self.table
            self.table = None

def bi(zh, en):
    return {'zh': zh, 'en': en}

GAME_NAMES = {
    'BabyAI': ('babyai', 'BabyAI'), 'Crafter': ('crafter', 'Crafter'),
    'TextWorld': ('textworld', 'TextWorld'), 'BabaIsAI': ('babaisai', 'BabaIsAI'),
    'MiniHack': ('minihack', 'MiniHack'), 'NetHack': ('nethack', 'NetHack'),
    'StreetFighterIII': ('street-fighter-iii', '街头霸王 III'), 'Supermario': ('super-mario', '超级马力欧'),
    'AceAttorney': ('ace-attorney', '逆转裁判'), 'HerStory': ('her-story', '她的故事'),
    'Pokémon': ('pokemon', 'Pokémon'), 'DarkestDun': ('darkest-dungeon', '暗黑地牢'),
    'MineCraft': ('minecraft', '我的世界'), 'StardewValley': ('stardew-valley', '星露谷物语'),
    'StarCraftII': ('starcraft-ii', '星际争霸 II'), 'SlayTheSpire': ('slay-the-spire', '杀戮尖塔'),
    'BabaIsYou': ('baba-is-you', 'Baba Is You'), '2048': ('2048', '2048')
}

def import_board(table, board_id, project, mode, source, capture):
    headers = [c['text'] for c in table['rows'][0]['cells']]
    rows = table['rows'][1:]
    assert headers[0] in ('Agent', 'Model (Agentic Strategy)'), headers
    aggregate = headers[1]
    assert aggregate == ('% Progress' if project == 'balrog' else 'Avg.Rank'), aggregate
    columns = []
    for i, title in enumerate(headers[1:], 1):
        if title == 'Date':
            continue
        game_title = title.removeprefix('Elo in ')
        assert game_title in GAME_NAMES or title == aggregate, title
        key, zh = GAME_NAMES.get(game_title, ('overall', '平均进度' if project == 'balrog' else '平均名次'))
        columns.append({'id': key, 'sourceColumn': i, 'sourceLabel': title,
                        'label': bi(zh if key != 'overall' else zh, game_title if key != 'overall' else ('Mean progress' if project == 'balrog' else 'Average rank')),
                        'direction': 'asc' if title == 'Avg.Rank' else 'desc',
                        'unit': '%' if project == 'balrog' else ('Elo' if title.startswith('Elo in ') else ''),
                        'isOverall': key == 'overall'})
    entries = []
    for i, row in enumerate(rows, 1):
        cells = row['cells']
        assert len(cells) == len(headers), (board_id, i, len(cells), len(headers))
        original = cells[0]['text']
        agent = re.sub(r'[🥇🥈🥉🕹✔✓\ufe0f]', '', original).strip()
        scores = {}
        for col in columns:
            c = cells[col['sourceColumn']]
            raw = c['text']
            match = re.fullmatch(r'(-?\d+(?:\.\d+)?)(?:\s*±\s*(\d+(?:\.\d+)?))?', raw)
            assert match, (board_id, agent, raw)
            value = float(match[1])
            sort_value = float(c['attrs'].get('data-order', value))
            scores[col['id']] = {'display': raw, 'value': value, 'sortValue': value, 'sourceSortValue': sort_value,
                                 'spread': float(match[2]) if match[2] else None}
        date = cells[-1]['text'] if headers[-1] == 'Date' else None
        if date:
            assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', date)
        detail = None
        if project == 'balrog':
            m = re.search(r"window.location.href='([^']+)'", row['attrs'].get('onclick', ''))
            if m:
                detail = urljoin(source['url'], m[1])
        entries.append({'id': f'{board_id}-{i:03}', 'agent': agent, 'sourceAgent': original,
                        'sourceRow': i, 'officialChecked': bool(re.search('[✔✓]', original)),
                        'agentCodeOpen': '🕹' in original, 'submissionDate': date,
                        'scores': scores, 'resultUrl': detail or source['url']+'#'+table['id']})
    assert len(set(e['agent'] for e in entries)) == len(entries)
    if project == 'balrog':
        protocol = {
            'scope': bi(f'{mode} 赛道；按本榜单列出的环境分别报告进度。', f'{mode} track, with progress reported for each environment listed in this table.'),
            'scoring': bi('综合列为官方平均完成进度，越高越好；单环境保留官方百分比成绩。', 'The overall column is the official mean completion progress (higher is better); environment scores retain the official percentages.'),
            'variation': bi('± 数值按官方页面保留；其统计定义和运行设置以对应提交日志为准。', '± values are retained as published. Their statistical definition and run settings should be read from the corresponding submission logs.'),
            'verification': bi('Checked 为 BALROG 团队复现抽样结果后的来源标记；本站未重新运行这些评测。', 'Checked is assigned by the BALROG team after reproducing a subset of results; these scores were not rerun by Atlas.'),
            'dates': bi('成绩日期为官方 metadata 中的提交日期，不作为实验执行日期。', 'Entry dates are submission dates from official metadata, not evaluation execution dates.'),
            'links': [
                {'label':bi('官方提交与核验协议','Official submission & verification'), 'url':'https://balrogai.com/submit.html'},
                {'label':bi('评测实现','Evaluation implementation'), 'url':'https://github.com/balrog-ai/BALROG'},
                {'label':bi('官方提交日志库','Official submission logs'), 'url':'https://github.com/balrog-ai/experiments'},
                {'label':bi('论文','Paper'), 'url':'https://arxiv.org/abs/2411.13543'}]}
        title = bi('BALROG · '+mode, 'BALROG · '+mode)
    else:
        arena = mode == 'arena'
        protocol = {
            'scope': bi('StreetFighterIII 与 StarCraftII 对战赛道。' if arena else '12 款游戏成绩；模型名后保留官方 Agent 策略配置。', 'Battle track for StreetFighterIII and StarCraftII.' if arena else 'Scores across 12 games; the official agentic strategy is retained after each model name.'),
            'scoring': bi('保留官方 Avg.Rank（越低越好），以及两款游戏的 Elo（越高越好）。' if arena else '综合列保留官方 Avg.Rank，越低越好；单游戏展示原始官方成绩，越高越好。', 'Retains official Avg.Rank (lower is better) and game-specific Elo (higher is better).' if arena else 'The overall column retains official Avg.Rank (lower is better); individual game scores are shown as published (higher is better).'),
            'variation': bi('Elo 数值按官方榜单保留。' if arena else '± 数值按官方页面保留，具体运行次数和统计方式见论文及原始日志。', 'Elo values are retained as published.' if arena else '± values are retained as published; repetitions and statistical definitions are available in the paper and original logs.'),
            'verification': bi('Checked 为 Orak 团队接收代码并复现成绩后的来源标记；本站未重新运行。', 'Checked is assigned by the Orak team after accepting code and reproducing scores; Atlas has not rerun these evaluations.'),
            'dates': bi('官方页面标注更新于 2025-06-09，未提供逐条成绩的提交日期。', 'The official page states a last update of 2025-06-09 and provides no per-entry submission dates.'),
            'links': [
                {'label':bi('官方提交与评测协议','Official submission & evaluation'), 'url':'https://github.com/krafton-ai/Orak/blob/release/docs/submission_guideline.md'},
                {'label':bi('评测实现与配置','Evaluation implementation & configurations'), 'url':'https://github.com/krafton-ai/Orak'},
                {'label':bi('论文与指标定义','Paper & metric definitions'), 'url':'https://arxiv.org/abs/2506.03610'}]}
        title = bi('Orak · 对战 Elo' if arena else 'Orak · 游戏成绩', 'Orak · Battle Elo' if arena else 'Orak · Game scores')
    return {'id':board_id, 'benchmarkId':project, 'title':title, 'mode':mode,
            'source':{**source, 'tableId':table['id'], 'snapshotAt':capture}, 'protocol':protocol,
            'columns':columns, 'entries':entries}

def main():
    p=argparse.ArgumentParser();p.add_argument('--balrog',type=Path,required=True);p.add_argument('--orak',type=Path,required=True);p.add_argument('--captured-at',required=True)
    args=p.parse_args();boards=[];raw=[]
    for project,url,modes in [('balrog','https://balrogai.com/', [('LLM','leaderboard-table-LLM'),('VLM','leaderboard-table-VLM')]),('orak','https://krafton-ai.github.io/orak-leaderboard/', [('performance','performance-table-leaderboard'),('arena','performance-table-arena')])]:
        content=getattr(args,project).read_bytes();parser=Tables();parser.feed(content.decode())
        source={'url':url,'pageSha256':hashlib.sha256(content).hexdigest(),'pageUpdatedAt':'2025-06-09' if project=='orak' else None}
        for mode,tid in modes:
            table=parser.tables[tid];raw.append({'source':source,'table':table})
            boards.append(import_board(table,project+'-'+mode.lower(),project,mode,source,args.captured_at))
    archive='data/sources/official-leaderboards/'+args.captured_at[:10]+'-tables.json'
    output={'schemaVersion':1,'capturedAt':args.captured_at,'sourceSnapshot':archive,'boards':boards}
    (ROOT/archive).parent.mkdir(parents=True,exist_ok=True)
    (ROOT/archive).write_text(json.dumps({'capturedAt':args.captured_at,'tables':raw},ensure_ascii=False,indent=2)+'\n')
    (ROOT/'data/curation/official-leaderboards.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    for b in boards:print(b['id'],len(b['entries']),'entries',len(b['columns'])-1,'games')

if __name__=='__main__':main()
