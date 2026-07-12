-- Word Ladder public leaderboard
-- Run this once in the Supabase SQL editor for your project.

create table if not exists leaderboard (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  player_name text not null check (char_length(player_name) between 1 and 20),
  category text not null check (category in ('en_words', 'tr_words', 'en_names', 'tr_names')),
  word_length int not null check (word_length between 0 and 10),
  mode text not null check (mode in ('free', 'climb')),
  moves int not null check (moves >= 0),
  shortest_moves int not null check (shortest_moves >= 0),
  score int not null check (score between 0 and 100),
  start_word text,
  end_word text
);

create index if not exists leaderboard_score_idx on leaderboard (category, word_length, mode, score desc);

alter table leaderboard enable row level security;

-- Anyone can read the leaderboard.
create policy "Public read access"
  on leaderboard for select
  using (true);

-- Anyone can submit a score. There's no auth in this game (it's built for
-- quick, no-signup play), so this is intentionally open -- see README for
-- notes on tightening this if you want to guard against spam.
create policy "Public insert access"
  on leaderboard for insert
  with check (true);
