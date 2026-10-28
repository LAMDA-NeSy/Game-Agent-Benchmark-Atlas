"""Export the reviewed per-game resource uses without rebuilding the paper corpus."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def build():
    roles = json.loads((ROOT / 'game-resource-roles.json').read_text())
    from corpus_increment import reviewed_roles
    roles = reviewed_roles(roles)
    (ROOT / 'dist/game-roles-data.js').write_text(
        '/* Reviewed uses; new tasks require explicit mode review. */\n'
        'window.ATLAS_GAME_ROLES = ' + json.dumps(roles, ensure_ascii=False, indent=2) + ';\n'
    )
    followup = ROOT / 'game-use-followup.json'
    if followup.exists():
        (ROOT / 'dist/game-use-review.json').write_text(followup.read_text())
    return roles


if __name__ == '__main__':
    build()
