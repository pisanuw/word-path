import { solveClosest } from './mathSolver.js'

export const COUNT_OPTIONS = [4, 5, 6]

export const RANGE_PRESETS = {
  small: { id: 'small', targetMin: 10, targetMax: 99 },
  classic: { id: 'classic', targetMin: 100, targetMax: 999 },
  big: { id: 'big', targetMin: 50, targetMax: 500 },
}

const LARGE_POOL = [25, 50, 75, 100]

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function drawNumbers(count, presetId) {
  if (presetId === 'classic') {
    const largeCount = Math.random() < 0.5 ? 1 : 2
    const large = shuffle(LARGE_POOL).slice(0, Math.min(largeCount, count))
    const small = Array.from({ length: count - large.length }, () => randInt(1, 10))
    return shuffle([...large, ...small])
  }
  if (presetId === 'big') {
    return Array.from({ length: count }, () => randInt(1, 100))
  }
  return Array.from({ length: count }, () => randInt(1, 10))
}

// Generates a solvable-feeling puzzle: the target isn't trivially one of the
// given numbers, and there's a reasonably close (ideally exact) solution.
export function generateMathPuzzle({ count = 4, preset = 'small' } = {}, { attempts = 25 } = {}) {
  const range = RANGE_PRESETS[preset] || RANGE_PRESETS.small
  let fallback = null

  for (let i = 0; i < attempts; i++) {
    const numbers = drawNumbers(count, preset)
    const target = randInt(range.targetMin, range.targetMax)
    if (numbers.includes(target)) continue

    const best = solveClosest(numbers, target)
    const candidate = { numbers, target, bestDistance: best.distance, bestExpr: best.expr, bestValue: best.value }

    if (best.distance === 0) return candidate
    if (!fallback || best.distance < fallback.bestDistance) fallback = candidate
  }

  return fallback
}
