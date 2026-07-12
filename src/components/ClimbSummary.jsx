import SaveScoreForm from './SaveScoreForm'

export default function ClimbSummary({ strings, category, climb, onGoHome, onOpenLeaderboard, onRestart }) {
  return (
    <div className="result-screen container">
      <div className="score-ring" style={{ '--score': Math.min(100, climb.totalScore) }}>
        <span>{climb.totalScore}</span>
      </div>
      <h2 style={{ marginTop: 18 }}>{strings.climb_over}</h2>
      <p className="muted" style={{ marginTop: 6 }}>
        {strings.rounds_won}: {climb.roundsWon}
      </p>

      {category && (
        <SaveScoreForm
          strings={strings}
          category={category}
          wordLength={0}
          mode="climb"
          moves={climb.roundsWon}
          shortestMoves={climb.roundsWon}
          score={climb.totalScore}
          startWord=""
          endWord=""
        />
      )}

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onRestart}>
          {strings.climbMode}
        </button>
        <button className="btn btn-ghost" onClick={onOpenLeaderboard}>
          {strings.leaderboard}
        </button>
        <button className="btn btn-ghost" onClick={onGoHome}>
          {strings.back_home}
        </button>
      </div>
    </div>
  )
}
