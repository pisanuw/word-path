import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import GameScreen from './components/GameScreen'
import ResultPanel from './components/ResultPanel'
import ClimbSummary from './components/ClimbSummary'
import MathGameScreen from './components/MathGameScreen'
import MathResultPanel from './components/MathResultPanel'
import MathClimbSummary from './components/MathClimbSummary'
import Leaderboard from './components/Leaderboard'
import { useGameEngine } from './hooks/useGameEngine'
import { useMathGameEngine } from './hooks/useMathGameEngine'
import { useStrings } from './lib/i18n'

export default function App() {
  const [uiLang, setUiLang] = useState('en')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const strings = useStrings(uiLang)

  const word = useGameEngine()
  const math = useMathGameEngine()

  const handleGoHome = () => {
    setShowLeaderboard(false)
    word.goHome()
    math.goHome()
  }

  const handleRestartMathClimb = () => math.startClimb()

  let body

  if (showLeaderboard) {
    body = <Leaderboard strings={strings} uiLang={uiLang} onGoHome={() => setShowLeaderboard(false)} />
  } else if (math.state.screen === 'climb-summary') {
    body = (
      <MathClimbSummary
        strings={strings}
        climb={math.state.climb}
        onGoHome={handleGoHome}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onRestart={handleRestartMathClimb}
      />
    )
  } else if (math.state.screen === 'play' && math.state.status === 'won') {
    body = (
      <MathResultPanel
        strings={strings}
        puzzle={math.state.puzzle}
        history={math.state.history}
        score={math.state.lastRoundScore}
        answerValue={math.state.lastAnswerValue}
        hintsUsed={math.state.hintsUsed}
        mode={math.state.mode}
        onPlayAgain={math.playAgainFree}
        onNextRound={math.nextClimbRound}
        onFinishRun={math.endClimb}
        onGoHome={handleGoHome}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />
    )
  } else if (math.state.screen === 'play' && math.state.status === 'playing' && math.state.puzzle) {
    body = (
      <MathGameScreen
        strings={strings}
        puzzle={math.state.puzzle}
        pool={math.state.pool}
        history={math.state.history}
        selection={math.state.selection}
        errorMessage={math.state.errorMessage}
        hintsUsed={math.state.hintsUsed}
        hintTileIds={math.state.hintTileIds}
        mode={math.state.mode}
        climb={math.state.climb}
        onTapTile={math.tapTile}
        onSelectOp={math.selectOp}
        onSubmitAnswer={math.submitAnswer}
        onResetPool={math.resetPool}
        onRequestHint={math.requestHint}
        onGiveUp={math.giveUp}
        onClearError={math.clearError}
      />
    )
  } else if (word.state.screen === 'climb-summary') {
    body = (
      <ClimbSummary
        strings={strings}
        category={word.category}
        climb={word.state.climb}
        onGoHome={handleGoHome}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onRestart={() => word.startClimb(word.state.categoryId)}
      />
    )
  } else if (word.state.screen === 'play' && word.state.status === 'won') {
    body = (
      <ResultPanel
        strings={strings}
        category={word.category}
        length={word.state.length}
        puzzle={word.state.puzzle}
        path={word.state.path}
        movesUsed={word.movesUsed}
        shortestPathWords={word.shortestPathWords}
        score={word.state.lastRoundScore}
        hintsUsed={word.state.hintsUsed}
        mode={word.state.mode}
        onPlayAgain={word.playAgainFree}
        onNextRound={word.nextClimbRound}
        onFinishRun={word.endClimb}
        onGoHome={handleGoHome}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />
    )
  } else if (word.state.screen === 'play' && (word.state.status === 'playing' || word.state.status === 'loading')) {
    if (word.state.status === 'loading' || !word.state.puzzle) {
      body = (
        <div className="container text-center" style={{ paddingTop: 60 }}>
          <p className="muted">{strings.loading}</p>
        </div>
      )
    } else {
      body = (
        <GameScreen
          strings={strings}
          category={word.category}
          length={word.state.length}
          puzzle={word.state.puzzle}
          path={word.state.path}
          movesUsed={word.movesUsed}
          errorMessage={word.state.errorMessage}
          hintsUsed={word.state.hintsUsed}
          hintPosition={word.state.hintPosition}
          onSubmit={word.submitWord}
          onGiveUp={word.giveUp}
          onRequestHint={word.requestHint}
          onClearError={word.clearError}
          mode={word.state.mode}
          climb={word.state.climb}
        />
      )
    }
  } else if (word.state.status === 'error' || math.state.status === 'error') {
    body = (
      <div className="container text-center" style={{ paddingTop: 60 }}>
        <p className="error-banner">{word.state.errorMessage || math.state.errorMessage}</p>
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
        onStartWordFree={word.startFreePlay}
        onStartWordClimb={word.startClimb}
        onStartMathFree={math.startFreePlay}
        onStartMathClimb={math.startClimb}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="header">
        <button className="wordmark" onClick={handleGoHome}>
          <span className="wordmark-icon">🪜</span>
          Ladder Games
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

      <footer className="footer-note">Word Ladder &amp; Number Ladder · Kelime ve Sayı Merdiveni</footer>
    </div>
  )
}
