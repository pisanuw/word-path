import { useCallback, useMemo, useState } from 'react'
import { generateMathPuzzle, COUNT_OPTIONS } from '../lib/mathPuzzle'
import { applyOperator, opSymbolDisplay, computeScore } from '../lib/mathSolver'

let idCounter = 0
function nextId() {
  idCounter += 1
  return `n${idCounter}`
}

function poolFromNumbers(numbers) {
  return numbers.map((value) => ({ id: nextId(), value }))
}

function climbSettingsForLevel(level) {
  const presets = ['small', 'small', 'small', 'classic', 'classic', 'big']
  const counts = [4, 5, 6, 6, 6, 6]
  const idx = Math.min(level - 1, presets.length - 1)
  return { count: counts[idx], preset: presets[idx] }
}

const initialState = {
  screen: 'home', // home | play | climb-summary
  mode: 'free', // free | climb
  settings: { count: 4, preset: 'small' },
  puzzle: null, // { numbers, target, bestDistance, bestExpr, bestValue }
  pool: [],
  history: [], // { aValue, bValue, op, result }
  selection: { tileId: null, op: null },
  status: 'idle', // idle | playing | won
  errorMessage: null,
  climb: { level: 1, totalScore: 0, roundsWon: 0 },
  lastRoundScore: null,
  lastAnswerValue: null,
}

export function useMathGameEngine() {
  const [state, setState] = useState(initialState)

  const beginRound = useCallback((settings) => {
    const puzzle = generateMathPuzzle(settings)
    if (!puzzle) {
      setState((s) => ({ ...s, status: 'error', errorMessage: 'Could not build a puzzle. Try again.' }))
      return
    }
    setState((s) => ({
      ...s,
      screen: 'play',
      status: 'playing',
      settings,
      puzzle,
      pool: poolFromNumbers(puzzle.numbers),
      history: [],
      selection: { tileId: null, op: null },
      errorMessage: null,
    }))
  }, [])

  const startFreePlay = useCallback(
    (count, preset) => {
      setState((s) => ({ ...s, mode: 'free' }))
      beginRound({ count, preset })
    },
    [beginRound]
  )

  const startClimb = useCallback(() => {
    setState((s) => ({ ...s, mode: 'climb', climb: { level: 1, totalScore: 0, roundsWon: 0 } }))
    beginRound(climbSettingsForLevel(1))
  }, [beginRound])

  const finishRoundWith = useCallback((s, value) => {
    const distance = Math.abs(value - s.puzzle.target)
    const score = computeScore(distance, s.puzzle.target)
    const nextClimb = {
      ...s.climb,
      totalScore: s.climb.totalScore + score,
      roundsWon: s.climb.roundsWon + (distance === 0 ? 1 : 0),
    }
    return {
      ...s,
      status: 'won',
      lastRoundScore: score,
      lastAnswerValue: value,
      climb: nextClimb,
      selection: { tileId: null, op: null },
    }
  }, [])

  const tapTile = useCallback(
    (id) => {
      setState((s) => {
        if (s.status !== 'playing') return s
        const { tileId, op } = s.selection

        if (!tileId) {
          return { ...s, selection: { tileId: id, op: null }, errorMessage: null }
        }
        if (!op) {
          return { ...s, selection: { tileId: id === tileId ? null : id, op: null }, errorMessage: null }
        }
        if (id === tileId) {
          return { ...s, selection: { tileId, op: null } }
        }

        const a = s.pool.find((t) => t.id === tileId)
        const b = s.pool.find((t) => t.id === id)
        if (!a || !b) return s

        const result = applyOperator(a.value, b.value, op)
        if (result === null) {
          return {
            ...s,
            errorMessage: 'That doesn\u2019t give a whole positive number \u2014 try a different move.',
            selection: { tileId: null, op: null },
          }
        }

        const newTile = { id: nextId(), value: result }
        const newPool = [...s.pool.filter((t) => t.id !== tileId && t.id !== id), newTile]
        const newHistory = [...s.history, { aValue: a.value, bValue: b.value, op, result }]

        if (result === s.puzzle.target) {
          return finishRoundWith({ ...s, pool: newPool, history: newHistory }, result)
        }

        return { ...s, pool: newPool, history: newHistory, selection: { tileId: null, op: null }, errorMessage: null }
      })
    },
    [finishRoundWith]
  )

  const selectOp = useCallback((op) => {
    setState((s) => {
      if (s.status !== 'playing' || !s.selection.tileId) return s
      return { ...s, selection: { ...s.selection, op } }
    })
  }, [])

  const submitAnswer = useCallback(() => {
    setState((s) => {
      if (s.status !== 'playing' || !s.selection.tileId || s.selection.op) return s
      const tile = s.pool.find((t) => t.id === s.selection.tileId)
      if (!tile) return s
      return finishRoundWith(s, tile.value)
    })
  }, [finishRoundWith])

  const resetPool = useCallback(() => {
    setState((s) => {
      if (!s.puzzle) return s
      return {
        ...s,
        pool: poolFromNumbers(s.puzzle.numbers),
        history: [],
        selection: { tileId: null, op: null },
        errorMessage: null,
      }
    })
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, errorMessage: null }))
  }, [])

  const playAgainFree = useCallback(() => {
    beginRound(state.settings)
  }, [state.settings, beginRound])

  const nextClimbRound = useCallback(() => {
    const nextLevel = state.climb.level + 1
    setState((s) => ({ ...s, climb: { ...s.climb, level: nextLevel } }))
    beginRound(climbSettingsForLevel(nextLevel))
  }, [state.climb.level, beginRound])

  const endClimb = useCallback(() => {
    setState((s) => ({ ...s, screen: 'climb-summary', status: 'idle' }))
  }, [])

  const giveUp = useCallback(() => {
    setState((s) => {
      if (s.mode === 'climb') return { ...s, screen: 'climb-summary', status: 'idle' }
      return { ...s, screen: 'home', status: 'idle', puzzle: null, pool: [], history: [] }
    })
  }, [])

  const goHome = useCallback(() => {
    setState(initialState)
  }, [])

  return useMemo(
    () => ({
      state,
      countOptions: COUNT_OPTIONS,
      startFreePlay,
      startClimb,
      tapTile,
      selectOp,
      submitAnswer,
      resetPool,
      clearError,
      playAgainFree,
      nextClimbRound,
      endClimb,
      giveUp,
      goHome,
      opSymbolDisplay,
    }),
    [state, startFreePlay, startClimb, tapTile, selectOp, submitAnswer, resetPool, clearError, playAgainFree, nextClimbRound, endClimb, giveUp, goHome]
  )
}
