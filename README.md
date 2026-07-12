# Word Ladder · Kelime Merdiveni

A word-ladder game: change one letter at a time to climb from a start word to
a target word. Score is based on how close your path is to the shortest
possible path. Four dictionaries: English words, Turkish words, English
names, Turkish names -- built to be easy to extend with more.

Two modes:
- **Free Play** -- pick a dictionary and a word length (3-7), then climb.
- **Climb Mode** -- an open-ended run where each win raises the difficulty
  (longer words, then longer required paths) until you choose to stop.

## Stack

- React + Vite, no backend required to play.
- Supabase (optional) for a public leaderboard.
- Static build, deployed on Netlify.

## Run locally

```
npm install
npm run dev
```

## Dictionaries

Word lists live in `src/data/<category>/<length>.json` (lengths 3-7). Each
file contains **only words that are guaranteed reachable from every other
word in that file** -- they're the largest connected component of the
one-letter-change graph for that category/length, so puzzle generation can
never hand out an unsolvable pair. See `src/lib/wordGraph.js` for the BFS /
adjacency logic, and the data-processing notes below if you want to
regenerate or extend the lists.

Current sources (all public word/name lists, filtered and deduplicated):
- English words: Google's 10k common-English list, topped up with the dwyl
  `english-words` list for longer lengths where the common list runs thin.
  Filtered against the LDNOOBW blocklist.
- Turkish words: merged from two public Turkish word-list repos
  (Wiktionary-TR and TDK-derived sources).
- English names: a public first-names list (~5k names).
- Turkish names: a public Turkish given-names list (~9.7k names).

`scripts/build_dictionaries.py` regenerates everything in `src/data/` from
raw source lists (see `scripts/sources.md` for exactly which files to
download and from where). To add a new category (a themed word list,
another language, etc.):
1. Add your raw word/name list under `scripts/raw/`.
2. Extend `build_dictionaries.py` with a `clean_pool()` + `save()` call for
   it, following the existing four as a template.
3. Re-run the script -- it extracts the largest connected component per
   length so every puzzle is solvable (that's the important part: an
   arbitrary word list will have many isolated words with no valid
   one-letter neighbor, which is exactly what breaks puzzle generation).
4. Add an entry to `src/config/categories.js`.

Small print: `en_names` and `tr_names` are thin at length 7 (22 and 44 names
respectively) since public first-name lists skew short -- more than enough
to work, just less variety at that specific length. Worth revisiting if you
add a bigger name source later.

## Leaderboard (optional)

1. Create a free Supabase project.
2. In the SQL editor, run `supabase/schema.sql` from this repo.
3. Copy `.env.example` to `.env.local` and fill in your project URL and anon
   key (Project Settings -> API in Supabase).
4. Restart `npm run dev`.

Without those two env vars set, the game runs fine -- the leaderboard UI
just shows a short "not connected" note and score-saving is skipped.

Note on abuse: the insert policy in `schema.sql` is open (no auth), which
matches "no sign-up, just play." If spam becomes a problem, the cleanest fix
is a Netlify Function that validates a round server-side (replay the moves
against the dictionary) before writing to Supabase, rather than inserting
straight from the client.

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
  data/            dictionaries (JSON, per category/length) + loader
  config/          category metadata (labels, locale, accent colors)
  lib/             word-ladder graph algorithms, i18n strings, Supabase client
  hooks/           useGameEngine -- all game state and transitions
  components/      Home, GameScreen, ResultPanel, ClimbSummary, Leaderboard, ...
supabase/
  schema.sql       leaderboard table + RLS policies
```
