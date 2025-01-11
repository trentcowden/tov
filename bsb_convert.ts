import { writeFileSync } from 'fs'
import { TranslationBookChapter } from './aoBibleTypes'
import bsb from './data/bsb.json'
import { Chapters } from './data/types/chapters'

type Verse = { number: number; text: string }

async function main() {
  const tovChapters: Chapters = []

  ;(bsb as TranslationBookChapter[]).forEach((chapter) => {
    let chapterText: (Verse | string)[] = []
    let currentVerse: Verse = { number: 0, text: '' }

    chapter.chapter.content.forEach((chapterContent, chapterContentIndex) => {
      if (chapterContent.type === 'heading') return
      else if (chapterContent.type === 'hebrew_subtitle') return
      else if (chapterContent.type === 'line_break') {
        currentVerse.text += '\n\n'
      } else if (chapterContent.type === 'verse') {
        if (chapterContent.number !== currentVerse.number) {
          if (currentVerse.number !== 0) {
            const startsWithNewline = currentVerse.text.startsWith('\n\n')
            const endsWithNewline = currentVerse.text.endsWith('\n\n')
            if (startsWithNewline) chapterText.push('')
            currentVerse.text = currentVerse.text.trim()
            chapterText.push(currentVerse)
            if (endsWithNewline) chapterText.push('')
          }
          currentVerse = { number: chapterContent.number, text: '' }
        }
        // const currentVersePoem: number[] = []

        chapterContent.content.forEach((verseContent, verseContentIndex) => {
          if (typeof verseContent === 'string') {
            currentVerse.text += verseContent
          } else if ('noteId' in verseContent) {
            currentVerse.text += ''
          } else if ('wordsOfJesus' in verseContent) {
            currentVerse.text += verseContent.text
          } else if ('poem' in verseContent && verseContent.poem) {
            if (verseContentIndex === 0) chapterText.push('')

            // if (currentVersePoem.slice(-1)[0] !== verseContent.poem)
            //   currentVerse.text += '\n\n'
            // else currentVerse.text += ' '
            const previousVerseContent =
              chapterContent.content[verseContentIndex - 1]
            if (
              previousVerseContent &&
              typeof previousVerseContent !== 'string' &&
              !('noteId' in previousVerseContent) &&
              currentVerse.text[currentVerse.text.length - 1] !== '\n'
            )
              currentVerse.text += '\n\n'

            currentVerse.text += verseContent.text
            // currentVersePoem.push(verseContent.poem)
          } else if ('lineBreak' in verseContent) {
            currentVerse.text += '\n\n'
          } else if ('text' in verseContent) {
            currentVerse.text += verseContent.text
          } else {
            console.log('Unknown subsection type:', verseContent)
          }
        })
      } else {
        console.log('Unknown section type:', chapterContent)
      }
    })

    currentVerse.text = currentVerse.text.trim()
    chapterText.push(currentVerse)
    // If there are two empty string elements in a row, remove one of them
    for (let i = 0; i < chapterText.length - 1; i++) {
      if (chapterText[i] === '' && chapterText[i + 1] === '') {
        chapterText.splice(i, 1)
        i--
      }
    }
    if (chapterText[0] === '') chapterText.shift()

    tovChapters.push({
      chapterId: chapter.book.id + '.' + chapter.chapter.number,
      verses: chapterText,
    })
  })
  writeFileSync('data/bsb_chapters.json', JSON.stringify(tovChapters, null, 2))
}

main()
