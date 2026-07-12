// Number Ladder ("countdown numbers") core rules.
//
// Rules, chosen to stay unambiguous and forgiving for a kids' game:
//  - Addition and multiplication: order doesn't matter.
//  - Subtraction: always |a - b| (no negative results, no picking an order).
//  - Division: always larger / smaller, only valid when it divides evenly.
//  - Exponent: order matters (a^b), since 2^3 !== 3^2.
//  - Every result must be a positive integer <= MAX_RESULT, or the move is rejected.
//
// The solver explores every distinct *set* of remaining numbers (memoized,
// order of operations doesn't matter, only the resulting multiset does) to
// find the closest reachable value to the target. This is the standard
// approach for the Countdown numbers game and comfortably handles up to 6
// starting numbers.

export const MAX_RESULT = 1_000_000
export const OPERATORS = ['+', '-', '*', '/', '^']

export function applyOperator(a, b, op) {
  switch (op) {
    case '+': {
      const result = a + b
      return result <= MAX_RESULT ? result : null
    }
    case '-': {
      const result = Math.abs(a - b)
      return result > 0 ? result : null
    }
    case '*': {
      const result = a * b
      return result <= MAX_RESULT ? result : null
    }
    case '/': {
      const hi = Math.max(a, b)
      const lo = Math.min(a, b)
      if (lo === 0 || hi % lo !== 0) return null
      return hi / lo
    }
    case '^': {
      if (b > 20) return null // guard against absurdly expensive Math.pow calls
      const result = Math.pow(a, b)
      return Number.isFinite(result) && result <= MAX_RESULT ? Math.round(result) : null
    }
    default:
      return null
  }
}

export function opSymbolDisplay(op) {
  return { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7', '^': '^' }[op] || op
}

// Returns [{ value, expr }] for every distinct valid result of combining a and b.
function candidateResults(a, b, exprA, exprB) {
  const out = []
  const seen = new Set()
  const push = (op, value, expr) => {
    if (value === null || seen.has(`${op}:${value}`)) return
    seen.add(`${op}:${value}`)
    out.push({ value, expr })
  }
  push('+', applyOperator(a, b, '+'), `(${exprA} + ${exprB})`)
  push('-', applyOperator(a, b, '-'), `|${exprA} \u2212 ${exprB}|`)
  push('*', applyOperator(a, b, '*'), `(${exprA} \u00d7 ${exprB})`)
  push('/', applyOperator(a, b, '/'), a >= b ? `(${exprA} \u00f7 ${exprB})` : `(${exprB} \u00f7 ${exprA})`)
  push('^a', applyOperator(a, b, '^'), `${exprA}^${exprB}`)
  if (a !== b) push('^b', applyOperator(b, a, '^'), `${exprB}^${exprA}`)
  return out
}

// Finds the closest reachable value to `target` using some or all of `numbers`,
// each at most once. Returns { distance, value, expr }.
export function solveClosest(numbers, target, { maxStates = 200000 } = {}) {
  const memo = new Set()
  let best = { distance: Infinity, value: null, expr: null }
  let statesVisited = 0

  function consider(value, expr) {
    const d = Math.abs(value - target)
    if (d < best.distance) best = { distance: d, value, expr }
  }

  function recurse(nums, exprs) {
    if (statesVisited >= maxStates) return
    const key = [...nums].sort((a, b) => a - b).join(',')
    if (memo.has(key)) return
    memo.add(key)
    statesVisited++

    for (let i = 0; i < nums.length; i++) consider(nums[i], exprs[i])
    if (best.distance === 0) return
    if (nums.length < 2) return

    for (let i = 0; i < nums.length && statesVisited < maxStates; i++) {
      for (let j = i + 1; j < nums.length && statesVisited < maxStates; j++) {
        const rest = nums.filter((_, idx) => idx !== i && idx !== j)
        const restExprs = exprs.filter((_, idx) => idx !== i && idx !== j)
        for (const { value, expr } of candidateResults(nums[i], nums[j], exprs[i], exprs[j])) {
          recurse([...rest, value], [...restExprs, expr])
          if (best.distance === 0 || statesVisited >= maxStates) break
        }
      }
    }
  }

  recurse(numbers, numbers.map(String))
  return best
}

export function computeScore(distance, target) {
  if (distance === 0) return 100
  const accuracy = 100 * (1 - distance / Math.max(target, 1))
  return Math.max(0, Math.min(100, Math.round(accuracy)))
}
