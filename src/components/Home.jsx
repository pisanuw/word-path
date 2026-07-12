import { useState } from 'react'
import { CATEGORIES, LENGTHS } from '../config/categories'
import { COUNT_OPTIONS, RANGE_PRESETS } from '../lib/mathPuzzle'
import Hero from './Hero'

export default function Home({ strings, uiLang, onStartWordFree, onStartWordClimb, onStartMathFree, onStartMathClimb }) {
  const [game, setGame] = useState(null) // 'words' | 'numbers'
  const [wordMode, setWordMode] = useState(null)
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id)
  const [length, setLength] = useState(5)

  const [mathMode, setMathMode] = useState(null)
  const [count, setCount] = useState(4)
  const [preset, setPreset] = useState('small')

  const categoryLabel = (cat) => (uiLang === 'tr' ? cat.labelTr : cat.labelEn)

  return (
    <div>
      <Hero strings={strings} />

      <div className="container stack" style={{ marginTop: 20 }}>
        {!game && (
          <div className="mode-grid">
            <button className="card mode-card" onClick={() => setGame('words')}>
              <div className="mode-icon">🪜</div>
              <h3>{strings.wordLadder}</h3>
              <p>{strings.tagline}</p>
            </button>
            <button className="card mode-card" onClick={() => setGame('numbers')}>
              <div className="mode-icon">🔢</div>
              <h3>{strings.numberLadder}</h3>
              <p>{strings.numberLadderDesc}</p>
            </button>
          </div>
        )}

        {game === 'words' && (
          <>
            <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setGame(null)}>
              {strings.changeGame}
            </button>

            <div className="mode-grid">
              <button className={`card mode-card ${wordMode === 'free' ? 'selected' : ''}`} onClick={() => setWordMode('free')}>
                <div className="mode-icon">🧩</div>
                <h3>{strings.freePlay}</h3>
                <p>{strings.freePlayDesc}</p>
              </button>
              <button className={`card mode-card ${wordMode === 'climb' ? 'selected' : ''}`} onClick={() => setWordMode('climb')}>
                <div className="mode-icon">🪜</div>
                <h3>{strings.climbMode}</h3>
                <p>{strings.climbModeDesc}</p>
              </button>
            </div>

            {wordMode && (
              <div className="card setup-panel">
                <div className="setup-label">{strings.dictionary}</div>
                <div className="chip-row">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      className={`chip accent-${cat.accent} ${categoryId === cat.id ? 'selected' : ''}`}
                      onClick={() => setCategoryId(cat.id)}
                    >
                      <span className="chip-badge">{cat.badge}</span>
                      {categoryLabel(cat)}
                    </button>
                  ))}
                </div>

                {wordMode === 'free' && (
                  <>
                    <div className="setup-label" style={{ marginTop: 20 }}>
                      {strings.wordLength}
                    </div>
                    <div className="chip-row">
                      {LENGTHS.map((l) => (
                        <button key={l} className={`chip ${length === l ? 'selected' : ''}`} onClick={() => setLength(l)}>
                          {l} {strings.letters}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <button
                  className="btn btn-primary"
                  style={{ marginTop: 22, width: '100%' }}
                  onClick={() => (wordMode === 'free' ? onStartWordFree(categoryId, length) : onStartWordClimb(categoryId))}
                >
                  {strings.start}
                </button>
              </div>
            )}
          </>
        )}

        {game === 'numbers' && (
          <>
            <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setGame(null)}>
              {strings.changeGame}
            </button>

            <div className="mode-grid">
              <button className={`card mode-card ${mathMode === 'free' ? 'selected' : ''}`} onClick={() => setMathMode('free')}>
                <div className="mode-icon">🧩</div>
                <h3>{strings.freePlay}</h3>
                <p>{strings.freePlayDesc}</p>
              </button>
              <button className={`card mode-card ${mathMode === 'climb' ? 'selected' : ''}`} onClick={() => setMathMode('climb')}>
                <div className="mode-icon">🪜</div>
                <h3>{strings.climbMode}</h3>
                <p>{strings.climbModeDesc}</p>
              </button>
            </div>

            {mathMode === 'free' && (
              <div className="card setup-panel">
                <div className="setup-label">{strings.howManyNumbers}</div>
                <div className="chip-row">
                  {COUNT_OPTIONS.map((c) => (
                    <button key={c} className={`chip ${count === c ? 'selected' : ''}`} onClick={() => setCount(c)}>
                      {c}
                    </button>
                  ))}
                </div>

                <div className="setup-label" style={{ marginTop: 20 }}>
                  {strings.numberRange}
                </div>
                <div className="chip-row">
                  {Object.keys(RANGE_PRESETS).map((p) => (
                    <button key={p} className={`chip ${preset === p ? 'selected' : ''}`} onClick={() => setPreset(p)}>
                      {strings[`range_${p}`]}
                    </button>
                  ))}
                </div>

                <button className="btn btn-primary" style={{ marginTop: 22, width: '100%' }} onClick={() => onStartMathFree(count, preset)}>
                  {strings.start}
                </button>
              </div>
            )}

            {mathMode === 'climb' && (
              <div className="card setup-panel">
                <p className="muted">{strings.climbModeDesc}</p>
                <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={onStartMathClimb}>
                  {strings.start}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
