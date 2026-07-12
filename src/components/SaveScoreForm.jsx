import { useState } from 'react'
import { submitScore, supabaseEnabled } from '../lib/supabaseClient'

export default function SaveScoreForm({ strings, category, wordLength, mode, moves, shortestMoves, score, startWord, endWord }) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | saved | error

  if (!supabaseEnabled) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || status === 'saving') return
    setStatus('saving')
    try {
      await submitScore({
        playerName: name.trim(),
        category: category.id,
        wordLength,
        mode,
        moves,
        shortestMoves,
        score,
        startWord,
        endWord,
      })
      setStatus('saved')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  if (status === 'saved') {
    return <p className="muted" style={{ marginTop: 18 }}>{strings.saved}</p>
  }

  return (
    <form className="save-score-form" onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={strings.name_placeholder}
        maxLength={20}
      />
      <button type="submit" className="btn btn-ghost" disabled={status === 'saving'}>
        {strings.save}
      </button>
    </form>
  )
}
