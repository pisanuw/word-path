import SaveScoreForm from './SaveScoreForm'

const OP_SYMBOL = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7', '^': '^' }

export default function MathResultPanel({
  strings,
  puzzle,
  history,
  score,
  answerValue,
  mode,
  onPlayAgain,
  onNextRound,
  onFinishRun,
  onGoHome,
  onOpenLeaderboard,
}) {
  const distance = Math.abs(answerValue - puzzle.target)

  return (
    <div className="result-screen container">
      <div className="score-ring" style={{ '--score': score }}>
        <span>{score}</span>
      </div>
      <h2 style={{ marginTop: 18 }}>{distance === 0 ? strings.exact : strings.you_reached}</h2>
      <p className="muted" style={{ marginTop: 6 }}>
        {strings.yourResult}: {answerValue} &middot; {strings.target}: {puzzle.target}
        {distance > 0 && ` \u00b7 ${strings.offBy} ${distance}`}
      </p>

      {history.length > 0 && (
        <div className="path-compare">
          <h4>{strings.steps}</h4>
          <div className="stack" style={{ gap: 8 }}>
            {history.map((h, i) => (
              <div className="equation-row" key={i}>
                {h.aValue} {OP_SYMBOL[h.op]} {h.bValue} = <strong>{h.result}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {puzzle.bestDistance > 0 && puzzle.bestDistance < distance && (
        <div className="path-compare">
          <h4>{strings.bestPossible}</h4>
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            {puzzle.bestValue} ({strings.offBy} {puzzle.bestDistance})
          </p>
        </div>
      )}
      {puzzle.bestDistance === 0 && distance > 0 && (
        <div className="path-compare">
          <h4>{strings.bestPossible}</h4>
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            {strings.exact} ({puzzle.target})
          </p>
        </div>
      )}

      <SaveScoreForm
        strings={strings}
        game="numbers"
        wordLength={puzzle.numbers.length}
        mode={mode}
        moves={history.length}
        shortestMoves={puzzle.bestDistance}
        score={score}
        targetNumber={puzzle.target}
        resultNumber={answerValue}
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
