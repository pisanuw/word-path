-- Tracks how many hints were used in a submitted round, so the leaderboard
-- can show it alongside the (already hint-penalized) score. Run after
-- schema.sql and 002_add_math_game.sql.

alter table leaderboard add column if not exists hints_used integer not null default 0;
alter table leaderboard add constraint leaderboard_hints_used_check check (hints_used >= 0);
