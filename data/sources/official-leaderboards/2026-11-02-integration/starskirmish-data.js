// StarSkirmish Bench v0.2 data: the one source for the numbers on /bench/v0-2/. v0-2/bench.js renders it and fills the
// counts in the page text ([data-stat] spans) from STATS.

// Models: display name, lab logo (/bench/labs/<lab>.svg) and Bench chart bar color.
export const MODELS = {
  astra: {"name": "GPT-6 Astra", "lab": "openai", "color": "#1F1F1F"},
  sol: {"name": "GPT-6.1 Sol", "lab": "openai", "color": "#1F1F1F"},
  luna: {"name": "GPT-6 Luna", "lab": "openai", "color": "#1F1F1F"},
  opus: {"name": "Claude Opus 5.5", "lab": "claude", "color": "#D4785F"},
  fable: {"name": "Claude Fable 5.1", "lab": "claude", "color": "#D4785F"},
  sonnet: {"name": "Claude Sonnet 5.5", "lab": "claude", "color": "#D4785F"},
  haiku: {"name": "Claude Haiku 5.5", "lab": "claude", "color": "#D4785F"},
  argon: {"name": "Gemini 4 Argon", "lab": "gemini", "color": "#34A853"},
  muse: {"name": "Muse Wonder Full", "lab": "meta", "color": "#0A7CFF"},
};

// Oct 14, 2026 tournament: each model's 5 final bots, each played against the 13 roster bots (human-written and demo)
// on 3 maps, 6 games per map. score is the bots' average win rate (0-100); a win counts 1, a loss 0, and a game at
// the 86,400 frame limit goes to the higher kill + razing score.
export const SCORES = [
  {"k": "astra", "score": 57.26},
  {"k": "sol", "score": 45.81},
  {"k": "argon", "score": 39.30},
  {"k": "opus", "score": 38.63},
  {"k": "fable", "score": 37.18},
  {"k": "sonnet", "score": 25.81},
  {"k": "muse", "score": 21.41},
  {"k": "haiku", "score": 21.03},
  {"k": "luna", "score": 13.08},
];

// Mean API cost of one 1-hour run in US$: each run's token use at the lab's API list prices (Muse Wonder Full at
// Muse Wonder's).
export const COSTS = {
  astra: 18.07,
  sol: 2.02,
  argon: 3.63,
  opus: 5.12,
  fable: 7.78,
  sonnet: 2.38,
  muse: 5.87,
  haiku: 0.98,
  luna: 0.57,
};

// Practice against the 7 strongest roster bots (TscmooP2, Steamhammer, McRave, BananaBrain, Locutus, Stardust and
// PurpleWave) during the hour: the median, over a model's runs, of the practice games its agent started against
// them.
export const PRACTICE = {
  astra: 159,
  sol: 87.5,
  argon: 54,
  opus: 18,
  fable: 0,
  sonnet: 22,
  muse: 2,
  haiku: 0,
  luna: 0,
};

// Each model's 5 runs: the win rate (0-100) of each run's final bot, as SCORES. A model's score is their mean.
export const RUNS = {
  astra: [61.97, 58.12, 57.69, 55.98, 52.56],
  sol: [51.28, 50.0, 49.15, 40.17, 38.46],
  argon: [50.0, 40.52, 39.74, 33.76, 32.48],
  opus: [42.74, 41.03, 38.03, 36.32, 35.04],
  fable: [41.45, 38.03, 37.18, 35.47, 33.76],
  sonnet: [32.91, 32.05, 29.06, 22.22, 12.82],
  muse: [26.07, 21.79, 21.37, 19.66, 18.18],
  haiku: [31.62, 20.09, 19.66, 17.52, 16.24],
  luna: [19.23, 17.52, 14.1, 8.12, 6.41],
};

// Games against the strongest human-written bots, Stardust and PurpleWave (tier S) and BananaBrain (tier A), as
// [wins, games] of each model's 5 bots (3 maps x 6 games each: 90, less a few void games). A model's blend is the
// mean of its three win rates.
export const VS_TOP = {
  astra: { stardust: [6, 90], purplewave: [9, 90], bananabrain: [4, 90] },
  sol: { stardust: [0, 90], purplewave: [4, 90], bananabrain: [4, 90] },
  argon: { stardust: [0, 90], purplewave: [5, 88], bananabrain: [0, 90] },
  opus: { stardust: [0, 90], purplewave: [1, 90], bananabrain: [0, 90] },
  fable: { stardust: [0, 90], purplewave: [1, 90], bananabrain: [0, 90] },
  sonnet: { stardust: [0, 90], purplewave: [4, 90], bananabrain: [0, 90] },
  muse: { stardust: [0, 90], purplewave: [2, 87], bananabrain: [0, 90] },
  haiku: { stardust: [0, 90], purplewave: [4, 90], bananabrain: [2, 90] },
  luna: { stardust: [0, 90], purplewave: [0, 90], bananabrain: [0, 90] },
};
// Stardust against the same three, for reference: its Oct 14 games against the roster, 18 per opponent, with the
// mirror counted as an even 50%.
export const STARDUST_VS_TOP = { stardust: [9, 18], purplewave: [3, 18], bananabrain: [11, 18] };

// Spearman rho between each public benchmark and SCORES, over the models the benchmark scores (read 2026-10-15):
// the Artificial Analysis Intelligence Index (v4.3.2) and Terminal-Bench 4.0 (each model's max-effort listing),
// Vals's Terminal-Bench 4.0 and IOI, and WeirdML v3. A * marks a benchmark that scores only some of the 9 models; the
// chart shows its n.
export const CORRELATIONS = [
  { benchmark: 'Intelligence Index (AA)', rho: 0.26, n: 9 },
  { benchmark: 'Terminal-Bench 4.0 (AA)', rho: 0.49, n: 9 },
  { benchmark: 'Terminal-Bench 4.0 (Vals)', rho: 0.42, n: 9 },
  { benchmark: 'Vals IOI', rho: 0.95, n: 9 },
  { benchmark: 'WeirdML v3*', rho: 1.0, n: 7 },
];

// Each benchmark's score for each model it scores, as read for CORRELATIONS (WeirdML v3 as a percentage). The
// small scatters under the correlation chart plot these against SCORES.
export const BENCH_SCORES = {
  'Intelligence Index (AA)': { opus: 58, sonnet: 56, muse: 56, fable: 53, astra: 53, argon: 53, sol: 52, haiku: 43, luna: 38 },
  'Terminal-Bench 4.0 (AA)': { sonnet: 63.6, opus: 59.6, astra: 59.1, muse: 57.1, argon: 57.1, sol: 56.1, fable: 52.0, haiku: 32.8, luna: 12.6 },
  'Terminal-Bench 4.0 (Vals)': { opus: 65.15, sonnet: 64.14, astra: 59.6, fable: 58.08, muse: 58.08, argon: 57.58, sol: 55.05, haiku: 36.36, luna: 13.64 },
  'Vals IOI': { argon: 100, astra: 100, sol: 96.89, opus: 95.06, fable: 90.78, sonnet: 83.06, muse: 79.83, luna: 55.56, haiku: 47.28 },
  'WeirdML v3*': { astra: 42.2, sol: 38.3, opus: 31.2, fable: 26.0, sonnet: 19.9, haiku: 11.7, luna: 7.9 },
};

const BOTS_PER_MODEL = 5, OPPONENTS = 13, MAPS = 3, GAMES_PER_MAP = 6;
export const STATS = {
  bots: SCORES.length * BOTS_PER_MODEL,
  opponents: OPPONENTS,
  games: SCORES.length * BOTS_PER_MODEL * OPPONENTS * MAPS * GAMES_PER_MAP,
  gamesPerPair: MAPS * GAMES_PER_MAP,
  gamesPerBot: OPPONENTS * MAPS * GAMES_PER_MAP,
};

// Model cards for the two new flagships (New AI Model Highlights).
// clip_src: a replay clip under https://media.starskirmish.com/bench/clips/ (<clip_src>.mp4, <clip_src>.jpg poster).
export const MODEL_CARDS = [
 {
  "k": "argon",
  "clip": "Argon's one big push meets an equal army at 192 supply, and Psionic Storms win the trade",
  "clip_src": "v0-2/argon-skynet",
  "details": [
   "Gemini 4 Argon uniquely preferred writing bots via one shots. Its five runs had the fewest builds and code versions of all the traced runs.",
   "41% of its practice games were against high tier opponents, second only to GPT-6 Astra, yet its bots win only 7% of their games against those tiers, to Astra's 28%."
  ],
  "arch": "timing",
  "strat_theme": "One Big Push",
  "strat": "Dragoons and Zealots held at home behind cannons for one big push.",
  "units": [
   {
    "icons": [
     "reaver"
    ],
    "name": "Reaver",
    "text": "Its second best bot builds Reavers in over 70% of its games."
   }
  ]
 },
 {
  "k": "muse",
  "clip": "Muse's Zealot flood runs down a Dragoon army",
  "clip_src": "v0-2/muse",
  "details": [
   "It averages 2.5 upgrades a game, the most in the field.",
   "Like Muse Spark 1.3 in v0.1, it practiced almost exclusively against the easiest opponents. Only 1% of its practice matches were against tier B or harder."
  ],
  "arch": "macro",
  "strat_theme": "Outnumber First",
  "strat": "Fast expand into 5 to 9 Gateways, attacking only once it outnumbers the army it has seen.",
  "units": [
   {
    "icons": [
     "observer"
    ],
    "name": "Observer",
    "text": "3 per game, the most of any model and 1.6x the field."
   },
   {
    "icons": [
     "zealot"
    ],
    "name": "Zealot",
    "text": "22 per game, as in v0.1 a Zealot-heavy army."
   }
  ]
 }
];
