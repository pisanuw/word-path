import { useEffect } from 'react'

const OPS = ['+', '-', '*', '/', '^']
const OP_SYMBOL = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7', '^': '^' }

export default function MathGameScreen({
  strings,
  puzzle,
  pool,
  history,
  selection,
  errorMessage,
  hintsUsed,
  hintTileIds,
  mode,
  climb,
  onTapTile,
  onSelectOp,
  onSubmitAnswer,
  onResetPool,
  onRequestHint,
  onGiveUp,
  onClearError,
}) {
  useEffect(() => {
    if (!errorMessage) return
    const t = setTimeout(onClearError, 2400)
    return () => clearTimeout(t)
  }, [errorMessage, onClearError])

  const canSubmit = Boolean(selection.tileId) && !selection.op

  return (
    <div className="game-screen">
      <div className="game-meta">
        <span>{mode === 'climb' ? `${strings.rounds_won}: ${climb.roundsWon}` : `${puzzle.numbers.length} numbers`}</span>
        <span>
          {strings.steps}: {history.length}
        </span>
      </div>

      <div className="target-banner">
        <div className="label">{strings.target}</div>
        <div className="target-number">{puzzle.target}</div>
      </div>

      {history.length > 0 && (
        <div className="math-history">
          {history.map((h, i) => (
            <div className="equation-row" key={i}>
              {h.aValue} {OP_SYMBOL[h.op]} {h.bValue} = <strong>{h.result}</strong>
            </div>
          ))}
        </div>
      )}

      <p className="muted text-center" style={{ marginBottom: 14, fontSize: '0.85rem' }}>
        {strings.pickTwoNumbers}
      </p>

      <div className="number-pool">
        {pool.map((tile) => {
          const isSelected = selection.tileId === tile.id
          const isHint = hintTileIds.includes(tile.id)
          return (
            <button
              key={tile.id}
              className={`number-tile ${isSelected ? 'selected' : ''} ${isHint ? 'hint' : ''}`}
              onClick={() => onTapTile(tile.id)}
            >
              {tile.value}
            </button>
          )
        })}
      </div>

      <div className="op-row">
        {OPS.map((op) => (
          <button
            key={op}
            className={`op-btn ${selection.op === op ? 'selected' : ''}`}
            disabled={!selection.tileId}
            onClick={() => onSelectOp(op)}
          >
            {OP_SYMBOL[op]}
          </button>
        ))}
      </div>

      {hintTileIds.length > 0 && (
        <p className="hint-banner text-center">
          {hintTileIds.length === 2 ? strings.combineHint : strings.bestTileHint}
        </p>
      )}

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <div className="row" style={{ marginTop: 22, justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" disabled={!canSubmit} onClick={onSubmitAnswer}>
          {strings.useAsAnswer}
        </button>
        <button className="btn btn-ghost" onClick={onResetPool}>
          {strings.resetNumbers}
        </button>
        <button className="btn btn-ghost hint-btn" onClick={onRequestHint}>
          💡 {strings.hint} <span className="hint-cost">{strings.hintCost}</span>
        </button>
        <button className="btn btn-danger" onClick={onGiveUp}>
          {mode === 'climb' ? strings.finish_run : strings.give_up}
        </button>
      </div>
      {hintsUsed > 0 && (
        <p className="muted text-center" style={{ marginTop: 10, fontSize: '0.8rem' }}>
          {strings.hintsUsedLabel}: {hintsUsed}
        </p>
      )}
    </div>
  )
}
