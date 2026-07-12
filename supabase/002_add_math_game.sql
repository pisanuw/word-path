-- Adds Number Ladder (math game) support to the leaderboard created by
-- schema.sql. Run this after schema.sql, once, in the Supabase SQL editor.

alter table leaderboard add column if not exists game text not null default 'words';
alter table leaderboard add constraint leaderboard_game_check check (game in ('words', 'numbers'));

alter table leaderboard add column if not exists target_number integer;
alter table leaderboard add column if not exists result_number integer;

-- Widen category to also accept 'math'. word_length is reused for math rows
-- to mean "how many numbers were in the pool" (still fits the existing
-- 0-10 check).
alter table leaderboard drop constraint if exists leaderboard_category_check;
alter table leaderboard add constraint leaderboard_category_check
  check (category in ('en_words', 'tr_words', 'en_names', 'tr_names', 'math'));

create index if not exists leaderboard_game_score_idx on leaderboard (game, mode, score desc);
