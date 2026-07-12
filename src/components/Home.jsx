import { useState } from 'react'
import { CATEGORIES, LENGTHS } from '../config/categories'
import Hero from './Hero'

export default function Home({ strings, uiLang, onStartFree, onStartClimb }) {
  const [mode, setMode] = useState(null) // 'free' | 'climb'
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id)
  const [length, setLength] = useState(5)

  const categoryLabel = (cat) => (uiLang === 'tr' ? cat.labelTr : cat.labelEn)

  return (
    <div>
      <Hero strings={strings} />

      <div className="container stack" style={{ marginTop: 20 }}>
        <div className="mode-grid">
          <button
            className={`card mode-card ${mode === 'free' ? 'selected' : ''}`}
            onClick={() => setMode('free')}
          >
            <div className="mode-icon">🧩</div>
            <h3>{strings.freePlay}</h3>
            <p>{strings.freePlayDesc}</p>
          </button>
          <button
            className={`card mode-card ${mode === 'climb' ? 'selected' : ''}`}
            onClick={() => setMode('climb')}
          >
            <div className="mode-icon">🪜</div>
            <h3>{strings.climbMode}</h3>
            <p>{strings.climbModeDesc}</p>
          </button>
        </div>

        {mode && (
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

            {mode === 'free' && (
              <>
                <div className="setup-label" style={{ marginTop: 20 }}>
                  {strings.wordLength}
                </div>
                <div className="chip-row">
                  {LENGTHS.map((l) => (
                    <button
                      key={l}
                      className={`chip ${length === l ? 'selected' : ''}`}
                      onClick={() => setLength(l)}
                    >
                      {l} {strings.letters}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              className="btn btn-primary"
              style={{ marginTop: 22, width: '100%' }}
              onClick={() => (mode === 'free' ? onStartFree(categoryId, length) : onStartClimb(categoryId))}
            >
              {strings.start}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
