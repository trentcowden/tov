import bibles from '../data/bibles'
import references from '../data/references.json'
import { References } from '../data/types/references'
const NET = bibles.net

function validateVerseNumbers(text: string): boolean {
  // Extract all numbers within square brackets
  const matches = text.match(/\[(\d+)\]/g)

  // If no matches found or only one number, return true
  if (!matches || matches.length <= 1) {
    return true
  }

  // Convert matches to numbers, removing brackets
  const numbers = matches.map((match) => parseInt(match.replace(/[\[\]]/g, '')))

  // Check if each number increments by 1
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] !== numbers[i - 1] + 1) {
      return false
    }
  }

  return true
}

NET.forEach((chapter) => {
  if (!validateVerseNumbers(chapter.md))
    console.log(chapter.chapterId, 'Verse numbers are not sequential')
  const nonVerseNumberSquareBrackets = chapter.md.match(/\[[^0-9]*\]/g)
  if (nonVerseNumberSquareBrackets)
    console.log(chapter.chapterId, nonVerseNumberSquareBrackets)
})

Object.entries(references as References).forEach(([verseId, references]) => {
  references.forEach((item) => {
    if (typeof item !== 'object') console.log(verseId, item, 'wrong type')
    if (item.length !== 1 && item.length !== 2)
      console.log(verseId, item, 'wrong length')

    const startVerseId = item[0]
    const endVerseId = item.length === 2 ? item[1] : item[0]

    const [startBookId, startChapterNumber, startVerseNumber] =
      startVerseId.split('.')
    const [endBookId, endChapterNumber, endVerseNumber] = endVerseId.split('.')

    if (startBookId !== endBookId) return
    if (startChapterNumber !== endChapterNumber) return

    const chapterIndex = NET.findIndex(
      (chapter) => chapter.chapterId === `${startBookId}.${startChapterNumber}`
    )

    if (chapterIndex === -1)
      console.log(verseId, startVerseId, 'chapter not found')

    const chapter = NET[chapterIndex]
    const verses = chapter.md.split('[')

    if (parseInt(startVerseNumber) > verses.length)
      console.log('Verse number out of range:', startVerseId)

    const startIndex = verses.findIndex((verse) =>
      verse.startsWith(startVerseNumber)
    )
    const endIndex = verses.findIndex((verse) =>
      verse.startsWith(endVerseNumber)
    )
    if (startIndex === -1)
      console.log('Start verse not found:', verseId, item, startVerseId)
    if (endIndex === -1)
      console.log('End verse not found:', verseId, item, endVerseId)
    if (startIndex > endIndex)
      console.log('start index > end index:', verseId, item)
    if (endIndex >= verses.length)
      console.log('end index out of range:', verseId, item)

    let referenceText = '[' + verses.slice(startIndex, endIndex + 1).join('[')

    referenceText = referenceText
      .replace(/\[.*?\]/g, '')
      .replace(/\*/g, '')
      .replace(/[\r\n]+/g, ' ')
      .trim()

    if (referenceText === '') console.log(verseId, item, 'empty reference text')
  })
})

// const chapterLength = chapterLengths.find((book) => book.abbr === bookId)
//   ?.chapters[parseInt(chapterNumber) - 1].verses

// const endIsFirstVerseOfNextChapter = endVerseComponents[2] === '1'

// const startIsLastVerseOfChapter =
//   chapterLength === startVerseComponents[2]

// if (!endIsFirstVerseOfNextChapter && !startIsLastVerseOfChapter) {
//   chapterMismatches++
//   console.log(
//     verseId,
//     startVerseId,
//     endVerseId,
//     'chapter mismatch and not 1'
//   )
// }
