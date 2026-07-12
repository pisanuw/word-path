import { useCallback, useMemo, useState } from 'react'
import { loadDictionary } from '../data'
import { getCategory } from '../config/categories'
import {
  buildAdjacency,
  generatePuzzle,
  isOneLetterApart,
  computeScore,
  toCanonical,
  shortestPath,
} from '../lib/wordGraph'

function climbSettingsForLevel(level) {
  const length = 3 + ((level - 1) % 5)
  const tier = Math.floor((level - 1) / 5)
  const minDistance = 2 + tier
  const maxDistance = minDistance + 2
  return { length, minDistance, maxDistance }
}

const initialState = {
  screen: 'home', // home | play | result | leaderboard | climb-summary
  mode: 'free', // free | climb
  categoryId: null,
  length: null,
  status: 'idle', // idle | loading | playing | won | error
  puzzle: null, // { start, end, shortestLength }
  path: [],
  errorMessage: null,
  climb: { level: 1, totalScore: 0, roundsWon: 0 },
  lastRoundScore: null,
}

export function useGameEngine() {
  const [state, setState] = useState(initialState)
  const [dictCache, setDictCache] = useState(new Map()) // key -> { words, adj }

  const category = state.categoryId ? getCategory(state.categoryId) : null

  const getOrLoadDict = useCallback(
    async (categoryId, length) => {
      const key = `${categoryId}/${length}`
      if (dictCache.has(key)) return dictCache.get(key)
      const words = await loadDictionary(categoryId, length)
      const adj = buildAdjacency(words)
      const entry = { words, adj }
      setDictCache((prev) => new Map(prev).set(key, entry))
      return entry
    },
    [dictCache]
  )

  const beginRound = useCallback(
    async (categoryId, length, distanceRange) => {
      setState((s) => ({ ...s, status: 'loading', categoryId, length, errorMessage: null }))
      try {
        const { words, adj } = await getOrLoadDict(categoryId, length)
        const puzzle = generatePuzzle(words, adj, distanceRange)
        if (!puzzle) {
          setState((s) => ({ ...s, status: 'error', errorMessage: 'Could not build a puzzle for this dictionary yet.' }))
          return
        }
        setState((s) => ({
          ...s,
          status: 'playing',
          screen: 'play',
          categoryId,
          length,
          puzzle,
          path: [puzzle.start],
          errorMessage: null,
        }))
      } catch (err) {
        setState((s) => ({ ...s, status: 'error', errorMessage: err.message || 'Something went wrong loading the dictionary.' }))
      }
    },
    [getOrLoadDict]
  )

  const startFreePlay = useCallback(
    (categoryId, length) => {
      setState((s) => ({ ...s, mode: 'free' }))
      beginRound(categoryId, length, { minDistance: 3, maxDistance: 8 })
    },
    [beginRound]
  )

  const startClimb = useCallback(
    (categoryId) => {
      const climb = { level: 1, totalScore: 0, roundsWon: 0 }
      setState((s) => ({ ...s, mode: 'climb', climb }))
      const { length, minDistance, maxDistance } = climbSettingsForLevel(1)
      beginRound(categoryId, length, { minDistance, maxDistance })
    },
    [beginRound]
  )

  const submitWord = useCallback(
    (rawWord) => {
      setState((s) => {
        if (s.status !== 'playing' || !s.puzzle || !category) return s
        const word = toCanonical(rawWord.trim(), category.locale)
        if (!word) return s

        const last = s.path[s.path.length - 1]
        if (word === last) {
          return { ...s, errorMessage: 'That\u2019s the word you\u2019re already on.' }
        }

        const { valid } = isOneLetterApart(last, word)
        if (!valid) {
          return { ...s, errorMessage: 'Change exactly one letter from the word above.' }
        }

        const cacheKey = `${s.categoryId}/${s.length}`
        const entry = dictCache.get(cacheKey)
        const inDictionary = entry?.adj.has(word)
        if (!inDictionary) {
          return { ...s, errorMessage: 'Not in this dictionary \u2014 try another word.' }
        }

        const newPath = [...s.path, word]

        if (word === s.puzzle.end) {
          const score = computeScore(s.puzzle.shortestLength, newPath.length - 1)
          const nextClimb = {
            ...s.climb,
            totalScore: s.climb.totalScore + score,
            roundsWon: s.climb.roundsWon + 1,
          }
          return {
            ...s,
            path: newPath,
            status: 'won',
            errorMessage: null,
            lastRoundScore: score,
            climb: nextClimb,
          }
        }

        return { ...s, path: newPath, errorMessage: null }
      })
    },
    [category, dictCache]
  )

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, errorMessage: null }))
  }, [])

  const playAgainFree = useCallback(() => {
    if (!state.categoryId || !state.length) return
    startFreePlay(state.categoryId, state.length)
  }, [state.categoryId, state.length, startFreePlay])

  const nextClimbRound = useCallback(() => {
    if (!state.categoryId) return
    const nextLevel = state.climb.level + 1
    setState((s) => ({ ...s, climb: { ...s.climb, level: nextLevel } }))
    const { length, minDistance, maxDistance } = climbSettingsForLevel(nextLevel)
    beginRound(state.categoryId, length, { minDistance, maxDistance })
  }, [state.categoryId, state.climb, beginRound])

  const endClimb = useCallback(() => {
    setState((s) => ({ ...s, screen: 'climb-summary', status: 'idle' }))
  }, [])

  const giveUp = useCallback(() => {
    setState((s) => {
      if (s.mode === 'climb') {
        return { ...s, screen: 'climb-summary', status: 'idle' }
      }
      return { ...s, screen: 'home', status: 'idle', puzzle: null, path: [] }
    })
  }, [])

  const goHome = useCallback(() => {
    setState(initialState)
  }, [])

  const currentWord = state.path[state.path.length - 1] ?? null
  const movesUsed = Math.max(0, state.path.length - 1)

  const shortestPathWords = useMemo(() => {
    if (!state.puzzle || !state.categoryId || !state.length) return null
    const entry = dictCache.get(`${state.categoryId}/${state.length}`)
    if (!entry) return null
    return shortestPath(entry.adj, state.puzzle.start, state.puzzle.end)
  }, [state.puzzle, state.categoryId, state.length, dictCache])

  return useMemo(
    () => ({
      state,
      category,
      currentWord,
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
      climbSettingsForLevel,
    }),
    [state, category, currentWord, movesUsed, shortestPathWords, startFreePlay, startClimb, submitWord, clearError, playAgainFree, nextClimbRound, endClimb, giveUp, goHome]
  )
}
