import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import GameScreen from './components/GameScreen'
import ResultPanel from './components/ResultPanel'
import ClimbSummary from './components/ClimbSummary'
import Leaderboard from './components/Leaderboard'
import { useGameEngine } from './hooks/useGameEngine'
import { useStrings } from './lib/i18n'

export default function App() {
  const [uiLang, setUiLang] = useState('en')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const strings = useStrings(uiLang)

  const {
    state,
    category,
    movesUsed,
    shortestPathWords,
    startFreePlay,
    startClimb,
    submitWord,
    clearError,
    playAgainFree,
    nextClimbRound,
    endClimb,
    giveUp,
    goHome,
  } = useGameEngine()

  const handleGoHome = () => {
    setShowLeaderboard(false)
    goHome()
  }

  const handleRestartClimb = () => {
    if (!state.categoryId) return
    startClimb(state.categoryId)
  }

  let body

  if (showLeaderboard) {
    body = <Leaderboard strings={strings} uiLang={uiLang} onGoHome={() => setShowLeaderboard(false)} />
  } else if (state.screen === 'climb-summary') {
    body = (
      <ClimbSummary
        strings={strings}
        category={category}
        climb={state.climb}
        onGoHome={handleGoHome}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onRestart={handleRestartClimb}
      />
    )
  } else if (state.screen === 'play' && state.status === 'won') {
    body = (
      <ResultPanel
        strings={strings}
        category={category}
        length={state.length}
        puzzle={state.puzzle}
        path={state.path}
        movesUsed={movesUsed}
        shortestPathWords={shortestPathWords}
        score={state.lastRoundScore}
        mode={state.mode}
        onPlayAgain={playAgainFree}
        onNextRound={nextClimbRound}
        onFinishRun={endClimb}
        onGoHome={handleGoHome}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />
    )
  } else if (state.screen === 'play' && (state.status === 'playing' || state.status === 'loading')) {
    if (state.status === 'loading' || !state.puzzle) {
      body = (
        <div className="container text-center" style={{ paddingTop: 60 }}>
          <p className="muted">{strings.loading}</p>
        </div>
      )
    } else {
      body = (
        <GameScreen
          strings={strings}
          category={category}
          length={state.length}
          puzzle={state.puzzle}
          path={state.path}
          movesUsed={movesUsed}
          errorMessage={state.errorMessage}
          onSubmit={submitWord}
          onGiveUp={giveUp}
          onClearError={clearError}
          mode={state.mode}
          climb={state.climb}
        />
      )
    }
  } else if (state.status === 'error') {
    body = (
      <div className="container text-center" style={{ paddingTop: 60 }}>
        <p className="error-banner">{state.errorMessage}</p>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={handleGoHome}>
          {strings.back_home}
        </button>
      </div>
    )
  } else {
    body = (
      <Home
        strings={strings}
        uiLang={uiLang}
        onStartFree={startFreePlay}
        onStartClimb={startClimb}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="header">
        <button className="wordmark" onClick={handleGoHome}>
          <span className="wordmark-icon">🪜</span>
          Word Ladder
        </button>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setShowLeaderboard(true)} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            {strings.leaderboard}
          </button>
          <div className="lang-toggle">
            <button className={uiLang === 'en' ? 'active' : ''} onClick={() => setUiLang('en')}>
              EN
            </button>
            <button className={uiLang === 'tr' ? 'active' : ''} onClick={() => setUiLang('tr')}>
              TR
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{body}</main>

      <footer className="footer-note">Word Ladder · Kelime Merdiveni</footer>
    </div>
  )
}
