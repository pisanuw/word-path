import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseEnabled = Boolean(url && anonKey)

export const supabase = supabaseEnabled ? createClient(url, anonKey) : null

// Submits a completed round to the public leaderboard. No-ops (resolving to
// null) when Supabase hasn't been configured, so the game is fully playable
// without a backend.
export async function submitScore({
  playerName,
  game = 'words',
  category,
  wordLength,
  mode,
  moves,
  shortestMoves,
  score,
  startWord,
  endWord,
  targetNumber,
  resultNumber,
}) {
  if (!supabaseEnabled) return null
  const { data, error } = await supabase
    .from('leaderboard')
    .insert({
      player_name: playerName.slice(0, 20),
      game,
      category: category ?? 'math',
      word_length: wordLength,
      mode,
      moves,
      shortest_moves: shortestMoves,
      score,
      start_word: startWord,
      end_word: endWord,
      target_number: targetNumber,
      result_number: resultNumber,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchLeaderboard({ game, category, wordLength, mode, limit = 20 } = {}) {
  if (!supabaseEnabled) return []
  let query = supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .order('moves', { ascending: true })
    .limit(limit)
  if (game) query = query.eq('game', game)
  if (category) query = query.eq('category', category)
  if (wordLength) query = query.eq('word_length', wordLength)
  if (mode) query = query.eq('mode', mode)
  const { data, error } = await query
  if (error) throw error
  return data
}
