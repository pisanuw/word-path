// Lazily-loaded dictionary chunks. Each category/length pair is its own
// JSON file so the browser only ever downloads the word lists it needs.
const modules = import.meta.glob('./*/*.json')

const cache = new Map()

export async function loadDictionary(categoryId, length) {
  const key = `${categoryId}/${length}`
  if (cache.has(key)) return cache.get(key)

  const path = `./${categoryId}/${length}.json`
  const loader = modules[path]
  if (!loader) {
    throw new Error(`No dictionary found for ${categoryId} at length ${length}`)
  }
  const mod = await loader()
  const words = mod.default
  cache.set(key, words)
  return words
}
