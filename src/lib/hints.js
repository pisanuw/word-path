// Shared across both games: a flat per-hint score deduction, so the
// leaderboard stays meaningful without hard-capping how many hints someone
// can use (heavy hint use just erodes the score toward zero on its own).
export const HINT_PENALTY = 10

export function applyHintPenalty(baseScore, hintsUsed) {
  return Math.max(0, baseScore - hintsUsed * HINT_PENALTY)
}
