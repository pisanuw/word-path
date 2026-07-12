import { toDisplay } from '../lib/wordGraph'
import SaveScoreForm from './SaveScoreForm'

export default function ResultPanel({
  strings,
  category,
  length,
  puzzle,
  path,
  movesUsed,
  shortestPathWords,
  score,
  mode,
  onPlayAgain,
  onNextRound,
  onFinishRun,
  onGoHome,
  onOpenLeaderboard,
}) {
  const locale = category?.locale || 'en-US'

  return (
    <div className="result-screen container">
      <div className="score-ring" style={{ '--score': score }}>
        <span>{score}</span>
      </div>
      <h2 style={{ marginTop: 18 }}>{strings.you_reached}</h2>
      <p className="muted" style={{ marginTop: 6 }}>
        {strings.moves}: {movesUsed} &middot; {strings.shortest_path}: {puzzle.shortestLength}
      </p>

      <div className="path-compare">
        <h4>{strings.your_path}</h4>
        <div className="path-list">
          {path.map((w, i) => (
            <span className="path-chip" key={i}>
              {toDisplay(w, locale)}
            </span>
          ))}
        </div>

        {shortestPathWords && shortestPathWords.length < path.length && (
          <>
            <h4 style={{ marginTop: 16 }}>{strings.shortest_path}</h4>
            <div className="path-list">
              {shortestPathWords.map((w, i) => (
                <span className="path-chip ghost" key={i}>
                  {toDisplay(w, locale)}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <SaveScoreForm
        strings={strings}
        category={category}
        wordLength={length}
        mode={mode}
        moves={movesUsed}
        shortestMoves={puzzle.shortestLength}
        score={score}
        startWord={puzzle.start}
        endWord={puzzle.end}
      />

      <div className="result-actions">
        {mode === 'free' ? (
          <button className="btn btn-primary" onClick={onPlayAgain}>
            {strings.play_again}
          </button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={onNextRound}>
              {strings.next_round}
            </button>
            <button className="btn btn-ghost" onClick={onFinishRun}>
              {strings.finish_run}
            </button>
          </>
        )}
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
