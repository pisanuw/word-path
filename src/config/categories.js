export const CATEGORIES = [
  {
    id: 'en_words',
    kind: 'word',
    locale: 'en-US',
    labelEn: 'English Words',
    labelTr: 'İngilizce Kelimeler',
    badge: 'EN',
    accent: 'sky',
  },
  {
    id: 'tr_words',
    kind: 'word',
    locale: 'tr-TR',
    labelEn: 'Turkish Words',
    labelTr: 'Türkçe Kelimeler',
    badge: 'TR',
    accent: 'meadow',
  },
  {
    id: 'en_names',
    kind: 'name',
    locale: 'en-US',
    labelEn: 'English Names',
    labelTr: 'İngilizce İsimler',
    badge: 'EN',
    accent: 'rope',
  },
  {
    id: 'tr_names',
    kind: 'name',
    locale: 'tr-TR',
    labelEn: 'Turkish Names',
    labelTr: 'Türkçe İsimler',
    badge: 'TR',
    accent: 'persimmon',
  },
]

export const LENGTHS = [3, 4, 5, 6, 7]

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id)
}
