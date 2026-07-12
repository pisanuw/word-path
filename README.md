# Ladder Games · Merdiven Oyunları

Two puzzle games, one app:

- **Word Ladder** -- change one letter at a time to climb from a start word
  to a target word. Score is based on how close your path is to the
  shortest possible path. Four dictionaries: English words, Turkish words,
  English names, Turkish names -- built to be easy to extend with more.
- **Number Ladder** -- given a set of numbers, combine them with
  `+ − × ÷ ^` (tap two numbers, then an operator, repeat) to hit a target
  number, or get as close as you can. Classic "Countdown numbers game"
  rules: use some or all of the numbers, each at most once.

Both games share the same two modes:
- **Free Play** -- pick your settings (dictionary/length, or number
  count/range), then play a single round.
- **Climb Mode** -- an open-ended run where difficulty increases each round
  until you choose to stop.

Both also share a **Hint** button (`src/lib/hints.js`): a nudge, not the
answer -- Word Ladder points at which letter position to change next (not
what to change it to), Number Ladder highlights which two numbers to
combine next (not the operator or result). Each hint costs a flat 10 points
off that round's score, floored at 0, so heavy hint use is self-limiting
rather than needing a hard cap on hint count. Hints used are stored with
the leaderboard entry (`hints_used`) so it's visible alongside the score.

## Stack

- React + Vite, no backend required to play.
- Supabase (optional) for a public leaderboard.
- Static build, deployed on Netlify.

## Run locally

```
npm install
npm run dev
```

## Word Ladder dictionaries

Word lists live in `src/data/<category>/<length>.json` (lengths 3-7). Each
file contains **only words that are guaranteed reachable from every other
word in that file** -- they're the largest connected component of the
one-letter-change graph for that category/length, so puzzle generation can
never hand out an unsolvable pair. See `src/lib/wordGraph.js` for the BFS /
adjacency logic.

Current sources (all public word/name lists, filtered and deduplicated):
- English words: Google's 10k common-English list, topped up with the dwyl
  `english-words` list for longer lengths where the common list runs thin.
  Filtered against the LDNOOBW blocklist.
- Turkish words: merged from two public Turkish word-list repos
  (Wiktionary-TR and TDK-derived sources).
- English names: a public first-names list (~5k names).
- Turkish names: a public Turkish given-names list (~9.7k names).

`scripts/build_dictionaries.py` regenerates everything in `src/data/` from
raw source lists (see `scripts/sources.md`). To add a new category:
1. Add your raw word/name list under `scripts/raw/`.
2. Extend `build_dictionaries.py` with a `clean_pool()` + `save()` call for
   it, following the existing four as a template.
3. Re-run the script -- it extracts the largest connected component per
   length so every puzzle is solvable.
4. Add an entry to `src/config/categories.js`.

Small print: `en_names` and `tr_names` are thin at length 7 (22 and 44 names
respectively) since public first-name lists skew short -- still playable,
just less variety at that specific length.

## Number Ladder rules

Implemented in `src/lib/mathSolver.js`, kept deliberately unambiguous so
there's never a confusing "wrong order" failure:
- **+** and **×**: order doesn't matter.
- **−**: always `|a - b|` (never negative, never zero -- a zero result is
  rejected since it's a dead end for further combining).
- **÷**: always `larger ÷ smaller`, only valid when it divides evenly.
- **^**: order matters (`a^b`), since `2^3 != 3^2`.
- Every result must be a positive whole number and no larger than
  1,000,000, or the move is rejected with a friendly error.

`src/lib/mathSolver.js` also has `solveClosest()`, a memoized search over
every reachable *set* of remaining numbers, used to (a) make sure a
generated puzzle actually has a good solution, and (b) show "best possible"
on the result screen next to your own result. It comfortably handles 6
starting numbers in well under a second.

Puzzle generation (`src/lib/mathPuzzle.js`) has three number-range presets
(`small` 1-10, `classic` a couple of Countdown-style large numbers mixed in,
`big` up to 100), each with its own target range. Climb Mode walks through
count 4 -> 5 -> 6 on `small`, then `classic`, then `big`.

Score is a straight accuracy percentage: `100 - (|your answer - target| /
target) * 100`, floored at 0, capped at 100 for an exact hit. The "best
possible" shown on the result screen is informational (from the solver) and
doesn't affect your score -- getting close counts, even if a cleverer path
existed.

## Leaderboard (optional)

1. Create a free Supabase project.
2. In the SQL editor, run `supabase/schema.sql`, then
   `supabase/002_add_math_game.sql`, then `supabase/003_add_hints.sql` (each
   adds columns to the same `leaderboard` table).
3. Copy `.env.example` to `.env.local` and fill in your project URL and
   publishable/anon key (Project Settings -> API in Supabase).
4. Restart `npm run dev`.

Without those two env vars set, the game runs fine -- the leaderboard UI
just shows a short "not connected" note and score-saving is skipped.

Note on abuse: the insert policy is open (no auth), which matches "no
sign-up, just play." If spam becomes a problem, the cleanest fix is a
Netlify Function that validates a round server-side before writing to
Supabase, rather than inserting straight from the client.

## Deploy to Netlify

1. Push this repo to GitHub.
2. In Netlify: "Add new site" -> "Import an existing project" -> pick the
   repo. Build command and publish directory are already set via
   `netlify.toml` (`npm run build` / `dist`).
3. If you're using the leaderboard, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` under Site settings -> Environment variables,
   then redeploy.

## Project layout

```
src/
  data/            word-ladder dictionaries (JSON, per category/length) + loader
  config/          category metadata (labels, locale, accent colors)
  lib/
    wordGraph.js       word-ladder adjacency/BFS/scoring
    mathSolver.js       number-combination rules + closest-value solver
    mathPuzzle.js        number puzzle generation (presets, target ranges)
    i18n.js               EN/TR UI strings
    supabaseClient.js       leaderboard read/write
  hooks/
    useGameEngine.js      Word Ladder game state and transitions
    useMathGameEngine.js  Number Ladder game state and transitions
  components/
    Home, GameScreen, ResultPanel, ClimbSummary        (Word Ladder)
    MathGameScreen, MathResultPanel, MathClimbSummary  (Number Ladder)
    Leaderboard, Hero, SaveScoreForm                    (shared)
supabase/
  schema.sql              leaderboard table + RLS policies (run first)
  002_add_math_game.sql   adds Number Ladder columns (run second)
  003_add_hints.sql       adds hints_used column (run third)
```
