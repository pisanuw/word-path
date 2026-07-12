import { toDisplay } from '../lib/wordGraph'

export default function WordTiles({ word, prevWord, locale, variant, hintPosition }) {
  const display = toDisplay(word, locale || 'en-US')
  let changedPos = -1
  if (prevWord && prevWord.length === word.length) {
    for (let i = 0; i < word.length; i++) {
      if (prevWord[i] !== word[i]) {
        changedPos = i
        break
      }
    }
  }

  return (
    <div className="word-row">
      {display.split('').map((ch, i) => (
        <div
          key={i}
          className={`tile ${i === changedPos ? 'tile-changed' : ''} ${i === hintPosition ? 'tile-hint' : ''} ${variant ? `tile-${variant}` : ''}`}
        >
          {ch}
        </div>
      ))}
    </div>
  )
}
