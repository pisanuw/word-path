import { useEffect, useState } from 'react'

const DEMOS = [
  ['CAT', 'COT', 'DOT', 'DOG'],
  ['KOL', 'KUL', 'KUM'],
]

export default function Hero({ strings }) {
  const [demoIndex, setDemoIndex] = useState(0)
  const [shown, setShown] = useState(1)

  useEffect(() => {
    const chain = DEMOS[demoIndex]
    if (shown >= chain.length) {
      const pause = setTimeout(() => {
        setShown(1)
        setDemoIndex((i) => (i + 1) % DEMOS.length)
      }, 1400)
      return () => clearTimeout(pause)
    }
    const step = setTimeout(() => setShown((s) => s + 1), 750)
    return () => clearTimeout(step)
  }, [shown, demoIndex])

  const chain = DEMOS[demoIndex]
  const visible = chain.slice(0, shown)

  return (
    <section className="hero">
      <h1>
        Word Ladder <span style={{ color: 'var(--rope)' }}>·</span> Kelime Merdiveni
      </h1>
      <p className="tagline">{strings.tagline}</p>
      <div className="hero-demo" aria-hidden="true">
        {visible.map((word, idx) => {
          const prev = idx > 0 ? visible[idx - 1] : null
          const changedPos = prev ? diffPosition(prev, word) : -1
          const isTop = idx === visible.length - 1
          return (
            <div className="rung" key={`${demoIndex}-${idx}`}>
              {isTop && idx === chain.length - 1 && <div className="hero-rung-label">Target</div>}
              <div className="word-row">
                {word.split('').map((ch, i) => (
                  <div key={i} className={`tile ${i === changedPos ? 'tile-changed' : ''}`}>
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function diffPosition(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return i
  }
  return -1
}
