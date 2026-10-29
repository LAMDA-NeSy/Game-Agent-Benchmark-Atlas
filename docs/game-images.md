# Game screenshots

The first image batch covers 30 exact game-index IDs. Images are actual game/environment renderings from the linked upstream projects; Crafter shows the upstream terrain montage. An illustration does not claim that every linked benchmark uses the pictured renderer, or that an experiment has been reproduced.

`data/curation/game-images.json` records pinned source revisions, original Git blob and SHA-256 hashes, frame selection, crop (if any), output hashes, bilingual captions and credits. Optimized WebP assets are committed under `src/assets/game-images/`; building does not require an image-processing dependency or network access. Images are served locally by Pages and remain usable in a downloaded site.

Detail images preserve the full source frame except ViZDoom, which uses the first 320 × 240 panel of the upstream demo. Animated examples use a single documented frame. Resizing preserves aspect ratio without upscaling. Thumbnails use the same selected content. No generative images or reconstructed gameplay are used.

Upstream license texts, where provided at repository level, are retained under `src/assets/image-licenses/` and published alongside the site. These repository licenses do not establish a separate license for third-party game artwork. Credits and original source links are retained for that reason. ViZDoom has no root license returned by the GitHub license API; no blanket license is asserted for its screenshot.

## Sources

| Game ID | Displayed environment | Original image | Credit | Processing |
| --- | --- | --- | --- | --- |
| `minecraft` | Minecraft · MineDojo survival task | [MineDojo/MineDojo](https://github.com/MineDojo/MineDojo/blob/2731bc27394269643b43828d9db8ab3a364601f0/images/task_suite/survival/survival.png) | MineDojo Team · Minecraft: Mojang / Microsoft | Frame 0 |
| `overcooked` | Overcooked-AI research environment | [HumanCompatibleAI/overcooked_ai](https://github.com/HumanCompatibleAI/overcooked_ai/blob/739950a079cdaed5a44fcc662efc40244c205d06/images/screenshot.png) | Center for Human-Compatible AI · Overcooked-AI | Frame 0 |
| `starcraft-ii` | StarCraft II · SMACv2 surround configuration | [oxwhirl/smacv2](https://github.com/oxwhirl/smacv2/blob/577ab5a2cff2391f8df582da5731ea9cd6adf3c6/docs/imgs/surrounded.png) | SMACv2 contributors · StarCraft II: Blizzard Entertainment | Frame 0 |
| `crafter` | Crafter · generated terrain examples | [danijar/crafter](https://github.com/danijar/crafter/blob/e04542a2159f1aad3d4c5ad52e8185717380ee3a/media/terrain.png) | Danijar Hafner · Crafter | Frame 0 |
| `minigrid` | MiniGrid · DoorKey task | [Farama-Foundation/Minigrid](https://github.com/Farama-Foundation/Minigrid/blob/7f5853792ea7f04f75614661006d87fcf949f26d/docs/_static/videos/minigrid/DoorKeyEnv.gif) | Farama Foundation · MiniGrid | Frame 2 |
| `babyai` | BabyAI · GoToRedBall task | [Farama-Foundation/Minigrid](https://github.com/Farama-Foundation/Minigrid/blob/7f5853792ea7f04f75614661006d87fcf949f26d/docs/_static/videos/babyai/GoToRedBall.gif) | Farama Foundation · BabyAI / MiniGrid | Frame 4 |
| `nethack` | NetHack Learning Environment terminal view | [facebookresearch/nle](https://github.com/facebookresearch/nle/blob/862a439a84f52abca94d1f744d57061da12c5831/dat/nle/example_run.gif) | NLE contributors · NetHack DevTeam | Frame 1395 |
| `doom` | ViZDoom official demo · first-person panel | [Farama-Foundation/ViZDoom](https://github.com/Farama-Foundation/ViZDoom/blob/05780c300d6bdddb8f7b5e7da50d1369e3c6ccce/docs/_static/img/vizdoom-demo.gif) | ViZDoom contributors · Doom: id Software | Frame 25; first panel crop |
| `procgen-bigfish` | Procgen · Bigfish | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/bigfish.png) | OpenAI · Procgen | Frame 0 |
| `procgen-bossfight` | Procgen · Bossfight | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/bossfight.png) | OpenAI · Procgen | Frame 0 |
| `procgen-caveflyer` | Procgen · Caveflyer | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/caveflyer.png) | OpenAI · Procgen | Frame 0 |
| `procgen-chaser` | Procgen · Chaser | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/chaser.png) | OpenAI · Procgen | Frame 0 |
| `procgen-climber` | Procgen · Climber | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/climber.png) | OpenAI · Procgen | Frame 0 |
| `procgen-coinrun` | Procgen · Coinrun | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/coinrun.png) | OpenAI · Procgen | Frame 0 |
| `procgen-dodgeball` | Procgen · Dodgeball | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/dodgeball.png) | OpenAI · Procgen | Frame 0 |
| `procgen-fruitbot` | Procgen · Fruitbot | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/fruitbot.png) | OpenAI · Procgen | Frame 0 |
| `procgen-heist` | Procgen · Heist | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/heist.png) | OpenAI · Procgen | Frame 0 |
| `procgen-jumper` | Procgen · Jumper | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/jumper.png) | OpenAI · Procgen | Frame 0 |
| `procgen-leaper` | Procgen · Leaper | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/leaper.png) | OpenAI · Procgen | Frame 0 |
| `procgen-maze` | Procgen · Maze | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/maze.png) | OpenAI · Procgen | Frame 0 |
| `procgen-miner` | Procgen · Miner | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/miner.png) | OpenAI · Procgen | Frame 0 |
| `procgen-ninja` | Procgen · Ninja | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/ninja.png) | OpenAI · Procgen | Frame 0 |
| `procgen-plunder` | Procgen · Plunder | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/plunder.png) | OpenAI · Procgen | Frame 0 |
| `procgen-starpilot` | Procgen · Starpilot | [openai/procgen](https://github.com/openai/procgen/blob/37b521dbb530f0734fd82f72d921f5e0e715c0d1/screenshots/starpilot.png) | OpenAI · Procgen | Frame 0 |
| `chess` | PettingZoo · chess environment | [Farama-Foundation/PettingZoo](https://github.com/Farama-Foundation/PettingZoo/blob/b0fe02166d2106f8fcb6a6e0ca8125765699bdba/docs/environments/classic/classic_chess.gif) | Farama Foundation · PettingZoo | Frame 100 |
| `connect-four` | PettingZoo · connect-four environment | [Farama-Foundation/PettingZoo](https://github.com/Farama-Foundation/PettingZoo/blob/b0fe02166d2106f8fcb6a6e0ca8125765699bdba/docs/environments/classic/classic_connect_four.gif) | Farama Foundation · PettingZoo | Frame 50 |
| `hanabi` | PettingZoo · hanabi environment | [Farama-Foundation/PettingZoo](https://github.com/Farama-Foundation/PettingZoo/blob/b0fe02166d2106f8fcb6a6e0ca8125765699bdba/docs/environments/classic/classic_hanabi.gif) | Farama Foundation · PettingZoo | Frame 4 |
| `leduc-holdem` | PettingZoo · leduc-holdem environment | [Farama-Foundation/PettingZoo](https://github.com/Farama-Foundation/PettingZoo/blob/b0fe02166d2106f8fcb6a6e0ca8125765699bdba/docs/environments/classic/classic_leduc_holdem.gif) | Farama Foundation · PettingZoo | Frame 40 |
| `texas-holdem` | PettingZoo · texas-holdem environment | [Farama-Foundation/PettingZoo](https://github.com/Farama-Foundation/PettingZoo/blob/b0fe02166d2106f8fcb6a6e0ca8125765699bdba/docs/environments/classic/classic_texas_holdem.gif) | Farama Foundation · PettingZoo | Frame 40 |
| `tic-tac-toe` | PettingZoo · tic-tac-toe environment | [Farama-Foundation/PettingZoo](https://github.com/Farama-Foundation/PettingZoo/blob/b0fe02166d2106f8fcb6a6e0ca8125765699bdba/docs/environments/classic/classic_tictactoe.gif) | Farama Foundation · PettingZoo | Frame 33 |
