import { useEffect, useRef, useState } from 'react'
import WordTiles from './WordTiles'

export default function GameScreen({
  strings,
  category,
  length,
  puzzle,
  path,
  movesUsed,
  errorMessage,
  hintsUsed,
  hintPosition,
  onSubmit,
  onGiveUp,
  onRequestHint,
  onClearError,
  mode,
  climb,
}) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [path.length])

  useEffect(() => {
    if (!errorMessage) return
    const t = setTimeout(onClearError, 2200)
    return () => clearTimeout(t)
  }, [errorMessage, onClearError])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(value)
    setValue('')
  }

  const locale = category?.locale || 'en-US'

  return (
    <div className="game-screen">
      <div className="game-meta">
        <span>
          {mode === 'climb' ? `${strings.rounds_won}: ${climb.roundsWon}` : `${length} ${strings.letters}`}
        </span>
        <span>
          {strings.moves}: {movesUsed}
        </span>
      </div>

      <div className="target-banner">
        <div className="label">{strings.target}</div>
        <WordTiles word={puzzle.end} locale={locale} variant="target" />
      </div>

      <div className="ladder-wrap">
        <div className="ladder">
          {path.map((word, idx) => (
            <div className="rung" key={idx}>
              <WordTiles
                word={word}
                prevWord={idx > 0 ? path[idx - 1] : null}
                locale={locale}
                hintPosition={idx === path.length - 1 ? hintPosition : null}
              />
            </div>
          ))}
        </div>
      </div>

      {hintPosition !== null && (
        <p className="hint-banner text-center">{strings.changeLetterHint(hintPosition)}</p>
      )}

      <form onSubmit={handleSubmit} className="input-row">
        <input
          ref={inputRef}
          className="word-input"
          value={value}
          maxLength={length}
          onChange={(e) => setValue(e.target.value)}
          placeholder={strings.placeholder_word}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
        <button type="submit" className="btn btn-primary">
          {'\u2191'}
        </button>
      </form>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <div className="row" style={{ marginTop: 20, justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
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
