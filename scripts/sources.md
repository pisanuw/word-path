# Raw data sources

Download these into a `raw/` folder next to `build_dictionaries.py`, using
these exact filenames, then run `python3 build_dictionaries.py` (only needs
the standard library). It writes `src/data/<category>/<length>.json`.

| file | source |
|---|---|
| `en_common.txt` | https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt |
| `en_words.txt` | https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt |
| `profanity.txt` | https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en |
| `tr_words_1.txt` | https://raw.githubusercontent.com/mertemin/turkish-word-list/master/words.txt |
| `tr_words_2.txt` | https://raw.githubusercontent.com/maidis/mythes-tr/master/veriler/kelime-listesi.txt |
| `en_names_1.txt` | https://raw.githubusercontent.com/dominictarr/random-name/master/first-names.txt |
| `tr_names.csv` | https://gist.githubusercontent.com/kvtoraman/f300ae077828c6940d96cd3b19181b3f/raw/turkish_names.csv |

All are third-party public lists with their own licenses -- check before
redistributing the raw files themselves; the processed JSON in `src/data`
only keeps single words/names (no definitions or other copyrightable
material) and is filtered/deduplicated/restructured into per-length
connected-component word-ladder graphs.

The script's core step (`giant_component_capped`) is the important part if
you adapt it for a new source: it throws away every word that has no valid
one-letter-change neighbor in its length group, so puzzle generation never
proposes an unsolvable start/end pair.
