import { useEffect, useState } from 'react'
import { CATEGORIES } from '../config/categories'
import { fetchLeaderboard, supabaseEnabled } from '../lib/supabaseClient'

export default function Leaderboard({ strings, uiLang, onGoHome }) {
  const [categoryId, setCategoryId] = useState('')
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('idle')

  const categoryLabel = (cat) => (uiLang === 'tr' ? cat.labelTr : cat.labelEn)

  useEffect(() => {
    if (!supabaseEnabled) return
    setStatus('loading')
    fetchLeaderboard({ category: categoryId || undefined })
      .then((data) => {
        setRows(data)
        setStatus('idle')
      })
      .catch(() => setStatus('error'))
  }, [categoryId])

  return (
    <div className="leaderboard-screen container">
      <h2>{strings.leaderboard}</h2>

      {!supabaseEnabled ? (
        <p className="muted" style={{ marginTop: 14 }}>
          Leaderboard isn&rsquo;t connected yet. Add Supabase credentials to enable it (see README).
        </p>
      ) : (
        <>
          <div className="chip-row" style={{ marginTop: 16 }}>
            <button className={`chip ${categoryId === '' ? 'selected' : ''}`} onClick={() => setCategoryId('')}>
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`chip accent-${cat.accent} ${categoryId === cat.id ? 'selected' : ''}`}
                onClick={() => setCategoryId(cat.id)}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>

          {status === 'loading' && <p className="muted" style={{ marginTop: 20 }}>{strings.loading}</p>}

          {status !== 'loading' && rows.length === 0 && (
            <p className="muted" style={{ marginTop: 20 }}>
              {uiLang === 'tr' ? 'Henüz skor yok.' : 'No scores yet \u2014 be the first!'}
            </p>
          )}

          {rows.length > 0 && (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{uiLang === 'tr' ? 'Oyuncu' : 'Player'}</th>
                  <th>{strings.score}</th>
                  <th>{strings.moves}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td className="rank-cell">{i + 1}</td>
                    <td>{r.player_name}</td>
                    <td>{r.score}</td>
                    <td>{r.moves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <div className="result-actions">
        <button className="btn btn-ghost" onClick={onGoHome}>
          {strings.back_home}
        </button>
      </div>
    </div>
  )
}
