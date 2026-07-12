// Word-ladder graph utilities.
//
// Words in a given category/length are connected when they differ by
// exactly one letter in the same position. We build that adjacency with
// the classic "wildcard bucket" trick: for a word of length L, generate L
// wildcard keys (one per position with that letter blanked out). Any two
// words that share a wildcard key are neighbors. This is O(n*L) to build
// and gives O(1) average neighbor lookups, which is what makes puzzle
// generation and validation fast even client-side.

export function toCanonical(word, locale) {
  return word.toLocaleLowerCase(locale)
}

export function toDisplay(word, locale) {
  return word.toLocaleUpperCase(locale)
}

export function buildAdjacency(words) {
  const buckets = new Map()
  for (const w of words) {
    for (let i = 0; i < w.length; i++) {
      const key = w.slice(0, i) + '_' + w.slice(i + 1)
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key).push(w)
    }
  }
  const adj = new Map()
  for (const w of words) adj.set(w, new Set())
  for (const group of buckets.values()) {
    if (group.length < 2) continue
    for (const a of group) {
      for (const b of group) {
        if (a !== b) adj.get(a).add(b)
      }
    }
  }
  return adj
}

// Returns { distances: Map<word,number>, parents: Map<word,word> } from `start`.
export function bfsFrom(adj, start) {
  const distances = new Map([[start, 0]])
  const parents = new Map()
  const queue = [start]
  let head = 0
  while (head < queue.length) {
    const cur = queue[head++]
    const d = distances.get(cur)
    const neighbors = adj.get(cur)
    if (!neighbors) continue
    for (const nb of neighbors) {
      if (!distances.has(nb)) {
        distances.set(nb, d + 1)
        parents.set(nb, cur)
        queue.push(nb)
      }
    }
  }
  return { distances, parents }
}

export function reconstructPath(parents, start, end) {
  if (start === end) return [start]
  const path = [end]
  let cur = end
  while (cur !== start) {
    const prev = parents.get(cur)
    if (prev === undefined) return null
    path.push(prev)
    cur = prev
  }
  return path.reverse()
}

export function shortestPath(adj, start, end) {
  const { parents, distances } = bfsFrom(adj, start)
  if (!distances.has(end)) return null
  return reconstructPath(parents, start, end)
}

// Picks a solvable start/end pair whose shortest path length falls in
// [minDistance, maxDistance] whenever possible. Falls back to widening the
// range if the graph is too sparse to satisfy it after several tries.
export function generatePuzzle(words, adj, { minDistance = 3, maxDistance = 7, attempts = 40 } = {}) {
  const pool = words.filter((w) => adj.get(w)?.size > 0)
  if (pool.length < 2) return null

  let bestFallback = null

  for (let attempt = 0; attempt < attempts; attempt++) {
    const start = pool[Math.floor(Math.random() * pool.length)]
    const { distances } = bfsFrom(adj, start)
    const candidates = []
    for (const [word, dist] of distances) {
      if (dist >= minDistance && dist <= maxDistance) candidates.push(word)
    }
    if (candidates.length > 0) {
      const end = candidates[Math.floor(Math.random() * candidates.length)]
      return { start, end, shortestLength: distances.get(end) }
    }
    // Track the best reachable word in case we never hit the target range.
    let farthest = null
    let farthestDist = 0
    for (const [word, dist] of distances) {
      if (dist > farthestDist) {
        farthestDist = dist
        farthest = word
      }
    }
    if (farthest && (!bestFallback || farthestDist > bestFallback.shortestLength)) {
      bestFallback = { start, end: farthest, shortestLength: farthestDist }
    }
  }

  return bestFallback
}

export function isOneLetterApart(a, b) {
  if (a.length !== b.length) return { valid: false, position: -1 }
  let diffs = 0
  let pos = -1
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diffs++
      pos = i
      if (diffs > 1) return { valid: false, position: -1 }
    }
  }
  return { valid: diffs === 1, position: diffs === 1 ? pos : -1 }
}

export function computeScore(shortestLength, playerMoves) {
  if (playerMoves <= 0) return 0
  const ratio = shortestLength / playerMoves
  return Math.max(0, Math.min(100, Math.round(ratio * 100)))
}
