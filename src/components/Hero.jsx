import { useEffect, useState } from 'react'

const WORD_DEMOS = [
  ['CAT', 'COT', 'DOT', 'DOG'],
  ['KOL', 'KUL', 'KUM'],
]

const MATH_DEMOS = [
  { numbers: [4, 9, 3], target: 39, steps: [{ a: 4, op: '\u00d7', b: 9, result: 36 }, { a: 36, op: '+', b: 3, result: 39 }] },
]

export default function Hero({ strings }) {
  const [demoIndex, setDemoIndex] = useState(0)
  const [shown, setShown] = useState(1)
  const showingMath = demoIndex >= WORD_DEMOS.length

  useEffect(() => {
    const totalDemos = WORD_DEMOS.length + MATH_DEMOS.length
    const stepCount = showingMath ? MATH_DEMOS[demoIndex - WORD_DEMOS.length].steps.length + 1 : WORD_DEMOS[demoIndex].length

    if (shown >= stepCount) {
      const pause = setTimeout(() => {
        setShown(1)
        setDemoIndex((i) => (i + 1) % totalDemos)
      }, 1500)
      return () => clearTimeout(pause)
    }
    const step = setTimeout(() => setShown((s) => s + 1), 750)
    return () => clearTimeout(step)
  }, [shown, demoIndex, showingMath])

  return (
    <section className="hero">
      <h1>
        Word Ladder <span style={{ color: 'var(--rope)' }}>&amp;</span> Number Ladder
      </h1>
      <p className="tagline">{strings.tagline}</p>
      <div className="hero-demo" aria-hidden="true">
        {showingMath ? <MathDemo demo={MATH_DEMOS[demoIndex - WORD_DEMOS.length]} shown={shown} /> : <WordDemo chain={WORD_DEMOS[demoIndex]} shown={shown} demoIndex={demoIndex} />}
      </div>
    </section>
  )
}

function WordDemo({ chain, shown, demoIndex }) {
  const visible = chain.slice(0, shown)
  return (
    <>
      {visible.map((word, idx) => {
        const prev = idx > 0 ? visible[idx - 1] : null
        const changedPos = prev ? diffPosition(prev, word) : -1
        return (
          <div className="rung" key={`${demoIndex}-${idx}`}>
            {idx === chain.length - 1 && shown >= chain.length && <div className="hero-rung-label">Target</div>}
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
    </>
  )
}

function MathDemo({ demo, shown }) {
  // shown=1 -> just the starting numbers; shown=2.. -> reveal each step
  const stepsToShow = Math.max(0, shown - 1)
  return (
    <>
      <div className="rung">
        <div className="hero-rung-label">Target</div>
        <div className="tile" style={{ width: 'auto', padding: '0 14px' }}>
          {demo.target}
        </div>
      </div>
      {demo.steps.slice(0, stepsToShow).map((s, i) => (
        <div className="rung" key={i}>
          <div className="word-row">
            <div className="tile" style={{ width: 'auto', padding: '0 10px' }}>
              {s.a}
            </div>
            <div className="tile tile-changed" style={{ width: 'auto', padding: '0 10px' }}>
              {s.op}
            </div>
            <div className="tile" style={{ width: 'auto', padding: '0 10px' }}>
              {s.b}
            </div>
            <div className="tile" style={{ width: 'auto', padding: '0 10px' }}>
              = {s.result}
            </div>
          </div>
        </div>
      ))}
      {stepsToShow === 0 && (
        <div className="rung">
          <div className="word-row">
            {demo.numbers.map((n, i) => (
              <div className="tile" key={i}>
                {n}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function diffPosition(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return i
  }
  return -1
}
