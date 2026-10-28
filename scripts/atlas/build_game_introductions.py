"""Export bilingual gameplay copy separately from research attribution records."""
from .paths import ROOT, CURATION
import json
import shutil

def build():
    root=ROOT
    content=json.loads((CURATION / 'game-introductions.json').read_text())
    review=json.loads((CURATION / 'game-introduction-review.json').read_text())
    from .corpus_increment import introductions
    content,review=introductions(content,review)
    copy_file=CURATION / 'game-introduction-copy.json'
    if copy_file.exists():
        revision=json.loads(copy_file.read_text())
        patches={r['id']:r for r in revision['records']}
        assert len(patches)==len(revision['records']), 'Duplicate gameplay copy ID'
        known_ids={id for e in content['entries'] for id in e['ids']}
        assert set(patches)<=known_ids, 'Copy revision must not invent game identities'
        for entry in content['entries']:
            matched=[patches[id] for id in entry['ids'] if id in patches]
            if not matched:
                continue
            assert len(matched)==len(entry['ids']), 'A grouped introduction needs an exact scoped revision'
            assert len({(r['zh'],r['en']) for r in matched})==1
            patch=matched[0]
            entry.update(zh=patch['zh'],en=patch['en'],copyEditedAt=revision['editedAt'])
        content['copyRevision']={
            'version':revision['version'], 'editedAt':revision['editedAt'],
            'expanded':sum(r['status']=='expanded' for r in revision['records']),
            'retained':sum(r['status']=='retained' for r in revision['records']),
        }
        content['updatedAt']=revision['editedAt']
    reviewed={r['id'] for r in review['records']}
    ids=[i for entry in content['entries'] for i in entry['ids']]
    assert len(ids)==len(set(ids)), 'Duplicate introduction ID'
    assert set(ids)<=reviewed, 'Introduction without a reviewed game identity'
    assert 'nameRules' not in content, 'Gameplay must not be inferred from names'
    for entry in content['entries']:
        assert entry['zh'].strip() and entry['en'].strip(), entry['ids']
        assert entry['source'].startswith('https://'), entry['ids']
        assert entry.get('checkedAt') and entry.get('basis'), entry['ids']
    assert content['stats']['described']==len(ids)
    (root/'dist/game-introductions.js').write_text('window.ATLAS_GAME_INTRODUCTIONS = '+json.dumps(content,ensure_ascii=False,indent=2)+';\n')
    (root/'dist/game-introduction-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
    followup=CURATION / 'game-introduction-followup.json'
    if followup.exists():
        shutil.copyfile(followup,root/'dist/game-introduction-followup.json')

if __name__ == '__main__':
    build()
