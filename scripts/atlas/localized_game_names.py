"""Chinese display names and search aliases; canonical identities stay unchanged."""
from .paths import ROOT, CURATION
import json

def integrate(payload):
    path=CURATION / 'game-name-localization.json'
    if not path.exists():return
    audit=json.loads(path.read_text());games={g['id']:g for g in payload['gameIndex']}
    for n in audit['names']:
        assert n['id'] in games,n['id']
        assert n['type'] in ['official','generic','common','descriptive'] and n['nameZh']
        assert n['source'].startswith('https://')
        g=games[n['id']]
        g.update(nameZh=n['nameZh'],nameType=n['type'],nameSource=n['source'],nameContext={'official':'官方中文版名称','generic':'通用玩法名称','common':'通行中文译名；非官方名称声明','descriptive':'中文说明性名称；非官方译名'}[n['type']])
        g['aliases']=list(dict.fromkeys(g.get('aliases',[])+[g['name'],n['nameZh']]+n.get('aliases',[])))
    payload['gameNameStats']={'added':len(audit['names']),'localized':sum(bool(g.get('nameZh')) for g in games.values())}
    (ROOT/'dist/game-name-localization.json').write_bytes(path.read_bytes())
